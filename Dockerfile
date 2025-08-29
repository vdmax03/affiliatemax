# syntax=docker/dockerfile:1

FROM php:8.2-cli

# Install Postgres client libs for pdo_pgsql and optional ffmpeg
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       libpq-dev ca-certificates ffmpeg \
    && rm -rf /var/lib/apt/lists/* \
    && docker-php-ext-install pdo_pgsql

WORKDIR /app

# Copy source
COPY . /app

# Ensure storage folders exist (used by backend)
RUN mkdir -p /app/backend/storage/jobs

# App listens on PORT provided by platform (default 8080)
ENV PORT=8080
EXPOSE 8080

# Serve the PHP API from /backend using PHP's built-in server
# If RUN_WORKER=1, also start the background worker for jobs processing
CMD ["sh", "-lc", "if [ \"$RUN_WORKER\" = \"1\" ]; then php /app/backend/worker.php & fi; php -S 0.0.0.0:${PORT:-8080} -t /app/backend"]
