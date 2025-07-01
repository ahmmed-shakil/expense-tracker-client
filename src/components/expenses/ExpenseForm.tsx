import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Alert,
  Space,
} from "antd";
import { DollarOutlined, FileTextOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { Category, Expense } from "../../types";
import { categoriesApi } from "../../utils/api";

interface ExpenseFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    amount: number;
    description: string;
    categoryId: string;
    date: string;
  }) => Promise<void>;
  expense?: Expense;
  isLoading?: boolean;
}

interface FormValues {
  amount: number;
  description: string;
  categoryId: string;
  date: dayjs.Dayjs;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  expense,
  isLoading = false,
}) => {
  const [form] = Form.useForm<FormValues>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (expense) {
      form.setFieldsValue({
        amount: expense.amount,
        description: expense.description,
        categoryId: expense.categoryId,
        date: dayjs(expense.date),
      });
    } else {
      form.setFieldsValue({
        amount: undefined,
        description: "",
        categoryId: "",
        date: dayjs(),
      });
    }
  }, [expense, form]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoriesApi.getCategories();
        if (response.success && response.data && Array.isArray(response.data)) {
          setCategories(response.data);
        } else {
          // console.warn(
          //   "Categories response is not in expected format:",
          //   response
          // );
          setCategories([]);
        }
      } catch (error) {
        // console.error("Failed to fetch categories:", error);
        setCategories([]); // Ensure categories is always an array
      }
    };

    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const handleSubmit = async (values: FormValues) => {
    setError("");

    try {
      await onSubmit({
        amount: parseFloat(values.amount.toString()),
        description: values.description,
        categoryId: values.categoryId,
        date: values.date.toISOString(),
      });
      form.resetFields();
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to save expense.");
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setError("");
    onClose();
  };

  return (
    <Modal
      title={expense ? "Edit Expense" : "Add New Expense"}
      open={isOpen}
      onCancel={handleCancel}
      footer={null}
      width={500}
      destroyOnClose
    >
      {error && (
        <Alert
          message={error}
          type="error"
          style={{ marginBottom: 16 }}
          closable
          onClose={() => setError("")}
        />
      )}

      <Form form={form} layout="vertical" onFinish={handleSubmit} size="large">
        <Form.Item
          name="amount"
          label="Amount"
          rules={[
            { required: true, message: "Please enter the amount" },
            {
              validator: (_, value) => {
                const numValue = parseFloat(value);
                if (isNaN(numValue) || numValue <= 0) {
                  return Promise.reject(
                    new Error("Amount must be greater than 0")
                  );
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <Input
            prefix={<DollarOutlined />}
            type="number"
            step="0.01"
            min="0.01"
            placeholder="Enter amount"
            autoComplete="off"
          />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
          rules={[
            { required: true, message: "Please enter a description" },
            { min: 3, message: "Description must be at least 3 characters" },
          ]}
        >
          <Input
            prefix={<FileTextOutlined />}
            placeholder="Enter expense description"
          />
        </Form.Item>

        <Form.Item
          name="categoryId"
          label="Category"
          rules={[{ required: true, message: "Please select a category" }]}
        >
          <Select
            placeholder="Select a category"
            showSearch
            optionFilterProp="label"
          >
            {Array.isArray(categories) &&
              categories.map((category) => (
                <Select.Option key={category.id} value={category.id}>
                  <Space>
                    {category.icon && <span>{category.icon}</span>}
                    {category.name}
                  </Space>
                </Select.Option>
              ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="date"
          label="Date"
          rules={[{ required: true, message: "Please select a date" }]}
        >
          <DatePicker
            style={{ width: "100%" }}
            format="YYYY-MM-DD"
            placeholder="Select date"
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0, paddingTop: 16 }}>
          <Space style={{ width: "100%", justifyContent: "flex-end" }}>
            <Button onClick={handleCancel} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={isLoading}>
              {expense ? "Update" : "Add"} Expense
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};
