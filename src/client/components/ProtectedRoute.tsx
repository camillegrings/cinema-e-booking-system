
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.js";

import type { UserRole } from "../types/auth.js";

interface ProtectedRouteProps {
    allowedRoles?: UserRole[];
}

export default function ProtectedRoute({
    allowedRoles,
}: ProtectedRouteProps) {
    const { user, isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "100vh",
            }}
        >
            Loading...
        </div>
    }

    if (!isAuthenticated) {
        return (
            <Navigate
                to="/login"
                replace
                state={{ from: location }}
            />
        );
    }

    if (allowedRoles && !allowedRoles.includes(user!.role)) {
        return <Navigate to="/" replace />;
    }

    if (user!.status !== "active") {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}
