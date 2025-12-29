## Environment Setup

Before building and deploying, configure environment variables:

### 1. Create .env.production file

Create a `.env.production` file in the `ui_docker_wp` directory with these variables:

```bash
# API Configuration
VITE_API_BASE_URL=https://cmdm.cdot.in

# Path Configuration
DEPLOYMENT_PREFIX_PATH=/wp/
AUTHENTICATED_PREFIX_PATH=ui

# Authentication
ENABLE_AUTH=false

# APK Size Limit
APK_SIZE_LIMIT_MB=50

# Hostname (for docker build)
HOSTNAME=cmdm.cdot.in
```

### 2. Build and Deploy

1. Build the project from the root directory and copy the dist directory to this directory:

```bash
cd /home/saitej/uem
npm run build:prod
cp -r dist ui_docker_uem/
```

2. Run the docker compose with build:

```bash
cd ui_docker_uem
docker compose down && docker compose up -d --build
```

3. Follow logs to check whether requests are landing:

```bash
docker compose logs -f
```

## Path Configuration

- **DEPLOYMENT_PREFIX_PATH**: The base path where the app is deployed (e.g., `/wp`, `/mdm`)
  - Used in nginx configuration to serve the app under this path
  - Used in Vite build configuration as the base path
  - Used in React Router as the basename
- **AUTHENTICATED_PREFIX_PATH**: The prefix for authenticated routes (default: `ui`)
  - All authenticated routes are under `/{DEPLOYMENT_PREFIX_PATH}/{AUTHENTICATED_PREFIX_PATH}/`
  - Example: `/wp/ui/dashboard`, `/wp/ui/devices`, etc.
