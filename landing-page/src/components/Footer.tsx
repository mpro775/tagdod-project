import React from "react";
import {
  Box,
  Container,
  Typography,
  Link,
  Grid,
  IconButton,
  Stack,
  Divider,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";
import YouTubeIcon from "@mui/icons-material/YouTube";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import logoImage from "../assets/images/logo.png";

const footerLinks = {
  company: [
    { title: "من نحن", path: "/about" },
    { title: "تواصل معنا", path: "/contact" },
    { title: "الأسئلة الشائعة", path: "/faq" },
  ],
  legal: [
    { title: "الأحكام والشروط", path: "/terms" },
    { title: "سياسة الخصوصية", path: "/privacy" },
    { title: "كيفية حذف الحساب", path: "/deleted-account" },
  ],
  support: [
    { title: "مركز المساعدة", path: "/help" },
    { title: "الشحن والتوصيل", path: "/shipping" },
    { title: "سياسة الإرجاع", path: "/returns" },
  ],
};

const socialLinks = [
  {
    icon: <FacebookIcon />,
    url: "https://www.facebook.com/tagadod.yemen",
    label: "Facebook",
  },
  { icon: <TwitterIcon />, url: "https://x.com/TagadodE", label: "Twitter" },
  {
    icon: <InstagramIcon />,
    url: "https://www.instagram.com/tagadodelectric",
    label: "Instagram",
  },
  {
    icon: <YouTubeIcon />,
    url: "https://www.youtube.com/watch?v=qmtrNS4joeU&t=360s",
    label: "YouTube",
  },
];

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: "#1a1a2e",
        color: "white",
        pt: 8,
        pb: 4,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Brand Section */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Box
              component="img"
              src={logoImage}
              alt="تجدد"
              sx={{
                height: 50,
                mb: 2,
              }}
            />
            <Typography
              variant="body2"
              sx={{
                color: "rgba(255, 255, 255, 0.7)",
                lineHeight: 1.8,
                mb: 3,
                maxWidth: 300,
              }}
            >
              منصتك الأولى للطاقة الشمسية والكهربائيات. نوفر لك أفضل المنتجات
              والخدمات لتجربة طاقة مستدامة ونظيفة.
            </Typography>

            {/* Contact Info */}
            <Stack spacing={1.5}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <EmailIcon sx={{ color: "#90EE90", fontSize: 20 }} />
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(255,255,255,0.7)" }}
                >
                  support@tagadod.app
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <PhoneIcon sx={{ color: "#90EE90", fontSize: 20 }} />
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(255,255,255,0.7)" }}
                >
                  771250000
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <LocationOnIcon sx={{ color: "#90EE90", fontSize: 20 }} />
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(255,255,255,0.7)" }}
                >
                  صنعاء، اليمن
                </Typography>
              </Box>
            </Stack>
          </Grid>

          {/* Links Sections */}
          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                mb: 3,
                color: "white",
                fontSize: "1rem",
              }}
            >
              الشركة
            </Typography>
            <Stack spacing={1.5}>
              {footerLinks.company.map((link) => (
                <Link
                  key={link.path}
                  component={RouterLink}
                  to={link.path}
                  sx={{
                    color: "rgba(255, 255, 255, 0.7)",
                    textDecoration: "none",
                    transition: "all 0.3s ease",
                    fontSize: "0.9rem",
                    "&:hover": {
                      color: "#90EE90",
                      pr: 0.5,
                    },
                  }}
                >
                  {link.title}
                </Link>
              ))}
            </Stack>
          </Grid>

          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                mb: 3,
                color: "white",
                fontSize: "1rem",
              }}
            >
              القانونية
            </Typography>
            <Stack spacing={1.5}>
              {footerLinks.legal.map((link) => (
                <Link
                  key={link.path}
                  component={RouterLink}
                  to={link.path}
                  sx={{
                    color: "rgba(255, 255, 255, 0.7)",
                    textDecoration: "none",
                    transition: "all 0.3s ease",
                    fontSize: "0.9rem",
                    "&:hover": {
                      color: "#90EE90",
                      pr: 0.5,
                    },
                  }}
                >
                  {link.title}
                </Link>
              ))}
            </Stack>
          </Grid>

          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                mb: 3,
                color: "white",
                fontSize: "1rem",
              }}
            >
              الدعم
            </Typography>
            <Stack spacing={1.5}>
              {footerLinks.support.map((link) => (
                <Link
                  key={link.path}
                  component={RouterLink}
                  to={link.path}
                  sx={{
                    color: "rgba(255, 255, 255, 0.7)",
                    textDecoration: "none",
                    transition: "all 0.3s ease",
                    fontSize: "0.9rem",
                    "&:hover": {
                      color: "#90EE90",
                      pr: 0.5,
                    },
                  }}
                >
                  {link.title}
                </Link>
              ))}
            </Stack>
          </Grid>

          {/* Social Links */}
          <Grid size={{ xs: 12, sm: 12, md: 2 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                mb: 3,
                color: "white",
                fontSize: "1rem",
              }}
            >
              تابعنا
            </Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {socialLinks.map((social) => (
                <IconButton
                  key={social.label}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  sx={{
                    color: "rgba(255, 255, 255, 0.7)",
                    bgcolor: "rgba(255, 255, 255, 0.1)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      bgcolor: "#1A8BC2",
                      color: "white",
                      transform: "translateY(-3px)",
                    },
                  }}
                >
                  {social.icon}
                </IconButton>
              ))}
            </Box>
          </Grid>
        </Grid>

        {/* Divider */}
        <Divider
          sx={{
            my: 4,
            borderColor: "rgba(255, 255, 255, 0.1)",
          }}
        />

        {/* Copyright */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: "rgba(255, 255, 255, 0.5)",
              textAlign: { xs: "center", sm: "right" },
            }}
          >
            © {new Date().getFullYear()} تجدد. جميع الحقوق محفوظة.
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "rgba(255, 255, 255, 0.5)" }}
          >
            صُنع بـ ❤️ في صنعاء، اليمن
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
