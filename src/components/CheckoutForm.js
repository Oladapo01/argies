import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useCart } from '../context/CartContext';
import { useTheme } from 'styled-components';
import axios from 'axios';
import PayPalCheckout from './PayPalCheckout'; // Import PayPal component

const CheckoutContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 2rem;
  text-align: center;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #eee;
  border-radius: 4px;
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #eee;
  border-radius: 4px;
  min-height: 100px;
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #eee;
  border-radius: 4px;
  appearance: none;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%23999' viewBox='0 0 16 16'><path d='M7.247 11.14L2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/></svg>");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const RadioGroup = styled.div`
  display: flex;
  gap: 2rem;
`;

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
  input {
    margin-right: 0.5rem;
  }
`;

// Payment Method Styles
const PaymentSection = styled.div`
  margin-bottom: 1.5rem;
`;

const PaymentTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.colors.text};
`;

const PaymentOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const PaymentOption = styled.label`
  display: flex;
  align-items: center;
  padding: 1rem;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background-color: #f8f9fa;
  }
  
  input[type="radio"] {
    margin-right: 1rem;
    transform: scale(1.2);
  }
`;

const PaymentMethodName = styled.span`
  font-size: 1rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
`;



const OrderSummary = styled.div`
  margin: 2rem 0;
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 4px;
  h3 {
    margin-bottom: 1rem;
    color: ${({ theme }) => theme.colors.primary};
  }
  ul {
    list-style: none;
    padding: 0;
    margin-bottom: 1rem;
    li {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
      border-bottom: 1px solid #eee;
      &:last-child {
        border-bottom: none;
      }
    }
  }
  .total {
    display: flex;
    justify-content: space-between;
    font-weight: 600;
    padding-top: 0.5rem;
    border-top: 1px solid #ddd;
  }
`;



const ButtonRow = styled.div`
  display: flex;
  gap: 1rem;
`;

const Button = styled.button`
  flex: 1;
  background: ${({ primary, theme }) => primary ? theme.colors.primary : '#f8f9fa'};
  color: ${({ primary }) => primary ? 'white' : '#333'};
  border: 1px solid ${({ primary, theme }) => primary ? theme.colors.primary : '#ddd'};
  padding: 0.75rem 1rem;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  &:hover {
    background: ${({ primary, theme }) => primary ? theme.colors.accent : '#e9ecef'};
    transform: translateY(-2px);
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 9; hour <= 19; hour++) {
    const hourStr = hour > 12 ? (hour - 12) : hour;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    slots.push(`${hourStr}:00 ${ampm}`);
    if (hour < 19) {
      slots.push(`${hourStr}:30 ${ampm}`);
    }
  }
  return slots;
};

const CheckoutForm = () => {
  const { items, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const theme = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    deliveryOption: 'pickup',
    pickupDate: '',
    pickupTime: '',
    deliveryAddress: '',
    specialInstructions: '',
    paymentMethod: 'paypal' // Changed default to paypal
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [agreedToDisclaimer, setAgreedToDisclaimer] = useState(false);
  const [showPayPal, setShowPayPal] = useState(false);
  const timeSlots = generateTimeSlots();

  // Get tomorrow's date as minimum date for pickup
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Show PayPal buttons when PayPal is selected
    if (name === 'paymentMethod') {
      setShowPayPal(value === 'paypal');
    }
  };

  // PayPal Success Handler
  const handlePayPalSuccess = async (details) => {
    try {
      setLoading(true);
      
      // Send order with PayPal transaction details to your existing endpoint
      const response = await axios.post('/api/orders/checkout', {
        items,
        total: cartTotal,
        customer: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone
        },
        delivery: {
          method: formData.deliveryOption,
          address: formData.deliveryAddress,
          date: formData.pickupDate,
          time: formData.pickupTime
        },
        payment: { 
          method: 'paypal'
        },
        specialInstructions: formData.specialInstructions,
        paypalOrderId: details.id // Send PayPal order ID for verification
      });

      if (response.data.success) {
        clearCart();
        navigate('/order-success', { 
          state: { 
            orderId: response.data.orderId,
            paypalTransactionId: details.id,
            orderDetails: {
              ...formData,
              items,
              total: cartTotal
            }
          } 
        });
      } else {
        throw new Error(response.data.message || 'Order processing failed');
      }
    } catch (err) {
      console.error('PayPal order processing error:', err);
      setError('Failed to process PayPal payment. Please try again.');
    }
    setLoading(false);
  };

  // PayPal Error Handler
  const handlePayPalError = (error) => {
    console.error('PayPal error:', error);
    setError('PayPal payment failed. Please try again or choose a different payment method.');
  };

  // PayPal Cancel Handler
  const handlePayPalCancel = (data) => {
    console.log('PayPal payment cancelled:', data);
    setError('PayPal payment was cancelled. Please try again.');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name || !formData.email || !formData.phone || !formData.pickupDate || !formData.pickupTime) {
      setError('Please fill in all required fields');
      return;
    }
    if (formData.deliveryOption === 'delivery' && !formData.deliveryAddress) {
      setError('Please provide a delivery address');
      return;
    }
    if (!agreedToDisclaimer) {
      setError("You must agree to the Cake Transport Disclaimer before placing the order.");
      return;
    }

    // For PayPal, show PayPal buttons instead of processing immediately
    if (formData.paymentMethod === 'paypal') {
      setShowPayPal(true);
      return;
    }

    setLoading(true);

    try {
      // Send order to backend based on payment method
      if (formData.paymentMethod === 'sumup') {
        const response = await axios.post('/api/orders/checkout', {
          items,
          total: cartTotal,
          customer: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone
          },
          delivery: {
            method: formData.deliveryOption,
            address: formData.deliveryAddress,
            date: formData.pickupDate,
            time: formData.pickupTime
          },
          payment: { method: 'sumup' },
          specialInstructions: formData.specialInstructions
        });
        
        if (response.data.checkout_url) {
          window.location.href = response.data.checkout_url;
        } else {
          throw new Error('No checkout URL received from SumUp');
        }
        setLoading(false);
        return;
      } else {
        // Cash payment, just create the order
        const response = await axios.post('/api/orders/checkout', {
          items,
          total: cartTotal,
          customer: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone
          },
          delivery: {
            method: formData.deliveryOption,
            address: formData.deliveryAddress,
            date: formData.pickupDate,
            time: formData.pickupTime
          },
          payment: { method: 'cash' },
          specialInstructions: formData.specialInstructions
        });
        if (response.data.success) {
          clearCart();
          navigate('/order-success', { 
            state: { 
              orderId: response.data.orderId,
              orderDetails: {
                ...formData,
                items,
                total: cartTotal
              }
            } 
          });
        } else {
          throw new Error(response.data.message || 'Order processing failed');
        }
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    }

    setLoading(false);
  };

  return (
    <CheckoutContainer>
      <Title>Checkout</Title>
      <OrderSummary>
        <h3>Order Summary</h3>
        <ul>
          {items.map(item => (
            <li key={item.id}>
              <span>{item.name} x {item.quantity}</span>
              <span>£{(item.price * item.quantity).toFixed(2)}</span>
            </li>
          ))}
        </ul>
        <div className="total">
          <span>Total:</span>
          <span>£{cartTotal.toFixed(2)}</span>
        </div>
      </OrderSummary>

      <form onSubmit={handleSubmit}>
        <FormRow>
          <FormGroup>
            <Label htmlFor="name">Full Name *</Label>
            <Input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="email">Email Address *</Label>
            <Input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </FormGroup>
        </FormRow>

        <FormGroup>
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </FormGroup>

        <FormGroup>
          <Label>Delivery Option *</Label>
          <RadioGroup>
            <RadioLabel>
              <input
                type="radio"
                name="deliveryOption"
                value="pickup"
                checked={formData.deliveryOption === 'pickup'}
                onChange={handleChange}
              />
              Pickup
            </RadioLabel>
            <RadioLabel>
              <input
                type="radio"
                name="deliveryOption"
                value="delivery"
                checked={formData.deliveryOption === 'delivery'}
                onChange={handleChange}
              />
              Delivery (£5 fee)
            </RadioLabel>
          </RadioGroup>
        </FormGroup>

        {formData.deliveryOption === 'delivery' && (
          <FormGroup>
            <Label htmlFor="deliveryAddress">Delivery Address *</Label>
            <TextArea
              id="deliveryAddress"
              name="deliveryAddress"
              value={formData.deliveryAddress}
              onChange={handleChange}
              placeholder="Full address including street, city, postcode"
              required={formData.deliveryOption === 'delivery'}
            />
          </FormGroup>
        )}

        <FormRow>
          <FormGroup>
            <Label htmlFor="pickupDate">
              {formData.deliveryOption === 'pickup' ? 'Pickup Date *' : 'Delivery Date *'}
            </Label>
            <Input
              type="date"
              id="pickupDate"
              name="pickupDate"
              value={formData.pickupDate}
              onChange={handleChange}
              min={minDate}
              required
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="pickupTime">
              {formData.deliveryOption === 'pickup' ? 'Pickup Time *' : 'Delivery Time *'}
            </Label>
            <Select
              id="pickupTime"
              name="pickupTime"
              value={formData.pickupTime}
              onChange={handleChange}
              required
            >
              <option value="">Select a time</option>
              {timeSlots.map(slot => (
                <option key={slot} value={slot}>{slot}</option>
              ))}
            </Select>
          </FormGroup>
        </FormRow>

        <FormGroup>
          <Label htmlFor="specialInstructions">Special Instructions</Label>
          <TextArea
            id="specialInstructions"
            name="specialInstructions"
            value={formData.specialInstructions}
            onChange={handleChange}
            placeholder="Any special requirements for your cake? Size adjustments, allergies, special messages, etc."
          />
        </FormGroup>

        <PaymentSection>
          <PaymentTitle>Pay with</PaymentTitle>
          <PaymentOptions>
            <PaymentOption>
              <input
                type="radio"
                name="paymentMethod"
                value="paypal"
                checked={formData.paymentMethod === 'paypal'}
                onChange={handleChange}
              />
              <PaymentMethodName>PayPal</PaymentMethodName>
            </PaymentOption>
            
            <PaymentOption>
              <input
                type="radio"
                name="paymentMethod"
                value="sumup"
                checked={formData.paymentMethod === 'sumup'}
                onChange={handleChange}
              />
              <PaymentMethodName>Pay with Card (SumUp)</PaymentMethodName>
            </PaymentOption>
            
            <PaymentOption>
              <input
                type="radio"
                name="paymentMethod"
                value="cash"
                checked={formData.paymentMethod === 'cash'}
                onChange={handleChange}
              />
              <PaymentMethodName>Pay with Cash ({formData.deliveryOption === 'pickup' ? 'at pickup' : 'on delivery'})</PaymentMethodName>
            </PaymentOption>
          </PaymentOptions>
        </PaymentSection>

        {error && (
          <FormGroup>
            <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>
          </FormGroup>
        )}

        {/* PayPal Checkout Component */}
        {showPayPal && formData.paymentMethod === 'paypal' && (
          <FormGroup>
            <PayPalCheckout
              amount={cartTotal}
              currency="GBP"
              onSuccess={handlePayPalSuccess}
              onError={handlePayPalError}
              onCancel={handlePayPalCancel}
            />
          </FormGroup>
        )}

        <FormGroup>
          <RadioLabel style={{ alignItems: 'flex-start' }}>
            <input
              type="checkbox"
              checked={agreedToDisclaimer}
              onChange={(e) => setAgreedToDisclaimer(e.target.checked)}
              required
              style={{ marginTop: '0.3rem' }}
            />
            <span>
              <strong>Cake Transport Disclaimer:</strong><br />
              I acknowledge that once the cake has been picked, I accept full responsibility for its handling and transport. I understand that <strong>Argies</strong> is not liable for any damages that may occur during transit.
            </span>
          </RadioLabel>
        </FormGroup>

        <ButtonRow>
          <Button 
            type="button" 
            onClick={() => navigate(-1)} 
            disabled={loading}
          >
            Back
          </Button>
          <Button 
            type="submit" 
            primary 
            disabled={loading || (formData.paymentMethod === 'paypal' && showPayPal)}
          >
            {loading ? 'Processing...' : 
             formData.paymentMethod === 'paypal' && !showPayPal ? 'Continue to PayPal' :
             formData.paymentMethod === 'paypal' && showPayPal ? 'Complete PayPal Payment Above' :
             'Confirm and Pay'}
          </Button>
        </ButtonRow>
      </form>
    </CheckoutContainer>
  );
};

export default CheckoutForm;