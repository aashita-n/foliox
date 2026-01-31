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

/* ---temp data--- */
const portfolioData = [
  { date: "January", value: 100000 },
  { date: "February", value: 110000 },
  { date: "March", value: 105000 },
  { date: "April", value: 120000 },
];

const allocationData = [
  { name: "Stocks", value: 60 },
  { name: "Bonds", value: 25 },
  { name: "Cash", value: 15 },
];

const assets = [
  { symbol: "AAPL", quantity: 10, buyPrice: 150, currentPrice: 175 },
  { symbol: "GOOG", quantity: 5, buyPrice: 2500, currentPrice: 2400 },
];

const COLORS = ["#6366f1", "#22c55e", "#f59e0b"];

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

function AssetLegend({ data, colors }) {
  return (
    <div className="flex flex-col gap-3 items-center mt-4">
      {data.map((item, index) => (
        <div
          key={item.name}
          className="flex items-center gap-3 text-sm text-slate-700"
        >
          <div
            className="h-3 w-3 rounded-md"
            style={{ backgroundColor: colors[index] }}
          />
          <span className="font-semibold">{item.name}</span>
          <span className="text-slate-500">{item.value}%</span>
        </div>
      ))}
    </div>
  );
}

/* ---MAIN COMPO--- */
export default function Dashboard() {
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

        {/* --- summary cards--- */}
        <div className="grid grid-cols-3 gap-7">
          {[
            {
              title: "Total Portfolio Value",
              value: "₹12,00,000",
              bg: "bg-indigo-50",
            },
            {
              title: "Portfolio Health",
              value: "82 / 100",
              bg: "bg-cyan-50",
            },
            {
              title: "Available Balance",
              value: "₹1,50,000",
              bg: "bg-emerald-50",
            },
          ].map((item) => (
            <Card
              key={item.title}
              className={`rounded-2xl shadow-lg ${item.bg}`}
            >
              <CardBody className="p-7">
                <CardTitle>{item.title}</CardTitle>
                <div className="h-1 w-10 rounded-full bg-indigo-500 mt-2 mx-auto" />
                <p className="mt-6 text-3xl font-extrabold text-center">
                  {item.value}
                </p>
              </CardBody>
            </Card>
          ))}
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
                    >
                      {allocationData.map((_, index) => (
                        <Cell key={index} fill={COLORS[index]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <AssetLegend data={allocationData} colors={COLORS} />
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

            <div className="flex justify-end mb-5">
              <Button color="primary">Add Asset</Button>
            </div>

            <Table>
              <TableHeader>
                <TableColumn>Ticker</TableColumn>
                <TableColumn>Quantity</TableColumn>
                <TableColumn>Buy Price</TableColumn>
                <TableColumn>Current Price</TableColumn>
                <TableColumn>P&amp;L</TableColumn>
                <TableColumn />
              </TableHeader>

              <TableBody>
                {assets.map((asset) => {
                  const pnl =
                    (asset.currentPrice - asset.buyPrice) *
                    asset.quantity;

                  return (
                    <TableRow key={asset.symbol}>
                      <TableCell>{asset.symbol}</TableCell>
                      <TableCell>{asset.quantity}</TableCell>
                      <TableCell>₹{asset.buyPrice}</TableCell>
                      <TableCell>₹{asset.currentPrice}</TableCell>
                      <TableCell
                        className={`font-semibold ${
                          pnl >= 0
                            ? "text-emerald-600"
                            : "text-red-600"
                        }`}
                      >
                        ₹{pnl}
                      </TableCell>
                      <TableCell>
                        <button className="px-3 py-1 text-xs font-bold text-red-600 bg-red-100/60 rounded-md">
                          Sell
                        </button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
