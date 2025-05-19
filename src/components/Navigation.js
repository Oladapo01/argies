import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTheme } from 'styled-components';
import { motion } from 'framer-motion';
import Logo from './Logo';
import { useCart } from '../context/CartContext';
import { CiShoppingCart } from "react-icons/ci";
import CartModal from './CartModal'; 

const Nav = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: ${({ scrolled, theme }) => scrolled ? 'rgba(255, 255, 255, 0.95)' : 'transparent'};
  box-shadow: ${({ scrolled }) => scrolled ? '0 2px 10px rgba(0, 0, 0, 0.1)' : 'none'};
  transition: all 0.3s ease;
  z-index: 1000;
`;

const NavLinks = styled.div`
  display: flex;
  gap: 2rem;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    display: ${({ mobileMenuOpen }) => mobileMenuOpen ? 'flex' : 'none'};
    flex-direction: column;
    position: absolute;
    top: 80px;
    left: 0;
    right: 0;
    background-color: white;
    padding: 2rem;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  }
`;

const NavLink = styled(motion.a)`
  color: ${({ theme }) => theme.colors.text};
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    display: block;
  }
`;

const Navigation = ({ sections }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const { items = [] } = useCart() || {};
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const theme = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionRef) => {
    setMobileMenuOpen(false);
    sectionRef.current.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <Nav scrolled={scrolled}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Logo onClick={scrollToTop} />
        </motion.div>
        
        <MobileMenuButton onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? '✕' : '☰'}
        </MobileMenuButton>
        
        <NavLinks mobileMenuOpen={mobileMenuOpen}>
          <NavLink 
            whileHover={{ scale: 1.05 }}
            onClick={() => scrollToSection(sections.menu)}
          >
            Menu
          </NavLink>
          <NavLink 
            whileHover={{ scale: 1.05 }}
            onClick={() => scrollToSection(sections.gallery)}
          >
            Gallery
          </NavLink>
          <NavLink 
            whileHover={{ scale: 1.05 }}
            onClick={() => scrollToSection(sections.contact)}
          >
            Contact
          </NavLink>
          <NavLink 
            whileHover={{ scale: 1.05 }}
            onClick={() => scrollToSection(sections.location)}
          >
            Location
          </NavLink>
          <NavLink 
            whileHover={{ scale: 1.05 }}
            onClick={(e) => {
              e.preventDefault();
              setCartModalOpen(true); // Open cart modal instead of scrolling
            }}
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <CiShoppingCart style={{ marginRight: '5px' }} />
            Cart {itemCount > 0 && <span style={{ 
              backgroundColor: theme.colors.primary, 
              color: 'white', 
              borderRadius: '50%', 
              width: '20px', 
              height: '20px', 
              display: 'inline-flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              marginLeft: '5px',
              fontSize: '0.8rem'
            }}>{itemCount}</span>}
          </NavLink>
        </NavLinks>
      </Nav>

    {/* Add the cart modal */}
    <CartModal 
      isOpen={cartModalOpen} 
      onClose={() => setCartModalOpen(false)} 
    />
  </>
  );
};

export default Navigation;