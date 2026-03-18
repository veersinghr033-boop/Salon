import { Layout, Card, Table, Tag, message } from "antd";
import Sidebar from "../../components/Sidebar";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import dayjs from "dayjs";

const { Content } = Layout;

type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

interface Booking {
    id: string;
    customer: string;
    date: string;
    start: string;
    end: string;
    services: string[];
    price: number;
    status: BookingStatus;
    Duration: string;
}

const statusColor: Record<BookingStatus, string> = {
    pending: "gold",
    confirmed: "green",
    completed: "default",
    cancelled: "red",
};



function EmployeeDashboard() {
    const [loading, setLoading] = useState(false);
    const [employeeId, setEmployeeId] = useState<string | null>(null);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const { user } = useAuth();
    useEffect(()=>{
        if(user?.role === "employee"){
            setEmployeeId(user?.employeeId || null);
        }

    },[user])
    console.log("Employee ID:", employeeId);
    const loadBookings = async () => {
        try {
            setLoading(true);

            const res = await fetch("http://localhost:3500/api/auth/bookings", {
                credentials: "include",
            });

            const response = await res.json();
            // console.log("All Bookings:", response);

            const employeeBookings = response.filter(
                (b: any) => b.employee?._id === employeeId
            );

            const bookingData: Booking[] = employeeBookings.map((b: any) => ({
                id: b.bookingId,
                customer: b.customer?.fullName || "Unknown",

                date: dayjs(b.date).format("YYYY-MM-DD"),

                start: b.time,

                // end: computeEnd(b.time, b.totalDuration),
                Duration: b.totalDuration,

                services: Array.isArray(b.services)
                    ? b.services.map((s: any) => s.name)
                    : [],

                price: b.totalPrice,

                status: b.status,
            }));

            setBookings(bookingData);
        } catch (err) {
            message.error("Failed to load bookings");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (employeeId) loadBookings();
    }, [employeeId]);


    const today = new Date().toDateString();

    const todaysData = bookings.filter(
        (b) => new Date(b.date).toDateString() === today
    );

    const stats = {
        total: bookings.length,
        today: todaysData.length,
        pending: bookings.filter((b) => b.status === "pending").length,
        confirmed: bookings.filter((b) => b.status === "confirmed").length,
    };

    const columns = [
        {
            title: "Date & Time",
            render: (_: any, b: Booking) => `${b.date} • ${b.start}`,
        },
        {
            title: "Customer",
            dataIndex: "customer",
        },
        {
            title: "Services",
            dataIndex: "services",
            render: (s: string[]) => s.join(", "),
        },
        {
            title: "Duration",
            dataIndex: "Duration",

        },
        {
            title: "Price",
            dataIndex: "price",
            // render: (p: number) => `$${p}`,
        },
        {
            title: "Status",
            dataIndex: "status",
            render: (s: BookingStatus) => (
                <Tag color={statusColor[s]}>
                    {s}
                </Tag>
            ),
        },
    ];

    return (
        <Layout rootClassName="min-h-screen !bg-slate-100">
            <Sidebar />

            <Content className="p-4 md:p-6 md:ml-64">
                <h1 className="text-xl md:text-2xl font-semibold mb-6">
                    Employee Dashboard
                </h1>


                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

                    <Card className="rounded-xl shadow-md">
                        <p className="text-gray-500 text-sm">Total Bookings</p>
                        <p className="text-xl md:text-2xl font-semibold mt-1">
                            {stats.total}
                        </p>
                    </Card>

                    <Card className="rounded-xl shadow-md">
                        <p className="text-gray-500 text-sm">Today's Bookings</p>
                        <p className="text-xl md:text-2xl font-semibold mt-1">
                            {stats.today}
                        </p>
                    </Card>

                    <Card className="rounded-xl shadow-md">
                        <p className="text-gray-500 text-sm">Pending</p>
                        <p className="text-xl md:text-2xl font-semibold mt-1">
                            {stats.pending}
                        </p>
                    </Card>

                    <Card className="rounded-xl shadow-md">
                        <p className="text-gray-500 text-sm">Confirmed</p>
                        <p className="text-xl md:text-2xl font-semibold mt-1">
                            {stats.confirmed}
                        </p>
                    </Card>

                </div>


                <Card className="rounded-xl shadow-md">
                    <h2 className="text-lg font-medium mb-4">
                        Today's Schedule
                    </h2>

                    {todaysData.length === 0 ? (
                        <div className="py-8 text-center text-gray-500">
                            No appointments scheduled for today
                        </div>
                    ) : (
                        <Table
                            columns={columns}
                            dataSource={todaysData}
                            rowKey="id"
                            loading={loading}
                            pagination={false}
                            scroll={{ x: 900 }}
                        />
                    )}
                </Card>
            </Content>
        </Layout>
    );
}

export default EmployeeDashboard;