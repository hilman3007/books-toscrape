// client/src/components/ProductCard.jsx
import React from "react";

const ProductCard = ({ product, onClick }) => {
  // Destructuring props, termasuk string stock mentah
  const { nama, harga, img, rating, stock } = product;

  // Tentukan warna berdasarkan apakah string 'In stock' ada di dalamnya
  const Stock = stock && stock.includes("In stock");

  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1 flex flex-col"
      onClick={() => onClick(product)}
    >
      {/* Kontainer Gambar Produk dengan tinggi tetap */}
      <div className="w-full h-48 flex items-center justify-center bg-gray-100 p-4">
        <img
          src={img}
          alt={nama}
          className="max-h-full max-w-full object-contain"
        />
      </div>

      {/* Informasi Produk (Judul, Harga, Rating, Stock) */}
      <div className="p-4 flex flex-col justify-between flex-grow">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
            {nama}
          </h3>
          <p className="text-xl font-bold text-green-600 mb-2">{harga}</p>

          {/* Bagian Rating Bintang */}
          {rating !== undefined && rating !== null && (
            <div className="flex items-center mb-2">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-4 h-4 ${
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

          {/* Bagian Status In Stock dengan Keterangan */}
          {stock && ( // Pastikan stock memiliki nilai
            <p
              className={`text-sm font-medium ${
                Stock ? "text-green-500" : "text-red-500"
              }`}
            >
              {stock} {/* Tampilkan string stock mentah */}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
