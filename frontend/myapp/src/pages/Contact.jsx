import React, { useState } from 'react'
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  CircularProgress
} from '@mui/material'
import {
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Send as SendIcon
} from '@mui/icons-material'
import { toast } from 'react-hot-toast'

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)

  const contactInfo = [
    {
      icon: <EmailIcon sx={{ fontSize: 40 }} />,
      title: 'Email Us',
      details: 'ngtech2026@gmail.com',
      link: 'mailto:ngtech2026@gmail.com',
      color: '#2196F3'
    },
    {
      icon: <PhoneIcon sx={{ fontSize: 40 }} />,
      title: 'Call Us',
      details: '+91-7775831890',
      link: 'tel:+91-7775831890',
      color: '#4CAF50'
    },
    {
      icon: <LocationIcon sx={{ fontSize: 40 }} />,
      title: 'Visit Us',
      details: 'IT Park, Nagpur, Maharashtra 440022',
      link: 'https://www.google.com/maps/place/IT+Park+Rd,+Nagpur,+Maharashtra+440022/@21.1174284,79.0443799,17z/data=!3m1!4b1!4m6!3m5!1s0x3bd4bf8a1904e029:0xf83cca68b3497831!8m2!3d21.1174284!4d79.0469548!16s%2Fg%2F11b6_mdthz!5m2!1e4!1e2?entry=ttu&g_ep=EgoyMDI2MDQyOS4wIKXMDSoASAFQAw%3D%3D',
      color: '#FF9800'
    }
  ]

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Message sent successfully! We\'ll get back to you soon.')
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        })
      } else {
        toast.error(result.errors[0] || result.message || 'Failed to send message. Please try again.')
      }
    } catch (error) {
      console.error('Contact form error:', error)
      toast.error('Failed to send message. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ bgcolor: '#FAF9F6', minHeight: '100vh', py: 10 }}>
      <Container maxWidth="lg">
        {/* Hero Section */}
        <Box sx={{ textAlign: 'center', mb: 10 }}>
          <Typography
            variant="h2"
            sx={{
              fontFamily: '"Playfair Display", Georgia, serif',
              fontWeight: 600,
              fontSize: { xs: '2.25rem', sm: '3rem', md: '3.75rem' },
              mb: 2,
              color: '#1C1B19'
            }}
          >
            Get In Touch
          </Typography>
          <Typography variant="h5" sx={{ maxWidth: 800, mx: 'auto', lineHeight: 1.8, color: '#6B6862', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
            Have a question or need assistance? We're here to help! Reach out to us and we'll respond as soon as possible.
          </Typography>
        </Box>

        {/* Contact Info Cards */}
        <Grid container spacing={3} sx={{ mb: 10 }}>
          {contactInfo.map((info, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                component="a"
                href={info.link}
                target="_blank"
                rel="noopener noreferrer"
                elevation={0}
                sx={{
                  height: '100%',
                  textAlign: 'center',
                  p: 4,
                  borderRadius: '20px',
                  bgcolor: '#FFFFFF',
                  border: '1px solid #E7E4DD',
                  boxShadow: '0 4px 20px -2px rgba(28, 27, 25, 0.05)',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: '0 12px 28px -4px rgba(28, 27, 25, 0.08)'
                  }
                }}
              >
                <Box
                  sx={{
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    bgcolor: '#F7F3EC',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 3,
                    color: '#B8925A',
                    border: '1px solid #E7E4DD'
                  }}
                >
                  {info.icon}
                </Box>
                <Typography variant="h6" sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 600, mb: 1, color: '#1C1B19' }}>
                  {info.title}
                </Typography>
                <Typography variant="body1" sx={{ color: '#6B6862', fontSize: '0.95rem' }}>
                  {info.details}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Contact Form */}
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Card elevation={0} sx={{ borderRadius: '24px', bgcolor: '#FFFFFF', border: '1px solid #E7E4DD', boxShadow: '0 4px 20px -2px rgba(28, 27, 25, 0.05)', height: '100%' }}>
              <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
                <Typography variant="h4" sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 600, mb: 3, color: '#1C1B19' }}>
                  Send Us a Message
                </Typography>
                <form onSubmit={handleSubmit}>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Full Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Email Address"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Phone Number"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        multiline
                        rows={5}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        size="large"
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                        sx={{
                          py: 1.5,
                          borderRadius: '12px',
                          fontWeight: 600,
                          fontSize: '1rem',
                          textTransform: 'none',
                          bgcolor: '#B8925A',
                          boxShadow: '0 4px 14px rgba(184, 146, 90, 0.25)',
                          '&:hover': {
                            bgcolor: '#9E7B47'
                          }
                        }}
                      >
                        {loading ? 'Sending...' : 'Send Message'}
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              </CardContent>
            </Card>
          </Grid>

          {/* Map or Additional Info */}
          <Grid item xs={12} md={6}>
            <Card elevation={0} sx={{ borderRadius: '24px', bgcolor: '#FFFFFF', border: '1px solid #E7E4DD', boxShadow: '0 4px 20px -2px rgba(28, 27, 25, 0.05)', height: '100%' }}>
              <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
                <Typography variant="h4" sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 600, mb: 3, color: '#1C1B19' }}>
                  Business Hours
                </Typography>
                <Box sx={{ mb: 4 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body1" fontWeight={600} sx={{ color: '#1C1B19' }}>Monday - Friday</Typography>
                    <Typography variant="body1" sx={{ color: '#6B6862' }}>9:00 AM - 6:00 PM</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body1" fontWeight={600} sx={{ color: '#1C1B19' }}>Saturday</Typography>
                    <Typography variant="body1" sx={{ color: '#6B6862' }}>10:00 AM - 4:00 PM</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body1" fontWeight={600} sx={{ color: '#1C1B19' }}>Sunday</Typography>
                    <Typography variant="body1" sx={{ color: '#6B6862' }}>Closed</Typography>
                  </Box>
                </Box>

                <Typography variant="h5" sx={{ fontFamily: '"Playfair Display", Georgia, serif', fontWeight: 600, mb: 2, mt: 4, color: '#1C1B19' }}>
                  Frequently Asked Questions
                </Typography>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body1" fontWeight={600} sx={{ mb: 1, color: '#1C1B19' }}>
                    How long does shipping take?
                  </Typography>
                  <Typography variant="body2" sx={{ lineHeight: 1.8, color: '#6B6862' }}>
                    Standard shipping typically takes 3-5 business days. Express shipping is available for 1-2 day delivery.
                  </Typography>
                </Box>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body1" fontWeight={600} sx={{ mb: 1, color: '#1C1B19' }}>
                    What is your return policy?
                  </Typography>
                  <Typography variant="body2" sx={{ lineHeight: 1.8, color: '#6B6862' }}>
                    We offer a 10-day return policy for most items. Products must be in original condition with tags attached.
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body1" fontWeight={600} sx={{ mb: 1, color: '#1C1B19' }}>
                    Do you ship internationally?
                  </Typography>
                  <Typography variant="body2" sx={{ lineHeight: 1.8, color: '#6B6862' }}>
                    Yes, we ship to select international destinations. Shipping costs and delivery times vary by location.
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}

export default Contact