import Sidebar from "../../components/Sidebar";
import {
    Layout,
    Button,
    Input,
    Checkbox,
    TimePicker,
    message,
    Upload,
    Avatar,
} from "antd";

import {
    EditOutlined,
    EnvironmentOutlined,
    PhoneOutlined,
    MailOutlined,
    ClockCircleOutlined,
    UploadOutlined,
} from "@ant-design/icons";

import dayjs from "dayjs";
import { memo, useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

const { Content } = Layout;

interface CompanyInfo {
    name: string;
    description: string;
    address: string;
    phone: string;
    email: string;
    logoUrl?: string;
}

interface WorkingHour {
    day: string;
    open: boolean;
    start: string;
    end: string;
}

function CompanyProfile() {

    const { user } = useAuth();

    const [editMode, setEditMode] = useState(false);
    const [info, setInfo] = useState<CompanyInfo | null>(null);
    const [workingHours, setWorkingHours] = useState<WorkingHour[]>([]);
    const [salonId, setSalonId] = useState("");

    useEffect(() => {
        if (user?.role === "Admin" && user?.salonId) {
            setSalonId(user?.salonId);
        }
    }, [user]);

    useEffect(() => {
        if (salonId) {
            loadCompanyInfo();
        }
    }, [salonId]);

    const loadCompanyInfo = async () => {
        try {
            const response = await fetch("http://localhost:3500/api/auth/salon", {
                credentials: "include",
            });

            const data = await response.json();
            console.log(data)

            const salon = data.find((s: any) => s._id === salonId);

            if (!salon) return;

            setInfo({
                name: salon.salonName,
                description: salon.description,
                address: salon.address,
                phone: salon.phone,
                email: salon.email,
                logoUrl: salon.logo,
            });

            const hoursMap = salon.hours || {};

            const parsedHours: WorkingHour[] = Object.keys(hoursMap).map((dayKey) => {
                const hourStr = hoursMap[dayKey];

                if (hourStr && hourStr !== "Closed") {
                    const [start, end] = hourStr.split(" - ");

                    return {
                        day: dayKey,
                        open: true,
                        start,
                        end,
                    };
                }

                return {
                    day: dayKey,
                    open: false,
                    start: "",
                    end: "",
                };
            });

            setWorkingHours(parsedHours);
        } catch (error) {
            message.error("Failed to load company info");
        }
    };

    // save profile
    const handleSave = async () => {
        if (!info) return;

        const hoursPayload: Record<string, string> = {};

        workingHours.forEach((h) => {
            const key = h.day.substring(0, 3);

            hoursPayload[key] = h.open ? `${h.start} - ${h.end}` : "Closed";
        });

        const updatedInfo = {
            salonName: info.name,
            description: info.description,
            address: info.address,
            phone: info.phone,
            email: info.email,
            hours: hoursPayload,
        };

        try {
            const response = await fetch(
                `http://localhost:3500/api/auth/salon/${salonId}`,
                {
                    method: "PATCH",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(updatedInfo),
                }
            );

            const data = await response.json();

            if (response.ok) {
                message.success("Company profile updated successfully");
                setEditMode(false);
                loadCompanyInfo();
            } else {
                message.error(data.message || "Update failed");
            }
        } catch {
            message.error("Server error");
        }
    };

    const handleCancel = async () => {
        await loadCompanyInfo();
        setEditMode(false);
    };

    // change working hours
    const handleHoursChange = (
        index: number,
        key: keyof WorkingHour,
        value: string | boolean
    ) => {
        setWorkingHours((prev) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [key]: value };
            return updated;
        });
    };

    return (
        <Layout className="min-h-screen bg-slate-100">
            <Sidebar />
            <Content className="p-6 md:ml-64">
                <header className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold">Company Profile</h1>

                    {!editMode && (
                        <Button
                            type="primary"
                            icon={<EditOutlined />}
                            onClick={() => setEditMode(true)}
                        >
                            Edit Profile
                        </Button>
                    )}
                </header>

                <div className="grid lg:grid-cols-2 gap-6">

                    {/* BASIC INFO */}

                    <div className="bg-white shadow rounded-xl p-5">

                        <h2 className="text-lg font-semibold mb-4">
                            Basic Information
                        </h2>

                        <div className="space-y-4">

                            <div>
                                <label>Company Name</label>
                                <Input
                                    disabled={!editMode}
                                    value={info?.name || ""}
                                    onChange={(e) =>
                                        setInfo((prev) =>
                                            prev ? { ...prev, name: e.target.value } : prev
                                        )
                                    }
                                />
                            </div>

                            <div>
                                <label>Description</label>
                                <Input.TextArea
                                    rows={3}
                                    disabled={!editMode}
                                    value={info?.description}
                                    onChange={(e) =>
                                        setInfo((prev) =>
                                            prev
                                                ? { ...prev, description: e.target.value }
                                                : prev
                                        )
                                    }
                                />
                            </div>

                            <div>
                                <label>
                                    <EnvironmentOutlined /> Address
                                </label>

                                <Input
                                    disabled={!editMode}
                                    value={info?.address}
                                    onChange={(e) =>
                                        setInfo((prev) =>
                                            prev
                                                ? { ...prev, address: e.target.value }
                                                : prev
                                        )
                                    }
                                />
                            </div>

                            <div>
                                <label>
                                    <PhoneOutlined /> Phone
                                </label>

                                <Input
                                    disabled={!editMode}
                                    value={info?.phone}
                                    onChange={(e) =>
                                        setInfo((prev) =>
                                            prev ? { ...prev, phone: e.target.value } : prev
                                        )
                                    }
                                />
                            </div>

                            <div>
                                <label>
                                    <MailOutlined /> Email
                                </label>

                                <Input
                                    disabled={!editMode}
                                    value={info?.email}
                                    onChange={(e) =>
                                        setInfo((prev) =>
                                            prev ? { ...prev, email: e.target.value } : prev
                                        )
                                    }
                                />
                            </div>


                            <div>
                               

                                <Upload
                                    name="logo"
                                    action={`http://localhost:3500/api/auth/salon/logo/${salonId}`}
                                    headers={{
                                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                                    }}
                                    showUploadList={false}
                                    disabled={!editMode}
                                    onChange={(infoFile) => {
                                        if (infoFile.file.status === "done") {
                                            message.success("Logo uploaded");
                                            loadCompanyInfo();
                                        }
                                        if (infoFile.file.status === "error") {
                                            message.error("Upload failed");
                                        }
                                    }}
                                >
                                    {info?.logoUrl ? (
                                        <Avatar
                                            src={`http://localhost:3500/${info.logoUrl}`}
                                            size={100}
                                            shape="square"
                                        />
                                    ) : (
                                        <Button icon={<UploadOutlined />}>
                                            Upload Logo
                                        </Button>
                                    )}
                                </Upload>
                            </div>
                        </div>
                    </div>

                   

                    <div className="bg-white shadow rounded-xl p-5">

                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <ClockCircleOutlined /> Working Hours
                        </h2>

                        <div className="space-y-3">

                            {workingHours.map((item, index) => (

                                <div
                                    key={item.day}
                                    className="flex items-center justify-between border rounded-lg p-3"
                                >

                                    <div className="font-medium">{item.day}</div>

                                    <Checkbox
                                        disabled={!editMode}
                                        checked={item.open}
                                        onChange={(e) =>
                                            handleHoursChange(
                                                index,
                                                "open",
                                                e.target.checked
                                            )
                                        }
                                    >
                                        Open
                                    </Checkbox>

                                    {item.open ? (
                                        <div className="flex items-center gap-2">

                                            <TimePicker
                                                disabled={!editMode}
                                                value={
                                                    item.start
                                                        ? dayjs(item.start, "HH:mm")
                                                        : null
                                                }
                                                format="hh:mm A"
                                                use12Hours
                                                onChange={(t) =>
                                                    handleHoursChange(
                                                        index,
                                                        "start",
                                                        t ? t.format("HH:mm") : ""
                                                    )
                                                }
                                            />

                                            <span>to</span>

                                            <TimePicker
                                                disabled={!editMode}
                                                value={
                                                    item.end
                                                        ? dayjs(item.end, "HH:mm")
                                                        : null
                                                }
                                                format="hh:mm A"
                                                use12Hours
                                                onChange={(t) =>
                                                    handleHoursChange(
                                                        index,
                                                        "end",
                                                        t ? t.format("HH:mm") : ""
                                                    )
                                                }
                                            />
                                        </div>
                                    ) : (
                                        <span className="text-gray-500 italic">
                                            Closed
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {editMode && (
                    <div className="flex gap-3 mt-6">
                        <Button
                            type="primary"
                            className="bg-green-600"
                            onClick={handleSave}
                        >
                            Save Changes
                        </Button>

                        <Button danger onClick={handleCancel}>
                            Cancel
                        </Button>
                    </div>
                )}
            </Content>
        </Layout>
    );
}

export default memo(CompanyProfile);