import React from "react";
import { Table, Button, Space, Typography, Empty, Tag, Popconfirm } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { Expense } from "../../types";

const { Text } = Typography;

interface ExpenseListProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  onEdit,
  onDelete,
  isLoading = false,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const columns: ColumnsType<Expense> = [
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (text: string, record: Expense) => (
        <Space direction="vertical" size="small">
          <Text strong>{text}</Text>
          <Space size="small">
            <CalendarOutlined style={{ color: "#999" }} />
            <Text type="secondary" style={{ fontSize: "12px" }}>
              {formatDate(record.date)}
            </Text>
          </Space>
        </Space>
      ),
    },
    {
      title: "Category",
      dataIndex: ["category", "name"],
      key: "category",
      render: (text: string, record: Expense) => (
        <Tag color="blue">
          <Space>
            {record.category?.icon && (
              <span style={{ fontSize: "14px" }}>{record.category.icon}</span>
            )}
            {text}
          </Space>
        </Tag>
      ),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      align: "right",
      render: (amount: number) => (
        <Text strong style={{ fontSize: "16px", color: "#f5222d" }}>
          {formatAmount(amount)}
        </Text>
      ),
      sorter: (a: Expense, b: Expense) => a.amount - b.amount,
    },
    {
      title: "Actions",
      key: "actions",
      align: "center",
      width: 120,
      render: (_, record: Expense) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
            size="small"
          />
          <Popconfirm
            title="Delete expense"
            description="Are you sure you want to delete this expense?"
            onConfirm={() => onDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="text" icon={<DeleteOutlined />} danger size="small" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (expenses.length === 0 && !isLoading) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <Space direction="vertical" size="small">
            <Text type="secondary">No expenses found</Text>
            <Text type="secondary" style={{ fontSize: "12px" }}>
              Start by adding your first expense
            </Text>
          </Space>
        }
      />
    );
  }

  return (
    <Table
      columns={columns}
      dataSource={expenses}
      rowKey="id"
      loading={isLoading}
      pagination={false}
      scroll={{ x: 600 }}
      size="middle"
      showSorterTooltip={false}
    />
  );
};
