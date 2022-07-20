from flask import Flask, render_template

app = Flask(__name__)
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

@app.route("/")
def index():
    return render_template('login.html')

@app.route("/app")
def home():
    return render_template('index.html')

app.run(debug=True, port=9090)
