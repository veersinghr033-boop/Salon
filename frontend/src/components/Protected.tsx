import { Navigate } from "react-router-dom";
import type { ReactElement } from "react";
import { memo, useEffect, useState } from "react";
import { Spin } from 'antd';
import { useAuth } from "../context/AuthContext";

interface Props {
    allowedRoles: string[];
    children: React.ReactNode;
}
interface User {
    role: string;
    fullName?: string;
    email?: string;
    userId?: string;
    salonId?: string;
    employeeId?: string;
    customerId?: string;
    phone?: string;
}

function RoleGuard({ allowedRoles, children }: Props) {
    const [loading, setLoading] = useState(true);
    const [User, setUser] = useState(false);
    const { user } = useAuth();
    useEffect(() => {
        if (user?.role == allowedRoles[0]) {
            setUser(true);
        }
        setLoading(false);
    }, [user, allowedRoles]);



    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Spin size="large" />
            </div>
        );
    }


    if (!User) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;

}

export default memo(RoleGuard);