import subprocess
import tempfile
import os
from typing import Optional
from pydantic import BaseModel

class ErrorDetail(BaseModel):
    line: Optional[int] = None
    error_type: str
    error_message: str

class ExecutionResult(BaseModel):
    success: bool
    output: Optional[str] = None
    errors: list[ErrorDetail] = []

def run_code(code: str, timeout: int = 3) -> ExecutionResult:
    """
    Executes Python code in a separate process.
    Captures stdout and stderr.
    """
    with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as temp_file:
        temp_file.write(code)
        temp_file_path = temp_file.name
        
    try:
        # Run Flake8 static analysis to catch multiple errors
        flake_result = subprocess.run(
            ['flake8', f'--format=%(row)d|%(code)s|%(text)s', '--select=E9,F82,F83,F40', temp_file_path],
            capture_output=True, text=True
        )
        errors = []
        if flake_result.returncode != 0:
            for line in flake_result.stdout.strip().split('\\n'):
                if not line.strip(): continue
                parts = line.split('|', 2)
                if len(parts) == 3:
                    # Map common flake8 codes to Python exceptions for rule matching
                    err_type = "SyntaxError" if 'E9' in parts[1] else "NameError" if 'F82' in parts[1] else parts[1]
                    errors.append(ErrorDetail(line=int(parts[0]), error_type=err_type, error_message=parts[2]))
        
        # If static errors exist, return them so user can fix syntax/names first
        if errors:
            return ExecutionResult(success=False, errors=errors)

        # Run the actual code
        result = subprocess.run(
            ['python3', temp_file_path],
            capture_output=True,
            text=True,
            timeout=timeout
        )
        
        if result.returncode == 0:
            return ExecutionResult(
                success=True,
                output=result.stdout
            )
        else:
            # Parse runtime error with line number
            stderr = result.stderr
            error_type = "UnknownError"
            error_message = stderr
            line_number = None
            
            lines = stderr.strip().split('\\n')
            
            # Find line number from traceback
            import re
            for l in lines:
                match = re.search(r'line (\\d+)', l)
                if match:
                    line_number = int(match.group(1))

            if lines:
                last_line = lines[-1]
                if ':' in last_line:
                    parts = last_line.split(':', 1)
                    error_type = parts[0].strip()
                    error_message = parts[1].strip()
            
            return ExecutionResult(
                success=False,
                errors=[ErrorDetail(line=line_number, error_type=error_type, error_message=error_message)],
                output=result.stdout
            )
            
    except subprocess.TimeoutExpired:
        return ExecutionResult(
            success=False,
            errors=[ErrorDetail(error_type="TimeoutError", error_message=f"Code execution exceeded the {timeout} second limit.")]
        )
    except Exception as e:
        return ExecutionResult(
            success=False,
            errors=[ErrorDetail(error_type="ExecutionError", error_message=str(e))]
        )
    finally:
        # Clean up temp file
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
