import { Layout, Button, Avatar, Input, Upload, message, type UploadProps } from "antd";
import Sidebar from "../components/Sidebar";
import { EditOutlined, PhoneOutlined, UserOutlined, IdcardOutlined, CalendarOutlined, CheckCircleOutlined, BankOutlined, UploadOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import PFP from "../assets/pfp.png";


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
    const [avatarPreview, setAvatarPreview] = useState<string | null>(PFP);
    const [changePasswordMode, setChangePasswordMode] = useState(false);
    const [passwords, setPasswords] = useState({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: ""
    })

    const userId = user?.userId;

    const userInfo = async () => {
        try {
            const res = await fetch(`http://localhost:3500/api/auth/users/${userId}`, {
                credentials: "include",
            })
            const data = await res.json();
            if (res.ok && data) {
                const filterData = data.map((item: any) => ({
                    fullName: item.fullName,
                    email: item.email,
                    phone: item.phone,
                    role: item.role,
                    createdAt: item.createdAt,
                    isActive: item.isActive,
                    salon: item.salon ? { name: item.salon.name } : null,
                    bio: item.bio,
                    avatar: item.avatarUrl,
                    description: item.salon.description
                }))
                if (filterData.length > 0) {
                    setInfo(filterData[0])
                }
            }
        } catch (error) {
            message.error("Failed to fetch user info:");
        }

    }
    const beforeUpload: UploadProps["beforeUpload"] = (file) => {
        // const isImage = file.type.startsWith("image/");
        const reader = new FileReader();
        reader.onload = () => setAvatarPreview(String(reader.result));
        reader.readAsDataURL(file);
        return false;
    };
    useEffect(() => {
        userInfo()
    }, [userId])
    const changePassword = async () => {
        const currentPassword = passwords.currentPassword.trim()
        const newPassword = passwords.newPassword.trim()
        const confirmNewPassword = passwords.confirmNewPassword.trim()
        if (!currentPassword || !newPassword || !confirmNewPassword) {
            message.error("Please fill in all password fields.");
            return;
        }
        if (newPassword !== confirmNewPassword) {
            message.error("New password and confirm password do not match.");
            return;
        }
        try {
            const res = await fetch(`http://localhost:3500/api/auth/${userId}/change-password`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({

                    currentPassword,
                    newPassword
                }),

            });
            const data = await res.json();
            if (res.ok) {
                message.success(data.message || "Password changed successfully.");
                setPasswords({
                    currentPassword: "",
                    newPassword: "",
                    confirmNewPassword: ""
                })
                setChangePasswordMode(false);
                setEditMode(false);
            } else {
                message.error(data.message || "Failed to change password.");
            }


        } catch (error) {
            message.error("Failed to change password.");
        }
    }
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
                        <div className="flex gap-1">
                            <Button type="primary" onClick={() => { setEditMode(false), setChangePasswordMode(false) }}>
                                Save
                            </Button>
                            <Button onClick={() => { setEditMode(false), setChangePasswordMode(false) }}>
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
                        <Avatar size={96} className="bg-blue-500" src={avatarPreview || info?.avatar} />
                        <div>
                            <h2 className="text-xl font-semibold">{info?.fullName || "Loading..."}</h2>
                            <p className="text-gray-500">{info?.email || "Loading..."}</p>
                        </div>
                    </div>
                </div>
                <div className="flex gap-6 mt-6">
                    <div className="flex-1 bg-white p-6 rounded-xl shadow w-1/2">

                        <h2 className="text-3xl font-semibold">Personal Information</h2>


                        <div className="space-y-3">
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
                            <div className=" flex items-center gap-3">
                                <Upload
                                    name="logo"
                                    beforeUpload={beforeUpload}
                                    showUploadList={false}
                                    disabled={!editMode}
                                >
                                    <Button icon={<UploadOutlined />} disabled={!editMode} >
                                        Upload Logo
                                    </Button>

                                </Upload>
                                <Button disabled={!editMode} type="primary" onClick={() => setChangePasswordMode(true)}>
                                    change Password
                                </Button>
                            </div>

                        </div>
                        {changePasswordMode && (
                            <div className="mt-3">
                                <h3 className="text-xl font-semibold mb-3">Change Password</h3>
                                <div className="space-y-3">
                                    <div>
                                        <label htmlFor="">Current Password</label>
                                        <Input.Password
                                            value={passwords.currentPassword}
                                            onChange={(e) =>
                                                setPasswords((prev) => ({ ...prev, currentPassword: e.target.value }))
                                            }
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="">New Password</label>
                                        <Input.Password
                                            value={passwords.newPassword}
                                            onChange={(e) =>
                                                setPasswords((prev) => ({ ...prev, newPassword: e.target.value }))
                                            }
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="">confirm NewPassword</label>
                                        <Input.Password
                                            value={passwords.confirmNewPassword}
                                            onChange={(e) =>
                                                setPasswords((prev) => ({ ...prev, confirmNewPassword: e.target.value }))
                                            }
                                        />
                                    </div>
                                    <div >
                                        <Button type="primary" onClick={changePassword}>
                                            Update Password
                                        </Button>
                                        <Button onClick={() => setChangePasswordMode(false)} className="ml-2">
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

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

                            {info?.salon?.name ? (
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
                                        {info?.salon?.name ? info?.salon.name : "No Company"}
                                    </span>
                                </div>
                            ) : null}

                            <div className="mt-3 flex gap-1.5 items-center">
                                <p className="text-sm font-semibold mb-2">Bio</p>
                                {editMode ? (
                                    <Input.TextArea 
                                        value={info?.description || ""}
                                        rows={2}
                                        onChange={(e) =>
                                            setInfo((prev: any) =>
                                                prev ? { ...prev, description: e.target.value } : prev
                                            )
                                        }
                                    />
                                ) : (
                                    <div className="rounded-xl bg-slate-100 p-4 text-gray-700">
                                        {info?.description || "No description available"}
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
