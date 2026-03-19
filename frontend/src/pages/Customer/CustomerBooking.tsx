import { Layout, Table, Tag, Button, Modal, message } from "antd";
import {
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import Sidebar from "../../components/Sidebar";
import { useEffect, useState, memo } from "react";
import dayjs from "dayjs";
import { useAuth } from "../../context/AuthContext";

const { Content } = Layout;

type TabType = "all" | "upcoming" | "completed" | "cancelled";

type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

type Booking = {
  id: string;
  salon: string;
  services: string[];
  date: string;
  time: string;
  status: BookingStatus;
  address: string;
  email: string;
  phone: string;
  employee: string;
  bookingId: string;
};

type EnrichedBooking = Booking & {
  datetime: Date;
};

function CustomerBooking() {
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [data, setData] = useState<Booking[]>([]);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [viewData, setViewData] = useState<EnrichedBooking | null>(null);
  const [loading, setLoading] = useState(false);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const { user } = useAuth();
  useEffect(() => {
    if (user?.role === "customer") {
      setCustomerId(user?.customerId || null);
    }
  }, [user]);

  const loadBookings = async () => {
    try {
      setLoading(true);

      const res = await fetch("http://localhost:3500/api/auth/bookings", {
        credentials: "include",
      });

      const result = await res.json();
      console.log(result)
      if (!res.ok) {
        message.error(result.message || "Failed to load bookings");
        return;
      }
      // console.log(result)
      const customerBookings = result.filter(
        (b: any) => b.customer?._id === customerId
      );

      const bookingData: Booking[] = customerBookings.map((b: any) => ({
        id: b._id,
        bookingId: b.bookingId,
        salon: b.salon?.salonName || "",
        address: b.salon?.address || "",
        email: b.salon?.email || "",
        phone: b.salon?.phone || "",
        employee: b.employee?.fullName || "",
        services: Array.isArray(b.services)
          ? b.services.map((s: any) => s.name || "")
          : [],
        date: dayjs(b.date).format("YYYY-MM-DD"),
        time: b.time,
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
    if(customerId) loadBookings();

  }, [customerId]);


  const now = new Date();

  const enriched: EnrichedBooking[] = data.map((b) => ({
    ...b,
    datetime: dayjs(`${b.date} ${b.time}`, "YYYY-MM-DD hh:mm A").toDate(),
    
  }));
  console.log(now)
  console.log(enriched)

  
  const filtered = enriched.filter((b) => {
    if (activeTab === "upcoming")
      return b.status !== "cancelled" && b.status !== "completed" && b.datetime > now;

    if (activeTab === "completed")
      return b.status === "completed";

    if (activeTab === "cancelled")
      return b.status === "cancelled";

    return true;
  });

  const getStatusColor = (status: BookingStatus) => {
    if (status === "confirmed") return "blue";
    if (status === "completed") return "green";
    if (status === "cancelled") return "red";
    return "gold";
  };

  const handleCancelConfirm = async () => {
    if (!cancelId) return;
    try {
      const res = await fetch(`http://localhost:3500/api/auth/bookings/${cancelId}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "cancelled" }),
      });

      if (res.ok) {
        setData((prev) =>
          prev.map((b) =>
            b.id === cancelId ? { ...b, status: "cancelled" } : b
          )
        );
        message.success("Booking cancelled");
      } else {
        message.error("Failed to cancel booking");
      }
    } catch (error) {
      message.error("Failed to cancel booking");
    } finally {
      setCancelId(null);
      setViewData(null);
    }
  };
  //  const changeStatus = async (id: string, status: BookingStatus) => {
  //         try {
  //             await fetch(`http://localhost:3500/api/auth/bookings/${id}`, {
  //                 method: "PUT",
  //                 headers: {
  //                     "Content-Type": "application/json",
  //                     Authorization: `Bearer ${localStorage.getItem("token")}`,
  //                 },
  //                 body: JSON.stringify({ status }),
  //             });

  //             setData((prev) =>
  //                 prev.map((b) =>
  //                     b.id === id ? { ...b, status } : b
  //                 )
  //             );

  //             if (viewData?.id === id) {
  //                 setViewData({ ...viewData, status });
  //             }

  //             message.success(`Booking ${status}`);
  //         } catch {
  //             message.error("Failed to update booking");
  //         }
  //     };

  const columns = [
    { title: "Salon", dataIndex: "salon" },

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

    {
      title: "Date & Time",
      render: (_: any, record: EnrichedBooking) =>
        `${record.date} • ${record.time}`,
    },

    {
      title: "Status",
      dataIndex: "status",
      render: (status: BookingStatus) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      ),
    },

    {
      title: "Action",
      render: (_: any, record: EnrichedBooking) => (
        <div className="flex gap-2">
          <Button
            size="small"
            onClick={() => setViewData(record)}
            className="bg-blue-500! text-white!"
          >
            View
          </Button>

          <Button
            danger
            size="small"
            disabled={
              record.status === "cancelled" ||
              record.status === "completed" ||
              record.datetime <= now
            }
            onClick={() => setCancelId(record.id)}
          >
            Cancel
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Layout className="min-h-screen bg-slate-100">
      <Sidebar />

      <Content className="p-4 md:p-6 md:ml-64">
        <header className="mb-6">
          <h1 className="text-xl md:text-2xl font-semibold">
            My Bookings
          </h1>
          <p className="text-gray-600">
            View and manage your salon appointments
          </p>
        </header>

        <div className="flex flex-wrap gap-3 mb-4">
          {(["all", "upcoming", "completed", "cancelled"] as TabType[]).map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-sm border transition
                ${activeTab === tab
                    ? "border-gray-400 bg-white"
                    : "border-transparent text-gray-500"
                  }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            )
          )}
        </div>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={filtered}
          loading={loading}
          pagination={{ pageSize: 5 }}
          scroll={{ x: 800 }}
          rowClassName={(record: EnrichedBooking) =>
            record.status === "cancelled" ? "opacity-50" : ""
          }
        />

        <Modal
          open={!!cancelId}
          onOk={handleCancelConfirm}
          onCancel={() => setCancelId(null)}
          okText="Yes, Cancel"
          okButtonProps={{ danger: true }}
          title="Cancel Booking"
        >
          Are you sure you want to cancel this booking?
        </Modal>

        <Modal open={!!viewData} onCancel={() => setViewData(null)} footer={null}>
          {viewData && (
            <div>
              <h1 className="text-xl font-semibold mb-3">
                {viewData.salon}
              </h1>

              <div className="flex justify-between mb-4">
                <Tag color={getStatusColor(viewData.status)}>
                  <CheckCircleOutlined className="mr-2" />
                  {viewData.status}
                </Tag>

                <span className="text-gray-500">{viewData.bookingId}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mb-4">
                <div className="flex items-center gap-2">
                  <CalendarOutlined /> {viewData.date}
                </div>

                <div className="flex items-center gap-2">
                  <ClockCircleOutlined /> {viewData.time}
                </div>

                <div className="flex items-center gap-2 sm:col-span-2">
                  <EnvironmentOutlined /> {viewData.address}
                </div>

                <div className="flex items-center gap-2 sm:col-span-2">
                  <UserOutlined /> {viewData.employee}
                </div>
              </div>

              <div className="mb-4">
                <div className="text-xs text-gray-400 mb-1">Services</div>

                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {viewData.services.join(", ")}
                </span>
              </div>

              <div className="text-sm space-y-1">
                <div className="flex items-center gap-2">
                  <PhoneOutlined /> {viewData.phone}
                </div>

                <div className="flex items-center gap-2">
                  <MailOutlined /> {viewData.email}
                </div>
              </div>
            </div>
          )}
        </Modal>
      </Content>
    </Layout>
  );
}

export default memo(CustomerBooking);