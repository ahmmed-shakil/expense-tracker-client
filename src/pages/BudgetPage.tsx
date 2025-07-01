import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Statistic,
  Progress,
  Row,
  Col,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  DollarOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { toast } from "sonner";
import { Layout } from "../components/layout";
import { api } from "../utils/api";
import { handleApiError } from "../utils/errorHandler";
import dayjs from "dayjs";

interface Budget {
  id: string;
  name: string;
  amount: number;
  spent: number;
  categoryId?: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  category?: {
    id: string;
    name: string;
  };
}

interface Category {
  id: string;
  name: string;
}

export const BudgetPage: React.FC = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchBudgets();
    fetchCategories();
  }, []);

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const response = await api.get("/budget");
      setBudgets(response.data.data || []);
    } catch (error: any) {
      handleApiError(error, "fetch budgets");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories");
      setCategories(response.data.data || []);
    } catch (error: any) {
      handleApiError(error, "fetch categories");
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const budgetData = {
        ...values,
        startDate: values.startDate?.toISOString(),
        endDate: values.endDate?.toISOString(),
      };

      if (editingBudget) {
        await api.put(`/budget/${editingBudget.id}`, budgetData);
        toast.success("Budget updated successfully");
      } else {
        await api.post("/budget", budgetData);
        toast.success("Budget created successfully");
      }

      setModalOpen(false);
      setEditingBudget(null);
      form.resetFields();
      fetchBudgets();
    } catch (error: any) {
      handleApiError(error, "save budget");
    }
  };

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget);
    form.setFieldsValue({
      ...budget,
      startDate: dayjs(budget.startDate),
      endDate: dayjs(budget.endDate),
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/budget/${id}`);
      toast.success("Budget deleted successfully");
      fetchBudgets();
    } catch (error: any) {
      handleApiError(error, "delete budget");
    }
  };

  const getProgressStatus = (spent: number, amount: number) => {
    const percentage = (spent / amount) * 100;
    if (percentage >= 100) return "exception";
    if (percentage >= 80) return "active";
    return "normal";
  };

  const getProgressColor = (spent: number, amount: number) => {
    const percentage = (spent / amount) * 100;
    if (percentage >= 100) return "#ff4d4f";
    if (percentage >= 80) return "#faad14";
    return "#52c41a";
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (category: any) => category?.name || "All Categories",
    },
    {
      title: "Budget Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount: number) => `$${amount.toFixed(2)}`,
    },
    {
      title: "Spent",
      dataIndex: "spent",
      key: "spent",
      render: (spent: number) => `$${(spent || 0).toFixed(2)}`,
    },
    {
      title: "Progress",
      key: "progress",
      render: (record: Budget) => {
        const spent = record.spent || 0;
        const percentage = Math.min((spent / record.amount) * 100, 100);
        return (
          <Progress
            percent={Math.round(percentage * 100) / 100} // Round to 2 decimal places
            size="small"
            status={getProgressStatus(spent, record.amount)}
            strokeColor={getProgressColor(spent, record.amount)}
            format={(percent) => `${(percent || 0).toFixed(2)}%`}
          />
        );
      },
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive: boolean) => (
        <span style={{ color: isActive ? "#52c41a" : "#ff4d4f" }}>
          {isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (record: Budget) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      ),
    },
  ];

  const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);
  const totalSpent = budgets.reduce(
    (sum, budget) => sum + (budget.spent || 0),
    0
  );
  const overBudgetCount = budgets.filter(
    (budget) => (budget.spent || 0) > budget.amount
  ).length;

  return (
    <Layout>
      <div style={{ padding: "24px" }}>
        <div style={{ marginBottom: "24px" }}>
          <h1>Budget Management</h1>

          <Row gutter={16} style={{ marginBottom: "24px" }}>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="Total Budget"
                  value={totalBudget}
                  prefix={<DollarOutlined />}
                  precision={2}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="Total Spent"
                  value={totalSpent}
                  prefix={<DollarOutlined />}
                  precision={2}
                  valueStyle={{
                    color: totalSpent > totalBudget ? "#cf1322" : "#3f8600",
                  }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic
                  title="Over Budget"
                  value={overBudgetCount}
                  prefix={<WarningOutlined />}
                  valueStyle={{
                    color: overBudgetCount > 0 ? "#cf1322" : "#3f8600",
                  }}
                />
              </Card>
            </Col>
          </Row>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingBudget(null);
              form.resetFields();
              setModalOpen(true);
            }}
          >
            Add Budget
          </Button>
        </div>

        <Card>
          <Table
            columns={columns}
            dataSource={budgets}
            rowKey="id"
            loading={loading}
            scroll={{ x: 800 }}
          />
        </Card>

        <Modal
          title={editingBudget ? "Edit Budget" : "Add Budget"}
          open={modalOpen}
          onCancel={() => {
            setModalOpen(false);
            setEditingBudget(null);
            form.resetFields();
          }}
          footer={null}
        >
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              name="name"
              label="Budget Name"
              rules={[{ required: true, message: "Please enter budget name" }]}
            >
              <Input placeholder="e.g., Monthly Groceries" />
            </Form.Item>

            <Form.Item
              name="amount"
              label="Budget Amount"
              rules={[
                { required: true, message: "Please enter budget amount" },
              ]}
            >
              <InputNumber
                style={{ width: "100%" }}
                placeholder="0.00"
                min={0}
                precision={2}
                prefix="$"
              />
            </Form.Item>

            <Form.Item name="categoryId" label="Category">
              <Select placeholder="Select category (optional)" allowClear>
                {categories.map((category) => (
                  <Select.Option key={category.id} value={category.id}>
                    {category.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="startDate"
                  label="Start Date"
                  rules={[
                    { required: true, message: "Please select start date" },
                  ]}
                >
                  <DatePicker style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="endDate"
                  label="End Date"
                  rules={[
                    { required: true, message: "Please select end date" },
                  ]}
                >
                  <DatePicker style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  {editingBudget ? "Update" : "Create"} Budget
                </Button>
                <Button
                  onClick={() => {
                    setModalOpen(false);
                    setEditingBudget(null);
                    form.resetFields();
                  }}
                >
                  Cancel
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </Layout>
  );
};
