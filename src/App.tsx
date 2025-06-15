
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { Toaster } from "@/components/ui/toaster"
import { TooltipProvider } from "@/components/ui/tooltip"

import Index from "./pages/Index"
import Dashboard from "./pages/Dashboard"
import NursingHomes from "./pages/NursingHomes"
import Residents from "./pages/Residents"
import Finances from "./pages/Finances"
import Reports from "./pages/Reports"
import Settings from "./pages/Settings"
import NotFound from "./pages/NotFound"
import { AuthProvider } from "./contexts/AuthContext"
import AuthPage from "./pages/Auth"


function App() {
  return (
    <TooltipProvider>
      <Router>
        <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />}>
                <Route index element={<Dashboard />} />
                <Route path="nursing-homes" element={<NursingHomes />} />
                <Route path="residents" element={<Residents />} />
                <Route path="finances" element={<Finances />} />
                <Route path="reports" element={<Reports />} />
                <Route path="settings" element={<Settings />} />
              </Route>
              <Route path="/auth" element={<AuthPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
        </AuthProvider>
      </Router>
      <Toaster />
    </TooltipProvider>
  )
}

export default App
