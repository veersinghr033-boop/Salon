import { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import {
  Layout,
  Input,
  Select,
  Space,
  Tag,
  message,
  Modal,
  Button,
} from "antd";
import { DeleteOutlined } from "@ant-design/icons";

interface Company {
  key: string;
  name: string;
  owner: string;
  email: string;
  status: "Active" | "Inactive";
  bookings: number;
}

const { Content } = Layout;

function CompaniesDetails() {

  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const loadCompanies = async () => {
    const response = await fetch("http://localhost:3500/api/auth/salon", {
      credentials: "include",
    });
    const data = await response.json();
    const filteredData = data.filter((salon: any) => salon.isApproved).map((salon: any) => ({
      key: salon._id,
      name: salon.salonName,
      owner: salon.ownerName,
      email: salon.email,
      status: salon.isActive ? "Active" : "Inactive",
      bookings: 0,
    }));
    setTimeout(() => {
      setCompanies(filteredData);
    }, 1000);
  }
  useEffect(() => {
    loadCompanies();
  }, []);

  const defaultWorkingHours: Record<string, string> = {
    Mon: "09:00 - 18:00",
    Tue: "09:00 - 18:00",
    Wed: "09:00 - 18:00",
    Thu: "09:00 - 20:00",
    Fri: "09:00 - 20:00",
    Sat: "10:00 - 17:00",
    Sun: "Closed",
  };

  const handleToggleStatus = async (key: string) => {
    const res = await fetch(`http://localhost:3500/api/auth/salon/${key}/toggle`, {
      method: "PATCH",
      credentials: "include",
    });
    if (!res.ok) {
      throw new Error("Failed to toggle salon status");
    }
    const data = await res.json();
    setCompanies(prev =>
      prev.map(company =>
        company.key === key
          ? {
            ...company,
            status: company.status === "Active" ? "Inactive" : "Active",
          }
          : company
      )
    );
    message.success("Status updated!");
  };

  const handleViewCompany = (company: Company) => {
    setSelectedCompany(company);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedCompany(null);
  };

  const handleDeactivate = () => {
    Modal.confirm({
      title: "Deactivate Company",
      content: `Are you sure you want to deactivate ${selectedCompany?.name}?`,
      okText: "Yes",
      cancelText: "No",
      okButtonProps: { danger: true },
      onOk() {
        message.success("Company deactivated successfully!");
        handleCloseModal();
      },
    });
  };

  return (
    <Layout rootClassName="min-h-screen !bg-slate-100">
      <Sidebar />

      <Content className="p-4 md:p-6 md:ml-64">
        <header className="mb-6">
          <h1 className="text-xl md:text-3xl font-semibold">Companies</h1>
          <p className="text-gray-500">
            Manage all registered salons and businesses
          </p>
        </header>

        <div className="mb-6 flex flex-col md:flex-row md:items-center gap-3 ">
          <Input.Search
            placeholder="Search companies..."
            className="md:w-3/5!"
          />

          <Space >
            <span className="font-medium text-gray-600">
              Filter by Status:
            </span>
            <Select
              defaultValue="all"
              style={{ width: 150 }}
              options={[
                { value: "all", label: "All" },
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
              ]}
            />
          </Space>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {companies.map(company => (
            <div
              key={company.key}
              className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition"
            >
              <div className="flex justify-between items-start mb-3">
                <h2 className="text-lg font-semibold text-gray-800">
                  {company.name}
                </h2>
                <Tag
                  color={company.status === "Active" ? "green" : "volcano"}
                >
                  {company.status}
                </Tag>
              </div>

              <div className="space-y-1 text-sm text-gray-600">
                <p>
                  <span className="font-medium text-gray-700">
                    Owner:
                  </span>{" "}
                  {company.owner}
                </p>
                <p>
                  <span className="font-medium text-gray-700">
                    Email:
                  </span>{" "}
                  {company.email}
                </p>
                <p>
                  <span className="font-medium text-gray-700">
                    Bookings:
                  </span>{" "}
                  {company.bookings}
                </p>
              </div>

              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => handleViewCompany(company)}
                  className="w-1/2 px-4 py-1.5 text-sm rounded-lg border border-blue-600 text-blue-50 bg-blue-500 hover:bg-blue-600 transition"
                >
                  View
                </button>

                <button
                  onClick={() => handleToggleStatus(company.key)}
                  className={
                    "w-1/2 px-4 py-1.5 text-sm rounded-lg transition border " +
                    (company.status === "Active"
                      ? "border-red-200 text-red-600 bg-red-50 hover:bg-red-100"
                      : "border-green-200 text-green-600 bg-green-50 hover:bg-green-100")
                  }
                >
                  {company.status === "Active" ? "Disable" : "Enable"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </Content>

      <Modal
        title={selectedCompany?.name}
        open={isModalVisible}
        onCancel={handleCloseModal}
        footer={[
          <Button
            key="deactivate"
            danger
            onClick={handleDeactivate}
            icon={<DeleteOutlined />}
          >
            Deactivate Company
          </Button>,
        ]}
      >
        {selectedCompany && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <span className="text-gray-600">Status:</span>
              <Tag
                color={
                  selectedCompany.status === "Active"
                    ? "green"
                    : "volcano"
                }
              >
                {selectedCompany.status}
              </Tag>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">
                Company Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-gray-600">Company Name</p>
                  <p>{selectedCompany.name}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-600">Owner</p>
                  <p>{selectedCompany.owner}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-600">Email</p>
                  <p>{selectedCompany.email}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-600">Bookings</p>
                  <p>{selectedCompany.bookings}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">
                Working Hours
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                {Object.entries(defaultWorkingHours).map(([day, hours]) => (
                  <div
                    key={day}
                    className="flex justify-between py-1 px-2 bg-gray-50 rounded"
                  >
                    <span className="font-medium">{day}</span>
                    <span
                      className={
                        hours === "Closed"
                          ? "text-red-500 italic"
                          : "text-gray-600"
                      }
                    >
                      {hours}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
}

export default CompaniesDetails;
