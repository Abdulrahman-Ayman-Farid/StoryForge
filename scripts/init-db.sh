#!/bin/bash
set -euo pipefail

# Load environment variables
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-postgres}"
DB_NAME="${DB_NAME:-app_db}"

echo "Initializing database: $DB_NAME on $DB_HOST:$DB_PORT"

# Apply SQL schema
if [ -f database/schema.sql ]; then
  PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f database/schema.sql
  echo "Schema applied successfully."
fi

# Apply Prisma migrations (if available)
if [ -f prisma/schema.prisma ]; then
  npx prisma migrate deploy 2>/dev/null || echo "Prisma migrations skipped."
  npx prisma generate
  echo "Prisma client generated."
fi

echo "Database initialization complete."
