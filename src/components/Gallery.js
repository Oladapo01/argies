import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import InstagramFeed from './InstagramFeed';

const GallerySection = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  padding: 4rem 0;
`;

const GalleryContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
`;

const GalleryTitle = styled(motion.h2)`
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.colors.primary};
`;

const GallerySubtitle = styled(motion.p)`
  text-align: center;
  margin-bottom: 3rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
`;

const GalleryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 3rem;
`;

const GalleryImage = styled(motion.div)`
  height: 250px;
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
`;

const Gallery = () => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  // Sample gallery images (would be replaced with actual images)
  const galleryImages = [
    'https://placeholder-image.com/cake-gallery1.jpg',
    'https://placeholder-image.com/cake-gallery2.jpg',
    'https://placeholder-image.com/cake-gallery3.jpg',
    'https://placeholder-image.com/cake-gallery4.jpg',
    'https://placeholder-image.com/cake-gallery5.jpg',
    'https://placeholder-image.com/cake-gallery6.jpg',
    'https://placeholder-image.com/cake-gallery7.jpg',
    'https://placeholder-image.com/cake-gallery8.jpg',
  ];

  return (
    <GallerySection>
      <GalleryContainer>
        <GalleryTitle
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          Gallery
        </GalleryTitle>
        
        <GallerySubtitle
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Check out our delicious creations and get inspired for your next celebration.
        </GallerySubtitle>
        
        <GalleryGrid>
          {galleryImages.map((image, index) => (
            <GalleryImage
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <img src={image} alt={`Gallery item ${index + 1}`} />
            </GalleryImage>
          ))}
        </GalleryGrid>
        
        <InstagramFeed />
      </GalleryContainer>
    </GallerySection>
  );
};

export default Gallery;