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
    <Card className="rounded-xl shadow-sm border border-slate-200 bg-white hover:shadow-md transition-shadow">
      <CardBody className="p-6 flex flex-col gap-5">
        {/* Card Title */}
        <div className="flex justify-between items-center">
            <p className="text-xl font-semibold tracking-widest uppercase text-slate-800">
                Asset Catalogue
            </p>

            {/* Search input */}
            <Input
              type="text"
              placeholder="Search assets..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              onKeyDown={handleSearch}
              className="w-64"
              size="sm"
              variant="bordered"
            />
        </div>

        {/* Table */}
        <div className="overflow-y-auto max-h-[400px]">
          <Table aria-label="Asset catalogue">
            <TableHeader>
              <TableColumn className="w-24">SYMBOL</TableColumn>
              <TableColumn className="w-28">TYPE</TableColumn>
              <TableColumn className="w-40">NAME</TableColumn>
              <TableColumn className="w-28">PRICE</TableColumn>
              <TableColumn className="w-24">HIGH</TableColumn>
              <TableColumn className="w-24">LOW</TableColumn>
              <TableColumn className="w-32">VOLUME</TableColumn>
              <TableColumn className="w-28 text-right">ACTIONS</TableColumn>
            </TableHeader>

            <TableBody>
              {filteredAssets.map((asset) => (
                <TableRow key={asset.symbol}>
                  <TableCell className="font-semibold text-slate-800">{asset.symbol}</TableCell>
                  <TableCell className="text-slate-600">{asset.type ?? "STOCK"}</TableCell>
                  <TableCell className="text-slate-600">{asset.name}</TableCell>
                  <TableCell className="font-medium text-slate-800">${asset.price?.toLocaleString() ?? "-"}</TableCell>
                  <TableCell className="text-slate-600">${asset.high?.toLocaleString() ?? "-"}</TableCell>
                  <TableCell className="text-slate-600">${asset.low?.toLocaleString() ?? "-"}</TableCell>
                  <TableCell className="text-slate-600">{asset.volume?.toLocaleString() ?? "-"}</TableCell>
                  <TableCell className="text-right flex justify-end gap-2">
                    <Button
  size="sm"
  className="
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
  Buy
</Button>



                    <Button
  size="sm"
  className="
    font-medium
    text-blue-700
    border
    border-blue-700
    bg-transparent
    hover:bg-blue-50
    hover:text-blue-800
    transition-colors
    rounded-md
  "
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
