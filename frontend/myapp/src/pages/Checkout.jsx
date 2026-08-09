import * as React from 'react';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import { useLocation, useNavigate } from 'react-router-dom';
import DeliveryAddress from '../components/DeliveryAddress';
import Payment from './Payment';
import { Typography, Container, Paper } from '@mui/material';
import OrderSummary from '../components/OrderSummary';
import CheckIcon from '@mui/icons-material/Check';

const steps = ['Shipping address', 'Order summary', 'Payment details'];

// Create a context for sharing checkout data
export const CheckoutContext = React.createContext();

// Custom Step Icon Component
function CustomStepIcon(props) {
  const { active, completed, icon } = props;

  return (
    <Box
      sx={{
        width: 24,
        height: 24,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: active ? 'primary.main' : completed ? 'success.main' : 'grey.300',
        color: active || completed ? 'white' : 'grey.600',
        fontSize: '0.875rem',
        fontWeight: 'bold',
      }}
    >
      {completed ? <CheckIcon sx={{ fontSize: 16 }} /> : icon}
    </Box>
  );
}

export default function HorizontalLinearStepper() {
  const location = useLocation();
  const navigate = useNavigate();
  const querySearch = new URLSearchParams(location.search);
  const [activeStep, setActiveStep] = React.useState(parseInt(querySearch.get("step") ?? 0, 10));

  // State to share between steps
  const [checkoutData, setCheckoutData] = React.useState({
    selectedAddress: null,
    orderItems: [],
    paymentMethod: 'card'
  });

  // Update URL when step changes
  React.useEffect(() => {
    const newSearch = new URLSearchParams(location.search);
    newSearch.set('step', activeStep.toString());
    navigate(`${location.pathname}?${newSearch.toString()}`, { replace: true });
  }, [activeStep, location.pathname, location.search, navigate]);

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep((prevActiveStep) => prevActiveStep - 1);
    }
  };

  const handleStepClick = (stepIndex) => {
    // Allow going back to previous steps, but not skipping ahead
    if (stepIndex <= activeStep) {
      setActiveStep(stepIndex);
    }
  };

  const updateCheckoutData = (newData) => {
    setCheckoutData(prev => ({ ...prev, ...newData }));
  };

  const isStepComplete = (stepIndex) => {
    // A step is complete if it's before the active step
    return stepIndex < activeStep;
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <DeliveryAddress
            onNext={handleNext}
            onAddressSelect={(address) => updateCheckoutData({ selectedAddress: address })}
            selectedAddress={checkoutData.selectedAddress}
          />
        );
      case 1:
        return (
          <OrderSummary
            onNext={handleNext}
            onBack={handleBack}
            selectedAddress={checkoutData.selectedAddress}
          />
        );
      case 2:
        return (
          <Payment
            onBack={handleBack}
            selectedAddress={checkoutData.selectedAddress}
            checkoutData={checkoutData}
          />
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <CheckoutContext.Provider value={{ checkoutData, updateCheckoutData }}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={0} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center" fontWeight="bold">
            Checkout
          </Typography>
          <Typography variant="subtitle1" align="center" color="text.secondary" sx={{ mb: 4 }}>
            Complete your purchase in {steps.length - activeStep} simple {steps.length - activeStep === 1 ? 'step' : 'steps'}
          </Typography>

          <Stepper activeStep={activeStep} sx={{ mb: 4, overflowX: 'auto', py: 1, '& .MuiStep-root': { px: { xs: 0.5, sm: 2 } } }}>
            {steps.map((label, index) => (
              <Step key={label} completed={isStepComplete(index)}>
                <StepLabel
                  StepIconComponent={CustomStepIcon}
                  onClick={() => handleStepClick(index)}
                  sx={{
                    cursor: index <= activeStep ? 'pointer' : 'default',
                    '& .MuiStepLabel-label': {
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      fontWeight: index === activeStep ? 600 : 400,
                      color: index === activeStep ? 'primary.main' : 'text.secondary',
                      display: { xs: index === activeStep ? 'inline-block' : 'none', sm: 'inline-block' }
                    },
                    '& .MuiStepLabel-label.Mui-completed': {
                      color: 'text.secondary',
                      fontWeight: 400
                    }
                  }}
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>

          <Box sx={{ mt: 2 }}>
            {activeStep === steps.length ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h5" gutterBottom color="success.main">
                  Order Completed Successfully!
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Thank you for your purchase. You will receive an email confirmation shortly.
                </Typography>
                <Button
                  variant="contained"
                  sx={{ mt: 3 }}
                  onClick={() => navigate('/')}
                >
                  Continue Shopping
                </Button>
              </Box>
            ) : (
              <React.Fragment>
                {/* Step Content */}
                <Box sx={{ mb: 4 }}>
                  {getStepContent(activeStep)}
                </Box>
              </React.Fragment>
            )}
          </Box>
        </Paper>
      </Container>
    </CheckoutContext.Provider>
  );
}