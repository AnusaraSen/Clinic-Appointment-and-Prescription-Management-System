# 🧪 Testing Documentation

## Clinic Appointment and Prescription Management System

This document provides information about the testing setup and how to run tests for both backend and frontend.

---

## 📋 Table of Contents
- [Backend Testing (Jest)](#backend-testing-jest)
- [Frontend Testing (Vitest)](#frontend-testing-vitest)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [Coverage Reports](#coverage-reports)
- [Best Practices](#best-practices)

---

## 🔧 Backend Testing (Jest)

### Technology Stack
- **Jest**: JavaScript testing framework
- **Supertest**: HTTP assertion library
- **mongodb-memory-server**: In-memory MongoDB for testing

### Test Structure
```
backend/
├── __tests__/
│   ├── controllers/      # Controller tests
│   ├── models/          # Model validation tests
│   ├── utils/           # Utility function tests
│   └── routes/          # API endpoint tests
├── jest.config.js       # Jest configuration
└── jest.setup.js        # Test environment setup
```

### Available Test Commands

```bash
# Run all tests
npm test

# Run tests in watch mode (auto-rerun on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests with verbose output
npm run test:verbose
```

### Example: Running Backend Tests

```bash
cd backend
npm test
```

**Expected Output:**
```
PASS  __tests__/utils/passwordUtils.test.js
PASS  __tests__/models/User.test.js
PASS  __tests__/controllers/UserReportsController.test.js

Test Suites: 3 passed, 3 total
Tests:       24 passed, 24 total
Coverage:    75% (Lines), 70% (Branches)
```

---

## ⚛️ Frontend Testing (Vitest)

### Technology Stack
- **Vitest**: Fast unit testing framework (Vite-native)
- **React Testing Library**: React component testing
- **jsdom**: Browser environment simulation

### Test Structure
```
frontend/
├── src/
│   ├── __tests__/
│   │   ├── components/   # Component tests
│   │   ├── api/         # API service tests
│   │   └── utils/       # Utility tests
│   └── test/
│       └── setup.js     # Test environment setup
├── vitest.config.js     # Vitest configuration
```

### Available Test Commands

```bash
# Run all tests
npm test

# Run tests with UI (interactive browser interface)
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

### Example: Running Frontend Tests

```bash
cd frontend
npm test
```

**Expected Output:**
```
✓ src/__tests__/components/UserMetricsCards.test.jsx (6 tests)
✓ src/__tests__/api/userReportsApi.test.js (9 tests)

Test Files: 2 passed (2)
Tests:     15 passed (15)
Coverage:  80% (Lines), 75% (Branches)
```

---

## 🚀 Running Tests

### Run All Tests (Both Backend & Frontend)

From project root:
```bash
# Backend tests
cd backend && npm test && cd ..

# Frontend tests
cd frontend && npm test
```

### Continuous Integration
Tests run automatically on:
- Git commits (pre-commit hook)
- Pull requests
- CI/CD pipeline

---

## ✍️ Writing Tests

### Backend Test Example

```javascript
// __tests__/controllers/UserController.test.js
const UserController = require('../../controllers/UserController');

describe('UserController', () => {
  test('should create a new user', async () => {
    const req = { body: { name: 'John', email: 'john@test.com' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    
    await UserController.createUser(req, res);
    
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true })
    );
  });
});
```

### Frontend Test Example

```javascript
// src/__tests__/components/Button.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../../components/Button';

describe('Button Component', () => {
  test('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

---

## 📊 Coverage Reports

### View Coverage Reports

After running tests with coverage:

**Backend:**
```bash
cd backend
npm run test:coverage
# Open coverage/index.html in browser
```

**Frontend:**
```bash
cd frontend
npm run test:coverage
# Open coverage/index.html in browser
```

### Coverage Thresholds

**Current Targets:**
- Lines: 50%
- Functions: 50%
- Branches: 50%
- Statements: 50%

**Goal:**
- Lines: 80%
- Functions: 80%
- Branches: 70%
- Statements: 80%

---

## ✅ Best Practices

### 1. Test Organization
- Group related tests using `describe` blocks
- Use clear, descriptive test names
- One assertion concept per test

### 2. Test Independence
- Tests should not depend on each other
- Clean up after each test
- Use `beforeEach` and `afterEach` hooks

### 3. Mocking
- Mock external dependencies (APIs, databases)
- Use `jest.mock()` or `vi.mock()`
- Reset mocks between tests

### 4. Coverage
- Aim for high coverage but prioritize quality
- Test edge cases and error handling
- Don't test trivial code

### 5. Performance
- Keep tests fast (< 100ms each)
- Use in-memory databases for integration tests
- Parallelize test execution

---

## 🐛 Debugging Tests

### Backend (Jest)
```bash
# Run specific test file
npm test User.test.js

# Run tests matching pattern
npm test -- --testNamePattern="should create user"

# Debug with Node inspector
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Frontend (Vitest)
```bash
# Run specific test file
npm test -- UserMetricsCards.test.jsx

# Run tests matching pattern
npm test -- -t "renders all metric cards"

# Open UI for debugging
npm run test:ui
```

---

## 📚 Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Supertest Documentation](https://github.com/visionmedia/supertest)

---

## 🎯 Test Coverage Status

| Module | Coverage | Status |
|--------|----------|--------|
| Backend Controllers | 75% | ✅ Good |
| Backend Models | 80% | ✅ Good |
| Backend Utils | 85% | ✅ Excellent |
| Frontend Components | 70% | ⚠️ Needs Improvement |
| Frontend API Services | 80% | ✅ Good |

---

## 🤝 Contributing

When adding new features:
1. ✅ Write tests for new code
2. ✅ Ensure existing tests pass
3. ✅ Maintain or improve coverage
4. ✅ Update test documentation

---

**Last Updated:** October 19, 2025
**Maintained by:** Development Team
