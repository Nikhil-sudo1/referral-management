# TeamLease EdTech Referral Portal - Frontend Dockerfile

# ---------- Build stage ----------
FROM node:18-alpine AS build

WORKDIR /app

# Accept build-time variable for API URL
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Copy dependency files
COPY package.json package-lock.json ./

RUN npm ci --no-audit --no-fund

# Copy source code
COPY . .

# Build for production
RUN npm run build


# ---------- Runtime stage ----------
FROM nginx:1.28-alpine

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
