import { Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import OverviewPage from "./pages/OverviewPage";
import IncidentsPage from "./pages/IncidentsPage";
import PlayersPage from "./pages/PlayersPage";
import AuditPage from "./pages/AuditPage";
import HealthPage from "./pages/HealthPage";
import LoginPage from "./pages/LoginPage";
import CaseCommandPage from "./pages/CaseCommandPage";
import ProtectedRoute from "./features/auth/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/incidents" element={<Navigate to="/app/incidents" replace />} />
      <Route path="/players" element={<Navigate to="/app/players" replace />} />
      <Route path="/audit" element={<Navigate to="/app/audit" replace />} />
      <Route path="/health" element={<Navigate to="/app/health" replace />} />
      <Route path="/cases" element={<Navigate to="/app/cases" replace />} />

      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<OverviewPage />} />
        <Route path="incidents" element={<IncidentsPage />} />
        <Route path="players" element={<PlayersPage />} />
        <Route path="audit" element={<AuditPage />} />
        <Route path="health" element={<HealthPage />} />
        <Route path="cases" element={<CaseCommandPage />} />
      </Route>
    </Routes>
  );
}

export default App;