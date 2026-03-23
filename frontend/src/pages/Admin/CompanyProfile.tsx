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
    Image,
    type UploadProps,
} from "antd";

import {
    EditOutlined,
    EnvironmentOutlined,
    PhoneOutlined,
    MailOutlined,
    ClockCircleOutlined,
    UploadOutlined,
    DeleteOutlined,
} from "@ant-design/icons";

import dayjs from "dayjs";
import { memo, useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import PFP from "../../assets/pfp.png";


const { Content } = Layout;

interface CompanyInfo {
    name: string;
    description: string;
    address: string;
    phone: string;
    email: string;
    ownerName: string;
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
    const [avatarPreview, setAvatarPreview] = useState<string | null>(PFP);

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
                ownerName: salon.ownerName,
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
    const beforeUpload: UploadProps["beforeUpload"] = (file) => {
        // const isImage = file.type.startsWith("image/");
        const reader = new FileReader();
        reader.onload = () => setAvatarPreview(String(reader.result));
        reader.readAsDataURL(file);
        return false;
    };

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
                    <h1 className="text-3xl font-semibold">Company Profile</h1>

                    {editMode ? (
                        <div className="flex gap-2">
                            <Button type="primary" onClick={() =>{ setEditMode(false), handleSave()}}>
                                Save
                            </Button>
                            <Button onClick={() =>  setEditMode(false)}>
                                Cancel
                            </Button>
                        </div>
                    ) : (
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


                    <div className="bg-white shadow rounded-xl p-5">

                        <h2 className="text-2xl text-gray-600 font-semibold mb-4">
                            Basic Information
                        </h2>

                        <div className="space-y-4">
                            <div className=" flex  items-center gap-4">
                                <div className="relative inline-block group">
                                    {(info?.logoUrl || avatarPreview) ? (
                                        <Image
                                            src={avatarPreview || info?.logoUrl}
                                            alt="Company Logo"
                                            width={100}
                                            height={100}
                                            className="rounded-lg object-square mb-4"
                                        />
                                    ) : (
                                        <Avatar
                                            size={100}
                                            className="bg-gray-300 mb-4"
                                        />
                                    )}

                                    {editMode && (info?.logoUrl || avatarPreview) && (
                                        <Button

                                            shape="circle"
                                            size="small"
                                            icon={<DeleteOutlined />}
                                            className="absolute! bottom-10  left-10 opacity-0 transition-opacity duration-200 group-hover:opacity-50 bg-amber-300"
                                            onClick={() => {
                                                setAvatarPreview(null);
                                                setInfo((prev) => (prev ? { ...prev, logoUrl: undefined } : prev));
                                            }}
                                        />
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold">{info?.ownerName || "Loading..."}</h2>
                                    <p className="text-gray-500">{info?.email || "Loading..."}</p>
                                </div>
                            </div>

                            <div>
                                <label className="text-lg">Company Name</label>
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
                                <label className="text-lg">Description</label>
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
                                <label className="text-lg">
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
                                <label className="text-lg">
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
                                <label className="text-lg">
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


                            <div className="flex items-center gap-3">
                                <Upload
                                    name="logo"
                                    beforeUpload={beforeUpload}
                                    showUploadList={false}
                                    disabled={!editMode}

                                >


                                    <Button icon={<UploadOutlined />} disabled={!editMode} >
                                        Upload Background Image
                                    </Button>

                                </Upload>

                            </div>
                        </div>
                    </div>



                    <div className="bg-white shadow rounded-xl p-5">

                        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                            <ClockCircleOutlined /> Working Hours
                        </h2>

                        <div className="space-y-3">

                            {workingHours.map((item, index) => (

                                <div
                                    key={item.day}
                                    className="flex items-center justify-between border border-gray-300 rounded-lg p-3"
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

              
            </Content>
        </Layout>
    );
}

export default memo(CompanyProfile);