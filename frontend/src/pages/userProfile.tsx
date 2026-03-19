import { Layout, Button, Avatar, Input, Upload, message } from "antd";
import Sidebar from "../components/Sidebar";
import { EditOutlined, PhoneOutlined, UserOutlined, IdcardOutlined, CalendarOutlined, CheckCircleOutlined, BankOutlined, UploadOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";


const { Content } = Layout;
function UserProfile() {
    const [editMode, setEditMode] = useState(false);
    const { user } = useAuth();
    const [info, setInfo] = useState<any>({
        fullName: "",
        email: "",
        phone: "",
        role: "",
        memberSince: "",
        status: "",
        company: "",
        bio: ""
    })

    const userId = user?.userId;

    const userInfo = async () => {
        try {
            const res = await fetch("http://localhost:3500/api/auth/users", {
                credentials: "include",
            })
            const data = await res.json();
            if (res.ok && data) {
                const filterData = data.filter((u: any) => u._id === user?.userId)
                if (filterData.length > 0) {
                    setInfo(filterData[0])
                }
            }
        } catch (error) {
            console.error("Failed to fetch user info:", error);
        }

    }
    useEffect(() => {
        userInfo()
    }, [userId])
    console.log(info)
    return (
        <Layout className="min-h-screen bg-slate-100" >
            <Sidebar />
            <Content className="p-4 md:p-6 md:ml-64">
                <header className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-semibold">My Profile</h1>
                        <p className="text-gray-500">Manage your profile information and settings</p>
                    </div>

                    {editMode ? (
                        <div className="flex gap-2">
                            <Button type="primary" onClick={() => setEditMode(false)}>
                                Save
                            </Button>
                            <Button onClick={() => setEditMode(false)}>
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
                <div className="bg-white p-6 rounded-xl shadow">
                    <div className="flex items-center gap-6 mb-6">
                        <Avatar size={96} className="bg-blue-500" icon={<UserOutlined />} />
                        <div>
                            <h2 className="text-xl font-semibold">{info?.fullName || "Loading..."}</h2>
                            <p className="text-gray-500">{info?.email || "Loading..."}</p>
                        </div>
                    </div>
                </div>
                <div className="flex gap-6 mt-6">
                    <div className="flex-1 bg-white p-6 rounded-xl shadow w-1/2">

                        <h2 className="text-3xl font-semibold">Personal Information</h2>


                        <div className="space-y-4">
                            <div>
                                <label htmlFor="">Full Name</label>
                                <Input disabled={!editMode}
                                    value={info?.fullName}
                                    onChange={(e) =>
                                        setInfo((prev: any) =>
                                            prev ? { ...prev, fullName: e.target.value } : prev
                                        )
                                    }
                                />
                            </div>
                            <div>
                                <label htmlFor="">Email</label>
                                <Input disabled={!editMode}
                                    value={info?.email}
                                    onChange={(e) =>
                                        setInfo((prev: any) =>
                                            prev ? { ...prev, email: e.target.value } : prev
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
                                        setInfo((prev: any) =>
                                            prev ? { ...prev, phone: e.target.value } : prev
                                        )
                                    }
                                />
                            </div>
                            <div>
                                <Upload
                                    name="logo"
                                    // action={`http://localhost:3500/api/auth/salon/logo/${salonId}`}
                                   
                                    showUploadList={false}
                                    disabled={!editMode}
                                    onChange={(infoFile) => {
                                        if (infoFile.file.status === "done") {
                                            message.success("Logo uploaded");
                                            userInfo();
                                        }
                                        if (infoFile.file.status === "error") {
                                            message.error("Upload failed");
                                        }
                                    }}
                                >
                                    {info?.logoUrl ? (
                                        <Avatar
                                            // src={`http://localhost:3500/${info.logoUrl}`}
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
                    <div className="flex-1 bg-white p-6 rounded-xl shadow w-1/2">
                        <h2 className="text-3xl font-semibold">Account Details</h2>

                        <div className="space-y-4 mt-4">
                            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <span className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                                        <IdcardOutlined />
                                    </span>
                                    <div>
                                        <p className="text-sm font-semibold">Role</p>
                                        <p className="text-xs text-gray-500">Your access level</p>
                                    </div>
                                </div>
                                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
                                    {info?.role || "User"}
                                </span>
                            </div>

                            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <span className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                        <CalendarOutlined />
                                    </span>
                                    <div>
                                        <p className="text-sm font-semibold">Member Since</p>
                                        <p className="text-xs text-gray-500">Account creation date</p>
                                    </div>
                                </div>
                                <span className="text-sm font-semibold">
                                    {info?.createdAt ? new Date(info.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : "N/A"}
                                </span>
                            </div>

                            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <span className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                                        <CheckCircleOutlined />
                                    </span>
                                    <div>
                                        <p className="text-sm font-semibold">Account Status</p>
                                        <p className="text-xs text-gray-500">Verification status</p>
                                    </div>
                                </div>
                                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
                                    {info?.isActive ? "Active" : "Inactive"}
                                </span>
                            </div>

                            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <span className="p-2 bg-sky-50 rounded-lg text-sky-600">
                                        <BankOutlined />
                                    </span>
                                    <div>
                                        <p className="text-sm font-semibold">Company</p>
                                        <p className="text-xs text-gray-500">Associated salon</p>
                                    </div>
                                </div>
                                <span className="text-sm font-semibold">
                                    {info?.salonId ? "Associated Salon" : "No Company"}
                                </span>
                            </div>

                            <div className="mt-4">
                                <p className="text-sm font-semibold mb-2">Bio</p>
                                {editMode ? (
                                    <Input.TextArea
                                        value={info?.bio || ""}
                                        rows={3}
                                        onChange={(e) =>
                                            setInfo((prev: any) =>
                                                prev ? { ...prev, bio: e.target.value } : prev
                                            )
                                        }
                                    />
                                ) : (
                                    <div className="rounded-xl bg-slate-50 p-4 text-gray-700">
                                        {info?.bio || "No bio available"}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

            </Content>
        </Layout >
    )
}

export default UserProfile
