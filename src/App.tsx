
import { Toaster } from "sonner";
import { ThemeProvider } from "@/hooks/use-theme";
import { LanguageProvider } from "@/hooks/use-language";
import Index from "@/pages/Index";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NotFound from "@/pages/NotFound";
import { useEffect } from "react";

function App() {
  // Load Google AdSense script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5099055278802719";
    script.async = true;
    script.crossOrigin = "anonymous";
    document.head.appendChild(script);
    
    return () => {
      // Clean up script on unmount
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
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
