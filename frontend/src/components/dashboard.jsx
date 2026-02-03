import { useState, useEffect } from "react";
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
} from "../services/api";
import TradePopup from "./TradePopup";

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ec4899", "#14b8a6"];

/* ---UI Helpers--- */
function CardTitle({ children, align = "center" }) {
  return (
      <p
          className={`text-xs font-semibold tracking-widest uppercase text-zinc-600 ${
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
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load data from server");
    } finally {
      setLoading(false);
    }
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

  // Mock portfolio growth
  const portfolioData = [
    { date: "January", value: portfolioValue * 0.85 },
    { date: "February", value: portfolioValue * 0.92 },
    { date: "March", value: portfolioValue * 0.88 },
    { date: "April", value: portfolioValue },
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
      if (popupData.tradeType === "buy") await buyAsset(symbol, quantity);
      else await sellAsset(symbol, quantity);
      fetchData();
    } catch {
      alert(`Failed to ${popupData.tradeType} asset`);
    }
  };

  if (loading) return <div className="min-h-screen bg-gradient-to-b from-white to-cyan-100 flex items-center justify-center"><LoadingSpinner /></div>;

  return (
      <div className="min-h-screen bg-gradient-to-b from-white to-cyan-100">
        {/* Top Bar */}
        <div className="sticky top-0 z-10 h-16 !bg-white shadow-md flex items-center px-10">
          <h1 className="text-xl font-extrabold tracking-wide text-cyan-600">FolioX</h1>
        </div>

        <div className="p-10 flex flex-col gap-10">
          <div>
            <h2 className="text-5xl font-black text-cyan-600">Hi Sumeet</h2>
            <p className="text-lg text-zinc-600 mt-2 italic">Welcome back to your dashboard.</p>
          </div>

          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}

          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-7">
            <Card className="rounded-2xl shadow-lg bg-amber-50">
              <CardBody className="p-7">
                <CardTitle>Total Portfolio Value</CardTitle>
                <div className="h-1 w-10 rounded-full bg-cyan-500 mt-2 mx-auto" />
                <p className="mt-6 text-3xl font-extrabold text-center">₹{portfolioValue.toLocaleString()}</p>
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
                <CardTitle>Available Balance</CardTitle>
                <div className="h-1 w-10 rounded-full bg-cyan-500 mt-2 mx-auto" />
                <p className="mt-6 text-3xl font-extrabold text-center">₹{balance.amount.toLocaleString()}</p>
              </CardBody>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-3 gap-7">
            <Card className="col-span-2 rounded-2xl shadow-lg !bg-white">
              <CardBody className="p-7">
                <CardTitle align="left">Portfolio Growth</CardTitle>
                <div className="h-1 w-10 rounded-full bg-cyan-500 mt-2" />
                <div className="mt-6 h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={portfolioData}>
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} />
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
              <div className="mb-5 text-center">
                <CardTitle>Holdings</CardTitle>
                <div className="h-1 w-10 rounded-full bg-cyan-500 mt-2 mx-auto" />
              </div>

              <div className="flex justify-end mb-5 gap-2">
                <Button color="primary" onClick={fetchData}>Refresh</Button>
                <Button color="secondary" onClick={() => openTradePopup("buy", "")}>Add Asset</Button>
              </div>

              {portfolioAssets.length === 0 ? (
                  <div className="text-center py-8 text-white0">No assets in your portfolio yet. Add some assets to get started.</div>
              ) : (
                  <Table>
                    <TableHeader>
                      <TableColumn>Ticker</TableColumn>
                      <TableColumn>Quantity</TableColumn>
                      <TableColumn>Buy Price</TableColumn>
                      <TableColumn>Current Price</TableColumn>
                      <TableColumn>P&L</TableColumn>
                      <TableColumn>Actions</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {portfolioAssets.map((asset) => {
                        const pnl = (asset.currentPrice - asset.buyPrice) * asset.quantity;
                        const pnlPercent = asset.buyPrice > 0 ? ((asset.currentPrice - asset.buyPrice) / asset.buyPrice * 100).toFixed(2) : 0;
                        return (
                            <TableRow key={asset.symbol}>
                              <TableCell className="font-semibold">{asset.symbol}</TableCell>
                              <TableCell>{asset.quantity}</TableCell>
                              <TableCell>₹{asset.buyPrice.toLocaleString()}</TableCell>
                              <TableCell>₹{asset.currentPrice.toLocaleString()}</TableCell>
                              <TableCell>
                                <div className={`font-semibold ${pnl >= 0 ? "text-emerald-600" : "text-red-600"}`}>{pnl >= 0 ? "+" : ""}₹{pnl.toLocaleString()}</div>
                                <div className={`text-xs ${pnl >= 0 ? "text-emerald-500" : "text-red-500"}`}>{pnlPercent}%</div>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button size="sm" variant="flat" className="rounded-full border-2 border-green-600 text-green-600 font-semibold px-4 hover:bg-green-50" onClick={() => handleBuy(asset.symbol)}>Buy</Button>
                                  <Button size="sm" variant="flat" className="rounded-full border-2 border-red-600 text-red-600 font-semibold px-4 hover:bg-red-50" onClick={() => handleSell(asset.symbol, asset.quantity)}>Sell</Button>
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
