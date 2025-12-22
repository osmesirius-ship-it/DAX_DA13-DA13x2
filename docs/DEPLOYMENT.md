# DAX DA13-DA13x2 Deployment Guide

## Overview

This guide covers various deployment strategies for the DAX DA13-DA13x2 recursive governance system, from local development to production-scale deployments.

## Prerequisites

### System Requirements
- **CPU**: 4+ cores recommended
- **Memory**: 8GB+ RAM minimum, 16GB+ for production
- **Storage**: 10GB+ available space
- **Network**: Stable internet connection for X.AI API
- **OS**: Linux, macOS, or Windows with WSL2

### Software Requirements
- Node.js 18+ 
- npm or yarn
- Docker (optional, for containerized deployment)
- Kubernetes (optional, for orchestration)

## Environment Setup

### 1. Basic Environment

```bash
# Clone repository
git clone https://github.com/osmesirius-ship-it/DAX_DA13-DA13x2.git
cd DAX_DA13-DA13x2

# Set up environment
cp .env.example .env
# Edit .env with your configuration

# Install dependencies
cd mcp && npm install

# Build system
npm run build
```

### 2. Production Environment

```bash
# Production environment variables
export NODE_ENV=production
export DAX_ENV=production
export LOG_LEVEL=info
export DAX_PERFORMANCE_MODE=optimized
export DAX_MONITORING_ENABLED=true
export DAX_SECURITY_MODE=strict
```

## Local Development Deployment

### Direct Node.js

```bash
# Start development server
cd mcp
npm run dev

# Or start production server locally
npm run build && npm start
```

### Using PM2 (Process Manager)

```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start mcp/dist/index.js --name "dax-governance"

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

### PM2 Configuration File

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'dax-governance',
    script: './mcp/dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      DAX_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      DAX_ENV: 'production',
      LOG_LEVEL: 'info'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};
```

## Docker Deployment

### 1. Building the Docker Image

```dockerfile
# Dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY mcp/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY mcp/dist ./dist
COPY config ../config
COPY .env.example .env

# Create necessary directories
RUN mkdir -p data/beliefs logs temp

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node dist/health-check.js

# Start application
CMD ["node", "dist/index.js"]
```

```bash
# Build image
docker build -t dax-governance:latest .

# Run container
docker run -d \
  --name dax-governance \
  -p 3000:3000 \
  -e XAI_API_KEY=your_api_key \
  -e NODE_ENV=production \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/logs:/app/logs \
  dax-governance:latest
```

### 2. Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  dax-governance:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - XAI_API_KEY=${XAI_API_KEY}
      - DAX_ENV=production
      - LOG_LEVEL=info
    volumes:
      - ./data:/app/data
      - ./logs:/app/logs
      - ./config:/app/config
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "node", "dist/health-check.js"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - dax-governance
    restart: unless-stopped

volumes:
  redis_data:
```

```bash
# Start with Docker Compose
docker-compose up -d

# Scale horizontally
docker-compose up -d --scale dax-governance=3

# View logs
docker-compose logs -f dax-governance
```

## Kubernetes Deployment

### 1. Basic Kubernetes Manifests

```yaml
# namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: dax-governance
```

```yaml
# configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: dax-config
  namespace: dax-governance
data:
  NODE_ENV: "production"
  DAX_ENV: "production"
  LOG_LEVEL: "info"
  DAX_PERFORMANCE_MODE: "optimized"
```

```yaml
# secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: dax-secrets
  namespace: dax-governance
type: Opaque
data:
  XAI_API_KEY: <base64-encoded-api-key>
```

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: dax-governance
  namespace: dax-governance
spec:
  replicas: 3
  selector:
    matchLabels:
      app: dax-governance
  template:
    metadata:
      labels:
        app: dax-governance
    spec:
      containers:
      - name: dax-governance
        image: dax-governance:latest
        ports:
        - containerPort: 3000
        envFrom:
        - configMapRef:
            name: dax-config
        - secretRef:
            name: dax-secrets
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
        volumeMounts:
        - name: config-volume
          mountPath: /app/config
        - name: data-volume
          mountPath: /app/data
      volumes:
      - name: config-volume
        configMap:
          name: dax-config-files
      - name: data-volume
        persistentVolumeClaim:
          claimName: dax-data-pvc
```

```yaml
# service.yaml
apiVersion: v1
kind: Service
metadata:
  name: dax-governance-service
  namespace: dax-governance
spec:
  selector:
    app: dax-governance
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: ClusterIP
```

```yaml
# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: dax-governance-ingress
  namespace: dax-governance
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  tls:
  - hosts:
    - dax.example.com
    secretName: dax-tls
  rules:
  - host: dax.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: dax-governance-service
            port:
              number: 80
```

### 2. Horizontal Pod Autoscaler

```yaml
# hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: dax-governance-hpa
  namespace: dax-governance
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: dax-governance
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

### 3. Deploying to Kubernetes

```bash
# Apply all manifests
kubectl apply -f k8s/

# Check deployment status
kubectl get pods -n dax-governance

# View logs
kubectl logs -f deployment/dax-governance -n dax-governance

# Scale deployment
kubectl scale deployment dax-governance --replicas=5 -n dax-governance
```

## Cloud Deployment

### 1. AWS Deployment

#### ECS (Elastic Container Service)

```json
{
  "family": "dax-governance",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::account:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "dax-governance",
      "image": "your-account.dkr.ecr.region.amazonaws.com/dax-governance:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "XAI_API_KEY",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:dax/api-key"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/dax-governance",
          "awslogs-region": "us-west-2",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

#### CloudFormation Template

```yaml
# dax-stack.yaml
AWSTemplateFormatVersion: '2010-09-09'
Description: 'DAX Governance System'

Parameters:
  XAIApiKey:
    Type: String
    NoEcho: true
    Description: 'X.AI API Key'

Resources:
  DAXCluster:
    Type: AWS::ECS::Cluster
    Properties:
      ClusterName: dax-governance
      CapacityProviders:
        - FARGATE
        - FARGATE_SPOT

  DAXTaskDefinition:
    Type: AWS::ECS::TaskDefinition
    Properties:
      Family: dax-governance
      Cpu: 512
      Memory: 1024
      NetworkMode: awsvpc
      RequiresCompatibilities:
        - FARGATE
      ExecutionRoleArn: !GetAtt DAXExecutionRole.Arn
      TaskRoleArn: !GetAtt DAXTaskRole.Arn
      ContainerDefinitions:
        - Name: dax-governance
          Image: !Sub '${AWS::AccountId}.dkr.ecr.${AWS::Region}.amazonaws.com/dax-governance:latest'
          PortMappings:
            - ContainerPort: 3000
          Environment:
            - Name: NODE_ENV
              Value: production
          Secrets:
            - Name: XAI_API_KEY
              ValueFrom: !Ref DAXApiSecret

  DAXService:
    Type: AWS::ECS::Service
    Properties:
      Cluster: !Ref DAXCluster
      TaskDefinition: !Ref DAXTaskDefinition
      DesiredCount: 2
      LaunchType: FARGATE
      NetworkConfiguration:
        AwsvpcConfiguration:
          Subnets:
            - !Ref PrivateSubnet1
            - !Ref PrivateSubnet2
          SecurityGroups:
            - !Ref DAXSecurityGroup
          AssignPublicIp: ENABLED

  DAXApiSecret:
    Type: AWS::SecretsManager::Secret
    Properties:
      Name: dax/api-key
      SecretString: !Ref XAIApiKey
```

### 2. Google Cloud Platform

#### Cloud Run Deployment

```bash
# Build and push to Google Container Registry
gcloud builds submit --tag gcr.io/PROJECT_ID/dax-governance

# Deploy to Cloud Run
gcloud run deploy dax-governance \
  --image gcr.io/PROJECT_ID/dax-governance \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production \
  --set-secrets XAI_API_KEY=dax-api-key:latest
```

#### Kubernetes Engine (GKE)

```yaml
# gke-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: dax-governance
spec:
  replicas: 3
  selector:
    matchLabels:
      app: dax-governance
  template:
    metadata:
      labels:
        app: dax-governance
    spec:
      containers:
      - name: dax-governance
        image: gcr.io/PROJECT_ID/dax-governance:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: XAI_API_KEY
          valueFrom:
            secretKeyRef:
              name: dax-secrets
              key: api-key
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
```

### 3. Azure Deployment

#### Container Instances

```bash
# Create resource group
az group create --name dax-rg --location eastus

# Deploy to Azure Container Instances
az container create \
  --resource-group dax-rg \
  --name dax-governance \
  --image your-registry/dax-governance:latest \
  --cpu 1 \
  --memory 2 \
  --ports 3000 \
  --environment-variables NODE_ENV=production \
  --secure-environment-variables XAI_API_KEY=$XAI_API_KEY
```

#### Kubernetes Service (AKS)

```bash
# Create AKS cluster
az aks create --resource-group dax-rg --name dax-cluster --node-count 3

# Get credentials
az aks get-credentials --resource-group dax-rg --name dax-cluster

# Deploy
kubectl apply -f k8s/
```

## Monitoring and Observability

### 1. Prometheus Monitoring

```yaml
# prometheus-config.yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'dax-governance'
    static_configs:
      - targets: ['dax-governance:3000']
    metrics_path: '/metrics'
    scrape_interval: 5s
```

### 2. Grafana Dashboard

```json
{
  "dashboard": {
    "title": "DAX Governance Metrics",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(dax_requests_total[5m])",
            "legendFormat": "Requests/sec"
          }
        ]
      },
      {
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, dax_response_time_seconds_bucket)",
            "legendFormat": "95th percentile"
          }
        ]
      },
      {
        "title": "Belief Scores",
        "type": "graph",
        "targets": [
          {
            "expr": "dax_belief_coherence",
            "legendFormat": "Coherence"
          },
          {
            "expr": "dax_belief_reliability",
            "legendFormat": "Reliability"
          }
        ]
      }
    ]
  }
}
```

### 3. ELK Stack for Logging

```yaml
# logstash.conf
input {
  beats {
    port => 5044
  }
}

filter {
  if [fields][service] == "dax-governance" {
    json {
      source => "message"
    }
    
    date {
      match => [ "timestamp", "ISO8601" ]
    }
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "dax-governance-%{+YYYY.MM.dd}"
  }
}
```

## Security Configuration

### 1. Network Security

```yaml
# network-policy.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: dax-network-policy
  namespace: dax-governance
spec:
  podSelector:
    matchLabels:
      app: dax-governance
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
    ports:
    - protocol: TCP
      port: 3000
  egress:
  - to: []
    ports:
    - protocol: TCP
      port: 443  # For X.AI API
    - protocol: TCP
      port: 53   # DNS
```

### 2. Pod Security Policy

```yaml
# pod-security-policy.yaml
apiVersion: policy/v1beta1
kind: PodSecurityPolicy
metadata:
  name: dax-psp
spec:
  privileged: false
  allowPrivilegeEscalation: false
  requiredDropCapabilities:
    - ALL
  volumes:
    - 'configMap'
    - 'emptyDir'
    - 'projected'
    - 'secret'
    - 'downwardAPI'
    - 'persistentVolumeClaim'
  runAsUser:
    rule: 'MustRunAsNonRoot'
  seLinux:
    rule: 'RunAsAny'
  fsGroup:
    rule: 'RunAsAny'
```

### 3. RBAC Configuration

```yaml
# rbac.yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: dax-service-account
  namespace: dax-governance

---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: dax-role
  namespace: dax-governance
rules:
- apiGroups: [""]
  resources: ["configmaps", "secrets"]
  verbs: ["get", "list", "watch"]

---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: dax-role-binding
  namespace: dax-governance
subjects:
- kind: ServiceAccount
  name: dax-service-account
  namespace: dax-governance
roleRef:
  kind: Role
  name: dax-role
  apiGroup: rbac.authorization.k8s.io
```

## Performance Optimization

### 1. Resource Tuning

```yaml
# performance-tuned-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: dax-governance
spec:
  template:
    spec:
      containers:
      - name: dax-governance
        resources:
          requests:
            memory: "1Gi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
        env:
        - name: NODE_OPTIONS
          value: "--max-old-space-size=1536"
        - name: DAX_WORKER_THREADS
          value: "4"
        - name: DAX_CACHE_SIZE
          value: "1000"
```

### 2. Autoscaling Configuration

```yaml
# advanced-hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: dax-advanced-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: dax-governance
  minReplicas: 2
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 60
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 70
  - type: Pods
    pods:
      metric:
        name: dax_requests_per_second
      target:
        type: AverageValue
        averageValue: "100"
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 10
        periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
      - type: Percent
        value: 50
        periodSeconds: 60
```

## Backup and Recovery

### 1. Data Backup Strategy

```bash
#!/bin/bash
# backup-dax.sh

BACKUP_DIR="/backup/dax"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR/$DATE

# Backup configuration
kubectl get configmaps -n dax-governance -o yaml > $BACKUP_DIR/$DATE/configmaps.yaml

# Backup secrets (encrypted)
kubectl get secrets -n dax-governance -o yaml | \
  ansible-vault encrypt --output=$BACKUP_DIR/$DATE/secrets.yaml.vault

# Backup persistent data
kubectl exec -n dax-governance deployment/dax-governance -- \
  tar -czf /tmp/data-backup.tar.gz /app/data

kubectl cp -n dax-governance deployment/dax-governance:/tmp/data-backup.tar.gz \
  $BACKUP_DIR/$DATE/data-backup.tar.gz

# Clean old backups (keep 7 days)
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} \;
```

### 2. Disaster Recovery

```bash
#!/bin/bash
# recover-dax.sh

BACKUP_DIR=$1
if [ -z "$BACKUP_DIR" ]; then
  echo "Usage: $0 <backup_directory>"
  exit 1
fi

# Restore configuration
kubectl apply -f $BACKUP_DIR/configmaps.yaml

# Restore secrets
ansible-vault decrypt $BACKUP_DIR/secrets.yaml.vault --output=/tmp/secrets.yaml
kubectl apply -f /tmp/secrets.yaml

# Restore data
kubectl cp $BACKUP_DIR/data-backup.tar.gz \
  deployment/dax-governance:/tmp/data-backup.tar.gz -n dax-governance

kubectl exec -n dax-governance deployment/dax-governance -- \
  tar -xzf /tmp/data-backup.tar.gz -C /

# Restart deployment
kubectl rollout restart deployment/dax-governance -n dax-governance
```

## CI/CD Integration

### 1. GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy DAX Governance

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
      with:
        node-version: '18'
    - run: npm ci
    - run: npm test
    - run: npm run build

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Build Docker image
      run: |
        docker build -t dax-governance:${{ github.sha }} .
        docker tag dax-governance:${{ github.sha }} dax-governance:latest
    
    - name: Deploy to Kubernetes
      run: |
        echo "${{ secrets.KUBECONFIG }}" | base64 -d > kubeconfig
        export KUBECONFIG=kubeconfig
        kubectl set image deployment/dax-governance dax-governance=dax-governance:${{ github.sha }} -n dax-governance
        kubectl rollout status deployment/dax-governance -n dax-governance
```

### 2. GitLab CI

```yaml
# .gitlab-ci.yml
stages:
  - test
  - build
  - deploy

test:
  stage: test
  script:
    - npm ci
    - npm test
    - npm run build

build:
  stage: build
  script:
    - docker build -t $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA .
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
    - docker push $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
    - docker tag $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA $CI_REGISTRY_IMAGE:latest
    - docker push $CI_REGISTRY_IMAGE:latest

deploy_production:
  stage: deploy
  script:
    - kubectl set image deployment/dax-governance dax-governance=$CI_REGISTRY_IMAGE:$CI_COMMIT_SHA -n dax-governance
    - kubectl rollout status deployment/dax-governance -n dax-governance
  only:
    - main
```

## Troubleshooting Deployment Issues

### Common Problems

1. **Pod Fails to Start**
```bash
# Check pod status
kubectl get pods -n dax-governance

# View pod logs
kubectl logs -f deployment/dax-governance -n dax-governance

# Describe pod for detailed information
"]
kubectl describe pod数的 -n d 
```

empleo deployment/dax-governance -n dax-governance
```

2. **Service Not Accessible**
```bash
# Check service
kubectl get svc -n dax-governance

# Check endpoints
kubectl get endpoints -n dax-governance

# Test connectivity
kubectl exec -it deployment/dax-governance -n dax-governance -- curl localhost:3000/health
```

3. **High Resource Usage**
```bash
# Check resource usage
kubectl top pods -n dax-governance

# Check resource limits
kubectl describe deployment dax-governance -n dax-governance

# Scale deployment if needed
kubectl scale deployment dax-governance --replicas=5 -n dax-governance
```

This deployment guide provides comprehensive options for deploying the DAX DA13-DA13x2 system across various environments and platforms.
