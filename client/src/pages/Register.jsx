import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  MenuItem,
} from "@mui/material";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    birthDate: "",
    gender: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async () => {
    // Verificăm câmpurile obligatorii
    if (
      !form.firstName ||
      !form.lastName ||
      !form.birthDate ||
      !form.gender ||
      !form.phone ||
      !form.email ||
      !form.password ||
      !form.confirmPassword
    ) {
      alert("Completează toate câmpurile.");
      return;
    }

    // Validare simplă email
    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(form.email)) {
      alert("Introdu o adresă de email validă.");
      return;
    }

    // Validare telefon
    const phoneRegex =
      /^[0-9+\s()-]{8,20}$/;

    if (!phoneRegex.test(form.phone)) {
      alert("Introdu un număr de telefon valid.");
      return;
    }

    // Verificăm parola
    if (form.password.length < 6) {
      alert(
        "Parola trebuie să aibă minimum 6 caractere."
      );
      return;
    }

    // Confirmare parolă
    if (
      form.password !==
      form.confirmPassword
    ) {
      alert("Parolele nu coincid.");
      return;
    }

    try {
      const res = await api.post(
        "/auth/register",
        {
          firstName: form.firstName,
          lastName: form.lastName,
          birthDate: form.birthDate,
          gender: form.gender,
          phone: form.phone,
          email: form.email,
          password: form.password,
        }
      );

      alert(res.data.message);

      // Salvăm temporar emailul pentru pagina de verificare
      localStorage.setItem(
        "verificationEmail",
        form.email
      );

      // Mergem la pagina de verificare email
      navigate("/verify-email");
    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.message ||
          "Eroare la crearea contului."
      );
    }
  };

  return (
    <Box
    sx={{
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "#eceff1",
  
      p: {
        xs: 2,
        sm: 4,
      },
    }}
  >
      <Paper
  elevation={6}
  sx={{
    p: {
      xs: 2,
      sm: 4,
    },

    width: "100%",
    maxWidth: 450,
    boxSizing: "border-box",
    borderRadius: 3,
  }}
>
<Typography
  variant="h4"
  align="center"
  sx={{
    mb: 2,

    fontSize: {
      xs: "1.8rem",
      sm: "2.125rem",
    },
  }}
>
  Creează cont
</Typography>

        <TextField
          fullWidth
          label="Prenume"
          margin="normal"
          name="firstName"
          value={form.firstName}
          onChange={handleChange}
        />

        <TextField
          fullWidth
          label="Nume"
          margin="normal"
          name="lastName"
          value={form.lastName}
          onChange={handleChange}
        />

<TextField
  fullWidth
  type="date"
  label="Data nașterii"
  margin="normal"
  name="birthDate"
  value={form.birthDate}
  onChange={handleChange}
  slotProps={{
    inputLabel: {
      shrink: true,
    },
  }}
/>

        <TextField
          fullWidth
          select
          label="Sex"
          margin="normal"
          name="gender"
          value={form.gender}
          onChange={handleChange}
        >
          <MenuItem value="female">
            Feminin
          </MenuItem>

          <MenuItem value="male">
            Masculin
          </MenuItem>

          <MenuItem value="other">
            Prefer să nu specific
          </MenuItem>
        </TextField>

        <TextField
          fullWidth
          label="Număr de telefon"
          margin="normal"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="+40..."
        />

        <TextField
          fullWidth
          label="Email"
          type="email"
          margin="normal"
          name="email"
          value={form.email}
          onChange={handleChange}
        />

        <TextField
          fullWidth
          label="Parolă"
          type="password"
          margin="normal"
          name="password"
          value={form.password}
          onChange={handleChange}
        />

        <TextField
          fullWidth
          label="Confirmă parola"
          type="password"
          margin="normal"
          name="confirmPassword"
          value={form.confirmPassword}
          onChange={handleChange}
        />

        <Button
          fullWidth
          variant="contained"
          sx={{
            mt: 3,
            py: 1.3,
          }}
          onClick={handleRegister}
        >
          Creează cont
        </Button>

        <Typography
          align="center"
          sx={{ mt: 2 }}
        >
          Ai deja cont?
        </Typography>

        <Box sx={{ textAlign: "center" }}>
          <Link to="/">
            Login
          </Link>
        </Box>
      </Paper>
    </Box>
  );
}

export default Register;