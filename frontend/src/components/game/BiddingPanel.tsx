import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface BiddingPanelProps {
  maxBid: number;
  onSubmitBid: (bid: number) => void;
  isSubmitting: boolean;
}

export const BiddingPanel: React.FC<BiddingPanelProps> = ({
  maxBid,
  onSubmitBid,
  isSubmitting,
}) => {
  const [bid, setBid] = useState(0);

  const handleSubmit = () => {
    if (bid < 0 || bid > maxBid) return;
    onSubmitBid(bid);
  };

  return (
    <motion.div
      className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-6 mb-6"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="text-lg font-semibold mb-4 text-yellow-900">
        Make Your Bid
      </div>

      <div className="flex items-center gap-4">
        <label className="text-sm text-gray-700">
          How many tricks will you win?
        </label>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setBid(Math.max(0, bid - 1))}
            className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded"
            disabled={isSubmitting}
          >
            -
          </button>

          <input
            type="number"
            value={bid}
            onChange={(e) => setBid(Math.max(0, Math.min(maxBid, parseInt(e.target.value) || 0)))}
            className="w-16 text-center border border-gray-300 rounded px-2 py-1"
            min={0}
            max={maxBid}
            disabled={isSubmitting}
          />

          <button
            onClick={() => setBid(Math.min(maxBid, bid + 1))}
            className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded"
            disabled={isSubmitting}
          >
            +
          </button>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-medium disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Bid'}
        </button>
      </div>
    </motion.div>
  );
};
