import { Route, Routes } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { ErrorBoundary } from "./components/common";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { RequireRole } from "./routes/RequireRole";
import { ROLES } from "./constants/roles";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute>
                  <RequireRole allow={[ROLES.ADMIN]}>
                    <Users />
                  </RequireRole>
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
