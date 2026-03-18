import { Layout, Table, Tag, Button, message } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import {
    CalendarOutlined,
    ScissorOutlined,
    TeamOutlined,
    ApartmentOutlined,
} from "@ant-design/icons";
import Sidebar from "../../components/Sidebar";
import StatCard from "../../components/StatCard";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { useAuth } from "../../context/AuthContext";


const { Content } = Layout;

interface Booking {
    _id: string;
    bookingId: string;
    services: string[];
    customer: string;
    employee: string;
    date: string;
    time: string;
    status: string;
    salonId: string;
    totalRevenue: number;
}

function AdminDashboard() {
    const statusColors: Record<string, string> = {
        confirmed: "green",
        completed: "blue",
        pending: "orange",
        cancelled: "red",
    };



    const [salonId, setSalonId] = useState<string>("");
    const [booking, setBookings] = useState<Booking[]>([]);
    const [services, setServices] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const { user } = useAuth();
    useEffect(() => {
        if (user?.role === "Admin" && user?.salonId) {
            setSalonId(user?.salonId);
        }
    }, []);



    const loadalldata = async () => {
        try {
            const [bookingRes, serviceRes, employeeRes] = await Promise.all([
                fetch("http://localhost:3500/api/auth/bookings"),
                fetch("http://localhost:3500/api/auth/services", {
                    credentials: "include",
                }),
                fetch("http://localhost:3500/api/auth/employees", {
                    credentials: "include",
                }),
            ]);

            const BookingData = await bookingRes.json();
            const ServiceData = await serviceRes.json();
            const EmployeeData = await employeeRes.json();

            const salonBookings = BookingData.filter(
                (b: any) => b.salon?._id === salonId
            );

            const bookingData: Booking[] = salonBookings.map((b: any) => ({
                _id: b._id,
                bookingId: b.bookingId,
                customer: b.customer?.fullName || "",
                services: Array.isArray(b.services)
                    ? b.services.map((s: any) => s.name || "")
                    : [],
                employee: b.employee?.fullName || "",
                date: dayjs(b.date).format("YYYY-MM-DD"),
                time: b.time,
                status: b.status,
                salonId: b.salon?._id || "",
                totalRevenue: b.totalPrice || 0,
            }));

            setBookings(bookingData);
            setServices(ServiceData.filter((s: any) => s.salonId === salonId));
            setEmployees(EmployeeData.filter((e: any) => e.salonId === salonId));
        } catch (error) {
            message.error("Failed to load dashboard data");
        }
    };

    useEffect(() => {
        if (salonId) {
            loadalldata();
        }
    }, [salonId]);
    // const updateStatus = async (id: string, status: string) => {
    //     try {
    //         await fetch(
    //             `http://localhost:3500/api/auth/bookings/${id}`,
    //             {
    //                 method: "PUT",
    //                 headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
    //                 body: JSON.stringify({ status }),
    //             }
    //         );

    //         message.success("Status updated");
    //         loadalldata();
    //     } catch {
    //         message.error("Failed to update status");
    //     }
    // };

    const totalRevenue = booking.reduce(
        (total, b) => total + b.totalRevenue,
        0
    );

    const today = new Date().toDateString();

    const todaysData = booking.filter(
        (b) => new Date(b.date).toDateString() === today
    );
    const columns = [
        { title: "Booking ID", dataIndex: "bookingId", key: "bookingId" },
        { title: "Customer", dataIndex: "customer", key: "customer" },
        {
            title: "Services",
            dataIndex: "services",
            render: (services: string[]) => (
                <div className="flex flex-wrap gap-1">
                    {services.map((service, idx) => (
                        <Tag key={idx}>{service}</Tag>
                    ))}
                </div>
            ),
        },
        { title: "Employee", dataIndex: "employee", key: "employee" },
        {
            title: "Date & Time",
            render: (record: Booking) => (
                <div>
                    <div className="font-medium">{record.date}</div>
                    <div className="text-sm text-gray-500">{record.time}</div>
                </div>
            ),
        },
        {

            title: "Status",
            dataIndex: "status",
            render: (status: string) => (
                <Tag
                    color={
                        status === "Pending"
                            ? "gold"
                            : status === "Confirmed"
                                ? "green"
                                : status === "Completed"
                                    ? "blue"
                                    : "red"
                    }
                >
                    {status}
                </Tag>
            ),
        },
        {
            title: "Action",
            key: "action",
            render: () => <Button type="text" icon={<EyeOutlined />} />,
        },
    ];
    return (
        <Layout className="min-h-screen bg-slate-100">
            <Sidebar />

            <Content className="p-4 md:p-6 md:ml-64">
                <header className="mb-6">
                    <h1 className="text-xl md:text-3xl font-semibold text-gray-800">
                        Good morning, Admin!
                    </h1>
                    <p className="text-gray-500">
                        Here's what's happening at your salon today
                    </p>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <StatCard
                        title="Total Bookings"
                        value={booking.length.toString()}
                        change="+12% this month"
                        icon={<CalendarOutlined />}
                    />

                    <StatCard
                        title="Total Services"
                        value={services.length.toString()}
                        change="+2 this month"
                        icon={<ScissorOutlined />}
                    />

                    <StatCard
                        title="Total Employees"
                        value={employees.length.toString()}
                        change="+1 this month"
                        icon={<TeamOutlined />}
                    />

                    <StatCard
                        title="Total Revenue"
                        value={`₹ ${totalRevenue}`}
                        change="+8% this month"
                        icon={<ApartmentOutlined />}
                    />
                </div>

                <div className="bg-white p-4 md:p-6 rounded-xl shadow">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
                        <div>
                            <h2 className="text-lg md:text-2xl font-semibold text-gray-800">
                                Today's Bookings
                            </h2>
                            <p className="text-gray-500">
                                Manage and track all appointments
                            </p>
                        </div>

                        <Button type="link" className="text-blue-600" href="/admin/bookings">
                            View All →
                        </Button>
                    </div>

                    <Table
                        columns={columns}
                        dataSource={todaysData}
                        rowKey="_id"
                        pagination={{ pageSize: 5 }}
                        scroll={{ x: 900 }}
                    />
                </div>
            </Content>
        </Layout>
    );
}

export default AdminDashboard;