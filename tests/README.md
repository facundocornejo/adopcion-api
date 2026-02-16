# Test Suites

Este directorio contiene las suites de testing automatizado para la API de Adopción.

## Estructura

```
tests/
├── security/
│   ├── security_audit.js    # Tests de seguridad (OWASP Top 10)
│   └── payloads.json        # Payloads maliciosos para pruebas
├── performance/
│   └── load_test.js         # Tests de carga con k6
└── README.md                # Este archivo
```

---

## Security Audit

Suite de pruebas de seguridad que verifica protecciones contra vulnerabilidades OWASP Top 10.

### Requisitos

```bash
# El servidor debe estar corriendo
npm run dev

# Dependencias (ya incluidas en el proyecto)
npm install axios
```

### Ejecución

```bash
# Ejecución básica
node tests/security/security_audit.js

# Con credenciales personalizadas
ORG1_EMAIL=admin@org1.com ORG1_PASSWORD=pass123 node tests/security/security_audit.js

# Apuntando a otro servidor
API_URL=https://api.produccion.com/api node tests/security/security_audit.js
```

### Variables de Entorno

| Variable | Descripción | Default |
|----------|-------------|---------|
| `API_URL` | URL base de la API | `http://localhost:3000/api` |
| `ORG1_EMAIL` | Email admin organización 1 | `admin@adopcion.com` |
| `ORG1_PASSWORD` | Password admin org 1 | `admin123` |
| `ORG2_EMAIL` | Email admin organización 2 | `admin2@adopcion.com` |
| `ORG2_PASSWORD` | Password admin org 2 | `admin123` |

### Tests incluidos

| Categoría | Tests |
|-----------|-------|
| **A01: Broken Access Control** | IDOR, Multi-tenancy, Privilege Escalation |
| **A07: Auth Failures** | Tokens inválidos, expirados, credenciales incorrectas |
| **A03: Injection** | XSS, SQL Injection, NoSQL Injection |
| **Rate Limiting** | Login, Adoption requests |
| **Idempotency** | Duplicate request prevention |

### Output

El script genera:
- Resultados en consola con colores
- Archivo JSON con reporte detallado: `security_report_<timestamp>.json`
- Exit code 1 si hay tests fallidos (útil para CI/CD)

---

## Performance Testing (k6)

Suite de pruebas de carga usando k6 para medir rendimiento bajo diferentes condiciones.

### Instalación de k6

```bash
# Windows (con Chocolatey)
choco install k6

# Windows (con winget)
winget install k6

# macOS
brew install k6

# Linux (Debian/Ubuntu)
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

### Ejecución

```bash
# Test mixto (default)
k6 run tests/performance/load_test.js

# Escenario específico
k6 run --env SCENARIO=browsing tests/performance/load_test.js
k6 run --env SCENARIO=submission tests/performance/load_test.js
k6 run --env SCENARIO=stress tests/performance/load_test.js
k6 run --env SCENARIO=spike tests/performance/load_test.js

# Apuntando a otro servidor
k6 run --env API_URL=https://api.produccion.com/api tests/performance/load_test.js

# Con más usuarios
k6 run --vus 100 --duration 5m tests/performance/load_test.js
```

### Escenarios disponibles

| Escenario | Descripción | Usuarios | Duración |
|-----------|-------------|----------|----------|
| `browsing` | Navegación de animales | 0→50 VUs | ~4 min |
| `submission` | Envío de solicitudes | 5-10 req/s | ~3 min |
| `mixed` | 70% browse, 30% submit | 0→30 VUs | ~2.5 min |
| `stress` | Carga extrema | 0→150 VUs | ~5 min |
| `spike` | Pico repentino | 10→100→10 VUs | ~1.5 min |

### Thresholds (Umbrales de éxito)

| Métrica | Umbral | Descripción |
|---------|--------|-------------|
| `http_req_duration p(95)` | < 500ms | 95% de requests bajo 500ms |
| `http_req_duration p(99)` | < 1000ms | 99% de requests bajo 1s |
| `errors` | < 5% | Menos de 5% de errores |
| `animal_list_duration p(95)` | < 300ms | Listar animales rápido |
| `adoption_request_duration p(95)` | < 800ms | Crear solicitud aceptable |

### Output

- Resumen en consola con métricas clave
- Archivo JSON: `tests/performance/report_<scenario>_<timestamp>.json`

---

## Integración con npm

```bash
# Ejecutar security audit
npm run test:security

# Ejecutar load tests
npm run test:load
npm run test:load:stress
npm run test:load:spike
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
# .github/workflows/test.yml
name: Security & Performance Tests

on: [push, pull_request]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run dev &
      - run: sleep 5
      - run: npm run test:security

  performance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: grafana/k6-action@v0.3.0
        with:
          filename: tests/performance/load_test.js
        env:
          API_URL: http://localhost:3000/api
```

---

## Interpretación de Resultados

### Security Audit

```
✓ PASS - El sistema bloqueó el ataque correctamente
✗ FAIL - Vulnerabilidad detectada, requiere atención
⚠ WARN - Comportamiento a revisar (no crítico)
```

### Performance Tests

```
p95 < 500ms  → Excelente
p95 500-1000ms → Aceptable
p95 > 1000ms → Requiere optimización

Error rate < 1% → Excelente
Error rate 1-5% → Aceptable bajo carga
Error rate > 5% → Problema de estabilidad
```

---

## Troubleshooting

### "ECONNREFUSED"
El servidor no está corriendo. Ejecuta `npm run dev` primero.

### "No hay animales para probar"
La base de datos está vacía. Ejecuta `npm run db:seed` primero.

### "Rate limited" en todos los tests
Espera unos minutos o reinicia el servidor para resetear los contadores.

### k6 no encontrado
Instala k6 siguiendo las instrucciones de arriba para tu sistema operativo.
