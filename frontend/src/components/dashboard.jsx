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

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ec4899", "#14b8a6"];

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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
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

  if (loading) return <div className="min-h-screen bg-gradient-to-b from-white to-cyan-100 flex items-center justify-center"><LoadingSpinner /></div>;

  return (
      <div className="min-h-screen bg-gradient-to-b from-white to-cyan-100">
        {/* Top Bar */}
        <div className="sticky top-0 z-10 h-16 !bg-white shadow-md flex items-center justify-between px-10">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-extrabold tracking-wide text-cyan-600">FolioX</h1>
          </div>
          <Link to="/ai-assistant">
            <Button color="primary" variant="flat" className="rounded-full">
              Chat with Bot
            </Button>
          </Link>
        </div>

        <div className="p-10 flex flex-col gap-10">
          <div>
            <h2 className="text-5xl font-black text-cyan-600">Hi Sumeet</h2>
            <p className="text-lg text-zinc-600 mt-2 italic">Welcome back to your dashboard.</p>
          </div>

          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}

          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-7">
            <Card className="rounded-2xl shadow-lg bg-amber-50">
              <CardBody className="p-7">
                <CardTitle>Total Portfolio Value</CardTitle>
                <div className="h-1 w-10 rounded-full bg-cyan-500 mt-2 mx-auto" />
                <p className="mt-6 text-3xl font-extrabold text-center">${portfolioValue.toLocaleString()}</p>
              </CardBody>
            </Card>

            <Card className="rounded-2xl shadow-lg bg-yellow-100">
              <CardBody className="p-7">
                <CardTitle>Diversification Score</CardTitle>
                <div className="h-1 w-10 rounded-full bg-cyan-500 mt-2 mx-auto" />
                <p className="mt-6 text-3xl font-extrabold text-center">{diversificationScore} / 100</p>
              </CardBody>
            </Card>

            <Card className="rounded-2xl shadow-lg bg-lime-100">
              <CardBody className="p-7">
                <CardTitle>Immune Score</CardTitle>
                <div className="h-1 w-10 rounded-full bg-cyan-500 mt-2 mx-auto" />
                <p className="mt-6 text-3xl font-extrabold text-center">85 / 100</p>
              </CardBody>
            </Card>

            <Card className="rounded-2xl shadow-lg bg-green-100">
              <CardBody className="p-7">
                <CardTitle>Available Balance</CardTitle>
                <div className="h-1 w-10 rounded-full bg-cyan-500 mt-2 mx-auto" />
                <p className="mt-6 text-3xl font-extrabold text-center">${balance.amount.toLocaleString()}</p>
              </CardBody>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-3 gap-7">
            <Card className="col-span-2 rounded-2xl shadow-lg !bg-white">
              <CardBody className="p-7">
                <CardTitle>Portfolio Growth Over 6 Months </CardTitle>
                <div className="h-1 w-10 rounded-full bg-cyan-500 mt-2 mx-auto" />
                <div className="mt-6 h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={portfolioData}>
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="value" stroke="#328ec4" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardBody>
            </Card>

            {/* Pie Charts */}
            <div className="flex flex-col gap-7">
              {/* By Symbol */}
              <Card className="rounded-2xl shadow-lg !bg-white">
                <CardBody className="p-7">
                  <CardTitle>Asset Allocation</CardTitle>
                  <div className="h-1 w-10 rounded-full bg-cyan-500 mt-2 mx-auto" />
                  <div className="mt-6 h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={allocationData} dataKey="value" outerRadius={95} nameKey="name">
                          {allocationData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-col gap-3 items-center mt-4">
                    {allocationData.map((item, index) => (
                        <div key={item.name} className="flex items-center gap-3 text-sm text-zinc-700">
                          <div className="h-3 w-3 rounded-md" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                          <span className="font-semibold">{item.name}</span>
                          <span className="text-white0">{item.value}%</span>
                        </div>
                    ))}
                  </div>
                </CardBody>
              </Card>

              {/* By Type */}
              <Card className="rounded-2xl shadow-lg !bg-white">
                <CardBody className="p-7">
                  <CardTitle>Allocation by Asset Type</CardTitle>
                  <div className="h-1 w-10 rounded-full bg-cyan-500 mt-2 mx-auto" />
                  <div className="mt-6 h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={typeAllocationData} dataKey="value" outerRadius={95} nameKey="name">
                          {typeAllocationData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-col gap-3 items-center mt-4">
                    {typeAllocationData.map((item, index) => (
                        <div key={item.name} className="flex items-center gap-3 text-sm text-zinc-700">
                          <div className="h-3 w-3 rounded-md" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                          <span className="font-semibold">{item.name}</span>
                          <span className="text-white0">{item.value}%</span>
                        </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>

          {/* Holdings Table */}
          <Card className="rounded-2xl shadow-lg !bg-white">
            <CardBody className="p-7">
              <div className="mb-6 text-center">
                <CardTitle className="text-15xl font-extrabold tracking-wide text-slate-300">
                  Holdings
                </CardTitle>

                <div className="h-1 w-24 rounded-full bg-cyan-500 mt-4 mx-auto" />
              </div>



              <div className="flex justify-end mb-5 gap-2">
                <Button
                  color="primary"
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
                  Refresh
                </Button>

                <Button color="secondary" onClick={() => openTradePopup("buy", "")}>Add Asset</Button>
              </div>

              {portfolioAssets.length === 0 ? (
                  <div className="text-center py-8 text-white0">No assets in your portfolio yet. Add some assets to get started.</div>
              ) : (
                  <Table>
                    <TableHeader>
                      <TableColumn className="w-24 px-4">Ticker</TableColumn>
                      <TableColumn className="w-44 px-4">Name</TableColumn>
                      <TableColumn className="w-20 px-4 text-center">Qty</TableColumn>
                      <TableColumn className="w-32 px-4">Buy Date</TableColumn>
                      <TableColumn className="w-32 px-4">Buy Price</TableColumn>
                      <TableColumn className="w-36 px-4">Current</TableColumn>
                      <TableColumn className="w-32 px-4">P&L</TableColumn>
                      <TableColumn className="w-48 px-6 text-right">Actions</TableColumn>
                    </TableHeader>


                    <TableBody>
                      {portfolioAssets.map((asset) => {
                        const pnl = (asset.currentPrice - asset.buyPrice) * asset.quantity;
                        const pnlPercent = asset.buyPrice > 0 ? ((asset.currentPrice - asset.buyPrice) / asset.buyPrice * 100).toFixed(2) : 0;
                        return (
                            <TableRow key={asset.symbol} className="h-14">
                              <TableCell className="px-4 font-semibold align-middle">
                                {asset.symbol}
                              </TableCell>

                              <TableCell className="px-4 font-semibold align-middle">
                                {asset.name}
                              </TableCell>

                              <TableCell className="px-4 font-semibold text-center align-middle">
                                {asset.quantity}
                              </TableCell>

                              <TableCell className="px-4 font-semibold align-middle">
                                {asset.buyTimestamp
                                  ? new Date(asset.buyTimestamp).toLocaleDateString()
                                  : "-"}
                              </TableCell>

                              <TableCell className="px-4 font-semibold align-middle">
                                ${asset.buyPrice.toLocaleString()}
                              </TableCell>

                              <TableCell className="px-4 font-semibold align-middle">
                                ${asset.currentPrice.toLocaleString()}
                              </TableCell>

                              <TableCell className="px-4 font-semibold align-middle">
                                <div className="flex flex-col leading-tight">
                                  <span className={`font-semibold ${pnl >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                                    {pnl >= 0 ? "+" : ""}${pnl.toLocaleString()}
                                  </span>
                                  <span className={`text-xs ${pnl >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                                    {pnlPercent}%
                                  </span>
                                </div>
                              </TableCell>

                              <TableCell className="px-6 font-semibold align-middle text-right">
                                <div className="flex justify-end gap-3">
                                  <Button
                                    size="sm"
                                    variant="flat"
                                    className="rounded-full border-2 border-green-600 text-green-600 font-semibold px-4" onClick={() => handleBuy(asset.symbol)}
                                  >
                                    Add
                                  </Button>

                                  <Button
                                    size="sm"
                                    variant="flat"
                                    className="rounded-full border-2 border-red-600 text-red-600 font-semibold px-4" onClick={() => handleSell(asset.symbol, asset.quantity)}
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
