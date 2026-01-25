from flask import Flask, send_from_directory
from flask_cors import CORS
import os
import webbrowser
import threading

app = Flask(__name__, static_folder='../frontend')

# Enable CORS for all routes
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Register blueprints
from routes import code_analysis
app.register_blueprint(code_analysis.bp)

# Serve frontend
@app.route('/')
def serve_frontend():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    if os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    port = 8000
    url = f"http://127.0.0.1:{port}"
    
    print("🚀 Starting Live Code Mentor...")
    print(f"📍 Server running at {url}")
    print("🎓 Browser will open automatically!")
    
    # Open browser after a short delay
    def open_browser():
        import time
        time.sleep(1.5)  # Wait for server to start
        webbrowser.open(url)
    
    threading.Thread(target=open_browser).start()
    
    app.run(
        host='0.0.0.0',
        port=port,
        debug=True,
        use_reloader=False  # Prevents opening browser twice in debug mode
    )