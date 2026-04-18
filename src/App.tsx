import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PublicLayout } from "@/components/PublicLayout";
import { AdminLayout } from "@/components/AdminLayout";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import AboutPage from "./pages/AboutPage";
import InteractiveMapPage from "./pages/InteractiveMapPage";
import AnalysisMapPage from "./pages/AnalysisMapPage";
import VillageListPage from "./pages/VillageListPage";
import NewsPage from "./pages/NewsPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminDataPage from "./pages/AdminDataPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/map" element={<InteractiveMapPage />} />
            <Route path="/analysis" element={<AnalysisMapPage />} />
            <Route path="/villages" element={<VillageListPage />} />
            <Route path="/news" element={<NewsPage />} />
          </Route>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="villages" element={<AdminDataPage />} />
            <Route path="facilities" element={<AdminDataPage />} />
            <Route path="roads" element={<AdminDataPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
