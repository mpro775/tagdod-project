import React from "react";
import { Box, Container, Typography, Button, Grid, Stack } from "@mui/material";
import { motion } from "framer-motion";
import AppleIcon from "@mui/icons-material/Apple";
import ShopIcon from "@mui/icons-material/Shop";
import iconImage from "../assets/images/icon.png";

const Hero: React.FC = () => {
  return (
    <Box
      id="hero"
      sx={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        background:
          "linear-gradient(135deg, #1A8BC2 0%, #0d5a80 50%, #1a1a2e 100%)",
        overflow: "hidden",
        pt: { xs: 4, md: 0 },
        pb: { xs: 8, md: 0 },
      }}
    >
      {/* Background Decorations */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: "hidden",
          zIndex: 0,
        }}
      >
        {/* Gradient Orbs */}
        <Box
          component={motion.div}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          sx={{
            position: "absolute",
            top: "-20%",
            right: "-10%",
            width: "50vw",
            height: "50vw",
            maxWidth: 600,
            maxHeight: 600,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(144, 238, 144, 0.3) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        <Box
          component={motion.div}
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          sx={{
            position: "absolute",
            bottom: "-30%",
            left: "-20%",
            width: "60vw",
            height: "60vw",
            maxWidth: 700,
            maxHeight: 700,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(26, 139, 194, 0.4) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />

        {/* Floating Shapes */}
        {[...Array(6)].map((_, i) => (
          <Box
            key={i}
            component={motion.div}
            animate={{
              y: [0, -20, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 10 + i * 2,
              repeat: Infinity,
              ease: "linear",
            }}
            sx={{
              position: "absolute",
              top: `${15 + i * 15}%`,
              left: `${10 + i * 15}%`,
              width: 20 + i * 10,
              height: 20 + i * 10,
              borderRadius: i % 2 === 0 ? "50%" : "4px",
              border: "2px solid rgba(255, 255, 255, 0.1)",
              opacity: 0.3,
            }}
          />
        ))}
      </Box>

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        <Grid container spacing={6} alignItems="center">
          {/* Text Content */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box
              component={motion.div}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Badge */}
              <Box
                component={motion.div}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 1,
                  bgcolor: "rgba(144, 238, 144, 0.2)",
                  color: "#90EE90",
                  px: 2,
                  py: 0.75,
                  borderRadius: 50,
                  mb: 3,
                  border: "1px solid rgba(144, 238, 144, 0.3)",
                }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: "#90EE90",
                    animation: "pulse 2s ease-in-out infinite",
                  }}
                />
                <Typography variant="body2" fontWeight={500}>
                  متوفر الآن على Android و iOS
                </Typography>
              </Box>

              {/* Main Heading */}
              <Typography
                variant="h1"
                component="h1"
                sx={{
                  color: "white",
                  fontWeight: 800,
                  fontSize: {
                    xs: "2.5rem",
                    sm: "3rem",
                    md: "3.5rem",
                    lg: "4rem",
                  },
                  lineHeight: 1.2,
                  mb: 3,
                }}
              >
                مستقبل الطاقة
                <br />
                <Box
                  component="span"
                  sx={{
                    background:
                      "linear-gradient(135deg, #90EE90 0%, #B8F5B8 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  يبدأ من هنا
                </Box>
              </Typography>

              {/* Description */}
              <Typography
                variant="h6"
                sx={{
                  color: "rgba(255, 255, 255, 0.85)",
                  fontWeight: 400,
                  lineHeight: 1.8,
                  mb: 4,
                  maxWidth: 500,
                  fontSize: { xs: "1rem", md: "1.15rem" },
                }}
              >
                اكتشف أحدث حلول الطاقة الشمسية والكهربائيات مع تطبيق تجدد. تسوق من أفضل
                المنتجات، قارن الأسعار، واحصل على توصيل سريع لباب منزلك.
              </Typography>

              {/* Download Buttons */}
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={3}
                component={motion.div}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                sx={{ gap: { xs: 2, sm: 3 } }}
              >
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<AppleIcon />}
                  href="https://apps.apple.com/ng/app/%D8%AA%D8%AC%D8%AF%D8%AF/id6756541667"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    py: 1.75,
                    px: 4,
                    borderRadius: "16px",
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    bgcolor: "white",
                    color: "#1A8BC2",
                    boxShadow: "0 8px 30px rgba(0, 0, 0, 0.2)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      bgcolor: "white",
                      transform: "translateY(-4px)",
                      boxShadow: "0 12px 40px rgba(0, 0, 0, 0.3)",
                    },
                  }}
                >
                  App Store
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<ShopIcon />}
                  href="https://play.google.com/store/apps/details?id=com.tagadod.app"
                  target="_blank"
                  sx={{
                    py: 1.75,
                    px: 4,
                    borderRadius: "16px",
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    borderWidth: 2,
                    borderColor: "rgba(255, 255, 255, 0.5)",
                    color: "white",
                    backdropFilter: "blur(10px)",
                    bgcolor: "rgba(255, 255, 255, 0.1)",
                    transition: "all 0.3s ease",
                    ml: { xs: 0, sm: 3 },
                    mt: { xs: 2, sm: 0 },
                    "&:hover": {
                      borderWidth: 2,
                      borderColor: "white",
                      bgcolor: "rgba(255, 255, 255, 0.2)",
                      transform: "translateY(-4px)",
                    },
                  }}
                >
                  Google Play
                </Button>
              </Stack>

              {/* Stats */}
              <Stack
                direction="row"
                spacing={4}
                sx={{ mt: 5, gap: { xs: 3, sm: 4, md: 5 } }}
                component={motion.div}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                {[
                  { value: "10K+", label: "مستخدم نشط" },
                  { value: "500+", label: "منتج متاح" },
                  { value: "4.8", label: "تقييم التطبيق" },
                ].map((stat, index) => (
                  <Box
                    key={index}
                    sx={{
                      ml: index > 0 ? { xs: 3, sm: 4, md: 5 } : 0,
                    }}
                  >
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 700,
                        color: "#90EE90",
                        fontSize: { xs: "1.5rem", md: "2rem" },
                      }}
                    >
                      {stat.value}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "rgba(255, 255, 255, 0.7)",
                        fontSize: "0.9rem",
                      }}
                    >
                      {stat.label}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          </Grid>

          {/* App Mockup */}
          <Grid
            size={{ xs: 12, md: 6 }}
            sx={{ display: "flex", justifyContent: "center" }}
          >
            <Box
              component={motion.div}
              initial={{ opacity: 0, x: 40, rotateY: -15 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              sx={{
                position: "relative",
                perspective: "1000px",
              }}
            >
              {/* Phone Frame */}
              <Box
                component={motion.div}
                animate={{ y: [0, -15, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                sx={{
                  position: "relative",
                  width: { xs: 280, sm: 320, md: 360 },
                  height: { xs: 560, sm: 640, md: 720 },
                  background:
                    "linear-gradient(180deg, #2d2d44 0%, #1a1a2e 100%)",
                  borderRadius: "40px",
                  padding: "12px",
                  boxShadow:
                    "0 40px 80px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)",
                  transform: "rotateY(-5deg) rotateX(5deg)",
                }}
              >
                {/* Screen */}
                <Box
                  sx={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "32px",
                    overflow: "hidden",
                    background:
                      "linear-gradient(180deg, #1A8BC2 0%, #0d5a80 100%)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                  }}
                >
                  {/* App Content Preview */}
                  <Box
                    component="img"
                    src={iconImage}
                    alt="تجدد"
                    sx={{
                      width: 120,
                      height: 120,
                      mb: 3,
                      filter: "drop-shadow(0 8px 20px rgba(0, 0, 0, 0.3))",
                    }}
                  />
                  <Typography
                    variant="h4"
                    sx={{
                      color: "white",
                      fontWeight: 700,
                      mb: 1,
                    }}
                  >
                    تجدد
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: "rgba(255, 255, 255, 0.8)",
                      textAlign: "center",
                      px: 4,
                    }}
                  >
                    منصتك الأولى للطاقة الشمسية والكهربائيات
                  </Typography>

                  {/* Decorative Elements */}
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 40,
                      left: "50%",
                      transform: "translateX(-50%)",
                      display: "flex",
                      gap: 1,
                    }}
                  >
                    {[0, 1, 2, 3, 4].map((i) => (
                      <Box
                        key={i}
                        sx={{
                          width: i === 2 ? 24 : 8,
                          height: 8,
                          borderRadius: 4,
                          bgcolor:
                            i === 2 ? "#90EE90" : "rgba(255, 255, 255, 0.3)",
                        }}
                      />
                    ))}
                  </Box>
                </Box>

                {/* Notch */}
                <Box
                  sx={{
                    position: "absolute",
                    top: 20,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 100,
                    height: 28,
                    bgcolor: "#1a1a2e",
                    borderRadius: 20,
                  }}
                />
              </Box>

              {/* Floating Elements around phone */}
              <Box
                component={motion.div}
                animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                sx={{
                  position: "absolute",
                  top: "10%",
                  right: "-15%",
                  width: 60,
                  height: 60,
                  borderRadius: "16px",
                  background:
                    "linear-gradient(135deg, #90EE90 0%, #7DD87D 100%)",
                  boxShadow: "0 10px 30px rgba(144, 238, 144, 0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography variant="h5">☀️</Typography>
              </Box>

              <Box
                component={motion.div}
                animate={{ y: [0, 10, 0], rotate: [0, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                sx={{
                  position: "absolute",
                  bottom: "20%",
                  left: "-10%",
                  width: 50,
                  height: 50,
                  borderRadius: "12px",
                  background: "rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography variant="h6">🔋</Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Hero;
