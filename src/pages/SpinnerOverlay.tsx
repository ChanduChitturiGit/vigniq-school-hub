import { LoaderCircle } from "lucide-react";
import "../App.css";

export const SpinnerOverlay = () => {
  return (
    <div className="overlay">
      <LoaderCircle className="spinner-icon" size={40} />
    </div>
  );
};
