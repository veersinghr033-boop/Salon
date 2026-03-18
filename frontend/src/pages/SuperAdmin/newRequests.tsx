import { Layout, Button, Tag } from "antd";
import {
    CheckOutlined,
    CloseOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";

const { Content } = Layout;

interface Request {
    _id: string;
    salonName: string;
    ownerName: string;
    email: string;
    phone: string;
    address: string;
    description: string;
    requestDate: string;
    status: "pending" | "approved" | "rejected";
}

function NewRequests() {
    const [requests, setRequests] = useState<Request[]>([]);

    const load = async () => {
        const response = await fetch("http://localhost:3500/api/auth/salon", {
            credentials: "include",
        });
        const data = await response.json();

        const formatted = data.map((salon: any) => ({
            _id: salon._id,
            salonName: salon.salonName,
            ownerName: salon.ownerName,
            email: salon.email,
            phone: salon.phone,
            address: salon.address,
            description: salon.description,
            requestDate: new Date(salon.createdAt).toLocaleDateString(),
            status: salon.isApproved ? "approved" : "pending",
        }));

        setRequests(formatted);
    };

    useEffect(() => {
        load();
    }, []);
    const handleApprove = async (id: string) => {
        await fetch(`http://localhost:3500/api/auth/salon/${id}/approve`, {
            method: "PATCH",
            credentials: "include",
        });

        setRequests(prev =>
            prev.map(req =>
                req._id === id ? { ...req, status: "approved" } : req
            )
        );
    };

    const handleReject = (id: string) => {
        setRequests(prev =>
            prev.map(req =>
                req._id === id ? { ...req, status: "rejected" } : req
            )
        );
    };

    return (
        <Layout rootClassName="min-h-screen !bg-slate-100">
            <Sidebar />

            <Content className="p-4 md:p-6 md:ml-64">
                <header className="mb-6">
                    <h2 className="text-xl md:text-2xl font-semibold">
                        New Requests
                    </h2>
                    <p className="text-gray-500">
                        Review and approve company registration requests
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {requests.map(request => (

                        <div
                            key={request._id}
                            className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-lg font-semibold">
                                    {request.salonName}
                                </h3>
                                {request.status === "pending" && (
                                    <Tag color="orange">Pending</Tag>
                                )}
                                {request.status === "approved" && (
                                    <Tag color="green">Approved</Tag>
                                )}
                                {request.status === "rejected" && (
                                    <Tag color="red">Rejected</Tag>
                                )}
                            </div>

                            <div className="space-y-2 text-sm mb-4">
                                <p>
                                    <span className="font-medium">Owner:</span>{" "}
                                    {request.ownerName}
                                </p>
                                <p>
                                    <span className="font-medium">Email:</span>{" "}
                                    {request.email}
                                </p>
                                <p>
                                    <span className="font-medium">Phone:</span>{" "}
                                    {request.phone}
                                </p>
                                <p>
                                    <span className="font-medium">Address:</span>{" "}
                                    {request.address}
                                </p>
                                <p>
                                    <span className="font-medium">Requested:</span>{" "}
                                    {request.requestDate}
                                </p>
                            </div>


                            <div className="bg-gray-50 p-3 rounded mb-4 text-sm italic text-gray-600">
                                “{request.description}”
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <Button
                                    block
                                    type="primary"
                                    icon={<CheckOutlined />}
                                    onClick={() => handleApprove(request._id)}
                                    disabled={request.status !== "pending"}
                                    rootClassName="!rounded-lg !bg-blue-500"
                                >
                                    Approve
                                </Button>

                                <Button
                                    block
                                    danger
                                    icon={<CloseOutlined />}
                                    onClick={() => handleReject(request._id)}
                                    disabled={request.status !== "pending"}
                                    rootClassName="!rounded-lg"
                                >
                                    Reject
                                </Button>
                            </div>


                        </div>
                    ))}
                </div>
            </Content>
        </Layout>
    );
}

export default NewRequests;
