import { createContext, useContext, useState, useEffect, useCallback, useMemo, memo } from "react";
// import { apiGet, apiPost } from "../utills/api";
import { message } from "antd";

type User = {
    role: string;
    fullName?: string;
    email?: string;
    userId?: string;
    salonId?: string;
    employeeId?: string;
    customerId?: string;
    phone?: string;
};

type AuthContextType = {
    user: User | null;
    loading: boolean;
    checkAuth: () => Promise<void>;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    checkAuth: async () => { },
    logout: async () => { },
});

export const AuthProvider = (({ children }: { children: React.ReactNode; }) => {
    const [user, setUser] = useState<User | null>(null);


    const [loading, setLoading] = useState(true);

    const checkAuth = useCallback(async () => {
        try {
            const res = await fetch("http://localhost:3500/api/auth/me", {
                credentials: "include",
            })
            const data = await res.json();

            if (data.user) {
                setUser(data.user);
                console.log("sdsd")
                
            } else {
                setUser(null);
                console.log("sdsdertyuiop")


            }
            
        } catch (error) {
            console.error("Auth check failed:", error);
            setUser(null);
            message.error("Authentication check failed. Please log in again.");
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            await fetch("http://localhost:3500/api/auth/logout", {
                method: "POST",
                credentials: "include",
            });
            localStorage.removeItem("token");
            setUser(null);
        } catch (error) {
            console.error("Logout failed:", error);
            setUser(null);
        }
    }, []);

    useEffect(() => {
        checkAuth();
    }, []);

    const contextValue = useMemo(() => ({
        user,
        loading,
        checkAuth,
        logout,
    }), [user, loading, checkAuth, logout]);

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
});

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export default memo(AuthProvider);