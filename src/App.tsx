import { lazy, Suspense } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PresentationThemeProvider } from "@/components/PresentationThemeProvider";
import DeferredNotifications from "@/components/DeferredNotifications";

const Index = lazy(() => import("./pages/Index"));
const CvLibrary = lazy(() => import("./pages/CvLibrary"));
const CvVersionPage = lazy(() => import("./pages/CvVersion"));
const ShareDocumentPage = lazy(() => import("./pages/ShareDocument"));
const RefereeVault = lazy(() => import("./pages/RefereeVault"));
const NotFound = lazy(() => import("./pages/NotFound"));

const App = () => (
  <TooltipProvider>
    <DeferredNotifications />
    <BrowserRouter>
      <PresentationThemeProvider>
        <Suspense fallback={<div className="min-h-screen bg-background" />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/cv" element={<CvLibrary />} />
            <Route path="/cv/:slug" element={<CvVersionPage />} />
            <Route path="/share/:documentType/:slug" element={<ShareDocumentPage />} />
            <Route path="/owner/referees" element={<RefereeVault />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </PresentationThemeProvider>
    </BrowserRouter>
  </TooltipProvider>
);

export default App;
