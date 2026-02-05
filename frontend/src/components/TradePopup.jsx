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
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      {/* Modal content */}
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2
            className={`text-xl font-semibold ${
              tradeType === "buy" ? "text-success-600" : "text-danger-600"
            }`}
          >
            {tradeType === "buy" ? "Buy Asset" : "Sell Asset"}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-2xl leading-none transition-colors"
          >
            ×
          </button>
        </div>

        {/* Form fields */}
        <div className="space-y-4">
          {/* Symbol field */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Symbol
            </label>
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              placeholder="e.g., AAPL"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
            />
          </div>

          {/* Quantity field */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Quantity
            </label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 mt-8">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-lg font-medium hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!symbol || quantity < 1}
            className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors ${
              tradeType === "buy"
                ? "bg-success-500 text-white hover:bg-success-600"
                : "bg-danger-500 text-white hover:bg-danger-600"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {tradeType === "buy" ? "Buy" : "Sell"}
          </button>
        </div>
      </div>
    </div>
  );
}

