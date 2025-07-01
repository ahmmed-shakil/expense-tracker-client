import React, { useState, useEffect } from "react";
import { Modal, Form, Input, DatePicker, Button, Alert, Space } from "antd";
import {
  DollarOutlined,
  FileTextOutlined,
  BankOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { Income } from "../../types";

interface IncomeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    amount: number;
    description: string;
    source: string;
    date: string;
  }) => Promise<void>;
  income?: Income;
  isLoading?: boolean;
}

interface FormValues {
  amount: number;
  description: string;
  source: string;
  date: dayjs.Dayjs;
}

export const IncomeForm: React.FC<IncomeFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  income,
  isLoading = false,
}) => {
  const [form] = Form.useForm<FormValues>();
  const [error, setError] = useState("");

  useEffect(() => {
    if (income) {
      form.setFieldsValue({
        amount: income.amount,
        description: income.description,
        source: income.source,
        date: dayjs(income.date),
      });
    } else {
      form.setFieldsValue({
        amount: undefined,
        description: "",
        source: "",
        date: dayjs(),
      });
    }
  }, [income, form]);

  const handleSubmit = async (values: FormValues) => {
    setError("");

    try {
      await onSubmit({
        amount: parseFloat(values.amount.toString()),
        description: values.description,
        source: values.source,
        date: values.date.toISOString(),
      });
      form.resetFields();
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to save income.");
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setError("");
    onClose();
  };

  return (
    <Modal
      title={income ? "Edit Income" : "Add New Income"}
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
            placeholder="Enter income description"
          />
        </Form.Item>

        <Form.Item
          name="source"
          label="Source"
          rules={[
            { required: true, message: "Please enter the income source" },
            { min: 2, message: "Source must be at least 2 characters" },
          ]}
        >
          <Input
            prefix={<BankOutlined />}
            placeholder="e.g., Salary, Freelance, Investment"
          />
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
              {income ? "Update" : "Add"} Income
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};
