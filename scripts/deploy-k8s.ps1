# scripts/deploy-k8s.ps1
# Helper script to deploy and verify Lab 8 Kubernetes resources

Write-Host "🚀 Deploying Lab 8 Microservices on Kubernetes..." -ForegroundColor Cyan

# 1. Create lab8 namespace if it does not exist
$ns = kubectl get namespace lab8 --ignore-not-found
if (-not $ns) {
    Write-Host "📦 Creating namespace 'lab8'..." -ForegroundColor Yellow
    kubectl create namespace lab8
} else {
    Write-Host "✅ Namespace 'lab8' already exists." -ForegroundColor Green
}

# 2. Apply ConfigMap and Secrets
Write-Host "⚙️ Applying ConfigMap and Secret..." -ForegroundColor Yellow
kubectl apply -f k8s/configmap.yaml -n lab8
if (Test-Path "k8s/secret.yaml") {
    kubectl apply -f k8s/secret.yaml -n lab8
} else {
    kubectl apply -f k8s/secret.yaml.example -n lab8
}

# 3. Apply Deployments and Services
Write-Host "🚀 Applying Gateway and Microservices Deployments & Services..." -ForegroundColor Yellow
kubectl apply -f k8s/gateway-deployment.yaml -n lab8
kubectl apply -f k8s/gateway-service.yaml -n lab8
kubectl apply -f k8s/user-deployment.yaml -n lab8
kubectl apply -f k8s/user-service.yaml -n lab8
kubectl apply -f k8s/product-deployment.yaml -n lab8
kubectl apply -f k8s/product-service.yaml -n lab8
kubectl apply -f k8s/order-deployment.yaml -n lab8
kubectl apply -f k8s/order-service.yaml -n lab8

Write-Host "`n📊 Current Resource Status in namespace 'lab8':" -ForegroundColor Cyan
kubectl get deployments -n lab8
kubectl get pods -n lab8
kubectl get services -n lab8

Write-Host "`n✅ Kubernetes deployment complete!" -ForegroundColor Green
Write-Host "🌐 API Gateway is accessible via NodePort at http://localhost:30080"
Write-Host "💡 Or port-forward via: kubectl port-forward svc/api-gateway 3000:3000 -n lab8"
