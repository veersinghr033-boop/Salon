import { useState, useCallback, useEffect, memo } from "react";
import { Input, Button, message } from "antd";
import { MailOutlined, LockOutlined, EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
// import { apiPost } from "../../utills/api";
import "../../index.css";

const Login = memo(() => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    // const [showPassword, setShowPassword] = useState(false);
    const [signInLoading, setSignInLoading] = useState(false);
    const navigate = useNavigate();
    const { user, loading, checkAuth } = useAuth();



    const userRole = useCallback((role: string) => {
        if (role === "superadmin") {
            navigate("/superAdmin", { replace: true });
        }
        else if (role === "Admin") {
            navigate("/admin", { replace: true });
        }
        else if (role === "employee") {
            navigate("/employee", { replace: true });
        }
        else if (role === "customer") {
            navigate("/customer", { replace: true });
        }
        else {
            navigate("/login", { replace: true });
        }
    }, [navigate]);
    useEffect(() => {
        if (!loading && user) {
            userRole(user.role);
        }
    }, [loading, user, userRole]);


    const handleSignIn = async () => {
        setSignInLoading(true);

        const userEmail = email.trim();
        const Password = password.trim();

        try {
            const res = await fetch("http://localhost:3500/api/auth/login", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email: userEmail, password: Password }),
            })
            const data = await res.json();

            if (res.ok && data.user) {
                await checkAuth();

                userRole(data.user.role);
                console.log("Login successful:", data);


            } else {
                message.error(data?.message || "Login failed. Please try again.");
                console.log(data)
            }
        } catch (error) {
            message.error("Login failed. Please try again.");
        } finally {
            setSignInLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSignIn();
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 from-blue-50 to-white px-4">
            <div className="w-full max-w-md">

                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign in</h2>
                    <p className="text-gray-600">Sign in to manage your bookings</p>
                </div>

                <div className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                            Email
                        </label>
                        <Input
                            size="large"
                            placeholder="abc@xyz.com"
                            prefix={<MailOutlined className="text-gray-400" />}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onKeyPress={handleKeyPress}
                            className="rounded-lg"
                            style={{ borderRadius: "8px" }}
                        />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-sm font-medium text-gray-900">
                                Password
                            </label>

                        </div>
                        <Input.Password
                            size="large"
                            placeholder="Enter password"
                            prefix={<LockOutlined className="text-gray-400" />}
                            iconRender={(visible) =>
                                visible ? (
                                    <EyeOutlined className="text-gray-400" />
                                ) : (
                                    <EyeInvisibleOutlined className="text-gray-400" />
                                )
                            }
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyPress={handleKeyPress}
                            className="rounded-lg"
                            style={{ borderRadius: "8px" }}
                        />
                    </div>

                    <Button
                        type="primary"
                        size="large"
                        block
                        loading={signInLoading}
                        onClick={handleSignIn}
                        rootClassName="!bg-blue-500 !text-white !font-semibold !rounded-lg !h-12 !text-base hover:!bg-blue-600"
                    >
                        Sign In →
                    </Button>
                </div>


                <div className="text-center mt-6">
                    <p className="text-gray-600">
                        Don't have an account?{" "}
                        <Link to="/signup" className="text-blue-500 font-semibold hover:text-blue-600 border-b-2 border-blue-500">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
});

export default Login;
