import { useState, useEffect, useMemo, memo } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, DatePicker, message } from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";

type Service = {
    id: string;
    name: string;
    duration: number;
    price: number;
};

type Employee = {
    id: string;
    name: string;
    Services?: Service[];
};

type Props = {
    salonName: string;
    salonId: string;
    services: Service[];
    employees: Employee[];
    hours: Record<string, string>;
    customerId: string;
    onClose: () => void;
};
type Slot = {
    time: string;
    isBooked: boolean;
};



const BookingFlow: React.FC<Props> = ({ salonName, services, employees, customerId, hours, salonId, onClose }) => {
    const [step, setStep] = useState(1);
    const navigate = useNavigate();
    const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
    const [availableTimeSlots, setAvailableTimeSlots] = useState<Slot[]>([]);


    const toggleService = (id: string) => {
        setSelectedServiceIds(prev =>
            prev.includes(id)
                ? prev.filter(sid => sid !== id)
                : [...prev, id]
        );
    };


    const selectedServices = useMemo(
        () =>
            services.filter(s =>
                selectedServiceIds.includes(s.id)
            ),
        [services, selectedServiceIds]
    );

    const totalDuration = useMemo(
        () =>
            selectedServices.reduce(
                (sum, s) => sum + s.duration,
                0
            ),
        [selectedServices]
    );

    const totalPrice = useMemo(
        () =>
            selectedServices.reduce(
                (sum, s) => sum + s.price,
                0
            ),
        [selectedServices]
    );
    const formatTime = (date: Date) => {
        return date.toTimeString().slice(0, 5);
    };

    const formatDate = (date: string) => {
        return new Date(date).toISOString().split("T")[0];
    };
    const isOverlapping = (slotTime: string, bookings: any[]) => {

        const slotStart = new Date(`${selectedDate}T${slotTime}`);

        const slotEnd = new Date(slotStart);
        slotEnd.setMinutes(slotEnd.getMinutes() + totalDuration);

        return bookings.some((b) => {

            const bookingStart = new Date(`${formatDate(b.date)}T${b.time}`);

            const bookingEnd = new Date(bookingStart);
            bookingEnd.setMinutes(bookingEnd.getMinutes() + b.duration);

            return slotStart < bookingEnd && slotEnd > bookingStart;
        });
    };
    

    
    const generateTimeSlots = async (date: string) => {
        if (!date || !selectedEmployeeId) return;

        try {
            const res = await fetch(
                `http://localhost:3500/api/auth/employees/${selectedEmployeeId}`,
                { credentials: "include" }
            );

            const data = await res.json();

            const bookings = data.bookedSlots || [];

            const filteredBookings = bookings.filter(
                (b: any) => formatDate(b.date) === date
            );

            const day = new Date(date).toLocaleDateString("en-US", {
                weekday: "short",
            });

            const dayHours = hours[day];

            if (!dayHours || dayHours === "Closed") {
                setAvailableTimeSlots([]);
                return;
            }

            const [open, close] = dayHours.split(" - ");

            const [oh, om] = open.split(":").map(Number);
            const [ch, cm] = close.split(":").map(Number);

            let current = new Date(date);
            current.setHours(oh, om, 0, 0);

            const closeTime = new Date(date);
            closeTime.setHours(ch, cm, 0, 0);

            const slots: Slot[] = [];

            while (current < closeTime) {

                const end = new Date(current);
                end.setMinutes(end.getMinutes() + totalDuration);

                if (end > closeTime) break;

                const time = formatTime(current);

                const isBooked = isOverlapping(time, filteredBookings);

                slots.push({
                    time,
                    isBooked
                });

                current.setMinutes(current.getMinutes() + totalDuration);
            }

            setAvailableTimeSlots(slots);

        } catch (err) {
            console.error(err);
            message.error("Slot loading failed");
        }
    };
    useEffect(() => {
        if (selectedDate && selectedEmployeeId) {
            generateTimeSlots(selectedDate);
        }
    }, [selectedDate, selectedEmployeeId, totalDuration]);

    useEffect(() => {
        if (selectedServiceIds.length === 0) {
            setSelectedEmployeeId(null);
        }
    }, [selectedServiceIds]);


    const selectedEmployee = useMemo(
        () =>
            employees.find(
                e => e.id === selectedEmployeeId
            ),
        [employees, selectedEmployeeId]
    );

    const confirmBooking = async () => {
        if (!selectedServiceIds || selectedServiceIds.length === 0) {
            message.error("Please select at least one service");
            return;
        }
        try {
            const bookingPayload = {
                salonId,
                serviceId: selectedServiceIds,
                date: selectedDate,
                time: selectedTime,
                employeeId: selectedEmployeeId,
                totalPrice,
                totalDuration,
                customerId
            };
            console.log("Booking payload:", bookingPayload);
            const response = await fetch("http://localhost:3500/api/auth/bookings", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(bookingPayload),
            });
            const data = await response.json();
            if (response.ok && data.booking) {
                message.success("Booking confirmed!");
                navigate("/customer/bookings");
                onClose();
            } else {
                const errorData = await response.json();
                message.error(`Booking failed: ${errorData.message}`);
                return;
            }

        } catch (error) {
            message.error("An error occurred while booking. Please try again.");
            return;

        }

        // alert("Booking Confirmed ");
        // navigate("/customer/bookings");
        // onClose();
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-2">
            <div className="md:col-span-1">
                <h2 className="text-xl font-semibold mb-4">
                    Book Appointment
                </h2>

                {step === 1 && (
                    <>
                        <h3 className="mb-2 font-medium">
                            Select Services (Multiple)
                        </h3>

                        {services.map(service => {
                            const isSelected = selectedServiceIds.includes(service.id); return (
                                <div
                                    key={service.id}
                                    onClick={() => toggleService(service.id)}
                                    className={`mb-3 cursor-pointer rounded-lg border-2 p-4 flex items-center gap-4 transition ${isSelected
                                        ? "border-blue-500 bg-white"
                                        : "border-gray-200 bg-white hover:border-gray-300"
                                        }`}
                                >
                                    <div >
                                        {isSelected ? (
                                            <CheckCircleOutlined className="text-blue-500! text-xl" />
                                        ) : (
                                            <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
                                        )}
                                    </div>
                                    <div className="">
                                        <h4 className="font-medium text-gray-800">{service.name}</h4>
                                        <p className="text-sm text-gray-500 mt-1">{service.duration} mins</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-semibold text-gray-800">₹{service.price}</p>
                                    </div>
                                </div>
                            );
                        })}

                        <Button
                            type="primary"
                            block
                            disabled={selectedServiceIds.length === 0}
                            onClick={() => setStep(2)}
                            className="mt-6 bg-red-500 hover:bg-red-600 border-red-500"
                            size="large"
                        >
                            Continue →
                        </Button>
                    </>
                )}
                {step === 2 && (
                    <>
                        <h3 className="mb-2 font-medium">Select Date</h3>
                        <DatePicker
                            disabledDate={current => {
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                return current && current.toDate() < today;
                            }}
                            onChange={d =>
                                setSelectedDate(
                                    d?.format("YYYY-MM-DD") || null
                                )
                            }
                        />

                        <div className="mt-4 flex gap-2">
                            <Button onClick={() => setStep(1)}>Back</Button>
                            <Button
                                type="primary"
                                disabled={!selectedDate}
                                onClick={() => setStep(3)}
                            >
                                Next
                            </Button>
                        </div>
                    </>
                )}
                {step === 3 && (
                    <>
                        <h3 className="mb-2 font-medium">
                            Select Employee
                        </h3>

                        {employees.map(emp => (
                            <Card
                                key={emp.id}
                                onClick={() =>
                                    setSelectedEmployeeId(emp.id)
                                }
                                className={`mb-2 cursor-pointer ${selectedEmployeeId === emp.id
                                    ? "border-blue-500 bg-blue-50"
                                    : ""
                                    }`}
                            >
                                {emp.name}
                            </Card>
                        ))}
                        <div className="mt-4 flex gap-2">
                            <Button onClick={() => setStep(2)}>Back</Button>
                            <Button
                                type="primary"
                                disabled={!selectedEmployeeId}
                                onClick={() => setStep(4)}
                            >
                                Next
                            </Button>
                        </div>


                    </>
                )}
                {step === 4 && (
                    <>
                        <h3 className="mb-2 font-medium">Select Time</h3>

                        <div className="flex flex-wrap gap-2">
                            {availableTimeSlots.map(slot => (
                                <Button
                                    key={slot.time}
                                    disabled={slot.isBooked}
                                    type={selectedTime === slot.time ? "primary" : "default"}
                                    onClick={() => setSelectedTime(slot.time)}
                                    style={{
                                        background: slot.isBooked ? "#f5f5f5" : "",
                                        color: slot.isBooked ? "#999" : ""
                                    }}
                                >
                                    {slot.time} 
                                </Button>
                            ))}
                        </div>


                        <div className="mt-4 flex gap-2">
                            <Button onClick={() => setStep(3)}>Back</Button>
                            <Button
                                type="primary"
                                disabled={!selectedTime}
                                onClick={confirmBooking}
                            >
                                Confirm Booking
                            </Button>
                        </div>

                    </>
                )}
            </div>

            <div className="border-gray-200 border rounded-lg p-4 h-fit sticky top-10 ">
                <h3 className="text-lg font-semibold mb-4">
                    Booking Summary
                </h3>

                <p className="border-b border-gray-200 pb-2"><b>Salon:</b> {salonName}</p>

                {selectedServices.length > 0 && (
                    <div className="space-y-3 py-3 ">
                        {selectedServices.map(s => (
                            <div key={s.id} className="flex justify-between items-start mb-2">
                                <div>
                                    <h4 className="font-medium text-gray-800">{s.name}</h4>
                                    <p className="text-sm text-gray-500">{s.duration} mins</p>
                                </div>
                                <p className="font-semibold text-gray-800">₹{s.price}</p>
                            </div>
                        ))}
                        <div className="border-t border-gray-200 pt-2">
                            <p className="font-semibold text-gray-800">
                                Total: ₹{totalPrice}
                            </p>
                        </div>
                    </div>

                )}

                {selectedDate && (
                    <div className=" py-3 border-t border-gray-200">
                        <p className="text-sm text-gray-600"><b>Date:</b> {selectedDate}</p>
                    </div>
                )}

                {selectedTime && (
                    <div className=" py-3 border-t border-gray-200">
                        <p className="text-sm text-gray-600"><b>Time:</b> {selectedTime}</p>
                    </div>
                )}

                {selectedEmployee && (
                    <div className=" py-3 border-t border-gray-200">
                        <p className="text-sm text-gray-600"><b>Employee:</b> {selectedEmployee.name}</p>
                    </div>
                )}

                {selectedServices.length > 0 && (
                    <Button
                        type="primary"
                        block
                        disabled={!selectedDate || !selectedTime || !selectedEmployeeId}
                        onClick={confirmBooking}
                        size="large"
                    >
                        Confirm Booking
                    </Button>
                )}
            </div>
        </div>
    );
};

export default memo(BookingFlow);
