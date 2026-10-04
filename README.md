# CampusConnect – Microservices Application

## Lab 7: API Gateway, Configuration-Based Service Discovery & Cloud Deployment

**Course:** Web Services and Service-Oriented Architecture (WSOA)  
**Institute:** DA-IICT  

---

## 1. Project Overview

This project builds upon Lab 6 by introducing an **API Gateway** as the single public entry point for all clients, implementing **configuration-based service discovery**, securing microservices inside a private Docker container network, and deploying the containerized microservices stack to the cloud.

| Lab | Milestone |
|-----|-----------|
| Lab 1 | CampusConnect frontend interface |
| Lab 2 | REST API integration into frontend |
| Lab 3 | RESTful web services development |
| Lab 4 | Backend with MongoDB Atlas persistence |
| Lab 5 | Monolithic API containerization with Docker & Compose |
| Lab 6 | Decomposed Backend into 3 Independent Microservices (User, Product, Order) |
| **Lab 7** | **API Gateway, Configuration-Based Service Discovery, Network Isolation & Cloud Deployment** |

---

## 2. Part A & B: Architecture Diagram & Component Design

```
+-----------------------------------------------------------------------------------+
|                                 Client / Postman                                  |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          | Public Internet / Host (Port 3000)
                                          v
+-----------------------------------------------------------------------------------+
|                                   API GATEWAY                                     |
|                             (api-gateway service)                                 |
|  - Reverse-proxy routing (/users, /products, /orders)                              |
|  - Request logging middleware                                                     |
|  - Centralized 502/503 error handling                                             |
|  - Health check endpoint (GET /health)                                            |
|  - Service Registry Configuration (Environment Variables)                         |
+---------------+-------------------------+-------------------------+---------------+
                |                         |                         |
                | campus-network          | campus-network          | campus-network
                | (Internal container)    | (Internal container)    | (Internal container)
                v                         v                         v
       +------------------+      +------------------+      +------------------+
       |   User Service   |      | Product Service  |      |  Order Service   |
       |   (user-service) |      | (product-service)|      |  (order-service) |
       |   Internal:3001  |      |   Internal:3002  |      |   Internal:3003  |
       +--------+---------+      +--------+---------+      +----+--------+----+
                |                         |                         |        |
                v                         v                         |        | REST (http://user-service:3001)
         +--------------+          +--------------+                 |        +-------------------> User Service
         |   User DB    |          |  Product DB  |                 v        |
         |  (user_db)   |          | (product_db) |           +-----------+  | REST (http://product-service:3002)
         +--------------+          +--------------+           | Order DB  |  +-------------------> Product Service
                                                              | (order_db)|
                                                              +-----------+
```

---

## 3. Microservice & Gateway Endpoints

| Gateway Path | Routed Service | Target Internal Endpoint | Allowed HTTP Methods | Description |
|--------------|----------------|--------------------------|----------------------|-------------|
| `GET /health` | API Gateway | Internal (`/health`) | `GET` | Gateway status & active service registry check |
| `GET /` | API Gateway | Internal (`/`) | `GET` | Gateway root info and route mapping overview |
| `/users/*` | User Service | `http://user-service:3001/users/*` | `GET`, `POST`, `PUT`, `DELETE` | User CRUD management via Gateway |
| `/products/*` | Product Service | `http://product-service:3002/products/*` | `GET`, `POST`, `PUT`, `DELETE` | Product catalog management via Gateway |
| `/orders/*` | Order Service | `http://order-service:3003/orders/*` | `GET`, `POST` | Order placement & validation via Gateway |

---

## 4. Discussion Questions & Theory Answers

### Q1: Why introduce an API Gateway instead of letting clients call each service directly?

Introducing an **API Gateway** provides several key architectural benefits over direct client-to-microservice communication:

1. **Single Entry Point & Simplified Client Interface**: Clients (web browsers, mobile apps, Postman) only need to know a single domain/IP (e.g. `http://localhost:3000` or `https://api.campusconnect.com`). They don't need to track multiple service hostnames or ports.
2. **Encapsulation & Hiding Internal Topology**: The gateway hides internal service architecture and port assignments (`:3001`, `:3002`, `:3003`). Backend microservices can be refactored, split, or scaled without breaking external client contracts.
3. **Network Isolation & Security**: Only the API Gateway's port is exposed to the outside network. Microservices (`user-service`, `product-service`, `order-service`) remain completely private within the internal Docker bridge network (`campus-network`), preventing unauthorized direct access.
4. **Centralized Cross-Cutting Concerns**: Authentication, rate limiting, request logging, CORS, SSL termination, and error handling are managed centrally at the gateway level rather than duplicated across every microservice.
5. **Protocol & Response Normalization**: The gateway intercepts unreachable backend failures (`ECONNREFUSED`) and standardizes them into structured `503 Service Unavailable` JSON responses.

---

### Q2: Static/Configuration-Based vs. Dynamic Service Discovery (Consul, Eureka, Kubernetes DNS)

| Feature | Static / Configuration-Based (This Lab) | Dynamic Service Discovery (Consul / Eureka / K8s DNS) |
|---------|------------------------------------------|-------------------------------------------------------|
| **Location Registry** | Configured via environment variables (`.env`, `compose.yaml`). | Maintained dynamically in a central registry (Service Registry server). |
| **Instance Updates** | Requires environment variable change & container restart. | Instances self-register upon startup and deregister on exit automatically. |
| **Scalability & Auto-scaling** | Hard to manage when spinning up multiple dynamic replicas. | Handles dynamic scale-out/scale-in automatically with built-in load balancing. |
| **Health Checks** | Gateway checks static URL availability; manual recovery. | Continuous background heartbeats; automatically ejects unhealthy instances. |
| **Complexity** | Extremely simple, lightweight, zero extra infra required. | Requires dedicated discovery server (Consul/Eureka) or orchestration (Kubernetes). |

**Conclusion:** Static configuration-based service discovery (externalizing URLs into environment variables) is ideal for small, containerized microservice applications managed via Docker Compose. For enterprise production environments with auto-scaling and dynamic IP allocations, dynamic registries like Consul, Eureka, or Kubernetes DNS are necessary.

---

## 5. Environment Variables & Service Discovery Configuration

Service locations are externalized into `api-gateway/config/services.js` and `.env` files — **no hardcoded URLs inside route handlers**:

### Gateway Configuration (`api-gateway/.env`)
```env
PORT=3000
USER_SERVICE_URL=http://user-service:3001
PRODUCT_SERVICE_URL=http://product-service:3002
ORDER_SERVICE_URL=http://order-service:3003
```

### Proving Configuration-Based Discovery Works
To change a backend service's target location (e.g. testing against a mock server on port `4001` or another container host):
1. Update `USER_SERVICE_URL` in `compose.yaml` or `.env`.
2. Restart the gateway (`docker compose restart api-gateway`).
3. Routing table updates immediately without editing any code in `server.js` or route handlers.

---

## 6. Docker Compose Configuration & Running Instructions

Only the **API Gateway** port (`3000`) and MongoDB port (`27017`) are mapped to the host machine. The microservices (`user-service`, `product-service`, `order-service`) use Docker's `expose` declaration so they are reachable **only inside `campus-network`**.

### `compose.yaml` Overview
```yaml
services:
  api-gateway:
    build: ./api-gateway
    container_name: api-gateway
    ports:
      - "3000:3000"  # Exposed externally
    environment:
      PORT: 3000
      USER_SERVICE_URL: http://user-service:3001
      PRODUCT_SERVICE_URL: http://product-service:3002
      ORDER_SERVICE_URL: http://order-service:3003
    depends_on: [user-service, product-service, order-service]

  user-service:
    build: ./user-service
    expose: ["3001"] # Internal container port only
    environment:
      MONGODB_URI: mongodb://mongodb:27017/user_db

  product-service:
    build: ./product-service
    expose: ["3002"] # Internal container port only
    environment:
      MONGODB_URI: mongodb://mongodb:27017/product_db

  order-service:
    build: ./order-service
    expose: ["3003"] # Internal container port only
    environment:
      USER_SERVICE_URL: http://user-service:3001
      PRODUCT_SERVICE_URL: http://product-service:3002
      MONGODB_URI: mongodb://mongodb:27017/order_db
```

### Docker Commands
```powershell
# 1. Build and start all services in background
docker compose up -d --build

# 2. Check running container status
docker compose ps

# 3. View API Gateway logs in real-time
docker compose logs -f api-gateway

# 4. Stop a specific service to test 503 error handling
docker compose stop user-service

# 5. Restart service after testing
docker compose start user-service

# 6. Tear down stack
docker compose down
```

---

## 7. Cloud Deployment Guide (Part C)

### Platform Choice & Setup (Render / Railway / Fly.io / AWS)
1. **Container Repository**: Push container images to Docker Hub or cloud container registry (e.g. `docker.io/<username>/campusconnect-api-gateway`).
2. **MongoDB Atlas Connection**: Update `MONGODB_URI` environment variables in cloud container settings to point to your MongoDB Atlas connection string (`mongodb+srv://...`).
3. **Service Deployment**:
   - Deploy `user-service`, `product-service`, and `order-service` as cloud web services.
   - Deploy `api-gateway` with environment variables pointing to internal/cloud service URLs:
     - `USER_SERVICE_URL=https://user-service-xyz.onrender.com`
     - `PRODUCT_SERVICE_URL=https://product-service-xyz.onrender.com`
     - `ORDER_SERVICE_URL=https://order-service-xyz.onrender.com`
4. **Public Gateway Endpoint**:
   - Gateway Public URL: `https://campusconnect-gateway.onrender.com` (or Railway/Fly.io public domain).
   - Re-run Postman collection against the public cloud URL instead of `localhost:3000`.

---

## 8. Postman Verification Test Suite

Import `postman/Microservices - Lab 7.postman_collection.json` into Postman to execute the test suite:

| Test Case | Method & Gateway URL | Expected Status | Verification Goal |
|-----------|----------------------|-----------------|-------------------|
| **1. Gateway Health Check** | `GET http://localhost:3000/health` | `200 OK` | Verify Gateway is running & lists active service registry |
| **2. Get Users via Gateway** | `GET http://localhost:3000/users` | `200 OK` | Proxied request to `user-service` |
| **3. Get User 101 via Gateway** | `GET http://localhost:3000/users/101` | `200 OK` | Specific user retrieval via Gateway proxy |
| **4. Get Products via Gateway** | `GET http://localhost:3000/products` | `200 OK` | Proxied request to `product-service` |
| **5. Create Order via Gateway** | `POST http://localhost:3000/orders` | `201 Created` | Gateway -> Order Service -> User & Product validation chain |
| **6. Unreachable Service Test** | Stop `user-service` container,<br>then `GET http://localhost:3000/users` | `503 Service Unavailable` | Gateway intercepts network error and returns clean 503 JSON |

---

## 9. Troubleshooting & Common Pitfalls

| Issue | Cause | Solution |
|-------|-------|----------|
| **Gateway returns 503 Service Unavailable** | Target container (`user-service`, `product-service`, or `order-service`) is down. | Run `docker compose ps` to check container status and `docker compose start <service>`. |
| **Cannot reach `:3001` directly from host** | Normal behaviour! Host port mapping was intentionally removed in Lab 7. | Access services through API Gateway at `http://localhost:3000/users`. |
| **Order Service returns 503 when creating order** | Order Service cannot communicate with internal User/Product containers. | Ensure `USER_SERVICE_URL` in `order-service` uses `http://user-service:3001` and shared `campus-network`. |

---

## 10. Written Reflection (Lab 7 Summary)

Transitioning from Lab 6's direct microservice access to Lab 7's API Gateway architecture significantly improved the security, maintainability, and operational clarity of the CampusConnect backend. By introducing the API Gateway as a single entry point, client applications no longer need to manage multiple port mappings or handle cross-cutting concerns like logging and error formatting independently. Configuration-based service discovery made service endpoints dynamic and environment-driven, enabling seamless switches between local Docker containers and cloud environments without altering code. Restricting host network exposure exclusively to the API Gateway enforced strict container network isolation, preventing unauthorized direct calls to backend services. Overall, this lab demonstrated how an API Gateway transforms a loosely coupled cluster of microservices into a unified, secure, enterprise-grade system ready for cloud deployment.
