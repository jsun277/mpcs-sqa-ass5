// Spike test against QuickPizza pizza recommendation feature.
// Same operational profile as loadtest.js; load profile injects a sudden surge.
import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Trend, Rate } from 'k6/metrics';

const BASE = 'https://quickpizza.grafana.com';
const TOKEN = 'abcdef0123456789';

const recoTrend = new Trend('reco_duration', true);
const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '30s', target: 50  },
    { duration: '20s', target: 500 },
    { duration: '30s', target: 500 },
    { duration: '20s', target: 50  },
    { duration: '1m',  target: 50  },
    { duration: '30s', target: 0   },
  ],
  thresholds: {
    http_req_duration: ['p(95)<1500'],
    http_req_failed:   ['rate<0.01'],
    http_reqs:         ['rate>10'],
    reco_duration:     ['p(95)<1500'],
  },
  summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(50)', 'p(95)', 'p(99)'],
};

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Token ${TOKEN}`,
};

const body = JSON.stringify({
  maxCaloriesPerSlice: 1000,
  mustBeVegetarian: false,
  excludedIngredients: [],
  excludedTools: [],
  maxNumberOfToppings: 5,
  minNumberOfToppings: 2,
  customName: '',
});

export default function () {
  group('landing', () => {
    const res = http.get(`${BASE}/`);
    const ok = check(res, { 'landing 200': (r) => r.status === 200 });
    errorRate.add(!ok);
  });

  group('recommend', () => {
    const res = http.post(`${BASE}/api/pizza`, body, { headers });
    const ok = check(res, {
      'reco 200':        (r) => r.status === 200,
      'has pizza name':  (r) => r.json('pizza.name') !== undefined,
    });
    recoTrend.add(res.timings.duration);
    errorRate.add(!ok);
  });

  sleep(1);
}
