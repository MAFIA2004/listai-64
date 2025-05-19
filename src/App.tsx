
import { Toaster } from "sonner";
import { ThemeProvider } from "@/hooks/use-theme";
import { LanguageProvider } from "@/hooks/use-language";
import Index from "@/pages/Index";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NotFound from "@/pages/NotFound";
import { useEffect } from "react";
import { initializeAdMob } from "@/lib/admob-service";

function App() {
  // Initialize AdMob when app loads
  useEffect(() => {
    initializeAdMob()
      .then(() => console.log('AdMob initialized'))
      .catch(error => console.error('AdMob initialization failed', error));
  }, []);

  return (
    <ThemeProvider>
      <LanguageProvider>
        <BrowserRouter>
          <main className="min-h-dvh bg-background">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster position="top-center" closeButton richColors />
          </main>
        </BrowserRouter>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
