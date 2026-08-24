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

function VerifyEmail() {
  const navigate = useNavigate();

  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const email =
    localStorage.getItem("verificationEmail");

  const handleVerify = async () => {
    if (!code) {
      setError(
        "Introdu codul de verificare."
      );
      return;
    }

    if (!/^\d{6}$/.test(code)) {
      setError(
        "Codul trebuie să conțină 6 cifre."
      );
      return;
    }

    try {
      setError("");

      const res = await api.post(
        "/auth/verify-email",
        {
          email,
          code,
        }
      );

      alert(res.data.message);

      localStorage.removeItem(
        "verificationEmail"
      );

      navigate("/");
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
  gutterBottom
  sx={{
    fontSize: {
      xs: "1.8rem",
      sm: "2.125rem",
    },
  }}
>
  Verifică emailul
</Typography>

        <Typography
          align="center"
          color="text.secondary"
          sx={{ mb: 3 }}
        >
          Am generat un cod de verificare
          pentru:
        </Typography>

        <Typography
          align="center"
          sx={{
            mb: 3,
            fontWeight: "bold",
            overflowWrap: "anywhere",
          }}
          
        >
          {email}
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
              e.target.value.replace(
                /\D/g,
                ""
              );

            setCode(
              value.slice(0, 6)
            );
          }}
          inputProps={{
            maxLength: 6,
            inputMode: "numeric",
          }}
        />

        <Button
          fullWidth
          variant="contained"
          sx={{
            mt: 3,
            py: 1.3,
          }}
          onClick={handleVerify}
        >
          Verifică emailul
        </Button>
      </Paper>
    </Box>
  );
}

export default VerifyEmail;