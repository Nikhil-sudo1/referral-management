# TeamLease EdTech Referral Portal - API Dockerfile
# For AWS ECS Fargate Deployment
# Runs on port 80

FROM python:3.12-slim AS builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Production stage
FROM python:3.12-slim

WORKDIR /app

# Install runtime dependencies only
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean \
    && rm -rf /var/cache/apt/archives/*

# Copy installed packages from builder
COPY --from=builder /root/.local /root/.local
ENV PATH=/root/.local/bin:$PATH

# Copy application code
COPY . .

# Security: Create non-root user
RUN groupadd --gid 1000 appgroup \
    && useradd --uid 1000 --gid appgroup --shell /bin/bash --create-home appuser \
    && chown -R appuser:appgroup /app

# Security: Remove unnecessary files
RUN find /app -type f -name "*.pyc" -delete \
    && find /app -type d -name "__pycache__" -delete \
    && rm -rf /app/.git /app/.env* /app/*.md /app/tests

# Switch to non-root user
USER appuser

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:80/health/live || exit 1

# Environment variables will be injected from ECS Task Definition
# DATABASE_HOST, DATABASE_PORT, DATABASE_NAME, DATABASE_USER, DATABASE_PASSWORD
# JWT_SECRET_KEY, JWT_ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES
# CORS_ORIGINS, DEBUG, ENVIRONMENT

# Run application with Gunicorn on port 80
CMD ["gunicorn", "app.main:app", \
     "--workers", "4", \
     "--worker-class", "uvicorn.workers.UvicornWorker", \
     "--bind", "0.0.0.0:80", \
     "--access-logfile", "-", \
     "--error-logfile", "-", \
     "--timeout", "120", \
     "--graceful-timeout", "30", \
     "--keep-alive", "5"]

