export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  userId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id: string;
  amount: number;
  description: string;
  categoryId: string;
  category?: Category;
  userId: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    accessToken: string;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message: string;
  errors?: Record<string, string[]>;
}

export interface ExpenseStats {
  totalStats: {
    totalAmount: number;
    totalCount: number;
    averageAmount: number;
  };
  categoryStats: {
    categoryId: string;
    _sum: { amount: number };
    _count: { id: number };
    category: {
      id: string;
      name: string;
      color: string;
    };
  }[];
  monthlyStats: {
    month: string;
    total_amount: number;
    expense_count: number;
  }[];
}

export interface Income {
  id: string;
  amount: number;
  description: string;
  source: string;
  userId: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  name: string;
  amount: number;
  period: "monthly" | "yearly";
  startDate: string;
  endDate?: string;
  isActive: boolean;
  userId: string;
  categoryId?: string;
  category?: Category;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetAlert {
  budgetId: string;
  budgetName: string;
  budgetAmount: number;
  currentSpent: number;
  percentage: number;
  category?: Category;
}

export interface IncomeVsExpenseStats {
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  savingsRate: number;
  monthlyComparison: {
    month: string;
    income: number;
    expenses: number;
    savings: number;
  }[];
}
