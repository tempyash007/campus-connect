#!/usr/bin/env bash
# scripts/deploy-k8s.sh
# Helper script to deploy and verify Lab 8 Kubernetes resources

set -e

echo "🚀 Deploying Lab 8 Microservices on Kubernetes..."

# 1. Create lab8 namespace if it does not exist
if ! kubectl get namespace lab8 > /dev/null 2>&1; then
    echo "📦 Creating namespace 'lab8'..."
    kubectl create namespace lab8
else
    echo "✅ Namespace 'lab8' already exists."
fi

# 2. Apply ConfigMap and Secrets
echo "⚙️ Applying ConfigMap and Secret..."
kubectl apply -f k8s/configmap.yaml -n lab8
if [ -f "k8s/secret.yaml" ]; then
    kubectl apply -f k8s/secret.yaml -n lab8
else
    kubectl apply -f k8s/secret.yaml.example -n lab8
fi

# 3. Apply Deployments and Services
echo "🚀 Applying Gateway and Microservices Deployments & Services..."
kubectl apply -f k8s/gateway-deployment.yaml -n lab8
kubectl apply -f k8s/gateway-service.yaml -n lab8
kubectl apply -f k8s/user-deployment.yaml -n lab8
kubectl apply -f k8s/user-service.yaml -n lab8
kubectl apply -f k8s/product-deployment.yaml -n lab8
kubectl apply -f k8s/product-service.yaml -n lab8
kubectl apply -f k8s/order-deployment.yaml -n lab8
kubectl apply -f k8s/order-service.yaml -n lab8

echo ""
echo "📊 Current Resource Status in namespace 'lab8':"
kubectl get deployments -n lab8
kubectl get pods -n lab8
kubectl get services -n lab8

echo ""
echo "✅ Kubernetes deployment complete!"
echo "🌐 API Gateway is accessible via NodePort at http://localhost:30080"
echo "💡 Or port-forward via: kubectl port-forward svc/api-gateway 3000:3000 -n lab8"
