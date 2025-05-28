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

# Production stage - Proper non-root setup
FROM nginx:alpine AS production

# Create app user
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

# Create necessary directories with proper ownership
RUN mkdir -p /var/cache/nginx && \
    mkdir -p /var/log/nginx && \
    mkdir -p /var/run/nginx && \
    mkdir -p /tmp/nginx && \
    chown -R appuser:appgroup /var/cache/nginx && \
    chown -R appuser:appgroup /var/log/nginx && \
    chown -R appuser:appgroup /var/run && \
    chown -R appuser:appgroup /tmp/nginx && \
    chown -R appuser:appgroup /usr/share/nginx/html && \
    chown -R appuser:appgroup /etc/nginx/conf.d

# Copy built app
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx config that uses non-root paths
COPY nginx-nonroot.conf /etc/nginx/conf.d/default.conf

# Set ownership after copying
RUN chown -R appuser:appgroup /usr/share/nginx/html && \
    chown -R appuser:appgroup /etc/nginx/conf.d

USER appuser

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]