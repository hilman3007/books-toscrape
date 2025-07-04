// client/src/components/NotificationDisplay.jsx
import React, { useEffect, useState } from "react";

const NotificationDisplay = ({ message, type, id, onClose, duration }) => {
  const [isVisible, setIsVisible] = useState(true);

  // useEffect untuk membuat notifikasi hilang otomatis setelah 'duration'
  useEffect(() => {
    // Pastikan duration adalah angka yang valid sebelum mengatur timer
    if (typeof duration === "number" && duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false); // Memulai transisi fade-out
        const removeTimer = setTimeout(() => {
          onClose(id); // Menghapus notifikasi dari state setelah transisi selesai
        }, 300); // Sesuaikan dengan durasi transisi CSS (transition-opacity duration-300)
        return () => clearTimeout(removeTimer);
      }, duration);

      return () => clearTimeout(timer); // Membersihkan timer jika komponen unmount
    }
  }, [id, onClose, duration]);

  const notificationClasses = {
    success: "bg-green-500 text-gray-800",
    error: "bg-red-500 text-gray-800",
    info: "bg-blue-500 text-gray-800",
    warning: "bg-yellow-500 text-gray-800",
  };

  // Gunakan isVisible untuk mengontrol opacity
  const baseClasses = `p-3 rounded-md shadow-lg mb-3 flex items-center justify-between transition-opacity duration-300 ${
    isVisible ? "opacity-100" : "opacity-0"
  }`;

  return (
    <div
      className={`${baseClasses} ${
        notificationClasses[type] || notificationClasses.info
      }`}
    >
      <span>{message}</span>
      <button
        onClick={() => {
          setIsVisible(false); // Memulai transisi fade-out saat tombol 'X' diklik
          setTimeout(() => onClose(id), 300); // Menghapus notifikasi setelah transisi
        }}
        className="ml-4 text-xl font-bold leading-none"
        aria-label="Close notification"
      >
        &times;
      </button>
    </div>
  );
};

export default NotificationDisplay;
