import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AssetCatalogueCard from "./AssetCatalogueCard ";
import {
  Card,
  CardBody,
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

import {
  getPortfolioAssets,
  getBalance,
  buyAsset,
  sellAsset,
  sellAllAsset,
  getMarketHistory,
  addAssetToCatalogue,
  refreshPortfolio
} from "../services/api";
import TradePopup from "./TradePopup";

// Professional chart colors
const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ec4899", "#14b8a6", "#8b5cf6"];

/* ---UI Helpers--- */
function CardTitle({ children, align = "center" }) {
  return (
      <p
          className={`text-sm font-semibold tracking-wider uppercase text-slate-500 ${
              align === "left" ? "text-left" : "text-center"
          }`}
      >
        {children}
      </p>
  );
}

function LoadingSpinner() {
  return (
      <div className="flex justify-center items-center h-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
  );
}

/* ---MAIN COMPONENT--- */
export default function Dashboard() {
  const [portfolioAssets, setPortfolioAssets] = useState([]);
  const [balance, setBalance] = useState({ amount: 0 });
  const [portfolioGrowthData, setPortfolioGrowthData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showPopup, setShowPopup] = useState(false);
  const [popupData, setPopupData] = useState({ tradeType: "buy", symbol: "", maxQuantity: null });

  // Fetch data from backend
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [assetsData, balanceData] = await Promise.all([
        getPortfolioAssets(),
        getBalance(),
      ]);

      setPortfolioAssets(assetsData);
      setBalance(balanceData);

      // Fetch market history for each asset to calculate portfolio growth
      if (assetsData.length > 0) {
        await fetchPortfolioGrowth(assetsData);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load data from server");
    } finally {
      setLoading(false);
    }
  };

  // Calculate portfolio growth from live market data
  const fetchPortfolioGrowth = async (assets) => {
    try {
      console.log("Fetching portfolio growth for assets:", assets);
      
      const historyPromises = assets.map(async (asset) => {
        try {
          console.log(`Fetching history for ${asset.symbol}...`);
          const history = await getMarketHistory(asset.symbol);
          console.log(`History for ${asset.symbol}:`, history);
          return { symbol: asset.symbol, quantity: asset.quantity, history };
        } catch (err) {
          console.warn(`Failed to fetch history for ${asset.symbol}:`, err);
          return { symbol: asset.symbol, quantity: asset.quantity, history: [] };
        }
      });

      const historyResults = await Promise.all(historyPromises);
      console.log("History results:", historyResults);

      // Build a map of date -> portfolio value
      const dateValueMap = {};

      historyResults.forEach(({ symbol, quantity, history }) => {
        console.log(`Processing ${symbol} with ${history.length} history records`);
        history.forEach((record) => {
          const date = record.date;
          if (!dateValueMap[date]) {
            dateValueMap[date] = 0;
          }
          dateValueMap[date] += record.close * quantity;
        });
      });

      console.log("Date value map:", dateValueMap);

      // Convert to array and sort by date (oldest to newest)
      const growthData = Object.entries(dateValueMap)
        .map(([date, value]) => ({
          date: formatDate(date),
          value: Math.round(value),
        }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      console.log("Final growth data:", growthData);
      setPortfolioGrowthData(growthData);
    } catch (err) {
      console.error("Error calculating portfolio growth:", err);
      // Fallback to mock data if calculation fails
      setPortfolioGrowthData([]);
    }
  };

  // Format date string to display month name
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Portfolio value
  const portfolioValue = portfolioAssets.reduce((total, asset) => total + asset.currentPrice * asset.quantity, 0);

  // Allocation by symbol
  const logTotals = portfolioAssets.map((asset) => Math.log(asset.currentPrice * asset.quantity + 1));
  const logSum = logTotals.reduce((sum, val) => sum + val, 0);

  const allocationData = portfolioAssets.map((asset, index) => ({
    name: asset.symbol,
    value: logSum > 0 ? Math.round((logTotals[index] / logSum) * 100) : 0,
  }));

  // Allocation by type based on quantity
  const typeTotals = {};
  let totalQuantity = 0;

  portfolioAssets.forEach((asset) => {
    const type = asset.type || "STOCK";
    if (!typeTotals[type]) typeTotals[type] = 0;
    typeTotals[type] += asset.quantity;  // sum quantity instead of value
    totalQuantity += asset.quantity;
  });

  const typeAllocationData = Object.entries(typeTotals).map(([type, qty]) => ({
    name: type,
    value: totalQuantity > 0 ? Math.round((qty / totalQuantity) * 100) : 0,
  }));

  // Diversification Score (replaces Portfolio Health)
  const diversificationScore = (() => {
    if (typeAllocationData.length === 0) return 0;
    const proportions = typeAllocationData.map(t => t.value / 100);
    const entropy = proportions.reduce((sum, p) => {
      if (p === 0) return sum;
      return sum + p * Math.log(p);
    }, 0);
    const maxEntropy = Math.log(typeAllocationData.length);
    return Math.round((-entropy / maxEntropy) * 100);
  })();

  // Live portfolio growth data (fetched from API)
  const portfolioData = portfolioGrowthData.length > 0 ? portfolioGrowthData : [
    { date: "No data", value: 0 },
  ];

  // Trade popup functions
  const openTradePopup = (tradeType, symbol, maxQuantity = null) => {
    setPopupData({ tradeType, symbol, maxQuantity });
    setShowPopup(true);
  };

  const handleBuy = (symbol) => openTradePopup("buy", symbol);
  const handleSell = (symbol, quantity) => {
    if (quantity === 1) {
      sellAllAsset(symbol).then(() => fetchData()).catch(() => alert("Failed to sell asset"));
    } else {
      openTradePopup("sell", symbol, quantity);
    }
  };
  const handlePopupConfirm = async (symbol, quantity) => {
    try {
      if (popupData.tradeType === "buy") {
        // Try to add asset to catalogue first (in case it doesn't exist)
        try {
          await addAssetToCatalogue(symbol);
        } catch (err) {
          // Asset might already exist in catalogue, continue with buy
          console.log("Asset may already exist in catalogue or could not be added:", err.message);
        }
        // Now attempt to buy
        await buyAsset(symbol, quantity);
      } else {
        await sellAsset(symbol, quantity);
      }
      fetchData();
    } catch (err) {
      alert(`Failed to ${popupData.tradeType} asset: ${err.message}`);
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><LoadingSpinner /></div>;

  return (
      <div className="min-h-screen bg-slate-50">
        {/* Top Navigation Bar */}
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 h-16 flex items-center justify-between px-6 sm:px-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <span className="text-xl font-bold text-slate-800 tracking-tight">FolioX</span>
          </div>
          <Link to="/ai-assistant">
            <Button color="primary" variant="flat" className="rounded-lg font-medium px-6">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              AI Assistant
            </Button>
          </Link>
        </nav>

        <div className="p-6 sm:p-10 flex flex-col gap-8 max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">Welcome back, Sumeet</h2>
              <p className="text-slate-500 mt-1">Here's what's happening with your portfolio today.</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="rounded-xl shadow-card hover:shadow-card-hover transition-shadow duration-300">
              <CardBody className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <CardTitle>Total Portfolio</CardTitle>
                  <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl font-bold text-slate-800">${portfolioValue.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-2 text-sm">
                  <span className="text-emerald-600 font-medium flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    +2.4%
                  </span>
                  <span className="text-slate-400">vs last month</span>
                </div>
              </CardBody>
            </Card>

            <Card className="rounded-xl shadow-card hover:shadow-card-hover transition-shadow duration-300">
              <CardBody className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <CardTitle>Diversification</CardTitle>
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl font-bold text-slate-800">{diversificationScore}/100</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                      style={{ width: `${diversificationScore}%` }}
                    />
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card className="rounded-xl shadow-card hover:shadow-card-hover transition-shadow duration-300">
              <CardBody className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <CardTitle>Immune Score</CardTitle>
                  <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center">
                    <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl font-bold text-slate-800">85/100</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-violet-500 rounded-full" 
                      style={{ width: '85%' }}
                    />
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card className="rounded-xl shadow-card hover:shadow-card-hover transition-shadow duration-300">
              <CardBody className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <CardTitle>Available Balance</CardTitle>
                  <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                    <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl font-bold text-slate-800">${balance.amount.toLocaleString()}</p>
                <p className="text-sm text-slate-400 mt-2">Ready to invest</p>
              </CardBody>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Growth Chart */}
            <Card className="lg:col-span-2 rounded-xl shadow-card">
              <CardBody className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800">Portfolio Growth</h3>
                    <p className="text-sm text-slate-500">Last 6 months performance</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-sm">
                      <span className="w-3 h-3 rounded-full bg-primary-600"></span>
                      <span className="text-slate-600">Portfolio Value</span>
                    </span>
                  </div>
                </div>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={portfolioData}>
                      <defs>
                        <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis 
                        dataKey="date" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                        dy={10}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                        tickFormatter={(value) => `$${(value/1000).toFixed(0)}k`}
                        dx={-10}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                        formatter={(value) => [`$${value.toLocaleString()}`, 'Value']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#6366f1" 
                        strokeWidth={3}
                        dot={false}
                        activeDot={{ r: 6, fill: '#6366f1' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardBody>
            </Card>

            {/* Pie Charts */}
            <div className="flex flex-col gap-6">
              {/* Asset Allocation */}
              <Card className="rounded-xl shadow-card">
                <CardBody className="p-6">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">Asset Allocation</h3>
                  <div className="h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie 
                          data={allocationData} 
                          dataKey="value" 
                          outerRadius={75} 
                          innerRadius={45}
                          nameKey="name"
                          paddingAngle={2}
                        >
                          {allocationData.map((_, index) => (
                            <Cell key={index} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#fff', 
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap gap-3 justify-center mt-4">
                    {allocationData.map((item, index) => (
                        <div key={item.name} className="flex items-center gap-2 text-sm">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                          <span className="font-medium text-slate-700">{item.name}</span>
                          <span className="text-slate-400">{item.value}%</span>
                        </div>
                    ))}
                  </div>
                </CardBody>
              </Card>

              {/* Type Allocation */}
              <Card className="rounded-xl shadow-card">
                <CardBody className="p-6">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">By Asset Type</h3>
                  <div className="h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie 
                          data={typeAllocationData} 
                          dataKey="value" 
                          outerRadius={75} 
                          innerRadius={45}
                          nameKey="name"
                          paddingAngle={2}
                        >
                          {typeAllocationData.map((_, index) => (
                            <Cell key={index} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#fff', 
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap gap-3 justify-center mt-4">
                    {typeAllocationData.map((item, index) => (
                        <div key={item.name} className="flex items-center gap-2 text-sm">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                          <span className="font-medium text-slate-700">{item.name}</span>
                          <span className="text-slate-400">{item.value}%</span>
                        </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>

          {/* Holdings Table */}
          <Card className="rounded-xl shadow-card">
            <CardBody className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Holdings</h3>
                  <p className="text-sm text-slate-500">Your current investment portfolio</p>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    color="primary"
                    variant="flat"
                    className="rounded-lg"
                    onClick={async () => {
                      try {
                        setLoading(true);
                        const refreshedAssets = await refreshPortfolio();
                        console.log(refreshedAssets);
                        setPortfolioAssets(refreshedAssets);
                      } catch (err) {
                        console.log(err);
                        alert("Failed to refresh portfolio");
                      } finally {
                        setLoading(false);
                      }
                    }}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                  </Button>
                  <Button color="primary" className="rounded-lg" onClick={() => openTradePopup("buy", "")}>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Asset
                  </Button>
                </div>
              </div>

              {portfolioAssets.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <svg className="w-16 h-16 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p className="text-lg">No assets in your portfolio yet</p>
                    <p className="text-sm">Add some assets to get started with your investment journey.</p>
                  </div>
              ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableColumn className="text-sm font-semibold text-slate-600 bg-slate-50">TICKER</TableColumn>
                        <TableColumn className="text-sm font-semibold text-slate-600 bg-slate-50">NAME</TableColumn>
                        <TableColumn className="text-sm font-semibold text-slate-600 bg-slate-50 text-center">QTY</TableColumn>
                        <TableColumn className="text-sm font-semibold text-slate-600 bg-slate-50">BUY DATE</TableColumn>
                        <TableColumn className="text-sm font-semibold text-slate-600 bg-slate-50">BUY PRICE</TableColumn>
                        <TableColumn className="text-sm font-semibold text-slate-600 bg-slate-50">CURRENT</TableColumn>
                        <TableColumn className="text-sm font-semibold text-slate-600 bg-slate-50">P&L</TableColumn>
                        <TableColumn className="text-sm font-semibold text-slate-600 bg-slate-50 text-right">ACTIONS</TableColumn>
                      </TableHeader>

                      <TableBody>
                        {portfolioAssets.map((asset) => {
                          const pnl = (asset.currentPrice - asset.buyPrice) * asset.quantity;
                          const pnlPercent = asset.buyPrice > 0 ? ((asset.currentPrice - asset.buyPrice) / asset.buyPrice * 100).toFixed(2) : 0;
                          return (
                            <TableRow key={asset.symbol} className="hover:bg-slate-50 transition-colors">
                              <TableCell className="font-bold text-slate-800">{asset.symbol}</TableCell>
                              <TableCell className="text-slate-600">{asset.name}</TableCell>
                              <TableCell className="text-center font-medium text-slate-700">{asset.quantity}</TableCell>
                              <TableCell className="text-slate-600">
                                {asset.buyTimestamp
                                  ? new Date(asset.buyTimestamp).toLocaleDateString()
                                  : "-"}
                              </TableCell>
                              <TableCell className="text-slate-600">${asset.buyPrice.toLocaleString()}</TableCell>
                              <TableCell className="font-medium text-slate-700">${asset.currentPrice.toLocaleString()}</TableCell>
                              <TableCell>
                                <div className="flex flex-col">
                                  <span className={`font-semibold ${pnl >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                                    {pnl >= 0 ? "+" : ""}${pnl.toLocaleString()}
                                  </span>
                                  <span className={`text-xs font-medium ${pnl >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                                    {pnlPercent}%
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    size="sm"
                                    variant="flat"
                                    className="rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 font-medium px-4 min-w-[70px]"
                                    onClick={() => handleBuy(asset.symbol)}
                                  >
                                    Add
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="flat"
                                    className="rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 font-medium px-4 min-w-[80px]"
                                    onClick={() => handleSell(asset.symbol, asset.quantity)}
                                  >
                                    Remove
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
              )}
            </CardBody>
          </Card>

          {/* Asset Catalogue */}
          <AssetCatalogueCard onBuy={handleBuy} />
        </div>

        <TradePopup
            isOpen={showPopup}
            tradeType={popupData.tradeType}
            initialSymbol={popupData.symbol}
            onClose={() => setShowPopup(false)}
            onConfirm={handlePopupConfirm}
        />
      </div>
  );
}

