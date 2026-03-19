import { useState } from "react";
import { Input, Button, message } from "antd";
import {
    UserOutlined,
    MailOutlined,
    PhoneOutlined,
    LockOutlined,
    EyeInvisibleOutlined,
    EyeOutlined,
    ShopOutlined,
    EnvironmentOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import "../../index.css";

type UserType = "customer" | "barber";

const SignUp = () => {
    const [userType, setUserType] = useState < UserType > ("customer");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const [customerForm, setCustomerForm] = useState({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
    });

    const [barberForm, setBarberForm] = useState({
        salonName: "",
        ownerName: "",
        email: "",
        phone: "",
        address: "",
        password: "",
        confirmPassword: "",
    });

    const validateCustomer = () => {
        const { fullName, email, phone, password, confirmPassword } = customerForm;
        if (!fullName || !email || !phone || !password || !confirmPassword) {
            message.error("Please fill all fields");
            return false;
        }
        if (password !== confirmPassword) {
            message.error("Passwords do not match");
            return false;
        }
        return true;
    };

    const validateBarber = () => {
        const { salonName, ownerName, email, phone, address, password, confirmPassword } =
            barberForm;
        if (!salonName || !ownerName || !email || !phone || !address || !password || !confirmPassword) {
            message.error("Please fill all fields");
            return false;
        }
        if (password !== confirmPassword) {
            message.error("Passwords do not match");
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (userType === "customer" && !validateCustomer()) return;
        if (userType === "barber" && !validateBarber()) return;

        const url =
            userType === "barber"
                ? "http://localhost:3500/api/auth/salonSignup"
                : "http://localhost:3500/api/auth/signup";

        const payload =
            userType === "barber"
                ? {
                    salonName: barberForm.salonName,
                    ownerName: barberForm.ownerName,
                    role: "Admin",         
                    email: barberForm.email,
                    phone: barberForm.phone,
                    address: barberForm.address,
                    password: barberForm.password,
                }
                : {
                    fullName: customerForm.fullName,
                    role: "customer",          
                    email: customerForm.email,
                    phone: customerForm.phone,
                    password: customerForm.password,
                }


        setLoading(true);
        try {
            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) {
                message.error(data.message);
                return;
            }

            message.success(
                userType === "barber"
                    ? "Salon registered! Await admin approval."
                    : "Account created successfully!"
            );

            navigate("/login");
        } catch (error) {
            message.error("Server error");
        } finally {
            setLoading(false);
        }
    };



    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-6">
                    <h2 className="text-3xl font-bold text-gray-900">Sign up</h2>
                    <p className="text-gray-500">Fill your information below</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <button
                        onClick={() => setUserType("barber")}
                        className={`relative p-5 border rounded-xl transition ${userType === "barber"
                            ? "border-blue-500 ring-2 ring-blue-500 text-blue-500"
                            : "border-gray-200"
                            }`}
                    >
                        <ShopOutlined className="text-3xl text-gray-400 mb-2" />
                        <p className="font-medium">Barber Shop</p>
                        {userType === "barber" && (
                            <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full" />
                        )}
                    </button>

                    <button
                        onClick={() => setUserType("customer")}
                        className={`relative p-5 border rounded-xl transition ${userType === "customer"
                            ? "border-blue-500 ring-1 ring-blue-500 text-blue-500"
                            : "border-gray-200"
                            }`}
                    >
                        <UserOutlined className="text-3xl text-blue-500 mb-2" />
                        <p className="font-medium ">Customer</p>
                        {userType === "customer" && (
                            <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full" />
                        )}
                    </button>
                </div>

                {userType === "customer" && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-1">
                                Full Name
                            </label>
                            <Input
                                size="large"
                                placeholder="John Doe"
                                prefix={<UserOutlined />}
                                value={customerForm.fullName}
                                onChange={(e) =>
                                    setCustomerForm({ ...customerForm, fullName: e.target.value })
                                }
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-1">
                                Email
                            </label>
                            <Input
                                size="large"
                                placeholder="abc@xyz.com"
                                prefix={<MailOutlined />}
                                value={customerForm.email}
                                onChange={(e) =>
                                    setCustomerForm({ ...customerForm, email: e.target.value })
                                }
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-1">
                                Phone No.
                            </label>
                            <Input
                                size="large"
                                placeholder="+91 9876543210"
                                prefix={<PhoneOutlined />}
                                value={customerForm.phone}
                                onChange={(e) =>
                                    setCustomerForm({ ...customerForm, phone: e.target.value })
                                }
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-1">
                                Password
                            </label>
                            <Input.Password
                                size="large"
                                placeholder="Enter password"
                                prefix={<LockOutlined />}
                                iconRender={(v) => (v ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
                                value={customerForm.password}
                                onChange={(e) =>
                                    setCustomerForm({ ...customerForm, password: e.target.value })
                                }
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-1">
                                Confirm Password
                            </label>
                            <Input.Password
                                size="large"
                                placeholder="Enter confirm password"
                                prefix={<LockOutlined />}
                                iconRender={(v) => (v ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
                                value={customerForm.confirmPassword}
                                onChange={(e) =>
                                    setCustomerForm({
                                        ...customerForm,
                                        confirmPassword: e.target.value,
                                    })
                                }
                            />
                        </div>
                    </div>
                )}

                {userType === "barber" && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-1">
                                Salon Name
                            </label>
                            <Input
                                placeholder="Salon Name"
                                prefix={<ShopOutlined />}
                                size="large"
                                value={barberForm.salonName}
                                onChange={(e) =>
                                    setBarberForm({ ...barberForm, salonName: e.target.value })
                                }
                            />
                        </div>

                        <div>

                            <label className="block text-sm font-medium text-gray-900 mb-1">
                                Owner Name
                            </label>
                            <Input
                                placeholder="Owner Name"
                                prefix={<UserOutlined />}
                                size="large"
                                value={barberForm.ownerName}
                                onChange={(e) =>
                                    setBarberForm({ ...barberForm, ownerName: e.target.value })
                                }
                            />
                        </div>

                        <div>

                            <label className="block text-sm font-medium text-gray-900 mb-1">
                                Email
                            </label>
                            <Input
                                placeholder="Email"
                                prefix={<MailOutlined />}
                                size="large"
                                value={barberForm.email}
                                onChange={(e) =>
                                    setBarberForm({ ...barberForm, email: e.target.value })
                                }
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-1">
                                Phone No.
                            </label>
                            <Input
                                placeholder="Phone No."
                                prefix={<PhoneOutlined />}
                                size="large"
                                value={barberForm.phone}
                                onChange={(e) =>
                                    setBarberForm({ ...barberForm, phone: e.target.value })
                                }
                            />
                        </div>

                        <div>

                            <label className="block text-sm font-medium text-gray-900 mb-1">
                                Address
                            </label>
                            <Input
                                placeholder="Address"
                                prefix={<EnvironmentOutlined />}
                                size="large"
                                value={barberForm.address}
                                onChange={(e) =>
                                    setBarberForm({ ...barberForm, address: e.target.value })
                                }
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-1">
                                Password
                            </label>
                            <Input.Password
                                placeholder="Password"
                                prefix={<LockOutlined />}
                                size="large"
                                iconRender={(v) => (v ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
                                value={barberForm.password}
                                onChange={(e) =>
                                    setBarberForm({ ...barberForm, password: e.target.value })
                                }
                            />
                        </div>

                        <div>

                            <label className="block text-sm font-medium text-gray-900 mb-1">
                                Confirm Password
                            </label>
                            <Input.Password
                                placeholder="Confirm Password"
                                prefix={<LockOutlined />}
                                size="large"
                                iconRender={(v) => (v ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
                                value={barberForm.confirmPassword}
                                onChange={(e) =>
                                    setBarberForm({
                                        ...barberForm,
                                        confirmPassword: e.target.value,
                                    })
                                }
                            />
                        </div>
                    </div>
                )}

                <Button
                    type="primary"
                    block
                    size="large"
                    loading={loading}
                    onClick={handleSubmit}
                    rootClassName="!mt-6 !h-12 !bg-blue-500 hover:!bg-blue-600"
                >
                    Sign up
                </Button>

                <p className="text-center text-sm text-gray-600 mt-4">
                    Already have an account?{" "}
                    <Link to="/login" className="text-blue-500 font-medium">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default SignUp;
