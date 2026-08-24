import {
    Card,
    CardContent,
    CardActions,
    Typography,
    LinearProgress,
    Button,
    Stack,
    Chip,
  } from "@mui/material";
  
  import DeleteIcon from "@mui/icons-material/Delete";
  import AddIcon from "@mui/icons-material/Add";
  
  function SavingCard({
    saving,
    savedAmount,
    onAddMoney,
    onDelete,
    children,
  }) {
    const progress =
      saving.targetAmount > 0
        ? Math.min((savedAmount / saving.targetAmount) * 100, 100)
        : 0;
  
    return (
      <Card sx={{ mb: 4, borderRadius: 3 }}>
        <CardContent>
  
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h5">
              {saving.title}
            </Typography>
  
            <Chip
              color={progress === 100 ? "success" : "primary"}
              label={`${progress.toFixed(0)}%`}
            />
          </Stack>
  
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            {saving.description}
          </Typography>
  
          <Typography sx={{ mt: 3 }}>
            🎯 Obiectiv: <strong>{saving.targetAmount} lei</strong>
          </Typography>
  
          <Typography>
            💰 Economisit: <strong>{savedAmount} lei</strong>
          </Typography>
  
          <Typography>
            📉 Mai ai:{" "}
            <strong>
              {Math.max(saving.targetAmount - savedAmount, 0)} lei
            </strong>
          </Typography>
  
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              mt: 3,
              height: 12,
              borderRadius: 5,
            }}
          />
  
        </CardContent>
  
        <CardActions sx={{ px: 2, pb: 2 }}>
  
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => onAddMoney(saving)}
          >
            Adaugă bani
          </Button>
  
          <Button
            color="error"
            variant="outlined"
            startIcon={<DeleteIcon />}
            onClick={() => onDelete(saving._id)}
          >
            Șterge
          </Button>
  
        </CardActions>
  
        {children}
  
      </Card>
    );
  }
  
  export default SavingCard;