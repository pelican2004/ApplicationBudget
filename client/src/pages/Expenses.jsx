import { useState, useEffect } from "react";
import api from "../services/api";
import DeleteIcon from "@mui/icons-material/Delete";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import Sidebar from "../components/layout/Sidebar";
import {
  PieChart,
  Pie,
  Tooltip,
  Legend,
  ResponsiveContainer,

} from "recharts";

import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
} from "@mui/material";

function Expenses() {
  const [form, setForm] = useState({
    amount: "",
    category: "",
    store: "",
    description: "",
    date: "",
  });

  const [expenses, setExpenses] = useState([]);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const now = new Date();

  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  const currentMonthExpenses = expenses.filter(
    (expense) => {
      if (!expense.date) {
        return false;
      }
  
      const expenseDate =
        new Date(expense.date);
  
      return (
        expenseDate.getMonth() ===
          currentMonth &&
        expenseDate.getFullYear() ===
          currentYear
      );
    }
  );
  
  const expensesByCategory =
    currentMonthExpenses.reduce(
      (acc, expense) => {
        const category =
          expense.category?.trim() ||
          "Altele";
  
        const amount =
          Number(expense.amount) || 0;
  
        acc[category] =
          (acc[category] || 0) +
          amount;
  
        return acc;
      },
      {}
    );
  
  const chartData = Object.entries(
    expensesByCategory
  ).map(([name, value]) => ({
    name,
    value,
  }));
  const [selectedFile, setSelectedFile] =
    useState(null);

  const [uploading, setUploading] =
    useState(false);

  const [aiMessage, setAiMessage] =
    useState("");

  const [aiSuccess, setAiSuccess] =
    useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };
  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) {
      setSelectedFile(null);
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert(
        "Sunt permise doar PDF, JPG, PNG sau WEBP."
      );

      e.target.value = "";
      setSelectedFile(null);

      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert(
        "Fișierul nu poate avea mai mult de 10 MB."
      );

      e.target.value = "";
      setSelectedFile(null);

      return;
    }

    setSelectedFile(file);
    setAiMessage("");
    setAiSuccess(false);
  };
  const handleAnalyzeReceipt = async () => {
    if (!selectedFile) {
      alert(
        "Selectează mai întâi un bon fiscal."
      );

      return;
    }

    try {
      setUploading(true);
      setAiMessage("");
      setAiSuccess(false);

      const formData = new FormData();

      formData.append(
        "file",
        selectedFile
      );

      const res = await api.post(
        "/expense/analyze",
        formData
      );

      const receipt =
        res.data.receipt;

      if (!receipt) {
        throw new Error(
          "AI-ul nu a returnat datele bonului."
        );
      }
      const productLines =
        Array.isArray(receipt.products)
          ? receipt.products.map(
              (product) => {
                const name =
                  product.name ||
                  "Produs";

                const price =
                  product.price !== null &&
                  product.price !== undefined
                    ? Number(
                        product.price
                      ).toFixed(2)
                    : "-";

                return `${name} - ${price} lei`;
              }
            )
          : [];

          const descriptionParts = [];

          if (productLines.length > 0) {
            descriptionParts.push(
              ...productLines
            );
          }
      setForm({
        amount:
          receipt.totalAmount !== null &&
          receipt.totalAmount !== undefined
            ? receipt.totalAmount
            : "",

        category:
          "Cumpărături",
          store: receipt.store || "",
        description:
          descriptionParts.join("\n"),

        date:
          receipt.date || "",
      });

      setAiSuccess(true);

      setAiMessage(
        "Bonul a fost analizat cu succes! Verifică datele înainte de salvare."
      );
    } catch (error) {
      console.error(
        "Eroare analiză bon:",
        error
      );

      setAiSuccess(false);

      setAiMessage(
        error.response?.data?.message ||
          error.message ||
          "Bonul nu a putut fi analizat."
      );
    } finally {
      setUploading(false);
    }
  };
  const loadExpenses = async () => {
    const user = JSON.parse(
      localStorage.getItem("user")
    );

    if (!user?._id) {
      return;
    }

    try {
      const res = await api.get(
        `/expense/${user._id}`
      );

      setExpenses(
        res.data.expenses || []
      );
    } catch (err) {
      console.error(
        "Eroare încărcare cheltuieli:",
        err
      );
    }
  };
  const handleSubmit = async () => {
    try {
      const res = await api.post(
        "/expense",
        {
          amount: form.amount,
          category: form.category,
          store: form.store,
          description: form.description,
          date: form.date,
        }
      );

      alert(res.data.message);

      await loadExpenses();

      setForm({
        amount: "",
        category: "",
        store: "",
        description: "",
        date: "",
      });

      setSelectedFile(null);
      setAiMessage("");
      setAiSuccess(false);
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Eroare la salvare."
      );
    }
  };
  const handleDelete = async (id) => {
    try {
      const res = await api.delete(
        `/expense/${id}`
      );

      alert(res.data.message);

      await loadExpenses();
    } catch (err) {
      console.error(
        "Eroare ștergere cheltuială:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Eroare la ștergere."
      );
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  return (
    <>
      <Sidebar />
  
      <Box
        sx={{
          ml: {
            xs: 0,
            md: "240px",
          },
          width: {
            xs: "100%",
            md: "calc(100% - 240px)",
          },
          minHeight: "100vh",
          p: {
            xs: 2,
            md: 4,
          },
          boxSizing: "border-box",
          mb: 4,
        }}
      >
      
        {/* =====================================
            AI BON FISCAL
        ====================================== */}

        <Paper
         sx={{
          p: {
            xs: 2,
            md: 4,
          },
        
          width: "100%",
          maxWidth: 700,
          boxSizing: "border-box",
          borderRadius: 3,
          mb: 4,
        }}
        >
          <Typography
            variant="h5"
            gutterBottom
          >
            🤖 Analizează bonul cu AI
          </Typography>

          <Typography
            color="text.secondary"
            sx={{ mb: 3 }}
          >
            Încarcă un bon fiscal PDF
            sau o fotografie a bonului.
            AI-ul va identifica magazinul,
            data, suma totală și produsele
            cumpărate.
          </Typography>

          <Button
  variant="outlined"
  component="label"
  startIcon={<UploadFileIcon />}
  sx={{
    width: {
      xs: "100%",
      sm: "auto",
    },
  }}
>
  Alege bonul

            <input
              hidden
              type="file"
              accept="
                application/pdf,
                image/jpeg,
                image/png,
                image/webp,
                .pdf,
                .jpg,
                .jpeg,
                .png,
                .webp
              "
              onChange={
                handleFileChange
              }
            />
          </Button>

          {selectedFile && (
            <Box sx={{ mt: 2 }}>
              <Typography>
                📄 {selectedFile.name}
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                {(
                  selectedFile.size /
                  1024
                ).toFixed(1)}{" "}
                KB
              </Typography>
            </Box>
          )}

          <Button
            variant="contained"
            startIcon={
              <UploadFileIcon />
            }
            sx={{
              mt: {
                xs: 2,
                sm: 3,
              },
            
              ml: {
                xs: 0,
                sm: 2,
              },
            
              width: {
                xs: "100%",
                sm: "auto",
              },
            }}
            disabled={
              !selectedFile ||
              uploading
            }
            onClick={
              handleAnalyzeReceipt
            }
          >
            {uploading
              ? "Se analizează..."
              : "Analizează bonul"}
          </Button>

          {aiMessage && (
            <Alert
              severity={
                aiSuccess
                  ? "success"
                  : "error"
              }
              sx={{ mt: 3 }}
            >
              {aiMessage}
            </Alert>
          )}
        </Paper>

        {/* =====================================
            FORMULAR CHELTUIALĂ
        ====================================== */}

<Paper
  sx={{
    p: {
      xs: 2,
      md: 4,
    },

    width: "100%",
    maxWidth: 700,
    boxSizing: "border-box",
    borderRadius: 3,
  }}
>
<Typography
  variant="h4"
  gutterBottom
  sx={{
    fontSize: {
      xs: "1.35rem",
      md: "1.5rem",
    }
  }}
>
  💸 Adaugă cheltuială
</Typography>

          <TextField
            fullWidth
            margin="normal"
            label="Sumă"
            name="amount"
            type="number"
            value={form.amount}
            onChange={handleChange}
          />

<Autocomplete
  freeSolo
  options={[
    "Cumpărături",
    "Facturi",
    "Chirie",
    "Combustibil",
    "Transport",
    "Mâncare",
    "Sănătate",
    "Divertisment",
    "Educație",
    "Altele",
  ]}
  value={form.category}
  onInputChange={(event, newValue) => {
    setForm((prev) => ({
      ...prev,
      category: newValue,
    }));
  }}
  renderInput={(params) => (
    <TextField
      {...params}
      fullWidth
      margin="normal"
      label="Categorie"
    />
  )}
/>
          <TextField
  fullWidth
  margin="normal"
  label="Magazin"
  name="store"
  value={form.store}
  onChange={handleChange}
/>

          <TextField
            fullWidth
            margin="normal"
            label="Descriere"
            name="description"
            value={form.description}
            onChange={handleChange}
            multiline
            minRows={5}
          />

          <Typography
            sx={{
              mt: 2,
              mb: 0.5,
            }}
          >
            Data
          </Typography>

          <TextField
            fullWidth
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
          />

<Button
  variant="contained"
  fullWidth
  sx={{ mt: 3 }}
  onClick={handleSubmit}
>
  Adaugă cheltuială
</Button>

<Typography
  variant="h5"
  sx={{
    mt: 5,
    mb: 2,
    fontSize: {
      xs: "1.35rem",
      md: "1.5rem",
    },
  }}
>
  Cheltuieli pe categorii -{" "}
  {new Date().toLocaleDateString(
    "ro-RO",
    {
      month: "long",
      year: "numeric",
    }
  )}
</Typography>

{chartData.length === 0 ? (
  <Typography
    color="text.secondary"
    sx={{ mb: 3 }}
  >
    Nu există suficiente date pentru afișarea graficului.
  </Typography>
) : (
  <Box
  sx={{
    width: "100%",

    height: {
      xs: 320,
      md: 350,
    },

    mb: 4,
  }}
>
  
    <ResponsiveContainer
      width="100%"
      height="100%"
    >
      <PieChart>
      <Pie
  data={chartData}
  dataKey="value"
  nameKey="name"
  cx="50%"
  cy="42%"
  outerRadius={75}
/>

        <Tooltip
          formatter={(value) => [
            `${Number(value).toFixed(2)} lei`,
            "Cheltuieli",
          ]}
        />

<Legend
  verticalAlign="bottom"
  align="center"
  wrapperStyle={{
    fontSize: "12px",
    lineHeight: "18px",
  }}
/>
      </PieChart>
    </ResponsiveContainer>
  </Box>
)}
          <Typography
            variant="h5"
            sx={{ mt: 4 }}
          >
            Cheltuielile mele
          </Typography>

          {expenses.length === 0 ? (
  <Typography
    color="text.secondary"
    sx={{ mt: 2 }}
  >
    Nu există cheltuieli adăugate.
  </Typography>
) : (
  expenses.map((expense) => (
    <Paper
      key={expense._id}
      sx={{
        p: 2,
        mt: 2,
        background: "#f5f5f5",
        borderRadius: 2,
      }}
    >
      <Typography>
    <strong>Magazin:</strong>{" "}
    {expense.store || "-"}
  </Typography>
      <Typography>
        <strong>Sumă:</strong>{" "}
        {expense.amount} lei
      </Typography>

      <Typography>
        <strong>Categorie:</strong>{" "}
        {expense.category}
      </Typography>

      <Typography>
        <strong>Data:</strong>{" "}
        {expense.date?.substring(0, 10)}
      </Typography>

      <Button
        variant="outlined"
        sx={{
          mt: 2,
          mr: {
            xs: 0,
            sm: 1,
          },
          width: {
            xs: "100%",
            sm: "auto",
          },
        }}
        onClick={() =>
          setSelectedExpense(expense)
        }
      >
        Vezi detalii
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
          handleDelete(expense._id)
        }
      >
        Șterge
      </Button>
    </Paper>
  ))
)}

<Dialog
  open={Boolean(selectedExpense)}
  onClose={() => setSelectedExpense(null)}
  fullWidth
  maxWidth="sm"
>
  <DialogTitle>
    Detalii cheltuială
  </DialogTitle>

  <DialogContent dividers>
    {selectedExpense && (
      <>
      <Typography sx={{ mb: 1 }}>
  <strong>Magazin:</strong>{" "}
  {selectedExpense.store || "-"}
</Typography>
        <Typography sx={{ mb: 1 }}>
          <strong>Sumă:</strong>{" "}
          {selectedExpense.amount} lei
        </Typography>

        <Typography sx={{ mb: 1 }}>
          <strong>Categorie:</strong>{" "}
          {selectedExpense.category}
        </Typography>

        <Typography sx={{ mb: 1 }}>
          <strong>Data:</strong>{" "}
          {selectedExpense.date?.substring(0, 10)}
        </Typography>

        <Typography sx={{ mt: 2, mb: 1 }}>
          <strong>Produse / descriere:</strong>
        </Typography>

        <Typography
          sx={{
            whiteSpace: "pre-line",
          }}
        >
          {selectedExpense.description ||
            "Nu există detalii."}
        </Typography>
      </>
    )}
  </DialogContent>

  <DialogActions>
    <Button
      onClick={() => setSelectedExpense(null)}
    >
      Închide
    </Button>
  </DialogActions>
</Dialog>

        </Paper>
      </Box>
    </>
  );
}

export default Expenses;
