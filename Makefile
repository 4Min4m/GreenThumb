# GreenThumb Makefile for Cloud Engineering Demo

# Variables
APP_NAME = greenthumb
IMAGE_NAME = ghcr.io/4min4m/$(APP_NAME)
VERSION = latest
NAMESPACE = default
HELM_CHART = ./helm/$(APP_NAME)

# Docker commands
.PHONY: docker-build docker-run docker-push docker-dev docker-prod

docker-build:
	@echo "🏗️  Building Docker image..."
	docker build -t $(IMAGE_NAME):$(VERSION) .

docker-dev:
	@echo "🚀 Starting development environment..."
	docker-compose --profile dev up

docker-prod:
	@echo "🚀 Starting production environment..."
	docker-compose --profile prod up -d

docker-run:
	@echo "🏃 Running Docker container..."
	docker run -p 8080:80 --name $(APP_NAME) $(IMAGE_NAME):$(VERSION)

docker-push:
	@echo "📤 Pushing Docker image to registry..."
	docker push $(IMAGE_NAME):$(VERSION)

docker-clean:
	@echo "🧹 Cleaning up Docker resources..."
	docker system prune -f
	docker image prune -f

# Kubernetes commands
.PHONY: k8s-deploy k8s-upgrade k8s-delete k8s-status k8s-logs

k8s-deploy:
	@echo "⚓ Deploying to Kubernetes..."
	helm upgrade --install $(APP_NAME) $(HELM_CHART) \
		--namespace $(NAMESPACE) \
		--create-namespace \
		--set image.repository=$(IMAGE_NAME) \
		--set image.tag=$(VERSION) \
		--wait

k8s-upgrade:
	@echo "⬆️  Upgrading Kubernetes deployment..."
	helm upgrade $(APP_NAME) $(HELM_CHART) \
		--namespace $(NAMESPACE) \
		--set image.repository=$(IMAGE_NAME) \
		--set image.tag=$(VERSION) \
		--wait

k8s-delete:
	@echo "🗑️  Deleting Kubernetes deployment..."
	helm uninstall $(APP_NAME) --namespace $(NAMESPACE)

k8s-status:
	@echo "📊 Checking Kubernetes status..."
	kubectl get pods,svc,ingress -n $(NAMESPACE) -l app.kubernetes.io/name=$(APP_NAME)

k8s-logs:
	@echo "📋 Getting application logs..."
	kubectl logs -f deployment/$(APP_NAME) -n $(NAMESPACE)

k8s-port-forward:
	@echo "🔌 Port forwarding to local machine..."
	kubectl port-forward service/$(APP_NAME) 8080:80 -n $(NAMESPACE)

# Development commands
.PHONY: dev install build test lint

dev:
	@echo "🚀 Starting development server..."
	npm run dev

install:
	@echo "📦 Installing dependencies..."
	npm ci

build:
	@echo "🏗️  Building application..."
	npm run build

test:
	@echo "🧪 Running tests..."
	npm test

lint:
	@echo "🔍 Running linter..."
	npm run lint

# Security commands
.PHONY: security-scan security-full

security-scan:
	@echo "🔒 Running security scan..."
	chmod +x scripts/security-scan.sh
	./scripts/security-scan.sh

security-full:
	@echo "🔒 Running comprehensive security scan..."
	chmod +x scripts/security-scan.sh
	./scripts/security-scan.sh --image-name $(IMAGE_NAME):$(VERSION)

# CI/CD commands
.PHONY: ci-build ci-test ci-deploy

ci-build: install lint build docker-build

ci-test: test security-scan

ci-deploy: docker-push k8s-upgrade

# Environment setup
.PHONY: setup-dev setup-k8s setup-monitoring

setup-dev:
	@echo "🛠️  Setting up development environment..."
	npm install
	docker-compose --profile dev build

setup-k8s:
	@echo "⚓ Setting up Kubernetes environment..."
	@echo "Installing NGINX Ingress Controller..."
	kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml
	@echo "Installing cert-manager..."
	kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml
	@echo "Waiting for controllers to be ready..."
	kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=ingress-nginx -n ingress-nginx --timeout=300s

setup-monitoring:
	@echo "📊 Setting up monitoring stack..."
	helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
	helm repo add grafana https://grafana.github.io/helm-charts
	helm repo update
	helm upgrade --install prometheus prometheus-community/kube-prometheus-stack \
		--namespace monitoring \
		--create-namespace

# Utility commands
.PHONY: clean logs help

clean: docker-clean
	@echo "🧹 Cleaning up..."
	rm -rf node_modules
	rm -rf dist
	rm -rf security-reports

logs:
	@echo "📋 Getting all logs..."
	docker-compose logs -f || kubectl logs -f deployment/$(APP_NAME) -n $(NAMESPACE)

help:
	@echo "📚 Available commands:"
	@echo ""
	@echo "🐳 Docker Commands:"
	@echo "  docker-build     - Build Docker image"
	@echo "  docker-dev       - Start development environment"
	@echo "  docker-prod      - Start production environment"
	@echo "  docker-run       - Run Docker container"
	@echo "  docker-push      - Push image to registry"
	@echo "  docker-clean     - Clean up Docker resources"
	@echo ""
	@echo "⚓ Kubernetes Commands:"
	@echo "  k8s-deploy       - Deploy to Kubernetes"
	@echo "  k8s-upgrade      - Upgrade Kubernetes deployment"
	@echo "  k8s-delete       - Delete Kubernetes deployment"
	@echo "  k8s-status       - Check deployment status"
	@echo "  k8s-logs         - Get application logs"
	@echo "  k8s-port-forward - Forward port to local machine"
	@echo ""
	@echo "💻 Development Commands:"
	@echo "  dev              - Start development server"
	@echo "  install          - Install dependencies"
	@echo "  build            - Build application"
	@echo "  test             - Run tests"
	@echo "  lint             - Run linter"
	@echo ""
	@echo "🔒 Security Commands:"
	@echo "  security-scan    - Run basic security scan"
	@echo "  security-full    - Run comprehensive security scan"
	@echo ""
	@echo "🚀 CI/CD Commands:"
	@echo "  ci-build         - Complete CI build process"
	@echo "  ci-test          - Run all tests and scans"
	@echo "  ci-deploy        - Deploy to production"
	@echo ""
	@echo "🛠️  Setup Commands:"
	@echo "  setup-dev        - Setup development environment"
	@echo "  setup-k8s        - Setup Kubernetes cluster"
	@echo "  setup-monitoring - Setup monitoring stack"
	@echo ""
	@echo "🔧 Utility Commands:"
	@echo "  clean            - Clean up all resources"
	@echo "  logs             - Get application logs"
	@echo "  help             - Show this help message"
	@echo ""
	@echo "📝 Examples:"
	@echo "  make docker-build VERSION=v1.0.0"
	@echo "  make k8s-deploy NAMESPACE=production"
	@echo "  make security-scan"

# Default target
.DEFAULT_GOAL := help