import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { BottomNav } from "@/components/shared/BottomNav";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Clientes from "./pages/Clientes";
import ClienteDetalhe from "./pages/ClienteDetalhe";
import NovoCliente from "./pages/NovoCliente";
import Estoque from "./pages/Estoque";
import EntradaEstoque from "./pages/EntradaEstoque";
import OrdensServico from "./pages/OrdensServico";
import OrdemDetalhe from "./pages/OrdemDetalhe";
import NovaOrdem from "./pages/NovaOrdem";
import NovaMoto from "./pages/NovaMoto";
import Configuracoes from "./pages/Configuracoes";
import NotFound from "./pages/NotFound";
import { OfflineBanner } from "@/components/shared/OfflineBanner";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 2, // 2 min
    },
  },
});

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background max-w-lg mx-auto relative">
      {children}
      <BottomNav />
    </div>
  );
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/" element={<AuthGuard><AppLayout><Home /></AppLayout></AuthGuard>} />
      <Route path="/clientes" element={<AuthGuard><AppLayout><Clientes /></AppLayout></AuthGuard>} />
      <Route path="/clientes/novo" element={<AuthGuard><AppLayout><NovoCliente /></AppLayout></AuthGuard>} />
      <Route path="/clientes/:id" element={<AuthGuard><AppLayout><ClienteDetalhe /></AppLayout></AuthGuard>} />
      <Route path="/estoque" element={<AuthGuard><AppLayout><Estoque /></AppLayout></AuthGuard>} />
      <Route path="/estoque/entrada" element={<AuthGuard><AppLayout><EntradaEstoque /></AppLayout></AuthGuard>} />
      <Route path="/ordens" element={<AuthGuard><AppLayout><OrdensServico /></AppLayout></AuthGuard>} />
      <Route path="/ordens/nova" element={<AuthGuard><AppLayout><NovaOrdem /></AppLayout></AuthGuard>} />
      <Route path="/ordens/:id" element={<AuthGuard><AppLayout><OrdemDetalhe /></AppLayout></AuthGuard>} />
      <Route path="/motos/nova" element={<AuthGuard><AppLayout><NovaMoto /></AppLayout></AuthGuard>} />
      <Route path="/config" element={<AuthGuard><AppLayout><Configuracoes /></AppLayout></AuthGuard>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner position="top-center" />
      <OfflineBanner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
