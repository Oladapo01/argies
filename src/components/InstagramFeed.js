import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import axios from 'axios';

const InstagramSection = styled.div`
  margin-top: 4rem;
`;

const InstagramTitle = styled.h3`
  text-align: center;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
`;

const InstagramGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
`;

const InstagramPost = styled(motion.a)`
  position: relative;
  height: 200px;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }
  
  &:hover img {
    transform: scale(1.05);
  }
  
  &:hover .overlay {
    opacity: 1;
  }
`;

const Overlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 0.5rem;
  opacity: 0;
  transition: opacity 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
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

const InstagramFeed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInstagramFeed = async () => {
      try {
        setLoading(true);
        // In a production environment, this would call your backend API
        const response = await axios.get('/api/instagram-feed');
        
        // Get the first 8 most recent posts
        const recentPosts = response.data?.data?.slice(0, 8) || [];
        setPosts(recentPosts);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching Instagram feed:", err);
        setError("Failed to load Instagram feed. Please try again later.");
        setLoading(false);
        
        // In development, we'll fall back to simulated data
        const simulatedPosts = [
          {
            id: 'post1',
            media_url: 'https://placeholder-image.com/instagram1.jpg',
            permalink: 'https://instagram.com/p/1',
            caption: 'Delicious strawberry cake for a special birthday!'
          },
          {
            id: 'post2',
            media_url: 'https://placeholder-image.com/instagram2.jpg',
            permalink: 'https://instagram.com/p/2',
            caption: 'Our new chocolate truffle cupcakes!'
          },
          {
            id: 'post3',
            media_url: 'https://placeholder-image.com/instagram3.jpg',
            permalink: 'https://instagram.com/p/3',
            caption: 'Wedding cake elegance'
          },
          {
            id: 'post4',
            media_url: 'https://placeholder-image.com/instagram4.jpg',
            permalink: 'https://instagram.com/p/4',
            caption: 'Fresh batch of macarons just came out!'
          },
          {
            id: 'post5',
            media_url: 'https://placeholder-image.com/instagram5.jpg',
            permalink: 'https://instagram.com/p/5',
            caption: 'Custom birthday cake with edible flowers'
          },
          {
            id: 'post6',
            media_url: 'https://placeholder-image.com/instagram6.jpg',
            permalink: 'https://instagram.com/p/6',
            caption: 'Chocolate fountain party!'
          },
          {
            id: 'post7',
            media_url: 'https://placeholder-image.com/instagram7.jpg',
            permalink: 'https://instagram.com/p/7',
            caption: 'New bakery display case just installed!'
          },
          {
            id: 'post8',
            media_url: 'https://placeholder-image.com/instagram8.jpg',
            permalink: 'https://instagram.com/p/8',
            caption: 'Happy customers enjoying our pastries'
          }
        ];
        
        setPosts(simulatedPosts);
        setLoading(false);
      }
    };

    fetchInstagramFeed();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error && posts.length === 0) {
    return <ErrorMessage>{error}</ErrorMessage>;
  }

  return (
    <InstagramSection>
      <InstagramTitle>Follow us on Instagram</InstagramTitle>
      
      <InstagramGrid>
        {posts.map((post, index) => (
          <InstagramPost 
            key={post.id} 
            href={post.permalink} 
            target="_blank" 
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <img src={post.media_url} alt={post.caption || 'Instagram post'} />
            <Overlay className="overlay">
              <span>View on Instagram</span>
            </Overlay>
          </InstagramPost>
        ))}
      </InstagramGrid>
    </InstagramSection>
  );
};

export default InstagramFeed;