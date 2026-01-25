import re

class CodeAnalyzer:
    """Static code analysis utilities"""
    
    @staticmethod
    def detect_common_issues(code, language="javascript"):
        """Detect common coding issues without AI"""
        issues = []
        
        if language == "javascript":
            # Check for var usage
            var_matches = list(re.finditer(r'\bvar\b', code))
            for match in var_matches:
                line = code[:match.start()].count('\n') + 1
                issues.append({
                    "line": line,
                    "severity": "warning",
                    "message": "Using 'var' instead of 'let' or 'const'",
                    "explanation": "'var' has function scope and can lead to unexpected behavior. Use 'let' for variables that change, 'const' for constants.",
                    "suggestion": "Replace 'var' with 'let' or 'const'"
                })
            
            # Check for == instead of ===
            loose_eq = list(re.finditer(r'(?<![=!])={2}(?!=)', code))
            for match in loose_eq:
                line = code[:match.start()].count('\n') + 1
                issues.append({
                    "line": line,
                    "severity": "info",
                    "message": "Using loose equality (==) instead of strict (===)",
                    "explanation": "Loose equality can cause unexpected type coercion. Strict equality (===) compares both value and type.",
                    "suggestion": "Use === for safer comparisons"
                })
            
            # Check for console.log (common in learning)
            console_logs = list(re.finditer(r'console\.log', code))
            log_count = len(console_logs)
            if log_count > 5:
                issues.append({
                    "line": None,
                    "severity": "info",
                    "message": f"Found {log_count} console.log statements",
                    "explanation": "While debugging with console.log is fine during development, consider using a debugger for complex issues.",
                    "suggestion": "Learn to use browser DevTools debugger"
                })
        
        elif language == "python":
            # Check for mutable default arguments
            if re.search(r'def\s+\w+\([^)]*=\s*\[', code):
                issues.append({
                    "line": None,
                    "severity": "warning",
                    "message": "Mutable default argument detected",
                    "explanation": "Using mutable objects (like lists) as default arguments can lead to unexpected behavior.",
                    "suggestion": "Use None as default and create the list inside the function"
                })
        
        return issues  # FIXED: was "return issuess" (typo)