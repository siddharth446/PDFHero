from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
from PIL import Image
from io import BytesIO
import tempfile

app = Flask(__name__)
CORS(app)

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'success',
        'message': 'Image compression API is running'
    })

@app.route('/api/image/compress', methods=['POST'])
def compress_image():
    try:
        # Get the uploaded file
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
            
        # Get quality parameter
        quality = int(request.form.get('quality', 80))
        
        # Open image
        image = Image.open(file)
        
        # Create temporary file
        temp_file = tempfile.NamedTemporaryFile(suffix='.jpg', delete=False)
        
        # Save compressed image
        image.save(temp_file.name, 'JPEG', quality=quality, optimize=True)
        
        # Return the compressed image
        return send_file(
            temp_file.name,
            mimetype='image/jpeg',
            as_attachment=True,
            download_name=f'compressed-{os.path.basename(temp_file.name)}'
        )
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='localhost', port=5005, debug=True)