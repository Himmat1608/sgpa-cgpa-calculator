import os
from flask import Flask, render_template, request, jsonify, session
from utils.calculator import calculate_sgpa, calculate_cgpa

app = Flask(__name__)
# In production, set the SECRET_KEY environment variable.
app.secret_key = os.environ.get('SECRET_KEY', 'gradesphere-dev-secret-key-xyz')

@app.route('/')
def index():
    """Render the main landing page."""
    return render_template('index.html')

@app.route('/sgpa')
def sgpa():
    """Render the SGPA Calculator page."""
    return render_template('sgpa.html')

@app.route('/cgpa')
def cgpa():
    """Render the CGPA Calculator page."""
    return render_template('cgpa.html')

@app.route('/api/calculate_sgpa', methods=['POST'])
def api_calculate_sgpa():
    """
    API endpoint to calculate SGPA
    Expects JSON: { "subjects": [{"credits": 3, "grade_point": 10}, ...] }
    """
    data = request.get_json()
    if not data or 'subjects' not in data:
        return jsonify({'error': 'Invalid request. "subjects" array is required.'}), 400
        
    subjects = data.get('subjects', [])
    if not isinstance(subjects, list) or len(subjects) == 0:
        return jsonify({'error': 'Please provide at least one valid subject.'}), 400
        
    sgpa_value = calculate_sgpa(subjects)
    
    # Calculate total credits for display/feedback purposes
    total_credits = sum(float(s.get('credits', 0)) for s in subjects if str(s.get('credits', '')).replace('.','',1).isdigit())
    
    return jsonify({
        'sgpa': sgpa_value,
        'total_credits': total_credits
    })

@app.route('/api/calculate_cgpa', methods=['POST'])
def api_calculate_cgpa():
    """
    API endpoint to calculate CGPA
    Expects JSON: { "semesters": [{"sgpa": 8.5, "credits": 20}, ...] }
    """
    data = request.get_json()
    if not data or 'semesters' not in data:
        return jsonify({'error': 'Invalid request. "semesters" array is required.'}), 400
        
    semesters = data.get('semesters', [])
    if not isinstance(semesters, list) or len(semesters) == 0:
        return jsonify({'error': 'Please provide at least one valid semester.'}), 400
        
    cgpa_value = calculate_cgpa(semesters)
    
    # Calculate total credits
    total_credits = sum(float(s.get('credits', 0)) for s in semesters if str(s.get('credits', '')).replace('.','',1).isdigit())
    
    return jsonify({
        'cgpa': cgpa_value,
        'total_credits': total_credits
    })
if __name__ == '__main__':
    # Try to dynamically use environment port if defined, else fallback to 5000
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
