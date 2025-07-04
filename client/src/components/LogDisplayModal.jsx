// client/src/components/LogDisplayModal.jsx
import React from "react";

// --- Komponen Card untuk Log Cacat ---
const CacatLogCard = ({ log }) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-3 shadow-sm">
    <h4 className="font-semibold text-red-700 text-lg mb-2">
      {log.namaProduk || "Nama Produk Tidak Diketahui"}
    </h4>
    <p className="text-sm text-red-600 mb-1">
      URL:{" "}
      <a
        href={log.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline"
      >
        {log.url}
      </a>
    </p>
    <p className="text-sm text-red-600 mb-1">Harga: {log.hargaProduk}</p>
    <p className="text-sm text-red-600 mb-1">
      Deskripsi:{" "}
      {log.deskripsiProduk === "-"
        ? "Tidak Ada Deskripsi"
        : log.deskripsiProduk.length > 150
        ? log.deskripsiProduk.substring(0, 150) + "..."
        : log.deskripsiProduk}
    </p>{" "}
    {/* Batasi panjang deskripsi */}
    <p className="text-sm text-red-600 mb-1">Genre: {log.genre}</p>
    <p className="text-sm text-red-600 mb-1">Rating: {log.rating} Bintang</p>
    <p className="text-sm text-red-600">Stok: {log.stock}</p>
    {log.error && (
      <p className="text-red-800 font-medium mt-2">Error: {log.error}</p>
    )}
  </div>
);

// --- Komponen Card untuk Log Update (REVISI) ---
const UpdateLogCard = ({ log }) => {
  const { nama, perubahan } = log;
  const { dari, ke } = perubahan;

  // Mendapatkan semua kunci dari objek 'dari' dan 'ke' untuk memastikan semua properti diperiksa
  const allKeys = [...new Set([...Object.keys(dari), ...Object.keys(ke)])];

  const changedProperties = allKeys.filter((key) => {
    // Khusus untuk deskripsi, kita perlu membandingkan konten tanpa spasi ekstra di akhir/awal atau newlines
    if (key === "deskripsi") {
      const descDari = (dari[key] || "").trim().replace(/\s+/g, " ");
      const descKe = (ke[key] || "").trim().replace(/\s+/g, " ");
      return descDari !== descKe;
    }
    return dari[key] !== ke[key];
  });

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-3 shadow-sm">
      <h4 className="font-semibold text-blue-700 text-lg mb-4">
        Produk Diupdate: {nama}
      </h4>

      {changedProperties.length === 0 ? (
        <p className="text-gray-700">
          Tidak ada perubahan signifikan yang terdeteksi.
        </p>
      ) : (
        <div className="space-y-3">
          {" "}
          {/* Menggunakan space-y untuk jarak antar bagian perubahan */}
          {changedProperties.map((key) => {
            // Penanganan khusus untuk properti 'img'
            if (key === "img") {
              return (
                <div key={key} className="p-3 bg-white rounded-md shadow-sm">
                  <p className="font-bold text-gray-700 mb-2">
                    Perubahan Gambar:
                  </p>
                  <div className="flex flex-col sm:flex-row justify-around items-center gap-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Sebelum:</p>
                      {dari.img ? (
                        <img
                          src={dari.img}
                          alt="Gambar Sebelumnya"
                          className="w-24 h-24 object-contain rounded mt-1"
                        />
                      ) : (
                        <span className="text-xs text-gray-400">
                          Tidak ada gambar
                        </span>
                      )}
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-green-700">
                        Sesudah:
                      </p>
                      {ke.img ? (
                        <img
                          src={ke.img}
                          alt="Gambar Sesudah"
                          className="w-24 h-24 object-contain rounded mt-1"
                        />
                      ) : (
                        <span className="text-xs text-gray-400">
                          Tidak ada gambar
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            }

            // Penanganan khusus untuk properti 'deskripsi'
            if (key === "deskripsi") {
              const descDari = (dari.deskripsi || "")
                .trim()
                .replace(/\s+/g, " ");
              const descKe = (ke.deskripsi || "").trim().replace(/\s+/g, " ");
              return (
                <div key={key} className="p-3 bg-white rounded-md shadow-sm">
                  <p className="font-bold text-gray-700 mb-2">
                    Perubahan Deskripsi:
                  </p>
                  <p className="text-sm text-gray-500 mb-1">
                    Sebelum:{" "}
                    {descDari.length > 200
                      ? descDari.substring(0, 200) + "..."
                      : descDari || "Tidak ada deskripsi"}
                  </p>
                  <p className="text-sm font-semibold text-green-700">
                    Sesudah:{" "}
                    {descKe.length > 200
                      ? descKe.substring(0, 200) + "..."
                      : descKe || "Tidak ada deskripsi"}
                  </p>
                </div>
              );
            }

            // Untuk properti lain
            return (
              <div key={key} className="p-3 bg-white rounded-md shadow-sm">
                <p className="font-bold text-gray-700 mb-1">
                  Perubahan {key.charAt(0).toUpperCase() + key.slice(1)}:
                </p>
                <p className="text-sm text-gray-500">
                  Sebelum: {dari[key] || "-"}
                </p>
                <p className="text-sm font-semibold text-green-700">
                  Sesudah: {ke[key] || "-"}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// --- Komponen Modal Utama (LogDisplayModal) ---
const LogDisplayModal = ({ isOpen, onClose, title, logs, logType }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {" "}
        {/* Max width lebih besar */}
        {/* Modal Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold leading-none"
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>
        {/* Modal Body */}
        <div className="p-4 overflow-y-auto flex-grow text-gray-700">
          {logs && logs.length > 0 ? (
            <div>
              {logs.map((log, index) => (
                <React.Fragment key={index}>
                  {logType === "cacat" && <CacatLogCard log={log} />}
                  {logType === "update" && <UpdateLogCard log={log} />}
                </React.Fragment>
              ))}
            </div>
          ) : (
            <p>Tidak ada data log yang tersedia.</p>
          )}
        </div>
        {/* Modal Footer */}
        <div className="p-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 text-gray-800 rounded hover:bg-blue-600"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogDisplayModal;
