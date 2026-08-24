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

function VerifyResetCode() {
  const navigate = useNavigate();

  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const email =
    localStorage.getItem("resetPasswordEmail");

  const handleVerify = async () => {
    if (!code) {
      setError("Introdu codul primit pe email.");
      return;
    }

    if (!/^\d{6}$/.test(code)) {
      setError("Codul trebuie să conțină 6 cifre.");
      return;
    }

    try {
      setError("");

      const res = await api.post(
        "/auth/verify-reset-code",
        {
          email,
          code,
        }
      );

      alert(res.data.message);

      localStorage.setItem(
        "resetPasswordCode",
        code
      );

      navigate("/reset-password");
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Codul nu a putut fi verificat."
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
  Verifică codul
</Typography>

        <Typography
          align="center"
          color="text.secondary"
          sx={{ mb: 3 }}
        >
          Introdu codul de 6 cifre primit pe email.
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
          label="Cod de verificare"
          value={code}
          onChange={(e) => {
            const value =
              e.target.value.replace(/\D/g, "");

            setCode(value.slice(0, 6));
          }}
          inputProps={{
            maxLength: 6,
            inputMode: "numeric",
          }}
        />

        <Button
          fullWidth
          variant="contained"
          sx={{ mt: 3 }}
          onClick={handleVerify}
        >
          Verifică codul
        </Button>
      </Paper>
    </Box>
  );
}

export default VerifyResetCode;