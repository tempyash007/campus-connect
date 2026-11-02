# scripts/deploy-monitoring.ps1
# Deploy Prometheus & Grafana in namespace lab8

Write-Host "📊 Deploying Prometheus & Grafana Monitoring Stack..." -ForegroundColor Cyan

# Ensure lab8 namespace exists
$ns = kubectl get namespace lab8 --ignore-not-found
if (-not $ns) {
    Write-Host "📦 Creating namespace 'lab8'..." -ForegroundColor Yellow
    kubectl create namespace lab8
}

# Apply Prometheus
Write-Host "🔥 Deploying Prometheus..." -ForegroundColor Yellow
kubectl apply -f k8s/monitoring/prometheus.yaml -n lab8

# Apply Grafana
Write-Host "📈 Deploying Grafana..." -ForegroundColor Yellow
kubectl apply -f k8s/monitoring/grafana.yaml -n lab8

Write-Host "`n⏳ Waiting for monitoring pods to become ready..." -ForegroundColor Yellow
kubectl rollout status deployment/prometheus -n lab8 --timeout=60s
kubectl rollout status deployment/grafana -n lab8 --timeout=60s

Write-Host "`n📊 Monitoring Services in namespace 'lab8':" -ForegroundColor Cyan
kubectl get pods -n lab8 -l 'app in (prometheus, grafana)'
kubectl get svc -n lab8 -l 'app in (prometheus, grafana)'

Write-Host "`n✅ Monitoring Stack Deployed Successfully!" -ForegroundColor Green
Write-Host "🔥 Prometheus UI: http://localhost:30090 (or port-forward: kubectl port-forward svc/prometheus 9090:9090 -n lab8)"
Write-Host "📈 Grafana UI:    http://localhost:30030 (or port-forward: kubectl port-forward svc/grafana 3000:3000 -n lab8)"
Write-Host "🔑 Grafana Login: admin / admin"
Write-Host "💡 Import Dashboard JSON: k8s/monitoring/grafana-dashboard.json"
