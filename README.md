# Workout Application

[![Docker Build and Push](https://github.com/cloudquestor/fit4less/actions/workflows/docker-build.yaml/badge.svg)](https://github.com/cloudquestor/fit4less/actions/workflows/docker-build.yaml)



## Project Structure
- `workout-api/` - Backend API
- `workout-ui/` - Frontend React Application
- `docker-compose.yml` - Main docker compose file

## Setup
1. Copy .env.example to .env
2. Run `docker compose --env-file .env up -d`

## Development
- API runs on http://localhost:3000
- UI runs on http://localhost
- PgAdmin runs on http://localhost:5050

