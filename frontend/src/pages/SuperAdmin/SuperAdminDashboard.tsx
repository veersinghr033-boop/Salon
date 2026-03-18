import { Layout } from "antd";
import {
    BankOutlined,
    RiseOutlined,
    TeamOutlined,
    CalendarOutlined,
} from "@ant-design/icons";
import Sidebar from "../../components/Sidebar";
import StatCard from "../../components/StatCard";
import { Column, Line } from "@ant-design/plots";
import { RevenueData, BookingsData } from "../../utills/data";
import { useEffect, useState } from "react";

const { Content } = Layout;

export default function DashboardLayout() {

    const [users, setUsers] = useState<any[]>([]);
    const [companies, setCompanies] = useState<any[]>([]);
    const [bookings, setBookings] = useState<any[]>([]);
    const load = async () => {
        const response = await fetch("http://localhost:3500/api/auth/salon", {
            credentials: "include",
        });
        const userResponse = await fetch("http://localhost:3500/api/auth/users", {
            credentials: "include",
        });
        const bookingResponse = await fetch("http://localhost:3500/api/auth/bookings", {
            credentials: "include",
        })
        const data = await response.json();
        const users = await userResponse.json();
        const bookings = await bookingResponse.json();

        setUsers(users);
        setCompanies(data.filter((salon: any) => salon.isApproved));
        setBookings(bookings);
    };
    useEffect(() => {
        load();
    }, [])
    const totalRevenue = bookings.reduce((acc, booking) => acc + booking.totalPrice, 0);


    return (
        <Layout rootClassName="min-h-screen !bg-slate-100">
            <Sidebar />

            <Content className="p-4 md:p-6 md:ml-64">
                <header className="mb-6">
                    <h1 className="text-xl md:text-2xl font-semibold text-gray-800">
                        Platform Overview
                    </h1>
                    <p className="text-gray-500">
                        Monitor and manage the entire platform
                    </p>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <StatCard
                        title="Total Companies"
                        value={companies.length.toString()}
                        change="+3 this month"
                        icon={<BankOutlined />}
                    />
                    <StatCard
                        title="Total Users"
                        value={users.length.toString()}
                        change="+156 this month"
                        icon={<TeamOutlined />}
                    />
                    <StatCard
                        title="Total Bookings"
                        value={bookings.length.toString()}
                        change="+1,203 this month"
                        icon={<CalendarOutlined />}
                    />
                    <StatCard
                        title="Revenue"
                        value={`₹${totalRevenue.toFixed(2)}`}
                        change="+12% vs last month"
                        icon={<RiseOutlined />}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white p-3     md:p-5 rounded-xl shadow-sm">
                        <h2 className="text-lg font-semibold mb-4">
                            Bookings Overview
                        </h2>
                        <Line
                            data={RevenueData}
                            xField="month"
                            yField="value"
                            smooth
                            height={220}
                            color="#3B82F6"
                            point={{ size: 3 }}
                        />
                    </div>

                    <div className="bg-white p-3 md:p-5 rounded-xl shadow-sm">
                        <h2 className="text-lg font-semibold mb-4">
                            Revenue Growth
                        </h2>
                        <Column
                            data={BookingsData}
                            xField="day"
                            yField="value"
                            height={220}
                            color="#3B82F6"
                            columnStyle={{ borderRadius: 3 }}
                        />
                    </div>
                </div>
            </Content>
        </Layout>
    );
}
