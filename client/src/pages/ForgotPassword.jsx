import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
} from "@mui/material";

function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
    if (!email) {
      setError("Introdu adresa de email.");
      return;
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setError("Adresa de email nu este validă.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");

      const res = await api.post(
        "/auth/forgot-password",
        {
          email,
        }
      );

      setMessage(res.data.message);
      localStorage.setItem(
        "resetPasswordEmail",
        email
      );
      setTimeout(() => {
        navigate("/verify-reset-code");
      }, 1000);

    } catch (error) {
      console.error(
        "Eroare forgot password:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Codul nu a putut fi trimis."
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
  Resetare parolă
</Typography>

        <Typography
          align="center"
          color="text.secondary"
          sx={{ mb: 3 }}
        >
          Introdu adresa de email asociată
          contului tău.
        </Typography>

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
          >
            {error}
          </Alert>
        )}

        {message && (
          <Alert
            severity="success"
            sx={{ mb: 2 }}
          >
            {message}
          </Alert>
        )}

        <TextField
          fullWidth
          label="Email"
          type="email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          margin="normal"
        />

        <Button
          fullWidth
          variant="contained"
          sx={{ mt: 3 }}
          disabled={loading}
          onClick={handleSendCode}
        >
          {loading
            ? "Se trimite..."
            : "Trimite codul"}
        </Button>

        <Box
          textAlign="center"
          sx={{ mt: 2 }}
        >
          <Link to="/">
            Înapoi la Login
          </Link>
        </Box>
      </Paper>
    </Box>
  );
}

export default ForgotPassword;
