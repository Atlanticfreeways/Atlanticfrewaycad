
The default interactive shell is now zsh.
To update your account to use zsh, please run `chsh -s /bin/zsh`.
For more details, please visit https://support.apple.com/kb/HT208050.
docker compose logs app 2>&1 | tail -50
Machines-MBP:Atlanticfrewaycard machine$ docker compose logs app 2>&1 | tail -50
atlanticfrewaycard-app-1  | info: Atlanticfrewaycard Platform started {"environment":"development","port":"3000","service":"atlanticfrewaycard","timestamp":"2025-11-24 22:03:25"}
atlanticfrewaycard-app-1  | 
atlanticfrewaycard-app-1  | 🚀 Atlanticfrewaycard Platform
atlanticfrewaycard-app-1  | 📡 Server: http://localhost:3000
atlanticfrewaycard-app-1  | 🌍 Environment: development
atlanticfrewaycard-app-1  | 
atlanticfrewaycard-app-1  | ✓ Security Enhancements Active
atlanticfrewaycard-app-1  |   - CSRF Protection: Enabled
atlanticfrewaycard-app-1  |   - CORS: Restricted
atlanticfrewaycard-app-1  |   - Logging: Winston
atlanticfrewaycard-app-1  | 
atlanticfrewaycard-app-1  | 📚 Endpoints:
atlanticfrewaycard-app-1  |   - GET  /health
atlanticfrewaycard-app-1  |   - GET  /api/v1/csrf-token
atlanticfrewaycard-app-1  |   - POST /api/v1/auth/register
atlanticfrewaycard-app-1  |   - POST /api/v1/partners/register
atlanticfrewaycard-app-1  |   - GET  /api/v1/partners/profile
atlanticfrewaycard-app-1  | info: PostgreSQL connected {"service":"atlanticfrewaycard","timestamp":"2025-11-24 22:15:13"}
atlanticfrewaycard-app-1  | info: Redis connected {"service":"atlanticfrewaycard","timestamp":"2025-11-24 22:15:17"}
atlanticfrewaycard-app-1  | info: Atlanticfrewaycard Platform started {"environment":"development","port":"3000","service":"atlanticfrewaycard","timestamp":"2025-11-24 23:12:20"}
atlanticfrewaycard-app-1  | 
atlanticfrewaycard-app-1  | 🚀 Atlanticfrewaycard Platform
atlanticfrewaycard-app-1  | 📡 Server: http://localhost:3000
atlanticfrewaycard-app-1  | 🌍 Environment: development
atlanticfrewaycard-app-1  | 
atlanticfrewaycard-app-1  | ✓ Security Enhancements Active
atlanticfrewaycard-app-1  |   - CSRF Protection: Enabled
atlanticfrewaycard-app-1  |   - CORS: Restricted
atlanticfrewaycard-app-1  |   - Logging: Winston
atlanticfrewaycard-app-1  | 
atlanticfrewaycard-app-1  | 📚 Endpoints:
atlanticfrewaycard-app-1  |   - GET  /health
atlanticfrewaycard-app-1  |   - GET  /api/v1/csrf-token
atlanticfrewaycard-app-1  |   - POST /api/v1/auth/register
atlanticfrewaycard-app-1  |   - POST /api/v1/partners/register
atlanticfrewaycard-app-1  |   - GET  /api/v1/partners/profile
atlanticfrewaycard-app-1  | info: PostgreSQL connected {"service":"atlanticfrewaycard","timestamp":"2025-11-25 00:33:37"}
atlanticfrewaycard-app-1  | info: Redis connected {"service":"atlanticfrewaycard","timestamp":"2025-11-25 00:33:38"}
atlanticfrewaycard-app-1  | error: PostgreSQL health check failed {"error":"getaddrinfo EAI_AGAIN postgres","service":"atlanticfrewaycard","timestamp":"2025-11-25 01:35:59"}
Machines-MBP:Atlanticfrewaycard machine$ docker compose down
Cannot connect to the Docker daemon at unix:///Users/machine/.docker/run/docker.sock. Is the docker daemon running?
Machines-MBP:Atlanticfrewaycard machine$ docker compose up -d --build
Cannot connect to the Docker daemon at unix:///Users/machine/.docker/run/docker.sock. Is the docker daemon running?
Machines-MBP:Atlanticfrewaycard machine$ curl http://localhost:3000/health
curl: (7) Failed to connect to localhost port 3000 after 1 ms: Couldn't connect to server
Machines-MBP:Atlanticfrewaycard machine$ docker compose up -d --build
[+] Building 98.0s (11/11) FINISHED             docker:desktop-linux
 => [app internal] load .dockerignore                           3.7s
 => => transferring context: 294B                               1.7s
 => [app internal] load build definition from Dockerfile        3.3s
 => => transferring dockerfile: 176B                            1.6s
 => [app internal] load metadata for docker.io/library/node:20  9.7s
 => [app auth] library/node:pull token for registry-1.docker.i  0.0s
 => [app 1/5] FROM docker.io/library/node:20-alpine@sha256:617  0.0s
 => [app internal] load build context                          24.4s
 => => transferring context: 800.53kB                          21.6s
 => CACHED [app 2/5] WORKDIR /app                               0.0s
 => CACHED [app 3/5] COPY package*.json ./                      0.0s
 => CACHED [app 4/5] RUN npm ci --only=production               0.0s
 => [app 5/5] COPY . .                                         50.0s
 => [app] exporting to image                                    8.3s
 => => exporting layers                                         8.2s
 => => writing image sha256:edd1c239013b97ccc0d6f7ede20d9cc2bb  0.0s
 => => naming to docker.io/library/atlanticfrewaycard-app       0.0s
[+] Running 6/6
 ✔ Container atlanticfrewaycard-rabbitmq-1  Running             0.0s 
 ✔ Container atlanticfrewaycard-postgres-1  Running             0.0s 
 ✔ Container atlanticfrewaycard-mongodb-1   Running             0.0s 
 ✔ Container atlanticfrewaycard-redis-1     Running             0.0s 
 ✔ Container atlanticfrewaycard-app-1       Started            27.1s 
 ✔ Container atlanticfrewaycard-nginx-1     Started            12.4s 
Machines-MBP:Atlanticfrewaycard machine$ curl http://localhost:3000/health
{"status":"ok","timestamp":"2025-11-25T04:26:10.848Z","services":{"postgres":"healthy","redis":"healthy"},"version":"1.0.0"}Machines-MBP:Aealthicfrewaycard machine$ curl http://localhost:3000/h 
{"status":"ok","timestamp":"2025-11-25T04:26:16.655Z","services":{"postgres":"healthy","redis":"healthy"},"version":"1.0.0"}Machines-MBP:Atlanticfrewaycard machine$ 