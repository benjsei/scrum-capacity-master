import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import TeamDetails from "./pages/TeamDetails";
import TeamPractices from "./pages/TeamPractices";
import DefaultPractices from "./pages/DefaultPractices";
import ManagerList from "./pages/ManagerList";
import { Toaster } from "@/components/ui/sonner";
import { TeamManagement } from "./components/TeamManagement";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/managers" replace />} />
        <Route path="/managers" element={<ManagerList />} />
        <Route path="/teams/:managerId" element={<TeamManagement managerId={null} />} />
        <Route path="/team/:teamId" element={<TeamDetails />} />
        <Route path="/team/:teamId/practices" element={<TeamPractices />} />
        <Route path="/default-practices" element={<DefaultPractices />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;