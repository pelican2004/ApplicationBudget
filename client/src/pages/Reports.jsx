import { useState, useEffect, useMemo } from "react";
import api from "../services/api";
import Sidebar from "../components/layout/Sidebar";

import {
  Box,
  Typography,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  LinearProgress,
  Divider,
} from "@mui/material";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import SavingsIcon from "@mui/icons-material/Savings";

function Reports() {
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [savings, setSavings] = useState([]);
  const [transactions, setTransactions] = useState({});

  const currentYear = new Date().getFullYear();

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState("all");

  const user = JSON.parse(localStorage.getItem("user"));

  const loadData = async () => {
    try {
      if (!user?._id) return;

      const incomeRes = await api.get(`/income/${user._id}`);
      const expenseRes = await api.get(`/expense/${user._id}`);
      const savingRes = await api.get(`/saving/${user._id}`);

      const incomeData = incomeRes.data.incomes || [];
      const expenseData = expenseRes.data.expenses || [];
      const savingData = savingRes.data.savings || [];

      setIncomes(incomeData);
      setExpenses(expenseData);
      setSavings(savingData);

      const history = {};

      for (const saving of savingData) {
        try {
          const transactionRes = await api.get(
            `/saving-transaction/${saving._id}`
          );

          history[saving._id] =
            transactionRes.data.transactions || [];
        } catch (error) {
          console.log(
            `Eroare la încărcarea tranzacțiilor pentru ${saving.title}`,
            error
          );

          history[saving._id] = [];
        }
      }

      setTransactions(history);
    } catch (error) {
      console.error("Eroare la încărcarea rapoartelor:", error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatMoney = (value) => {
    return Number(value || 0).toLocaleString("ro-RO", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  /*
   * Filtrăm veniturile în funcție de anul și luna selectate.
   */
  const filteredIncomes = useMemo(() => {
    return incomes.filter((income) => {
      const date = new Date(income.date);

      if (date.getFullYear() !== Number(selectedYear)) {
        return false;
      }

      if (
        selectedMonth !== "all" &&
        date.getMonth() !== Number(selectedMonth)
      ) {
        return false;
      }

      return true;
    });
  }, [incomes, selectedYear, selectedMonth]);

  /*
   * Filtrăm cheltuielile în funcție de anul și luna selectate.
   */
  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const date = new Date(expense.date);

      if (date.getFullYear() !== Number(selectedYear)) {
        return false;
      }

      if (
        selectedMonth !== "all" &&
        date.getMonth() !== Number(selectedMonth)
      ) {
        return false;
      }

      return true;
    });
  }, [expenses, selectedYear, selectedMonth]);

  /*
   * Total venituri pentru perioada selectată.
   */
  const totalIncome = useMemo(() => {
    return filteredIncomes.reduce(
      (sum, income) => sum + Number(income.amount || 0),
      0
    );
  }, [filteredIncomes]);

  /*
   * Total cheltuieli pentru perioada selectată.
   */
  const totalExpense = useMemo(() => {
    return filteredExpenses.reduce(
      (sum, expense) => sum + Number(expense.amount || 0),
      0
    );
  }, [filteredExpenses]);

  /*
   * Soldul perioadei.
   */
  const balance = totalIncome - totalExpense;

  /*
   * Procentul din venituri care a fost cheltuit.
   */
  const expensePercentage =
    totalIncome > 0
      ? Math.round((totalExpense / totalIncome) * 100)
      : 0;

  /*
   * Date pentru graficul lunar.
   */
  const monthlyData = useMemo(() => {
    const months = [
      "Ian",
      "Feb",
      "Mar",
      "Apr",
      "Mai",
      "Iun",
      "Iul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    return months.map((month, index) => {
      const monthIncome = incomes
        .filter((income) => {
          const date = new Date(income.date);

          return (
            date.getFullYear() === Number(selectedYear) &&
            date.getMonth() === index
          );
        })
        .reduce(
          (sum, income) => sum + Number(income.amount || 0),
          0
        );

      const monthExpense = expenses
        .filter((expense) => {
          const date = new Date(expense.date);

          return (
            date.getFullYear() === Number(selectedYear) &&
            date.getMonth() === index
          );
        })
        .reduce(
          (sum, expense) => sum + Number(expense.amount || 0),
          0
        );

      return {
        month,
        venituri: monthIncome,
        cheltuieli: monthExpense,
      };
    });
  }, [incomes, expenses, selectedYear]);

  /*
   * Dacă este selectată o anumită lună,
   * afișăm doar luna respectivă în grafic.
   */
  const chartData =
    selectedMonth === "all"
      ? monthlyData
      : monthlyData.filter(
          (_, index) => index === Number(selectedMonth)
        );

  /*
   * Cheltuieli grupate pe categorii.
   */
  const categoryData = useMemo(() => {
    const categories = {};

    filteredExpenses.forEach((expense) => {
      const category = expense.category || "Necategorizat";

      if (!categories[category]) {
        categories[category] = 0;
      }

      categories[category] += Number(expense.amount || 0);
    });

    return Object.entries(categories).map(
      ([category, amount]) => ({
        name: category,
        value: amount,
      })
    );
  }, [filteredExpenses]);

  /*
   * Total economisit pentru fiecare obiectiv.
   */
  const savingsData = useMemo(() => {
    return savings.map((saving) => {
      const savingTransactions =
        transactions[saving._id] || [];

      const savedAmount = savingTransactions.reduce(
        (sum, transaction) =>
          sum + Number(transaction.amount || 0),
        0
      );

      const targetAmount = Number(
        saving.targetAmount || 0
      );

      const progress =
        targetAmount > 0
          ? Math.min(
              Math.round(
                (savedAmount / targetAmount) * 100
              ),
              100
            )
          : 0;

      return {
        ...saving,
        savedAmount,
        targetAmount,
        progress,
      };
    });
  }, [savings, transactions]);

  /*
   * Cea mai mare categorie de cheltuieli.
   */
  const highestExpenseCategory = useMemo(() => {
    if (categoryData.length === 0) {
      return null;
    }

    return categoryData.reduce((max, current) =>
      current.value > max.value ? current : max
    );
  }, [categoryData]);

  /*
   * Totalul tuturor economiilor.
   */
  const totalSaved = savingsData.reduce(
    (sum, saving) => sum + saving.savedAmount,
    0
  );

  const years = [];

  for (let year = currentYear - 5; year <= currentYear; year++) {
    years.push(year);
  }

  const months = [
    { value: "all", label: "Toate lunile" },
    { value: 0, label: "Ianuarie" },
    { value: 1, label: "Februarie" },
    { value: 2, label: "Martie" },
    { value: 3, label: "Aprilie" },
    { value: 4, label: "Mai" },
    { value: 5, label: "Iunie" },
    { value: 6, label: "Iulie" },
    { value: 7, label: "August" },
    { value: 8, label: "Septembrie" },
    { value: 9, label: "Octombrie" },
    { value: 10, label: "Noiembrie" },
    { value: 11, label: "Decembrie" },
  ];

  return (
    <>
      <Sidebar />

      <Box
  sx={{
    ml: {
      xs: 0,
      md: "240px",
    },

    p: {
      xs: 2,
      md: 4,
    },

    minHeight: "100vh",
    backgroundColor: "#f5f7fa",
  }}
>
      
       <Typography
  variant="h4"
  fontWeight="bold"
  gutterBottom
  sx={{
    fontSize: {
      xs: "1.7rem",
      md: "2.125rem",
    },
  }}
>
  📊 Rapoarte financiare
</Typography>

       {/* FILTRE */}

<Card sx={{ mb: 4 }}>
  <CardContent
    sx={{
      p: {
        xs: 2,
        md: 3,
      },
    }}
  >
    <Typography
      variant="h6"
      fontWeight="bold"
      sx={{ mb: 2 }}
    >
      📅 Selectează perioada
    </Typography>

    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 6 }}>
        <FormControl fullWidth>
          <InputLabel>An</InputLabel>

          <Select
            value={selectedYear}
            label="An"
            onChange={(e) =>
              setSelectedYear(e.target.value)
            }
          >
            {years.map((year) => (
              <MenuItem
                key={year}
                value={year}
              >
                {year}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <FormControl fullWidth>
          <InputLabel>Lună</InputLabel>

          <Select
            value={selectedMonth}
            label="Lună"
            onChange={(e) =>
              setSelectedMonth(e.target.value)
            }
          >
            {months.map((month) => (
              <MenuItem
                key={month.value}
                value={month.value}
              >
                {month.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  </CardContent>
</Card>

        {/* CARDURI PRINCIPALE */}

        <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 3 }}>
            <Paper
              elevation={3}
              sx={{
                p: {
                  xs: 2,
                  md: 3,
                },
                borderRadius: 3,
                height: "100%",
              }}
            >
              <TrendingUpIcon
                color="success"
                sx={{ fontSize: 35 }}
              />

              <Typography color="text.secondary">
                Venituri
              </Typography>

              <Typography
                variant="h5"
                fontWeight="bold"
                color="success.main"
              >
                {formatMoney(totalIncome)} lei
              </Typography>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <Paper
              elevation={3}
              sx={{
                p: {
                  xs: 2,
                  md: 3,
                },
                borderRadius: 3,
                height: "100%",
              }}
            >
              <TrendingDownIcon
                color="error"
                sx={{ fontSize: 35 }}
              />

              <Typography color="text.secondary">
                Cheltuieli
              </Typography>

              <Typography
                variant="h5"
                fontWeight="bold"
                color="error.main"
              >
                {formatMoney(totalExpense)} lei
              </Typography>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <Paper
              elevation={3}
              sx={{
                p: {
                  xs: 2,
                  md: 3,
                },
                borderRadius: 3,
                height: "100%",
              }}
            >
              <AccountBalanceWalletIcon
                color={balance >= 0 ? "primary" : "error"}
                sx={{ fontSize: 35 }}
              />

              <Typography color="text.secondary">
                Sold
              </Typography>

              <Typography
                variant="h5"
                fontWeight="bold"
                color={
                  balance >= 0
                    ? "primary.main"
                    : "error.main"
                }
              >
                {formatMoney(balance)} lei
              </Typography>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <Paper
              elevation={3}
              sx={{
                p: {
                  xs: 2,
                  md: 3,
                },
                borderRadius: 3,
                height: "100%",
              }}
            >
              <SavingsIcon
                color="warning"
                sx={{ fontSize: 35 }}
              />

              <Typography color="text.secondary">
                Total economisit
              </Typography>

              <Typography
                variant="h5"
                fontWeight="bold"
                color="warning.main"
              >
                {formatMoney(totalSaved)} lei
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* PROCENT CHELTUIELI */}

        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography
              variant="h6"
              fontWeight="bold"
              gutterBottom
            >
              💸 Procentul veniturilor cheltuit
            </Typography>

            <Box
  sx={{
    display: "flex",
    justifyContent: "space-between",

    flexDirection: {
      xs: "column",
      sm: "row",
    },

    gap: 1,
    mb: 1,
  }}
>
            
              <Typography>
                {expensePercentage}% din venituri
              </Typography>

              <Typography fontWeight="bold">
                {formatMoney(totalExpense)} lei
              </Typography>
            </Box>

            <LinearProgress
              variant="determinate"
              value={Math.min(expensePercentage, 100)}
              color={
                expensePercentage > 80
                  ? "error"
                  : expensePercentage > 50
                  ? "warning"
                  : "success"
              }
              sx={{
                height: 12,
                borderRadius: 5,
              }}
            />
          </CardContent>
        </Card>

        {/* GRAFIC VENITURI / CHELTUIELI */}

        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography
              variant="h6"
              fontWeight="bold"
              sx={{ mb: 3 }}
            >
              📈 Venituri și cheltuieli
            </Typography>

            <Box
  sx={{
    width: "100%",
    height: {
      xs: 280,
      md: 350,
    },
  }}
>
              <ResponsiveContainer>
                <BarChart data={chartData}>
                  <XAxis dataKey="month" />

                  <YAxis />

                  <Tooltip
                    formatter={(value) =>
                      `${formatMoney(value)} lei`
                    }
                  />

<Legend
  verticalAlign="bottom"
  align="center"
  wrapperStyle={{
    fontSize: "13px",
  }}
/>

                  <Bar
                    dataKey="venituri"
                    name="Venituri"
                    fill="#2e7d32"
                  />

                  <Bar
                    dataKey="cheltuieli"
                    name="Cheltuieli"
                    fill="#d32f2f"
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>

        {/* CHELTUIELI PE CATEGORII */}

        <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  sx={{ mb: 3 }}
                >
                  🥧 Cheltuieli pe categorii
                </Typography>

                {categoryData.length === 0 ? (
                  <Typography color="text.secondary">
                    Nu există cheltuieli pentru perioada
                    selectată.
                  </Typography>
                ) : (
                  <Box
  sx={{
    width: "100%",
    height: {
      xs: 280,
      md: 350,
    },
  }}
>
                    <ResponsiveContainer>
                      <PieChart>
                      <Pie
  data={categoryData}
  dataKey="value"
  nameKey="name"
  cx="50%"
  cy="45%"
  outerRadius={80}
>
                          {categoryData.map(
                            (entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={
                                  [
                                    "#1976d2",
                                    "#2e7d32",
                                    "#d32f2f",
                                    "#ed6c02",
                                    "#9c27b0",
                                    "#0288d1",
                                    "#7b1fa2",
                                  ][index %
                                    7]
                                }
                              />
                            )
                          )}
                        </Pie>

                        <Tooltip
                          formatter={(value) =>
                            `${formatMoney(value)} lei`
                          }
                        />

                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* CEA MAI MARE CHELTUIALĂ */}

          <Grid size={{ xs: 12, md: 6 }}>
            <Card sx={{ height: "100%" }}>
              <CardContent>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  sx={{ mb: 3 }}
                >
                  🔎 Analiză cheltuieli
                </Typography>

                {highestExpenseCategory ? (
                  <>
                    <Typography color="text.secondary">
                      Categoria cu cele mai mari cheltuieli:
                    </Typography>

                    <Typography
                      variant="h5"
                      fontWeight="bold"
                      sx={{ mt: 1 }}
                    >
                      {highestExpenseCategory.name}
                    </Typography>

                    <Typography
                      variant="h4"
                      color="error.main"
                      fontWeight="bold"
                      sx={{ mt: 1 }}
                    >
                      {formatMoney(
                        highestExpenseCategory.value
                      )}{" "}
                      lei
                    </Typography>

                    <Divider sx={{ my: 3 }} />

                    {categoryData
                      .sort(
                        (a, b) => b.value - a.value
                      )
                      .map((category) => {
                        const percentage =
                          totalExpense > 0
                            ? Math.round(
                                (category.value /
                                  totalExpense) *
                                  100
                              )
                            : 0;

                        return (
                          <Box
                            key={category.name}
                            sx={{ mb: 2 }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent:
                                  "space-between",
                                mb: 0.5,
                              }}
                            >
                              <Typography>
                                {category.name}
                              </Typography>

                              <Typography fontWeight="bold">
                                {percentage}%
                              </Typography>
                            </Box>

                            <LinearProgress
                              variant="determinate"
                              value={percentage}
                              sx={{
                                height: 8,
                                borderRadius: 5,
                              }}
                            />
                          </Box>
                        );
                      })}
                  </>
                ) : (
                  <Typography color="text.secondary">
                    Nu există suficiente date pentru
                    analiză.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* OBIECTIVE DE ECONOMII */}

        <Card sx={{ mt: 4 }}>
          <CardContent>
            <Typography
              variant="h6"
              fontWeight="bold"
              sx={{ mb: 3 }}
            >
              🎯 Progresul obiectivelor de economii
            </Typography>

            {savingsData.length === 0 ? (
              <Typography color="text.secondary">
                Nu ai creat încă niciun obiectiv de economii.
              </Typography>
            ) : (
              savingsData.map((saving) => (
                <Box
                  key={saving._id}
                  sx={{ mb: 3 }}
                >
                  <Box
  sx={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 1,
    flexWrap: "wrap",
    mb: 1,
  }}
>
                    <Typography fontWeight="bold">
                      🎯 {saving.title}
                    </Typography>

                    <Typography fontWeight="bold">
                      {saving.progress}%
                    </Typography>
                  </Box>

                  <LinearProgress
                    variant="determinate"
                    value={saving.progress}
                    color={
                      saving.progress === 100
                        ? "success"
                        : saving.progress >= 80
                        ? "warning"
                        : "primary"
                    }
                    sx={{
                      height: 10,
                      borderRadius: 5,
                    }}
                  />

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    {formatMoney(saving.savedAmount)} lei
                    economisiți din{" "}
                    {formatMoney(saving.targetAmount)} lei
                  </Typography>

                  {saving.progress === 100 && (
                    <Typography
                      color="success.main"
                      fontWeight="bold"
                      sx={{ mt: 1 }}
                    >
                      🎉 Obiectiv atins!
                    </Typography>
                  )}
                </Box>
              ))
            )}
          </CardContent>
        </Card>
      </Box>
    </>
  );
}

export default Reports;