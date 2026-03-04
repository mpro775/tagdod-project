import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Button,
  Box,
  Container,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  useScrollTrigger,
  useTheme,
} from "@mui/material";
import { Link as RouterLink, useLocation } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import logoImage from "../assets/images/logo.png";
import { useThemeContext } from "../theme/ThemeContext";

const navLinks = [
  { title: "الرئيسية", path: "/" },
  { title: "المميزات", path: "/#features" },
  { title: "عن التطبيق", path: "/#about" },
  { title: "الأحكام والشروط", path: "/terms" },
];

const Navbar: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { mode, toggleColorMode } = useThemeContext();
  const theme = useTheme();
  const location = useLocation();
  const isDark = theme.palette.mode === "dark";
  const isHomePage = location.pathname === "/";

  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 50,
  });

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavClick = (path: string) => {
    setMobileOpen(false);
    if (path.includes("#")) {
      const elementId = path.split("#")[1];
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const isSolidNavbar = trigger || !isHomePage;
  const appBarBackground = isSolidNavbar
    ? isDark
      ? "rgba(15, 23, 35, 0.9)"
      : "rgba(255, 255, 255, 0.94)"
    : "transparent";
  const navTextColor = isDark
    ? isSolidNavbar
      ? "text.primary"
      : "white"
    : "text.primary";

  return (
    <>
      <AppBar
        position="fixed"
        elevation={trigger ? 2 : 0}
        sx={{
          background: appBarBackground,
          backdropFilter: isSolidNavbar ? "blur(20px)" : "none",
          transition: "all 0.3s ease",
          borderBottom: isSolidNavbar
            ? isDark
              ? "1px solid rgba(255, 255, 255, 0.08)"
              : "1px solid rgba(26, 139, 194, 0.12)"
            : "none",
        }}
      >
        <Container maxWidth="lg">
          <Toolbar
            disableGutters
            sx={{
              py: 1,
              minHeight: { xs: 64, md: 72 },
            }}
          >
            {/* Logo */}
            <Box
              component={RouterLink}
              to="/"
              sx={{
                display: "flex",
                alignItems: "center",
                textDecoration: "none",
                flexGrow: 1,
              }}
            >
              <Box
                component="img"
                src={logoImage}
                alt="تجدد"
                sx={{
                  height: { xs: 40, md: 48 },
                  width: "auto",
                  transition: "transform 0.3s ease",
                  "&:hover": {
                    transform: "scale(1.05)",
                  },
                }}
              />
            </Box>

            {/* Desktop Navigation */}
            <Box
              sx={{
                display: { xs: "none", md: "flex" },
                alignItems: "center",
                gap: 1,
              }}
            >
              {navLinks.map((link) => (
                <Button
                  key={link.path}
                  component={link.path.includes("#") ? "button" : RouterLink}
                  to={link.path.includes("#") ? undefined : link.path}
                  onClick={() => handleNavClick(link.path)}
                  sx={{
                    color: navTextColor,
                    fontWeight: 500,
                    fontSize: "0.95rem",
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    position: "relative",
                    overflow: "hidden",
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      bottom: 6,
                      left: "50%",
                      transform: "translateX(-50%) scaleX(0)",
                      width: "60%",
                      height: 2,
                      bgcolor: "primary.main",
                      borderRadius: 1,
                      transition: "transform 0.3s ease",
                    },
                    "&:hover": {
                      bgcolor: isSolidNavbar
                        ? isDark
                          ? "rgba(255, 255, 255, 0.08)"
                          : "rgba(26, 139, 194, 0.08)"
                        : isDark
                          ? "rgba(255, 255, 255, 0.12)"
                          : "rgba(26, 139, 194, 0.08)",
                      "&::after": {
                        transform: "translateX(-50%) scaleX(1)",
                      },
                    },
                  }}
                >
                  {link.title}
                </Button>
              ))}
              <IconButton 
                onClick={toggleColorMode} 
                sx={{ 
                  color: navTextColor,
                  mr: 1 
                }}
              >
                {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
              <Button
                variant="contained"
                href="#download"
                onClick={() => handleNavClick("/#download")}
                sx={{
                  mr: 2,
                  px: 3,
                  py: 1.2,
                  borderRadius: 50,
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  background: "linear-gradient(135deg, #1A8BC2 0%, #4DB8E6 100%)",
                  boxShadow: "0 4px 20px rgba(26, 139, 194, 0.35)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    background: "linear-gradient(135deg, #1470A3 0%, #1A8BC2 100%)",
                    boxShadow: "0 6px 25px rgba(26, 139, 194, 0.45)",
                    transform: "translateY(-2px)",
                  },
                }}
              >
                حمّل التطبيق
              </Button>
            </Box>

            {/* Mobile Menu Button */}
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="end"
              onClick={handleDrawerToggle}
              sx={{
                display: { md: "none" },
                color: isSolidNavbar ? "primary.main" : "white",
                bgcolor: isSolidNavbar
                  ? isDark
                    ? "rgba(255, 255, 255, 0.08)"
                    : "rgba(26, 139, 194, 0.08)"
                  : isDark
                    ? "rgba(255, 255, 255, 0.12)"
                    : "rgba(26, 139, 194, 0.08)",
                "&:hover": {
                  bgcolor: isSolidNavbar
                    ? isDark
                      ? "rgba(255, 255, 255, 0.16)"
                      : "rgba(26, 139, 194, 0.15)"
                    : isDark
                      ? "rgba(255, 255, 255, 0.2)"
                      : "rgba(26, 139, 194, 0.15)",
                },
              }}
            >
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        sx={{
          display: { md: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: 280,
            background: isDark
              ? "linear-gradient(180deg, #121822 0%, #0f1723 100%)"
              : "linear-gradient(180deg, #f7fbff 0%, #edf5fc 100%)",
            color: isDark ? "#ffffff" : theme.palette.text.primary,
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          {/* Drawer Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Box
              component="img"
              src={logoImage}
              alt="تجدد"
              sx={{ height: 40 }}
            />
            <Box>
              <IconButton onClick={toggleColorMode} sx={{ color: "inherit", mr: 1 }}>
                {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
              <IconButton
                onClick={handleDrawerToggle}
                sx={{ color: "inherit" }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Drawer Links */}
          <List>
            {navLinks.map((link) => (
              <ListItem key={link.path} disablePadding>
                <ListItemButton
                  component={link.path.includes("#") ? "button" : RouterLink}
                  to={link.path.includes("#") ? undefined : link.path}
                  onClick={() => handleNavClick(link.path)}
                  sx={{
                    borderRadius: 2,
                    mb: 1,
                    color: "inherit",
                    "&:hover": {
                      bgcolor: isDark ? "rgba(26, 139, 194, 0.2)" : "rgba(26, 139, 194, 0.08)",
                    },
                  }}
                >
                  <ListItemText
                    primary={link.title}
                    primaryTypographyProps={{
                      fontWeight: 500,
                      fontSize: "1.1rem",
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>

          {/* Download Button */}
          <Button
            variant="contained"
            fullWidth
            href="#download"
            onClick={() => handleNavClick("/#download")}
            sx={{
              mt: 2,
              py: 1.5,
              borderRadius: 50,
              fontWeight: 600,
              background: "linear-gradient(135deg, #1A8BC2 0%, #90EE90 100%)",
              boxShadow: "0 4px 20px rgba(26, 139, 194, 0.35)",
            }}
          >
            حمّل التطبيق الآن
          </Button>
        </Box>
      </Drawer>

      {/* Toolbar spacer */}
      <Toolbar sx={{ minHeight: { xs: 64, md: 72 } }} />
    </>
  );
};

export default Navbar;
