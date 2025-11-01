#!/bin/bash

# Railway Deployment Script
# Set your Railway token as environment variable or pass it

RAILWAY_TOKEN=${RAILWAY_TOKEN:-"758784cc-1be8-4fe2-80d2-e06718b2e5f8"}

echo "🚂 Desplegando a Railway..."

# Login with token
railway login --token "$RAILWAY_TOKEN"

# Create project if it doesn't exist
railway init --name aiquaa-test-management-api

# Link to existing project (if already created)
# railway link

# Add PostgreSQL service
railway add postgresql

# Set environment variables
railway variables set DATABASE_URL="\${{Postgres.DATABASE_URL}}"
railway variables set JWT_SECRET="change-me-in-production-very-secure-secret-key-123456789"
railway variables set JWT_EXPIRES_IN="15m"
railway variables set JWT_REFRESH_EXPIRES_IN="7d"
railway variables set PORT="3000"
railway variables set NODE_ENV="production"
railway variables set CORS_ORIGIN="*"
railway variables set LOG_LEVEL="info"

# Run migrations
echo "🔄 Ejecutando migraciones..."
railway run npm run migrate:prod

# Run seed (optional)
# railway run npm run seed

# Deploy
echo "🚀 Desplegando..."
railway up

echo "✅ Despliegue completado!"
railway status

