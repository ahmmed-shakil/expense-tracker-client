import React, { useState, useEffect, useCallback } from "react";
import { Layout } from "../components/layout";
import {
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  DatePicker,
  Space,
  Skeleton,
  Button,
  Progress,
  Tag,
} from "antd";
import {
  DollarOutlined,
  CreditCardOutlined,
  ReloadOutlined,
  PlusCircleOutlined,
  MinusCircleOutlined,
  WalletOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import ReactECharts from "echarts-for-react";
import dayjs from "dayjs";
import { toast } from "sonner";
import { ExpenseStats } from "../types";
import { expensesApi, incomeApi, api } from "../utils/api";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

interface Income {
  id: string;
  amount: number;
  description: string;
  source: string;
  date: string;
}

interface Budget {
  id: string;
  name: string;
  amount: number;
  spent: number;
  categoryId?: string;
  startDate: string;
  endDate: string;
  category?: {
    id: string;
    name: string;
  };
}

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<ExpenseStats | null>(null);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(30, "days"),
    dayjs(),
  ]);

  // Calculated metrics
  const [totalIncome, setTotalIncome] = useState(0);
  const [netSavings, setNetSavings] = useState(0);
  const [budgetAdherence, setBudgetAdherence] = useState(0);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [startDate, endDate] = dateRange;
      const params = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      };

      // Fetch all data in parallel
      const [statsResponse, incomesResponse, budgetsResponse] =
        await Promise.all([
          expensesApi.getStats(params),
          incomeApi.getIncomes(params),
          api.get("/budget"),
        ]);

      // Set stats
      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
      }

      // Set incomes and calculate total
      if (incomesResponse.success && incomesResponse.data) {
        const incomeList = incomesResponse.data.incomes || [];
        const totalIncomeAmount = incomeList
          .filter((income: Income) => {
            const incomeDate = dayjs(income.date);
            return (
              incomeDate.isAfter(startDate) && incomeDate.isBefore(endDate)
            );
          })
          .reduce((sum: number, income: Income) => sum + income.amount, 0);
        setTotalIncome(totalIncomeAmount);
      }

      // Set budgets and calculate metrics
      if (budgetsResponse.data.success && budgetsResponse.data.data) {
        const budgetList = budgetsResponse.data.data;
        setBudgets(budgetList);

        // Filter budgets that overlap with our date range
        const activeBudgets = budgetList.filter((budget: Budget) => {
          const budgetStart = dayjs(budget.startDate);
          const budgetEnd = dayjs(budget.endDate);
          return budgetStart.isBefore(endDate) && budgetEnd.isAfter(startDate);
        });

        const totalBudgetAmount = activeBudgets.reduce(
          (sum: number, budget: Budget) => sum + budget.amount,
          0
        );

        // Calculate budget adherence (percentage of budget spent)
        const totalSpent = activeBudgets.reduce(
          (sum: number, budget: Budget) => sum + (budget.spent || 0),
          0
        );
        const adherence =
          totalBudgetAmount > 0 ? (totalSpent / totalBudgetAmount) * 100 : 0;
        setBudgetAdherence(adherence);
      }

      // Calculate net savings
      const totalExpenseAmount = stats?.totalStats.totalAmount || 0;
      setNetSavings(totalIncome - totalExpenseAmount);
    } catch (error: any) {
      console.error("Failed to fetch dashboard data:", error);
      toast.error("Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  }, [dateRange, stats?.totalStats.totalAmount, totalIncome]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Chart configurations
  const getIncomeVsExpenseChart = () => {
    const totalExpenses = stats?.totalStats.totalAmount || 0;

    if (totalIncome === 0 && totalExpenses === 0) {
      return {
        title: {
          text: "No income or expense data available",
          left: "center",
        },
      };
    }

    return {
      title: {
        text: "Income vs Expenses",
        left: "center",
        textStyle: { fontSize: 16, fontWeight: "bold" },
      },
      tooltip: {
        trigger: "item",
        formatter: (params: any) => {
          return `${params.name}: $${params.value.toFixed(2)} (${
            params.percent
          }%)`;
        },
      },
      legend: {
        bottom: "0%",
        left: "center",
      },
      series: [
        {
          type: "pie",
          radius: ["40%", "70%"],
          center: ["50%", "50%"],
          data: [
            {
              value: totalIncome,
              name: "Income",
              itemStyle: { color: "#52c41a" },
            },
            {
              value: totalExpenses,
              name: "Expenses",
              itemStyle: { color: "#ff4d4f" },
            },
          ],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: "rgba(0, 0, 0, 0.5)",
            },
          },
        },
      ],
    };
  };

  const getCategoryExpenseChart = () => {
    if (!stats?.categoryStats || stats.categoryStats.length === 0) {
      return {
        title: {
          text: "No category data available",
          left: "center",
        },
      };
    }

    return {
      title: {
        text: "Expenses by Category",
        left: "center",
        textStyle: { fontSize: 16, fontWeight: "bold" },
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow",
        },
        formatter: (params: any) => {
          const param = params[0];
          return `${param.name}: $${param.value.toFixed(2)}`;
        },
      },
      xAxis: {
        type: "category",
        data: stats.categoryStats.map((cat) => cat.category.name),
        axisLabel: {
          rotate: 45,
          interval: 0,
        },
      },
      yAxis: {
        type: "value",
        axisLabel: {
          formatter: (value: number) => `$${value}`,
        },
      },
      series: [
        {
          type: "bar",
          data: stats.categoryStats.map((cat) => ({
            value: cat._sum.amount,
            itemStyle: {
              color: cat.category.color || "#1890ff",
            },
          })),
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: "rgba(0, 0, 0, 0.5)",
            },
          },
        },
      ],
    };
  };

  const getBudgetProgressChart = () => {
    if (!budgets || budgets.length === 0) {
      return {
        title: {
          text: "No budget data available",
          left: "center",
        },
      };
    }

    return {
      title: {
        text: "Budget vs Actual Spending",
        left: "center",
        textStyle: { fontSize: 16, fontWeight: "bold" },
      },
      tooltip: {
        trigger: "axis",
        formatter: (params: any) => {
          const budgetParam = params.find(
            (p: any) => p.seriesName === "Budget"
          );
          const spentParam = params.find((p: any) => p.seriesName === "Spent");
          return `${budgetParam.name}<br/>
                  Budget: $${budgetParam.value.toFixed(2)}<br/>
                  Spent: $${spentParam.value.toFixed(2)}<br/>
                  Remaining: $${(budgetParam.value - spentParam.value).toFixed(
                    2
                  )}`;
        },
      },
      legend: {
        bottom: "0%",
        left: "center",
      },
      xAxis: {
        type: "category",
        data: budgets.map((budget) => budget.name),
        axisLabel: {
          rotate: 45,
          interval: 0,
        },
      },
      yAxis: {
        type: "value",
        axisLabel: {
          formatter: (value: number) => `$${value}`,
        },
      },
      series: [
        {
          name: "Budget",
          type: "bar",
          data: budgets.map((budget) => budget.amount),
          itemStyle: { color: "#1890ff" },
        },
        {
          name: "Spent",
          type: "bar",
          data: budgets.map((budget) => budget.spent || 0),
          itemStyle: { color: "#ff4d4f" },
        },
      ],
    };
  };

  const getMonthlyTrendChart = () => {
    if (!stats?.monthlyStats || stats.monthlyStats.length === 0) {
      return {
        title: {
          text: "No monthly data available",
          left: "center",
        },
      };
    }

    return {
      title: {
        text: "Monthly Expense Trend",
        left: "center",
        textStyle: { fontSize: 16, fontWeight: "bold" },
      },
      tooltip: {
        trigger: "axis",
        formatter: (params: any) => {
          const param = params[0];
          return `${param.name}<br/>Amount: $${param.value.toFixed(2)}`;
        },
      },
      xAxis: {
        type: "category",
        data: stats.monthlyStats.map((stat) => stat.month),
      },
      yAxis: {
        type: "value",
        axisLabel: {
          formatter: (value: number) => `$${value}`,
        },
      },
      series: [
        {
          type: "line",
          data: stats.monthlyStats.map((stat) => Number(stat.total_amount)),
          smooth: true,
          lineStyle: {
            width: 3,
            color: "#1890ff",
          },
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: "rgba(24, 144, 255, 0.3)" },
                { offset: 1, color: "rgba(24, 144, 255, 0.1)" },
              ],
            },
          },
        },
      ],
    };
  };

  const handleDateRangeChange = (dates: any) => {
    if (dates) {
      setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs]);
    }
  };

  const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

  const getSavingsStatus = () => {
    if (netSavings > 0)
      return { color: "#52c41a", icon: <PlusCircleOutlined /> };
    if (netSavings < 0)
      return { color: "#ff4d4f", icon: <MinusCircleOutlined /> };
    return { color: "#faad14", icon: <WalletOutlined /> };
  };

  const getBudgetStatus = () => {
    if (budgetAdherence <= 80) return { color: "#52c41a", status: "On Track" };
    if (budgetAdherence <= 100)
      return { color: "#faad14", status: "Near Limit" };
    return { color: "#ff4d4f", status: "Over Budget" };
  };

  if (loading) {
    return (
      <Layout>
        <div style={{ padding: "24px" }}>
          <Skeleton active />
        </div>
      </Layout>
    );
  }

  const savingsStatus = getSavingsStatus();
  const budgetStatus = getBudgetStatus();

  return (
    <Layout>
      <div style={{ padding: "24px" }}>
        {/* Header */}
        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: "24px" }}
        >
          <Col>
            <Title level={2} style={{ margin: 0 }}>
              Financial Dashboard
            </Title>
          </Col>
          <Col>
            <Space>
              <RangePicker
                value={dateRange}
                onChange={handleDateRangeChange}
                format="YYYY-MM-DD"
                allowClear={false}
              />
              <Button icon={<ReloadOutlined />} onClick={fetchAllData}>
                Refresh
              </Button>
            </Space>
          </Col>
        </Row>

        {/* Key Metrics Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
          <Col xs={24} sm={12} lg={6}>
            <Card
              style={{ height: "120px", display: "flex", alignItems: "center" }}
            >
              <div style={{ width: "100%" }}>
                <Statistic
                  title="Total Income"
                  value={totalIncome}
                  precision={2}
                  prefix={<DollarOutlined style={{ color: "#52c41a" }} />}
                  formatter={(value) => formatCurrency(Number(value))}
                  valueStyle={{ color: "#52c41a", fontSize: "18px" }}
                />
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card
              style={{ height: "120px", display: "flex", alignItems: "center" }}
            >
              <div style={{ width: "100%" }}>
                <Statistic
                  title="Total Expenses"
                  value={stats?.totalStats.totalAmount || 0}
                  precision={2}
                  prefix={<CreditCardOutlined style={{ color: "#ff4d4f" }} />}
                  formatter={(value) => formatCurrency(Number(value))}
                  valueStyle={{ color: "#ff4d4f", fontSize: "18px" }}
                />
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card
              style={{
                height: "120px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <div style={{ width: "100%" }}>
                <Statistic
                  title="Net Savings"
                  value={Math.abs(netSavings)}
                  precision={2}
                  prefix={savingsStatus.icon}
                  formatter={(value) => formatCurrency(Number(value))}
                  valueStyle={{ color: savingsStatus.color, fontSize: "18px" }}
                />
                <Tag color={savingsStatus.color} style={{ marginTop: "4px" }}>
                  {netSavings >= 0 ? "Positive" : "Deficit"}
                </Tag>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card
              style={{
                height: "120px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <div style={{ width: "100%" }}>
                <Statistic
                  title="Budget Adherence"
                  value={budgetAdherence}
                  precision={1}
                  suffix="%"
                  prefix={
                    <TrophyOutlined style={{ color: budgetStatus.color }} />
                  }
                  valueStyle={{ color: budgetStatus.color, fontSize: "18px" }}
                />
                <Tag color={budgetStatus.color} style={{ marginTop: "4px" }}>
                  {budgetStatus.status}
                </Tag>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Budget Progress */}
        <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
          <Col span={24}>
            <Card title="Budget Progress Overview">
              {budgets.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px 20px",
                    color: "#999",
                  }}
                >
                  <Text type="secondary">No budget data available</Text>
                </div>
              ) : (
                <Row gutter={[16, 16]}>
                  {budgets.slice(0, 4).map((budget) => {
                    const percentage =
                      budget.amount > 0
                        ? (budget.spent / budget.amount) * 100
                        : 0;
                    const status =
                      percentage > 100
                        ? "exception"
                        : percentage > 80
                        ? "active"
                        : "success";

                    return (
                      <Col xs={24} sm={12} lg={6} key={budget.id}>
                        <Card size="small">
                          <div style={{ marginBottom: "8px" }}>
                            <strong>{budget.name}</strong>
                            {budget.category && (
                              <Tag style={{ marginLeft: "8px" }}>
                                {budget.category.name}
                              </Tag>
                            )}
                          </div>
                          <Progress
                            percent={Math.min(percentage, 100)}
                            status={status}
                            format={() => `${percentage.toFixed(1)}%`}
                          />
                          <div
                            style={{
                              marginTop: "8px",
                              fontSize: "12px",
                              color: "#666",
                            }}
                          >
                            ${budget.spent.toFixed(2)} / $
                            {budget.amount.toFixed(2)}
                          </div>
                        </Card>
                      </Col>
                    );
                  })}
                </Row>
              )}
            </Card>
          </Col>
        </Row>

        {/* Charts */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card title="Income vs Expenses">
              <ReactECharts
                option={getIncomeVsExpenseChart()}
                style={{ height: "300px" }}
              />
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="Expenses by Category">
              <ReactECharts
                option={getCategoryExpenseChart()}
                style={{ height: "300px" }}
              />
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="Budget vs Actual">
              <ReactECharts
                option={getBudgetProgressChart()}
                style={{ height: "300px" }}
              />
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="Monthly Trend">
              <ReactECharts
                option={getMonthlyTrendChart()}
                style={{ height: "300px" }}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </Layout>
  );
};
