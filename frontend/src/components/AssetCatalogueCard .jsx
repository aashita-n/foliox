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

  // Loading skeleton
  if (loading) {
    return (
      <Card className="rounded-xl shadow-card">
        <CardBody className="p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-slate-200 rounded w-48 mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 bg-slate-100 rounded"></div>
              ))}
            </div>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="rounded-xl shadow-card">
      <CardBody className="p-6">
        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-800">Asset Catalogue</h3>
            <p className="text-sm text-slate-500">Browse and discover new investment opportunities</p>
          </div>

          {/* Professional Search Input */}
          <div className="relative w-full sm:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableColumn className="text-sm font-semibold text-slate-600 bg-slate-50">SYMBOL</TableColumn>
              <TableColumn className="text-sm font-semibold text-slate-600 bg-slate-50">TYPE</TableColumn>
              <TableColumn className="text-sm font-semibold text-slate-600 bg-slate-50">NAME</TableColumn>
              <TableColumn className="text-sm font-semibold text-slate-600 bg-slate-50">PRICE</TableColumn>
              <TableColumn className="text-sm font-semibold text-slate-600 bg-slate-50">24H HIGH</TableColumn>
              <TableColumn className="text-sm font-semibold text-slate-600 bg-slate-50">24H LOW</TableColumn>
              <TableColumn className="text-sm font-semibold text-slate-600 bg-slate-50">VOLUME</TableColumn>
              <TableColumn className="text-sm font-semibold text-slate-600 bg-slate-50 text-right">ACTIONS</TableColumn>
            </TableHeader>

            <TableBody>
              {filteredAssets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-slate-400">
                    <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <p>No assets found</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAssets.map((asset) => (
                  <TableRow key={asset.symbol} className="hover:bg-slate-50 transition-colors">
                    <TableCell className="font-bold text-primary-600">{asset.symbol}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        {asset.type ?? "STOCK"}
                      </span>
                    </TableCell>
                    <TableCell className="text-slate-700">{asset.name}</TableCell>
                    <TableCell className="font-semibold text-slate-800">${asset.price?.toLocaleString() ?? "-"}</TableCell>
                    <TableCell className="text-emerald-600">${asset.high?.toLocaleString() ?? "-"}</TableCell>
                    <TableCell className="text-rose-600">${asset.low?.toLocaleString() ?? "-"}</TableCell>
                    <TableCell className="text-slate-600">{asset.volume?.toLocaleString() ?? "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          className="rounded-lg bg-primary-50 text-primary-700 hover:bg-primary-100 font-medium px-4"
                          onClick={() => handleBuy(asset.symbol)}
                        >
                          Buy
                        </Button>
                        <Button
                          size="sm"
                          variant="flat"
                          className="rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium px-3"
                          onClick={() => handleRefresh(asset.symbol)}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
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

