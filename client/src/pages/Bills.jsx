import { useState, useEffect } from "react";
import api from "../services/api";
import Sidebar from "../components/layout/Sidebar";

import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Chip,
  Stack,
  Divider,
  Alert,
} from "@mui/material";

import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteIcon from "@mui/icons-material/Delete";

function Bills() {
  const [bills, setBills] = useState([]);

  const [form, setForm] = useState({
    provider: "",
    invoiceNumber: "",
    issueDate: "",
    amount: "",
    dueDate: "",
    description: "",
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [aiMessage, setAiMessage] = useState("");
  const [aiSuccess, setAiSuccess] = useState(false);
  const loadBills = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));

      if (!user?._id) {
        return;
      }

      const res = await api.get(`/bill/${user._id}`);

      setBills(res.data.bills || []);
    } catch (error) {
      console.error(
        "Eroare la încărcarea facturilor:",
        error
      );
    }
  };

  useEffect(() => {
    loadBills();
  }, []);
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

    if (file.type !== "application/pdf") {
      alert("Te rog să selectezi un fișier PDF.");
      e.target.value = "";
      setSelectedFile(null);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("PDF-ul nu poate avea mai mult de 10 MB.");
      e.target.value = "";
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setAiMessage("");
    setAiSuccess(false);
  };
  const handleAnalyzePDF = async () => {
    if (!selectedFile) {
      alert("Selectează mai întâi o factură PDF.");
      return;
    }

    try {
      setUploading(true);
      setAiMessage("");
      setAiSuccess(false);

      const formData = new FormData();

      formData.append("file", selectedFile);

      const res = await api.post(
        "/bill/analyze",
        formData
      );

      console.log(
        "Răspuns AI:",
        res.data
      );

      const invoice = res.data.invoice;

      if (!invoice) {
        throw new Error(
          "AI-ul nu a returnat datele facturii."
        );
      }
      setForm({
        provider: invoice.provider || "",
        invoiceNumber:
          invoice.invoiceNumber || "",
        issueDate:
          invoice.issueDate || "",
        amount:
          invoice.amount !== null &&
          invoice.amount !== undefined
            ? invoice.amount
            : "",
        dueDate:
          invoice.dueDate || "",
        description:
          invoice.invoiceNumber
            ? `Factura nr. ${invoice.invoiceNumber}`
            : "Factură analizată automat cu AI",
      });

      setAiSuccess(true);

      setAiMessage(
        "Factura a fost analizată cu succes! Verifică datele înainte de salvare."
      );
    } catch (error) {
      console.error(
        "Eroare la analiza facturii:",
        error
      );

      setAiSuccess(false);

      setAiMessage(
        error.response?.data?.message ||
          error.message ||
          "Nu am putut analiza factura."
      );
    } finally {
      setUploading(false);
    }
  };
  const handleSubmit = async () => {
    try {
      if (!form.provider) {
        alert("Completează furnizorul.");
        return;
      }
  
      if (!form.amount) {
        alert("Completează suma.");
        return;
      }
  
      if (!form.dueDate) {
        alert("Completează data scadenței.");
        return;
      }
  
      const res = await api.post("/bill", {
        provider: form.provider,
        invoiceNumber: form.invoiceNumber,
        issueDate: form.issueDate || null,
        amount: Number(form.amount),
        dueDate: form.dueDate,
        description: form.description,
      });
  
      alert(res.data.message);
  
      setForm({
        provider: "",
        invoiceNumber: "",
        issueDate: "",
        amount: "",
        dueDate: "",
        description: "",
      });
  
      setSelectedFile(null);
      setAiMessage("");
      setAiSuccess(false);
  
      await loadBills();
    } catch (error) {
      console.error(
        "Eroare la adăugarea facturii:",
        error
      );
  
      alert(
        error.response?.data?.message ||
          "Eroare la adăugarea facturii."
      );
    }
  };
  const handleToggleStatus = async (id) => {
    try {
      const res = await api.put(
        `/bill/${id}/status`
      );

      alert(res.data.message);

      loadBills();
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
          "Eroare la modificarea facturii."
      );
    }
  };
  const handleDelete = async (id) => {
    try {
      await api.delete(`/bill/${id}`);

      loadBills();
    } catch (error) {
      console.error(error);

      alert("Eroare la ștergerea facturii.");
    }
  };
  const formatMoney = (value) => {
    return Number(value || 0).toLocaleString(
      "ro-RO",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );
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

    minHeight: "100vh",
    backgroundColor: "#f5f7fa",
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
          <ReceiptLongIcon />

          Facturi
        </Typography>
        <Card
           sx={{
            p: {
              xs: 2,
              md: 3,
            },
          }}
        >
          <CardContent>
            <Typography
              variant="h6"
              gutterBottom
            >
              🤖 Analizează factura cu AI
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 3 }}
            >
              Încarcă factura în format PDF.
              AI-ul va extrage automat datele
              facturii și va completa formularul.
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
  Alege factura PDF

  <input
    type="file"
    hidden
    accept="application/pdf,.pdf"
    onChange={handleFileChange}
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
                    selectedFile.size / 1024
                  ).toFixed(1)}{" "}
                  KB
                </Typography>
              </Box>
            )}

<Button
  variant="contained"
  startIcon={<UploadFileIcon />}
  onClick={handleAnalyzePDF}
  disabled={!selectedFile || uploading}
  sx={{
    mt: 2,
    width: {
      xs: "100%",
      sm: "auto",
    },
  }}
>
  {uploading
    ? "Se analizează..."
    : "Analizează factura"}
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
          </CardContent>
        </Card>
        <Card
          sx={{
            mb: 4,
            borderRadius: 3,
          }}
        >
          <CardContent>
            <Typography
              variant="h6"
              gutterBottom
            >
              Date factură
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 2 }}
            >
              Poți verifica și modifica datele
              extrase de AI înainte de salvare.
            </Typography>

            <TextField
              fullWidth
              margin="normal"
              label="Furnizor"
              name="provider"
              value={form.provider}
              onChange={handleChange}
            />

            <TextField
              fullWidth
              margin="normal"
              label="Număr factură"
              name="invoiceNumber"
              value={form.invoiceNumber}
              onChange={handleChange}
            />

<Typography sx={{ mt: 2, mb: 0.5 }}>
  Data emiterii
</Typography>

<TextField
  fullWidth
  type="date"
  name="issueDate"
  value={form.issueDate}
  onChange={handleChange}
/>
          

            <TextField
              fullWidth
              margin="normal"
              label="Sumă"
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
            />

<Typography sx={{ mt: 2, mb: 0.5 }}>
  Data scadenței
</Typography>

<TextField
  fullWidth
  type="date"
  name="dueDate"
  value={form.dueDate}
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

            <Button
              fullWidth
              variant="contained"
              sx={{ mt: 3 }}
              onClick={handleSubmit}
            >
              Salvează factura
            </Button>
          </CardContent>
        </Card>
        <Typography
          variant="h5"
          sx={{ mb: 2 }}
        >
          Facturile mele
        </Typography>

        <Stack spacing={3}>
          {bills.length === 0 ? (
            <Typography color="text.secondary">
              Nu există facturi.
            </Typography>
          ) : (
            bills.map((bill) => (
              <Card
                key={bill._id}
                sx={{
                  borderRadius: 3,
                }}
              >
                <CardContent>
                <Box
  sx={{
    display: "flex",
    justifyContent: "space-between",

    alignItems: {
      xs: "flex-start",
      sm: "center",
    },

    flexDirection: {
      xs: "column",
      sm: "row",
    },

    gap: 1,
  }}
>
                    <Typography variant="h6">
                      🧾 {bill.provider}
                    </Typography>

                    <Chip
                      label={
                        bill.status === "paid"
                          ? "Plătită"
                          : "Neplătită"
                      }
                      color={
                        bill.status === "paid"
                          ? "success"
                          : "warning"
                      }
                    />
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {bill.invoiceNumber && (
  <Typography>
    <strong>Număr factură:</strong>{" "}
    {bill.invoiceNumber}
  </Typography>
)}

{bill.issueDate && (
  <Typography>
    <strong>Data emiterii:</strong>{" "}
    {bill.issueDate.substring(0, 10)}
  </Typography>
)}

<Typography>
  <strong>Sumă:</strong>{" "}
  {formatMoney(bill.amount)} lei
</Typography>

<Typography>
  <strong>Scadență:</strong>{" "}
  {bill.dueDate?.substring(0, 10)}
</Typography>
                  {bill.description && (
                    <Typography>
                      <strong>
                        Descriere:
                      </strong>{" "}
                      {bill.description}
                    </Typography>
                  )}

<Box
  sx={{
    mt: 3,
    display: {
      xs: "block",
      sm: "flex",
    },
  }}
>
                    <Button
                      variant="outlined"
                      color={
                        bill.status === "paid"
                          ? "warning"
                          : "success"
                      }
                      startIcon={
                        <CheckCircleIcon />
                      }
                      onClick={() =>
                        handleToggleStatus(
                          bill._id
                        )
                      }
                      sx={{
                        mr: {
                          xs: 0,
                          sm: 2,
                        },
                        mb: {
                          xs: 1,
                          sm: 0,
                        },
                        width: {
                          xs: "100%",
                          sm: "auto",
                        },
                      }}
                    >
                      {bill.status === "paid"
                        ? "Marchează neplătită"
                        : "Marchează plătită"}
                    </Button>

                  <Button
  variant="contained"
  color="error"
  startIcon={<DeleteIcon />}
  onClick={() =>
    handleDelete(bill._id)
  }
  sx={{
    width: {
      xs: "100%",
      sm: "auto",
    },
  }}
>
  Șterge
</Button>
                  </Box>
                </CardContent>
              </Card>
            ))
          )}
        </Stack>
      </Box>
    </>
  );
}

export default Bills;
