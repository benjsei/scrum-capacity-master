import { BrowserRouter } from "react-router-dom"
import { ThemeProvider } from "next-themes"
import { Routes, Route } from "react-router-dom"
import { Toaster } from "@/components/ui/sonner"
import Index from "@/pages/Index"
import TeamDetails from "@/pages/TeamDetails"
import DefaultPractices from "@/pages/DefaultPractices"
import TeamPractices from "@/pages/TeamPractices"
import ManagerList from "@/pages/ManagerList"

import "./App.css"

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/teams/:id" element={<TeamDetails />} />
          <Route path="/default-practices" element={<DefaultPractices />} />
          <Route path="/teams/:id/practices" element={<TeamPractices />} />
          <Route path="/managers" element={<ManagerList />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App