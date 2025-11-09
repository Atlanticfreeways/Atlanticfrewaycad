2025-11-07T13:45:58.974661553Z [inf]  
2025-11-07T13:46:03.500033711Z [inf]  [35m[Region: asia-southeast1][0m
2025-11-07T13:46:03.510294496Z [inf]  [35m=========================
2025-11-07T13:46:03.510318824Z [inf]  Using Detected Dockerfile
2025-11-07T13:46:03.510324651Z [inf]  =========================
2025-11-07T13:46:03.510328833Z [inf]  [0m
2025-11-07T13:46:03.510343099Z [inf]  context: 4f0j-EImO
2025-11-07T13:46:03.688048065Z [inf]  [internal] load build definition from Dockerfile
2025-11-07T13:46:03.688102065Z [inf]  [internal] load build definition from Dockerfile
2025-11-07T13:46:03.688131042Z [inf]  [internal] load build definition from Dockerfile
2025-11-07T13:46:03.702710271Z [inf]  [internal] load build definition from Dockerfile
2025-11-07T13:46:03.704690245Z [inf]  [internal] load metadata for docker.io/library/node:20-alpine
2025-11-07T13:46:03.708142308Z [inf]  [auth] library/node:pull token for registry-1.docker.io
2025-11-07T13:46:03.708176996Z [inf]  [auth] library/node:pull token for registry-1.docker.io
2025-11-07T13:46:05.423591993Z [inf]  [internal] load metadata for docker.io/library/node:20-alpine
2025-11-07T13:46:05.424041642Z [inf]  [internal] load .dockerignore
2025-11-07T13:46:05.424078178Z [inf]  [internal] load .dockerignore
2025-11-07T13:46:05.424203420Z [inf]  [internal] load .dockerignore
2025-11-07T13:46:05.438430930Z [inf]  [internal] load .dockerignore
2025-11-07T13:46:05.442275560Z [inf]  [5/5] COPY . .
2025-11-07T13:46:05.442302198Z [inf]  [4/5] RUN npm ci --only=production
2025-11-07T13:46:05.442315284Z [inf]  [3/5] COPY package*.json ./
2025-11-07T13:46:05.442326567Z [inf]  [internal] load build context
2025-11-07T13:46:05.442343108Z [inf]  [2/5] WORKDIR /app
2025-11-07T13:46:05.442357172Z [inf]  [1/5] FROM docker.io/library/node:20-alpine@sha256:6178e78b972f79c335df281f4b7674a2d85071aae2af020ffa39f0a770265435
2025-11-07T13:46:05.442381704Z [inf]  [1/5] FROM docker.io/library/node:20-alpine@sha256:6178e78b972f79c335df281f4b7674a2d85071aae2af020ffa39f0a770265435
2025-11-07T13:46:05.442400962Z [inf]  [internal] load build context
2025-11-07T13:46:05.442480877Z [inf]  [internal] load build context
2025-11-07T13:46:05.452473290Z [inf]  [1/5] FROM docker.io/library/node:20-alpine@sha256:6178e78b972f79c335df281f4b7674a2d85071aae2af020ffa39f0a770265435
2025-11-07T13:46:05.496086312Z [inf]  [internal] load build context
2025-11-07T13:46:05.502272307Z [inf]  [2/5] WORKDIR /app
2025-11-07T13:46:05.502309264Z [inf]  [3/5] COPY package*.json ./
2025-11-07T13:46:05.502322812Z [inf]  [4/5] RUN npm ci --only=production
2025-11-07T13:46:05.502337226Z [inf]  [5/5] COPY . .
2025-11-07T13:46:05.503219133Z [inf]  exporting to docker image format
2025-11-07T13:46:05.599441003Z [inf]  [auth] sharing credentials for production-asia-southeast1-eqsg3a.railway-registry.com
2025-11-07T13:46:05.599513302Z [inf]  [auth] sharing credentials for production-asia-southeast1-eqsg3a.railway-registry.com
2025-11-07T13:46:06.018750529Z [inf]  importing to docker
2025-11-07T13:46:08.965310757Z [inf]  importing to docker
2025-11-07T13:46:11.485220205Z [inf]  [92mBuild time: 7.97 seconds[0m
2025-11-07T13:46:23.410932360Z [inf]  
2025-11-07T13:46:23.411024995Z [inf]  [35m====================
Starting Healthcheck
====================
[0m
2025-11-07T13:46:23.411029784Z [inf]  [37mPath: /health[0m
2025-11-07T13:46:23.411032316Z [inf]  [37mRetry window: 1m40s[0m
2025-11-07T13:46:23.411034538Z [inf]  
2025-11-07T13:46:33.866902244Z [inf]  [93mAttempt #1 failed with service unavailable. Continuing to retry for 1m29s[0m
2025-11-07T13:46:45.079244264Z [inf]  [93mAttempt #2 failed with service unavailable. Continuing to retry for 1m18s[0m
2025-11-07T13:46:57.286584818Z [inf]  [93mAttempt #3 failed with service unavailable. Continuing to retry for 1m6s[0m
2025-11-07T13:47:11.479347423Z [inf]  [93mAttempt #4 failed with service unavailable. Continuing to retry for 51s[0m
2025-11-07T13:47:29.671609982Z [inf]  [93mAttempt #5 failed with service unavailable. Continuing to retry for 33s[0m
2025-11-07T13:47:55.859936459Z [inf]  [93mAttempt #6 failed with service unavailable. Continuing to retry for 7s[0m
2025-11-07T13:47:55.945762912Z [inf]  
2025-11-07T13:47:55.945942623Z [inf]  [91m1/1 replicas never became healthy![0m
2025-11-07T13:47:55.945950101Z [inf]  [91mHealthcheck failed![0m