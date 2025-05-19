import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useCart } from '../context/CartContext';
import { useTheme } from 'styled-components';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
import { CHECKOUT_URL } from '../utils/apiConfig';

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

const CardElementContainer = styled.div`
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 0.75rem;
  margin-top: 0.5rem;
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

// Generate time slots from 9am to 7pm
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
  const stripe = useStripe();
  const elements = useElements();
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
    paymentMethod: 'card'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const timeSlots = generateTimeSlots();
  
  // Get tomorrow's date as minimum date for pickup
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // Required field validation
      if (!formData.name || !formData.email || !formData.phone || !formData.pickupDate || !formData.pickupTime) {
        throw new Error('Please fill in all required fields');
      }
      
      if (formData.deliveryOption === 'delivery' && !formData.deliveryAddress) {
        throw new Error('Please provide a delivery address');
      }
      
      // Process payment based on method
      let paymentResult = { success: false };
      
      if (formData.paymentMethod === 'card') {
        if (!stripe || !elements) {
          throw new Error('Stripe has not loaded yet. Please try again.');
        }
        
        const cardElement = elements.getElement(CardElement);
        if (!cardElement) {
          throw new Error('Card information is required');
        }
        
        // Create payment method
        const { error, paymentMethod } = await stripe.createPaymentMethod({
          type: 'card',
          card: cardElement,
          billing_details: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone
          }
        });
        
        if (error) {
          throw new Error(error.message);
        }
        
        // Send to backend
        const response = await axios.post(CHECKOUT_URL, {
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
            method: 'card',
            paymentMethodId: paymentMethod.id
          },
          specialInstructions: formData.specialInstructions
        });
        
        paymentResult = response.data;
      } else {
        // Cash payment - just create the order
        const response = await axios.post(CHECKOUT_URL, {
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
            method: 'cash'
          },
          specialInstructions: formData.specialInstructions
        });
        
        paymentResult = response.data;
      }
      
      if (paymentResult.success) {
        // Clear cart and redirect to success page
        clearCart();
        navigate('/order-success', { 
          state: { 
            orderId: paymentResult.orderId,
            orderDetails: {
              ...formData,
              items,
              total: cartTotal
            }
          } 
        });
      } else {
        throw new Error(paymentResult.message || 'Order processing failed');
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
        
        <FormGroup>
          <Label>Payment Method *</Label>
          <RadioGroup>
            <RadioLabel>
              <input
                type="radio"
                name="paymentMethod"
                value="card"
                checked={formData.paymentMethod === 'card'}
                onChange={handleChange}
              />
              Pay with Card
            </RadioLabel>
            <RadioLabel>
              <input
                type="radio"
                name="paymentMethod"
                value="cash"
                checked={formData.paymentMethod === 'cash'}
                onChange={handleChange}
              />
              Pay with Cash ({formData.deliveryOption === 'pickup' ? 'at pickup' : 'on delivery'})
            </RadioLabel>
          </RadioGroup>
        </FormGroup>
        
        {formData.paymentMethod === 'card' && (
          <FormGroup>
            <Label htmlFor="card-element">Credit or Debit Card *</Label>
            <CardElementContainer>
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      fontFamily: 'Arial, sans-serif',
                      '::placeholder': {
                        color: '#aab7c4'
                      }
                    },
                    invalid: {
                      color: '#e5424d'
                    }
                  }
                }}
              />
            </CardElementContainer>
          </FormGroup>
        )}
        
        {error && (
          <FormGroup>
            <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>
          </FormGroup>
        )}
        
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
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Place Order'}
          </Button>
        </ButtonRow>
      </form>
    </CheckoutContainer>
  );
};

export default CheckoutForm;