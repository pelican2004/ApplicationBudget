import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Sidebar from "../components/layout/Sidebar";

import {
  Box,
  Typography,
  Paper,
  Grid,
  List,
  ListItem,
  ListItemText,
  LinearProgress,
  Chip,
  Button,
  Divider,
  Stack,
} from "@mui/material";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import SavingsIcon from "@mui/icons-material/Savings";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";

function Dashboard() {
  const navigate = useNavigate();

  const [incomeTotal, setIncomeTotal] = useState(0);
  const [expenseTotal, setExpenseTotal] = useState(0);
  const [balance, setBalance] = useState(0);

  const [unpaidBills, setUnpaidBills] = useState(0);
  const [unpaidBillsAmount, setUnpaidBillsAmount] = useState(0);

  const [totalSaved, setTotalSaved] = useState(0);
  const [savingsProgress, setSavingsProgress] = useState(0);

  const [savingsList, setSavingsList] = useState([]);
  const [upcomingBills, setUpcomingBills] = useState([]);

  const [activities, setActivities] = useState([]);

  const user = JSON.parse(localStorage.getItem("user"));

  const loadDashboard = async () => {
    try {
      if (!user?._id) {
        return;
      }
      const incomeRes = await api.get(`/income/${user._id}`);

      const incomes = incomeRes.data.incomes || [];

      const totalIncome = incomes.reduce(
        (sum, income) =>
          sum + Number(income.amount || 0),
        0
      );
      const expenseRes = await api.get(
        `/expense/${user._id}`
      );

      const expenses = expenseRes.data.expenses || [];

      const totalExpense = expenses.reduce(
        (sum, expense) =>
          sum + Number(expense.amount || 0),
        0
      );
      let unpaid = 0;
      let unpaidAmount = 0;
      let upcoming = [];

      try {
        const billRes = await api.get(
          `/bill/${user._id}`
        );

        const bills = billRes.data.bills || [];

        const unpaidBillsList = bills.filter(
          (bill) => bill.status !== "paid"
        );

        unpaid = unpaidBillsList.length;

        unpaidAmount = unpaidBillsList.reduce(
          (sum, bill) =>
            sum + Number(bill.amount || 0),
          0
        );

        // Facturile neachitate care urmează să ajungă
        // la termen în următoarele 7 zile
        const today = new Date();

        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);

        upcoming = unpaidBillsList
          .filter((bill) => {
            const dueDate = new Date(
              bill.dueDate
            );

            return (
              dueDate >= today &&
              dueDate <= nextWeek
            );
          })
          .sort(
            (a, b) =>
              new Date(a.dueDate) -
              new Date(b.dueDate)
          )
          .slice(0, 5);
      } catch (error) {
        console.log(
          "Facturile nu au putut fi încărcate:",
          error
        );
      }
      let saved = 0;
      let target = 0;

      let savingsData = [];

      try {
        const savingRes = await api.get(
          `/saving/${user._id}`
        );

        const savings =
          savingRes.data.savings || [];

        for (const saving of savings) {
          const targetAmount = Number(
            saving.targetAmount || 0
          );

          target += targetAmount;

          const transactionRes =
            await api.get(
              `/saving-transaction/${saving._id}`
            );

          const transactions =
            transactionRes.data.transactions || [];

          const savingAmount =
            transactions.reduce(
              (sum, transaction) =>
                sum +
                Number(
                  transaction.amount || 0
                ),
              0
            );

          saved += savingAmount;

          const progress =
            targetAmount > 0
              ? Math.min(
                  Math.round(
                    (savingAmount /
                      targetAmount) *
                      100
                  ),
                  100
                )
              : 0;

          savingsData.push({
            ...saving,
            savedAmount: savingAmount,
            progress,
          });
        }
      } catch (error) {
        console.log(
          "Economiile nu au putut fi încărcate:",
          error
        );
      }

      const progress =
        target > 0
          ? Math.min(
              Math.round(
                (saved / target) * 100
              ),
              100
            )
          : 0;
      const allActivities = [
        ...incomes.map((income) => ({
          type: "income",
          amount: Number(
            income.amount || 0
          ),
          category:
            income.category ||
            "Venit",
          description:
            income.description || "",
          date: income.date,
        })),

        ...expenses.map((expense) => ({
          type: "expense",
          amount: Number(
            expense.amount || 0
          ),
          category:
            expense.category ||
            "Cheltuială",
          description:
            expense.description || "",
          date: expense.date,
        })),
      ];

      allActivities.sort(
        (a, b) =>
          new Date(b.date) -
          new Date(a.date)
      );
      setIncomeTotal(totalIncome);
      setExpenseTotal(totalExpense);

      setBalance(
        totalIncome - totalExpense
      );

      setUnpaidBills(unpaid);
      setUnpaidBillsAmount(
        unpaidAmount
      );

      setTotalSaved(saved);
      setSavingsProgress(progress);

      setSavingsList(savingsData);
      setUpcomingBills(upcoming);

      setActivities(
        allActivities.slice(0, 5)
      );
    } catch (error) {
      console.error(
        "Eroare Dashboard:",
        error
      );
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);
  const formatMoney = (value) => {
    return Number(value).toLocaleString(
      "ro-RO",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );
  };
  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(
      date
    ).toLocaleDateString("ro-RO");
  };
  const chartData = [
    {
      name: "Finanțe",
      Venituri: incomeTotal,
      Cheltuieli: expenseTotal,
    },
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
  }}
>
        {/* ================================= */}
        {/* TITLU */}
        {/* ================================= */}

        <Typography
  variant="h3"
  sx={{
    mb: 1,
    fontSize: {
      xs: "2rem",
      md: "3rem",
    },
  }}
>
  💰 Application Budget
</Typography>

        <Typography
          sx={{
            mb: 1,
            fontSize: 20,
          }}
        >
          Bun venit, {user?.firstName}! 👋
        </Typography>

        <Typography
          sx={{ mb: 4 }}
          color="text.secondary"
        >
          Iată situația finanțelor tale.
        </Typography>

        {/* ================================= */}
        {/* CARDURI FINANCIARE */}
        {/* ================================= */}

        <Grid
          container
          spacing={3}
        >
          {/* SOLD */}

        
<Grid size={{ xs: 12, md: 4 }}>
            <Paper
              elevation={4}
              sx={{
                p: 3,
                bgcolor: "#1976d2",
                color: "white",
                borderRadius: 3,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 1,
                }}
              >
                <AccountBalanceWalletIcon />

                <Typography>
                  Sold curent
                </Typography>
              </Box>

              <Typography variant="h4">
                {formatMoney(balance)} Lei
              </Typography>
            </Paper>
          </Grid>

          {/* VENITURI */}

          <Grid size={{ xs: 12, md: 4 }}>
            <Paper
              elevation={4}
              sx={{
                p: 3,
                bgcolor: "#2e7d32",
                color: "white",
                borderRadius: 3,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 1,
                }}
              >
                <TrendingUpIcon />

                <Typography>
                  Venituri
                </Typography>
              </Box>

              <Typography variant="h4">
                {formatMoney(
                  incomeTotal
                )}{" "}
                Lei
              </Typography>
            </Paper>
          </Grid>

          {/* CHELTUIELI */}

          <Grid size={{ xs: 12, md: 4 }}>
            <Paper
              elevation={4}
              sx={{
                p: 3,
                bgcolor: "#d32f2f",
                color: "white",
                borderRadius: 3,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 1,
                }}
              >
                <TrendingDownIcon />

                <Typography>
                  Cheltuieli
                </Typography>
              </Box>

              <Typography variant="h4">
                {formatMoney(
                  expenseTotal
                )}{" "}
                Lei
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* ================================= */}
        {/* FACTURI + ECONOMII */}
        {/* ================================= */}

        <Grid
          container
          spacing={3}
          sx={{ mt: 1 }}
        >
          {/* FACTURI */}

          <Grid size={{ xs: 12, md: 6 }}>
            <Paper
              elevation={3}
              sx={{
                p: {
                  xs: 2,
                  md: 3,
                },
                borderRadius: 3,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 2,
                }}
              >
                <ReceiptLongIcon />

                <Typography variant="h6">
                  Facturi
                </Typography>
              </Box>

              {unpaidBills === 0 ? (
                <Typography
                  color="success.main"
                  sx={{ mb: 2 }}
                >
                  ✅ Nu ai facturi
                  neachitate.
                </Typography>
              ) : (
                <>
                  <Typography
                    color="warning.main"
                    sx={{ mb: 1 }}
                  >
                    ⚠️ Ai{" "}
                    <strong>
                      {unpaidBills}
                    </strong>{" "}
                    facturi
                    neachitate.
                  </Typography>

                  <Typography
                    sx={{ mb: 2 }}
                  >
                    Total de plată:{" "}
                    <strong>
                      {formatMoney(
                        unpaidBillsAmount
                      )}{" "}
                      Lei
                    </strong>
                  </Typography>
                </>
              )}

              <Button
                variant="outlined"
                startIcon={
                  <ReceiptLongIcon />
                }
                onClick={() =>
                  navigate("/bills")
                }
              >
                Vezi facturile
              </Button>
            </Paper>
          </Grid>

          {/* ECONOMII */}

          <Grid size={{ xs: 12, md: 6 }}>
            <Paper
              elevation={3}
              sx={{
                p: {
                  xs: 2,
                  md: 3,
                },
                borderRadius: 3,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 2,
                }}
              >
                <SavingsIcon />

                <Typography variant="h6">
                  Economii
                </Typography>
              </Box>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 1 }}
              >
                Progresul total al
                obiectivelor
              </Typography>

              <LinearProgress
                variant="determinate"
                value={savingsProgress}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  mb: 1,
                }}
              />

              <Typography>
                <strong>
                  {savingsProgress}%
                </strong>{" "}
                economisit
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 1, mb: 2 }}
              >
                Total economisit:{" "}
                <strong>
                  {formatMoney(
                    totalSaved
                  )}{" "}
                  Lei
                </strong>
              </Typography>

              <Button
                variant="outlined"
                startIcon={
                  <SavingsIcon />
                }
                onClick={() =>
                  navigate("/savings")
                }
              >
                Vezi economiile
              </Button>
            </Paper>
          </Grid>
        </Grid>

        {/* ================================= */}
        {/* FACTURI APROPIATE DE SCADENȚĂ */}
        {/* ================================= */}

        <Paper
          elevation={3}
          sx={{
            p: {
              xs: 2,
              md: 3,
            },
            mt: 4,
            borderRadius: 3,
          }}
        >
          <Typography
            variant="h6"
            gutterBottom
          >
            🗓️ Facturi apropiate de scadență
          </Typography>

          {upcomingBills.length === 0 ? (
            <Typography
              color="text.secondary"
            >
              Nu ai facturi neachitate care
              ajung la scadență în
              următoarele 7 zile.
            </Typography>
          ) : (
            <Stack spacing={2}>
              {upcomingBills.map(
                (bill) => (
                  <Box
                    key={bill._id}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor:
                        "background.default",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        alignItems:
                          "center",
                        flexWrap:
                          "wrap",
                        gap: 1,
                      }}
                    >
                      <Box>
                        <Typography fontWeight="bold">
                          {bill.provider}
                        </Typography>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          Scadență:{" "}
                          {formatDate(
                            bill.dueDate
                          )}
                        </Typography>
                      </Box>

                      <Chip
                        label={`${formatMoney(
                          bill.amount
                        )} Lei`}
                        color="warning"
                      />
                    </Box>
                  </Box>
                )
              )}
            </Stack>
          )}
        </Paper>

        {/* ================================= */}
        {/* OBIECTIVE ECONOMII */}
        {/* ================================= */}

        <Paper
          elevation={3}
          sx={{
            p: 3,
            mt: 4,
            borderRadius: 3,
          }}
        >
         <Box
  sx={{
    display: "flex",
    justifyContent: "space-between",

    alignItems: {
      xs: "flex-start",
      sm: "center",
    },

    flexDirection: {
      xs: "column",
      sm: "row",
    },

    gap: 2,
    mb: 2,
  }}
>
            <Typography variant="h6">
              🎯 Obiectivele mele
            </Typography>

            <Button
              variant="outlined"
              onClick={() =>
                navigate("/savings")
              }
            >
              Toate obiectivele
            </Button>
          </Box>

          {savingsList.length === 0 ? (
            <Typography
              color="text.secondary"
            >
              Nu ai creat încă niciun
              obiectiv de economii.
            </Typography>
          ) : (
            <Stack spacing={3}>
              {savingsList.map(
                (saving) => (
                  <Box key={saving._id}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        mb: 1,
                      }}
                    >
                      <Typography fontWeight="bold">
                        🎯 {saving.title}
                      </Typography>

                      <Typography>
                        {saving.progress}%
                      </Typography>
                    </Box>

                    <LinearProgress
                      variant="determinate"
                      value={
                        saving.progress
                      }
                      sx={{
                        height: 10,
                        borderRadius: 5,
                      }}
                    />

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        mt: 1,
                      }}
                    >
                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        Economisit:{" "}
                        {formatMoney(
                          saving.savedAmount
                        )}{" "}
                        Lei
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        Țintă:{" "}
                        {formatMoney(
                          saving.targetAmount
                        )}{" "}
                        Lei
                      </Typography>
                    </Box>

                    {saving.progress ===
                      100 && (
                      <Typography
                        color="success.main"
                        fontWeight="bold"
                        sx={{ mt: 1 }}
                      >
                        🎉 Obiectiv atins!
                      </Typography>
                    )}

                    <Divider sx={{ mt: 2 }} />
                  </Box>
                )
              )}
            </Stack>
          )}
        </Paper>

        {/* ================================= */}
        {/* GRAFIC */}
        {/* ================================= */}

        <Paper
  elevation={3}
  sx={{
    p: {
      xs: 2,
      md: 3,
    },
    mt: 4,
    borderRadius: 3,
    height: {
      xs: 320,
      md: 400,
    },
  }}
>
          <Typography
            variant="h6"
            gutterBottom
          >
            📊 Venituri vs. Cheltuieli
          </Typography>

          <ResponsiveContainer
            width="100%"
            height="90%"
          >
            <BarChart
              data={chartData}
            >
              <XAxis dataKey="name" />

              <YAxis />

              <Tooltip
                formatter={(value) =>
                  `${formatMoney(
                    value
                  )} Lei`
                }
              />

              <Legend />

              <Bar
                dataKey="Venituri"
                name="Venituri"
              />

              <Bar
                dataKey="Cheltuieli"
                name="Cheltuieli"
              />
            </BarChart>
          </ResponsiveContainer>
        </Paper>

        {/* ================================= */}
        {/* ULTIMELE TRANZACȚII */}
        {/* ================================= */}

        <Paper
          elevation={3}
          sx={{
            p: {
              xs: 2,
              md: 3,
            },
            mt: 4,
            borderRadius: 3,
          }}
        >
          <Typography
            variant="h6"
            gutterBottom
          >
            💳 Ultimele tranzacții
          </Typography>

          {activities.length === 0 ? (
            <Typography
              color="text.secondary"
            >
              Nu există tranzacții.
            </Typography>
          ) : (
            <List>
              {activities.map(
                (item, index) => (
                  <ListItem
                    key={index}
                    divider
                  >
                    <ListItemText
                      primary={
                        <Typography
                          fontWeight="bold"
                          color={
                            item.type ===
                            "income"
                              ? "success.main"
                              : "error.main"
                          }
                        >
                          {item.type ===
                          "income"
                            ? "+"
                            : "-"}{" "}
                          {formatMoney(
                            item.amount
                          )}{" "}
                          Lei
                        </Typography>
                      }
                      secondary={
                        <>
                          {item.category}
                          {" • "}
                          {formatDate(
                            item.date
                          )}

{item.description &&
  ` • ${
    item.description.length > 40
      ? `${item.description.substring(0, 40)}...`
      : item.description
  }`}
                        </>
                      }
                    />
                  </ListItem>
                )
              )}
            </List>
          )}
        </Paper>
      </Box>
    </>
  );
}

export default Dashboard;
