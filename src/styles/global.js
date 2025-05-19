import { createGlobalStyle } from 'styled-components';
import 'leaflet/dist/leaflet.css';

export const GlobalStyles = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap');

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    font-size: 16px;
    scroll-behavior: smooth;
  }

  body {
    font-family: ${({ theme }) => theme.fonts.primary};
    line-height: 1.6;
    color: ${({ theme }) => theme.colors.text};
    background-color: #fff;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: ${({ theme }) => theme.fonts.secondary};
    font-weight: 600;
    line-height: 1.2;
    margin-bottom: 1rem;
  }

  h1 {
    font-size: 2.5rem;
  }

  h2 {
    font-size: 2rem;
  }

  h3 {
    font-size: 1.75rem;
  }

  h4 {
    font-size: 1.5rem;
  }

  h5 {
    font-size: 1.25rem;
  }

  p {
    margin-bottom: 1rem;
  }

  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
    transition: ${({ theme }) => theme.transitions.default};
    &:hover {
      color: ${({ theme }) => theme.colors.accent};
    }
  }

  img {
    max-width: 100%;
    height: auto;
    display: block;
  }

  ul, ol {
    margin-bottom: 1rem;
    padding-left: 1.5rem;
  }

  button, input, textarea, select {
    font-family: inherit;
    font-size: 1rem;
  }

  button {
    cursor: pointer;
    border: none;
    background: none;
  }

  .container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
  }

  .text-center {
    text-align: center;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .fade-in {
    animation: fadeIn 0.5s ease-in;
  }

  .leaflet-container {
    height: 100% !important;
    width: 100% !important;
    z-index: 0;
  }
`;
