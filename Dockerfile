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

# Production stage - Simple approach that works
FROM nginx:alpine AS production

# Copy built app
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Don't change user - let nginx run as root in container
# This is acceptable for demo purposes and avoids permission issues

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]