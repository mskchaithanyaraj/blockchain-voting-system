# 🚀 Deployment Checklist

Complete checklist for deploying the Blockchain Voting System to production.

---

## 📋 Pre-Deployment Checklist

### 1. Code Quality

- [ ] All code reviewed and tested
- [ ] No console.log statements in production code
- [ ] Error handling implemented everywhere
- [ ] Code comments are clear and helpful
- [ ] No hardcoded sensitive data
- [ ] Environment variables used correctly

### 2. Testing

- [ ] All unit tests passing
- [ ] Integration tests completed
- [ ] End-to-end testing done
- [ ] Security testing completed
- [ ] Performance testing done
- [ ] Cross-browser testing completed
- [ ] Mobile responsive testing done

### 3. Documentation

- [ ] README.md complete and accurate
- [ ] API documentation up to date
- [ ] Installation guide tested
- [ ] User guide written
- [ ] Developer guide available
- [ ] Troubleshooting guide included

### 4. Security

- [ ] JWT secret is strong (32+ characters)
- [ ] MongoDB credentials secure
- [ ] Private keys never committed to repo
- [ ] CORS configured correctly
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention verified
- [ ] XSS prevention verified

---

## 🌐 Production Environment Setup

### 1. Smart Contract Deployment

#### Deploy to Testnet (Goerli/Sepolia)

```bash
# Install dependencies
cd contracts
npm install @truffle/hdwallet-provider

# Create .env in contracts folder
MNEMONIC="your twelve word mnemonic phrase here"
INFURA_PROJECT_ID="your-infura-project-id"

# Update truffle-config.js
goerli: {
  provider: () => new HDWalletProvider(
    process.env.MNEMONIC,
    `https://goerli.infura.io/v3/${process.env.INFURA_PROJECT_ID}`
  ),
  network_id: 5,
  gas: 5500000,
  confirmations: 2,
  timeoutBlocks: 200,
  skipDryRun: true
}

# Deploy to testnet
truffle migrate --network goerli

# Verify contract on Etherscan
truffle run verify Voting --network goerli --license MIT
```

**Save**:

- Contract address
- Transaction hash
- Deployer address

#### Deploy to Mainnet (When Ready)

```bash
# Deploy to mainnet (expensive!)
truffle migrate --network mainnet

# Verify contract
truffle run verify Voting --network mainnet --license MIT
```

---

### 2. Backend Deployment

#### Option A: Heroku

```bash
# Install Heroku CLI
# Login to Heroku
heroku login

# Create app
heroku create blockchain-voting-backend

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set PORT=5000
heroku config:set MONGODB_URI="your-production-mongodb-uri"
heroku config:set JWT_SECRET="your-strong-jwt-secret"
heroku config:set CONTRACT_ADDRESS="your-deployed-contract-address"
heroku config:set GANACHE_URL="your-rpc-url"  # Or Infura URL for mainnet
heroku config:set ADMIN_PRIVATE_KEY="your-private-key"
heroku config:set CORS_ORIGIN="https://your-frontend-domain.com"

# Deploy
git subtree push --prefix backend heroku main

# Check logs
heroku logs --tail
```

#### Option B: AWS EC2

```bash
# SSH into EC2 instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Clone repository
git clone https://github.com/mskchaithanyaraj/blockchain-voting-system.git
cd blockchain-voting-system/backend

# Install dependencies
npm install --production

# Create .env file
nano .env
# Paste production environment variables

# Start with PM2
pm2 start src/index.js --name voting-backend
pm2 save
pm2 startup

# Setup Nginx reverse proxy
sudo apt install nginx
sudo nano /etc/nginx/sites-available/default

# Nginx configuration:
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Restart Nginx
sudo systemctl restart nginx

# Setup SSL with Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

#### Option C: DigitalOcean App Platform

```bash
# Create app via DigitalOcean dashboard
# Connect GitHub repository
# Set environment variables in dashboard
# Deploy automatically on push
```

---

### 3. Frontend Deployment

#### Option A: Vercel (Recommended for React)

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Navigate to frontend
cd frontend

# Update environment variables
# Create .env.production
VITE_API_URL=https://your-backend-url.com/api
VITE_CONTRACT_ADDRESS=your-deployed-contract-address
VITE_NETWORK_CHAIN_ID=5  # Goerli testnet or 1 for mainnet

# Deploy
vercel --prod

# Or connect GitHub repo in Vercel dashboard for auto-deploy
```

#### Option B: Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Build production
cd frontend
npm run build

# Deploy
netlify deploy --prod --dir=dist

# Or connect GitHub repo in Netlify dashboard
```

#### Option C: AWS S3 + CloudFront

```bash
# Build production
cd frontend
npm run build

# Install AWS CLI
# Configure AWS credentials
aws configure

# Create S3 bucket
aws s3 mb s3://voting-app-frontend

# Enable static website hosting
aws s3 website s3://voting-app-frontend --index-document index.html

# Upload build
aws s3 sync dist/ s3://voting-app-frontend

# Create CloudFront distribution for HTTPS
# Configure CloudFront to point to S3 bucket
```

---

### 4. Database Setup

#### MongoDB Atlas (Recommended)

```bash
# Create production cluster
# Select cloud provider and region
# Choose cluster tier (M10+ for production)
# Configure:
# - IP Whitelist (add production server IPs)
# - Database user with strong password
# - Enable backup
# - Enable monitoring

# Connection string
mongodb+srv://username:password@cluster-prod.mongodb.net/voting-production?retryWrites=true&w=majority

# Create indexes for performance
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ ethAddress: 1 }, { unique: true })
db.votes.createIndex({ voter: 1 }, { unique: true })
```

---

## 🔐 Security Configuration

### 1. Environment Variables

**Backend Production .env**:

```env
NODE_ENV=production
PORT=5000

# MongoDB
MONGODB_URI=mongodb+srv://prod-user:strong-password@cluster.mongodb.net/voting-prod

# JWT (use strong random string)
JWT_SECRET=use-openssl-rand-base64-32-to-generate-this-secret-key
JWT_EXPIRE=7d

# Blockchain (Mainnet or Testnet)
GANACHE_URL=https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID
CONTRACT_ADDRESS=0xYourDeployedContractAddress
ADMIN_PRIVATE_KEY=your-admin-private-key

# CORS
CORS_ORIGIN=https://your-frontend-domain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Frontend Production .env**:

```env
VITE_API_URL=https://api.your-domain.com
VITE_CONTRACT_ADDRESS=0xYourDeployedContractAddress
VITE_NETWORK_CHAIN_ID=1
VITE_RPC_URL=https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID
```

### 2. Security Headers

Add to backend `index.js`:

```javascript
// Helmet for security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  })
);

// Rate limiting
const rateLimit = require("express-rate-limit");
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use("/api/", limiter);
```

### 3. SSL/TLS

- [ ] SSL certificate installed (Let's Encrypt or commercial)
- [ ] HTTPS enforced on all routes
- [ ] HTTP redirects to HTTPS
- [ ] HSTS header enabled
- [ ] Certificate auto-renewal configured

---

## 📊 Monitoring Setup

### 1. Application Monitoring

```bash
# Install monitoring tools
npm install --save winston  # Logging
npm install --save morgan   # HTTP logging

# Setup logging
const winston = require('winston');
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

### 2. Error Tracking

```bash
# Setup Sentry for error tracking
npm install @sentry/node

# In index.js
const Sentry = require("@sentry/node");
Sentry.init({ dsn: "your-sentry-dsn" });

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());
```

### 3. Uptime Monitoring

- [ ] Setup UptimeRobot or Pingdom
- [ ] Monitor frontend URL
- [ ] Monitor backend API endpoint
- [ ] Configure alerts (email, SMS, Slack)

---

## 🧪 Post-Deployment Testing

### 1. Smoke Tests

```bash
# Test homepage loads
curl https://your-domain.com

# Test API health endpoint
curl https://api.your-domain.com/health

# Test authentication
curl -X POST https://api.your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

### 2. Functional Tests

- [ ] User registration works
- [ ] Login works
- [ ] Admin dashboard accessible
- [ ] Voter dashboard accessible
- [ ] MetaMask connection works
- [ ] Voting transaction works
- [ ] Results display correctly

### 3. Performance Tests

- [ ] Page load time < 3 seconds
- [ ] API response time < 500ms
- [ ] Database queries optimized
- [ ] Images/assets optimized
- [ ] Bundle size reasonable

---

## 📱 Mobile App (Optional)

If deploying as mobile app:

### React Native Setup

```bash
# Install Expo
npm install -g expo-cli

# Create React Native app
expo init voting-mobile-app

# Copy components from web app
# Adapt for mobile (TouchableOpacity, ScrollView, etc.)

# Build for iOS
expo build:ios

# Build for Android
expo build:android
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Heroku
        uses: akhileshns/heroku-deploy@v3.12.12
        with:
          heroku_api_key: ${{secrets.HEROKU_API_KEY}}
          heroku_app_name: "voting-backend"
          heroku_email: "your-email@example.com"
          appdir: "backend"

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID}}
          vercel-project-id: ${{ secrets.PROJECT_ID}}
          working-directory: ./frontend
```

---

## 📋 Final Checklist

### Pre-Launch

- [ ] All tests passing
- [ ] Documentation complete
- [ ] Security audit done
- [ ] Performance optimized
- [ ] Monitoring configured
- [ ] Backups configured
- [ ] SSL certificates installed
- [ ] Domain configured
- [ ] DNS propagated

### Launch Day

- [ ] Deploy smart contract
- [ ] Deploy backend
- [ ] Deploy frontend
- [ ] Verify all services running
- [ ] Test complete user flow
- [ ] Monitor error logs
- [ ] Check performance metrics
- [ ] Announce launch

### Post-Launch

- [ ] Monitor for 24 hours
- [ ] Check error rates
- [ ] Review performance
- [ ] Collect user feedback
- [ ] Fix critical bugs immediately
- [ ] Plan updates and improvements

---

## 🆘 Rollback Plan

If deployment fails:

```bash
# Rollback backend (Heroku)
heroku releases:rollback --app voting-backend

# Rollback frontend (Vercel)
vercel rollback

# Rollback database (restore from backup)
# MongoDB Atlas: Use point-in-time restore

# Notify users
# Post status update
# Fix issues in development
# Re-deploy when ready
```

---

## 📞 Support Contact

**Deployment Support**:

- GitHub Issues: [Report Issue](https://github.com/mskchaithanyaraj/blockchain-voting-system/issues)
- Email: support@your-domain.com

**Emergency Contacts**:

- DevOps Lead: name@domain.com
- Database Admin: name@domain.com
- Security Team: security@domain.com

---

**Deployment Complete! 🎉**

Monitor closely for the first 24-48 hours after deployment.
