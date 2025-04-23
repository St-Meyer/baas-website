import os
from flask import Flask, render_template, redirect, url_for, session, request, jsonify
from dotenv import load_dotenv
import requests
from requests.exceptions import HTTPError
from flask_cors import CORS

load_dotenv()
print("CLIENT_ID:", os.getenv('CLIENT_ID'))  # Debugging

app = Flask(__name__)
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
app.secret_key = os.urandom(24)

BAAS_API = os.getenv('BAAS_API', 'http://localhost:4848')


CLIENT_ID = os.getenv('CLIENT_ID')
CLIENT_SECRET = os.getenv('CLIENT_SECRET')
AUTHORIZATION_BASE_URL = 'https://github.com/login/oauth/authorize'
TOKEN_URL = 'https://github.com/login/oauth/access_token'
USER_API_URL = 'https://api.github.com/user'
CORS(app, origins=[
    "http://localhost:9090", 
    "http://localhost:4848",
    "http://127.0.0.1:9090",
    "http://127.0.0.1:4848",
    ], supports_credentials=True)

@app.route("/")
def index():
    return render_template('login.html')

@app.route('/login/')
@app.route('/login')
def login():
    github_auth_url = f'{AUTHORIZATION_BASE_URL}?client_id={CLIENT_ID}'
    return redirect(github_auth_url)

@app.route('/github/callback')
def callback():
    code = request.args.get('code')
    if code is None:
        return 'Fehler: Kein Code erhalten', 400

    token_data = {
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
        'code': code
    }
    headers = {'Accept': 'application/json'}
    try:
        token_response = requests.post(TOKEN_URL, data=token_data, headers=headers)
        token_response.raise_for_status()
        token_json = token_response.json()
        access_token = token_json.get('access_token')
        if access_token is None:
            return 'Fehler: Kein Zugriffstoken erhalten', 400
    except HTTPError as http_err:
        return f'HTTP-Fehler: {http_err}', 400
    except Exception as err:
        return f'Ein Fehler ist aufgetreten: {err}', 400

    session['access_token'] = access_token
    return redirect(url_for('dashboard'))

@app.route('/dashboard')
def dashboard():
    access_token = session.get('access_token')
    if access_token is None:
        return redirect(url_for('login'))

    headers = {'Authorization': f'token {access_token}'}
    try:
        user_response = requests.get(USER_API_URL, headers=headers)
        user_response.raise_for_status()
        user_data = user_response.json()
    except HTTPError as http_err:
        return f'HTTP-Fehler: {http_err}', 400
    except Exception as err:
        return f'Ein Fehler ist aufgetreten: {err}', 400

    return redirect(url_for('home'))
    
    
@app.route("/app")
def home():
    if "access_token" not in session:
        return redirect(url_for("login"))
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=False, port=9090)

