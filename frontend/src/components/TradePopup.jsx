import { useState, useEffect } from "react";

export default function TradePopup({ isOpen, tradeType, initialSymbol, onClose, onConfirm }) {
  const [symbol, setSymbol] = useState("");
  const [quantity, setQuantity] = useState(1);

  // Initialize values when popup opens
  useEffect(() => {
    if (isOpen) {
      setSymbol(initialSymbol || "");
      setQuantity(1);
    }
  }, [isOpen, initialSymbol]);

  // Don't render if closed
  if (!isOpen) return null;

  const handleConfirm = () => {
    if (symbol && quantity > 0) {
      onConfirm(symbol, quantity);
      onClose();
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    // Backdrop overlay
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      {/* Modal content */}
      <div className="!bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4 transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2
            className={`text-2xl font-bold ${
              tradeType === "buy" ? "text-green-600" : "text-red-600"
            }`}
          >
            {tradeType === "buy" ? "Buy Asset" : "Sell Asset"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none transition-colors"
          >
            ×
          </button>
        </div>

        {/* Form fields */}
        <div className="space-y-4">
          {/* Symbol field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Symbol
            </label>
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              placeholder="e.g., AAPL"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all text-lg"
            />
          </div>

          {/* Quantity field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity
            </label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all text-lg"
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 mt-8">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!symbol || quantity < 1}
            className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-colors ${
              tradeType === "buy"
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-red-600 text-white hover:bg-red-700"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {tradeType === "buy" ? "Buy" : "Sell"}
          </button>
        </div>
      </div>
    </div>
  );
}

