import React, { useRef } from 'react';
import { ThemeProvider } from 'styled-components';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { BrowserRouter as Router } from 'react-router-dom'; 
import Navigation from './components/Navigation';
import Hero from './components/Hero';
import Menu from './components/Menu';
import Gallery from './components/Gallery';
import Reviews from './components/Reviews';
import Contact from './components/Contact';
import Map from './components/Map';
import Footer from './components/Footer';
import theme from './styles/theme';
import { GlobalStyles } from './styles/global';

// Initialize Stripe
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

function App() {
  // Refs for smooth scrolling
  const menuRef = useRef(null);
  const galleryRef = useRef(null);
  const reviewsRef = useRef(null);
  const contactRef = useRef(null);
  const mapRef = useRef(null);

  // Section refs for navigation
  const sections = {
    menu: menuRef,
    gallery: galleryRef,
    reviews: reviewsRef,
    contact: contactRef,
    location: mapRef
  };

  return (
    <Router>
      <ThemeProvider theme={theme}>
      <GlobalStyles />
      <Elements stripe={stripePromise}>
        <div className="App">
          <Navigation sections={sections} />
          <Hero />
          <section ref={menuRef} id="menu">
            <Menu />
          </section>
          <section ref={galleryRef} id="gallery">
            <Gallery />
          </section>
          <section ref={reviewsRef} id="reviews">
            <Reviews />
          </section>
          <section ref={contactRef} id="contact">
            <Contact />
          </section>
          <section ref={mapRef} id="location">
            <Map
             tileServer={process.env.REACT_APP_TILE_SERVER}
             attribution={process.env.REACT_APP_TILE_ATTRIBUTION}/>
          </section>
          <Footer />
        </div>
      </Elements>
    </ThemeProvider>
    </Router>
    
  );
}

export default App;