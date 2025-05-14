# Stage 1: Builder stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install fixed versions of problematic packages first
RUN npm install ajv@8.11.0 ajv-keywords@5.1.0 --save-exact --no-package-lock

# Install Stripe dependencies explicitly
RUN npm install @stripe/react-stripe-js @stripe/stripe-js --save

# Install rest of the dependencies with legacy peer deps
RUN npm install --legacy-peer-deps


# Copy full application code
COPY . .

# Install server dependencies
RUN cd server && npm install

# Build React app
RUN npm run build

# Stage 2: Runtime stage
FROM node:18-alpine AS server

WORKDIR /app

# Copy server and frontend build output from builder stage
COPY --from=builder /app/server ./server
COPY --from=builder /app/build ./build
RUN ls -la /app/build || echo "Build directory missing"

# Install only production server dependencies
WORKDIR /app/server
RUN npm install --production
RUN npm install node-cron

# Set env to production
ENV NODE_ENV=production

WORKDIR /app

EXPOSE 5000

CMD ["node", "server/index.js"]