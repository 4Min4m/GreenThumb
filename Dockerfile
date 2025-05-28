# Multi-stage build for optimized production image
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./

# Development stage
FROM base AS development
RUN npm ci
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# Build stage
FROM base AS build
RUN npm ci && npm cache clean --force
COPY . .
RUN npm run build

# Production stage - Using nginx with proper user setup
FROM nginx:alpine AS production

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy built app
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create nginx user directories with proper permissions
RUN mkdir -p /var/cache/nginx/client_temp && \
    mkdir -p /tmp/nginx && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /tmp/nginx && \
    chown -R nginx:nginx /usr/share/nginx/html

# Run as nginx user (already exists in nginx:alpine)
USER nginx

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]