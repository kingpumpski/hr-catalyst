import { lazy, Suspense } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PresentationThemeProvider } from "@/components/PresentationThemeProvider";
import DeferredNotifications from "@/components/DeferredNotifications";
import OwnerRoute from "@/components/OwnerRoute";
import { AuthProvider } from "@/contexts/AuthContext";

const Index = lazy(() => import("./pages/Index"));
const CvLibrary = lazy(() => import("./pages/CvLibrary"));
const CvVersionPage = lazy(() => import("./pages/CvVersion"));
const ShareDocumentPage = lazy(() => import("./pages/ShareDocument"));
const RefereeVault = lazy(() => import("./pages/RefereeVault"));
const Settings = lazy(() => import("./pages/Settings"));
const Account = lazy(() => import("./pages/Account"));
const NotFound = lazy(() => import("./pages/NotFound"));

const App = () => (
  <AuthProvider>
    <TooltipProvider>
      <DeferredNotifications />
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <PresentationThemeProvider>
          <Suspense fallback={<div className="min-h-screen bg-background" />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/cv" element={<CvLibrary />} />
              <Route path="/account" element={<Account />} />
              <Route path="/share/:documentType/:slug" element={<ShareDocumentPage />} />
              <Route element={<OwnerRoute />}>
                <Route path="/cv/:slug" element={<CvVersionPage />} />
                <Route path="/owner/referees" element={<RefereeVault />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </PresentationThemeProvider>
      </BrowserRouter>
    </TooltipProvider>
  </AuthProvider>
);

export default App;
