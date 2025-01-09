#!/bin/bash



# Create UI directory structure
mkdir -p workout-ui/{public,src/{components,services,hooks,utils,assets}}
touch workout-ui/{.env,.env.example,package.json,Dockerfile.dev}

# Create basic component files
mkdir -p workout-ui/src/components/{users,common,layout}
touch workout-ui/src/components/users/{UserList.js,UserForm.js,UserDetails.js}
touch workout-ui/src/components/common/{Loading.js,ErrorBoundary.js}
touch workout-ui/src/components/layout/{Header.js,Footer.js}

# Create service files
touch workout-ui/src/services/{api.js,auth.js}

# Create configuration files
echo "node_modules/
.env
*.log
dist/
build/" > .gitignore

# Create README
echo "# Workout Application

## Project Structure
- \`workout-api/\` - Backend API
- \`workout-ui/\` - Frontend React Application
- \`docker-compose.yml\` - Main docker compose file
- \`compose.base.yml\` - Base docker compose configuration

## Setup
1. Copy .env.example to .env
2. Run \`docker compose up -d\`

## Development
- API runs on http://localhost:3000
- UI runs on http://localhost:3001
- PgAdmin runs on http://localhost:5050
" > README.md

# Create example environment file
echo "# Database
POSTGRES_USER=your_db_user
POSTGRES_PASSWORD=your_db_password
POSTGRES_DB=your_db_name

# PgAdmin
PGADMIN_DEFAULT_EMAIL=your_email
PGADMIN_DEFAULT_PASSWORD=your_password

# API
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name" > .env.example

# Make the directory structure visible
echo "Project structure created:"
tree -L 4

echo "
Setup completed! Next steps:
1. Copy .env.example to .env and update the values
2. Run 'npm init' in workout-api and workout-ui directories
3. Install required dependencies
4. Start development with 'docker compose up -d'
"
