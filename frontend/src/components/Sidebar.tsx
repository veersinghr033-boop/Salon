import { Menu, Avatar, Button } from "antd";
import {
    LogoutOutlined,
    UserOutlined,
    MenuOutlined,
    ScissorOutlined,
    CloseOutlined,
    FormOutlined,
    AppstoreOutlined,
    BankOutlined
} from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";


type SidebarItem = {
    key: string;
    icon?: React.ReactNode;
    label: string;
    path: string;
};

interface SidebarProps {
    title?: string;
    items?: SidebarItem[];
    userName?: string;
    userRole?: string;
}

export default function Sidebar({ title = "SaloonBook", items: passedItems, userName: passedUserName, userRole: passedUserRole }: SidebarProps) {

    const location = useLocation();
    const [open, setOpen] = useState(false);
    const [role, setRole] = useState<string | null>(null);
    const [userName, setUserName] = useState(passedUserName ?? "");
    const [userRole, setUserRole] = useState(passedUserRole ?? "");
    const { logout,user } = useAuth();

    useEffect(() => {
        if (user) {
            setRole(user.role);
            setUserName(user.fullName || user.email || "User");
            setUserRole(user.role);
        }
    }, [user]);

    const onLogout = () => {

        window.location.href = "/login";
        logout();

    };

    const items: SidebarItem[] =
        passedItems ??
        (role
            ? role.toLowerCase() === "superadmin"
                ? [
                    { key: "dashboard", icon: <AppstoreOutlined />, label: "Dashboard", path: "/superAdmin" },
                    { key: "companies", icon: <BankOutlined />, label: "Companies", path: "/superAdmin/companies" },
                    { key: "users", icon: <UserOutlined />, label: "Users", path: "/superAdmin/users" },
                    { key: "requests", icon: <FormOutlined />, label: "Requests", path: "/superAdmin/Requests" },
                ]
                : role.toLowerCase() === "admin"
                    ? [
                        { key: "dashboard", icon: <AppstoreOutlined />, label: "Dashboard", path: "/admin" },
                        { key: "employees", icon: <UserOutlined />, label: "Employees", path: "/admin/employees" },
                        { key: "services", icon: <ScissorOutlined />, label: "Services", path: "/admin/services" },
                        { key: "bookings", icon: <FormOutlined />, label: "Bookings", path: "/admin/bookings" },
                        { key: "company-profile", icon: <BankOutlined />, label: "Company Profile", path: "/admin/company-profile" },
                    ]
                    : role.toLowerCase() === "employee"
                        ? [
                            { key: "dashboard", icon: <AppstoreOutlined />, label: "Dashboard", path: "/employee" },
                            { key: "bookings", icon: <FormOutlined />, label: "Bookings", path: "/employee/bookings" },
                        ]
                        : role.toLowerCase() === "customer"
                            ? [
                                { key: "dashboard", icon: <AppstoreOutlined />, label: "Dashboard", path: "/customer" },
                                { key: "bookings", icon: <FormOutlined />, label: "My Bookings", path: "/customer/bookings" },
                            ]
                            : []
            : []);

    const activeKey =
        items.find((item) => item.path === location.pathname)?.key || "";

    return (
        <>
            <div className="md:hidden flex items-center gap-3 px-4 h-14 bg-white shadow sticky top-0 z-30">
                <button
                    onClick={() => setOpen(true)}
                    className="p-2 rounded-md bg-blue-500 text-white"
                >
                    <MenuOutlined />
                </button>
                <span className="font-semibold text-lg">{title}</span>
            </div>

            <aside
                className={`
                    fixed top-0 left-0 h-screen overflow-auto w-64 bg-blue-900 z-50
                    transform transition-transform duration-300
                    ${open ? "translate-x-0" : "-translate-x-full"}
                    md:translate-x-0
                `}
            >

                <div className="flex justify-between items-center px-4 py-3 border-b border-blue-600">
                    <div className="flex gap-3 items-center">
                        <div className="w-9 h-9 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xl font-bold">
                            <ScissorOutlined />
                        </div>
                        <span className="text-xl font-semibold text-white">
                            {title}
                        </span>
                    </div>

                    <button
                        className="md:hidden text-white"
                        onClick={() => setOpen(false)}
                    >
                        <CloseOutlined />
                    </button>
                </div>

                <div className="flex flex-col h-[88%] justify-between">

                    <Menu
                        mode="inline"
                        selectedKeys={[activeKey]}
                        theme="dark"
                        rootClassName="px-3 !bg-transparent"
                        items={items.map((item) => ({
                            key: item.key,
                            icon: item.icon,
                            label: (
                                <Link
                                    to={item.path}
                                    onClick={() => setOpen(false)}
                                >
                                    {item.label}
                                </Link>
                            ),
                            className:
                                activeKey === item.key
                                    ? "rounded-xl !bg-blue-500 !text-white"
                                    : "rounded-xl text-slate-100 hover:!bg-blue-400",
                        }))}
                    />

                    <div className="px-4 py-3 border-t border-blue-600">
                        <div className="flex items-center gap-3 mb-4">
                            <Avatar icon={<UserOutlined />} className="bg-blue-500!" />
                            <div>
                                <p className="text-sm font-medium text-white">
                                    {userName}
                                </p>
                                <p className="text-xs text-blue-300">
                                    {userRole}
                                </p>
                            </div>
                        </div>

                        <Button
                            onClick={onLogout}
                            className="w-full bg-blue-500! text-white! border-none! hover:bg-blue-400!"
                        >
                            <LogoutOutlined /> Logout
                        </Button>
                    </div>

                </div>
            </aside>
        </>
    );
}