import React, { useEffect, useState } from 'react';
import { useLocation, Link, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { FaCheckCircle, FaHome, FaList } from 'react-icons/fa';
import { useTheme } from 'styled-components';
import axios from 'axios';

const SuccessContainer = styled.div`
  max-width: 800px;
  margin: 100px auto;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const Icon = styled.div`
  font-size: 5rem;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 2rem;
`;

const Title = styled.h2`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 1rem;
`;

const OrderNumber = styled.div`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 2rem;
`;

const Details = styled.div`
  text-align: left;
  margin: 2rem 0;
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 8px;
  
  h3 {
    margin-bottom: 1rem;
    color: ${({ theme }) => theme.colors.primary};
  }
  
  p {
    margin-bottom: 0.5rem;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
`;

const Button = styled(Link)`
  background: ${({ primary, theme }) => primary ? theme.colors.primary : '#f8f9fa'};
  color: ${({ primary }) => primary ? 'white' : '#333'};
  border: 1px solid ${({ primary, theme }) => primary ? theme.colors.primary : '#ddd'};
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  font-weight: 500;
  transition: all 0.3s ease;
  
  svg {
    margin-right: 0.5rem;
  }
  
  &:hover {
    background: ${({ primary, theme }) => primary ? theme.colors.accent : '#e9ecef'};
    transform: translateY(-2px);
  }
`;

const OrderSuccessPage = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { orderId: navOrderId, orderDetails: navOrderDetails } = location.state || {};
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState(navOrderId);
  const [orderDetails, setOrderDetails] = useState(navOrderDetails);
  const theme = useTheme();

  // If landing from SumUp redirect, fetch by order_ref
  useEffect(() => {
    const orderRef = searchParams.get('order_ref');
    if (!navOrderId && orderRef) {
      setLoading(true);
      axios.get(`/api/orders/${orderRef}`)
        .then(res => {
          if (res.data.success && res.data.data) {
            setOrderId(orderRef);
            setOrderDetails({
              name: res.data.data.customer?.name,
              email: res.data.data.customer?.email,
              phone: res.data.data.customer?.phone,
              deliveryOption: res.data.data.delivery?.method,
              pickupDate: res.data.data.delivery?.date,
              pickupTime: res.data.data.delivery?.time,
              deliveryAddress: res.data.data.delivery?.address,
              paymentMethod: res.data.data.payment?.method,
              specialInstructions: res.data.data.specialInstructions,
              items: res.data.data.items,
              total: res.data.data.total
            });
          }
        })
        .finally(() => setLoading(false));
    }
  }, [navOrderId, searchParams]);

  if (loading) {
    return (
      <SuccessContainer>
        <Title>Loading order...</Title>
        <p>Please wait.</p>
      </SuccessContainer>
    );
  }

  if (!orderId) {
    return (
      <SuccessContainer>
        <Title>Order Information Not Found</Title>
        <p>Something went wrong. Please contact us for assistance.</p>
        <ButtonGroup>
          <Button to="/" primary>
            <FaHome /> Return Home
          </Button>
        </ButtonGroup>
      </SuccessContainer>
    );
  }
  
  return (
    <SuccessContainer>
      <Icon>
        <FaCheckCircle />
      </Icon>
      <Title>Order Successful!</Title>
      <OrderNumber>Order Number: #{orderId}</OrderNumber>
      
      <p>
        Thank you for your order! We've sent a confirmation to your email address.
      </p>
      
      {orderDetails && (
        <Details>
          <h3>Order Details</h3>
          <p><strong>Name:</strong> {orderDetails.name}</p>
          <p><strong>Email:</strong> {orderDetails.email}</p>
          <p><strong>Phone:</strong> {orderDetails.phone}</p>
          <p>
            <strong>{orderDetails.deliveryOption === 'pickup' ? 'Pickup' : 'Delivery'}:</strong> {orderDetails.pickupDate} at {orderDetails.pickupTime}
          </p>
          
          {orderDetails.deliveryOption === 'delivery' && (
            <p><strong>Delivery Address:</strong> {orderDetails.deliveryAddress}</p>
          )}
          
          <p>
            <strong>Payment Method:</strong> {orderDetails.paymentMethod === 'card' ? 'Card' : 'Cash'}
          </p>
          
          {orderDetails.specialInstructions && (
            <p><strong>Special Instructions:</strong> {orderDetails.specialInstructions}</p>
          )}
          
          <h3>Items</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {orderDetails.items.map(item => (
              <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>{item.name} x {item.quantity}</span>
                <span>£{(item.price * item.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          
          <p style={{ fontWeight: 'bold', textAlign: 'right', marginTop: '1rem' }}>
            <strong>Total:</strong> £{orderDetails.total.toFixed(2)}
          </p>
        </Details>
      )}
      
      <p>
        {orderDetails?.deliveryOption === 'pickup' 
          ? `Please collect your order at the selected time and bring your order number.` 
          : `Your order will be delivered at the selected time.`}
      </p>
      
      <ButtonGroup>
        <Button to="/" primary>
          <FaHome /> Return Home
        </Button>
        <Button to="/my-orders">
          <FaList /> My Orders
        </Button>
      </ButtonGroup>
    </SuccessContainer>
  );
};

export default OrderSuccessPage;