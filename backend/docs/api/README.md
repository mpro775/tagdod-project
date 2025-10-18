# Tagadod API Documentation

This directory contains the automatically generated OpenAPI specifications for the Tagadod API.

## Files

- `openapi.json` - OpenAPI specification in JSON format
- `openapi.yaml` - OpenAPI specification in YAML format

## Generation

The OpenAPI specifications are automatically generated when the application starts. You can also generate them manually using:

```bash
# Generate documentation
npm run docs:generate

# Or just export OpenAPI specs
npm run docs:openapi
```

## Usage

### Swagger UI
Access the interactive API documentation at: `http://localhost:3000/api/docs`

### OpenAPI Files
Use the generated OpenAPI files with:
- **Postman**: Import the JSON/YAML files
- **Insomnia**: Import the JSON/YAML files  
- **Code Generation**: Use tools like `openapi-generator` to generate client SDKs
- **API Testing**: Use tools like `newman` with Postman collections

## Client SDK Generation

Generate client SDKs for different languages:

```bash
# Install openapi-generator
npm install -g @openapitools/openapi-generator-cli

# Generate TypeScript client
openapi-generator-cli generate -i docs/api/openapi.yaml -g typescript-axios -o client-sdk/typescript

# Generate Python client
openapi-generator-cli generate -i docs/api/openapi.yaml -g python -o client-sdk/python

# Generate Java client
openapi-generator-cli generate -i docs/api/openapi.yaml -g java -o client-sdk/java
```

## API Features

- **Authentication**: JWT Bearer token authentication
- **Multi-language**: Arabic and English support
- **Analytics**: Advanced analytics and reporting
- **Real-time**: WebSocket support for notifications
- **File Upload**: Media and document upload capabilities
- **Search**: Advanced product search and filtering
- **Cart**: Shopping cart with guest and user support
- **Orders**: Complete order management system
- **Support**: Customer support ticket system
- **Marketing**: Campaign and promotion management
