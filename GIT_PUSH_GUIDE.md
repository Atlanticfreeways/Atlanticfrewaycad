
The default interactive shell is now zsh.
To update your account to use zsh, please run `chsh -s /bin/zsh`.
For more details, please visit https://support.apple.com/kb/HT208050.
Machines-MBP:Atlanticfrewaycard machine$ docker compose logs app --tail=50
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
Machines-MBP:Atlanticfrewaycard machine$ curl http://localhost:3000/health
{"status":"ok","timestamp":"2025-11-24T22:15:19.105Z","services":{"postgres":"healthy","redis":"healthy"},"version":"1.0.0"}Machines-MBP:Atlanticfrewaycard machine$ 