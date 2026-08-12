import React from "react";
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
} from "@mui/material";
import {
  Verified as VerifiedIcon,
  LocalShipping as ShippingIcon,
  SupportAgent as SupportIcon,
  Security as SecurityIcon,
  TrendingUp as GrowthIcon,
  People as TeamIcon,
} from "@mui/icons-material";

const About = () => {
  const features = [
    {
      icon: <VerifiedIcon sx={{ fontSize: 40 }} />,
      title: "Quality Assured",
      description:
        "We guarantee the highest quality products with rigorous quality checks.",
      color: "#4CAF50",
    },
    {
      icon: <ShippingIcon sx={{ fontSize: 40 }} />,
      title: "Fast Delivery",
      description:
        "Quick and reliable shipping to your doorstep across the country.",
      color: "#2196F3",
    },
    {
      icon: <SupportIcon sx={{ fontSize: 40 }} />,
      title: "24/7 Support",
      description:
        "Our dedicated team is always here to help you with any questions.",
      color: "#9C27B0",
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40 }} />,
      title: "Secure Shopping",
      description: "100% secure payment gateway with encrypted transactions.",
      color: "#FF9800",
    },
  ];

  const stats = [
    { value: "10K+", label: "Happy Customers" },
    { value: "5K+", label: "Products" },
    { value: "50+", label: "Categories" },
    { value: "99%", label: "Satisfaction Rate" },
  ];

  const team = [
    {
      name: "Nikhil Gahane",
      role: "CEO & Founder",
      image: "https://randomuser.me/api/portraits/men/1.jpg",
    },
    {
      name: "Jane Smith",
      role: "Chief Marketing Officer",
      image: "https://randomuser.me/api/portraits/women/2.jpg",
    },
    {
      name: "Mike Johnson",
      role: "Head of Operations",
      image: "https://randomuser.me/api/portraits/men/3.jpg",
    },
    {
      name: "Sarah Williams",
      role: "Customer Success Lead",
      image: "https://randomuser.me/api/portraits/women/4.jpg",
    },
  ];

  return (
    <Box sx={{ bgcolor: "#FAF9F6", minHeight: "100vh", py: 10 }}>
      <Container maxWidth="lg">
        {/* Hero Section */}
        <Box sx={{ textAlign: "center", mb: 10 }}>
          <Typography
            variant="h2"
            sx={{
              fontFamily: '"Playfair Display", Georgia, serif',
              fontWeight: 600,
              fontSize: { xs: "2.25rem", sm: "3rem", md: "3.75rem" },
              mb: 2,
              color: "#1C1B19",
            }}
          >
            About NGStore
          </Typography>
          <Typography
            variant="h5"
            sx={{
              maxWidth: 800,
              mx: "auto",
              lineHeight: 1.8,
              fontSize: { xs: "1rem", sm: "1.25rem" },
              color: "#6B6862",
            }}
          >
            Your trusted partner in luxury online shopping, delivering curated
            quality products and exceptional service.
          </Typography>
        </Box>

        {/* Our Story */}
        <Box sx={{ mb: { xs: 6, md: 10 } }}>
          <Card
            elevation={0}
            sx={{
              borderRadius: "24px",
              bgcolor: "#FFFFFF",
              border: "1px solid #E7E4DD",
              boxShadow: "0 4px 20px -2px rgba(28, 27, 25, 0.05)",
            }}
          >
            <CardContent sx={{ p: { xs: 3, sm: 5, md: 6 } }}>
              <Typography
                variant="h4"
                sx={{
                  fontFamily: '"Playfair Display", Georgia, serif',
                  fontWeight: 600,
                  mb: 3,
                  color: "#1C1B19",
                  fontSize: { xs: "1.5rem", sm: "2rem" },
                }}
              >
                Our Story
              </Typography>
              <Typography
                variant="body1"
                sx={{ lineHeight: 2, mb: 2, color: "#6B6862" }}
              >
                Founded in 2025, NGStore started with a simple mission: to make
                quality products accessible to everyone. What began as a small
                startup has grown into a trusted e-commerce platform serving
                thousands of customers across the country.
              </Typography>
              <Typography
                variant="body1"
                sx={{ lineHeight: 2, mb: 2, color: "#6B6862" }}
              >
                We believe in the power of technology to transform shopping
                experiences. Our platform combines cutting-edge technology with
                a customer-first approach, ensuring that every purchase is
                smooth, secure, and satisfying.
              </Typography>
              <Typography
                variant="body1"
                sx={{ lineHeight: 2, color: "#6B6862" }}
              >
                Today, we're proud to offer a diverse range of products, from
                electronics to fashion, all carefully curated to meet the
                highest standards of quality and value.
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Stats */}
        <Box sx={{ mb: 10 }}>
          <Grid container spacing={3}>
            {stats.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <Card
                  elevation={0}
                  sx={{
                    textAlign: "center",
                    p: 4,
                    borderRadius: "20px",
                    bgcolor: "#FFFFFF",
                    border: "1px solid #E7E4DD",
                    boxShadow: "0 4px 20px -2px rgba(28, 27, 25, 0.05)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-6px)",
                      boxShadow: "0 12px 28px -4px rgba(28, 27, 25, 0.08)",
                    },
                  }}
                >
                  <Typography
                    variant="h3"
                    sx={{
                      fontFamily: '"Playfair Display", Georgia, serif',
                      fontWeight: 700,
                      color: "#B8925A",
                      mb: 1,
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 600, color: "#6B6862" }}
                  >
                    {stat.label}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Features */}
        <Box sx={{ mb: 10 }}>
          <Typography
            variant="h3"
            sx={{
              textAlign: "center",
              fontFamily: '"Playfair Display", Georgia, serif',
              fontWeight: 600,
              mb: 6,
              color: "#1C1B19",
            }}
          >
            Why Choose Us?
          </Typography>
          <Grid container spacing={3}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  elevation={0}
                  sx={{
                    height: "100%",
                    textAlign: "center",
                    p: 4,
                    borderRadius: "20px",
                    bgcolor: "#FFFFFF",
                    border: "1px solid #E7E4DD",
                    boxShadow: "0 4px 20px -2px rgba(28, 27, 25, 0.05)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-6px)",
                      boxShadow: "0 12px 28px -4px rgba(28, 27, 25, 0.08)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 72,
                      height: 72,
                      borderRadius: "50%",
                      bgcolor: "#F7F3EC",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mx: "auto",
                      mb: 3,
                      color: "#B8925A",
                      border: "1px solid #E7E4DD",
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: '"Playfair Display", Georgia, serif',
                      fontWeight: 600,
                      mb: 1.5,
                      color: "#1C1B19",
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ lineHeight: 1.8, color: "#6B6862" }}
                  >
                    {feature.description}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Mission & Vision */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          <Grid item xs={12} md={6}>
            <Card
              elevation={0}
              sx={{
                height: "100%",
                borderRadius: "24px",
                bgcolor: "#FFFFFF",
                border: "1px solid #E7E4DD",
                boxShadow: "0 4px 20px -2px rgba(28, 27, 25, 0.05)",
                p: 4,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <GrowthIcon sx={{ fontSize: 36, color: "#B8925A", mr: 2 }} />
                <Typography
                  variant="h4"
                  sx={{
                    fontFamily: '"Playfair Display", Georgia, serif',
                    fontWeight: 600,
                    color: "#1C1B19",
                  }}
                >
                  Our Mission
                </Typography>
              </Box>
              <Typography
                variant="body1"
                sx={{ lineHeight: 2, color: "#6B6862" }}
              >
                To revolutionize online shopping by providing a seamless,
                secure, and satisfying experience that exceeds customer
                expectations. We strive to offer the best products at
                competitive prices while maintaining the highest standards of
                service.
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card
              elevation={0}
              sx={{
                height: "100%",
                borderRadius: "24px",
                bgcolor: "#FFFFFF",
                border: "1px solid #E7E4DD",
                boxShadow: "0 4px 20px -2px rgba(28, 27, 25, 0.05)",
                p: 4,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <TeamIcon sx={{ fontSize: 36, color: "#B8925A", mr: 2 }} />
                <Typography
                  variant="h4"
                  sx={{
                    fontFamily: '"Playfair Display", Georgia, serif',
                    fontWeight: 600,
                    color: "#1C1B19",
                  }}
                >
                  Our Vision
                </Typography>
              </Box>
              <Typography
                variant="body1"
                sx={{ lineHeight: 2, color: "#6B6862" }}
              >
                To become the most trusted and preferred e-commerce platform,
                known for innovation, reliability, and customer satisfaction. We
                envision a future where shopping is not just a transaction, but
                an experience that brings joy and convenience to every customer.
              </Typography>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default About;
