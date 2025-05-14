import { useState, useEffect } from 'react';
import axios from 'axios';

const useInstagram = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInstagramFeed = async () => {
      try {
        // In a production environment, you would call your backend API
        // that securely handles Instagram API tokens and requests
        
        // For now, we'll simulate Instagram data
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
          }
        ];
        
        // Wait a bit to simulate network request
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setPosts(simulatedPosts);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching Instagram feed:", err);
        setError(err);
        setLoading(false);
      }
    };

    fetchInstagramFeed();
  }, []);

  return { posts, loading, error };
};

export default useInstagram;