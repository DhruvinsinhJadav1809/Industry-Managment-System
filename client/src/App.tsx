import { Route, Routes } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { ErrorBoundary, ToastViewport } from "./components/common";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { RequireRole } from "./routes/RequireRole";
import { ROLES } from "./constants/roles";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Departments from "./pages/Departments";
import Products from "./pages/Products";
import Suppliers from "./pages/Suppliers";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";
import Settings from "./pages/Settings";
import { CompanySettingsProvider } from "./context/CompanySettingsContext";
import Purchases from "./pages/Purchases";
import PurchaseCreate from "./pages/CreatePurchase";
import { NotificationProvider } from "./context/NotificationContext";

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <NotificationProvider>
              <CompanySettingsProvider>
                <Routes>
                  <Route path="/register" element={<Register />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
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
                  <Route
                    path="/departments"
                    element={
                      <ProtectedRoute>
                        <RequireRole allow={[ROLES.ADMIN]}>
                          <Departments />
                        </RequireRole>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/products"
                    element={
                      <ProtectedRoute>
                        <RequireRole allow={[ROLES.ADMIN]}>
                          <Products />
                        </RequireRole>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/suppliers"
                    element={
                      <ProtectedRoute>
                        <RequireRole allow={[ROLES.ADMIN]}>
                          <Suppliers />
                        </RequireRole>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <ProtectedRoute>
                        <Settings />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/purchases"
                    element={
                      <ProtectedRoute>
                        <RequireRole allow={[ROLES.ADMIN]}>
                          <Purchases />
                        </RequireRole>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/purchases/new"
                    element={
                      <ProtectedRoute>
                        <RequireRole allow={[ROLES.ADMIN]}>
                          <PurchaseCreate />
                        </RequireRole>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/purchases/:id"
                    element={
                      <ProtectedRoute>
                        <RequireRole allow={[ROLES.STAFF]}>
                          <Purchases />
                        </RequireRole>
                      </ProtectedRoute>
                    }
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <ToastViewport />
              </CompanySettingsProvider>
            </NotificationProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
