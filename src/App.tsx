import { Routes, Route } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import OverviewPage from "./pages/OverviewPage";
import IncidentsPage from "./pages/IncidentsPage";
import PlayersPage from "./pages/PlayersPage";
import AuditPage from "./pages/AuditPage";
import HealthPage from "./pages/HealthPage";
import LoginPage from "./pages/LoginPage";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<AppLayout />}>
        <Route index element={<OverviewPage />} />
        <Route path="incidents" element={<IncidentsPage />} />
        <Route path="players" element={<PlayersPage />} />
        <Route path="audit" element={<AuditPage />} />
        <Route path="health" element={<HealthPage />} />
      </Route>
    </Routes>
  );
}

export default App;