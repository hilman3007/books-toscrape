// client/src/components/PaginationControls.jsx
import React from "react";

const PaginationControls = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="flex justify-center items-center space-x-4 mt-8 mb-4">
      {/* Tombol Previous */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-6 py-3 bg-gray-500 text-white rounded-lg shadow-md hover:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
      >
        Previous
      </button>

      {/* Indikator Halaman */}
      <span className="text-lg font-semibold text-gray-700">
        Page {currentPage} of {totalPages}
      </span>

      {/* Tombol Next */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-6 py-3 bg-black text-white rounded-lg shadow-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2"
      >
        Next
      </button>
    </div>
  );
};

export default PaginationControls;
