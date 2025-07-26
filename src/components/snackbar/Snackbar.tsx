import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

type SnackbarStatus = "success" | "error";

interface SnackbarProps {
  title: string;
  description: string;
  status: SnackbarStatus;
  onClose: () => void;
}

const Snackbar: React.FC<SnackbarProps> = ({ title, description, status, onClose }) => {
  const [progressWidth, setProgressWidth] = useState("0%");

  useEffect(() => {
    // Start progress animation after component mounts
    const startProgress = setTimeout(() => {
      setProgressWidth("100%");
    }, 100); // slight delay to trigger transition

    // Auto-dismiss after 10s
    const autoClose = setTimeout(() => {
      onClose();
    }, 10000);

    return () => {
      clearTimeout(autoClose);
      clearTimeout(startProgress);
    };
  }, [onClose]);

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[320px] bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      <div className="flex justify-between items-start p-4">
        <div>
          <h3 className="text-base font-semibold">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
          <X size={16} />
        </button>
      </div>

      {/* Animated Progress Bar */}
      <div className="h-1 w-full bg-gray-200">
        <div
          style={{
            width: progressWidth,
            transition: "width 10s linear",
          }}
          className={`h-full ${
            status === "success" ? "bg-green-500" : "bg-red-500"
          }`}
        ></div>
      </div>
    </div>
  );
};

export default Snackbar;
