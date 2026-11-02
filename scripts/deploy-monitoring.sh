#!/usr/bin/env bash
# scripts/deploy-monitoring.sh
# Deploy Prometheus & Grafana in namespace lab8

set -e

echo "📊 Deploying Prometheus & Grafana Monitoring Stack..."

# Ensure lab8 namespace exists
if ! kubectl get namespace lab8 > /dev/null 2>&1; then
    echo "📦 Creating namespace 'lab8'..."
    kubectl create namespace lab8
fi

# Apply Prometheus
echo "🔥 Deploying Prometheus..."
kubectl apply -f k8s/monitoring/prometheus.yaml -n lab8

# Apply Grafana
echo "📈 Deploying Grafana..."
kubectl apply -f k8s/monitoring/grafana.yaml -n lab8

echo ""
echo "⏳ Waiting for monitoring pods to become ready..."
kubectl rollout status deployment/prometheus -n lab8 --timeout=60s
kubectl rollout status deployment/grafana -n lab8 --timeout=60s

echo ""
echo "📊 Monitoring Services in namespace 'lab8':"
kubectl get pods -n lab8 -l 'app in (prometheus, grafana)'
kubectl get svc -n lab8 -l 'app in (prometheus, grafana)'

echo ""
echo "✅ Monitoring Stack Deployed Successfully!"
echo "🔥 Prometheus UI: http://localhost:30090 (or port-forward: kubectl port-forward svc/prometheus 9090:9090 -n lab8)"
echo "📈 Grafana UI:    http://localhost:30030 (or port-forward: kubectl port-forward svc/grafana 3000:3000 -n lab8)"
echo "🔑 Grafana Login: admin / admin"
echo "💡 Import Dashboard JSON: k8s/monitoring/grafana-dashboard.json"
