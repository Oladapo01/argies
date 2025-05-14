# First stage: Build the application
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/

# Install root dependencies (for React)
RUN npm install

# Install server dependencies
RUN cd server && npm install

# Copy application code
COPY . .

# Build the React app
RUN npm run build || echo "Build failed, but continuing"

# Second stage: Run the Node.js server
FROM node:18-alpine AS server

WORKDIR /app

# Copy package files for server only
COPY server/package*.json ./server/

# Install production dependencies only
RUN cd server && npm install --only=production

# Copy built React app and server code
COPY --from=build /app/build ./build
COPY --from=build /app/server ./server

# Set environment to production
ENV NODE_ENV=production

# Expose the port the app runs on
EXPOSE 5000

# Command to run the application
CMD ["node", "server/index.js"]

# Third stage: Nginx for serving static files
FROM nginx:alpine AS nginx

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]