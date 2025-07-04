import React, { useState } from "react";
import { ChevronDown, ShoppingCart } from "lucide-react";

export default function Navbar({ onSearch, genres, selectedGenre, onGenreSelect }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchText, setSearchText] = useState("");

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchText(value);
    if (onSearch) onSearch(value);
  };

  return (
    <nav className="bg-white text-black shadow-md z-50 fixed top-0 left-0 w-full">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap md:flex-nowrap items-center justify-between gap-4">
        {/* Logo */}
        <div className="text-2xl font-extrabold text-blue-700 tracking-wide flex-shrink-0">
          TokoBuku
        </div>

        {/* Kategori + Search + Cart */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 flex-grow w-full">
          {/* Dropdown Kategori */}
          <div className="relative w-full sm:w-auto">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-full sm:w-auto flex items-center justify-between gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
            >
              <span className="truncate">
                {selectedGenre === "All" ? "Kategori" : selectedGenre}
              </span>
              <ChevronDown className="w-4 h-4" />
            </button>

            {showDropdown && (
              <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                {genres.map((genre) => (
                  <button
                    key={genre}
                    onClick={() => {
                      onGenreSelect(genre);
                      setShowDropdown(false);
                    }}
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition ${
                      selectedGenre === genre ? "font-semibold text-blue-700" : ""
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search Bar */}
          <div className="relative flex-grow min-w-0">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 18.5a7.5 7.5 0 006.15-3.85z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Cari produk..."
              value={searchText}
              onChange={handleSearch}
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          {/* Cart Icon */}
          <button
            className="relative p-2 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition"
            aria-label="Cart"
          >
            <ShoppingCart className="h-5 w-5 text-gray-700" />
          </button>
        </div>

        {/* Auth Buttons */}
        <div className="flex gap-2 w-full sm:w-auto justify-end">
          <a
            href="#"
            className="text-white px-4 py-2 bg-blue-700 rounded-lg font-semibold hover:bg-blue-800 transition w-full sm:w-auto text-center"
          >
            Daftar
          </a>
          <a
            href="#"
            className="border border-gray-500 rounded-lg px-4 py-2 font-semibold text-gray-800 hover:bg-gray-100 transition w-full sm:w-auto text-center"
          >
            Masuk
          </a>
        </div>
      </div>
    </nav>
  );
}