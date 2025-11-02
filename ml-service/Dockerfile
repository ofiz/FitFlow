FROM python:3.11-slim

# Security updates
RUN apt-get update && apt-get upgrade -y && \
    apt-get install -y --no-install-recommends \
    libglib2.0-0 libsm6 libxext6 libxrender1 \
    libgomp1 libgl1 libgthread-2.0-0 && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app
ENV PYTHONPATH=/app

COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip==25.3 && \
    pip install --no-cache-dir -r requirements.txt

COPY . .
RUN mkdir -p /app/models/weights

# Non-root user
RUN useradd -m -u 1000 mluser && \
    chown -R mluser:mluser /app
USER mluser

EXPOSE 5001

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:5001/health')"

CMD ["gunicorn", "--bind", "0.0.0.0:5001", "--workers", "2", "--timeout", "120", "src.app:app"]