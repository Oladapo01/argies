import React from 'react';
import styled from 'styled-components';
import { useTheme } from 'styled-components'
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { FaTimes, FaPlus, FaMinus, FaTrash } from 'react-icons/fa';

const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  z-index: 1100;
  padding-top: 100px;
`;

const ModalContent = styled(motion.div)`
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #eee;
  
  h2 {
    margin: 0;
    color: ${({ theme }) => theme.colors.primary};
    font-size: 1.5rem;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #999;
  
  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const CartItems = styled.div`
  padding: 1rem;
  
  p.empty {
    text-align: center;
    padding: 2rem;
    color: #999;
  }
`;

const CartItem = styled.div`
  display: flex;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
  
  &:last-child {
    border-bottom: none;
  }
`;

const ItemImage = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 4px;
  overflow: hidden;
  margin-right: 1rem;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ItemDetails = styled.div`
  flex: 1;
  
  h4 {
    margin: 0 0 0.5rem;
  }
  
  .price {
    color: ${({ theme }) => theme.colors.primary};
    font-weight: 600;
  }
`;

const ItemControls = styled.div`
  display: flex;
  align-items: center;
  margin-top: 0.5rem;
  
  button {
    background: ${({ theme }) => theme.colors.primary};
    color: white;
    border: none;
    width: 24px;
    height: 24px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    
    &:hover {
      background: ${({ theme }) => theme.colors.accent};
    }
  }
  
  span {
    margin: 0 0.5rem;
    min-width: 30px;
    text-align: center;
  }
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  margin-left: 1rem;
  
  &:hover {
    color: ${({ theme }) => theme.colors.accent};
  }
`;

const CartFooter = styled.div`
  padding: 1rem;
  border-top: 1px solid #eee;
  
  .total {
    display: flex;
    justify-content: space-between;
    font-weight: 600;
    margin-bottom: 1rem;
  }
`;

const CheckoutButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  width: 100%;
  padding: 0.75rem;
  border-radius: 25px;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background: ${({ theme }) => theme.colors.accent};
  }
`;

const CartModal = ({ isOpen, onClose }) => {
  const { items, updateQuantity, removeFromCart, cartTotal } = useCart();
  const theme = useTheme();
  const navigate = useNavigate();
  
  return (
    <AnimatePresence>
      {isOpen && (
        <ModalOverlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <ModalContent
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            onClick={e => e.stopPropagation()}
          >
            <ModalHeader>
              <h2>Your Cart</h2>
              <CloseButton onClick={onClose}>
                <FaTimes />
              </CloseButton>
            </ModalHeader>
            
            <CartItems>
              {items.length === 0 ? (
                <p className="empty">Your cart is empty</p>
              ) : (
                items.map(item => (
                  <CartItem key={item.id}>
                    <ItemImage>
                      <img src={item.image} alt={item.name} />
                    </ItemImage>
                    <ItemDetails>
                      <h4>{item.name}</h4>
                      <div className="price">£{item.price.toFixed(2)}</div>
                      <ItemControls>
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                          <FaMinus size={12} />
                        </button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                          <FaPlus size={12} />
                        </button>
                        <RemoveButton onClick={() => removeFromCart(item.id)}>
                          <FaTrash />
                        </RemoveButton>
                      </ItemControls>
                    </ItemDetails>
                  </CartItem>
                ))
              )}
            </CartItems>
            
            {items.length > 0 && (
              <CartFooter>
                <div className="total">
                  <span>Total:</span>
                  <span>£{cartTotal.toFixed(2)}</span>
                </div>
                <CheckoutButton onClick={() => {
                    onClose(); // Close the modal
                    navigate('/checkout'); // Navigate to checkout page
                }}>
                    Proceed to Checkout
                </CheckoutButton>
              </CartFooter>
            )}
          </ModalContent>
        </ModalOverlay>
      )}
    </AnimatePresence>
  );
};

export default CartModal;