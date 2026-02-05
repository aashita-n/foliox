const API_BASE_URL = ''; // Using Vite proxy, requests are forwarded to backend

// Fetch portfolio assets
export const getPortfolioAssets = async () => {
  const response = await fetch(`/portfolio/assets`);
  if (!response.ok) {
    throw new Error('Failed to fetch portfolio assets');
  }
  return response.json();
};

// Buy an asset
export const buyAsset = async (symbol, quantity) => {
  const response = await fetch(`/portfolio/${symbol}/buy/${quantity}`, {
    method: 'PUT',
  });
  if (!response.ok) {
    throw new Error('Failed to buy asset');
  }
  return response.text();
};

// Sell an asset
export const sellAsset = async (symbol, quantity) => {
  const response = await fetch(`/portfolio/${symbol}/sell/${quantity}`, {
    method: 'PUT',
  });
  if (!response.ok) {
    throw new Error('Failed to sell asset');
  }
  return response.text();
};

// Sell all quantity of an asset
export const sellAllAsset = async (symbol) => {
  const response = await fetch(`/portfolio/${symbol}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to sell all assets');
  }
  return response.text();
};

// Get current balance
export const getBalance = async () => {
  const response = await fetch(`/balance`);
  if (!response.ok) {
    throw new Error('Failed to fetch balance');
  }
  return response.json();
};

// Add to balance
export const addBalance = async (amount) => {
  const response = await fetch(`/balance/add/${amount}`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('Failed to add balance');
  }
  return response.json();
};

// Get all assets from catalogue
export const getAssetCatalogue = async () => {
  const response = await fetch(`/api/catalogue`);
  if (!response.ok) {
    throw new Error('Failed to fetch asset catalogue');
  }
  return response.json();
};

// Get market quote for a ticker
export const getMarketQuote = async (ticker) => {
  const response = await fetch(`/market/quote/${ticker}`);
  if (!response.ok) {
    throw new Error('Failed to fetch market quote');
  }
  return response.json();
};

// Get market history for a ticker (for Flask backend)
export const getMarketHistory = async (ticker) => {
  const response = await fetch(`/api/market/history/${ticker}`);
  if (!response.ok) {
    throw new Error('Failed to fetch market history');
  }
  return response.json();
};

// Get market history for a ticker (for Java backend)
export const getMarketHistoryJava = async (ticker) => {
  const response = await fetch(`/market/history/${ticker}`);
  if (!response.ok) {
    throw new Error('Failed to fetch market history');
  }
  return response.json();
};

// Add new asset to catalogue (required before buying new tickers)
export const addAssetToCatalogue = async (symbol) => {
  const response = await fetch(`/api/catalogue/${symbol}`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('Failed to add asset to catalogue');
  }
  return response.json();
};

export const refreshPortfolio = async () => {
  const response = await fetch(`/portfolio/refresh`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Failed to refresh portfolio');
  }

  return response.json();
};

export const getImmunityAnalysis = async () => {
  const res = await fetch("/api/immune/analyze");
  if (!res.ok) throw new Error("Failed to fetch immunity");
  return res.json();
};

