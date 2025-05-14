import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { FaFacebook, FaInstagram, FaTwitter, FaYelp } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const FooterSection = styled.footer`
  background-color: #2c3e50;
  color: #ecf0f1;
  padding: 4rem 0 2rem;
  margin-top: 4rem;
`;

const FooterTitle = styled.h4`
  color: #d4a76a;
  margin-bottom: 1.5rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const FooterText = styled.p`
  margin-bottom: 1.5rem;
  line-height: 1.8;
`;

const FooterLink = styled(Link)`
  color: #bdc3c7;
  display: block;
  margin-bottom: 0.75rem;
  text-decoration: none;
  transition: all 0.3s ease;
  
  &:hover {
    color: #d4a76a;
    padding-left: 5px;
  }
`;

const SocialIcons = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  
  a {
    color: #ecf0f1;
    font-size: 1.5rem;
    transition: all 0.3s ease;
    
    &:hover {
      color: #d4a76a;
      transform: translateY(-3px);
    }
  }
`;

const Copyright = styled.div`
  text-align: center;
  padding-top: 2rem;
  margin-top: 3rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 0.9rem;
  color: #7f8c8d;
`;

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <FooterSection>
      <Container>
        <Row>
          <Col lg={4} className="mb-5 mb-lg-0">
            <FooterTitle>Argie's Cakes</FooterTitle>
            <FooterText>
              Creating delicious, handcrafted cakes and pastries for all your special occasions.
              Made with love and the finest ingredients.
            </FooterText>
            <SocialIcons>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                <FaFacebook />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                <FaInstagram />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                <FaTwitter />
              </a>
              <a href="https://yelp.com" target="_blank" rel="noopener noreferrer">
                <FaYelp />
              </a>
            </SocialIcons>
          </Col>
          
          <Col md={4} lg={2} className="mb-4 mb-md-0">
            <FooterTitle>Quick Links</FooterTitle>
            <FooterLink to="/">Home</FooterLink>
            <FooterLink to="/menu">Our Menu</FooterLink>
            <FooterLink to="/gallery">Gallery</FooterLink>
            <FooterLink to="/about">About Us</FooterLink>
            <FooterLink to="/contact">Contact</FooterLink>
          </Col>
          
          <Col md={4} lg={3} className="mb-4 mb-md-0">
            <FooterTitle>Our Menu</FooterTitle>
            <FooterLink to="/menu/cakes">Custom Cakes</FooterLink>
            <FooterLink to="/menu/cupcakes">Cupcakes</FooterLink>
            <FooterLink to="/menu/pastries">Pastries</FooterLink>
            <FooterLink to="/menu/desserts">Desserts</FooterLink>
            <FooterLink to="/menu/seasonal">Seasonal Specials</FooterLink>
          </Col>
          
          <Col md={4} lg={3}>
            <FooterTitle>Contact Us</FooterTitle>
            <FooterText>
              123 Bakery Street<br />
              Sweetville, XY 12345<br />
              <br />
              Phone: (555) 123-4567<br />
              Email: info@argiesbakery.com
            </FooterText>
          </Col>
        </Row>
        
        <Copyright>
          &copy; {currentYear} Argie's Cakes. All rights reserved.
        </Copyright>
      </Container>
    </FooterSection>
  );
};

export default Footer;
