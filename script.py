from flask import Flask, jsonify
import yfinance as yf
from datetime import datetime

app = Flask(__name__)

# -----------------------------
# Utility: detect asset type
# -----------------------------
def detect_asset_type(ticker):
    ticker = ticker.upper()

    if "=X" in ticker:
        return "CURRENCY"
    elif "-USD" in ticker:
        return "CRYPTO"
    elif ticker in ["TLT", "IEF", "SHY"]:
        return "BOND"
    else:
        return "STOCK"


# ---------------------------------
# API 1: Current ticker data
# ---------------------------------
@app.route("/api/market/quote/<ticker>", methods=["GET"])
def get_quote(ticker):
    stock = yf.Ticker(ticker)

    # Get today's data
    hist = stock.history(period="1d")

    if hist.empty:
        return jsonify({"error": "Invalid ticker or data unavailable"}), 400

    latest = hist.iloc[-1]

    info = stock.info

    response = {
        "symbol": ticker.upper(),
        "name": info.get("shortName"),
        "type": detect_asset_type(ticker),

        "open": round(latest["Open"], 2),
        "high": round(latest["High"], 2),
        "low": round(latest["Low"], 2),
        "close": round(latest["Close"], 2),

        "price": round(latest["Close"], 2),
        "volume": int(latest["Volume"]),

        "currency": info.get("currency"),
        "exchange": info.get("exchange"),
        "timestamp": datetime.utcnow().isoformat(timespec="milliseconds")
    }

    return jsonify(response)


# ---------------------------------
# API 2: 1 month historical data
# ---------------------------------
@app.route("/api/market/history/<ticker>", methods=["GET"])
def get_history(ticker):
    stock = yf.Ticker(ticker)
    hist = stock.history(period="6mo", interval="1d")

    if hist.empty:
        return jsonify([])

    result = []

    for date, row in hist.iterrows():
        result.append({
            "symbol": ticker.upper(),
            "type": detect_asset_type(ticker),
            "date": date.strftime("%Y-%m-%d"),
            "open": round(row["Open"], 2),
            "high": round(row["High"], 2),
            "low": round(row["Low"], 2),
            "close": round(row["Close"], 2),
            "volume": int(row["Volume"])
        })

    return jsonify(result)


# ---------------------------------
# Run app
# ---------------------------------
if __name__ == "__main__":
    app.run(port=5000, debug=True)
