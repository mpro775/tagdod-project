# E2E Testing Suite

This directory contains comprehensive End-to-End (E2E) tests for the Solar Commerce backend API.

## Test Structure

```
backend/test/
├── jest-e2e.json          # Jest E2E configuration
├── test-setup.ts          # Global test setup
├── run-e2e.sh            # E2E test runner script
├── app.e2e-spec.ts       # Health check tests
├── auth.e2e-spec.ts      # Authentication tests
├── users.e2e-spec.ts     # User management tests
└── orders.e2e-spec.ts    # Order management tests
```

## Test Categories

### 1. Health Checks (`app.e2e-spec.ts`)
- **GET /health/live** - Liveness probe
- **GET /health/ready** - Readiness probe  
- **GET /health** - Comprehensive health check

### 2. Authentication (`auth.e2e-spec.ts`)
- **POST /auth/send-otp** - Send OTP to phone
- **POST /auth/verify-otp** - Verify OTP code
- **POST /auth/refresh** - Refresh access token
- **POST /auth/logout** - User logout
- **POST /auth/forgot-password** - Password reset
- **POST /auth/set-password** - Set new password

### 3. User Management (`users.e2e-spec.ts`)
- **GET /admin/users** - List users (admin)
- **GET /admin/users/:id** - Get user details (admin)
- **POST /admin/users** - Create user (admin)
- **PATCH /admin/users/:id** - Update user (admin)
- **POST /admin/users/:id/suspend** - Suspend user (admin)
- **DELETE /admin/users/:id** - Delete user (admin)
- **GET /users/analytics** - User analytics (admin)

### 4. Order Management (`orders.e2e-spec.ts`)
- **POST /checkout/preview** - Preview checkout
- **POST /checkout/confirm** - Confirm order
- **GET /orders/my** - User orders
- **GET /orders/:id** - Order details
- **POST /orders/:id/cancel** - Cancel order
- **GET /admin/orders** - List orders (admin)
- **PATCH /admin/orders/:id/status** - Update order status (admin)
- **GET /orders/analytics** - Order analytics (admin)

## Running Tests

### Prerequisites
- Node.js 20+
- MongoDB running locally or accessible
- Redis running locally or accessible

### Environment Variables
```bash
export NODE_ENV="test"
export MONGO_URI="mongodb://localhost:27017/solar-commerce-test"
export REDIS_URL="redis://localhost:6379"
export JWT_SECRET="test-jwt-secret"
export REFRESH_SECRET="test-refresh-secret"
export OTP_DEV_ECHO="true"
```

### Commands

```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests in watch mode
npm run test:e2e:watch

# Run E2E tests with coverage
npm run test:e2e:cov

# Run specific test file
npm run test:e2e -- --testNamePattern="Authentication"

# Run with custom Jest config
jest --config ./test/jest-e2e.json

# Use the test runner script
chmod +x ./test/run-e2e.sh
./test/run-e2e.sh
```

## Test Configuration

### Jest E2E Configuration (`jest-e2e.json`)
```json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testEnvironment": "node",
  "testRegex": ".e2e-spec.ts$",
  "transform": {
    "^.+\\.(t|j)s$": "ts-jest"
  },
  "collectCoverageFrom": ["src/**/*.(t|j)s"],
  "coverageDirectory": "../coverage-e2e",
  "testTimeout": 30000,
  "setupFilesAfterEnv": ["<rootDir>/test-setup.ts"]
}
```

### Test Setup (`test-setup.ts`)
- Creates NestJS application instance
- Applies global configuration
- Handles application lifecycle

## Test Data

### Mock Tokens
- `adminToken`: Mock admin JWT token
- `userToken`: Mock user JWT token

### Test Phone Numbers
- `+967123456789`: Primary test phone
- `+967987654321`: Secondary test phone

### Test ObjectIds
- `507f1f77bcf86cd799439011`: Mock user/order ID
- `507f1f77bcf86cd799439999`: Non-existent ID for 404 tests

## CI/CD Integration

The E2E tests are integrated into the GitHub Actions CI workflow:

```yaml
- name: Run E2E tests
  run: npm run test:e2e --if-present
```

## Best Practices

1. **Test Isolation**: Each test should be independent
2. **Mock Data**: Use consistent mock data across tests
3. **Error Handling**: Test both success and failure scenarios
4. **Authentication**: Test both authorized and unauthorized access
5. **Data Validation**: Test input validation and error responses
6. **Performance**: Use appropriate timeouts for async operations

## Troubleshooting

### Common Issues

1. **Database Connection**: Ensure MongoDB is running
2. **Redis Connection**: Ensure Redis is running
3. **Port Conflicts**: Check if port 3000 is available
4. **Memory Issues**: Increase Node.js memory limit if needed

### Debug Mode

```bash
# Run with debug output
DEBUG=* npm run test:e2e

# Run specific test with verbose output
npm run test:e2e -- --verbose --testNamePattern="Health Check"
```

## Coverage

E2E tests provide integration-level coverage:
- API endpoint functionality
- Authentication flows
- Authorization checks
- Data validation
- Error handling
- Response formats

## Future Enhancements

- [ ] Database seeding for consistent test data
- [ ] Parallel test execution
- [ ] Performance testing integration
- [ ] Visual regression testing
- [ ] Load testing scenarios
