import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Input, Button, Card, Typography, Alert, Space } from "antd";
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  CreditCardOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../contexts/AuthContext";

const { Title, Text } = Typography;

interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export const RegisterForm: React.FC = () => {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const { register } = useAuth();

  const handleSubmit = async (values: RegisterFormValues) => {
    setError("");
    setIsLoading(true);

    try {
      await register(values.email, values.password, values.name);
      navigate("/dashboard");
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        backgroundColor: "#000000", // Dark background
      }}
    >
      <Card
        style={{
          width: "100%",
          maxWidth: 400,
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Space direction="vertical" size="small">
            <CreditCardOutlined style={{ fontSize: 48, color: "#1890ff" }} />
            <Title level={2} style={{ margin: 0 }}>
              ExpenseTracker
            </Title>
            <Text type="secondary">Create your account</Text>
          </Space>
        </div>

        {error && (
          <Alert
            message={error}
            type="error"
            style={{ marginBottom: 16 }}
            closable
            onClose={() => setError("")}
          />
        )}

        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="name"
            label="Full Name"
            rules={[{ required: true, message: "Please enter your full name" }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Enter your full name"
              autoComplete="name"
            />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Please enter your email" },
              { type: "email", message: "Please enter a valid email" },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Enter your email"
              autoComplete="email"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: "Please enter your password" },
              {
                min: 6,
                message: "Password must be at least 6 characters long",
              },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Enter your password"
              autoComplete="new-password"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Confirm Password"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Please confirm your password" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Passwords do not match"));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Confirm your password"
              autoComplete="new-password"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
              block
              style={{ height: 48 }}
            >
              Create Account
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: "center", marginTop: 16 }}>
          <Text type="secondary">
            Already have an account?{" "}
            <Link to="/login">
              <Text type="secondary" underline>
                Sign in
              </Text>
            </Link>
          </Text>
        </div>
      </Card>
    </div>
  );
};
