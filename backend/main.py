from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

import models
import database
import execution
import analyzer
import llm_service
from database import engine, get_db

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Misconception Detector Prototype")

# CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For prototype, allow all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to AI Misconception Detector Prototype API"}

@app.get("/history", response_model=list[models.SubmissionResponse])
def get_user_history(db: Session = Depends(get_db)):
    """Fetch the last 20 code submissions for the user history dashboard."""
    submissions = db.query(models.Submission).order_by(models.Submission.id.desc()).limit(20).all()
    return submissions

@app.get("/practice/suggested")
def get_suggested_practice(db: Session = Depends(get_db)):
    """Fetch a personalized practice task based on the user's last error."""
    last_error = db.query(models.Submission).filter(models.Submission.status == "error").order_by(models.Submission.id.desc()).first()
    if not last_error:
        return {"practice": "You have no recorded errors yet! Great job. Try writing a program that calculates the Fibonacci sequence."}
    
    practice = llm_service.generate_practice(last_error.code, last_error.error_message or "Unknown Error")
    return {"practice": practice}

@app.post("/analyze", response_model=models.AnalysisResponse)
def analyze_code(request: models.CodeSubmission, db: Session = Depends(get_db)):
    """
    Endpoint to analyze Python code for errors and misconceptions.
    """
    code = request.code
    
    # 1. Execute the code safely
    execution_result = execution.run_code(code)
    
    # 2. Store the submission (just grabbing the first error for history database compatibility)
    first_err = execution_result.errors[0].error_message if execution_result.errors else None
    db_submission = models.Submission(
        code=code,
        status="success" if execution_result.success else "error",
        error_message=first_err
    )
    db.add(db_submission)
    db.commit()
    db.refresh(db_submission)
    
    if execution_result.success:
        return models.AnalysisResponse(
            status="success",
            output=execution_result.output,
            message="Code executed successfully with no errors."
        )
    
    insights = []
    
    for err in execution_result.errors:
        # Phase 3: Rule-Based matching
        matched_misconception = analyzer.match_error(err.error_type, err.error_message)
        
        if matched_misconception:
            insights.append(models.ErrorInsight(
                line=err.line,
                error_type=err.error_type,
                error_message=err.error_message,
                misconception=matched_misconception.get("misconception"),
                explanation=matched_misconception.get("explanation"),
                fix=matched_misconception.get("fix"),
                practice=matched_misconception.get("practice")
            ))
            continue

        # Phase 4: LLM AI Fallback
        llm_analysis = llm_service.analyze_error(
            code=code,
            error_type=err.error_type,
            error_message=err.error_message
        )
        
        if llm_analysis:
            insights.append(models.ErrorInsight(
                line=err.line,
                error_type=err.error_type,
                error_message=err.error_message,
                misconception=llm_analysis.get("misconception"),
                explanation=llm_analysis.get("explanation"),
                fix=llm_analysis.get("fix"),
                practice=llm_analysis.get("practice")
            ))
        else:
             insights.append(models.ErrorInsight(
                line=err.line,
                error_type=err.error_type,
                error_message=err.error_message,
                explanation="An unknown error occurred during execution and AI service was unreachable."
            ))

    return models.AnalysisResponse(
        status="error",
        output=execution_result.output,
        message=f"Found {len(insights)} potential error(s).",
        errors=insights
    )

