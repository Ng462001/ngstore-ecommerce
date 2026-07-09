import React from 'react'
import { Container, Box, Typography, Grid, Card, CardContent, Avatar } from '@mui/material'
import {
  Verified as VerifiedIcon,
  LocalShipping as ShippingIcon,
  SupportAgent as SupportIcon,
  Security as SecurityIcon,
  TrendingUp as GrowthIcon,
  People as TeamIcon
} from '@mui/icons-material'

const About = () => {
  const features = [
    {
      icon: <VerifiedIcon sx={{ fontSize: 40 }} />,
      title: 'Quality Assured',
      description: 'We guarantee the highest quality products with rigorous quality checks.',
      color: '#4CAF50'
    },
    {
      icon: <ShippingIcon sx={{ fontSize: 40 }} />,
      title: 'Fast Delivery',
      description: 'Quick and reliable shipping to your doorstep across the country.',
      color: '#2196F3'
    },
    {
      icon: <SupportIcon sx={{ fontSize: 40 }} />,
      title: '24/7 Support',
      description: 'Our dedicated team is always here to help you with any questions.',
      color: '#9C27B0'
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40 }} />,
      title: 'Secure Shopping',
      description: '100% secure payment gateway with encrypted transactions.',
      color: '#FF9800'
    }
  ]

  const stats = [
    { value: '10K+', label: 'Happy Customers' },
    { value: '5K+', label: 'Products' },
    { value: '50+', label: 'Categories' },
    { value: '99%', label: 'Satisfaction Rate' }
  ]

  const team = [
    {
      name: 'Nikhil Gahane',
      role: 'CEO & Founder',
      image: 'https://randomuser.me/api/portraits/men/1.jpg'
    },
    {
      name: 'Jane Smith',
      role: 'Chief Marketing Officer',
      image: 'https://randomuser.me/api/portraits/women/2.jpg'
    },
    {
      name: 'Mike Johnson',
      role: 'Head of Operations',
      image: 'https://randomuser.me/api/portraits/men/3.jpg'
    },
    {
      name: 'Sarah Williams',
      role: 'Customer Success Lead',
      image: 'https://randomuser.me/api/portraits/women/4.jpg'
    }
  ]

  return (
    <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh', py: 8 }}>
      <Container maxWidth="lg">
        {/* Hero Section */}
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              mb: 3,
              background: 'linear-gradient(45deg, #2196F3 30%, #9C27B0 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            About NGStore
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto', lineHeight: 1.8 }}>
            Your trusted partner in online shopping, delivering quality products and exceptional service since 2025.
          </Typography>
        </Box>

        {/* Our Story */}
        <Box sx={{ mb: 10 }}>
          <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
            <CardContent sx={{ p: 6 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: 'primary.main' }}>
                Our Story
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 2, mb: 2 }}>
                Founded in 2025, NGStore started with a simple mission: to make quality products accessible to everyone.
                What began as a small startup has grown into a trusted e-commerce platform serving thousands of customers
                across the country.
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 2, mb: 2 }}>
                We believe in the power of technology to transform shopping experiences. Our platform combines cutting-edge
                technology with a customer-first approach, ensuring that every purchase is smooth, secure, and satisfying.
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 2 }}>
                Today, we're proud to offer a diverse range of products, from electronics to fashion, all carefully curated
                to meet the highest standards of quality and value.
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Stats */}
        <Box sx={{ mb: 10 }}>
          <Grid container spacing={4}>
            {stats.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <Card
                  sx={{
                    textAlign: 'center',
                    p: 4,
                    borderRadius: 4,
                    boxShadow: 3,
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: 6
                    }
                  }}
                >
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 900,
                      color: 'primary.main',
                      mb: 1
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600 }}>
                    {stat.label}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Features */}
        <Box sx={{ mb: 10 }}>
          <Typography variant="h3" sx={{ textAlign: 'center', fontWeight: 700, mb: 6 }}>
            Why Choose Us?
          </Typography>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    textAlign: 'center',
                    p: 4,
                    borderRadius: 4,
                    boxShadow: 3,
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: 6
                    }
                  }}
                >
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      bgcolor: `${feature.color}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 3,
                      color: feature.color
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                    {feature.description}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Team */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h3" sx={{ textAlign: 'center', fontWeight: 700, mb: 2 }}>
            Meet Our Team
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', mb: 6, maxWidth: 600, mx: 'auto' }}>
            Passionate professionals dedicated to providing you with the best shopping experience.
          </Typography>
          <Grid container spacing={4}>
            {team.map((member, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  sx={{
                    textAlign: 'center',
                    p: 3,
                    borderRadius: 4,
                    boxShadow: 3,
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: 6
                    }
                  }}
                >
                  <Avatar
                    src={member.image}
                    alt={member.name}
                    sx={{
                      width: 120,
                      height: 120,
                      mx: 'auto',
                      mb: 2,
                      border: '4px solid',
                      borderColor: 'primary.main'
                    }}
                  />
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {member.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {member.role}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Mission & Vision */}
        <Grid container spacing={4} sx={{ mb: 8 }}>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%', borderRadius: 4, boxShadow: 3, p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <GrowthIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  Our Mission
                </Typography>
              </Box>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 2 }}>
                To revolutionize online shopping by providing a seamless, secure, and satisfying experience
                that exceeds customer expectations. We strive to offer the best products at competitive prices
                while maintaining the highest standards of service.
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%', borderRadius: 4, boxShadow: 3, p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <TeamIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  Our Vision
                </Typography>
              </Box>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 2 }}>
                To become the most trusted and preferred e-commerce platform, known for innovation,
                reliability, and customer satisfaction. We envision a future where shopping is not just
                a transaction, but an experience that brings joy and convenience to every customer.
              </Typography>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}

export default About