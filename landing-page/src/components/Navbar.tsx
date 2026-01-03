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
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import logoImage from "../assets/images/logo.png";

const navLinks = [
  { title: "الرئيسية", path: "/" },
  { title: "المميزات", path: "/#features" },
  { title: "عن التطبيق", path: "/#about" },
  { title: "الأحكام والشروط", path: "/terms" },
];

const Navbar: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

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

  return (
    <>
      <AppBar
        position="fixed"
        elevation={trigger ? 2 : 0}
        sx={{
          background: trigger
            ? "rgba(255, 255, 255, 0.95)"
            : "transparent",
          backdropFilter: trigger ? "blur(20px)" : "none",
          transition: "all 0.3s ease",
          borderBottom: trigger ? "1px solid rgba(26, 139, 194, 0.1)" : "none",
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
                    color: trigger ? "text.primary" : "white",
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
                      bgcolor: trigger
                        ? "rgba(26, 139, 194, 0.08)"
                        : "rgba(255, 255, 255, 0.1)",
                      "&::after": {
                        transform: "translateX(-50%) scaleX(1)",
                      },
                    },
                  }}
                >
                  {link.title}
                </Button>
              ))}
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
                color: trigger ? "primary.main" : "white",
                bgcolor: trigger ? "rgba(26, 139, 194, 0.08)" : "rgba(255, 255, 255, 0.1)",
                "&:hover": {
                  bgcolor: trigger ? "rgba(26, 139, 194, 0.15)" : "rgba(255, 255, 255, 0.2)",
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
            background: "linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)",
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
            <IconButton
              onClick={handleDrawerToggle}
              sx={{ color: "white" }}
            >
              <CloseIcon />
            </IconButton>
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
                    color: "white",
                    "&:hover": {
                      bgcolor: "rgba(26, 139, 194, 0.2)",
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
