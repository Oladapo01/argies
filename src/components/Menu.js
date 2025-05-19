import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import StripeCheckout from './StripeCheckout';
import { useCart } from '../context/CartContext';

const MenuSection = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  padding: 4rem 0;
`;

const MenuContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
`;

const MenuTitle = styled(motion.h2)`
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 3rem;
  color: ${({ theme }) => theme.colors.primary};
`;

const CategoryTabs = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const CategoryTab = styled.button`
  background: ${({ active, theme }) => active ? theme.colors.primary : 'transparent'};
  color: ${({ active, theme }) => active ? 'white' : theme.colors.text};
  border: 1px solid ${({ theme }) => theme.colors.primary};
  padding: 0.5rem 1.5rem;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  
  &:hover {
    background: ${({ theme }) => theme.colors.accent};
    color: white;
  }
`;

const MenuGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
`;

const MenuItem = styled(motion.div)`
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const MenuItemImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
`;

const MenuItemContent = styled.div`
  padding: 1.5rem;
`;

const MenuItemTitle = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
`;

const MenuItemPrice = styled.p`
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 600;
  margin-bottom: 1rem;
`;

const MenuItemDescription = styled.p`
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
  color: #666;
`;

const AddToCartButton = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  width: 100%;
  
  &:hover {
    background: ${({ theme }) => theme.colors.accent};
  }
`;

const CartSection = styled.div`
  background: ${({ theme }) => theme.colors.secondary};
  padding: 2rem;
  border-radius: 10px;
  margin-top: 3rem;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
`;

const cakeItems = [
  {
    id: 1,
    category: 'cupcakes',
    name: 'Vanilla Dream Cupcake',
    price: 3.99,
    image: 'https://placeholder-image.com/cupcake1.jpg',
    description: 'Light vanilla cupcake topped with creamy vanilla buttercream and sprinkles.'
  },
  {
    id: 2,
    category: 'cupcakes',
    name: 'Chocolate Delight Cupcake',
    price: 4.29,
    image: 'https://placeholder-image.com/cupcake2.jpg',
    description: 'Rich chocolate cupcake with chocolate ganache filling and frosting.'
  },
  {
    id: 3,
    category: 'cakes',
    name: 'Strawberry Shortcake',
    price: 28.99,
    image: 'https://placeholder-image.com/cake1.jpg',
    description: 'Vanilla sponge layered with fresh strawberries and whipped cream.'
  },
  {
    id: 4,
    category: 'cakes',
    name: 'Red Velvet Cake',
    price: 32.99,
    image: 'https://placeholder-image.com/cake2.jpg',
    description: 'Classic red velvet cake with cream cheese frosting and white chocolate shavings.'
  },
  {
    id: 5,
    category: 'pastries',
    name: 'Almond Croissant',
    price: 4.49,
    image: 'https://placeholder-image.com/pastry1.jpg',
    description: 'Flaky butter croissant filled with almond cream and topped with sliced almonds.'
  },
  {
    id: 6,
    category: 'pastries',
    name: 'Danish Pastry',
    price: 3.99,
    image: 'https://placeholder-image.com/pastry2.jpg',
    description: 'Layered pastry with fruit filling and vanilla glaze.'
  }
];

const Menu = () => {
  const [category, setCategory] = useState('all');
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1
  });
  const { addToCart, cart = [], total = 0 } = useCart() || {};

  const filteredItems = category === 'all' 
    ? cakeItems || []
    : (cakeItems || []).filter(item => item.category === category);

  return (
    <MenuSection>
      <MenuContainer>
        <MenuTitle
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          Our Delicious Menu
        </MenuTitle>

        <CategoryTabs>
          <CategoryTab 
            active={category === 'all'} 
            onClick={() => setCategory('all')}
          >
            All
          </CategoryTab>
          <CategoryTab 
            active={category === 'cupcakes'} 
            onClick={() => setCategory('cupcakes')}
          >
            Cupcakes
          </CategoryTab>
          <CategoryTab 
            active={category === 'cakes'} 
            onClick={() => setCategory('cakes')}
          >
            Cakes
          </CategoryTab>
          <CategoryTab 
            active={category === 'pastries'} 
            onClick={() => setCategory('pastries')}
          >
            Pastries
          </CategoryTab>
        </CategoryTabs>

        <MenuGrid>
          {filteredItems.map((item, index) => (
            <MenuItem
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <MenuItemImage src={item.image} alt={item.name} />
              <MenuItemContent>
                <MenuItemTitle>{item.name}</MenuItemTitle>
                <MenuItemPrice>${item.price.toFixed(2)}</MenuItemPrice>
                <MenuItemDescription>{item.description}</MenuItemDescription>
                <AddToCartButton onClick={() => addToCart(item)}>
                  Add to Cart
                </AddToCartButton>
              </MenuItemContent>
            </MenuItem>
          ))}
        </MenuGrid>

        {cart && cart.length > 0 && (
          <CartSection>
            <h3>Your Order</h3>
            <ul>
              {cart.map(item => (
                <li key={item.id}>
                  {item.name} x {item.quantity} - ${(item.price * item.quantity).toFixed(2)}
                </li>
              ))}
            </ul>
            <p>Total: ${total.toFixed(2)}</p>
            <StripeCheckout total={total} />
          </CartSection>
        )}
      </MenuContainer>
    </MenuSection>
  );
};

export default Menu;