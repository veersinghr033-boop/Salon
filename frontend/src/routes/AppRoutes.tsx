import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { Spin } from "antd";

// import RoleGuard from "../components/RoleGuard";
const RoleGuard = lazy(() => import("../components/Protected"));
const Home = lazy(() => import("../pages/Home"));
const Login = lazy(() => import("../pages/auth/Login"));
const SignUp = lazy(() => import("../pages/auth/SignUp"));

const SalonAdminDashboard = lazy(() => import("../pages/SuperAdmin/SuperAdminDashboard"));
const CompaniesDetails = lazy(() => import("../pages/SuperAdmin/companiesDetails"));
const UserDetails = lazy(() => import("../pages/SuperAdmin/userDetails"));
const NewRequests = lazy(() => import("../pages/SuperAdmin/newRequests"));

const AdminDashboard = lazy(() => import("../pages/Admin/AdminDashboard"));
const CompanyProfile = lazy(() => import("../pages/Admin/CompanyProfile"));
const Employees = lazy(() => import("../pages/Admin/Employees"));
const SalonServices = lazy(() => import("../pages/Admin/SalonServices"));
const SalonBooking = lazy(() => import("../pages/Admin/SalonBooking"));

const EmployeeDashboard = lazy(() => import("../pages/Employee/EmployeeDashboard"));
const EmployeeBooking = lazy(() => import("../pages/Employee/EmployeeBooking"));

const CustomerDashboard = lazy(() => import("../pages/Customer/CustomerDashboard"));
const CustomerBooking = lazy(() => import("../pages/Customer/CustomerBooking"));
const UserProfile = lazy(() => import("../pages/userProfile"));

export default function AppRoutes() {

    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Spin size="large" /></div>}>
            <Routes>

                <Route path="/" element={<Home />} />
                <Route path="/*" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />

                <Route path="/superAdmin"
                    element={
                        <RoleGuard allowedRoles={["superadmin"]}>
                            <SalonAdminDashboard />
                        </RoleGuard>
                    }
                />

                <Route path="/superAdmin/companies"
                    element={
                        <RoleGuard allowedRoles={["superadmin"]}>
                            <CompaniesDetails />
                        </RoleGuard>
                    }
                />

                <Route path="/superAdmin/users"
                    element={
                        <RoleGuard allowedRoles={["superadmin"]}>
                            <UserDetails />
                        </RoleGuard>
                    }
                />

                <Route path="/superAdmin/requests"
                    element={
                        <RoleGuard allowedRoles={["superadmin"]}>
                            <NewRequests />
                        </RoleGuard>
                    }
                />

                <Route path="/profile"
                    element={
                        <RoleGuard allowedRoles={["superadmin", "admin", "employee", "customer"]}>
                            <UserProfile />
                        </RoleGuard>
                    }
                />

                <Route path="/admin"
                    element={
                        <RoleGuard allowedRoles={["Admin"]}>
                            <AdminDashboard />
                        </RoleGuard>
                    }
                />

                <Route path="/admin/company-profile"
                    element={
                        <RoleGuard allowedRoles={["Admin"]}>
                            <CompanyProfile />
                        </RoleGuard>
                    }
                />

                <Route path="/admin/employees"
                    element={
                        <RoleGuard allowedRoles={["Admin"]}>
                            <Employees />
                        </RoleGuard>
                    }
                />

                <Route path="/admin/services"
                    element={
                        <RoleGuard allowedRoles={["Admin"]}>
                            <SalonServices />
                        </RoleGuard>
                    }
                />

                <Route path="/admin/bookings"
                    element={
                        <RoleGuard allowedRoles={["Admin"]}>
                            <SalonBooking />
                        </RoleGuard>
                    }
                />


                <Route path="/employee"
                    element={
                        <RoleGuard allowedRoles={["employee"]}>
                            <EmployeeDashboard />
                        </RoleGuard>
                    }
                />

                <Route path="/employee/bookings"
                    element={
                        <RoleGuard allowedRoles={["employee"]}>
                            <EmployeeBooking />
                        </RoleGuard>
                    }
                />
                <Route path="/customer"
                    element={
                        <RoleGuard allowedRoles={["customer"]}>
                            <CustomerDashboard />
                        </RoleGuard>
                    }
                />

                <Route path="/customer/bookings"
                    element={
                        <RoleGuard allowedRoles={["customer"]}>
                            <CustomerBooking />
                        </RoleGuard>
                    }
                />
            </Routes>
        </Suspense>
    );
}
