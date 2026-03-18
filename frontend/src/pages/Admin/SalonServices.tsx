import Sidebar from "../../components/Sidebar";
import { Layout, Button, Card, Tag, Input, Modal, Form, Switch, InputNumber, message, } from "antd";
import { PlusOutlined, SearchOutlined, EditOutlined, ClockCircleOutlined, } from "@ant-design/icons";
import { useEffect, useState} from "react";
import { useAuth } from "../../context/AuthContext";

const { Content } = Layout;

interface Service {
    _id: number;
    name: string;
    duration: string;
    price: number;
    status: "Active" | "Disabled";
    salonId: string;
}

interface FormFields {
    name: string;
    duration: string;
    price: number;
    enabled: boolean;
}

function SalonServices() {
    const { user } = useAuth();
    const [salonId, setSalonId] = useState<string | null>(null);
    const [services, setServices] = useState<Service[]>([]);
    const [search, setSearch] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm<FormFields>();


    useEffect(() => {
        if (user?.role === "Admin" && user.salonId) {
            setSalonId(user.salonId);
        }
    }, [user]);
    useEffect(() => {
        if (salonId) {
            loadServices();
        }
    }, [salonId]);
    const loadServices =  async () => {
        try {
            setLoading(true);
            const response = await fetch("http://localhost:3500/api/auth/services", {
                credentials: "include",
            });
            const data = await response.json();
            const filtered = data.filter((service: Service) => service.salonId === salonId);
            setServices(filtered);
        } catch {
            message.error("Failed to load services");
        } finally {
            setLoading(false);
        }
    };
    const handleSubmit = async (values: FormFields) => {
        try {
            const payload = {
                name: values.name,
                duration: `${values.duration} `,
                price: values.price,
                status: values.enabled ? "Active" : "Disabled",
                salonId,
            };

            if (editingService) {
                const response = await fetch(
                    `http://localhost:3500/api/auth/services/${editingService._id}`,
                    {
                        method: "PUT",
                        credentials: "include",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(payload),
                    }
                );
                const data = await response.json();

                if (!response.ok) {
                    message.error(data.message || "Failed to update service");
                    return;

                };

                message.success("Service updated successfully");
            } else {
                const response = await fetch(
                    "http://localhost:3500/api/auth/services",
                    {
                        method: "POST",
                        credentials: "include",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(payload),
                    }
                );

                if (!response.ok) throw new Error();

                message.success("Service added successfully");
            }

            form.resetFields();
            setIsModalOpen(false);
            setEditingService(null);
            loadServices();
        } catch {
            message.error("Operation failed");
        }
    };

    const toggleStatus = async (id: number) => {
        try {
            const service = services.find(s => s._id === id);
            if (!service) return;

            const updatedStatus =
                service.status === "Active" ? "Disabled" : "Active";

            const response = await fetch(
                `http://localhost:3500/api/auth/services/${id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        credentials: "include"
                    },
                    body: JSON.stringify({ status: updatedStatus }),
                }
            );

            if (!response.ok) throw new Error();

            setServices(prev =>
                prev.map(s =>
                    s._id === id ? { ...s, status: updatedStatus } : s
                )
            );

            message.success("Status updated");
        } catch {
            message.error("Failed to update status");
        }
    };
    const openEditModal = (service: Service) => {
        setEditingService(service);
        form.setFieldsValue({
            name: service.name,
            duration: service.duration,
            price: service.price,
            enabled: service.status === "Active",
        });
        setIsModalOpen(true);
    };
    const filteredServices = services.filter(s =>
        (s.name ?? "").toString().toLowerCase().includes((search ?? "").toString().toLowerCase())
    );
    return (
        <Layout rootClassName="min-h-screen !bg-slate-100">
            <Sidebar />

            <Content className="p-4 md:p-6 md:ml-64">
                <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-xl md:text-2xl font-semibold text-gray-800">
                            Services
                        </h1>
                        <p className="text-gray-500">
                            Manage your salon services
                        </p>
                    </div>

                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => {
                            setEditingService(null);
                            form.resetFields();
                            setIsModalOpen(true);
                        }}
                    >
                        Add Service
                    </Button>
                </header>

                <Input
                    placeholder="Search services..."
                    prefix={<SearchOutlined />}
                    className="w-full sm:w-96 mb-6"
                    onChange={e => setSearch(e.target.value)}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
                    {filteredServices.map(service => (
                        <Card
                            key={service._id}
                            className="rounded-xl border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 h-full"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="text-lg font-semibold ">
                                    {service.name}
                                </h3>
                                <Tag color={service.status === "Active" ? "green" : "red"}>
                                    {service.status}
                                </Tag>
                            </div>

                            <div className="mb-4 space-y-2">
                                <p className="text-sm text-gray-600 flex items-center gap-2">
                                    <ClockCircleOutlined />
                                    {service.duration}
                                </p>
                                <p className="text-lg font-semibold ">
                                    ${service.price}
                                </p>
                            </div>

                            <div className="flex gap-2 mt-auto">
                                <Button
                                    block
                                    icon={<EditOutlined />}
                                    onClick={() => openEditModal(service)}

                                    rootClassName="!bg-blue-500 !text-white"
                                >
                                    Edit
                                </Button>

                                <Button
                                    block
                                    onClick={() => toggleStatus(service._id)}
                                    className={
                                        service.status === "Active"
                                            ? "text-red-700! border-red-200! bg-red-50!"
                                            : "text-green-700! border-green-200! bg-green-50!"
                                    }
                                >
                                    {service.status === "Active" ? "Disable" : "Enable"}
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>


                <Modal
                    open={isModalOpen}
                    onCancel={() => setIsModalOpen(false)}
                    footer={null}
                    centered
                    width={480}
                >
                    <h2 className="text-xl font-semibold mb-1">
                        Add New Service
                    </h2>
                    <p className="text-gray-500 mb-6">
                        Fill in the details for your new service.
                    </p>

                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSubmit}
                    >
                        <Form.Item
                            label="Service Name"
                            name="name"
                            rules={[{ required: true }]}
                        >
                            <Input />
                        </Form.Item>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Form.Item
                                label="Duration (mins)"
                                name="duration"
                                rules={[{ required: true }]}
                            >
                                <InputNumber min={5} className="w-full" />
                            </Form.Item>

                            <Form.Item
                                label="Price"
                                name="price"
                                rules={[{ required: true }]}
                            >
                                <InputNumber min={0} className="w-full" />
                            </Form.Item>
                        </div>

                        <Form.Item
                            label="Enable Service"
                            name="enabled"
                            valuePropName="checked"
                            initialValue={true}
                        >
                            <Switch />
                        </Form.Item>

                        <div className="flex justify-end gap-3 mt-6">
                            <Button onClick={() => setIsModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                htmlType="submit"
                                type="primary"
                                rootClassName="!bg-blue-500"
                            >
                                Save
                            </Button>
                        </div>
                    </Form>
                </Modal>
            </Content>
        </Layout>
    );
}

export default SalonServices;
