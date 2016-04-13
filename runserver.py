from flask import Flask, jsonify, make_response, render_template

app = Flask(__name__)
app.config['DEBUG'] = True


# use this method to get questions
@app.route('/', methods=['GET'])
def index():
    return render_template("index.html")


@app.errorhandler(404)
def not_found(error):
    return make_response(jsonify({'error': 'Not found'}), 404)

if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=8081)
