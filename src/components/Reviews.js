import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FaStar, FaStarHalfAlt, FaGoogle } from 'react-icons/fa';
import axios from 'axios';

const ReviewsSection = styled.div`
  background-color: ${({ theme }) => theme.colors.secondary};
  padding: 4rem 0;
`;

const ReviewsContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
`;

const ReviewsTitle = styled(motion.h2)`
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.colors.primary};
`;

const ReviewsSubtitle = styled(motion.p)`
  text-align: center;
  margin-bottom: 3rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
`;

const ReviewsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  
  @media (min-width: ${({ theme }) => theme.breakpoints.tablet}) {
    flex-direction: row;
  }
`;

const ReviewCard = styled(motion.div)`
  background: white;
  border-radius: 10px;
  padding: 2rem;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const ReviewHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const ReviewAuthor = styled.div`
  font-weight: 500;
`;

const GoogleLogo = styled.div`
  display: flex;
  align-items: center;
  color: #4285F4;
  
  svg {
    margin-left: 0.5rem;
  }
`;

const Stars = styled.div`
  color: #FFBA00;
  margin-bottom: 1rem;
  display: flex;
`;

const ReviewText = styled.div`
  margin-bottom: 1rem;
  flex-grow: 1;
`;

const ReviewDate = styled.div`
  font-size: 0.8rem;
  color: #777;
  text-align: right;
`;

const LoadMoreButton = styled(motion.button)`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: block;
  margin: 3rem auto 0;
  
  &:hover {
    background: ${({ theme }) => theme.colors.accent};
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  
  &:after {
    content: " ";
    display: block;
    width: 40px;
    height: 40px;
    margin: 8px;
    border-radius: 50%;
    border: 6px solid ${({ theme }) => theme.colors.primary};
    border-color: ${({ theme }) => theme.colors.primary} transparent;
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

const ErrorMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: #d32f2f;
`;

// Format timestamp to relative time (e.g., "2 days ago")
const formatRelativeTime = (timestamp) => {
  const now = new Date();
  const date = new Date(timestamp);
  const seconds = Math.floor((now - date) / 1000);
  
  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) {
    return interval === 1 ? "1 year ago" : `${interval} years ago`;
  }
  
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) {
    return interval === 1 ? "1 month ago" : `${interval} months ago`;
  }
  
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) {
    return interval === 1 ? "1 day ago" : `${interval} days ago`;
  }
  
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) {
    return interval === 1 ? "1 hour ago" : `${interval} hours ago`;
  }
  
  interval = Math.floor(seconds / 60);
  if (interval >= 1) {
    return interval === 1 ? "1 minute ago" : `${interval} minutes ago`;
  }
  
  return "just now";
};

// Render star ratings
const renderStars = (rating) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  
  for (let i = 0; i < fullStars; i++) {
    stars.push(<FaStar key={`full-${i}`} />);
  }
  
  if (hasHalfStar) {
    stars.push(<FaStarHalfAlt key="half" />);
  }
  
  return stars;
};

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [visibleReviews, setVisibleReviews] = useState(3);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        // In a production environment, this would call your backend API
        const response = await axios.get('/api/google-reviews');
        setReviews(response.data.reviews || []);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching Google reviews:", err);
        setError("Failed to load reviews. Please try again later.");
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const loadMoreReviews = () => {
    setVisibleReviews(prev => Math.min(prev + 3, reviews.length));
  };

  if (loading) {
    return (
      <ReviewsSection>
        <ReviewsContainer>
          <ReviewsTitle
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            What Our Customers Say
          </ReviewsTitle>
          <LoadingSpinner />
        </ReviewsContainer>
      </ReviewsSection>
    );
  }

  if (error) {
    return (
      <ReviewsSection>
        <ReviewsContainer>
          <ReviewsTitle
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            What Our Customers Say
          </ReviewsTitle>
          <ErrorMessage>{error}</ErrorMessage>
        </ReviewsContainer>
      </ReviewsSection>
    );
  }

  return (
    <ReviewsSection>
      <ReviewsContainer>
        <ReviewsTitle
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          What Our Customers Say
        </ReviewsTitle>
        
        <ReviewsSubtitle
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Read what our happy customers have to say about our cakes and service
        </ReviewsSubtitle>
        
        <ReviewsWrapper>
          {(reviews || []).slice(0, visibleReviews).map((review, index) => (
            <ReviewCard
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <ReviewHeader>
                <ReviewAuthor>{review.author_name}</ReviewAuthor>
                <GoogleLogo>
                  <FaGoogle />
                </GoogleLogo>
              </ReviewHeader>
              
              <Stars>
                {renderStars(review.rating)}
              </Stars>
              
              <ReviewText>
                "{review.text}"
              </ReviewText>
              
              <ReviewDate>
                {formatRelativeTime(review.time)}
              </ReviewDate>
            </ReviewCard>
          ))}
        </ReviewsWrapper>
        
        {visibleReviews < reviews.length && (
          <LoadMoreButton
            onClick={loadMoreReviews}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Load More Reviews
          </LoadMoreButton>
        )}
      </ReviewsContainer>
    </ReviewsSection>
  );
};

export default Reviews;