import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import styled from 'styled-components';
import { useCart } from '../context/CartContext';
import axios from 'axios';

const CheckoutForm = styled.form`
  margin-top: 1.5rem;
`;

const CardElementContainer = styled.div`
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 10px;
  background: white;
  margin-bottom: 1rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 5px;
  font-family: inherit;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const CheckoutButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${({ theme }) => theme.colors.accent};
  }
  
  &:disabled {
    background: #cccccc;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: red;
  margin-top: 1rem;
`;

const SuccessMessage = styled.div`
  color: green;
  margin-top: 1rem;
`;

const OrderSummary = styled.div`
  margin: 2rem 0;
  padding: 1rem;
  background-color: #f9f9f9;
  border-radius: 10px;
`;

const OrderNumber = styled.p`
  font-weight: 600;
  font-size: 1.1rem;
  color: ${({ theme }) => theme.colors.primary};
`;

const StripeCheckout = ({ cart, total }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState(null);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });
  
  const stripe = useStripe();
  const elements = useElements();
  const { clearCart } = useCart();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    // Validate form
    if (!customerInfo.name || !customerInfo.email) {
      setError('Please provide your name and email.');
      setLoading(false);
      return;
    }

    if (!stripe || !elements) {
      setError('Stripe has not loaded yet. Please try again.');
      setLoading(false);
      return;
    }

    const cardElement = elements.getElement(CardElement);

    try {
      // Create payment method
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: customerInfo.name,
          email: customerInfo.email,
          phone: customerInfo.phone || undefined
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      // Send payment info to server
      const response = await axios.post('/api/payment', {
        paymentMethodId: paymentMethod.id,
        amount: total,
        items: cart,
        customerInfo
      });

      // Handle successful payment
      setSuccess(true);
      setOrderNumber(response.data.orderNumber);
      clearCart();
      
      // Clear card element
      cardElement.clear();
      
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'An error occurred processing your payment.');
    }
    
    setLoading(false);
  };

  return (
    <CheckoutForm onSubmit={handleSubmit}>
      {!success ? (
        <>
          <h4>Customer Information</h4>
          
          <FormGroup>
            <Label htmlFor="name">Name *</Label>
            <Input
              type="text"
              id="name"
              name="name"
              value={customerInfo.name}
              onChange={handleInputChange}
              required
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="email">Email *</Label>
            <Input
              type="email"
              id="email"
              name="email"
              value={customerInfo.email}
              onChange={handleInputChange}
              required
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="phone">Phone (optional)</Label>
            <Input
              type="tel"
              id="phone"
              name="phone"
              value={customerInfo.phone}
              onChange={handleInputChange}
            />
          </FormGroup>
          
          <h4>Payment Details</h4>
          
          <CardElementContainer>
            <CardElement 
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                  invalid: {
                    color: '#9e2146',
                  },
                },
              }}
            />
          </CardElementContainer>
          
          <CheckoutButton 
            type="submit" 
            disabled={!stripe || loading || total === 0 || success}
          >
            {loading ? 'Processing...' : `Pay ${total.toFixed(2)}`}
          </CheckoutButton>
        </>
      ) : (
        <OrderSummary>
          <SuccessMessage>
            <h3>Thank you for your order!</h3>
            <OrderNumber>Order Number: #{orderNumber}</OrderNumber>
            <p>We've sent a confirmation email to {customerInfo.email}.</p>
            <p>Your order is being processed and you'll receive updates via email.</p>
          </SuccessMessage>
        </OrderSummary>
      )}
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </CheckoutForm>
  );
};

export default StripeCheckout;