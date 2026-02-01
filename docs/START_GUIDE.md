# 🚀 One-Command Startup

## Start Everything

```bash
./start.sh
```

This will:
1. Start Docker containers (PostgreSQL, Redis, MongoDB, RabbitMQ)
2. Run database migrations
3. Install dependencies
4. Start backend server
5. Start frontend server
6. Test all connections

**Time:** ~2 minutes

## Stop Everything

```bash
./stop.sh
```

## Manual Commands

```bash
# Start infrastructure only
docker-compose up -d

# Start backend only
npm run dev

# Start frontend only
cd frontend && npm run dev

# View logs
docker-compose logs -f
tail -f logs/combined.log
```

## Access Points

- **Frontend:** http://localhost:3001
- **Backend API:** http://localhost:3000
- **API Docs:** http://localhost:3000/api-docs
- **RabbitMQ:** http://localhost:15672 (guest/guest)

## Troubleshooting

```bash
# Reset everything
./stop.sh
docker-compose down -v
./start.sh

# Check service status
docker-compose ps
curl http://localhost:3000/health
```
