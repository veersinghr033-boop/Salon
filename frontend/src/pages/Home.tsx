import { Button } from "antd";
import {
    CheckCircleOutlined,
    ClockCircleOutlined,
    ScissorOutlined,
    //   CalendarCheck,
    TeamOutlined,
    StarOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "../index.css";

const Home = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-200">
            <nav className="border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-! rounded-lg flex items-center justify-center text-white font-bold">
                            <ScissorOutlined/>
                        </div>
                        <span className="text-xl font-bold text-gray-900">GlowBook</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate("/login")}
                            className="text-gray-900 font-medium hover:text-blue-!"
                        >
                            Sign in
                        </button>
                        <Button
                            type="primary"
                            onClick={() => navigate("/signup")}
                            rootClassName="!bg-blue-! !text-white !font-semibold hover:!bg-blue-600"
                        >
                            Get started
                        </Button>
                    </div>
                </div>
            </nav>

            <section className="py-8 px-4 bg-slate-100 ">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="flex justify-center mb-6">
                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                            <CheckCircleOutlined /> Trusted by 50k+ users
                        </span>
                    </div>

                    <div className="mb-8">
                        <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-4">
                            Book Your Perfect
                        </h1>
                        <div className="h-2 w-full bg-blue-! rounded-full mb-8"></div>
                    </div>

                    <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                        Discover top-rated salons, book appointments effortlessly, and look
                        your best every day with GlowBook.
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
                        <Button
                            type="primary"
                            size="large"
                            onClick={() => navigate("/signup")}
                            rootClassName="!bg-blue-! !text-white !font-semibold !rounded-lg !px-8 hover:!bg-blue-600"
                        >
                            Start Booking →
                        </Button>
                        <Button
                            size="large"
                            onClick={() => navigate("/signup")}
                            rootClassName="!text-blue-! !font-semibold !rounded-lg !px-8 border border-blue-200 !bg-blue-50 hover:!bg-blue-100"
                        >
                            For Salon Owners
                        </Button>
                    </div>

                    <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                            <CheckCircleOutlined className="text-blue-!" />
                            <span>No hidden fees</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircleOutlined className="text-blue-!" />
                            <span>Instant confirmation</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircleOutlined className="text-blue-!" />
                            <span>24/7 availability</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircleOutlined className="text-blue-!" />
                            <span>Instant payments</span>
                        </div>
                    </div>
                </div>
            </section>

            
            <section className="py-8 px-4 bg-slate-100">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-900 mb-2">
                            Why Choose GlowBook?
                        </h2>
                        <p className="text-gray-600">
                            We make booking beauty appointments simple, fast, and enjoyable.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-white p-8 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
                            <div className="flex justify-center mb-4">
                                <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center">
                                    <ClockCircleOutlined className="text-3xl !text-blue-!" />
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">
                                Easy Booking
                            </h3>
                            <p className="text-gray-600 text-center text-sm">
                                Book appointments in seconds with our intuitive interface
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
                            <div className="flex justify-center mb-4">
                                <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center">
                                    <TeamOutlined className="text-3xl !text-blue-!" />
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">
                                Expert Stylists
                            </h3>
                            <p className="text-gray-600 text-center text-sm">
                                Connect with top-rated professionals in your area
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
                            <div className="flex justify-center mb-4">
                                <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center">
                                    <StarOutlined className="text-3xl !text-blue-!" />
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">
                                Verified Reviews
                            </h3>
                            <p className="text-gray-600 text-center text-sm">
                                Read authentic reviews from real customers
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            

            <footer className="border-t border-gray-200 bg-slate-200 py-4 px-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-! rounded-lg flex items-center justify-center text-white text-xl font-bold">
                            <ScissorOutlined/>
                        </div>
                        <span className="font-semibold text-gray-900">GlowBook</span>
                    </div>
                    <p className="text-gray-600 text-sm">
                        © 2024 GlowBook. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Home;
