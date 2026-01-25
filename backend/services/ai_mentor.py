import anthropic
import os
import json
from typing import Dict, List, Any

class AIMentor:
    def __init__(self):
        # Mock mode - no API key needed
        self.mock_mode = True
        api_key = os.getenv('ANTHROPIC_API_KEY', '')
        
        if api_key and api_key.startswith('sk-ant-'):
            self.client = anthropic.Anthropic(api_key=api_key)
            self.mock_mode = False
        else:
            self.client = None
            print("Running in MOCK mode - no API key required")

    def analyze_code(self, code: str, language: str) -> str:
        """Analyze code and provide feedback - returns JSON string"""
        
        if self.mock_mode:
            feedback_dict = self._generate_mock_feedback(code, language)
            return json.dumps(feedback_dict)  # FIXED: Convert to JSON string
        
        try:
            prompt = self._create_analysis_prompt(code, language)
            
            message = self.client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=1024,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
            
            return message.content[0].text
            
        except Exception as e:
            print(f"Error calling Claude API: {e}")
            feedback_dict = self._generate_mock_feedback(code, language)
            return json.dumps(feedback_dict)

    def _generate_mock_feedback(self, code: str, language: str) -> Dict[str, Any]:
        """Generate realistic mock feedback without calling API"""
        feedback = []
        
        # Check for common issues based on language
        if language == 'javascript':
            # Check for var usage
            if 'var ' in code:
                feedback.append({
                    'line': self._find_line_number(code, 'var '),
                    'severity': 'warning',
                    'message': 'Using var instead of let or const',
                    'explanation': 'The var keyword has function scope and can lead to unexpected behavior. Modern JavaScript uses let for variables that change and const for constants.',
                    'suggestion': 'Replace var with let or const depending on whether the variable will be reassigned.'
                })
            
            # Check for == instead of ===
            if ' == ' in code and ' === ' not in code:
                feedback.append({
                    'line': self._find_line_number(code, ' == '),
                    'severity': 'warning',
                    'message': 'Using loose equality (==) instead of strict equality (===)',
                    'explanation': 'The == operator performs type coercion, which can lead to unexpected results. The === operator is generally preferred as it compares both value and type.',
                    'suggestion': 'Use === for comparisons to avoid type coercion issues.'
                })
            
            # Check for console.log
            if 'console.log' in code:
                feedback.append({
                    'line': self._find_line_number(code, 'console.log'),
                    'severity': 'info',
                    'message': 'Console logging detected',
                    'explanation': 'Console.log statements are useful for debugging but should be removed or replaced with proper logging in production code.',
                    'suggestion': 'Consider using a proper logging library for production code.'
                })
        
        elif language == 'python':
            # Check for print statements
            if 'print(' in code:
                feedback.append({
                    'line': self._find_line_number(code, 'print('),
                    'severity': 'info',
                    'message': 'Print statement detected',
                    'explanation': 'Print statements are good for debugging, but consider using the logging module for production code.',
                    'suggestion': 'Use the logging module for better control over output in production.'
                })
            
            # Check for variable naming
            import re
            camelCase = re.findall(r'\b[a-z]+[A-Z][a-zA-Z]*\b', code)
            if camelCase:
                feedback.append({
                    'line': 1,
                    'severity': 'info',
                    'message': 'Variable naming convention',
                    'explanation': 'Python typically uses snake_case for variable names rather than camelCase.',
                    'suggestion': 'Consider using snake_case naming (e.g., my_variable instead of myVariable).'
                })
        
        # Generate overall feedback
        if len(feedback) == 0:
            overall = "Great job! Your code looks clean. Keep following best practices and consider adding comments for complex logic."
        elif len(feedback) <= 2:
            overall = "Good work! I found a few minor suggestions that could improve your code quality. These are common patterns to watch for."
        else:
            overall = "Your code is functional, but there are several areas where you can improve code quality and follow best practices. Review the suggestions below."
        
        return {
            'feedback': feedback,
            'overall': overall
        }

    def _find_line_number(self, code: str, search_str: str) -> int:
        """Find the line number where a string appears"""
        lines = code.split('\n')
        for i, line in enumerate(lines):
            if search_str in line:
                return i + 1
        return 1

    def _create_analysis_prompt(self, code: str, language: str) -> str:
        """Create prompt for code analysis"""
        return f"""You are an expert code mentor. Analyze this {language} code and provide constructive feedback.

Code to analyze:
```{language}
{code}
```

Provide feedback in JSON format with this structure:
{{
    "feedback": [
        {{
            "line": <line_number>,
            "severity": "error|warning|info",
            "message": "Brief description",
            "explanation": "Detailed explanation",
            "suggestion": "How to fix or improve"
        }}
    ],
    "overall": "Overall assessment and encouragement"
}}

Focus on:
1. Common mistakes and bugs
2. Best practices
3. Code quality and readability
4. Performance considerations
5. Security issues

Be encouraging and educational. Return ONLY the JSON, no other text."""

    def _parse_response(self, response: str) -> Dict[str, Any]:
        """Parse the AI response"""
        try:
            # Try to extract JSON from response
            start = response.find('{')
            end = response.rfind('}') + 1
            if start != -1 and end != 0:
                json_str = response[start:end]
                return json.loads(json_str)
        except:
            pass
        
        # Fallback to mock response if parsing fails
        return {
            'feedback': [],
            'overall': 'Analysis completed but response parsing failed.'
        }
    
    def explain_concept(self, concept: str, context: str = '') -> str:
        """Explain a programming concept"""
        if self.mock_mode:
            return f"Explanation for '{concept}': This is a mock explanation. Add your Anthropic API key to get real AI-powered explanations."
        
        try:
            prompt = f"Explain the programming concept: {concept}"
            if context:
                prompt += f"\n\nContext: {context}"
            
            message = self.client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=512,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
            
            return message.content[0].text
        except Exception as e:
            print(f"Error calling Claude API: {e}")
            return f"Error generating explanation: {str(e)}"