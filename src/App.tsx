import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ConfigProvider, theme } from "antd";
import { Toaster } from "sonner";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LoginForm, RegisterForm } from "./components/auth";
import {
  DashboardPage,
  ExpensesPage,
  CategoriesPage,
  IncomePage,
  BudgetPage,
} from "./pages";
import { useApiErrorHandler } from "./utils/errorHandler";

// Component to setup global error handling
const AppContent: React.FC = () => {
  useApiErrorHandler(); // Setup global API error handling

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginForm />} />
      <Route path="/register" element={<RegisterForm />} />

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/expenses"
        element={
          <ProtectedRoute>
            <ExpensesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/categories"
        element={
          <ProtectedRoute>
            <CategoriesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/income"
        element={
          <ProtectedRoute>
            <IncomePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/budget"
        element={
          <ProtectedRoute>
            <BudgetPage />
          </ProtectedRoute>
        }
      />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm, // Enable dark theme
        token: {
          colorPrimary: "#1890ff",
          borderRadius: 6,
          colorBgContainer: "#141414",
          colorBgElevated: "#1f1f1f",
          colorBgLayout: "#000000",
          colorBgBase: "#141414",
          colorText: "#ffffff",
          colorTextSecondary: "rgba(255, 255, 255, 0.65)",
          colorBorder: "#303030",
          colorSplit: "#303030",
        },
        components: {
          Layout: {
            bodyBg: "#000000",
            headerBg: "#141414",
            siderBg: "#141414",
          },
          Card: {
            colorBgContainer: "#1f1f1f",
          },
          Menu: {
            darkItemBg: "#141414",
            darkSubMenuItemBg: "#1f1f1f",
          },
          Table: {
            colorBgContainer: "#1f1f1f",
            headerBg: "#262626",
          },
          Modal: {
            contentBg: "#1f1f1f",
            headerBg: "#1f1f1f",
          },
          Input: {
            colorBgContainer: "#262626",
          },
          Select: {
            colorBgContainer: "#262626",
          },
          DatePicker: {
            colorBgContainer: "#262626",
          },
        },
      }}
    >
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;
