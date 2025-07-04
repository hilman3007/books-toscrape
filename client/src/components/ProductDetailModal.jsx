// client/src/components/ProductDetailModal.jsx
import React from "react";

const ProductDetailModal = ({ product, onClose }) => {
  if (!product) return null;

  // Destrukturisasi semua properti produk yang relevan
  const { nama, img, harga, deskripsi, rating, stock, genre } = product; // Tambahkan rating, stock, genre

  const Stock = stock && stock.includes("In stock");

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 text-3xl font-bold z-10"
          aria-label="Close"
        >
          &times;
        </button>

        <h2 className="text-3xl font-bold mb-4 pr-10">{nama}</h2>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Bagian Gambar */}
          <div className="md:w-1/2 flex justify-center items-center p-2 bg-gray-100 rounded-md">
            <img
              src={img}
              alt={nama}
              className="max-w-full max-h-64 object-contain"
            />
          </div>

          {/* Bagian Detail Teks */}
          <div className="md:w-1/2">
            <p className="text-2xl font-bold text-green-600 mb-2">{harga}</p>

            {/* Tampilkan Rating di Modal */}
            {rating !== undefined && rating !== null && (
              <div className="flex items-center mb-2">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-5 h-5 ${
                      i < rating ? "text-yellow-400" : "text-gray-300"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            )}

            {/* Tampilkan Status In Stock di Modal */}
            {stock && ( // Pastikan properti 'stock' ada
              <p
                className={`text-base font-medium ${
                  Stock ? "text-green-600" : "text-red-600"
                } mb-2`}
              >
                {stock} {/* Menampilkan string stock secara langsung */}
              </p>
            )}

            {/* Tampilkan Genre di Modal */}
            {genre && (
              <p className="text-base text-gray-700 mb-4">
                Genre: <span className="font-semibold">{genre}</span>
              </p>
            )}

            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Deskripsi:
            </h3>
            <p className="text-gray-600 leading-relaxed text-base max-h-48 overflow-y-auto whitespace-pre-wrap">
              {deskripsi}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
