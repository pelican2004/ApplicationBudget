import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
} from "@mui/material";

function Login() {
    const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async () => {
    try {
      console.log("1. Se încearcă autentificarea...");
  
      const res = await api.post("/auth/login", form);
  
      console.log("2. Răspuns server:", res.data);
  
      localStorage.setItem(
        "user",
        JSON.stringify(res.data.user)
      );
      localStorage.setItem(
        "token",
        res.data.token
      );
  
      console.log("3. User salvat:", localStorage.getItem("user"));
  
      navigate("/dashboard");
  
      console.log("4. Navigate executat");
  
    } catch (err) {
      console.log("EROARE LOGIN:", err);
      console.log("RĂSPUNS SERVER:", err.response?.data);
  
      alert(
        err.response?.data?.message || "Eroare la autentificare"
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
      sm: 3,
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
  sx={{
    fontSize: {
      xs: "1.8rem",
      sm: "2.125rem",
    },
  }}
>
  Budget Manager
</Typography>

        <Typography align="center">
          Login
        </Typography>

        <TextField
          fullWidth
          label="Email"
          margin="normal"
          name="email"
          onChange={handleChange}
        />

        <TextField
          fullWidth
          label="Parolă"
          type="password"
          margin="normal"
          name="password"
          onChange={handleChange}
        />
<Box
  sx={{
    display: "flex",
    justifyContent: "flex-end",
    mt: 1,
  }}
>
  <Link to="/forgot-password">
    Ai uitat parola?
  </Link>
</Box>
        <Button
          fullWidth
          variant="contained"
          sx={{ mt:3 }}
          onClick={handleLogin}
        >
          Login
        </Button>

        <Typography align="center" sx={{ mt:2 }}>
          Nu ai cont?
        </Typography>

        <Box sx={{ textAlign: "center" }}>
  <Link to="/register">
    Creează cont
  </Link>
</Box>

      </Paper>
    </Box>
  );
}

export default Login;