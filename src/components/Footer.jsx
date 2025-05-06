import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Link, 
  Stack, 
  IconButton,
  useTheme
} from '@mui/material';
import InstagramIcon from '@mui/icons-material/Instagram';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LanguageIcon from '@mui/icons-material/Language';

const Footer = () => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();

  return (
    <Box 
      component="footer" 
      sx={{ 
        mt: 4, 
        py: 3, 
        backgroundColor: 'white',
        borderTop: '1px solid',
        borderColor: 'rgba(226, 232, 240, 1)',
      }}
    >
      <Container maxWidth="lg">
        <Box 
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'center', md: 'flex-start' },
            justifyContent: 'space-between'
          }}
        >
          <Box sx={{ mb: { xs: 2, md: 0 } }}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Hackathon Platform
            </Typography>
            <Typography variant="body2" color="text.secondary">
              © {currentYear} | Developed with ❤️ by OPQTech in Bengaluru
            </Typography>
          </Box>
          
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={{ xs: 2, sm: 3 }}
            alignItems="center"
          >
            <Link 
              href="https://www.opqbootcamp.com" 
              target="_blank" 
              rel="noopener"
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                color: theme.palette.text.secondary,
                textDecoration: 'none',
                '&:hover': {
                  color: theme.palette.primary.main,
                }
              }}
            >
              <LanguageIcon sx={{ mr: 0.5, fontSize: 20 }} />
              <Typography variant="body2">
                opqbootcamp.com
              </Typography>
            </Link>
            
            <Link 
              href="mailto:contact@opqbootcamp.com"
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                color: theme.palette.text.secondary,
                textDecoration: 'none',
                '&:hover': {
                  color: theme.palette.primary.main,
                }
              }}
            >
              <EmailIcon sx={{ mr: 0.5, fontSize: 20 }} />
              <Typography variant="body2">
                contact@opqbootcamp.com
              </Typography>
            </Link>
            
            <Link 
              href="tel:+919876543210"
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                color: theme.palette.text.secondary,
                textDecoration: 'none',
                '&:hover': {
                  color: theme.palette.primary.main,
                }
              }}
            >
              <PhoneIcon sx={{ mr: 0.5, fontSize: 20 }} />
              <Typography variant="body2">
              080-468-10558
              </Typography>
            </Link>
            
            <IconButton 
              aria-label="Instagram" 
              href="https://www.instagram.com/join_opqtech/" 
              target="_blank"
              rel="noopener"
              sx={{ 
                color: theme.palette.text.secondary,
                '&:hover': {
                  color: '#E1306C',
                  backgroundColor: 'rgba(225, 48, 108, 0.04)'
                }
              }}
            >
              <InstagramIcon sx={{ mr: 0.5, fontSize: 20 }}/>
              <Typography variant="body2">
              join_opqtech
              </Typography>
            </IconButton>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;