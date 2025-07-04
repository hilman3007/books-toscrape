// client/src/ProdukList.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import ProductCard from "./components/ProductCard";
import ProductDetailModal from "./components/ProductDetailModal";
import PaginationControls from "./components/PaginationControls";
import NotificationDisplay from "./components/NotificationDisplay";
import LogDisplayModal from "./components/LogDisplayModal"; // Sudah diimpor

const ITEMS_PER_PAGE = 20;

function ProdukList() {
  const [allProducts, setAllProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // --- STATE UNTUK NOTIFIKASI ---
  const [notifications, setNotifications] = useState([]);

  // --- STATE UNTUK LOG DETAIL ---
  const [showCacatModal, setShowCacatModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [logCacatData, setLogCacatData] = useState([]);
  const [logUpdateData, setLogUpdateData] = useState([]);

  // --- FUNGSI UNTUK MENAMBAH NOTIFIKASI ---
  // Default duration adalah 5000ms (5 detik) jika tidak diberikan
  const addNotification = useCallback(
    (message, type = "info", duration = 5000) => {
      const id = Date.now();
      setNotifications((prevNotifications) => {
        const newNotifications = [
          ...prevNotifications,
          { id, message, type, duration },
        ];
        console.log("Notification added:", { id, message, type, duration });
        return newNotifications;
      });
    },
    []
  );

  // --- FUNGSI UNTUK MENGHAPUS NOTIFIKASI ---
  const removeNotification = useCallback((id) => {
    setNotifications((prevNotifications) => {
      console.log("Attempting to remove notification with ID:", id);
      const remainingNotifications = prevNotifications.filter(
        (notif) => notif.id !== id
      );
      console.log("Notifications after filter:", remainingNotifications);
      return remainingNotifications;
    });
  }, []);

  // Fungsi untuk mengambil semua data produk dari backend
  const fetchAllProducts = useCallback(
    async (genre = "All") => {
      setLoading(true);
      setError(null);
      try {
        let url = "http://localhost:3001/products";
        if (genre !== "All") {
          url += `?genre=${encodeURIComponent(genre)}`;
        }

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const rawProductsArray = await response.json();
        console.log(
          "Data diterima dari backend (Array produk):",
          rawProductsArray
        );

        if (!Array.isArray(rawProductsArray)) {
          throw new Error("Data produk yang diterima bukan array.");
        }

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
        setTotalPages(Math.ceil(formattedProducts.length / ITEMS_PER_PAGE));
        setCurrentPage(1);
      } catch (err) {
        console.error("Gagal mengambil data produk:", err);
        setError(err.message);
        addNotification(
          `Gagal mengambil data produk: ${err.message}. Pastikan server backend berjalan.`,
          "error"
        );
      } finally {
        setLoading(false);
      }
    },
    [addNotification]
  );

  // --- FUNGSI UNTUK MEMICU DAN MENAMPILKAN NOTIFIKASI SCRAPING & LOG DETAIL ---
  const triggerScrapingAndNotify = useCallback(async () => {
    setLoading(true);
    // Reset log data saat scraping dimulai
    setLogCacatData([]);
    setLogUpdateData([]);

    try {
      const response = await fetch("http://localhost:3001/scrape");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const dataStatusScrape = await response.json(); // Respons status scraping

      if (dataStatusScrape.success) {
        const details = dataStatusScrape.data;
        let fullMessage =
          dataStatusScrape.message || "Scraping berhasil diselesaikan.";

        // Tambahkan detail statistik ke notifikasi utama
        if (details) {
          fullMessage += ` (Valid: ${details.totalValid || 0}`;
          if (details.totalCacat > 0) {
            fullMessage += `, Cacat: ${details.totalCacat}`;
          }
          if (details.totalDiupdate > 0) {
            fullMessage += `, Diupdate: ${details.totalDiupdate}`;
          }
          fullMessage += `)`;
        }
        console.log("Adding main scraping notification:", fullMessage);
        addNotification(fullMessage, "success", 5000); // Notifikasi ini hilang setelah 5 detik

        // Set data log cacat jika ada
        if (
          details &&
          Array.isArray(details.logCacat) &&
          details.logCacat.length > 0
        ) {
          setLogCacatData(details.logCacat);
          addNotification(
            `Ditemukan ${details.logCacat.length} produk cacat. Klik "Lihat Cacat" untuk detail.`,
            "error",
            5000
          ); // Notifikasi ini juga hilang
        } else {
          addNotification("Tidak ditemukan produk cacat.", "info", 3000);
        }

        // Set data log update jika ada
        if (
          details &&
          Array.isArray(details.logUpdate) &&
          details.logUpdate.length > 0
        ) {
          setLogUpdateData(details.logUpdate);
          addNotification(
            `Ditemukan ${details.logUpdate.length} produk diupdate. Klik "Lihat Update" untuk detail.`,
            "info",
            5000
          ); // Notifikasi ini juga hilang
        } else {
          addNotification("Tidak ditemukan produk diupdate.", "info", 3000);
        }

        // Setelah scraping selesai dan berhasil, muat ulang daftar produk
        fetchAllProducts(selectedGenre);
      } else {
        addNotification(
          dataStatusScrape.message || "Operasi selesai dengan peringatan.",
          "warning"
        );
      }
    } catch (err) {
      addNotification(`Gagal memicu scraping: ${err.message}`, "error");
      console.error("Error triggering scrape:", err);
    } finally {
      setLoading(false);
    }
  }, [addNotification, fetchAllProducts, selectedGenre]);

  // Effect untuk mengambil produk saat komponen dimuat atau genre berubah
  useEffect(() => {
    fetchAllProducts(selectedGenre);
  }, [fetchAllProducts, selectedGenre]);

  // Effect untuk mengambil daftar genre unik
  useEffect(() => {
    if (allProducts.length > 0) {
      const uniqueGenres = ["All", ...new Set(allProducts.map((p) => p.genre))];
      setGenres(uniqueGenres.sort());
    }
  }, [allProducts]);

  const displayedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return allProducts.slice(startIndex, endIndex);
  }, [allProducts, currentPage, ITEMS_PER_PAGE]);

  const handlePageChange = useCallback(
    (page) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [totalPages]
  );

  const handleProductClick = (product) => {
    setSelectedProduct(product);
  };

  const handleCloseDetail = () => {
    setSelectedProduct(null);
  };

  const handleGenreSelect = (genre) => {
    setSelectedGenre(genre);
    setIsSidebarOpen(false);
  };

  const pageTitle =
    selectedGenre === "All"
      ? "All Produk"
      : `Produk Kategori: ${selectedGenre}`;

  if (loading) {
    return <div className="text-center p-8 text-xl">Memuat data produk...</div>;
  }

  if (error) {
    return (
      <div className="text-center p-8 text-red-600 text-xl">
        Error: {error}. Pastikan server backend Anda berjalan dan database
        terhubung.
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-gray-50">
      {/* --- CONTAINER NOTIFIKASI --- */}
      {/* Telah diubah di langkah sebelumnya untuk pointer-events */}
      <div className="fixed top-4 right-4 z-50 w-full max-w-xs p-2">
        {notifications.map((notification) => (
          <NotificationDisplay
            key={notification.id}
            id={notification.id}
            message={notification.message}
            type={notification.type}
            onClose={removeNotification}
            duration={notification.duration}
          />
        ))}
      </div>
      {/* --- AKHIR CONTAINER NOTIFIKASI --- */}

      {/* Sidebar */}
      <div
        className={`
        bg-white text-gray-800
        w-64 h-full flex flex-col z-40
        transition-transform duration-300 ease-in-out
        ${
          isSidebarOpen
            ? "fixed inset-y-0 left-0 translate-x-0"
            : "fixed inset-y-0 left-0 -translate-x-full"
        }
        md:static md:translate-x-0 md:shadow-none md:flex-shrink-0
        overflow-y-auto
      `}
        style={{ boxShadow: "0 0 10px rgba(0,0,0,0.04)" }}
      >
        <div className="p-4 flex justify-between items-center md:hidden flex-shrink-0">
          <h2 className="text-2xl font-bold">Menu</h2>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="text-gray-700 text-3xl"
          >
            &times;
          </button>
        </div>
        <div className="p-4 flex-grow overflow-y-auto">
          <h3 className="text-xl font-bold mb-4">Kategori</h3>
          <ul>
            {genres.map((genre) => (
              <li key={genre} className="mb-2">
                <button
                  onClick={() => handleGenreSelect(genre)}
                  className={`block w-full text-left py-2 px-4 rounded-md transition-colors ${
                    selectedGenre === genre
                      ? "bg-blue-600 font-semibold text-gray-800"
                      : "hover:bg-gray-200"
                  }`}
                >
                  {genre}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-4 overflow-y-auto">
        <button
          onClick={triggerScrapingAndNotify}
          className="mb-4 p-2 bg-purple-500 text-gray-800 rounded hover:bg-purple-600"
        >
          Mulai Scraping & Perbarui Produk
        </button>

        {/* --- TOMBOL UNTUK MEMBUKA MODAL LOG DETAIL --- */}
        {/* Tambahkan `pointer-events-auto` pada tombol ini agar bisa diklik */}
        {logCacatData.length > 0 && (
          <button
            onClick={() => setShowCacatModal(true)}
            className="mb-2 p-2 bg-red-500 text-gray-800 rounded hover:bg-red-600 pointer-events-auto"
          >
            Lihat Produk Cacat ({logCacatData.length})
          </button>
        )}
        {logUpdateData.length > 0 && (
          <button
            onClick={() => setShowUpdateModal(true)}
            className="mb-4 p-2 bg-blue-500 text-gray-800 rounded hover:bg-blue-600 pointer-events-auto"
          >
            Lihat Produk Diupdate ({logUpdateData.length})
          </button>
        )}
        {/* --- AKHIR TOMBOL LOG DETAIL --- */}

        <button
          onClick={() => setIsSidebarOpen(true)}
          className="md:hidden p-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 mb-4 focus:outline-none focus:ring-2 focus:ring-gray-400"
          aria-label="Open menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            ></path>
          </svg>
        </button>
        <h1 className="text-3xl font-bold mb-6 text-center">{pageTitle}</h1>
        {allProducts.length === 0 && !loading && (
          <div className="text-center p-8 text-gray-600 text-xl">
            Tidak ada produk ditemukan untuk kategori ini.
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={handleProductClick}
            />
          ))}
        </div>
        {totalPages > 1 && (
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
        {selectedProduct && (
          <ProductDetailModal
            product={selectedProduct}
            onClose={handleCloseDetail}
          />
        )}
      </div>

      {/* --- MODAL UNTUK MENAMPILKAN LOG CACAT --- */}
      <LogDisplayModal
        isOpen={showCacatModal}
        onClose={() => setShowCacatModal(false)}
        title="Detail Produk Cacat"
        logs={logCacatData}
        logType="cacat"
      />

      {/* --- MODAL UNTUK MENAMPILKAN LOG DIUPDATE --- */}
      <LogDisplayModal
        isOpen={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        title="Detail Produk Diupdate"
        logs={logUpdateData}
        logType="update"
      />
    </div>
  );
}

export default ProdukList;
