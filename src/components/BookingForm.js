// src/components/BookingForm.js
import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';

const BookingSection = styled.div`
  background-color: ${({ theme }) => theme.colors.secondary};
  padding: 4rem 0;
`;

const BookingContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
`;

const BookingTitle = styled(motion.h2)`
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.colors.primary};
`;

const BookingSubtitle = styled(motion.p)`
  text-align: center;
  margin-bottom: 3rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
`;

const BookingFormStyled = styled(Form)`
  max-width: 800px;
  margin: 0 auto;
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
`;

const FormSection = styled.div`
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px dashed #eee;
  
  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
`;

const SectionTitle = styled.h3`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 1.5rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  
  @media (min-width: ${({ theme }) => theme.breakpoints.tablet}) {
    grid-template-columns: ${({ columns }) => columns || '1fr 1fr'};
  }
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
`;

const Input = styled(Field)`
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

const TextArea = styled(Field)`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 5px;
  font-family: inherit;
  resize: vertical;
  min-height: 100px;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const Select = styled(Field)`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 5px;
  font-family: inherit;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23333' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 16px;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const DatePickerWrapper = styled.div`
  .react-datepicker-wrapper {
    width: 100%;
  }
  
  .react-datepicker__input-container input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #e0e0e0;
    border-radius: 5px;
    font-family: inherit;
    
    &:focus {
      outline: none;
      border-color: ${({ theme }) => theme.colors.primary};
    }
  }
`;

const RadioGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 0.5rem;
`;

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
  
  input {
    margin-right: 0.5rem;
  }
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: flex-start;
  cursor: pointer;
  
  input {
    margin-right: 0.5rem;
    margin-top: 0.25rem;
  }
`;

const CardElementContainer = styled.div`
  border: 1px solid #e0e0e0;
  border-radius: 5px;
  padding: 0.75rem;
  margin-top: 0.5rem;
`;

const ErrorText = styled.div`
  color: red;
  font-size: 0.85rem;
  margin-top: 0.5rem;
`;

const SubmitButton = styled(motion.button)`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: block;
  margin: 2rem auto 0;
  
  &:hover {
    background: ${({ theme }) => theme.colors.accent};
  }
  
  &:disabled {
    background: #cccccc;
    cursor: not-allowed;
  }
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 1rem;
  height: 1rem;
  margin-right: 0.5rem;
  
  &:after {
    content: " ";
    display: block;
    width: 0.8rem;
    height: 0.8rem;
    border-radius: 50%;
    border: 2px solid #fff;
    border-color: #fff transparent #fff transparent;
    animation: spinner 1.2s linear infinite;
  }
  
  @keyframes spinner {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const SuccessMessage = styled(motion.div)`
  background-color: #e6f7e6;
  color: #2e7d32;
  padding: 1.5rem;
  border-radius: 10px;
  margin-top: 2rem;
  text-align: center;
`;

const BookingReference = styled.p`
  font-size: 1.2rem;
  font-weight: 600;
  margin: 1rem 0;
`;

// Validation schema
const BookingSchema = Yup.object().shape({
  customerName: Yup.string()
    .min(2, 'Name too short!')
    .max(50, 'Name too long!')
    .required('Name is required'),
  customerEmail: Yup.string()
    .email('Invalid email')
    .required('Email is required'),
  customerPhone: Yup.string()
    .matches(/^[0-9+\-\s()]*$/, 'Invalid phone number')
    .min(7, 'Phone number too short'),
  cakeType: Yup.string()
    .required('Cake type is required'),
  cakeSize: Yup.string()
    .required('Cake size is required'),
  cakeFlavor: Yup.string()
    .required('Cake flavor is required'),
  deliveryDate: Yup.date()
    .min(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), 'Date must be at least 2 days from now')
    .required('Delivery date is required'),
  deliveryMethod: Yup.string()
    .required('Delivery method is required'),
  deliveryAddress: Yup.string()
    .when('deliveryMethod', {
      is: 'delivery',
      then: Yup.string().required('Delivery address is required for delivery'),
    }),
  specialRequests: Yup.string()
    .max(500, 'Special requests too long'),
  agreeToTerms: Yup.boolean()
    .oneOf([true], 'You must agree to the terms and conditions')
});

const BookingForm = () => {
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  const [serverError, setServerError] = useState(null);
  
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1
  });
  
  const stripe = useStripe();
  const elements = useElements();
  
  const initialValues = {
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    cakeType: '',
    cakeSize: '',
    cakeFlavor: '',
    deliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Default to 3 days from now
    deliveryMethod: 'pickup',
    deliveryAddress: '',
    specialRequests: '',
    agreeToTerms: false
  };

  // Calculate minimum date (2 days from now)
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 2);

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      setServerError(null);
      
      if (!stripe || !elements) {
        throw new Error('Stripe has not loaded yet. Please try again.');
      }
      
      // Create payment method
      const cardElement = elements.getElement(CardElement);
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Send booking data to server
      const response = await axios.post('/api/bookings', {
        ...values,
        paymentMethodId: paymentMethod.id
      });
      
      if (response.data.success) {
        setBookingSuccess(true);
        setBookingId(response.data.bookingId);
        resetForm();
        cardElement.clear();
        
        // Scroll to success message
        setTimeout(() => {
          document.getElementById('booking-success')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        throw new Error(response.data.message || 'Error processing booking');
      }
    } catch (error) {
      console.error('Booking error:', error);
      setServerError(error.message || 'Something went wrong. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <BookingSection>
      <BookingContainer>
        <BookingTitle
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          Book a Custom Cake
        </BookingTitle>
        
        <BookingSubtitle
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Fill out the form below to order a custom cake for your special occasion.
        </BookingSubtitle>
        
        {bookingSuccess ? (
          <SuccessMessage
            id="booking-success"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h3>Thank You for Your Booking!</h3>
            <BookingReference>Booking Reference: #{bookingId}</BookingReference>
            <p>We've received your cake booking and a confirmation has been sent to your email.</p>
            <p>We'll be in touch soon to confirm all the details of your order.</p>
          </SuccessMessage>
        ) : (
          <Formik
            initialValues={initialValues}
            validationSchema={BookingSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, values, setFieldValue }) => (
              <BookingFormStyled>
                <FormSection>
                  <SectionTitle>Your Information</SectionTitle>
                  <FormRow>
                    <FormGroup>
                      <Label htmlFor="customerName">Name *</Label>
                      <Input type="text" id="customerName" name="customerName" />
                      <ErrorMessage name="customerName" component={ErrorText} />
                    </FormGroup>
                    
                    <FormGroup>
                      <Label htmlFor="customerEmail">Email *</Label>
                      <Input type="email" id="customerEmail" name="customerEmail" />
                      <ErrorMessage name="customerEmail" component={ErrorText} />
                    </FormGroup>
                  </FormRow>
                  
                  <FormGroup>
                    <Label htmlFor="customerPhone">Phone (optional)</Label>
                    <Input type="tel" id="customerPhone" name="customerPhone" />
                    <ErrorMessage name="customerPhone" component={ErrorText} />
                  </FormGroup>
                </FormSection>
                
                <FormSection>
                  <SectionTitle>Cake Details</SectionTitle>
                  <FormGroup>
                    <Label htmlFor="cakeType">Cake Type *</Label>
                    <Select as="select" id="cakeType" name="cakeType">
                      <option value="">Select a cake type</option>
                      <option value="Birthday Cake">Birthday Cake</option>
                      <option value="Wedding Cake">Wedding Cake</option>
                      <option value="Anniversary Cake">Anniversary Cake</option>
                      <option value="Custom Cake">Custom Cake</option>
                      <option value="Cupcakes">Cupcakes</option>
                    </Select>
                    <ErrorMessage name="cakeType" component={ErrorText} />
                  </FormGroup>
                  
                  <FormRow>
                    <FormGroup>
                      <Label htmlFor="cakeSize">Cake Size *</Label>
                      <Select as="select" id="cakeSize" name="cakeSize">
                        <option value="">Select a size</option>
                        <option value="6 inch">6 inch (serves 8-10)</option>
                        <option value="8 inch">8 inch (serves 12-16)</option>
                        <option value="10 inch">10 inch (serves 20-25)</option>
                        <option value="12 inch">12 inch (serves 30-40)</option>
                        <option value="Tiered">Tiered (please specify in special requests)</option>
                      </Select>
                      <ErrorMessage name="cakeSize" component={ErrorText} />
                    </FormGroup>
                    
                    <FormGroup>
                      <Label htmlFor="cakeFlavor">Cake Flavor *</Label>
                      <Select as="select" id="cakeFlavor" name="cakeFlavor">
                        <option value="">Select a flavor</option>
                        <option value="Vanilla">Vanilla</option>
                        <option value="Chocolate">Chocolate</option>
                        <option value="Red Velvet">Red Velvet</option>
                        <option value="Carrot">Carrot</option>
                        <option value="Lemon">Lemon</option>
                        <option value="Strawberry">Strawberry</option>
                        <option value="Custom">Custom (please specify in special requests)</option>
                      </Select>
                      <ErrorMessage name="cakeFlavor" component={ErrorText} />
                    </FormGroup>
                  </FormRow>
                  
                  <FormGroup>
                    <Label htmlFor="specialRequests">Special Requests or Instructions</Label>
                    <TextArea
                      as="textarea"
                      id="specialRequests"
                      name="specialRequests"
                      placeholder="Please provide any special design requests, dietary requirements, inscriptions, etc."
                    />
                    <ErrorMessage name="specialRequests" component={ErrorText} />
                  </FormGroup>
                </FormSection>
                
                <FormSection>
                  <SectionTitle>Delivery Information</SectionTitle>
                  <FormGroup>
                    <Label htmlFor="deliveryDate">Delivery/Pickup Date *</Label>
                    <DatePickerWrapper>
                      <DatePicker
                        selected={values.deliveryDate}
                        onChange={date => setFieldValue('deliveryDate', date)}
                        minDate={minDate}
                        dateFormat="MMMM d, yyyy"
                        id="deliveryDate"
                      />
                    </DatePickerWrapper>
                    <ErrorMessage name="deliveryDate" component={ErrorText} />
                  </FormGroup>
                  
                  <FormGroup>
                    <Label>Delivery Method *</Label>
                    <RadioGroup>
                      <RadioLabel>
                        <Field
                          type="radio"
                          name="deliveryMethod"
                          value="pickup"
                        />
                        Pickup (Free)
                      </RadioLabel>
                      <RadioLabel>
                        <Field
                          type="radio"
                          name="deliveryMethod"
                          value="delivery"
                        />
                        Delivery ($15 fee within 10 miles)
                      </RadioLabel>
                    </RadioGroup>
                    <ErrorMessage name="deliveryMethod" component={ErrorText} />
                  </FormGroup>
                  
                  {values.deliveryMethod === 'delivery' && (
                    <FormGroup>
                      <Label htmlFor="deliveryAddress">Delivery Address *</Label>
                      <TextArea
                        as="textarea"
                        id="deliveryAddress"
                        name="deliveryAddress"
                        placeholder="Please provide your full address including street, city, state, and zip code"
                      />
                      <ErrorMessage name="deliveryAddress" component={ErrorText} />
                    </FormGroup>
                  )}
                </FormSection>
                
                <FormSection>
                  <SectionTitle>Payment Information</SectionTitle>
                  <p>A 50% deposit is required to secure your booking. The remaining balance will be due upon pickup or delivery.</p>
                  
                  <FormGroup>
                    <Label htmlFor="card-element">Credit or Debit Card *</Label>
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
                  </FormGroup>
                  
                  <FormGroup>
                    <CheckboxLabel>
                      <Field
                        type="checkbox"
                        name="agreeToTerms"
                      />
                      <span>
                        I agree to the <a href="/terms" target="_blank">terms and conditions</a>, including the cancellation and refund policy.
                      </span>
                    </CheckboxLabel>
                    <ErrorMessage name="agreeToTerms" component={ErrorText} />
                  </FormGroup>
                </FormSection>
                
                {serverError && (
                  <ErrorText style={{ textAlign: 'center', marginTop: '1rem' }}>
                    {serverError}
                  </ErrorText>
                )}
                
                <SubmitButton
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isSubmitting ? (
                    <>
                      <LoadingSpinner />
                      Processing...
                    </>
                  ) : 'Book Now'}
                </SubmitButton>
              </BookingFormStyled>
            )}
          </Formik>
        )}
      </BookingContainer>
    </BookingSection>
  );
};

export default BookingForm;