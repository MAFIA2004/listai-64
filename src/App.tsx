
import { Toaster } from "sonner";
import { ThemeProvider } from "@/hooks/use-theme";
import Index from "@/pages/Index";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NotFound from "@/pages/NotFound";

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <main className="min-h-dvh bg-gradient-to-br from-background to-secondary/30 transition-colors duration-300">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster position="top-center" closeButton richColors />
        </main>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
