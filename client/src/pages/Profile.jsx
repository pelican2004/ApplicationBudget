import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Sidebar from "../components/layout/Sidebar";

import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");

    return savedUser
      ? JSON.parse(savedUser)
      : null;
  });
  const [isEditing, setIsEditing] =
    useState(false);

  const [profileMessage, setProfileMessage] =
    useState("");

  const [profileError, setProfileError] =
    useState("");

  const [profileLoading, setProfileLoading] =
    useState(false);

  const [form, setForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: user?.phone || "",

    birthDate: user?.birthDate
      ? user.birthDate.substring(0, 10)
      : "",

    gender: user?.gender || "",
  });

  const [deleteDialogOpen, setDeleteDialogOpen] =
    useState(false);

  const [codeDialogOpen, setCodeDialogOpen] =
    useState(false);

  const [deleteCode, setDeleteCode] =
    useState("");

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
    useState(false);
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };
  const handleEdit = () => {
    setProfileError("");
    setProfileMessage("");

    setForm({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      phone: user.phone || "",

      birthDate: user.birthDate
        ? user.birthDate.substring(0, 10)
        : "",

      gender: user.gender || "",
    });

    setIsEditing(true);
  };
  const handleCancelEdit = () => {
    setForm({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      phone: user.phone || "",

      birthDate: user.birthDate
        ? user.birthDate.substring(0, 10)
        : "",

      gender: user.gender || "",
    });

    setProfileError("");
    setProfileMessage("");
    setIsEditing(false);
  };
  const handleSaveProfile = async () => {
    if (
      !form.firstName.trim() ||
      !form.lastName.trim() ||
      !form.phone.trim() ||
      !form.birthDate ||
      !form.gender
    ) {
      setProfileError(
        "Completează toate câmpurile."
      );

      return;
    }

    try {
      setProfileLoading(true);
      setProfileError("");
      setProfileMessage("");

      const res = await api.put(
        "/auth/update-profile",
        {
          userId: user._id,
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone,
          birthDate: form.birthDate,
          gender: form.gender,
        }
      );

      const updatedUser = res.data.user;

      // Actualizăm localStorage
      localStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );

      // Actualizăm imediat pagina
      setUser(updatedUser);

      setForm({
        firstName:
          updatedUser.firstName || "",

        lastName:
          updatedUser.lastName || "",

        phone:
          updatedUser.phone || "",

        birthDate:
          updatedUser.birthDate
            ? updatedUser.birthDate.substring(
                0,
                10
              )
            : "",

        gender:
          updatedUser.gender || "",
      });

      setIsEditing(false);

      setProfileMessage(
        res.data.message ||
          "Profilul a fost actualizat cu succes."
      );
    } catch (err) {
      console.error(
        "Eroare actualizare profil:",
        err
      );

      setProfileError(
        err.response?.data?.message ||
          "Profilul nu a putut fi actualizat."
      );
    } finally {
      setProfileLoading(false);
    }
  };
  const handleRequestDelete = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const res = await api.post(
        "/auth/request-delete-account",
        {
          userId: user._id,
        }
      );

      setDeleteDialogOpen(false);
      setCodeDialogOpen(true);

      setMessage(res.data.message);
    } catch (err) {
      console.error(
        "Eroare solicitare ștergere:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Codul nu a putut fi trimis."
      );
    } finally {
      setLoading(false);
    }
  };
  const handleConfirmDelete = async () => {
    if (!/^\d{6}$/.test(deleteCode)) {
      setError(
        "Introdu codul de 6 cifre primit pe email."
      );

      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await api.post(
        "/auth/confirm-delete-account",
        {
          userId: user._id,
          code: deleteCode,
        }
      );

      localStorage.removeItem("user");

      alert(res.data.message);

      navigate("/");
    } catch (err) {
      console.error(
        "Eroare ștergere cont:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Contul nu a putut fi șters."
      );
    } finally {
      setLoading(false);
    }
  };
  const formatBirthDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(
      date
    ).toLocaleDateString("ro-RO");
  };
  const formatGender = (gender) => {
    if (gender === "female") {
      return "Feminin";
    }

    if (gender === "male") {
      return "Masculin";
    }

    if (gender === "other") {
      return "Altul";
    }

    return "-";
  };

  if (!user) {
    return (
      <Typography sx={{ p: 4 }}>
        Nu există niciun utilizator
        autentificat.
      </Typography>
    );
  }

  return (
    <Box sx={{ display: "flex" }}>
  <Sidebar />

  <Box
    component="main"
    sx={{
      flexGrow: 1,

      ml: {
        xs: 0,
        md: "240px",
      },

      p: {
        xs: 2,
        md: 4,
      },

      background: "#f4f6f8",
      minHeight: "100vh",
      minWidth: 0,
    }}
  >
        <Typography
          variant="h4"
          sx={{
            mb: 3,
            fontWeight: "bold",
          
            fontSize: {
              xs: "1.7rem",
              md: "2.125rem",
            },
          }}
        >
          👤 Profil
        </Typography>

        {/* =====================================
            DATE PERSONALE
        ====================================== */}

        <Paper
          elevation={3}
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
          <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
          
            alignItems: {
              xs: "stretch",
              sm: "center",
            },
          
            flexDirection: {
              xs: "column",
              sm: "row",
            },
          
            gap: 2,
            mb: 2,
          }}
          >
            <Typography variant="h6">
              Informații personale
            </Typography>

            {!isEditing && (
            <Button
            variant="contained"
            onClick={handleEdit}
            sx={{
              width: {
                xs: "100%",
                sm: "auto",
              },
            }}
          >
            Editează profilul
          </Button>
            )}
          </Box>

          {profileMessage && (
            <Alert
              severity="success"
              sx={{ mb: 2 }}
            >
              {profileMessage}
            </Alert>
          )}

          {profileError && (
            <Alert
              severity="error"
              sx={{ mb: 2 }}
            >
              {profileError}
            </Alert>
          )}

          {/* PRENUME */}

          <TextField
            fullWidth
            label="Prenume"
            name="firstName"
            margin="normal"
            value={
              isEditing
                ? form.firstName
                : user.firstName || ""
            }
            onChange={handleChange}
            InputProps={{
              readOnly: !isEditing,
            }}
          />

          {/* NUME */}

          <TextField
            fullWidth
            label="Nume"
            name="lastName"
            margin="normal"
            value={
              isEditing
                ? form.lastName
                : user.lastName || ""
            }
            onChange={handleChange}
            InputProps={{
              readOnly: !isEditing,
            }}
          />

          {/* EMAIL - NU SE EDITEAZĂ */}

          <TextField
            fullWidth
            label="Email"
            value={user.email || ""}
            margin="normal"
            InputProps={{
              readOnly: true,
            }}
            helperText={
              isEditing
                ? "Adresa de email nu poate fi modificată de aici."
                : ""
            }
          />

          {/* TELEFON */}

          <TextField
            fullWidth
            label="Telefon"
            name="phone"
            margin="normal"
            value={
              isEditing
                ? form.phone
                : user.phone || ""
            }
            onChange={handleChange}
            InputProps={{
              readOnly: !isEditing,
            }}
          />

          {/* DATA NAȘTERII */}

          {isEditing ? (
            <TextField
              fullWidth
              label="Data nașterii"
              name="birthDate"
              type="date"
              margin="normal"
              value={form.birthDate}
              onChange={handleChange}
              InputLabelProps={{
                shrink: true,
              }}
            />
          ) : (
            <TextField
              fullWidth
              label="Data nașterii"
              margin="normal"
              value={formatBirthDate(
                user.birthDate
              )}
              InputProps={{
                readOnly: true,
              }}
            />
          )}

          {/* SEX */}

          {isEditing ? (
            <FormControl
              fullWidth
              margin="normal"
            >
              <InputLabel id="gender-label">
                Sex
              </InputLabel>

              <Select
                labelId="gender-label"
                name="gender"
                value={form.gender}
                label="Sex"
                onChange={handleChange}
              >
                <MenuItem value="female">
                  Feminin
                </MenuItem>

                <MenuItem value="male">
                  Masculin
                </MenuItem>

                <MenuItem value="other">
                  Altul
                </MenuItem>
              </Select>
            </FormControl>
          ) : (
            <TextField
              fullWidth
              label="Sex"
              margin="normal"
              value={formatGender(
                user.gender
              )}
              InputProps={{
                readOnly: true,
              }}
            />
          )}

          {/* BUTOANE SALVARE / ANULARE */}

          {isEditing && (
           <Box
           sx={{
             display: "flex",
             flexDirection: {
               xs: "column",
               sm: "row",
             },
             gap: 2,
             mt: 3,
           }}
         
          
            >
              <Button
  variant="contained"
  disabled={profileLoading}
  onClick={handleSaveProfile}
  sx={{
    width: {
      xs: "100%",
      sm: "auto",
    },
  }}
>
  {profileLoading
    ? "Se salvează..."
    : "Salvează"}
</Button>

<Button
  variant="outlined"
  disabled={profileLoading}
  onClick={handleCancelEdit}
  sx={{
    width: {
      xs: "100%",
      sm: "auto",
    },
  }}
>
  Anulează
</Button>
            </Box>
          )}
        </Paper>

        {/* =====================================
            SECURITATE
        ====================================== */}

        <Paper
          elevation={3}
          sx={{
            p: {
              xs: 2,
              md: 4,
            },
          
            width: "100%",
            maxWidth: 700,
            boxSizing: "border-box",
            mt: 4,
            borderRadius: 3,
          }}
        >
          <Typography variant="h6">
            Securitate
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Typography
            variant="h6"
            color="error"
          >
            Șterge contul
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              mt: 1,
              mb: 2,
            }}
          >
            Ștergerea contului este
            permanentă. Veniturile,
            cheltuielile, economiile,
            tranzacțiile economiilor și
            facturile tale vor fi șterse.
          </Typography>

          <Button
  variant="outlined"
  color="error"
  onClick={() => {
    setError("");
    setMessage("");
    setDeleteDialogOpen(true);
  }}
  sx={{
    width: {
      xs: "100%",
      sm: "auto",
    },
  }}
>
  Șterge contul
</Button>
        </Paper>

        {/* =====================================
            CONFIRMARE ȘTERGERE
        ====================================== */}

        <Dialog
          open={deleteDialogOpen}
          onClose={() =>
            setDeleteDialogOpen(false)
          }
        >
          <DialogTitle>
            Ștergi contul?
          </DialogTitle>

          <DialogContent>
            <Typography>
              Această acțiune va șterge
              definitiv contul și toate
              datele asociate.
            </Typography>

            <Typography
              sx={{
                mt: 2,
                fontWeight: "bold",
              }}
            >
              Pentru siguranță, îți vom
              trimite un cod de confirmare
              pe:
            </Typography>

            <Typography sx={{ mt: 1 }}>
              {user.email}
            </Typography>

            {error && (
              <Alert
                severity="error"
                sx={{ mt: 2 }}
              >
                {error}
              </Alert>
            )}
          </DialogContent>

          <DialogActions>
            <Button
              onClick={() =>
                setDeleteDialogOpen(false)
              }
            >
              Anulează
            </Button>

            <Button
              color="error"
              variant="contained"
              disabled={loading}
              onClick={handleRequestDelete}
            >
              {loading
                ? "Se trimite..."
                : "Trimite codul"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* =====================================
            COD ȘTERGERE
        ====================================== */}

        <Dialog
          open={codeDialogOpen}
          onClose={() =>
            setCodeDialogOpen(false)
          }
        >
          <DialogTitle>
            Confirmă ștergerea
          </DialogTitle>

          <DialogContent>
            <Typography sx={{ mb: 2 }}>
              Introdu codul de 6 cifre
              primit pe adresa ta de email.
            </Typography>

            {message && (
              <Alert
                severity="success"
                sx={{ mb: 2 }}
              >
                {message}
              </Alert>
            )}

            {error && (
              <Alert
                severity="error"
                sx={{ mb: 2 }}
              >
                {error}
              </Alert>
            )}

            <TextField
              autoFocus
              fullWidth
              label="Cod de confirmare"
              value={deleteCode}
              onChange={(e) => {
                const value =
                  e.target.value.replace(
                    /\D/g,
                    ""
                  );

                setDeleteCode(
                  value.slice(0, 6)
                );
              }}
              inputProps={{
                maxLength: 6,
                inputMode: "numeric",
              }}
            />

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 2 }}
            >
              Codul este valabil timp de
              10 minute.
            </Typography>
          </DialogContent>

          <DialogActions>
            <Button
              onClick={() => {
                setCodeDialogOpen(false);
                setDeleteCode("");
                setError("");
              }}
            >
              Anulează
            </Button>

            <Button
              color="error"
              variant="contained"
              disabled={
                loading ||
                deleteCode.length !== 6
              }
              onClick={
                handleConfirmDelete
              }
            >
              {loading
                ? "Se șterge..."
                : "Șterge definitiv contul"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}

export default Profile;
