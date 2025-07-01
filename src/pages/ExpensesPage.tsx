import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Typography,
  Row,
  Col,
  Statistic,
  DatePicker,
  Input,
  Select,
  Popconfirm,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  DollarOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { toast } from "sonner";
import { Layout } from "../components/layout";
import { Expense, Category } from "../types";
import { expensesApi, categoriesApi } from "../utils/api";
import { ExpenseForm } from "../components/expenses";

const { Title } = Typography;
const { RangePicker } = DatePicker;

export const ExpensesPage: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>();
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(
    null
  );
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await categoriesApi.getCategories();
      if (response.success && response.data) {
        setCategories(response.data);
      }
    } catch (error) {
      toast.error("Failed to fetch categories");
    }
  }, []);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (searchText) params.search = searchText;
      if (selectedCategory) params.categoryId = selectedCategory;
      if (dateRange) {
        params.startDate = dateRange[0].toISOString();
        params.endDate = dateRange[1].toISOString();
      }

      // Fetch both expenses and stats
      const [expensesResponse, statsResponse] = await Promise.all([
        expensesApi.getExpenses(params),
        expensesApi.getStats({
          categoryId: selectedCategory || undefined,
          startDate: dateRange?.[0]?.toISOString(),
          endDate: dateRange?.[1]?.toISOString(),
        }),
      ]);

      if (expensesResponse.success && expensesResponse.data) {
        setExpenses(expensesResponse.data.expenses);
      }

      if (statsResponse.success && statsResponse.data) {
        setTotalExpenses(statsResponse.data.totalStats.totalAmount);
        setTotalCount(statsResponse.data.totalStats.totalCount);
      }
    } catch (error: any) {
      toast.error("Failed to fetch expenses");
    } finally {
      setLoading(false);
    }
  }, [searchText, selectedCategory, dateRange]);

  useEffect(() => {
    fetchExpenses();
    fetchCategories();
  }, [fetchExpenses, fetchCategories]);

  const handleCreateExpense = async (data: {
    amount: number;
    description: string;
    categoryId: string;
    date: string;
  }) => {
    try {
      const response = await expensesApi.createExpense(data);
      if (response.success) {
        toast.success("Expense added successfully!");
        setIsFormOpen(false);
        fetchExpenses();
      }
    } catch (error: any) {
      throw error;
    }
  };

  const handleUpdateExpense = async (data: {
    amount: number;
    description: string;
    categoryId: string;
    date: string;
  }) => {
    if (!editingExpense) return;

    try {
      const response = await expensesApi.updateExpense(editingExpense.id, data);
      if (response.success) {
        toast.success("Expense updated successfully!");
        setIsFormOpen(false);
        setEditingExpense(undefined);
        fetchExpenses();
      }
    } catch (error: any) {
      throw error;
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    try {
      const response = await expensesApi.deleteExpense(expenseId);
      if (response.success) {
        toast.success("Expense deleted successfully!");
        fetchExpenses();
      }
    } catch (error: any) {
      toast.error("Failed to delete expense");
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category?.name || "Unknown";
  };

  const columns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      width: 120,
      render: (date: string) => dayjs(date).format("MMM DD, YYYY"),
      sorter: (a: Expense, b: Expense) =>
        dayjs(a.date).unix() - dayjs(b.date).unix(),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: 200,
      ellipsis: true,
    },
    {
      title: "Category",
      dataIndex: "categoryId",
      key: "category",
      width: 120,
      render: (categoryId: string) => (
        <Tag color="blue">{getCategoryName(categoryId)}</Tag>
      ),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      width: 100,
      render: (amount: number) => (
        <span style={{ color: "#ff4d4f", fontWeight: "bold" }}>
          -${amount.toFixed(2)}
        </span>
      ),
      sorter: (a: Expense, b: Expense) => a.amount - b.amount,
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      fixed: "right" as const,
      render: (_: any, record: Expense) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => {
              setEditingExpense(record);
              setIsFormOpen(true);
            }}
          />
          <Popconfirm
            title="Delete Expense"
            description="Are you sure you want to delete this expense?"
            onConfirm={() => handleDeleteExpense(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Layout>
      <div style={{ padding: "24px" }}>
        <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
          <Col span={24}>
            <Title level={2}>Expense Management</Title>
          </Col>
        </Row>

        {/* Stats Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
          <Col xs={24} sm={12} md={8}>
            <Card>
              <Statistic
                title="Total Expenses"
                value={totalExpenses}
                prefix={<DollarOutlined />}
                precision={2}
                valueStyle={{ color: "#ff4d4f" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card>
              <Statistic title="Total Entries" value={totalCount} />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card>
              <Statistic
                title="Average Expense"
                value={totalCount > 0 ? totalExpenses / totalCount : 0}
                prefix={<DollarOutlined />}
                precision={2}
              />
            </Card>
          </Col>
        </Row>

        {/* Filters and Actions */}
        <Card style={{ marginBottom: "16px" }}>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={6}>
              <Input
                placeholder="Search expenses..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
            </Col>
            <Col xs={24} sm={6}>
              <Select
                placeholder="Filter by category"
                style={{ width: "100%" }}
                allowClear
                value={selectedCategory || undefined}
                onChange={(value) => setSelectedCategory(value || "")}
              >
                {categories.map((category) => (
                  <Select.Option key={category.id} value={category.id}>
                    {category.name}
                  </Select.Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={6}>
              <RangePicker
                style={{ width: "100%" }}
                value={dateRange}
                onChange={(dates) =>
                  setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null)
                }
                format="YYYY-MM-DD"
              />
            </Col>
            <Col xs={24} sm={6} style={{ textAlign: "right" }}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingExpense(undefined);
                  setIsFormOpen(true);
                }}
              >
                Add Expense
              </Button>
            </Col>
          </Row>
        </Card>

        {/* Expense Table */}
        <Card>
          <Table
            columns={columns}
            dataSource={expenses}
            rowKey="id"
            loading={loading}
            scroll={{ x: 800 }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} expenses`,
            }}
          />
        </Card>

        {/* Expense Form Modal */}
        <ExpenseForm
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingExpense(undefined);
          }}
          onSubmit={editingExpense ? handleUpdateExpense : handleCreateExpense}
          expense={editingExpense}
        />
      </div>
    </Layout>
  );
};
