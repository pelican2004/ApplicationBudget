import { useState } from "react";

import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import MoneyOffIcon from "@mui/icons-material/MoneyOff";
import SavingsIcon from "@mui/icons-material/Savings";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import BarChartIcon from "@mui/icons-material/BarChart";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";

import {
  Link,
  useNavigate,
} from "react-router-dom";

const drawerWidth = 240;

function Sidebar() {
  const navigate = useNavigate();

  const theme = useTheme();

  const isMobile = useMediaQuery(
    theme.breakpoints.down("md")
  );

  const [mobileOpen, setMobileOpen] =
    useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  const handleCloseMobileMenu = () => {
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    setMobileOpen(false);

    navigate("/");
  };

  const menuContent = (
    <>
      <Toolbar />

      <List>
        <ListItemButton
          component={Link}
          to="/dashboard"
          onClick={handleCloseMobileMenu}
        >
          <ListItemIcon>
            <DashboardIcon />
          </ListItemIcon>

          <ListItemText
            primary="Dashboard"
          />
        </ListItemButton>

        <ListItemButton
          component={Link}
          to="/income"
          onClick={handleCloseMobileMenu}
        >
          <ListItemIcon>
            <AccountBalanceWalletIcon />
          </ListItemIcon>

          <ListItemText
            primary="Venituri"
          />
        </ListItemButton>

        <ListItemButton
          component={Link}
          to="/expenses"
          onClick={handleCloseMobileMenu}
        >
          <ListItemIcon>
            <MoneyOffIcon />
          </ListItemIcon>

          <ListItemText
            primary="Cheltuieli"
          />
        </ListItemButton>

        <ListItemButton
          component={Link}
          to="/savings"
          onClick={handleCloseMobileMenu}
        >
          <ListItemIcon>
            <SavingsIcon />
          </ListItemIcon>

          <ListItemText
            primary="Economii"
          />
        </ListItemButton>

        <ListItemButton
          component={Link}
          to="/bills"
          onClick={handleCloseMobileMenu}
        >
          <ListItemIcon>
            <ReceiptLongIcon />
          </ListItemIcon>

          <ListItemText
            primary="Facturi"
          />
        </ListItemButton>

        <ListItemButton
          component={Link}
          to="/reports"
          onClick={handleCloseMobileMenu}
        >
          <ListItemIcon>
            <BarChartIcon />
          </ListItemIcon>

          <ListItemText
            primary="Rapoarte"
          />
        </ListItemButton>

        <ListItemButton
          component={Link}
          to="/profile"
          onClick={handleCloseMobileMenu}
        >
          <ListItemIcon>
            <PersonIcon />
          </ListItemIcon>

          <ListItemText
            primary="Profil"
          />
        </ListItemButton>

        <ListItemButton
          onClick={handleLogout}
        >
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>

          <ListItemText
            primary="Logout"
          />
        </ListItemButton>
      </List>
    </>
  );

  return (
    <>
      {/* BARĂ SUS PE TELEFON */}
      {isMobile && (
        <AppBar
          position="fixed"
          sx={{
            display: {
              xs: "block",
              md: "none",
            },
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>

            <Typography
              variant="h6"
              noWrap
            >
              Application Budget
            </Typography>
          </Toolbar>
        </AppBar>
      )}

      {/* MENIU DESKTOP */}
      <Drawer
        variant="permanent"
        sx={{
          display: {
            xs: "none",
            md: "block",
          },

          width: drawerWidth,
          flexShrink: 0,

          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
        open
      >
        {menuContent}
      </Drawer>

      {/* MENIU TELEFON */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: {
            xs: "block",
            md: "none",
          },

          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
      >
        {menuContent}
      </Drawer>

      {/* SPAȚIU PENTRU APPBAR PE TELEFON */}
      {isMobile && (
        <Box
          sx={{
            height: {
              xs: 64,
              md: 0,
            },
          }}
        />
      )}
    </>
  );
}

export default Sidebar;