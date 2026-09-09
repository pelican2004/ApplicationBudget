import { useState, useEffect } from "react";
import api from "../services/api";
import Sidebar from "../components/layout/Sidebar";

import DeleteIcon from "@mui/icons-material/Delete";
import SavingsIcon from "@mui/icons-material/Savings";
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  LinearProgress,
  Chip,
  Stack,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from "@mui/material";

function Savings() {
  const [form, setForm] = useState({
    title: "",
    targetAmount: "",
    description: "",
    deadline: "",
  });

  const [savings, setSavings] = useState([]);
  const [transactions, setTransactions] = useState({});

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSaving, setSelectedSaving] = useState(null);
  const [amount, setAmount] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };
  const loadSavings = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));

      if (!user) {
        return;
      }

      const res = await api.get(`/saving/${user._id}`);

      setSavings(res.data.savings);

      const history = {};

      for (const saving of res.data.savings) {
        const transactionRes = await api.get(
          `/saving-transaction/${saving._id}`
        );

        history[saving._id] =
          transactionRes.data.transactions || [];
      }

      setTransactions(history);
    } catch (error) {
      console.error("Eroare la încărcarea economiilor:", error);
    }
  };

  useEffect(() => {
    loadSavings();
  }, []);
  const handleSubmit = async () => {
    try {
      if (!form.title.trim()) {
        alert("Introdu numele obiectivului.");
        return;
      }
  
      if (
        !form.targetAmount ||
        Number(form.targetAmount) <= 0
      ) {
        alert("Introdu o sumă țintă validă.");
        return;
      }
  
      const res = await api.post("/saving", {
        title: form.title,
        targetAmount: Number(form.targetAmount),
        description: form.description,
        deadline: form.deadline || null,
      });
  
      alert(res.data.message);
  
      setForm({
        title: "",
        targetAmount: "",
        description: "",
        deadline: "",
      });
  
      await loadSavings();
    } catch (error) {
      console.error(error);
  
      alert(
        error.response?.data?.message ||
          "Eroare la crearea obiectivului."
      );
    }
  };
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Sigur vrei să ștergi acest obiectiv?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await api.delete(`/saving/${id}`);

      await loadSavings();
    } catch (error) {
      console.error(error);

      alert("Eroare la ștergerea obiectivului.");
    }
  };
  const handleOpenDialog = (saving) => {
    const savingTransactions =
      transactions[saving._id] || [];

    const savedAmount = savingTransactions.reduce(
      (sum, transaction) =>
        sum + Number(transaction.amount),
      0
    );
    if (savedAmount >= Number(saving.targetAmount)) {
      alert("Acest obiectiv a fost deja atins.");
      return;
    }

    setSelectedSaving(saving);
    setAmount("");
    setOpenDialog(true);
  };
  const handleAddMoney = async () => {
    try {
      if (!selectedSaving) {
        return;
      }

      const numericAmount = Number(amount);

      if (!numericAmount || numericAmount <= 0) {
        alert("Introdu o sumă validă.");
        return;
      }

      const savingTransactions =
        transactions[selectedSaving._id] || [];

      const savedAmount = savingTransactions.reduce(
        (sum, transaction) =>
          sum + Number(transaction.amount),
        0
      );

      const remaining =
        Number(selectedSaving.targetAmount) -
        savedAmount;
      if (remaining <= 0) {
        alert("Acest obiectiv a fost deja atins.");
        setOpenDialog(false);
        return;
      }

      const res = await api.post(
        "/saving-transaction",
        {
          saving: selectedSaving._id,
          amount: numericAmount,
        }
      );

      alert(
        res.data.message ||
          "Depunerea a fost adăugată."
      );

      setAmount("");
      setSelectedSaving(null);
      setOpenDialog(false);

      await loadSavings();
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
          "Eroare la adăugarea banilor."
      );
    }
  };
  const getProgressColor = (progress) => {
    if (progress < 40) {
      return "error";
    }

    if (progress < 80) {
      return "warning";
    }

    return "success";
  };
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
  }}
>
        <Typography
  variant="h4"
  gutterBottom
  sx={{
    display: "flex",
    alignItems: "center",
    gap: 1,

    fontSize: {
      xs: "1.7rem",
      md: "2.125rem",
    },
  }}
>
  <SavingsIcon />
  Economii
</Typography>
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
              gutterBottom
            >
              Adaugă obiectiv
            </Typography>

            <TextField
              fullWidth
              margin="normal"
              label="Obiectiv"
              name="title"
              value={form.title}
              onChange={handleChange}
            />

            <TextField
              fullWidth
              margin="normal"
              label="Suma țintă"
              type="number"
              name="targetAmount"
              value={form.targetAmount}
              onChange={handleChange}
              slotProps={{
                htmlInput: {
                  min: 1,
                },
              }}
            />

            <TextField
              fullWidth
              margin="normal"
              label="Descriere"
              name="description"
              value={form.description}
              onChange={handleChange}
            />

<TextField
  fullWidth
  margin="normal"
  type="date"
  name="deadline"
  value={form.deadline}
  onChange={handleChange}
  label="Termen"
  slotProps={{
    inputLabel: {
      shrink: true,
    },
  }}
/>

            <Button
              fullWidth
              variant="contained"
              sx={{ mt: 3 }}
              onClick={handleSubmit}
            >
              Adaugă obiectiv
            </Button>
          </CardContent>
        </Card>
        <Typography
          variant="h5"
          sx={{ mb: 2 }}
        >
          Obiectivele mele
        </Typography>

        <Stack spacing={3}>
          {savings.length === 0 ? (
            <Alert severity="info">
              Nu ai creat încă niciun obiectiv
              de economisire.
            </Alert>
          ) : (
            savings.map((saving) => {
              const savingTransactions =
                transactions[saving._id] || [];
              const savedAmount =
                savingTransactions.reduce(
                  (sum, transaction) =>
                    sum +
                    Number(transaction.amount),
                  0
                );

              const targetAmount =
                Number(saving.targetAmount);
              const remaining = Math.max(
                targetAmount - savedAmount,
                0
              );
              const progress =
                targetAmount > 0
                  ? Math.min(
                      Math.round(
                        (savedAmount /
                          targetAmount) *
                          100
                      ),
                      100
                    )
                  : 0;

              const isCompleted =
                savedAmount >= targetAmount;

              return (
                <Card
                  key={saving._id}
                  sx={{
                    borderRadius: 3,
                    boxShadow: 3,
                  }}
                >
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
                      sx={{
                        fontWeight: "bold",
                      }}
                    >
                      🎯 {saving.title}
                    </Typography>

                    <Chip
                      label={`${progress}%`}
                      color={getProgressColor(
                        progress
                      )}
                      sx={{
                        mt: 1,
                        mb: 2,
                      }}
                    />

                    <LinearProgress
                      variant="determinate"
                      value={progress}
                      color={getProgressColor(
                        progress
                      )}
                      sx={{
                        height: 10,
                        borderRadius: 5,
                        mb: 3,
                      }}
                    />
                    <Typography>
                      <strong>
                        Economisit:
                      </strong>{" "}
                      {savedAmount.toFixed(2)} lei
                    </Typography>

                    <Typography>
                      <strong>
                        Țintă:
                      </strong>{" "}
                      {targetAmount.toFixed(2)} lei
                    </Typography>

                    <Typography>
                      <strong>
                        Mai ai de economisit:
                      </strong>{" "}
                      {remaining.toFixed(2)} lei
                    </Typography>

                    {saving.description && (
                      <Typography>
                        <strong>
                          Descriere:
                        </strong>{" "}
                        {saving.description}
                      </Typography>
                    )}

                    <Typography>
                      <strong>
                        Termen:
                      </strong>{" "}
                      {saving.deadline
                        ? saving.deadline.substring(
                            0,
                            10
                          )
                        : "Fără termen"}
                    </Typography>
                    {isCompleted && (
                      <Alert
                        severity="success"
                        sx={{ mt: 2 }}
                      >
                        🎉 Obiectiv atins!
                        <br />
                        Nu mai pot fi adăugați bani
                        acestui obiectiv.
                      </Alert>
                    )}
<Button
  variant="outlined"
  sx={{
    mt: 2,
    mr: {
      xs: 0,
      sm: 2,
    },
    width: {
      xs: "100%",
      sm: "auto",
    },
  }}
  onClick={() => handleOpenDialog(saving)}
>
  Adaugă bani
</Button>
                   <Button
  color="error"
  variant="contained"
  startIcon={<DeleteIcon />}
  sx={{
    mt: 2,
    width: {
      xs: "100%",
      sm: "auto",
    },
  }}
  onClick={() =>
    handleDelete(saving._id)
  }
>
  Șterge
</Button>

                    <Divider
                      sx={{ my: 3 }}
                    />
                    <Typography
                      variant="h6"
                      sx={{
                        mb: 2,
                      }}
                    >
                      📜 Istoric depuneri
                    </Typography>

                    {savingTransactions.length ===
                    0 ? (
                      <Typography
                        color="text.secondary"
                      >
                        Nu există depuneri
                        pentru acest obiectiv.
                      </Typography>
                    ) : (
                      <Stack spacing={1}>
                        {savingTransactions.map(
                          (transaction) => (
                            <Card
                              key={
                                transaction._id
                              }
                              variant="outlined"
                              sx={{
                                p: 2,
                                backgroundColor:
                                  "#f8f9fa",
                              }}
                            >
                              <Typography
                                fontWeight="bold"
                              >
                                +{" "}
                                {Number(
                                  transaction.amount
                                ).toFixed(2)}{" "}
                                lei
                              </Typography>

                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Adăugat la:{" "}
                                {new Date(
                                  transaction.createdAt
                                ).toLocaleDateString(
                                  "ro-RO",
                                  {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                  }
                                )}
                              </Typography>

                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Ora:{" "}
                                {new Date(
                                  transaction.createdAt
                                ).toLocaleTimeString(
                                  "ro-RO",
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </Typography>
                            </Card>
                          )
                        )}
                      </Stack>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </Stack>
      </Box>
      <Dialog
        open={openDialog}
        onClose={() =>
          setOpenDialog(false)
        }
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Adaugă bani
        </DialogTitle>

        <DialogContent>
          {selectedSaving && (
            <>
              <Typography
                sx={{ mb: 2 }}
              >
                Obiectiv:{" "}
                <strong>
                  {selectedSaving.title}
                </strong>
              </Typography>

              <TextField
  fullWidth
  type="number"
  label="Sumă"
  value={amount}
  onChange={(e) =>
    setAmount(e.target.value)
  }
  slotProps={{
    htmlInput: {
      min: 1,
      step: "0.01",
    },
  }}
  autoFocus
/>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 1 }}
              >
                Dacă suma introdusă depășește
                necesarul obiectivului, diferența
                va fi returnată automat în
                venituri.
              </Typography>
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() =>
              setOpenDialog(false)
            }
          >
            Anulează
          </Button>

          <Button
            variant="contained"
            onClick={handleAddMoney}
          >
            Salvează
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Savings;
