# ---------- Build stage ----------
FROM node:18-alpine AS build

WORKDIR /app

# Build-time argument from CodeBuild
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Copy dependency files
COPY package.json package-lock.json ./

RUN npm ci --no-audit --no-fund

# Copy source
COPY . .

# Build Vite app
RUN npm run build


# ---------- Runtime stage ----------
FROM nginx:1.28-alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

# Health check for ALB
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
