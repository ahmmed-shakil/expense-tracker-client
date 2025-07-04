import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  Alert,
  Space,
  Modal,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  CreditCardOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../contexts/AuthContext";
import { ForgotPasswordModal } from "./ForgotPasswordModal";

const { Title, Text } = Typography;

interface LoginFormValues {
  email: string;
  password: string;
}

export const LoginForm: React.FC = () => {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const { login } = useAuth();

  const handleSubmit = async (values: LoginFormValues) => {
    setError("");
    setIsLoading(true);

    try {
      await login(values.email, values.password);
      navigate("/dashboard");
    } catch (error: any) {
      setError(
        error.response?.data?.message || "Login failed. Please try again."
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
            <Text type="secondary">Sign in to your account</Text>
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
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Please enter your email" },
              { type: "email", message: "Please enter a valid email" },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Enter your email"
              autoComplete="email"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: "Please enter your password" }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Enter your password"
              autoComplete="current-password"
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
              Sign in
            </Button>
          </Form.Item>

          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <Button
              type="link"
              onClick={() => setShowForgotPassword(true)}
              style={{ padding: 0, height: "auto" }}
            >
              <Text type="secondary" underline>
                Forgot your password?
              </Text>
            </Button>
          </div>
        </Form>

        <div style={{ textAlign: "center", marginTop: 16 }}>
          <Text type="secondary">
            Don't have an account?{" "}
            <Link to="/register">
              <Text type="secondary" underline>
                Create one now
              </Text>
            </Link>
          </Text>
        </div>

        <ForgotPasswordModal
          open={showForgotPassword}
          onClose={() => setShowForgotPassword(false)}
        />
      </Card>
    </div>
  );
};
