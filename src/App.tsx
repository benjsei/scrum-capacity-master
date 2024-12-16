import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ManagerList from "./pages/ManagerList";
import DefaultPractices from "./pages/DefaultPractices";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ManagerList />} />
        <Route path="/default-practices" element={<DefaultPractices />} />
      </Routes>
    </Router>
  );
}

export default App;
