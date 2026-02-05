import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AssetCatalogueCard from "./AssetCatalogueCard ";
import ImmuneScoreCard from "./ImmuneScoreCard";


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
  refreshPortfolio,
  getImmunityAnalysis
} from "../services/api";
import TradePopup from "./TradePopup";

// Professional chart colors (sophisticated palette with ultramarine primary)
const COLORS = ["#3458bb", "#f32b88", "#7c3aed", "#f5df1f", "#059669"];

/* ---UI Helpers--- */
function CardTitle({ children, align = "center" }) {
  return (
      <p
          className={`text-xl font-semibold tracking-widest uppercase text-slate-800 ${
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
  const [immunityData, setImmunityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showPopup, setShowPopup] = useState(false);
  const [popupData, setPopupData] = useState({ tradeType: "buy", symbol: "", maxQuantity: null });

  // Fetch data from backend
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [assetsData, balanceData, immunityData] = await Promise.all([
        getPortfolioAssets(),
        getBalance(),
        getImmunityAnalysis().catch(() => null), // Don't fail if immunity fails
      ]);

      setPortfolioAssets(assetsData);
      setBalance(balanceData);
      setImmunityData(immunityData);

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
        {/* Top Bar */}
        <div className="sticky top-0 z-10 h-16 !bg-white shadow-sm border-b border-slate-200 flex items-center justify-between px-10">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold tracking-wide text-primary-600">FolioX</h1>
          </div>
          <Link to="/ai-assistant">
            <Button color="primary" variant="flat" className="rounded-full">
              AI Assistant
            </Button>
          </Link>
        </div>

        <div className="p-10 flex flex-col gap-10 max-w-[1600px] mx-auto">
          <div>
            <h2 className="text-4xl font-bold text-slate-800">Hi Sumeet</h2>
            <p className="text-slate-500 mt-2">Welcome back to your portfolio dashboard.</p>
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>}

          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-6">
            <Card className="rounded-xl shadow-sm border border-slate-200 bg-gradient-to-br from-white to-emerald-50 hover:shadow-lg transition-all duration-300">
              <CardBody className="p-6">
                <CardTitle>Portfolio Value</CardTitle>
                <div className="h-1 w-16 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 mt-3 mx-auto" />
                <p className="mt-5 text-3xl font-bold text-center text-slate-800">${portfolioValue.toLocaleString()}</p>
              </CardBody>
            </Card>

            <Card className="rounded-xl shadow-sm border border-slate-200 bg-gradient-to-br from-white to-blue-50 hover:shadow-lg transition-all duration-300">
              <CardBody className="p-6">
                <CardTitle>Diversification</CardTitle>
                <div className="h-1 w-16 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 mt-3 mx-auto" />
                <p className="mt-5 text-3xl font-bold text-center text-slate-800">{diversificationScore} / 100</p>
              </CardBody>
            </Card>

            <ImmuneScoreCard />

            <Card className="rounded-xl shadow-sm border border-slate-200 bg-gradient-to-br from-white to-amber-50 hover:shadow-lg transition-all duration-300">
              <CardBody className="p-6">
                <CardTitle>Available Balance</CardTitle>
                <div className="h-1 w-16 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 mt-3 mx-auto" />
                <p className="mt-5 text-3xl font-bold text-center text-slate-800">${balance.amount.toLocaleString()}</p>
              </CardBody>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-3 gap-6">
            <Card className="col-span-2 rounded-xl shadow-sm border border-slate-200 bg-gradient-to-br from-white to-slate-50 hover:shadow-lg transition-all duration-300">
              <CardBody className="p-6">
                <CardTitle>Portfolio Growth & Immunity Analysis</CardTitle>
                <div className="h-1 w-16 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 mt-3 mx-auto" />
                <div className="mt-5 h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={portfolioData}>
                      <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                      <YAxis stroke="#64748b" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '12px',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                          fontSize: '14px'
                        }}
                      />
                      <Line type="monotone" dataKey="value" stroke="#1e3a8a" strokeWidth={3} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Immunity Analysis Section */}
                <div className="mt-8 pt-6 border-t border-slate-200">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary-500"></div>
                    Portfolio Immunity Analysis
                  </h3>

                  {immunityData ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                        <p className="text-sm font-medium text-slate-600 mb-1">Diagnosis</p>
                        <p className="font-semibold text-slate-800">{immunityData.diagnosis || "Healthy"}</p>
                      </div>

                      <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg p-4 border border-emerald-100">
                        <p className="text-sm font-medium text-slate-600 mb-1">Immune Strength</p>
                        <p className="font-semibold text-slate-800">{immunityData.immune_strength || 0}/100</p>
                      </div>

                      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4 border border-amber-100">
                        <p className="text-sm font-medium text-slate-600 mb-1">Systemic Risk</p>
                        <p className="font-semibold text-slate-800">{immunityData.systemic_risk || "Low"}</p>
                      </div>

                      {immunityData.weak_points?.length > 0 && (
                        <div className="md:col-span-3 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg p-4 border border-red-100">
                          <p className="text-sm font-medium text-slate-600 mb-2">Weak Points:</p>
                          <div className="flex flex-wrap gap-2">
                            {immunityData.weak_points.map((point, idx) => (
                              <span key={idx} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                {point}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-slate-50 rounded-lg p-6 text-center border border-slate-200">
                      <p className="text-slate-500">Loading immunity analysis...</p>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>

            {/* Pie Charts */}
            <div className="flex flex-col gap-6">
              {/* By Symbol */}

              <Card className="rounded-xl shadow-sm border border-slate-200 bg-white">
                <CardBody className="p-6">
                  <CardTitle>Asset Allocation</CardTitle>
                  <div className="h-1 w-12 rounded-full bg-primary-500 mt-3 mx-auto" />
                  <div className="mt-5 h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie 
                          data={allocationData} 
                          dataKey="value" 
                          outerRadius={85} 
                          innerRadius={50}
                          nameKey="name"
                          paddingAngle={2}
                        >
                          {allocationData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
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
                  <div className="flex flex-wrap justify-center gap-3 mt-4">
                    {allocationData.map((item, index) => (
                        <div key={item.name} className="flex items-center gap-2 text-sm">
                          <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                          <span className="font-medium text-slate-600">{item.name}</span>
                          <span className="text-slate-400">{item.value}%</span>
                        </div>
                    ))}
                  </div>
                </CardBody>
              </Card>

              {/* By Type */}
              <Card className="rounded-xl shadow-sm border border-slate-200 bg-white">
                <CardBody className="p-6">
                  <CardTitle>By Asset Type</CardTitle>
                  <div className="h-1 w-12 rounded-full bg-primary-500 mt-3 mx-auto" />
                  <div className="mt-5 h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie 
                          data={typeAllocationData} 
                          dataKey="value" 
                          outerRadius={85} 
                          innerRadius={50}
                          nameKey="name"
                          paddingAngle={2}
                        >
                          {typeAllocationData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
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
                  <div className="flex flex-wrap justify-center gap-3 mt-4">
                    {typeAllocationData.map((item, index) => (
                        <div key={item.name} className="flex items-center gap-2 text-sm">
                          <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                          <span className="font-medium text-slate-600">{item.name}</span>
                          <span className="text-slate-400">{item.value}%</span>
                        </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>

          {/* Holdings Table */}
          <Card className="rounded-xl shadow-sm border border-slate-200 bg-white">
            <CardBody className="p-6">
              <div className="mb-6 text-center">
                <CardTitle>Holdings</CardTitle>
                <div className="h-1 w-16 rounded-full bg-primary-500 mt-3 mx-auto" />
              </div>

              <div className="flex justify-end mb-5 gap-3">
                <Button
                  color="primary"
                  variant="flat"
                  onClick={async () => {
                    try {
                      setLoading(true);
                      const refreshedAssets = await refreshPortfolio();
                      setPortfolioAssets(refreshedAssets);
                    } catch (err) {
                      alert("Failed to refresh portfolio");
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="font-medium"
                >
                  Refresh
                </Button>

                <Button color="primary" onClick={() => openTradePopup("buy", "")} className="font-medium">
                  Add Asset
                </Button>
              </div>

              {portfolioAssets.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">No assets in your portfolio yet.</div>
              ) : (
                  <Table aria-label="Portfolio holdings">
                    <TableHeader>
                      <TableColumn className="w-24">TICKER</TableColumn>
                      <TableColumn className="w-40">NAME</TableColumn>
                      <TableColumn className="w-20 text-center">QTY</TableColumn>
                      <TableColumn className="w-28">BUY DATE</TableColumn>
                      <TableColumn className="w-28">BUY PRICE</TableColumn>
                      <TableColumn className="w-28">CURRENT</TableColumn>
                      <TableColumn className="w-28">P&L</TableColumn>
                      <TableColumn className="w-40 text-right">ACTIONS</TableColumn>
                    </TableHeader>


                    <TableBody>
                      {portfolioAssets.map((asset) => {
                        const pnl = (asset.currentPrice - asset.buyPrice) * asset.quantity;
                        const pnlPercent = asset.buyPrice > 0 ? ((asset.currentPrice - asset.buyPrice) / asset.buyPrice * 100).toFixed(2) : 0;
                        return (
                            <TableRow key={asset.symbol} className="h-12">
                              <TableCell className="font-semibold text-slate-800">
                                {asset.symbol}
                              </TableCell>

                              <TableCell className="text-slate-600">
                                {asset.name}
                              </TableCell>

                              <TableCell className="text-center text-slate-600">
                                {asset.quantity}
                              </TableCell>

                              <TableCell className="text-slate-600">
                                {asset.buyTimestamp
                                  ? new Date(asset.buyTimestamp).toLocaleDateString()
                                  : "-"}
                              </TableCell>

                              <TableCell className="text-slate-600">
                                ${asset.buyPrice.toLocaleString()}
                              </TableCell>

                              <TableCell className="text-slate-800 font-medium">
                                ${asset.currentPrice.toLocaleString()}
                              </TableCell>

                              <TableCell className="font-medium">
                                <div className="flex flex-col">
                                  <span className={pnl >= 0 ? "text-success-600" : "text-danger-600"}>
                                    {pnl >= 0 ? "+" : ""}${pnl.toLocaleString()}
                                  </span>
                                  <span className={`text-xs ${pnl >= 0 ? "text-success-500" : "text-danger-500"}`}>
                                    {pnlPercent}%
                                  </span>
                                </div>
                              </TableCell>

                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
  size="sm"
  className="
    min-w-[70px]
    font-medium
    text-emerald-600
    border
    border-emerald-600
    bg-transparent
    hover:bg-emerald-50
    hover:text-emerald-700
    transition-colors
    rounded-md
  "
  onClick={() => handleBuy(asset.symbol)}
>
  Add
</Button>

                                  <Button
  size="sm"
  className="
    min-w-[70px]
    font-medium
    text-rose-600
    border
    border-rose-600
    bg-transparent
    hover:bg-rose-50
    hover:text-rose-700
    transition-colors
    rounded-md
  "
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
              )}
            </CardBody>
          </Card>
          <AssetCatalogueCard
            onBuy={handleBuy}
          />


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
