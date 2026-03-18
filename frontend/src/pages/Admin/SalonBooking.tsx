import Sidebar from "../../components/Sidebar";
import {
  Layout,
  Input,
  Button,
  Table,
  Tag,
  DatePicker,
  Select,
  message,
  Spin,
} from "antd";
import {
  EyeOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { useAuth } from "../../context/AuthContext";

const { Content } = Layout;

interface Booking {
  _id: string;
  bookingId: string;
  salon?: string;
  services: string[];

  customer: string;
  employee: string;
  date: string;
  time: string;
  status: string;
  salonId: string;
}

function SalonBooking() {
  const [salonId, setSalonId] = useState<string | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState<any>(null);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedEmployee, setSelectedEmployee] = useState("all");

  useEffect(() => {
    if (user?.role === "Admin" && user.salonId) {
      setSalonId(user.salonId);
    }
  }, [user]);


  console.log(salonId)
  const loadBookings = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:3500/api/auth/bookings", {
        credentials: "include",
      });
      const data = await res.json();
      console.log(data)

      if (res.ok) {

        const salonBookings = data.filter((b: any) => b.salon?._id === salonId);
        if (salonBookings && salonBookings.length > 0) {
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
            salonId: b.salon?._id || b.salonId || "",
          }));
          setBookings(bookingData);
        } else {
          setBookings([]);
          message.info("No bookings found for this salon");
        }

      } else {
        message.error(data.message || "Failed to load bookings");
      }
    } catch {
      message.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (salonId) {
      loadBookings();
    }
  }, [salonId]);


  useEffect(() => {
    let temp = [...bookings];

    if (search) {
      const term = search.toLowerCase();
      temp = temp.filter(
        b =>
          b.customer.toLowerCase().includes(term) ||
          b.bookingId?.toLowerCase().includes(term)
      );
    }

    if (selectedDate) {
      temp = temp.filter(b =>
        dayjs(b.date).isSame(selectedDate, "day")
      );
    }

    if (selectedStatus !== "all") {
      temp = temp.filter(b => b.status === selectedStatus);
    }

    if (selectedEmployee !== "all") {
      temp = temp.filter(b => b.employee === selectedEmployee);
    }

    setFilteredBookings(temp);
  }, [search, selectedDate, selectedStatus, selectedEmployee, bookings]);


  // const updateStatus = async (id: string, status: string) => {
  //   try {
  //     await fetch(
  //       `http://localhost:3500/api/auth/bookings/${id}`,
  //       {
  //         method: "PUT",
  //         headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
  //         body: JSON.stringify({ status }),
  //       }
  //     );

  //     message.success("Status updated");
  //     loadBookings();
  //   } catch {
  //     message.error("Failed to update status");
  //   }
  // };



  const columns = [
    { title: "Booking ID", dataIndex: "bookingId" },
    { title: "Customer", dataIndex: "customer" },
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
    { title: "Employee", dataIndex: "employee" },
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
      title: "View",
      render: () => <Button type="text" icon={<EyeOutlined />} />,
    },
  ];


  return (
    <Layout rootClassName="min-h-screen !bg-slate-100">
      <Sidebar />

      <Content className="p-4 md:p-6 md:ml-64">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold">Bookings</h1>
          <p className="text-gray-500">Manage all salon appointments</p>
        </header>

        <Input
          placeholder="Search by customer, ID..."
          prefix={<SearchOutlined />}
          className="w-full sm:w-96 mb-4"
          onChange={e => setSearch(e.target.value)}
        />

        <div className="flex flex-wrap gap-3 mb-6">
          <DatePicker
            value={selectedDate}
            onChange={value => setSelectedDate(value)}
            className="w-44"
          />

          <Select
            value={selectedStatus}
            onChange={setSelectedStatus}
            className="w-40"
            options={[
              { label: "All", value: "all" },
              { label: "Confirmed", value: "confirmed" },
              { label: "Completed", value: "completed" },
              { label: "Pending", value: "pending" },
              { label: "Cancelled", value: "cancelled" },
            ]}
          />

          <Select
            value={selectedEmployee}
            onChange={setSelectedEmployee}
            className="w-40"
            options={
              [
                { label: "All", value: "all" },
                ...Array.from(
                  new Set(bookings.map(b => b.employee).filter(Boolean))
                ).map(emp => ({
                  label: emp,
                  value: emp,
                })),
              ]
            }
          />
        </div>

        <div className="bg-white rounded-xl shadow">
          {loading ? (
            <Spin className="p-6" />
          ) : (
            <Table
              columns={columns}
              dataSource={filteredBookings}
              rowKey="_id"
              pagination={{ pageSize: 10 }}
              scroll={{ x: 900 }}
            />
          )}
        </div>
      </Content>
    </Layout>
  );
}

export default SalonBooking;