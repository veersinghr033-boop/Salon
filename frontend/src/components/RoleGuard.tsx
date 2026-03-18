import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { ReactElement } from "react";
import { memo } from "react";
import { Spin } from 'antd';

interface Props {
    allowedRoles: string[];
    children: ReactElement;
}

function RoleGuard({ allowedRoles, children }: Props) {
    const { user, loading } = useAuth();


    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Spin size="large" />
            </div>
        );
    }


    if (!user) {
        return <Navigate to="/" replace />;
    }else if (user && !user.role) {
        return <Navigate to="/" replace />;

    }

    if (!allowedRoles.includes(user.role || "")) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

export default memo(RoleGuard);