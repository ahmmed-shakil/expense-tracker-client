import axios from "axios";
import {
  ApiResponse,
  AuthResponse,
  User,
  Expense,
  Category,
  ExpenseStats,
  Income,
  Budget,
  IncomeVsExpenseStats,
  BudgetAlert,
} from "../types";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:3001",
  withCredentials: true, // Include cookies in requests
  headers: {
    "Content-Type": "application/json",
  },
});

// Flag to track if we're currently refreshing
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

// Process the queue of failed requests
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  failedQueue = [];
};

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(
      `Making ${config.method?.toUpperCase()} request to ${config.url}`
    );
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If we're already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt to refresh the token
        const response = await api.post("/auth/refresh");

        if (response.data.success) {
          processQueue(null, response.data.data.accessToken);
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        processQueue(refreshError, null);

        // Import auth context to trigger logout
        window.dispatchEvent(new CustomEvent("auth:logout"));

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: async (
    email: string,
    password: string,
    name: string
  ): Promise<AuthResponse> => {
    const response = await api.post("/auth/register", {
      email,
      password,
      name,
    });
    return response.data;
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  },

  logout: async (): Promise<ApiResponse> => {
    const response = await api.post("/auth/logout");
    return response.data;
  },

  refresh: async (): Promise<AuthResponse> => {
    const response = await api.post("/auth/refresh");
    return response.data;
  },

  me: async (): Promise<ApiResponse<User>> => {
    const response = await api.get("/auth/me");
    return response.data;
  },
};

// User API
export const userApi = {
  getProfile: async (): Promise<ApiResponse<User>> => {
    const response = await api.get("/user/profile");
    return response.data;
  },

  updateProfile: async (data: {
    name: string;
    email: string;
  }): Promise<ApiResponse<User>> => {
    const response = await api.put("/user/profile", data);
    return response.data;
  },

  changePassword: async (
    currentPassword: string,
    newPassword: string
  ): Promise<ApiResponse> => {
    const response = await api.put("/user/password", {
      currentPassword,
      newPassword,
    });
    return response.data;
  },
};

// Categories API
export const categoriesApi = {
  getCategories: async (): Promise<ApiResponse<Category[]>> => {
    const response = await api.get("/categories");
    return response.data;
  },

  createCategory: async (data: {
    name: string;
    icon: string;
    color: string;
  }): Promise<ApiResponse<Category>> => {
    const response = await api.post("/categories", data);
    return response.data;
  },

  updateCategory: async (
    id: string,
    data: { name: string; icon: string; color: string }
  ): Promise<ApiResponse<Category>> => {
    const response = await api.put(`/categories/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },
};

// Expenses API
export const expensesApi = {
  getExpenses: async (params?: {
    page?: number;
    limit?: number;
    categoryId?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
  }): Promise<
    ApiResponse<{
      expenses: Expense[];
      total: number;
      page: number;
      totalPages: number;
    }>
  > => {
    const response = await api.get("/expenses", { params });
    return response.data;
  },

  createExpense: async (data: {
    amount: number;
    description: string;
    categoryId: string;
    date: string;
  }): Promise<ApiResponse<Expense>> => {
    const response = await api.post("/expenses", data);
    return response.data;
  },

  updateExpense: async (
    id: string,
    data: {
      amount: number;
      description: string;
      categoryId: string;
      date: string;
    }
  ): Promise<ApiResponse<Expense>> => {
    const response = await api.put(`/expenses/${id}`, data);
    return response.data;
  },

  deleteExpense: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete(`/expenses/${id}`);
    return response.data;
  },

  getStats: async (params?: {
    startDate?: string;
    endDate?: string;
    categoryId?: string;
  }): Promise<ApiResponse<ExpenseStats>> => {
    const response = await api.get("/expenses/stats", { params });
    return response.data;
  },
};

// Income API
export const incomeApi = {
  getIncomes: async (params?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
    search?: string;
  }): Promise<
    ApiResponse<{
      incomes: Income[];
      total: number;
      page: number;
      totalPages: number;
    }>
  > => {
    const response = await api.get("/income", { params });
    return response.data;
  },

  createIncome: async (data: {
    amount: number;
    description: string;
    source: string;
    date: string;
  }): Promise<ApiResponse<Income>> => {
    const response = await api.post("/income", data);
    return response.data;
  },

  updateIncome: async (
    id: string,
    data: {
      amount: number;
      description: string;
      source: string;
      date: string;
    }
  ): Promise<ApiResponse<Income>> => {
    const response = await api.put(`/income/${id}`, data);
    return response.data;
  },

  deleteIncome: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete(`/income/${id}`);
    return response.data;
  },

  getIncomeStats: async (params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<IncomeVsExpenseStats>> => {
    const response = await api.get("/income/stats", { params });
    return response.data;
  },
};

// Budget API
export const budgetApi = {
  getBudgets: async (): Promise<ApiResponse<Budget[]>> => {
    const response = await api.get("/budget");
    return response.data;
  },

  createBudget: async (data: {
    name: string;
    amount: number;
    period: "monthly" | "yearly";
    startDate: string;
    endDate?: string;
    categoryId?: string;
  }): Promise<ApiResponse<Budget>> => {
    const response = await api.post("/budget", data);
    return response.data;
  },

  updateBudget: async (
    id: string,
    data: {
      name?: string;
      amount?: number;
      period?: "monthly" | "yearly";
      startDate?: string;
      endDate?: string;
      categoryId?: string;
      isActive?: boolean;
    }
  ): Promise<ApiResponse<Budget>> => {
    const response = await api.put(`/budget/${id}`, data);
    return response.data;
  },

  deleteBudget: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete(`/budget/${id}`);
    return response.data;
  },

  getBudgetAlerts: async (): Promise<ApiResponse<BudgetAlert[]>> => {
    const response = await api.get("/budget/alerts");
    return response.data;
  },
};

export { api };
