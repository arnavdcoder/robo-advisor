# Robo-Advisor — Group 1

AI-powered (well — technical-analysis-powered) stock prediction robo-advisor.
No LLM API in the loop: `backend/advisor/predictor.py` pulls 30 days of price
history via `yfinance` and generates an UP/DOWN call + plain-English reasoning
using moving-average crossover, 5-day momentum, and RSI.

## Structure

```
robo_advisor/
  backend/
    app.py                  Flask entry point, all routes
    advisor/predictor.py    Core prediction engine (replaces the Claude API call)
    advisor/profiler.py     Risk questionnaire -> allocation
    tests/test_predictor.py Unit tests (mocked data, no network needed)
    requirements.txt
  frontend/
    src/pages/Home.jsx        Landing page
    src/pages/TickerInput.jsx Ticker entry form
    src/pages/Output.jsx      UP/DOWN result + reasoning + accuracy
    src/pages/Graphs.jsx      30-day price chart (Recharts)
    src/components/NavBar.jsx Ticker-tape nav
```

## Run it locally

**Backend** (needs Python 3.10+):
```bash
cd backend
python3 -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt
python3 app.py
```
Runs on `http://127.0.0.1:5000`. Test it: `curl "http://127.0.0.1:5000/api/predict?ticker=AAPL"`

**Frontend** (needs Node 18+):
```bash
cd frontend
npm install
npm run dev
```
Runs on `http://localhost:5173`. Open it — backend must already be running.

## API routes

| Route | Method | What it does |
|---|---|---|
| `/api/predict?ticker=AAPL` | GET | Full prediction: UP/DOWN, confidence, reasoning, indicators, 30-day history, accuracy snapshot |
| `/api/history?ticker=AAPL` | GET | Just the 30-day price history |
| `/api/accuracy` | GET | Running accuracy across all checked predictions |
| `/api/accuracy/history` | GET | Most recent 20 logged predictions, checked or pending |
| `/api/questions` | GET | Risk questionnaire questions |
| `/api/profile` | POST | Submit questionnaire answers, get back risk score + ETF allocation |
| `/api/health` | GET | Sanity check |

## Tests

```bash
cd backend
python3 -m pytest tests/ -v
```
Tests mock the yfinance call so they run offline and deterministically —
they check that an uptrend produces UP, a downtrend produces DOWN, and
invalid tickers raise cleanly.

## Pushing to GitHub

```bash
cd robo_advisor
git init
git add .
git commit -m "Initial commit: prediction engine + 4-page React app"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

## Notes for the team

- The prediction "model" is fully rule-based (no external AI calls, no API
  key to manage). It's easy to defend in a demo because you can point at
  the exact math behind every call.
- Accuracy is now persisted in SQLite (`backend/predictions.db`, auto-created
  on first run, gitignored). Every `/api/predict` call logs a row. A prediction
  gets "checked" once at least one calendar day has passed since it was
  logged — `check_and_update()` then pulls the latest close via yfinance and
  marks it correct/incorrect by comparing to the price at prediction time.
  Run the app across a couple of days to watch real accuracy numbers build up.
  `/api/accuracy` returns the running total any time; `/api/accuracy/history`
  returns the 20 most recent logged calls, checked or not.
- CORS is wide open (`CORS(app)`) for local dev. Lock it down to your
  deployed frontend origin before shipping.
