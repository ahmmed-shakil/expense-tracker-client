import React, { useState } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Typography,
  Alert,
  Space,
  Divider,
  Steps,
} from "antd";
import {
  MailOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import { authApi } from "../../utils/api";
import { toast } from "sonner";

const { Title, Text } = Typography;

interface ForgotPasswordModalProps {
  open: boolean;
  onClose: () => void;
}

interface RequestOtpForm {
  email: string;
}

interface VerifyOtpForm {
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  open,
  onClose,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [otpRequestForm] = Form.useForm();
  const [resetPasswordForm] = Form.useForm();

  const handleClose = () => {
    setCurrentStep(0);
    setError("");
    setUserEmail("");
    otpRequestForm.resetFields();
    resetPasswordForm.resetFields();
    onClose();
  };

  const handleRequestOtp = async (values: RequestOtpForm) => {
    setError("");
    setIsLoading(true);

    try {
      await authApi.forgotPassword(values.email);
      setUserEmail(values.email);
      setCurrentStep(1);
      toast.success("OTP has been sent to your email address");
    } catch (error: any) {
      setError(
        error.response?.data?.message || "Failed to send OTP. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtpAndReset = async (values: VerifyOtpForm) => {
    if (values.newPassword !== values.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      await authApi.verifyOtpAndResetPassword({
        email: userEmail,
        otp: values.otp,
        newPassword: values.newPassword,
      });
      toast.success(
        "Password reset successfully! Please log in with your new password."
      );
      handleClose();
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
          "Invalid or expired OTP. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setCurrentStep(0);
    setError("");
    resetPasswordForm.resetFields();
  };

  const steps = [
    {
      title: "Enter Email",
      description: "We'll send you an OTP",
    },
    {
      title: "Verify & Reset",
      description: "Enter OTP and new password",
    },
  ];

  return (
    <Modal
      title={
        <Space
          direction="vertical"
          size="small"
          style={{ textAlign: "center", width: "100%" }}
        >
          <SafetyCertificateOutlined
            style={{ fontSize: 32, color: "#1890ff" }}
          />
          <Title level={4} style={{ margin: 0 }}>
            Reset Password
          </Title>
        </Space>
      }
      open={open}
      onCancel={handleClose}
      footer={null}
      width={450}
      centered
    >
      <div style={{ padding: "10px 0" }}>
        {/* <Steps
          current={currentStep}
          size="small"
          items={steps}
          style={{ marginBottom: 24 }}
        /> */}

        {error && (
          <Alert
            message={error}
            type="error"
            style={{ marginBottom: 16 }}
            closable
            onClose={() => setError("")}
          />
        )}

        {currentStep === 0 && (
          <div>
            <Text
              type="secondary"
              style={{ marginBottom: 16, display: "block" }}
            >
              Enter your email address and we'll send you a verification code to
              reset your password.
            </Text>

            <Form
              form={otpRequestForm}
              onFinish={handleRequestOtp}
              layout="vertical"
              size="large"
            >
              <Form.Item
                name="email"
                label="Email Address"
                rules={[
                  { required: true, message: "Please enter your email" },
                  { type: "email", message: "Please enter a valid email" },
                ]}
              >
                <Input
                  prefix={<MailOutlined />}
                  placeholder="Enter your email address"
                  autoComplete="email"
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0 }}>
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={isLoading}
                    block
                    style={{ height: 40 }}
                  >
                    Send OTP
                  </Button>
                  <Button block onClick={handleClose} style={{ height: 40 }}>
                    Cancel
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </div>
        )}

        {currentStep === 1 && (
          <div>
            <Text
              type="secondary"
              style={{ marginBottom: 16, display: "block" }}
            >
              We've sent a 6-digit verification code to{" "}
              <strong>{userEmail}</strong>. Enter the code along with your new
              password.
            </Text>

            <Form
              form={resetPasswordForm}
              onFinish={handleVerifyOtpAndReset}
              layout="vertical"
              size="large"
            >
              <Form.Item
                name="otp"
                label="Verification Code"
                rules={[
                  { required: true, message: "Please enter the OTP" },
                  { len: 6, message: "OTP must be 6 digits" },
                  {
                    pattern: /^\d{6}$/,
                    message: "OTP must contain only numbers",
                  },
                ]}
              >
                <Input
                  prefix={<SafetyCertificateOutlined />}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  style={{
                    textAlign: "center",
                    fontSize: "18px",
                    letterSpacing: "2px",
                  }}
                />
              </Form.Item>

              <Form.Item
                name="newPassword"
                label="New Password"
                rules={[
                  { required: true, message: "Please enter new password" },
                  { min: 6, message: "Password must be at least 6 characters" },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Enter new password"
                  autoComplete="new-password"
                />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label="Confirm Password"
                rules={[
                  { required: true, message: "Please confirm your password" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("newPassword") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error("Passwords do not match")
                      );
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0 }}>
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={isLoading}
                    block
                    style={{ height: 40 }}
                  >
                    Reset Password
                  </Button>
                  <Button
                    block
                    onClick={handleBackToEmail}
                    style={{ height: 40 }}
                  >
                    Back to Email
                  </Button>
                </Space>
              </Form.Item>
            </Form>

            <Divider />

            <div style={{ textAlign: "center" }}>
              <Text type="secondary" style={{ fontSize: "12px" }}>
                Didn't receive the code?{" "}
                <Button
                  type="link"
                  size="small"
                  onClick={handleBackToEmail}
                  style={{ padding: 0, fontSize: "12px" }}
                >
                  Try again
                </Button>
              </Text>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
