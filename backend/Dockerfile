# =========================================================
# TeamLease EdTech – Referral Portal Backend (FastAPI)
# ECS Fargate – Production
# =========================================================

FROM python:3.12-slim AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt


FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /usr/local /usr/local
COPY . .

RUN groupadd --gid 1000 appgroup \
    && useradd --uid 1000 --gid appgroup --create-home appuser \
    && chown -R appuser:appgroup /app

USER appuser

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

CMD [
  "gunicorn",
  "app.main:app",
  "--workers", "4",
  "--worker-class", "uvicorn.workers.UvicornWorker",
  "--bind", "0.0.0.0:8000",
  "--access-logfile", "-",
  "--error-logfile", "-",
  "--timeout", "120"
]
