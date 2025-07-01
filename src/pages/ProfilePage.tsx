import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Avatar,
  Typography,
  Row,
  Col,
  Upload,
  message,
} from "antd";
import {
  UserOutlined,
  CameraOutlined,
  EditOutlined,
  LockOutlined,
  SaveOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
} from "@ant-design/icons";
import { toast } from "sonner";
import { Layout } from "../components/layout";
import { useAuth } from "../contexts/AuthContext";
import { userApi } from "../utils/api";
import { handleApiError } from "../utils/errorHandler";

const { Title, Text } = Typography;

interface ProfileFormValues {
  name: string;
  email: string;
}

interface PasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [profileImage, setProfileImage] = useState<string>(user?.avatar || "");
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const response = await userApi.getProfile();
        if (response.success && response.data && response.data.user) {
          setProfileData(response.data.user);
          profileForm.setFieldsValue({
            name: response.data.user.name,
            email: response.data.user.email,
          });
          setProfileImage(response.data.user.avatar || "");
        }
      } catch (error) {
        console.error("Failed to fetch profile data:", error);
        toast.error("Failed to load profile data");
      }
    };

    loadProfileData();
  }, [profileForm]);

  useEffect(() => {
    if (user) {
      profileForm.setFieldsValue({
        name: user.name,
        email: user.email,
      });
      setProfileImage(user.avatar || "");
    }
  }, [user, profileForm]);

  // Format member since date
  const formatMemberSince = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      return "N/A";
    }
  };

  const uploadToCloudinary = async (file: File): Promise<string> => {
    const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;

    console.log("Cloudinary Config:", { cloudName, uploadPreset });

    if (!cloudName || !uploadPreset) {
      throw new Error(
        "Cloudinary configuration is missing. Please check your environment variables."
      );
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    formData.append("cloud_name", cloudName);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Cloudinary error response:", errorText);
        throw new Error(
          `Upload failed: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      throw new Error("Failed to upload image");
    }
  };

  const handleImageUpload = async (file: File) => {
    setImageUploading(true);
    try {
      const imageUrl = await uploadToCloudinary(file);
      setProfileImage(imageUrl);

      // Update profile with new image
      await userApi.updateProfile({
        name: user?.name || "",
        email: user?.email || "",
        avatar: imageUrl,
      });

      // Update user context
      if (user) {
        updateUser({ ...user, avatar: imageUrl });
      }

      toast.success("Profile image updated successfully!");
    } catch (error) {
      toast.error("Failed to upload image");
      console.error("Image upload error:", error);
    } finally {
      setImageUploading(false);
    }
  };

  const handleProfileUpdate = async (values: ProfileFormValues) => {
    setLoading(true);
    try {
      const response = await userApi.updateProfile({
        ...values,
        avatar: profileImage,
      });

      if (response.success && response.data) {
        // Backend returns { user: ... } structure
        const userData = response.data.user;
        updateUser(userData);
        setProfileData(userData);
        toast.success("Profile updated successfully!");
      }
    } catch (error: any) {
      handleApiError(error, "update profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (values: PasswordFormValues) => {
    setPasswordLoading(true);
    try {
      const response = await userApi.changePassword(
        values.currentPassword,
        values.newPassword
      );

      if (response.success) {
        toast.success("Password changed successfully!");
        passwordForm.resetFields();
      }
    } catch (error: any) {
      handleApiError(error, "change password");
    } finally {
      setPasswordLoading(false);
    }
  };

  const beforeUpload = (file: File) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      message.error("You can only upload JPG/PNG files!");
      return false;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("Image must be smaller than 2MB!");
      return false;
    }

    handleImageUpload(file);
    return false; // Prevent default upload behavior
  };

  return (
    <Layout>
      <div style={{ padding: "24px" }}>
        <Title level={2}>Profile Settings</Title>

        <Row gutter={[24, 24]}>
          {/* Profile Information Card */}
          <Col xs={24} lg={12}>
            <Card title="Profile Information" extra={<EditOutlined />}>
              <div style={{ textAlign: "center", marginBottom: "24px" }}>
                <div style={{ position: "relative", display: "inline-block" }}>
                  <Avatar
                    size={120}
                    src={profileImage}
                    icon={<UserOutlined />}
                    style={{ marginBottom: "16px" }}
                  />
                  <Upload
                    showUploadList={false}
                    beforeUpload={beforeUpload}
                    accept="image/*"
                  >
                    <Button
                      icon={<CameraOutlined />}
                      shape="circle"
                      size="small"
                      loading={imageUploading}
                      style={{
                        position: "absolute",
                        bottom: "16px",
                        right: "0px",
                        backgroundColor: "#1890ff",
                        borderColor: "#1890ff",
                        color: "white",
                      }}
                    />
                  </Upload>
                </div>
                <div>
                  <Text type="secondary">
                    Click the camera icon to upload a new profile picture
                  </Text>
                </div>
              </div>

              <Form
                form={profileForm}
                layout="vertical"
                onFinish={handleProfileUpdate}
              >
                <Form.Item
                  name="name"
                  label="Full Name"
                  rules={[
                    { required: true, message: "Please enter your full name" },
                  ]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="Enter your full name"
                  />
                </Form.Item>

                <Form.Item
                  name="email"
                  label="Email Address"
                  rules={[
                    { required: true, message: "Please enter your email" },
                    { type: "email", message: "Please enter a valid email" },
                  ]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="Enter your email"
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    icon={<SaveOutlined />}
                    block
                  >
                    Update Profile
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>

          {/* Password Change Card */}
          <Col xs={24} lg={12}>
            <Card title="Change Password" extra={<LockOutlined />}>
              <Form
                form={passwordForm}
                layout="vertical"
                onFinish={handlePasswordChange}
              >
                <Form.Item
                  name="currentPassword"
                  label="Current Password"
                  rules={[
                    {
                      required: true,
                      message: "Please enter your current password",
                    },
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Enter current password"
                    iconRender={(visible) =>
                      visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                    }
                  />
                </Form.Item>

                <Form.Item
                  name="newPassword"
                  label="New Password"
                  rules={[
                    {
                      required: true,
                      message: "Please enter your new password",
                    },
                    {
                      min: 6,
                      message: "Password must be at least 6 characters long",
                    },
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Enter new password"
                    iconRender={(visible) =>
                      visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                    }
                  />
                </Form.Item>

                <Form.Item
                  name="confirmPassword"
                  label="Confirm New Password"
                  dependencies={["newPassword"]}
                  rules={[
                    {
                      required: true,
                      message: "Please confirm your new password",
                    },
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
                    iconRender={(visible) =>
                      visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                    }
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={passwordLoading}
                    icon={<LockOutlined />}
                    block
                    danger
                  >
                    Change Password
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>
        </Row>

        {/* Account Information Display */}
        <Row gutter={[24, 24]} style={{ marginTop: "24px" }}>
          <Col span={24}>
            <Card title="Account Information">
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <div>
                    <Text strong>Member Since</Text>
                    <br />
                    <Text type="secondary">
                      {profileData?.createdAt
                        ? formatMemberSince(profileData.createdAt)
                        : user?.createdAt
                        ? formatMemberSince(user.createdAt)
                        : "N/A"}
                    </Text>
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <div>
                    <Text strong>Total Expenses</Text>
                    <br />
                    <Text type="secondary">
                      {profileData?._count?.expenses || 0} expenses recorded
                    </Text>
                  </div>
                </Col>
                <Col xs={24} sm={12}>
                  <div>
                    <Text strong>Account Status</Text>
                    <br />
                    <Text type="secondary" style={{ color: "#52c41a" }}>
                      Active
                    </Text>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </div>
    </Layout>
  );
};
