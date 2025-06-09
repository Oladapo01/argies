import React from 'react';
import styled from 'styled-components';
import { FaLeaf, FaSeedling, FaBreadSlice, FaTintSlash } from 'react-icons/fa';

const LabelContainer = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background-color: ${({ type }) =>
    type === 'vegan' ? '#66bb6a' :
    type === 'vegetarian' ? '#43a047' :
    type === 'gluten-free' ? '#42a5f5' :
    type === 'dairy-free' ? '#ab47bc' :
    '#ccc'};
  color: white;
  font-size: 0.75rem;
  padding: 0.3rem 0.6rem;
  border-radius: 15px;
  font-weight: 600;
  white-space: nowrap;
`;

const IconWrapper = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const getIcon = (type) => {
  switch (type) {
    case 'vegan':
      return <FaLeaf />;
    case 'vegetarian':
      return <FaSeedling />;
    case 'gluten-free':
      return <FaBreadSlice />;
    case 'dairy-free':
      return <FaTintSlash />;
    default:
      return null;
  }
};

const DietaryLabel = ({ type }) => {
  const labelText = {
    vegan: 'Vegan',
    vegetarian: 'Vegetarian',
    'gluten-free': 'Gluten-Free',
    'dairy-free': 'Dairy-Free'
  };

  return (
    <LabelContainer type={type}>
      <IconWrapper>{getIcon(type)}</IconWrapper>
      {labelText[type]}
    </LabelContainer>
  );
};

export default DietaryLabel;
