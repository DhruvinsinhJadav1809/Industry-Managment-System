import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Gate for routes restricted to specific roles (e.g. Admin-only pages).
 * Assumes ProtectedRoute already confirmed the user is signed in.
 */
export function RequireRole({
  allow,
  children,
}: {
  allow: number[];
  children: ReactNode;
}) {
  const { user } = useAuth();

  if (!user || !allow.includes(user.roleId ?? -1)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
