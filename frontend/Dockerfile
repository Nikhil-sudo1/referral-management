# ---------- Build stage ----------
FROM node:18-alpine AS build

WORKDIR /app

# Build-time env for Vite (supports both variable names)
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_API_BASE_URL=$VITE_API_URL

# Copy dependency files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --no-audit --no-fund

# Copy rest of the source
COPY . .

# Build the Vite app
RUN npm run build


# ---------- Runtime stage ----------
FROM nginx:1.28-alpine

# Remove default config
RUN rm /etc/nginx/conf.d/default.conf

# Custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 3001

# Health check for ALB
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
