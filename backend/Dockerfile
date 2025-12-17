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

# Copy requirements and install Python dependencies (GLOBAL INSTALL)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt


# ---------------- Production Stage ----------------
FROM python:3.12-slim

WORKDIR /app

# Install runtime dependencies only
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean \
    && rm -rf /var/cache/apt/archives/*

# Copy Python packages from builder (GLOBAL)
COPY --from=builder /usr/local /usr/local

# Copy application code
COPY . .

# Security: Create non-root user
RUN groupadd --gid 1000 appgroup \
    && useradd --uid 1000 --gid appgroup --shell /bin/bash --create-home appuser \
    && chown -R appuser:appgroup /app

# Cleanup unnecessary files
RUN find /app -type f -name "*.pyc" -delete \
    && find /app -type d -name "__pycache__" -delete \
    && rm -rf /app/.git /app/.env* /app/*.md /app/tests

# Switch to non-root user
USER appuser

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:80/health/live || exit 1

# Run application with Gunicorn
CMD ["gunicorn", "app.main:app", \
     "--workers", "4", \
     "--worker-class", "uvicorn.workers.UvicornWorker", \
     "--bind", "0.0.0.0:80", \
     "--access-logfile", "-", \
     "--error-logfile", "-", \
     "--timeout", "120", \
     "--graceful-timeout", "30", \
     "--keep-alive", "5"]
