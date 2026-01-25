from flask import Blueprint, request, jsonify
from services.ai_mentor import AIMentor
import json

bp = Blueprint('code_analysis', __name__, url_prefix='/api')
mentor = AIMentor()

@bp.route('/analyze', methods=['POST', 'OPTIONS'])
def analyze_code():
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        data = request.get_json()
        code = data.get('code', '')
        language = data.get('language', 'javascript')
        
        if not code.strip():
            return jsonify({'error': 'No code provided'}), 400
        
        result = mentor.analyze_code(code, language)
        
        if isinstance(result, str):
            result = json.loads(result)
        
        return jsonify(result), 200
    
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({
            'feedback': [],
            'overall': 'Error occurred'
        }), 500

@bp.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'}), 200