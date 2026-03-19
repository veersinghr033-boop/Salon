import { Layout, Tag, Modal, Button, Table, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import dayjs from "dayjs";
import { useAuth } from "../../context/AuthContext";

const { Content } = Layout;

type TabType = "all" | "upcoming" | "completed" | "cancelled";

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
}

function EmployeeBooking() {
  

    const [data, setData] = useState<Booking[]>([]);
    const [activeTab, setActiveTab] = useState<TabType>("all");
    const [cancelId, setCancelId] = useState<string | null>(null);
    const [viewData, setViewData] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(false);
    const [employeeId, setEmployeeId] = useState<string | null>(null);
    const { user } = useAuth();
    useEffect(() => {
        if (user?.role === "employee") {
            setEmployeeId(user?.employeeId || null);
        }

    }, [user])
    console.log(employeeId)
    // calculate end time
    const computeEnd = (start: string, duration: number): string => {
        const [timePart, period] = start.split(" ");
        let [hour, minute] = timePart.split(":").map(Number);

        if (period === "PM" && hour !== 12) hour += 12;
        if (period === "AM" && hour === 12) hour = 0;

        const d = new Date();
        d.setHours(hour, minute + duration, 0, 0);

        let h = d.getHours();
        const m = d.getMinutes();
        const ampm = h >= 12 ? "PM" : "AM";

        h = h % 12 || 12;

        return `${h.toString().padStart(2, "0")}:${m
            .toString()
            .padStart(2, "0")} ${ampm}`;
    };

    const loadBookings = async () => {
        try {
            setLoading(true);

            const res = await fetch("http://localhost:3500/api/auth/bookings", {
                credentials: "include",
            });

            const response = await res.json();
            console.log(response)

            const employeeBookings = response.filter(
                (b: any) => b.employee?._id === employeeId
            );

            const bookingData: Booking[] = employeeBookings.map((b: any) => ({
                id: b.bookingId,
                customer: b.customer?.fullName || "",

                date: dayjs(b.date).format("YYYY-MM-DD"),

                start: b.time,

                end: computeEnd(b.time, b.totalDuration),

                services: Array.isArray(b.services)
                    ? b.services.map((s: any) => s.name)
                    : [],

                price: b.totalPrice,

                status: b.status,
            }));

            setData(bookingData);
        } catch (err) {
            message.error("Failed to load bookings");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (employeeId) {
            loadBookings();
        }
    }, [employeeId]);

    const now = new Date();

    const filtered = data.filter((b) => {
        const dt = dayjs(`${b.date} ${b.end}`, "YYYY-MM-DD hh:mm A").toDate();

        if (activeTab === "upcoming")
            return b.status !== "cancelled" && b.status !== "completed" && dt > now;

        if (activeTab === "completed")
            return b.status === "completed";

        if (activeTab === "cancelled")
            return b.status === "cancelled";

        return true;
    });
    const changeStatus = async (id: string, status: BookingStatus) => {
        try {
            await fetch(`http://localhost:3500/api/auth/bookings/${id}`, {
                method: "PUT",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status }),
            });

            setData((prev) =>
                prev.map((b) =>
                    b.id === id ? { ...b, status } : b
                )
            );

            if (viewData?.id === id) {
                setViewData({ ...viewData, status });
            }

            message.success(`Booking ${status}`);
        } catch {
            message.error("Failed to update booking");
        }
    };



    const columns: ColumnsType<Booking> = [
        {
            title: "Booking ID",
            dataIndex: "id",
        },
        {
            title: "Customer",
            dataIndex: "customer",
        },
        {
            title: "Date",
            render: (_, r) => new Date(r.date).toDateString(),
        },
        {
            title: "Time",
            render: (_, r) => `${r.start} - ${r.end}`,
        },
        {
            title: "Status",
            dataIndex: "status",
            render: (status: BookingStatus) => (
                <Tag
                    color={
                        status === "pending"
                            ? "gold"
                            : status === "confirmed"
                                ? "green"
                                : status === "completed"
                                    ? "blue"
                                    : "red"
                    }
                >
                    {status}
                </Tag>
            ),
        },
        {
            title: "Actions",
            render: (_, record) => {
                const bookingDateTime = dayjs(
                    `${record.date} ${record.end}`,
                    "YYYY-MM-DD hh:mm A"
                ).toDate();

                return (
                    <div className="flex gap-2">
                        <Button
                            type="primary"
                            size="small"
                            onClick={() => setViewData(record)}
                        >
                            View
                        </Button>

                        <Button
                            danger
                            size="small"
                            disabled={
                                record.status === "cancelled" ||
                                record.status === "completed" ||
                                bookingDateTime <= now
                            }
                            onClick={() => setCancelId(record.id)}
                        >
                            Cancel
                        </Button>
                    </div>
                );
            },
        },
    ];

    return (
        <Layout rootClassName="min-h-screen !bg-slate-100">
            <Sidebar />

            <Content className="p-4 md:p-6 md:ml-64">
                <h1 className="text-3xl font-semibold mb-1">My Bookings</h1>

                <p className="text-gray-500 mb-6">
                    Employee booking confirmation panel
                </p>

                <div className="flex gap-3 mb-6">
                    {(["all", "upcoming", "completed", "cancelled"] as TabType[]).map(
                        (tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 rounded-xl text-sm ${activeTab === tab
                                    ? "bg-white border"
                                    : "text-gray-500"
                                    }`}
                            >
                                {tab.toUpperCase()}
                            </button>
                        )
                    )}
                </div>

                <Table
                    loading={loading}
                    columns={columns}
                    dataSource={filtered}
                    rowKey="id"
                    pagination={{ pageSize: 5 }}
                    bordered
                />
            </Content>

            <Modal
                open={!!cancelId}
                onCancel={() => setCancelId(null)}
                onOk={() => {
                    if (cancelId) changeStatus(cancelId, "cancelled");
                    setCancelId(null);
                }}
                okText="Yes, Cancel"
            >
                Are you sure you want to cancel <b>{cancelId}</b>?
            </Modal>

            <Modal
                open={!!viewData}
                title="Booking Details"
                onCancel={() => setViewData(null)}
                footer={[
                    ...(viewData?.status === "pending"
                        ? [
                            <Button
                                key="confirm"
                                type="primary"
                                onClick={() =>
                                    changeStatus(viewData.id, "confirmed")
                                }
                            >
                                Confirm
                            </Button>,
                        ]
                        : []),

                    ...(viewData?.status === "confirmed"
                        ? [
                            <Button
                                key="complete"
                                className="bg-green-600! text-white!"
                                onClick={() =>
                                    changeStatus(viewData.id, "completed")
                                }
                            >
                                Mark Completed
                            </Button>,
                        ]
                        : []),

                    <Button key="close" onClick={() => setViewData(null)}>
                        Close
                    </Button>,
                ]}
            >
                {viewData && (
                    <div className="space-y-3 text-sm p-4 bg-gray-50 rounded-xl">
                        <p className="border-b pb-2">
                            <b className="text-blue-600">ID:</b> {viewData.id}
                        </p>

                        <p className="border-b pb-2">
                            <b className="text-blue-600">Customer:</b>{" "}
                            {viewData.customer}
                        </p>

                        <p className="border-b pb-2">
                            <b className="text-blue-600">Status:</b>{" "}
                            <Tag>{viewData.status}</Tag>
                        </p>

                        <p className="border-b pb-2">
                            <b className="text-blue-600">Date:</b>{" "}
                            {new Date(viewData.date).toDateString()}
                        </p>

                        <p className="border-b pb-2">
                            <b className="text-blue-600">Time:</b>{" "}
                            {viewData.start} - {viewData.end}
                        </p>

                        <p className="border-b pb-2">
                            <b className="text-blue-600">Price:</b>{" "}
                            <span className="text-green-600 font-semibold">
                                ₹{viewData.price}
                            </span>
                        </p>

                        <p>
                            <b className="text-blue-600">Services:</b>{" "}
                            {viewData.services.join(", ")}
                        </p>
                    </div>
                )}
            </Modal>
        </Layout>
    );
}

export default EmployeeBooking;