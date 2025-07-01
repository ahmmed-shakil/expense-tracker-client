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
import { Income } from "../types";
import { incomeApi } from "../utils/api";
import { IncomeForm } from "../components/income";

const { Title } = Typography;
const { RangePicker } = DatePicker;

export const IncomePage: React.FC = () => {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | undefined>();
  const [searchText, setSearchText] = useState("");
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(
    null
  );
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const fetchIncomes = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (searchText) params.search = searchText;
      if (dateRange) {
        params.startDate = dateRange[0].toISOString();
        params.endDate = dateRange[1].toISOString();
      }

      const response = await incomeApi.getIncomes(params);
      if (response.success && response.data) {
        setIncomes(response.data.incomes);
        setTotalCount(response.data.total);

        // Calculate total income
        const total = response.data.incomes.reduce(
          (sum, income) => sum + income.amount,
          0
        );
        setTotalIncome(total);
      }
    } catch (error: any) {
      toast.error("Failed to fetch incomes");
    } finally {
      setLoading(false);
    }
  }, [searchText, dateRange]);

  useEffect(() => {
    fetchIncomes();
  }, [fetchIncomes]);

  const handleCreateIncome = async (data: {
    amount: number;
    description: string;
    source: string;
    date: string;
  }) => {
    try {
      const response = await incomeApi.createIncome(data);
      if (response.success) {
        toast.success("Income added successfully!");
        setIsFormOpen(false);
        fetchIncomes();
      }
    } catch (error: any) {
      throw error;
    }
  };

  const handleUpdateIncome = async (data: {
    amount: number;
    description: string;
    source: string;
    date: string;
  }) => {
    if (!editingIncome) return;

    try {
      const response = await incomeApi.updateIncome(editingIncome.id, data);
      if (response.success) {
        toast.success("Income updated successfully!");
        setIsFormOpen(false);
        setEditingIncome(undefined);
        fetchIncomes();
      }
    } catch (error: any) {
      throw error;
    }
  };

  const handleDeleteIncome = async (incomeId: string) => {
    try {
      const response = await incomeApi.deleteIncome(incomeId);
      if (response.success) {
        toast.success("Income deleted successfully!");
        fetchIncomes();
      }
    } catch (error: any) {
      toast.error("Failed to delete income");
    }
  };

  const columns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date: string) => dayjs(date).format("MMM DD, YYYY"),
      sorter: (a: Income, b: Income) =>
        dayjs(a.date).unix() - dayjs(b.date).unix(),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Source",
      dataIndex: "source",
      key: "source",
      render: (source: string) => <Tag color="blue">{source}</Tag>,
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount: number) => (
        <span style={{ color: "#52c41a", fontWeight: "bold" }}>
          +${amount.toFixed(2)}
        </span>
      ),
      sorter: (a: Income, b: Income) => a.amount - b.amount,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: Income) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => {
              setEditingIncome(record);
              setIsFormOpen(true);
            }}
          />
          <Popconfirm
            title="Delete Income"
            description="Are you sure you want to delete this income?"
            onConfirm={() => handleDeleteIncome(record.id)}
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
            <Title level={2}>Income Management</Title>
          </Col>
        </Row>

        {/* Stats Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
          <Col xs={24} sm={12} md={8}>
            <Card>
              <Statistic
                title="Total Income"
                value={totalIncome}
                prefix={<DollarOutlined />}
                precision={2}
                valueStyle={{ color: "#52c41a" }}
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
                title="Average Income"
                value={totalCount > 0 ? totalIncome / totalCount : 0}
                prefix={<DollarOutlined />}
                precision={2}
              />
            </Card>
          </Col>
        </Row>

        {/* Filters and Actions */}
        <Card style={{ marginBottom: "16px" }}>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={8}>
              <Input
                placeholder="Search incomes..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
            </Col>
            <Col xs={24} sm={8}>
              <RangePicker
                style={{ width: "100%" }}
                value={dateRange}
                onChange={(dates) =>
                  setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null)
                }
                format="YYYY-MM-DD"
              />
            </Col>
            <Col xs={24} sm={8} style={{ textAlign: "right" }}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingIncome(undefined);
                  setIsFormOpen(true);
                }}
              >
                Add Income
              </Button>
            </Col>
          </Row>
        </Card>

        {/* Income Table */}
        <Card>
          <Table
            columns={columns}
            dataSource={incomes}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} incomes`,
            }}
          />
        </Card>

        {/* Income Form Modal */}
        <IncomeForm
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingIncome(undefined);
          }}
          onSubmit={editingIncome ? handleUpdateIncome : handleCreateIncome}
          income={editingIncome}
        />
      </div>
    </Layout>
  );
};
