import { useState, useEffect } from "react";
import api from "../services/api";
import DeleteIcon from "@mui/icons-material/Delete";
import Sidebar from "../components/layout/Sidebar";

import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
} from "@mui/material";

function Income() {
  const [form, setForm] = useState({
    amount: "",
    category: "",
    description: "",
    date: "",
  });

  const [incomes, setIncomes] = useState([]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };
  const loadIncomes = async () => {
    const user = JSON.parse(
      localStorage.getItem("user")
    );

    if (!user?._id) {
      return;
    }

    try {
      const res = await api.get(
        `/income/${user._id}`
      );

      setIncomes(
        res.data.incomes || []
      );
    } catch (err) {
      console.error(
        "Eroare încărcare venituri:",
        err
      );
    }
  };
  const handleSubmit = async () => {
    try {
      const res = await api.post(
        "/income",
        {
          amount: form.amount,
          category: form.category,
          description: form.description,
          date: form.date,
        }
      );

      alert(res.data.message);

      await loadIncomes();

      setForm({
        amount: "",
        category: "",
        description: "",
        date: "",
      });
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
        `/income/${id}`
      );

      alert(res.data.message);

      await loadIncomes();
    } catch (err) {
      console.error(
        "Eroare ștergere venit:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Eroare la ștergere."
      );
    }
  };

  useEffect(() => {
    loadIncomes();
  }, []);

  return (
    <>
      {/* MENIU LATERAL /MOBIL*/}
      <Sidebar />

      {/* CONȚINUTUL PAGINII */}
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
      xs: "1.7rem",
      md: "2.125rem",
    },
  }}
>
  💰 Adaugă venit
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

          <TextField
            fullWidth
            margin="normal"
            label="Categorie"
            name="category"
            value={form.category}
            onChange={handleChange}
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
  label="Data"
  type="date"
  name="date"
  value={form.date}
  onChange={handleChange}
  slotProps={{
    inputLabel: {
      shrink: true,
    },
  }}
/>

          <Button
            variant="contained"
            fullWidth
            sx={{ mt: 3 }}
            onClick={handleSubmit}
          >
            Adaugă venit
          </Button>

          <Typography
            variant="h5"
            sx={{ mt: 4 }}
          >
            Veniturile mele
          </Typography>

          {incomes.length === 0 ? (
            <Typography
              color="text.secondary"
              sx={{ mt: 2 }}
            >
              Nu există venituri adăugate.
            </Typography>
          ) : (
            incomes.map((income) => (
              <Paper
                key={income._id}
                sx={{
                  p: 2,
                  mt: 2,
                  background: "#f5f5f5",
                  borderRadius: 2,
                }}
              >
                <Typography>
                  <strong>Sumă:</strong>{" "}
                  {income.amount} lei
                </Typography>

                <Typography>
                  <strong>
                    Categorie:
                  </strong>{" "}
                  {income.category}
                </Typography>

                <Typography>
                  <strong>
                    Descriere:
                  </strong>{" "}
                  {income.description ||
                    "-"}
                </Typography>

                <Typography>
                  <strong>Data:</strong>{" "}
                  {income.date?.substring(
                    0,
                    10
                  )}
                </Typography>

                <Button
                  color="error"
                  variant="contained"
                  startIcon={
                    <DeleteIcon />
                  }
                  sx={{ mt: 2 }}
                  onClick={() =>
                    handleDelete(
                      income._id
                    )
                  }
                >
                  Șterge
                </Button>
              </Paper>
            ))
          )}
        </Paper>
      </Box>
    </>
  );
}

export default Income;
