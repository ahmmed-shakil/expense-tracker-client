import React, { useState } from "react";
import {
  Layout,
  Menu,
  Button,
  Avatar,
  Space,
  Typography,
  Dropdown,
  Drawer,
} from "antd";
import {
  DashboardOutlined,
  CreditCardOutlined,
  SettingOutlined,
  LogoutOutlined,
  UserOutlined,
  MenuOutlined,
  DollarOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./Navbar.css";

const { Header } = Layout;
const { Text } = Typography;

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);

  const navigation = [
    { key: "/dashboard", label: "Dashboard", icon: <DashboardOutlined /> },
    { key: "/expenses", label: "Expenses", icon: <CreditCardOutlined /> },
    { key: "/income", label: "Income", icon: <DollarOutlined /> },
    { key: "/budget", label: "Budget", icon: <WalletOutlined /> },
    { key: "/categories", label: "Categories", icon: <SettingOutlined /> },
    { key: "/profile", label: "Profile", icon: <UserOutlined /> },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const userMenuItems = [
    {
      key: "logout",
      label: "Logout",
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ];

  return (
    <Header
      style={{
        background: "#141414",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
        padding: 0,
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}
    >
      <div
        className="navbar-container"
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "64px",
        }}
      >
        {/* Logo */}
        <div
          style={{ display: "flex", alignItems: "center", minWidth: "160px" }}
        >
          <Link to="/dashboard">
            <Space>
              <CreditCardOutlined
                style={{ fontSize: "24px", color: "#1890ff" }}
              />
              <Text
                strong
                className="logo-text"
                style={{ fontSize: "18px", color: "#ffffff" }}
              >
                ExpenseTracker
              </Text>
            </Space>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div
          className="desktop-menu"
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            maxWidth: "700px",
          }}
        >
          <Menu
            mode="horizontal"
            theme="dark"
            selectedKeys={[location.pathname]}
            items={navigation.map((item) => ({
              key: item.key,
              label: <Link to={item.key}>{item.label}</Link>,
              icon: item.icon,
            }))}
            style={{
              border: "none",
              background: "transparent",
              minWidth: "600px",
              justifyContent: "center",
            }}
          />
        </div>

        {/* Desktop User Menu */}
        <div
          className="desktop-user-menu"
          style={{ minWidth: "120px", textAlign: "right" }}
        >
          <Space>
            <Space
              style={{ cursor: "pointer" }}
              onClick={() => navigate("/profile")}
            >
              <Avatar src={user?.avatar} icon={<UserOutlined />} size="small" />
              <Text className="user-name" style={{ fontSize: "14px" }}>
                {user?.name}
              </Text>
            </Space>
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              trigger={["click"]}
            >
              <Button type="text" icon={<LogoutOutlined />} />
            </Dropdown>
          </Space>
        </div>

        {/* Mobile Menu Button */}
        <div className="mobile-menu-button" style={{ display: "none" }}>
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setMobileMenuVisible(true)}
            size="large"
          />
        </div>
      </div>

      {/* Mobile Drawer */}
      <Drawer
        title="Menu"
        placement="right"
        onClose={() => setMobileMenuVisible(false)}
        open={mobileMenuVisible}
        width={280}
      >
        {/* User Info */}
        <div
          style={{
            padding: "16px 0",
            borderBottom: "1px solid #f0f0f0",
            marginBottom: "16px",
            cursor: "pointer",
          }}
          onClick={() => {
            navigate("/profile");
            setMobileMenuVisible(false);
          }}
        >
          <Space>
            <Avatar src={user?.avatar} icon={<UserOutlined />} />
            <div>
              <Text strong>{user?.name}</Text>
              <br />
              <Text type="secondary" style={{ fontSize: "12px" }}>
                {user?.email}
              </Text>
            </div>
          </Space>
        </div>

        {/* Navigation Menu */}
        <Menu
          mode="vertical"
          theme="dark"
          selectedKeys={[location.pathname]}
          items={navigation.map((item) => ({
            key: item.key,
            label: (
              <Link to={item.key} onClick={() => setMobileMenuVisible(false)}>
                {item.label}
              </Link>
            ),
            icon: item.icon,
          }))}
          style={{ border: "none" }}
        />

        {/* Logout Button */}
        <div
          style={{
            position: "absolute",
            bottom: "24px",
            left: "24px",
            right: "24px",
          }}
        >
          <Button
            type="primary"
            danger
            block
            icon={<LogoutOutlined />}
            onClick={() => {
              handleLogout();
              setMobileMenuVisible(false);
            }}
          >
            Logout
          </Button>
        </div>
      </Drawer>
    </Header>
  );
};
