"""
app.py
Flask entry point. Routes:
  GET  /api/predict?ticker=AAPL     -> prediction + reasoning + 30d history
  GET  /api/history?ticker=AAPL     -> just the 30d price history
  POST /api/profile                 -> risk questionnaire -> allocation
  GET  /api/health                  -> sanity check
"""

from flask import Flask, request, jsonify
from flask_cors import CORS

from advisor.predictor import predict, InvalidTickerError
from advisor.profiler import score_profile, RISK_QUESTIONS
from advisor import tracker

app = Flask(__name__)
CORS(app)  # allow the React dev server (localhost:5173) to call this API

tracker.init_db()


@app.get("/api/health")
def health():
    return jsonify({"status": "ok"})


@app.get("/api/questions")
def questions():
    return jsonify(RISK_QUESTIONS)


@app.post("/api/profile")
def profile():
    answers = request.get_json(force=True) or {}
    return jsonify(score_profile(answers))


@app.get("/api/predict")
def get_prediction():
    ticker = request.args.get("ticker", "").strip()
    if not ticker:
        return jsonify({"error": "ticker query param is required"}), 400

    try:
        result = predict(ticker)
    except InvalidTickerError as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        return jsonify({"error": f"prediction failed: {e}"}), 500

    price_now = result["history"][-1]["close"] if result["history"] else None
    tracker.log_prediction(result["ticker"], result["prediction"], result["confidence"], price_now)

    tracker.check_and_update()  # opportunistically settle any predictions old enough to check
    result["accuracy"] = tracker.get_accuracy()
    return jsonify(result)


@app.get("/api/accuracy")
def get_accuracy():
    tracker.check_and_update()
    return jsonify(tracker.get_accuracy())


@app.get("/api/accuracy/history")
def get_accuracy_history():
    return jsonify(tracker.get_recent())


@app.get("/api/history")
def get_history():
    ticker = request.args.get("ticker", "").strip()
    if not ticker:
        return jsonify({"error": "ticker query param is required"}), 400
    try:
        result = predict(ticker)
    except InvalidTickerError as e:
        return jsonify({"error": str(e)}), 404
    return jsonify({"ticker": result["ticker"], "history": result["history"]})


if __name__ == "__main__":
    app.run(debug=True, port=5000)
