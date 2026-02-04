from flask import Flask, jsonify, request
import yfinance as yf
from datetime import datetime
import pandas as pd
import numpy as np


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


def fetch_price_series(ticker, period="6mo"):
    data = yf.Ticker(ticker).history(period=period, interval="1d")

    if data.empty:
        return None

    return data["Close"]


def build_price_matrix(assets):
    price_df = pd.DataFrame()

    for asset in assets:
        ticker = asset["ticker"]
        print(f"Fetching price for {ticker}")  # Debugging print
        series = fetch_price_series(ticker)

        if series is None or series.empty:
            print(f"No data for {ticker}, skipping")  # Debugging print
            continue

        price_df[ticker] = series

    print(f"Price DataFrame before filling missing data:\n{price_df.head()}")  # Debugging print
    price_df.sort_index(inplace=True)

    # Forward-fill missing values
    price_df.ffill(inplace=True)
    print(f"Price DataFrame after forward-filling:\n{price_df.head()}")  # Debugging print

    # Drop any remaining NaNs (early rows)
    price_df.dropna(inplace=True)
    print(f"Price DataFrame after dropping NaNs:\n{price_df.head()}")  # Debugging print

    # Calculate correlation matrix
    correlation_matrix = price_df.corr()
    print(f"Correlation Matrix:\n{correlation_matrix}")  # Debugging print

    return price_df, correlation_matrix


def calculate_volatility(price_df):
    # Calculate daily returns for each asset
    returns = price_df.pct_change()

    # Calculate volatility as the standard deviation of daily returns
    volatility = returns.std()

    # Print the calculated volatility for debugging
    print(f"Volatility for assets:\n{volatility}")

    return volatility


def calculate_concentration(weights):
    # Calculate the Herfindahl Index
    concentration = np.sum(np.square(weights))

    # Print the concentration score for debugging
    print(f"Concentration Score (Herfindahl Index): {concentration}")

    return concentration


def simulate_stress_response(price_df, correlation_matrix):
    # Placeholder for the stress test
    # Here, you would identify the top 5 worst market periods and calculate
    # the correlation spikes and drawdowns
    # Let's assume it returns mock values for now

    correlation_spike = 0.8  # Placeholder value
    drawdown_amplification = 0.7  # Placeholder value

    return correlation_spike, drawdown_amplification


def calculate_immune_strength(correlation_spike, drawdown_amplification, concentration):
    immune_strength = 1 - (correlation_spike * 0.5 + drawdown_amplification * 0.3 + concentration * 0.2)

    # Print the immune strength for debugging
    print(f"Immune Strength: {immune_strength}")

    return immune_strength


def get_diagnosis_and_weak_points(immune_strength, correlation_spike, concentration):
    if immune_strength <= 0.2:
        return {
            "systemic_risk": "Very Low",
            "diagnosis": "Portfolio insulated from market-wide shocks",
            "weak_points": ["Low market correlation", "Highly diversified"]
        }
    elif immune_strength <= 0.4:
        return {
            "systemic_risk": "Low Moderate",
            "diagnosis": "Mild reaction to broad stress",
            "weak_points": ["Some sector overlap", "Limited diversification"]
        }
    elif immune_strength <= 0.6:
        return {
            "systemic_risk": "Moderate",
            "diagnosis": "Shocks propagate quickly",
            "weak_points": ["High index correlation", "Sector clustering"]
        }
    elif immune_strength <= 0.8:
        return {
            "systemic_risk": "High",
            "diagnosis": "Sharp losses during stress",
            "weak_points": ["Market direction dependent", "Minimal defense"]
        }
    else:
        return {
            "systemic_risk": "Very High",
            "diagnosis": "One shock → portfolio-wide failure",
            "weak_points": ["Monoculture   leverage", "Assets move together"]
        }



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
    # hist = stock.history(period="1mo", interval="1d")
    hist = stock.history(period="6mo",interval="1d")

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
# API 3: Portfolio Immune System (placeholder)
# ---------------------------------
@app.route("/api/immune/analyze", methods=["POST"])
def analyze_portfolio_immune_system():
    data = request.json
    assets = data.get("assets", [])

    # Fetch the price matrix and correlation matrix
    price_df, correlation_matrix = build_price_matrix(assets)

    # Calculate volatility
    volatility = calculate_volatility(price_df)

    # Calculate concentration score (Herfindahl Index)
    weights = [asset.get("weight", 1.0) for asset in assets]
    concentration = calculate_concentration(weights)

    # Simulate stress response and get correlation spikes and drawdown amplification
    correlation_spike, drawdown_amplification = simulate_stress_response(price_df, correlation_matrix)

    # Calculate the immune strength score
    immune_strength = calculate_immune_strength(correlation_spike, drawdown_amplification, concentration)

    # Get the diagnosis and weak points based on the immune strength
    portfolio_info = get_diagnosis_and_weak_points(immune_strength, correlation_spike, concentration)

    # Return the response with the dynamic diagnosis and weak points
    return jsonify({
        "immune_strength": immune_strength,
        "systemic_risk": portfolio_info["systemic_risk"],  # Only risk label
        "diagnosis": portfolio_info["diagnosis"],  # Detailed description
        "weak_points": portfolio_info["weak_points"]
    })



# ---------------------------------
# Run app
# ---------------------------------
if __name__ == "__main__":
    app.run(port=5000, debug=True)
