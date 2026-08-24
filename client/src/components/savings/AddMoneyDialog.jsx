import { useState, useEffect } from "react";
import api from "../../services/api";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";

function AddMoneyDialog({ open, onClose, saving, onSuccess }) {
  const [amount, setAmount] = useState("");

  useEffect(() => {
    if (!open) {
      setAmount("");
    }
  }, [open]);

  const handleSave = async () => {
    if (!amount || Number(amount) <= 0) {
      alert("Introdu o sumă validă.");
      return;
    }

    try {
      await api.post("/saving-transaction", {
        saving: saving._id,
        amount: Number(amount),
      });

      onSuccess();
      onClose();

    } catch (err) {
      console.log(err);
      alert("Eroare la salvarea depunerii.");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">

      <DialogTitle>
        Adaugă bani
      </DialogTitle>

      <DialogContent>

        <TextField
          autoFocus
          fullWidth
          type="number"
          label="Sumă"
          margin="normal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

      </DialogContent>

      <DialogActions>

        <Button onClick={onClose}>
          Anulează
        </Button>

        <Button
          variant="contained"
          onClick={handleSave}
        >
          Salvează
        </Button>

      </DialogActions>

    </Dialog>
  );
}

export default AddMoneyDialog;