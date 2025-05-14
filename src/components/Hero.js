import React from 'react';
import { Button, Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-scroll';
import styled from 'styled-components';

const HeroSection = styled.section`
  background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), 
              url('/images/hero-bg.jpg') center/cover no-repeat;
  min-height: 80vh;
  display: flex;
  align-items: center;
  color: white;
  text-align: center;
  padding: 2rem 0;
`;

const HeroTitle = styled.h1`
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.5rem;
  margin-bottom: 2rem;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
  
  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

const HeroButton = styled(Button)`
  padding: 0.75rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0.5rem 1rem;
  border-radius: 50px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  }
`;

const Hero = () => {
  return (
    <HeroSection className="hero">
      <Container>
        <Row className="justify-content-center">
          <Col lg={10} xl={8}>
            <HeroTitle>Delicious Artisan Cakes</HeroTitle>
            <HeroSubtitle>
              Handcrafted with love using the finest ingredients for your special occasions
            </HeroSubtitle>
            <div className="d-flex justify-content-center flex-wrap">
              <Link to="menu" smooth={true} duration={500}>
                <HeroButton variant="primary" className="me-2 mb-2">
                  View Our Menu
                </HeroButton>
              </Link>
              <Link to="contact" smooth={true} duration={500}>
                <HeroButton variant="outline-light" className="mb-2">
                  Order Now
                </HeroButton>
              </Link>
            </div>
          </Col>
        </Row>
      </Container>
    </HeroSection>
  );
};

export default Hero;
