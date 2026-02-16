/**
 * PERFORMANCE TESTING SUITE (k6)
 * ==============================
 * Suite de pruebas de carga para la API de Adopción
 *
 * Escenarios:
 * 1. Browsing: Usuarios navegando animales disponibles
 * 2. Submission: Usuarios enviando solicitudes de adopción
 * 3. Mixed: Combinación realista de ambos
 *
 * Instalación de k6:
 *   - Windows: choco install k6
 *   - Mac: brew install k6
 *   - Linux: https://k6.io/docs/getting-started/installation/
 *
 * Uso:
 *   k6 run tests/performance/load_test.js
 *   k6 run --env SCENARIO=browsing tests/performance/load_test.js
 *   k6 run --env SCENARIO=submission tests/performance/load_test.js
 *   k6 run --env SCENARIO=stress tests/performance/load_test.js
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';
import { randomString, randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

// ============================================
// CONFIGURACIÓN
// ============================================

const BASE_URL = __ENV.API_URL || 'http://localhost:3000/api';
const SCENARIO = __ENV.SCENARIO || 'mixed';

// Métricas personalizadas
const errorRate = new Rate('errors');
const adoptionRequestDuration = new Trend('adoption_request_duration');
const animalListDuration = new Trend('animal_list_duration');
const successfulRequests = new Counter('successful_requests');

// ============================================
// ESCENARIOS DE CARGA
// ============================================

const scenarios = {
  // Escenario 1: Usuarios navegando (alto tráfico, bajo impacto)
  browsing: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '30s', target: 20 },  // Ramp up a 20 usuarios
      { duration: '1m', target: 50 },   // Ramp up a 50 usuarios
      { duration: '2m', target: 50 },   // Mantener 50 usuarios
      { duration: '30s', target: 0 },   // Ramp down
    ],
    gracefulRampDown: '10s',
  },

  // Escenario 2: Envío de solicitudes (pico de carga)
  submission: {
    executor: 'ramping-arrival-rate',
    startRate: 1,
    timeUnit: '1s',
    preAllocatedVUs: 20,
    maxVUs: 50,
    stages: [
      { duration: '30s', target: 5 },   // 5 solicitudes/segundo
      { duration: '1m', target: 10 },   // 10 solicitudes/segundo
      { duration: '1m', target: 10 },   // Mantener
      { duration: '30s', target: 0 },   // Ramp down
    ],
  },

  // Escenario 3: Carga mixta (realista)
  mixed: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '20s', target: 10 },
      { duration: '1m', target: 30 },
      { duration: '1m', target: 30 },
      { duration: '20s', target: 0 },
    ],
    gracefulRampDown: '10s',
  },

  // Escenario 4: Stress test
  stress: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '30s', target: 50 },
      { duration: '1m', target: 100 },
      { duration: '2m', target: 100 },
      { duration: '1m', target: 150 },  // Push beyond normal
      { duration: '30s', target: 0 },
    ],
    gracefulRampDown: '10s',
  },

  // Escenario 5: Spike test
  spike: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '10s', target: 10 },
      { duration: '10s', target: 100 }, // Spike!
      { duration: '30s', target: 100 },
      { duration: '10s', target: 10 },
      { duration: '20s', target: 0 },
    ],
    gracefulRampDown: '5s',
  },
};

// Seleccionar escenario basado en variable de entorno
export const options = {
  scenarios: {
    [SCENARIO]: scenarios[SCENARIO] || scenarios.mixed,
  },
  thresholds: {
    // 95% de requests deben completarse en menos de 500ms
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    // Menos de 5% de errores
    errors: ['rate<0.05'],
    // Métricas específicas
    animal_list_duration: ['p(95)<300'],
    adoption_request_duration: ['p(95)<800'],
  },
};

// ============================================
// DATOS DE PRUEBA
// ============================================

const ESPECIES = ['Perro', 'Gato'];
const TAMANIOS = ['Pequeño', 'Mediano', 'Grande'];
const ESTADOS = ['Disponible', 'En proceso', 'En transito'];
const TIPO_VIVIENDA = ['Casa con patio', 'Casa sin patio', 'Departamento', 'Otro'];

function generateAdoptionData(animalId) {
  return {
    animal_id: animalId,
    nombre_completo: `Test User ${randomString(8)}`,
    edad: randomIntBetween(18, 65),
    email: `test_${randomString(10)}@loadtest.com`,
    telefono_whatsapp: `11${randomIntBetween(10000000, 99999999)}`,
    ciudad_zona: `Ciudad ${randomString(5)}`,
    tipo_vivienda: TIPO_VIVIENDA[randomIntBetween(0, 3)],
    vive_solo_acompanado: randomIntBetween(0, 1) === 0 ? 'Solo' : 'Con familia',
    todos_de_acuerdo: true,
    tiene_otros_animales: randomIntBetween(0, 1) === 1,
    experiencia_previa: `Experiencia con mascotas por ${randomIntBetween(1, 20)} años`,
    puede_cubrir_gastos: true,
    motivacion: `Motivación de adopción generada para pruebas de carga. ID: ${randomString(16)}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
    compromiso_castracion: true,
    acepta_contacto: true,
  };
}

// ============================================
// FUNCIONES DE TEST
// ============================================

function browseAnimals() {
  group('Browse Animals', function () {
    // Lista de animales sin filtros
    let listStart = Date.now();
    let response = http.get(`${BASE_URL}/animals`);
    animalListDuration.add(Date.now() - listStart);

    check(response, {
      'GET /animals status 200': (r) => r.status === 200,
      'GET /animals has data': (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.success === true && Array.isArray(body.data?.animals);
        } catch {
          return false;
        }
      },
    }) || errorRate.add(1);

    if (response.status === 200) {
      successfulRequests.add(1);
    }

    sleep(randomIntBetween(1, 3));

    // Lista con filtros aleatorios
    const especie = ESPECIES[randomIntBetween(0, 1)];
    const tamanio = TAMANIOS[randomIntBetween(0, 2)];

    listStart = Date.now();
    response = http.get(`${BASE_URL}/animals?especie=${especie}&tamanio=${tamanio}`);
    animalListDuration.add(Date.now() - listStart);

    check(response, {
      'GET /animals filtered status 200': (r) => r.status === 200,
    }) || errorRate.add(1);

    if (response.status === 200) {
      successfulRequests.add(1);
    }

    sleep(randomIntBetween(1, 2));

    // Detalle de un animal aleatorio
    try {
      const animals = JSON.parse(response.body).data?.animals || [];
      if (animals.length > 0) {
        const randomAnimal = animals[randomIntBetween(0, animals.length - 1)];
        response = http.get(`${BASE_URL}/animals/${randomAnimal.id}`);

        check(response, {
          'GET /animals/:id status 200': (r) => r.status === 200,
        }) || errorRate.add(1);

        if (response.status === 200) {
          successfulRequests.add(1);
        }
      }
    } catch (e) {
      // Ignorar errores de parsing
    }

    sleep(randomIntBetween(2, 5));
  });
}

function submitAdoptionRequest() {
  group('Submit Adoption Request', function () {
    // Primero obtener un animal disponible
    let response = http.get(`${BASE_URL}/animals?estado=Disponible&limit=10`);

    if (response.status !== 200) {
      errorRate.add(1);
      return;
    }

    let animals;
    try {
      animals = JSON.parse(response.body).data?.animals || [];
    } catch {
      errorRate.add(1);
      return;
    }

    if (animals.length === 0) {
      // No hay animales disponibles
      return;
    }

    const randomAnimal = animals[randomIntBetween(0, animals.length - 1)];
    const adoptionData = generateAdoptionData(randomAnimal.id);

    const submitStart = Date.now();
    response = http.post(
      `${BASE_URL}/adoption-requests`,
      JSON.stringify(adoptionData),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
    adoptionRequestDuration.add(Date.now() - submitStart);

    // 201 = creado, 409 = duplicado (idempotencia), 429 = rate limited
    check(response, {
      'POST /adoption-requests accepted': (r) =>
        r.status === 201 || r.status === 409 || r.status === 429,
    }) || errorRate.add(1);

    if (response.status === 201) {
      successfulRequests.add(1);
    }

    sleep(randomIntBetween(3, 8));
  });
}

function mixedWorkload() {
  // 70% navegación, 30% envío de solicitudes
  if (Math.random() < 0.7) {
    browseAnimals();
  } else {
    submitAdoptionRequest();
  }
}

// ============================================
// SETUP Y TEARDOWN
// ============================================

export function setup() {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║              PERFORMANCE TEST SUITE                        ║
║                  API Adopción                              ║
╚════════════════════════════════════════════════════════════╝

Target URL: ${BASE_URL}
Scenario: ${SCENARIO}
Timestamp: ${new Date().toISOString()}
  `);

  // Verificar que el servidor está respondiendo
  const healthCheck = http.get(`${BASE_URL}/animals?limit=1`);
  if (healthCheck.status !== 200) {
    console.error(`⚠️  Server not responding correctly. Status: ${healthCheck.status}`);
    console.error(`    Make sure the server is running at ${BASE_URL}`);
  } else {
    console.log('✓ Server health check passed');
  }

  return { startTime: Date.now() };
}

export function teardown(data) {
  const duration = ((Date.now() - data.startTime) / 1000).toFixed(2);
  console.log(`
═══════════════════════════════════════════════════════════════
Test completed in ${duration} seconds
═══════════════════════════════════════════════════════════════
  `);
}

// ============================================
// FUNCIÓN PRINCIPAL
// ============================================

export default function () {
  switch (SCENARIO) {
    case 'browsing':
      browseAnimals();
      break;
    case 'submission':
      submitAdoptionRequest();
      break;
    case 'stress':
    case 'spike':
    case 'mixed':
    default:
      mixedWorkload();
      break;
  }
}

// ============================================
// RESUMEN PERSONALIZADO
// ============================================

export function handleSummary(data) {
  const summary = {
    timestamp: new Date().toISOString(),
    scenario: SCENARIO,
    baseUrl: BASE_URL,
    metrics: {
      http_reqs: data.metrics.http_reqs?.values?.count || 0,
      http_req_duration_avg: data.metrics.http_req_duration?.values?.avg?.toFixed(2) || 0,
      http_req_duration_p95: data.metrics.http_req_duration?.values['p(95)']?.toFixed(2) || 0,
      http_req_duration_p99: data.metrics.http_req_duration?.values['p(99)']?.toFixed(2) || 0,
      errors: data.metrics.errors?.values?.rate?.toFixed(4) || 0,
      successful_requests: data.metrics.successful_requests?.values?.count || 0,
    },
    thresholds: data.thresholds || {},
  };

  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    [`tests/performance/report_${SCENARIO}_${Date.now()}.json`]: JSON.stringify(summary, null, 2),
  };
}

// Helper para resumen de texto
function textSummary(data, opts) {
  const metrics = data.metrics;

  return `
╔════════════════════════════════════════════════════════════════╗
║                    PERFORMANCE TEST RESULTS                    ║
╚════════════════════════════════════════════════════════════════╝

📊 REQUEST METRICS
──────────────────────────────────────────────────────────────────
  Total Requests:     ${metrics.http_reqs?.values?.count || 0}
  Successful:         ${metrics.successful_requests?.values?.count || 0}
  Failed:             ${metrics.http_req_failed?.values?.count || 0}
  Error Rate:         ${((metrics.errors?.values?.rate || 0) * 100).toFixed(2)}%

⏱️  RESPONSE TIMES
──────────────────────────────────────────────────────────────────
  Average:            ${metrics.http_req_duration?.values?.avg?.toFixed(2) || 0} ms
  Median (p50):       ${metrics.http_req_duration?.values?.med?.toFixed(2) || 0} ms
  p90:                ${metrics.http_req_duration?.values['p(90)']?.toFixed(2) || 0} ms
  p95:                ${metrics.http_req_duration?.values['p(95)']?.toFixed(2) || 0} ms
  p99:                ${metrics.http_req_duration?.values['p(99)']?.toFixed(2) || 0} ms
  Max:                ${metrics.http_req_duration?.values?.max?.toFixed(2) || 0} ms

📈 CUSTOM METRICS
──────────────────────────────────────────────────────────────────
  Animal List (p95):  ${metrics.animal_list_duration?.values['p(95)']?.toFixed(2) || 0} ms
  Adoption Req (p95): ${metrics.adoption_request_duration?.values['p(95)']?.toFixed(2) || 0} ms

🎯 THRESHOLDS
──────────────────────────────────────────────────────────────────
  http_req_duration p95<500ms:  ${data.thresholds?.['http_req_duration{p(95)<500}'] ? '✓ PASS' : '✗ FAIL'}
  http_req_duration p99<1000ms: ${data.thresholds?.['http_req_duration{p(99)<1000}'] ? '✓ PASS' : '✗ FAIL'}
  Error rate <5%:               ${data.thresholds?.['errors{rate<0.05}'] ? '✓ PASS' : '✗ FAIL'}

══════════════════════════════════════════════════════════════════
`;
}
