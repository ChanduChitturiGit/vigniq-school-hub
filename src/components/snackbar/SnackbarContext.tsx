import React, { createContext, useContext, useState, ReactNode } from "react";
import Snackbar from "./Snackbar";

type SnackbarStatus = "success" | "error";

interface SnackbarData {
  title: string;
  description: string;
  status: SnackbarStatus;
}

interface SnackbarContextType {
  showSnackbar: (data: SnackbarData) => void;
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

export const useSnackbar = () => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error("useSnackbar must be used within a SnackbarProvider");
  }
  return context;
};

export const SnackbarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [snackbar, setSnackbar] = useState<SnackbarData | null>(null);

  const showSnackbar = (data: SnackbarData) => {
    setSnackbar(data);
  };

  const handleClose = () => {
    setSnackbar(null);
  };

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      {snackbar && (
        <Snackbar
          title={snackbar.title}
          description={snackbar.description}
          status={snackbar.status}
          onClose={handleClose}
        />
      )}
    </SnackbarContext.Provider>
  );
};
