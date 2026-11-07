import { lazy, Suspense } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PresentationThemeProvider } from "@/components/PresentationThemeProvider";
import { AuthProvider } from "@/components/AuthProvider";
import ProtectedRoute from "@/components/ProtectedRoute";
import DeferredNotifications from "@/components/DeferredNotifications";

const Index = lazy(() => import("./pages/Index"));
const CvLibrary = lazy(() => import("./pages/CvLibrary"));
const CvVersionPage = lazy(() => import("./pages/CvVersion"));
const ShareDocumentPage = lazy(() => import("./pages/ShareDocument"));
const RefereeVault = lazy(() => import("./pages/RefereeVault"));
const Settings = lazy(() => import("./pages/Settings"));
const AuthPage = lazy(() => import("./pages/Auth"));
const OwnerWorkspace = lazy(() => import("./pages/OwnerWorkspace"));
const PlatformAdmin = lazy(() => import("./pages/PlatformAdmin"));
const NotFound = lazy(() => import("./pages/NotFound"));

const App = () => (
  <TooltipProvider>
    <DeferredNotifications />
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AuthProvider>
        <PresentationThemeProvider>
          <Suspense fallback={<div className="min-h-screen bg-background" />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/cv" element={<CvLibrary />} />
              <Route path="/cv/:slug" element={<ProtectedRoute><CvVersionPage /></ProtectedRoute>} />
              <Route path="/share/:documentType/:slug" element={<ShareDocumentPage />} />
              <Route path="/owner" element={<ProtectedRoute><OwnerWorkspace /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute><PlatformAdmin /></ProtectedRoute>} />
              <Route path="/owner/referees" element={<ProtectedRoute><RefereeVault /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </PresentationThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  </TooltipProvider>
);

export default App;
