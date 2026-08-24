import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
} from "@mui/material";

function ResetPassword() {
  const navigate = useNavigate();

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const email =
    localStorage.getItem(
      "resetPasswordEmail"
    );

  const code =
    localStorage.getItem(
      "resetPasswordCode"
    );

  const handleResetPassword = async () => {
    if (!password || !confirmPassword) {
      setError(
        "Completează ambele câmpuri."
      );
      return;
    }

    if (password.length < 6) {
      setError(
        "Parola trebuie să aibă minimum 6 caractere."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        "Parolele nu coincid."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await api.post(
        "/auth/reset-password",
        {
          email,
          code,
          newPassword: password,
        }
      );

      alert(res.data.message);

      // Ștergem datele temporare
      localStorage.removeItem(
        "resetPasswordEmail"
      );

      localStorage.removeItem(
        "resetPasswordCode"
      );

      // Înapoi la Login
      navigate("/");
    } catch (error) {
      console.error(
        "Eroare reset password:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Parola nu a putut fi schimbată."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
  sx={{
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f4f6f8",

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
    maxWidth: 400,
    boxSizing: "border-box",
    borderRadius: 3,
  }}
>
<Typography
  variant="h4"
  align="center"
  gutterBottom
  sx={{
    fontSize: {
      xs: "1.8rem",
      sm: "2.125rem",
    },
  }}
>
  Parolă nouă
</Typography>

        <Typography
          align="center"
          color="text.secondary"
          sx={{ mb: 3 }}
        >
          Introdu noua parolă pentru
          contul tău.
        </Typography>

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
          >
            {error}
          </Alert>
        )}

        <TextField
          fullWidth
          label="Parolă nouă"
          type="password"
          margin="normal"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />

        <TextField
          fullWidth
          label="Confirmă parola"
          type="password"
          margin="normal"
          value={confirmPassword}
          onChange={(e) =>
            setConfirmPassword(
              e.target.value
            )
          }
        />

        <Button
          fullWidth
          variant="contained"
          sx={{ mt: 3 }}
          disabled={loading}
          onClick={
            handleResetPassword
          }
        >
          {loading
            ? "Se salvează..."
            : "Schimbă parola"}
        </Button>
      </Paper>
    </Box>
  );
}

export default ResetPassword;