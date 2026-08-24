import {
    Box,
    Typography,
    Divider,
    List,
    ListItem,
    ListItemText,
  } from "@mui/material";
  
  function SavingHistory({ transactions }) {
    if (!transactions || transactions.length === 0) {
      return (
        <Box sx={{ p: 2 }}>
          <Typography color="text.secondary">
            Nu există încă depuneri.
          </Typography>
        </Box>
      );
    }
  
    return (
      <Box sx={{ px: 2, pb: 2 }}>
  
        <Typography
          variant="h6"
          sx={{ mb: 2 }}
        >
          Istoric depuneri
        </Typography>
  
        <List>
  
          {transactions.map((transaction) => (
            <div key={transaction._id}>
  
              <ListItem>
  
                <ListItemText
                  primary={`+ ${transaction.amount} lei`}
                  secondary={new Date(
                    transaction.date
                  ).toLocaleDateString("ro-RO")}
                />
  
              </ListItem>
  
              <Divider />
  
            </div>
          ))}
  
        </List>
  
      </Box>
    );
  }
  
  export default SavingHistory;