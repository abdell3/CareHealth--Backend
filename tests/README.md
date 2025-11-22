# Tests - CareFlow EHR Backend

## Structure des Tests

```
tests/
├── unit/           # Tests unitaires (Services, Repositories)
│   ├── auth.service.test.js
│   ├── patient.service.test.js
│   ├── prescription.service.test.js
│   ├── document.service.test.js
│   ├── labOrder.service.test.js
│   └── logger.service.test.js
├── e2e/            # Tests end-to-end (Routes Express)
│   ├── auth.e2e.test.js
│   ├── patients.e2e.test.js
│   ├── prescriptions.e2e.test.js
│   ├── lab.e2e.test.js
│   └── documents.e2e.test.js
└── utils/          # Utilitaires de test
    ├── test-db.js      # Configuration MongoDB Memory Server
    ├── test-redis.js   # Configuration Redis mock
    ├── test-minio.js   # Mock MinIO/S3
    ├── mock-data.js    # Données de test
    └── test-setup.js   # Configuration globale des tests
```

## Scripts NPM

```bash
# Exécuter tous les tests
npm test

# Exécuter uniquement les tests unitaires
npm run test:unit

# Exécuter uniquement les tests E2E
npm run test:e2e

# Exécuter les tests en mode watch
npm run test:watch

# Générer le rapport de couverture
npm run coverage

# Couverture des tests unitaires uniquement
npm run coverage:unit

# Couverture des tests E2E uniquement
npm run coverage:e2e
```

## Configuration

### MongoDB Memory Server
Les tests utilisent `mongodb-memory-server` pour créer une base de données MongoDB en mémoire. Aucune configuration externe n'est requise.

### Redis Mock
Les tests utilisent le client Redis réel mais avec des opérations isolées. Les clés sont nettoyées avant/après chaque test.

### MinIO/S3 Mock
Les tests utilisent un mock MinIO pour éviter les appels réels au service de stockage. Voir `tests/utils/test-minio.js`.

## Objectifs de Couverture

- **Lignes**: ≥ 90%
- **Fonctions**: ≥ 90%
- **Branches**: ≥ 90%
- **Statements**: ≥ 90%

## Exécution des Tests

### Tests Unitaires
Les tests unitaires isolent complètement les services en mockant toutes les dépendances (repositories, services externes).

### Tests E2E
Les tests E2E utilisent Supertest pour tester les routes Express complètes avec une base de données en mémoire.

## Notes Importantes

1. **Isolation**: Chaque test est isolé et ne dépend pas d'autres tests.
2. **Nettoyage**: La base de données et Redis sont nettoyés avant/après chaque test.
3. **Mock**: Aucun service externe (email, SMS, MinIO réel) n'est appelé.
4. **Reproductibilité**: Les tests sont reproductibles et peuvent tourner en CI/CD.

## Ajout de Nouveaux Tests

### Test Unitaire
```javascript
const { expect } = require('chai');
const sinon = require('sinon');
const YourService = require('../../app/Services/YourService');

describe('YourService', () => {
  let service;
  let repository;

  beforeEach(() => {
    repository = {
      findById: sinon.stub(),
      create: sinon.stub()
    };
    service = new YourService(repository);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should do something', async () => {
    repository.findById.resolves({ id: '123' });
    const result = await service.someMethod('123');
    expect(result).to.have.property('id');
  });
});
```

### Test E2E
```javascript
const { expect } = require('chai');
const request = require('supertest');
const app = require('../../app');
const { connectDB, closeDB, clearDB } = require('../utils/test-db');

describe('YourModule E2E Tests', () => {
  before(async () => {
    await connectDB();
  });

  after(async () => {
    await closeDB();
  });

  beforeEach(async () => {
    await clearDB();
  });

  it('should create resource', async () => {
    const res = await request(app)
      .post('/api/v1/your-route')
      .send({ data: 'test' })
      .expect(201);
    
    expect(res.body).to.have.property('success', true);
  });
});
```

