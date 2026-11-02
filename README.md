# CampusConnect – Microservices Application

## Lab 8: Kubernetes Orchestration, Basic CI/CD & Monitoring

**Course:** Web Services and Service-Oriented Architecture (WSOA)  
**Institute:** DA-IICT  
**Technologies:** Kubernetes (kubectl) • GitHub Actions • Prometheus • Grafana • Docker • Node.js / Express • MongoDB Atlas

---

## 1. Project Overview & Lab Continuity

This laboratory task builds directly upon the **Lab 7 Microservices Stack** (API Gateway, User Service, Product Service, Order Service, and MongoDB Atlas) and moves it into a practical DevOps workflow:

1. **Kubernetes Orchestration:** Deploying Pods, Deployments, Services, ConfigMaps, and Secrets in a dedicated `lab8` namespace.
2. **Kubernetes Service Discovery, Scaling & Self-Healing:** Utilizing cluster-internal DNS, scaling Deployments to 3 replicas, and demonstrating self-healing pod recovery.
3. **Automated CI with GitHub Actions:** Building a workflow (`.github/workflows/ci.yml`) to test microservices and build versioned Docker images.
4. **Monitoring with Prometheus & Grafana:** Instrumenting microservices with `prom-client` at `/metrics`, scraping targets with Prometheus, and visualizing availability, traffic rates, error rates, and latency in Grafana.

### Application Flow & Architecture
```
                                Client / Postman
                                       │
                                       ▼  Port 3000 (Port-Forward / NodePort 30080)
                            ┌─────────────────────┐
                            │     API Gateway     │
                            │  (Port 3000/metrics)│
                            └──────────┬──────────┘
                                       │
                 ┌─────────────────────┼─────────────────────┐
                 │ (Internal K8s DNS)  │ (Internal K8s DNS)  │ (Internal K8s DNS)
                 ▼                     ▼                     ▼
       ┌───────────────────┐ ┌───────────────────┐ ┌───────────────────┐
       │   User Service    │ │  Product Service  │ │   Order Service   │
       │ (Port 3001/metrics│ │ (Port 3002/metrics│ │ (Port 3003/metrics│
       └─────────┬─────────┘ └─────────┬─────────┘ └─────────┬─────────┘
                 │                     │                     │
                 ▼                     ▼                     ▼
          MongoDB Atlas / Managed Database (External or Secret-configured)
                 ▲                     ▲                     ▲
                 └─────────────────────┴─────────────────────┘
                                       │
                       Prometheus Scrape (/metrics)
                                       │
                                       ▼
                             ┌───────────────────┐
                             │ Prometheus Server │ (NodePort 30090 / Port 9090)
                             └─────────┬─────────┘
                                       │
                                       ▼
                             ┌───────────────────┐
                             │ Grafana Dashboard │ (NodePort 30030 / Port 3000)
                             └───────────────────┘
```

---

## 2. Directory Structure

```
Lab 7/
├── .github/
│   └── workflows/
│       └── ci.yml                     # GitHub Actions CI workflow
├── api-gateway/                       # API Gateway (entry point, reverse proxy, /metrics)
│   ├── Dockerfile
│   ├── package.json
│   ├── server.js
│   └── test/gateway.test.js
├── user-service/                      # User CRUD microservice (/metrics, /health)
│   ├── Dockerfile
│   ├── package.json
│   ├── server.js
│   └── test/user.test.js
├── product-service/                   # Product catalog microservice (/metrics, /health)
│   ├── Dockerfile
│   ├── package.json
│   ├── server.js
│   └── test/product.test.js
├── order-service/                     # Order processing microservice (/metrics, /health)
│   ├── Dockerfile
│   ├── package.json
│   ├── server.js
│   └── test/order.test.js
├── k8s/                               # Kubernetes Manifests
│   ├── configmap.yaml                 # Non-sensitive URLs and ports
│   ├── secret.yaml.example            # Sensitive MongoDB Atlas URI template
│   ├── secret.yaml                    # Active local/atlas Secret
│   ├── gateway-deployment.yaml        # API Gateway Deployment
│   ├── gateway-service.yaml           # API Gateway NodePort Service
│   ├── user-deployment.yaml           # User Service Deployment
│   ├── user-service.yaml              # User Service ClusterIP
│   ├── product-deployment.yaml        # Product Service Deployment
│   ├── product-service.yaml           # Product Service ClusterIP
│   ├── order-deployment.yaml          # Order Service Deployment
│   ├── order-service.yaml             # Order Service ClusterIP
│   └── monitoring/                    # Prometheus & Grafana Manifests
│       ├── prometheus.yaml            # Prometheus ConfigMap, Deployment & Service
│       ├── grafana.yaml               # Grafana Deployment, Service & Datasource
│       └── grafana-dashboard.json     # Pre-configured 4-panel dashboard
├── scripts/
│   └── generate-traffic.js            # Automated traffic generator script
├── postman/
│   ├── Microservices - Lab 7.postman_collection.json
│   └── Microservices - Lab 8.postman_collection.json # Lab 8 collection
├── compose.yaml                       # Docker compose fallback/reference
└── LAB_8_IMPLEMENTATION_PLAN.md       # Comprehensive implementation plan
```

---

## 3. Kubernetes Deployment & Verification Guide (Part A)

### 3.1 Verify Kubernetes Environment
Ensure Docker Desktop Kubernetes, Minikube, or your cloud cluster is running:
```bash
kubectl config current-context
kubectl get nodes
```

### 3.2 Create the `lab8` Namespace
```bash
kubectl create namespace lab8
```

### 3.3 Apply Configuration & Microservice Manifests
```bash
# 1. Apply Secret and ConfigMap
kubectl apply -f k8s/secret.yaml -n lab8
kubectl apply -f k8s/configmap.yaml -n lab8

# 2. Apply all microservice Deployments and Services
kubectl apply -f k8s/ -n lab8
```

### 3.4 Verify Workload Status
```bash
kubectl get deployments -n lab8
kubectl get pods -n lab8
kubectl get services -n lab8
```

### 3.5 Expose & Test the Gateway
The gateway is exposed via NodePort on port `30080`, or can be port-forwarded directly:
```bash
# Option A: Direct port-forward to port 3000
kubectl port-forward svc/api-gateway 3000:3000 -n lab8

# Option B: Access via NodePort directly
http://localhost:30080
```

Verify via cURL or Postman:
```bash
curl http://localhost:3000/health
curl http://localhost:3000/users
curl http://localhost:3000/products
curl http://localhost:3000/orders
```

---

## 4. Scaling & Self-Healing Demonstrations

### 4.1 Horizontal Scaling
Scale the `user-service` deployment from 1 replica to 3:
```bash
kubectl scale deployment user-service --replicas=3 -n lab8
kubectl get pods -n lab8 -l app=user-service
```
*Observation:* Kubernetes spins up 2 additional Pods and the ClusterIP Service automatically distributes internal traffic across all 3 replicas.

### 4.2 Self-Healing Demonstration
Delete an active `user-service` pod to demonstrate automated container recovery:
```bash
# 1. Identify a pod name
kubectl get pods -n lab8 -l app=user-service

# 2. Delete the pod
kubectl delete pod <user-service-pod-name> -n lab8

# 3. Observe Kubernetes immediately provisioning a replacement pod
kubectl get pods -n lab8 -l app=user-service
```
*Observation:* The Deployment controller detects that the desired replica count is not met and automatically provisions a new Pod to maintain system availability.

---

## 5. Basic GitHub Actions CI Workflow (Part B)

The CI workflow is configured in [`.github/workflows/ci.yml`](file:///.github/workflows/ci.yml).

### Workflow Triggers & Execution Steps:
1. **Trigger:** Runs automatically on `push` and `pull_request` to `main` and `master`.
2. **Matrix Strategy:** Parallelized across all 4 microservices:
   - `api-gateway`
   - `user-service`
   - `product-service`
   - `order-service`
3. **Execution Steps:**
   - **Checkout:** Fetches code using `actions/checkout@v4`.
   - **Node.js Setup:** Installs Node.js 20 using `actions/setup-node@v4`.
   - **Dependency Installation:** Runs `npm ci` (or `npm install`).
   - **Automated Tests:** Executes `npm test` verifying endpoint health and metric registration.
   - **Docker Build:** Builds Docker image tagged with `lab7-<service>:${{ github.sha }}` and `:latest`.

---

## 6. Monitoring with Prometheus & Grafana (Part C)

### 6.1 Deploy Prometheus & Grafana in Kubernetes
```bash
kubectl apply -f k8s/monitoring/prometheus.yaml -n lab8
kubectl apply -f k8s/monitoring/grafana.yaml -n lab8
```

### 6.2 Accessing Prometheus & Grafana
- **Prometheus UI:** Access at `http://localhost:30090` (or `kubectl port-forward svc/prometheus 9090:9090 -n lab8`).
  - Navigate to **Status -> Targets** to verify all 4 services report **UP** (`1/1`).
- **Grafana UI:** Access at `http://localhost:30030` (or `kubectl port-forward svc/grafana 3000:3000 -n lab8`).
  - Default login: `admin` / `admin`
  - Import Dashboard: Go to **Dashboards -> Import** and upload [`k8s/monitoring/grafana-dashboard.json`](file:///k8s/monitoring/grafana-dashboard.json).

### 6.3 Prometheus Queries & Monitoring Questions

| Monitoring Question | Prometheus Query (PromQL) | Panel Type |
|---|---|---|
| **Are targets reachable?** | `up` | Single Stat (UP/DOWN) |
| **How much traffic is arriving?** | `sum(rate(http_requests_total[1m])) by (service, route)` | Time Series (req/s) |
| **Are failures increasing?** | `sum(rate(http_requests_total{status=~"4..|5.."}[1m])) by (service, status)` | Bar Chart / Time Series |
| **How long are requests taking?** | `histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[1m])) by (le))` | Time Series (Latency p95) |

### 6.4 Generating Traffic for Observation
Run the automated traffic generator script:
```bash
# Send 60 requests through the API Gateway
node scripts/generate-traffic.js http://localhost:3000 60

# Or via NodePort
node scripts/generate-traffic.js http://localhost:30080 60
```
Open Grafana to observe real-time spikes in the request rate, latency, and error tracking panels.

---

## 7. Submission Deliverables & Verification Checklist

| No. | Evidence / Deliverable | How to Demonstrate |
|:---:|---|---|
| **1** | Lab 7 Baseline | Gateway request/response (`curl http://localhost:3000/health`) |
| **2** | Kubernetes Environment | `kubectl config current-context` & `kubectl get nodes` |
| **3** | Manifests | Files in `k8s/` and `k8s/monitoring/` |
| **4** | Deployment Status | `kubectl get deployments,pods,services -n lab8` |
| **5** | Gateway Test | Postman execution against `http://localhost:3000` or `http://localhost:30080` |
| **6** | Scaling | `kubectl scale deployment user-service --replicas=3 -n lab8` |
| **7** | Self-Healing | `kubectl delete pod <user-service-pod>` showing new replacement pod |
| **8** | Troubleshooting | Output from `kubectl describe pod` and `kubectl logs` |
| **9** | GitHub Actions | Completed green CI workflow run in GitHub Actions tab |
| **10** | Prometheus Targets & Query | Target state UP + executing `rate(http_requests_total[5m])` |
| **11** | Grafana Dashboard | 4-panel dashboard showing live metrics |
| **12** | Traffic Generation | Before and after traffic graph comparison |
| **13** | Architecture | Architecture diagram shown in Section 1 |
