import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import { FaEnvelope, FaMapMarkerAlt, FaWhatsapp } from 'react-icons/fa';
import styled from 'styled-components';

const ContactSection = styled.section`
  padding: 5rem 0;
  background-color: #f9f9f9;
`;

const SectionTitle = styled.h2`
  text-align: center;
  margin-bottom: 3rem;
  font-weight: 700;
  color: #333;
`;

const ContactInfo = styled.div`
  margin-bottom: 2rem;
  
  h3 {
    color:rgb(227, 151, 199);
    margin-bottom: 1.5rem;
  }
  
  p {
    margin-bottom: 1.5rem;
    display: flex;
    align-items: flex-start;
    
    svg {
      margin-right: 1rem;
      color:rgb(227, 151, 199);
      margin-top: 0.25rem;
    }
  }
`;

const ContactForm = styled(Form)`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.05);
  
  .form-control {
    padding: 0.75rem;
    margin-bottom: 1.5rem;
    border: 1px solid #eee;
    width: 100%;
    
    &:focus {
      border-color:rgb(227, 151, 199);
      box-shadow: 0 0 0 0.25rem rgb(227, 151, 199);
    }
  }
  
  textarea.form-control {
    min-height: 150px;
    resize: vertical;
  }
  .form-label {
    font-weight: 500;
    margin-bottom: 0.5rem;
    display: block;
  }
  
  .row {
    margin-left: -0.75rem;
    margin-right: -0.75rem;
  }
  
  [class*="col-"] {
    padding-left: 0.75rem;
    padding-right: 0.75rem;
  }
`;

const SubmitButton = styled(Button)`
  background-color:rgb(227, 151, 199);
  border: none;
  padding: 0.75rem 2rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: all 0.3s ease;
  
  &:hover, &:focus {
    background-color:rgb(227, 151, 199);
    transform: translateY(-2px);
  }
`;

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.message) {
      setError('Please fill in all required fields');
      return;
    }
    
    try {
      // In a real app, you would send this to your backend
      console.log('Form submitted:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
      
      // Reset success message after 5 seconds
      setTimeout(() => setSubmitted(false), 5000);
      
    } catch (err) {
      setError('Failed to send message. Please try again later.');
      console.error('Error submitting form:', err);
    }
  };

  return (
    <ContactSection id="contact">
      <Container>
        <SectionTitle>Get In Touch</SectionTitle>
        <Row>
          <Col lg={5} className="mb-4 mb-lg-0">
            <ContactInfo>
              <h3>Contact Information</h3>
              <p>
                <FaMapMarkerAlt />
                <span>94 Percy Road, Southampton. SO16 4LN</span>
              </p>
              <p>
                <FaWhatsapp />
                  <span>
                    <a 
                      href="https://wa.me/447411938696"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'inherit', textDecoration: 'none' }}
                    >
                      07411938696
                    </a>
                  </span>
              </p>
              <p>
                <FaEnvelope />
                <span>info@argiescakes.co.uk</span>
              </p>
              <p>
                <strong>Business Hours:</strong><br />
                Monday - Friday: 8:00 AM - 7:00 PM<br />
                Saturday: 9:00 AM - 5:00 PM<br />
                Sunday: 10:00 AM - 4:00 PM
              </p>
            </ContactInfo>
          </Col>
          <Col lg={7}>
            <ContactForm onSubmit={handleSubmit}>
              {submitted && (
                <Alert variant="success" className="mb-4">
                  Thank you for your message! We'll get back to you soon.
                </Alert>
              )}
              {error && (
                <Alert variant="danger" className="mb-4">
                  {error}
                </Alert>
              )}
              <Row>
                <Col md={6}>
                  <Form.Group controlId="formName">
                    <Form.Label>Name *</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your name"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="formEmail">
                    <Form.Label>Email *</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Your email"
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group controlId="formPhone">
                    <Form.Label>Phone</Form.Label>
                    <Form.Control
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Your phone number"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="formSubject">
                    <Form.Label>Subject</Form.Label>
                    <Form.Control
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="Subject"
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group controlId="formMessage">
                <Form.Label>Message *</Form.Label>
                <Form.Control
                  as="textarea"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Your message"
                  required
                />
              </Form.Group>
              <div className="text-center">
                <SubmitButton type="submit" size="lg">
                  Send Message
                </SubmitButton>
              </div>
            </ContactForm>
          </Col>
        </Row>
      </Container>
    </ContactSection>
  );
};

export default Contact;
