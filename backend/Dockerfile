FROM python:3.12-slim

WORKDIR /app

# Install system deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python deps
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app
COPY . .

# Expose API port
EXPOSE 8000

# Start API (SINGLE LINE CMD)
CMD ["gunicorn","app.main:app","--workers","4","--worker-class","uvicorn.workers.UvicornWorker","--bind","0.0.0.0:8000","--access-logfile","-","--error-logfile","-"]
