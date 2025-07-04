import React, { useState, useEffect, useCallback, useMemo } from "react";
import ProductCard from "./components/ProductCard";
import ProductDetailModal from "./components/ProductDetailModal";
import PaginationControls from "./components/PaginationControls";
import Navbar from "./Navbar";

const ITEMS_PER_PAGE = 20;

export default function ProdukList() {
  const [allProducts, setAllProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState("All");

  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("default");

  const fetchAllProducts = useCallback(async (genre = "All") => {
    setLoading(true);
    setError(null);
    try {
      let url = "http://localhost:3001/products";
      if (genre !== "All") {
        url += `?genre=${encodeURIComponent(genre)}`;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const rawProductsArray = await response.json();

      const formattedProducts = rawProductsArray.map((item, index) => ({
        id: item.id || `prod-${index}`,
        nama: item.namaProduk || item.nama,
        img: item.imgProduk || item.img,
        harga: item.hargaProduk || item.harga,
        deskripsi: item.deskripsiProduk || item.deskripsi,
        rating: item.rating || 0,
        stock: item.Stock || item.stock || "N/A",
        genre: item.genre || "Uncategorized",
      }));

      setAllProducts(formattedProducts);
      setCurrentPage(1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllProducts(selectedGenre);
  }, [fetchAllProducts, selectedGenre]);

  useEffect(() => {
    if (allProducts.length > 0) {
      const uniqueGenres = ["All", ...new Set(allProducts.map((p) => p.genre))];
      setGenres(uniqueGenres.sort());
    }
  }, [allProducts]);

  const displayedProducts = useMemo(() => {
    let filtered = [...allProducts].filter((product) =>
      product.nama.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const parseHarga = (harga) => {
      if (!harga || typeof harga !== "string") return 0;
      const cleaned = harga.replace(/[^0-9]/g, "");
      return parseInt(cleaned, 10) || 0;
    };

    switch (sortOption) {
      case "price-asc":
        filtered.sort((a, b) => parseHarga(a.harga) - parseHarga(b.harga));
        break;
      case "price-desc":
        filtered.sort((a, b) => parseHarga(b.harga) - parseHarga(a.harga));
        break;
      case "name-asc":
        filtered.sort((a, b) => a.nama.localeCompare(b.nama));
        break;
      case "name-desc":
        filtered.sort((a, b) => b.nama.localeCompare(a.nama));
        break;
      default:
        break;
    }

    const total = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    setTotalPages(total);

    // Reset ke halaman pertama jika currentPage > total
    if (currentPage > total && total > 0) {
      setCurrentPage(1);
    }

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [allProducts, currentPage, searchQuery, sortOption]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleGenreSelect = (genre) => {
    setSelectedGenre(genre);
    setCurrentPage(1);
  };

  const pageTitle =
    selectedGenre === "All" ? "📚 Semua Produk" : `📂 Kategori: ${selectedGenre}`;

  return (
    <>
      <Navbar
        onSearch={(val) => {
          setSearchQuery(val);
          setCurrentPage(1);
        }}
        genres={genres}
        selectedGenre={selectedGenre}
        onGenreSelect={handleGenreSelect}
      />

      <div className="pt-28 px-4 sm:px-6 lg:px-10">
        {/* Header & Filter */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{pageTitle}</h1>
            <p className="text-sm text-gray-500">Menampilkan hasil pencarian dan kategori</p>
          </div>

          {/* Filter Dropdown */}
          <div className="w-full md:w-auto">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="w-full md:w-auto border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="default">Urutkan</option>
              <option value="price-asc">Harga: Rendah ke Tinggi</option>
              <option value="price-desc">Harga: Tinggi ke Rendah</option>
              <option value="name-asc">Nama: A-Z</option>
              <option value="name-desc">Nama: Z-A</option>
            </select>
          </div>
        </div>

        {/* Loading & Error */}
        {loading && (
          <div className="text-center text-lg text-blue-500 font-semibold py-10 animate-pulse">
            Memuat data produk...
          </div>
        )}
        {error && (
          <div className="text-center text-red-600 font-semibold py-10">
            Terjadi kesalahan: {error}
          </div>
        )}

        {/* Produk Grid */}
        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {displayedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onClick={() => setSelectedProduct(product)}
                />
              ))}
            </div>

            {displayedProducts.length === 0 && (
              <div className="text-center text-gray-500 italic mt-10">
                Tidak ada produk yang cocok.
              </div>
            )}

            {displayedProducts.length > 0 && totalPages > 1 && (
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}

            {selectedProduct && (
              <ProductDetailModal
                product={selectedProduct}
                onClose={() => setSelectedProduct(null)}
              />
            )}
          </>
        )}
      </div>
    </>
  );
}