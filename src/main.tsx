
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Toaster } from './components/ui/toaster'
import { Toaster as SonnerToaster } from './components/ui/sonner'
import { SnackbarProvider } from "./components/snackbar/SnackbarContext";

createRoot(document.getElementById('root')!).render(
  // <StrictMode>
  <>
    <SnackbarProvider>
      <App />
      <Toaster />
      <SonnerToaster position="bottom-right" />
    </SnackbarProvider>
  </>
  // </StrictMode>,
)
