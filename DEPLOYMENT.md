# 🚀 GreenThumb Deployment Guide

This document provides comprehensive instructions for deploying the GreenThumb React application using Docker, Kubernetes, and CI/CD pipelines.

## 📋 Prerequisites

- Docker Desktop or Docker Engine
- Kubernetes cluster (local or cloud)
- Helm 3.x
- kubectl configured
- Node.js 18+ (for local development)

## 🐳 Docker Deployment

### Local Development with Docker

```bash
# Clone the repository
git clone https://github.com/4Min4m/GreenThumb.git
cd GreenThumb

# Run development environment
docker-compose --profile dev up

# Access the application
open http://localhost:5173
```

### Production Deployment with Docker

```bash
# Build and run production container
docker-compose --profile prod up -d

# Access the application
open http://localhost:8080

# View logs
docker-compose logs -f greenthumb-prod
```

### Manual Docker Commands

```bash
# Build development image
docker build --target development -t greenthumb:dev .

# Build production image
docker build --target production -t greenthumb:prod .

# Run development container
docker run -p 5173:5173 --name greenthumb-dev greenthumb:dev

# Run production container
docker run -p 8080:80 --name greenthumb-prod greenthumb:prod
```

## ⚓ Kubernetes Deployment

### Prerequisites Setup

```bash
# Add NGINX Ingress Controller (if not already installed)
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml

# Install cert-manager (for TLS certificates)
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml
```

### Deploy with Helm

```bash
# Install/upgrade the application
helm upgrade --install greenthumb ./helm/greenthumb \
  --namespace greenthumb \
  --create-namespace \
  --set image.repository=docker.io/amin4m/greenthumb \
  --set image.tag=latest \
  --set ingress.hosts[0].host=greenthumb.local

# Check deployment status
kubectl get pods -n greenthumb
kubectl get services -n greenthumb
kubectl get ingress -n greenthumb
```

### Custom Values Deployment

Create a custom `values-prod.yaml`:

```yaml
replicaCount: 5

image:
  repository: ghcr.io/4min4m/greenthumb
  tag: "v1.0.0"

ingress:
  enabled: true
  hosts:
    - host: greenthumb.example.com
      paths:
        - path: /
          pathType: Prefix

resources:
  limits:
    cpu: 500m
    memory: 512Mi
  requests:
    cpu: 250m
    memory: 256Mi

autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 15
  targetCPUUtilizationPercentage: 70
```

Deploy with custom values:

```bash
helm upgrade --install greenthumb ./helm/greenthumb \
  --namespace production \
  --create-namespace \
  --values values-prod.yaml
```

### Useful Kubectl Commands

```bash
# Scale deployment
kubectl scale deployment greenthumb --replicas=5 -n greenthumb

# Check pod logs
kubectl logs -f deployment/greenthumb -n greenthumb

# Port forward for local access
kubectl port-forward service/greenthumb 8080:80 -n greenthumb

# Execute into pod
kubectl exec -it deployment/greenthumb -n greenthumb -- /bin/sh

# Check resource usage
kubectl top pods -n greenthumb
```

## 🔄 CI/CD Pipeline

The project includes a comprehensive GitHub Actions workflow that automatically:

### Pipeline Stages

1. **Test & Build**
   - Runs ESLint for code quality
   - Builds the React application
   - Validates build artifacts

2. **Security Scanning**
   - Scans Docker images for vulnerabilities using Trivy
   - Uploads results to GitHub Security tab
   - Fails pipeline if critical vulnerabilities found

3. **Build & Push**
   - Builds multi-architecture Docker images (amd64, arm64)
   - Pushes to GitHub Container Registry
   - Tags with branch name and commit SHA

4. **Deploy to Staging**
   - Automatically deploys to staging environment
   - Uses Helm for deployment
   - Runs health checks

5. **Deploy to Production**
   - Manual approval required (GitHub Environment protection)
   - Deploys to production with increased replica count
   - Verification steps included

### Setup CI/CD

1. **Configure Secrets in GitHub**:
   ```bash
   # Generate base64 encoded kubeconfig
   cat ~/.kube/config | base64 -w 0
   ```
   
   Add these secrets to your GitHub repository:
   - `KUBECONFIG_STAGING`: Base64 encoded kubeconfig for staging
   - `KUBECONFIG_PRODUCTION`: Base64 encoded kubeconfig for production

2. **Enable GitHub Container Registry**:
   - Go to repository Settings → Actions → General
   - Enable "Read and write permissions" for GITHUB_TOKEN

3. **Create Environment Protection Rules** (optional):
   - Go to Settings → Environments
   - Create "production" environment
   - Add required reviewers
   - Add deployment branch rules

### Pipeline Customization

The pipeline can be customized by modifying `.github/workflows/ci-cd.yml`:

```yaml
# Deploy to different namespaces
--namespace staging-v2

# Use different Helm values
--values helm/values/staging.yaml

# Deploy specific image tags
--set image.tag=v1.2.3

# Configure resource limits
--set resources.limits.memory=1Gi
```

## 🔒 Security Configuration

### Docker Security

The Docker configuration includes several security best practices:

- **Multi-stage builds** to minimize image size
- **Non-root user** execution
- **Security headers** in nginx configuration
- **Read-only root filesystem** where possible

### Kubernetes Security

The Helm chart includes comprehensive security configurations:

#### Pod Security Context
```yaml
podSecurityContext:
  fsGroup: 1001
  runAsNonRoot: true
  runAsUser: 1001

securityContext:
  allowPrivilegeEscalation: false
  capabilities:
    drop:
    - ALL
  readOnlyRootFilesystem: false
  runAsNonRoot: true
  runAsUser: 1001
```

#### Network Policies
```yaml
networkPolicy:
  enabled: true
  ingress:
    - from:
      - namespaceSelector:
          matchLabels:
            name: ingress-nginx
      ports:
      - protocol: TCP
        port: 80
```

#### Resource Limits
```yaml
resources:
  limits:
    cpu: 200m
    memory: 256Mi
  requests:
    cpu: 100m
    memory: 128Mi
```

### Security Scanning

Run security scans using the provided script:

```bash
# Make script executable
chmod +x scripts/security-scan.sh

# Run full security scan
./scripts/security-scan.sh

# Run with custom image
./scripts/security-scan.sh --image-name myapp:v1.0

# Check scan results
ls -la security-reports/
```

The security scan includes:
- **Vulnerability scanning** with Trivy
- **Secret detection** with gitleaks
- **Dockerfile linting** with hadolint
- **Helm chart security** with Checkov
- **OWASP compliance** checks

## 🎯 Environment-Specific Configurations

### Development Environment
```yaml
# values-dev.yaml
replicaCount: 1
image:
  tag: develop
resources:
  requests:
    cpu: 50m
    memory: 64Mi
autoscaling:
  enabled: false
```

### Staging Environment
```yaml
# values-staging.yaml
replicaCount: 2
image:
  tag: latest
ingress:
  hosts:
    - host: staging.greenthumb.local
resources:
  requests:
    cpu: 100m
    memory: 128Mi
```

### Production Environment
```yaml
# values-production.yaml
replicaCount: 3
image:
  tag: v1.0.0
ingress:
  hosts:
    - host: greenthumb.com
  tls:
    - secretName: greenthumb-tls
      hosts:
        - greenthumb.com
resources:
  limits:
    cpu: 500m
    memory: 512Mi
autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 20
```

## 🔧 Troubleshooting

### Common Issues

#### Pod Crashes or Won't Start
```bash
# Check pod status
kubectl describe pod <pod-name> -n greenthumb

# Check logs
kubectl logs <pod-name> -n greenthumb --previous

# Check events
kubectl get events -n greenthumb --sort-by='.lastTimestamp'
```

#### Image Pull Errors
```bash
# Check image exists
docker pull ghcr.io/4min4m/greenthumb:latest

# Check registry credentials
kubectl get secrets -n greenthumb

# Create registry secret if needed
kubectl create secret docker-registry regcred \
  --docker-server=ghcr.io \
  --docker-username=$GITHUB_ACTOR \
  --docker-password=$GITHUB_TOKEN \
  -n greenthumb
```

#### Ingress Not Working
```bash
# Check ingress controller
kubectl get pods -n ingress-nginx

# Check ingress resource
kubectl describe ingress greenthumb -n greenthumb

# Check service endpoints
kubectl get endpoints greenthumb -n greenthumb
```

#### Resource Issues
```bash
# Check node resources
kubectl top nodes

# Check pod resources
kubectl top pods -n greenthumb

# Describe resource quotas
kubectl describe resourcequota -n greenthumb
```

### Performance Optimization

#### Horizontal Pod Autoscaler Tuning
```yaml
autoscaling:
  enabled: true
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

#### Resource Optimization
```yaml
resources:
  limits:
    cpu: 200m      # Adjust based on load testing
    memory: 256Mi  # Monitor actual usage
  requests:
    cpu: 100m      # Start with lower values
    memory: 128Mi  # Scale up as needed
```

## 📊 Monitoring and Observability

### Health Checks
The application includes built-in health check endpoints:
- `/health` - Basic health check
- Kubernetes liveness and readiness probes configured

### Metrics Collection
To enable metrics collection, add Prometheus annotations:

```yaml
podAnnotations:
  prometheus.io/scrape: "true"
  prometheus.io/port: "80"
  prometheus.io/path: "/metrics"
```

### Logging
Centralized logging can be configured with:
- **Fluentd** or **Fluent Bit** for log aggregation
- **ELK Stack** or **Loki** for log storage and analysis
- **Grafana** for log visualization

## 🆘 Support and Maintenance

### Regular Maintenance Tasks

1. **Update Dependencies**
   ```bash
   npm audit
   npm update
   docker build --no-cache -t greenthumb:latest .
   ```

2. **Security Updates**
   ```bash
   ./scripts/security-scan.sh
   # Review and address any findings
   ```

3. **Backup Configuration**
   ```bash
   helm get values greenthumb -n production > backup/values-$(date +%Y%m%d).yaml
   kubectl get configmaps -n production -o yaml > backup/configmaps-$(date +%Y%m%d).yaml
   ```

4. **Monitor Resource Usage**
   ```bash
   kubectl top pods -n production
   kubectl describe hpa greenthumb -n production
   ```

### Getting Help

- **GitHub Issues**: Report bugs and feature requests
- **Documentation**: Check this file and inline comments
- **Community**: Join discussions in GitHub Discussions
- **Security Issues**: Report privately to maintainers

---

For additional questions or support, please refer to the project's GitHub repository or contact the maintainers.