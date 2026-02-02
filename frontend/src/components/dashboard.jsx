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

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ec4899", "#14b8a6"];

/* ---ui helper--- */
function CardTitle({ children, align = "center" }) {
  return (
    <p
      className={`text-xs font-semibold tracking-widest uppercase text-slate-600 ${
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
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>
  );
}

function ErrorMessage({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center h-20 text-red-600">
      <p className="text-sm">{message}</p>
      <Button size="sm" color="primary" className="mt-2" onClick={onRetry}>
        Retry
      </Button>
    </div>
  );
}

/* ---MAIN COMPO--- */
export default function Dashboard() {
  const [portfolioAssets, setPortfolioAssets] = useState([]);
  const [balance, setBalance] = useState({ amount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // Calculate portfolio value
  const portfolioValue = portfolioAssets.reduce((total, asset) => {
    return total + asset.currentPrice * asset.quantity;
  }, 0);

  // Generate allocation data from actual portfolio
  const allocationData = portfolioAssets.map((asset) => ({
    name: asset.symbol,
    value: portfolioValue > 0
      ? Math.round((asset.currentPrice * asset.quantity / portfolioValue) * 100)
      : 0,
  }));

  // Generate portfolio growth data (mock for now, can be replaced with history API)
  const portfolioData = [
    { date: "January", value: portfolioValue * 0.85 },
    { date: "February", value: portfolioValue * 0.92 },
    { date: "March", value: portfolioValue * 0.88 },
    { date: "April", value: portfolioValue },
  ];

  // Handle buy/sell actions
  const handleBuy = async (symbol) => {
    try {
      const quantity = prompt(`Enter quantity to buy ${symbol}:`);
      if (quantity && Number(quantity) > 0) {
        await buyAsset(symbol, parseInt(quantity));
        fetchData(); // Refresh data
      }
    } catch (err) {
      alert("Failed to buy asset");
    }
  };

  const handleSell = async (symbol, quantity) => {
    try {
      if (quantity === 1) {
        await sellAllAsset(symbol);
      } else {
        const sellQty = prompt(`Enter quantity to sell (max ${quantity}):`);
        if (sellQty && Number(sellQty) > 0 && Number(sellQty) <= quantity) {
          await sellAsset(symbol, parseInt(sellQty));
        }
      }
      fetchData(); // Refresh data
    } catch (err) {
      alert("Failed to sell asset");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-indigo-100 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-indigo-100">
      {/* ---top bar--- */}
      <div className="sticky top-0 z-10 h-16 bg-white shadow-md flex items-center px-10">
        <h1 className="text-xl font-extrabold tracking-wide text-indigo-600">
          FolioX
        </h1>
      </div>

      {/* --page content--- */}
      <div className="p-10 flex flex-col gap-10">
        {/*--sumeet greeting---*/}
        <div>
          <h2 className="text-5xl font-black text-indigo-600">Hi Sumeet</h2>
          <p className="text-lg text-slate-600 mt-2 italic">
            Welcome back to your dashboard.
          </p>
        </div>

        {/* Error display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* --- summary cards--- */}
        <div className="grid grid-cols-3 gap-7">
          <Card className="rounded-2xl shadow-lg bg-indigo-50">
            <CardBody className="p-7">
              <CardTitle>Total Portfolio Value</CardTitle>
              <div className="h-1 w-10 rounded-full bg-indigo-500 mt-2 mx-auto" />
              <p className="mt-6 text-3xl font-extrabold text-center">
                ₹{portfolioValue.toLocaleString()}
              </p>
            </CardBody>
          </Card>

          <Card className="rounded-2xl shadow-lg bg-cyan-50">
            <CardBody className="p-7">
              <CardTitle>Portfolio Health</CardTitle>
              <div className="h-1 w-10 rounded-full bg-indigo-500 mt-2 mx-auto" />
              <p className="mt-6 text-3xl font-extrabold text-center">
                {portfolioAssets.length > 0 ? "85" : "0"} / 100
              </p>
            </CardBody>
          </Card>

          <Card className="rounded-2xl shadow-lg bg-emerald-50">
            <CardBody className="p-7">
              <CardTitle>Available Balance</CardTitle>
              <div className="h-1 w-10 rounded-full bg-indigo-500 mt-2 mx-auto" />
              <p className="mt-6 text-3xl font-extrabold text-center">
                ₹{balance.amount.toLocaleString()}
              </p>
            </CardBody>
          </Card>
        </div>

        {/* ---charts--- */}
        <div className="grid grid-cols-3 gap-7">
          <Card className="col-span-2 rounded-2xl shadow-lg bg-slate-50">
            <CardBody className="p-7">
              <CardTitle align="left">Portfolio Growth</CardTitle>
              <div className="h-1 w-10 rounded-full bg-indigo-500 mt-2" />
              <div className="mt-6 h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={portfolioData}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#6366f1"
                      strokeWidth={3}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardBody>
          </Card>

          <Card className="rounded-2xl shadow-lg bg-slate-50">
            <CardBody className="p-7">
              <CardTitle>Asset Allocation</CardTitle>
              <div className="h-1 w-10 rounded-full bg-indigo-500 mt-2 mx-auto" />
              <div className="mt-6 h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={allocationData}
                      dataKey="value"
                      outerRadius={95}
                      nameKey="name"
                    >
                      {allocationData.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex flex-col gap-3 items-center mt-4">
                {allocationData.map((item, index) => (
                  <div
                    key={item.name}
                    className="flex items-center gap-3 text-sm text-slate-700"
                  >
                    <div
                      className="h-3 w-3 rounded-md"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="font-semibold">{item.name}</span>
                    <span className="text-slate-500">{item.value}%</span>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* ---holding table--- */}
        <Card className="rounded-2xl shadow-lg bg-slate-50">
          <CardBody className="p-7">
            <div className="mb-5 text-center">
              <CardTitle>Holdings</CardTitle>
              <div className="h-1 w-10 rounded-full bg-indigo-500 mt-2 mx-auto" />
            </div>

            <div className="flex justify-end mb-5 gap-2">
              <Button color="primary" onClick={() => fetchData()}>
                Refresh
              </Button>
              <Button color="secondary" onClick={() => {
                const symbol = prompt("Enter symbol to buy:");
                if (symbol) handleBuy(symbol);
              }}>
                Add Asset
              </Button>
            </div>

            {portfolioAssets.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                No assets in your portfolio yet. Add some assets to get started.
              </div>
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
                    const pnl =
                      (asset.currentPrice - asset.buyPrice) * asset.quantity;
                    const pnlPercent = asset.buyPrice > 0
                      ? ((asset.currentPrice - asset.buyPrice) / asset.buyPrice * 100).toFixed(2)
                      : 0;

                    return (
                      <TableRow key={asset.symbol}>
                        <TableCell className="font-semibold">{asset.symbol}</TableCell>
                        <TableCell>{asset.quantity}</TableCell>
                        <TableCell>₹{asset.buyPrice.toLocaleString()}</TableCell>
                        <TableCell>₹{asset.currentPrice.toLocaleString()}</TableCell>
                        <TableCell>
                          <div className={`font-semibold ${pnl >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                            {pnl >= 0 ? "+" : ""}₹{pnl.toLocaleString()}
                          </div>
                          <div className={`text-xs ${pnl >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                            {pnlPercent}%
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              color="success"
                              variant="flat"
                              onClick={() => handleBuy(asset.symbol)}
                            >
                              Buy
                            </Button>
                            <Button
                              size="sm"
                              color="danger"
                              variant="flat"
                              onClick={() => handleSell(asset.symbol, asset.quantity)}
                            >
                              Sell
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
      </div>
    </div>
  );
}

