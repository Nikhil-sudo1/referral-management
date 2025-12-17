# TeamLease EdTech Referral Portal - Backend API
# FastAPI + Gunicorn + ECS Fargate
# Exposes port 8000

FROM python:3.12-slim

WORKDIR /app

# Install OS dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create non-root user
RUN groupadd -g 1000 appgroup \
    && useradd -u 1000 -g appgroup -s /bin/bash -m appuser \
    && chown -R appuser:appgroup /app

USER appuser

# Application runs on 8000
EXPOSE 8000

# Container health check (ECS + ALB friendly)
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# Start FastAPI using Gunicorn + Uvicorn worker
CMD ["gunicorn", "app.main:app", "--workers=4", "--worker-class=uvicorn.workers.UvicornWorker", "--bind=0.0.0.0:8000", "--access-logfile=-", "--error-logfile=-", "--timeout=120"]
