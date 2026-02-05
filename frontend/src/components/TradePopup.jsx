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

  const isBuy = tradeType === "buy";

  return (
    // Backdrop overlay
    <div
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      {/* Modal content */}
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isBuy ? 'bg-emerald-50' : 'bg-rose-50'}`}>
              {isBuy ? (
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              )}
            </div>
            <div>
              <h2 className={`text-xl font-bold ${isBuy ? "text-slate-800" : "text-slate-800"}`}>
                {isBuy ? "Buy Asset" : "Sell Asset"}
              </h2>
              <p className="text-sm text-slate-500">
                {isBuy ? "Add to your portfolio" : "Remove from your portfolio"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-700 hover:bg-slate-200 flex items-center justify-center transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form fields */}
        <div className="space-y-5">
          {/* Symbol field */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Asset Symbol
            </label>
            <div className="relative">
              <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                placeholder="e.g., AAPL"
                className={`w-full px-4 py-3 bg-slate-50 border ${isBuy ? 'border-slate-200 focus:ring-emerald-500 focus:border-emerald-500' : 'border-slate-200 focus:ring-rose-500 focus:border-rose-500'} rounded-xl focus:outline-none focus:ring-2 transition-all text-lg font-semibold uppercase placeholder:text-slate-400`}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-slate-400 text-sm">
                  {symbol ? '🔍' : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Quantity field */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Quantity
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center transition-colors font-bold text-lg"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-lg font-semibold text-center"
              />
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center transition-colors font-bold text-lg"
              >
                +
              </button>
            </div>
          </div>

          {/* Quick quantity buttons */}
          <div className="flex gap-2">
            {[1, 5, 10, 25, 50, 100].map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setQuantity(q)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  quantity === q 
                    ? 'bg-primary-100 text-primary-700 border border-primary-200' 
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Estimated total</span>
            <span className="font-bold text-slate-800 text-lg">
              {symbol ? `~${symbol}` : '-'}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!symbol || quantity < 1}
            className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all ${
              isBuy
                ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200"
                : "bg-rose-600 text-white hover:bg-rose-700 shadow-lg shadow-rose-200"
            } disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none`}
          >
            {isBuy ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Buy {quantity} {quantity === 1 ? 'share' : 'shares'}
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
                Sell {quantity} {quantity === 1 ? 'share' : 'shares'}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

