from flask import Flask, jsonify, make_response, render_template

app = Flask(__name__)
app.config['DEBUG'] = True


@app.route('/', methods=['GET'])
def index():
    return render_template("index.html")


@app.errorhandler(404)
def not_found(error):
    return render_template("hate.html")

if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=8081)
