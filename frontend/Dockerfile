# TeamLease EdTech Referral Portal - Frontend Dockerfile

# ---------- Build stage ----------
FROM 163742846785.dkr.ecr.ap-south-1.amazonaws.com/node18-alpine-base-image@sha256:d5e0c888cddec92e5410bb40a67b14ebfc08cd4d4f97c9bf7b374d56b9f5c1f4 AS build

WORKDIR /app

# Accept VITE_API_URL from buildspec.yml (must match --build-arg name)
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_API_BASE_URL=$VITE_API_URL

# Copy dependency files
COPY package.json package-lock.json ./

RUN npm ci --no-audit --no-fund

# Copy source code
COPY . .

# Build for production
RUN npm run build


# ---------- Runtime stage ----------
FROM 163742846785.dkr.ecr.ap-south-1.amazonaws.com/nginx-alpine@sha256:60e48a050b6408d0c5dd59b98b6e36bf0937a0bbe99304e3e9c0e63b7563443a

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
