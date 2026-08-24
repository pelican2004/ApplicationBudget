import Sidebar from "./Sidebar";
import { Box } from "@mui/material";

function MainLayout({ children }) {
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
          boxSizing: "border-box",
        }}
      >
        {children}
      </Box>
    </>
  );
}

export default MainLayout;