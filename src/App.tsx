import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import TeamDetails from "./pages/TeamDetails";
import TeamPractices from "./pages/TeamPractices";
import ManagerList from "./pages/ManagerList";
import { Toaster } from "./components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ManagerList />} />
        <Route path="/teams" element={<Index />} />
        <Route path="/teams/:managerId" element={<Index />} />
        <Route path="/team/:teamId" element={<TeamDetails />} />
        <Route path="/team/:teamId/practices" element={<TeamPractices />} />
      </Routes>
      <Toaster />
      <SonnerToaster position="top-center" />
    </BrowserRouter>
  );
}

export default App;