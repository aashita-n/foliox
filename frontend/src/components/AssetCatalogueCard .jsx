import { useEffect, useState } from "react";
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
  Input
} from "@heroui/react";

import { getAssetCatalogue, addAssetToCatalogue, buyAsset, refreshPortfolio } from "../services/api";
import TradePopup from "./TradePopup";

export default function AssetCatalogueCard() {
  const [assets, setAssets] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const [showPopup, setShowPopup] = useState(false);
  const [popupData, setPopupData] = useState({ tradeType: "buy", symbol: "", maxQuantity: null });

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const data = await getAssetCatalogue();
      setAssets(data);
      setFilteredAssets(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleSearch = async (e) => {
    if (e.key === "Enter") {
      if (!searchQuery.trim()) {
        // Reset to default catalogue
        setFilteredAssets(assets);
        return;
      }
      try {
        const results = await fetch(`/api/catalogue/search?q=${searchQuery}`).then(res => res.json());
        setFilteredAssets(results);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleRefresh = async (symbol) => {
    try {
      await fetch(`/api/catalogue/${symbol}`, { method: 'PUT' });
      fetchAssets();
    } catch (err) {
      console.error(err);
    }
  };

//   const handleBuy = (symbol) => {
//     setPopupData({ tradeType: "buy", symbol, maxQuantity: null });
//     setShowPopup(true);
//   };

const openTradePopup = (tradeType, symbol, maxQuantity = null) => {
    setPopupData({ tradeType, symbol, maxQuantity });
    setShowPopup(true);
  };

  const handleBuy = (symbol) => openTradePopup("buy", symbol);

  const handlePopupConfirm = async (symbol, quantity) => {
  try {
    // Try adding asset to catalogue (ignore failure if already exists)
    try {
      await addAssetToCatalogue(symbol);
    } catch (err) {
      console.log("Asset already exists in catalogue, continuing buy");
    }

    // ACTUAL BUY CALL
    await buyAsset(symbol, quantity); // PUT /portfolio/{symbol}/buy/{quantity}

    fetchAssets();
  } catch (err) {
    console.error(err);
    alert("Failed to buy asset");
  }
};


  return (
    <Card className="rounded-2xl shadow-lg !bg-white">
      <CardBody className="p-7 flex flex-col gap-5">
        {/* Card Title */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <p className="text-xl font-semibold tracking-widest uppercase text-slate-800">
                Asset Catalogue
            </p>

            {/* Boxed search input */}
            <div className="border border-gray-300 rounded-lg px-3 py-1 flex items-center w-full sm:w-64">
                <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
                className="outline-none w-full text-sm text-gray-700"
                />
            </div>
        </div>

        {/* Table */}
        <div className="overflow-y-auto max-h-[400px]">
          <Table>
            <TableHeader>
              <TableColumn>Symbol</TableColumn>
              <TableColumn>Type</TableColumn>
              <TableColumn>Name</TableColumn>
              <TableColumn>Current</TableColumn>
              <TableColumn>High</TableColumn>
              <TableColumn>Low</TableColumn>
              <TableColumn>Volume</TableColumn>
              <TableColumn className="text-right">Actions</TableColumn>
            </TableHeader>

            <TableBody>
              {filteredAssets.map((asset) => (
                <TableRow key={asset.symbol}>
                  <TableCell className="font-semibold">{asset.symbol}</TableCell>
                  <TableCell className="font-semibold">{asset.type ?? "STOCK"}</TableCell>
                  <TableCell className="font-semibold">{asset.name}</TableCell>
                  <TableCell className="font-semibold">${asset.price?.toLocaleString() ?? "-"}</TableCell>
                  <TableCell className="font-semibold">${asset.high?.toLocaleString() ?? "-"}</TableCell>
                  <TableCell className="font-semibold">${asset.low?.toLocaleString() ?? "-"}</TableCell>
                  <TableCell className="font-semibold">{asset.volume?.toLocaleString() ?? "-"}</TableCell>
                  <TableCell className="text-right flex justify-end gap-2">
                    <Button
                    size="sm"
                    variant="flat"
                    className="rounded-full border-2 border-green-600 text-green-600 font-bold px-4"
                    onClick={() => handleBuy(asset.symbol)}
                    >
                    Buy
                    </Button>


                    <Button
                      size="sm"
                      variant="flat"
                      className="rounded-full border-2 border-cyan-600 text-cyan-600 font-semibold px-4"
                      onClick={() => handleRefresh(asset.symbol)}
                    >
                      Refresh
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <TradePopup
          isOpen={showPopup}
          tradeType={popupData.tradeType}
          initialSymbol={popupData.symbol}
          onClose={() => setShowPopup(false)}
          onConfirm={handlePopupConfirm}
        />
      </CardBody>
    </Card>
  );
}
