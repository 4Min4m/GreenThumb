#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
IMAGE_NAME="docker.io/amin4m/greenthumb:latest"

echo -e "${GREEN}🔒 Starting Security Scan for GreenThumb${NC}"
echo "=================================================="

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Install Trivy if not exists
install_trivy() {
    if ! command_exists trivy; then
        echo -e "${YELLOW}📦 Installing Trivy...${NC}"
        if [[ "$OSTYPE" == "linux-gnu"* ]]; then
            curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin
        elif [[ "$OSTYPE" == "darwin"* ]]; then
            brew install trivy
        else
            echo -e "${RED}❌ Unsupported OS. Please install Trivy manually.${NC}"
            exit 1
        fi
    fi
}

# Build Docker image
build_image() {
    echo -e "${YELLOW}🏗️  Building Docker image...${NC}"
    docker build -t "$IMAGE_NAME" .
    echo -e "${GREEN}✅ Docker image built successfully${NC}"
}

# Scan Docker image for vulnerabilities
scan_image_vulnerabilities() {
    echo -e "${YELLOW}🔍 Scanning Docker image for vulnerabilities...${NC}"
    trivy image --severity HIGH,CRITICAL --format table "$IMAGE_NAME"
    CRITICAL_COUNT=$(trivy image --severity CRITICAL --format json "$IMAGE_NAME" | jq '.Results[]?.Vulnerabilities // [] | length' | awk '{sum += $1} END {print sum+0}')
    if [ "$CRITICAL_COUNT" -gt 0 ]; then
        echo -e "${RED}❌ Found $CRITICAL_COUNT critical vulnerabilities!${NC}"
        echo -e "${RED}🚨 Security scan failed - critical vulnerabilities detected${NC}"
        exit 1
    else
        echo -e "${GREEN}✅ No critical vulnerabilities found${NC}"
    fi
}

# Scan for secrets in codebase
scan_secrets() {
    echo -e "${YELLOW}🔐 Scanning for secrets and sensitive data...${NC}"
    if ! command_exists gitleaks; then
        echo -e "${YELLOW}📦 Installing gitleaks...${NC}"
        if [[ "$OSTYPE" == "linux-gnu"* ]]; then
            curl -sSfL https://github.com/zricethezav/gitleaks/releases/latest/download/gitleaks_8.18.0_linux_x64.tar.gz | tar xzf - -C /tmp
            sudo mv /tmp/gitleaks /usr/local/bin/
        elif [[ "$OSTYPE" == "darwin"* ]]; then
            brew install gitleaks
        fi
    fi
    if gitleaks detect --source . --report-format table --verbose; then
        echo -e "${GREEN}✅ No secrets detected${NC}"
    else
        echo -e "${RED}⚠️  Potential secrets detected${NC}"
    fi
}

# Scan Dockerfile for best practices
scan_dockerfile() {
    echo -e "${YELLOW}📋 Scanning Dockerfile for best practices...${NC}"
    if ! command_exists hadolint; then
        echo -e "${YELLOW}📦 Installing hadolint...${NC}"
        if [[ "$OSTYPE" == "linux-gnu"* ]]; then
            wget -O /tmp/hadolint https://github.com/hadolint/hadolint/releases/latest/download/hadolint-Linux-x86_64
            chmod +x /tmp/hadolint
            sudo mv /tmp/hadolint /usr/local/bin/
        elif [[ "$OSTYPE" == "darwin"* ]]; then
            brew install hadolint
        fi
    fi
    if hadolint Dockerfile --format table; then
        echo -e "${GREEN}✅ Dockerfile follows best practices${NC}"
    else
        echo -e "${YELLOW}⚠️  Dockerfile issues found${NC}"
    fi
}

# Scan Helm charts
scan_helm_charts() {
    echo -e "${YELLOW}⛵ Scanning Helm charts for security issues...${NC}"
    if ! command_exists checkov; then
        echo -e "${YELLOW}📦 Installing Checkov...${NC}"
        pip3 install checkov 2>/dev/null || echo "Please install checkov manually: pip3 install checkov"
    fi
    if command_exists checkov; then
        checkov -d helm/greenthumb/templates/ --framework kubernetes --compact
    fi
}

# Check for OWASP Top 10 issues
check_owasp_compliance() {
    echo -e "${YELLOW}🛡️  Checking OWASP compliance...${NC}"
    if grep -q "X-Frame-Options\|X-XSS-Protection\|X-Content-Type-Options" nginx.conf; then
        echo -e "${GREEN}✅ Security headers configured${NC}"
    else
        echo -e "${RED}❌ Missing security headers in nginx config${NC}"
    fi
    if grep -q "return 301 https" nginx.conf 2>/dev/null || grep -q "ssl" nginx.conf 2>/dev/null; then
        echo -e "${GREEN}✅ HTTPS configuration found${NC}"
    else
        echo -e "${YELLOW}⚠️  Consider adding HTTPS configuration${NC}"
    fi
}

# Main execution
main() {
    echo -e "${YELLOW}🚀 Starting comprehensive security scan...${NC}"
    install_trivy
    build_image
    scan_image_vulnerabilities
    scan_secrets
    scan_dockerfile
    scan_helm_charts
    check_owasp_compliance
    echo -e "${GREEN}✅ Security scan completed!${NC}"
}

# Help function
show_help() {
    cat << EOF
Security Scanner for GreenThumb Application

Usage: $0 [OPTIONS]

OPTIONS:
    --image-name NAME    Set custom image name (default: docker.io/amin4m/greenthumb:latest)
    --help              Show this help message

Examples:
    $0                                    # Run full security scan
    $0 --image-name docker.io/amin4m/greenthumb:v1.0  # Scan custom image
EOF
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --image-name)
            IMAGE_NAME="$2"
            shift 2
            ;;
        --help)
            show_help
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            show_help
            exit 1
            ;;
    esac
done

# Run main function
main