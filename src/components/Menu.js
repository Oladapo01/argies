import React, { useState } from 'react';
import styled from 'styled-components';
import { useTheme } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useCart } from '../context/CartContext';
import DietaryLabel from './DietaryLabel';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { FaTimes } from 'react-icons/fa';
import cakeItems from './menu.json';

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

const FilterTabs = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const FilterButton = styled.button`
  background: ${({ active, theme }) => active ? theme.colors.accent : 'transparent'};
  color: ${({ theme }) => theme.colors.text};
  border: 1px solid ${({ theme }) => theme.colors.accent};
  padding: 0.4rem 1.2rem;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.3s ease;

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

const MenuItemImage = styled(LazyLoadImage)`
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

const MenuItemPriceRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const MenuItemPrice = styled.p`
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 600;
`;

const MenuItemDescription = styled.p`
  font-size: 0.9rem;
  margin-bottom: 1rem;
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

// Cake Size Modal Styles
const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1100;
  padding: 1rem;
`;

const ModalContent = styled(motion.div)`
  background-color: white;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #eee;

  h3 {
    margin: 0;
    color: ${({ theme }) => theme.colors.primary};
    font-size: 1.3rem;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #999;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.3s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
    background: #f5f5f5;
  }
`;

const ModalBody = styled.div`
  padding: 1.5rem;
`;

const SizeOption = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 2px solid ${({ selected, theme }) => selected ? theme.colors.primary : '#eee'};
  border-radius: 8px;
  margin-bottom: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background: #f8f9fa;
  }
`;

const SizeInfo = styled.div`
  h4 {
    margin: 0 0 0.25rem 0;
    font-size: 1rem;
  }
  
  p {
    margin: 0;
    font-size: 0.85rem;
    color: #666;
  }
`;

const SizePrice = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1.1rem;
`;

const ModalFooter = styled.div`
  padding: 1.5rem;
  border-top: 1px solid #eee;
  display: flex;
  gap: 1rem;
`;

const ModalButton = styled.button`
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
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const dietaryFilters = ['vegan', 'vegetarian', 'gluten-free', 'dairy-free'];

// Cake size options with pricing
const cakeSizes = [
  { id: '6inch', name: '6 inch', serves: 'serves 8-10', priceMultiplier: 1 },
  { id: '8inch', name: '8 inch', serves: 'serves 12-16', priceMultiplier: 1.3 },
  { id: '10inch', name: '10 inch', serves: 'serves 20-25', priceMultiplier: 1.6 },
  { id: '12inch', name: '12 inch', serves: 'serves 30-40', priceMultiplier: 2 },
  { id: 'tiered', name: 'Tiered', serves: 'custom serving size', priceMultiplier: 2.5 }
];

const Menu = () => {
  const theme = useTheme();
  const [category, setCategory] = useState('all');
  const [dietFilter, setDietFilter] = useState('all');
  const [selectedCake, setSelectedCake] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const { addToCart } = useCart();

  const filteredItems = (cakeItems || [])
    .filter(item => category === 'all' || item.category === category)
    .filter(item => dietFilter === 'all' || (item.dietary || []).includes(dietFilter));

  const handleAddToCart = (item) => {
    if (item.category === 'cakes') {
      setSelectedCake(item);
      setSelectedSize(null);
    } else {
      addToCart(item);
    }
  };

  const handleCakeSizeSelect = () => {
    if (selectedCake && selectedSize) {
      const cakeWithSize = {
        ...selectedCake,
        id: `${selectedCake.id}-${selectedSize.id}`, // Unique ID for each size
        price: selectedCake.price * selectedSize.priceMultiplier,
        size: selectedSize.name,
        serves: selectedSize.serves,
        name: `${selectedCake.name} (${selectedSize.name})`
      };
      
      addToCart(cakeWithSize);
      setSelectedCake(null);
      setSelectedSize(null);
    }
  };

  const closeModal = () => {
    setSelectedCake(null);
    setSelectedSize(null);
  };

  return (
    <>
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
            {['all', 'cakes', 'brownies', 'pastries', 'sourdough', 'others'].map(cat => (
              <CategoryTab key={cat} active={category === cat} onClick={() => setCategory(cat)}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </CategoryTab>
            ))}
          </CategoryTabs>

          <FilterTabs>
            <FilterButton active={dietFilter === 'all'} onClick={() => setDietFilter('all')}>All</FilterButton>
            {dietaryFilters.map(type => (
              <FilterButton key={type} active={dietFilter === type} onClick={() => setDietFilter(type)}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </FilterButton>
            ))}
          </FilterTabs>

          <MenuGrid>
            {filteredItems.map((item, index) => (
              <MenuItem
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <MenuItemImage
                  effect="blur"
                  src={item.image || '/placeholder.jpg'}
                  alt={item.name}
                />
                <MenuItemContent>
                  <MenuItemTitle>{item.name}</MenuItemTitle>
                  <MenuItemPriceRow>
                    <MenuItemPrice>
                      {item.category === 'cakes' ? 'From ' : ''}£{item.price.toFixed(2)}
                    </MenuItemPrice>
                    <div style={{ display: 'flex', gap: '0.3rem' }}>
                      {(item.dietary || []).map(type => (
                        <DietaryLabel key={type} type={type} />
                      ))}
                    </div>
                  </MenuItemPriceRow>
                  <MenuItemDescription>{item.description}</MenuItemDescription>
                  <AddToCartButton onClick={() => handleAddToCart(item)}>
                    {item.category === 'cakes' ? 'Choose Size' : 'Add to Cart'}
                  </AddToCartButton>
                </MenuItemContent>
              </MenuItem>
            ))}
          </MenuGrid>
        </MenuContainer>
      </MenuSection>

      {/* Cake Size Selection Modal */}
      <AnimatePresence>
        {selectedCake && (
          <ModalOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <ModalContent
              initial={{ y: -50, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -50, opacity: 0, scale: 0.9 }}
              onClick={e => e.stopPropagation()}
            >
              <ModalHeader>
                <h3>{selectedCake.name}</h3>
                <CloseButton onClick={closeModal}>
                  <FaTimes />
                </CloseButton>
              </ModalHeader>

              <ModalBody>
                <p style={{ marginBottom: '1.5rem', color: '#666' }}>
                  Choose your preferred cake size:
                </p>
                
                {cakeSizes.map(size => (
                  <SizeOption
                    key={size.id}
                    selected={selectedSize?.id === size.id}
                    onClick={() => setSelectedSize(size)}
                  >
                    <SizeInfo>
                      <h4>{size.name}</h4>
                      <p>{size.serves}</p>
                    </SizeInfo>
                    <SizePrice>
                      £{(selectedCake.price * size.priceMultiplier).toFixed(2)}
                    </SizePrice>
                  </SizeOption>
                ))}
              </ModalBody>

              <ModalFooter>
                <ModalButton onClick={closeModal}>
                  Cancel
                </ModalButton>
                <ModalButton 
                  primary 
                  onClick={handleCakeSizeSelect}
                  disabled={!selectedSize}
                >
                  Add to Cart
                </ModalButton>
              </ModalFooter>
            </ModalContent>
          </ModalOverlay>
        )}
      </AnimatePresence>
    </>
  );
};

export default Menu;