import { applyDecorators } from '@nestjs/common';
import { 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiQuery, 
  ApiBody,
  ApiBearerAuth,
  ApiTags,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiInternalServerErrorResponse
} from '@nestjs/swagger';

// ==================== Common Response Decorators ====================

export function ApiSuccessResponse(description: string, schema?: any) {
  return applyDecorators(
    ApiOkResponse({
      description,
      schema: schema || {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Operation completed successfully' },
          data: { type: 'object' }
        }
      }
    })
  );
}

export function ApiCreatedResponse(description: string, schema?: any) {
  return applyDecorators(
    ApiCreatedResponse({
      description,
      schema: schema || {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Resource created successfully' },
          data: { type: 'object' }
        }
      }
    })
  );
}

export function ApiErrorResponses() {
  return applyDecorators(
    ApiBadRequestResponse({
      description: 'Bad request - validation failed',
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 400 },
          message: { type: 'string', example: 'Validation failed' },
          error: { type: 'string', example: 'Bad Request' },
          errors: { type: 'array', items: { type: 'string' } }
        }
      }
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized - invalid or missing authentication',
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 401 },
          message: { type: 'string', example: 'Unauthorized' },
          error: { type: 'string', example: 'Unauthorized' }
        }
      }
    }),
    ApiForbiddenResponse({
      description: 'Forbidden - insufficient permissions',
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 403 },
          message: { type: 'string', example: 'Forbidden' },
          error: { type: 'string', example: 'Forbidden' }
        }
      }
    }),
    ApiNotFoundResponse({
      description: 'Not found - resource does not exist',
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 404 },
          message: { type: 'string', example: 'Resource not found' },
          error: { type: 'string', example: 'Not Found' }
        }
      }
    }),
    ApiInternalServerErrorResponse({
      description: 'Internal server error',
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 500 },
          message: { type: 'string', example: 'Internal server error' },
          error: { type: 'string', example: 'Internal Server Error' }
        }
      }
    })
  );
}

// ==================== Authentication Decorators ====================

export function ApiAuthRequired() {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiUnauthorizedResponse({
      description: 'Authentication required',
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 401 },
          message: { type: 'string', example: 'Authentication required' },
          error: { type: 'string', example: 'Unauthorized' }
        }
      }
    })
  );
}

export function ApiAdminRequired() {
  return applyDecorators(
    ApiAuthRequired(),
    ApiForbiddenResponse({
      description: 'Admin access required',
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 403 },
          message: { type: 'string', example: 'Admin access required' },
          error: { type: 'string', example: 'Forbidden' }
        }
      }
    })
  );
}

// ==================== Pagination Decorators ====================

export function ApiPaginationQuery() {
  return applyDecorators(
    ApiQuery({ 
      name: 'page', 
      required: false, 
      type: Number, 
      description: 'Page number (default: 1)',
      example: 1
    }),
    ApiQuery({ 
      name: 'limit', 
      required: false, 
      type: Number, 
      description: 'Items per page (default: 20)',
      example: 20
    })
  );
}

export function ApiPaginationResponse() {
  return ApiOkResponse({
    description: 'Paginated response',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { type: 'object' }
        },
        pagination: {
          type: 'object',
          properties: {
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 20 },
            total: { type: 'number', example: 150 },
            pages: { type: 'number', example: 8 },
            hasNext: { type: 'boolean', example: true },
            hasPrev: { type: 'boolean', example: false }
          }
        }
      }
    }
  });
}

// ==================== Search & Filter Decorators ====================

export function ApiSearchQuery() {
  return applyDecorators(
    ApiQuery({ 
      name: 'search', 
      required: false, 
      type: String, 
      description: 'Search term',
      example: 'solar panel'
    }),
    ApiQuery({ 
      name: 'sort', 
      required: false, 
      type: String, 
      description: 'Sort field',
      example: 'createdAt'
    }),
    ApiQuery({ 
      name: 'order', 
      required: false, 
      enum: ['asc', 'desc'], 
      description: 'Sort order',
      example: 'desc'
    })
  );
}

export function ApiDateRangeQuery() {
  return applyDecorators(
    ApiQuery({ 
      name: 'startDate', 
      required: false, 
      type: String, 
      description: 'Start date (ISO format)',
      example: '2024-01-01T00:00:00Z'
    }),
    ApiQuery({ 
      name: 'endDate', 
      required: false, 
      type: String, 
      description: 'End date (ISO format)',
      example: '2024-01-31T23:59:59Z'
    })
  );
}

// ==================== Product Decorators ====================

export function ApiProductFilters() {
  return applyDecorators(
    ApiQuery({ 
      name: 'categoryId', 
      required: false, 
      type: String, 
      description: 'Filter by category ID',
      example: '507f1f77bcf86cd799439011'
    }),
    ApiQuery({ 
      name: 'brandId', 
      required: false, 
      type: String, 
      description: 'Filter by brand ID',
      example: '507f1f77bcf86cd799439012'
    }),
    ApiQuery({ 
      name: 'isFeatured', 
      required: false, 
      type: Boolean, 
      description: 'Filter featured products',
      example: true
    }),
    ApiQuery({ 
      name: 'isNew', 
      required: false, 
      type: Boolean, 
      description: 'Filter new products',
      example: false
    }),
    ApiQuery({ 
      name: 'minPrice', 
      required: false, 
      type: Number, 
      description: 'Minimum price filter',
      example: 100
    }),
    ApiQuery({ 
      name: 'maxPrice', 
      required: false, 
      type: Number, 
      description: 'Maximum price filter',
      example: 1000
    })
  );
}

// ==================== Analytics Decorators ====================

export function ApiAnalyticsPeriod() {
  return applyDecorators(
    ApiQuery({ 
      name: 'period', 
      required: false, 
      enum: ['daily', 'weekly', 'monthly', 'yearly'], 
      description: 'Analytics period',
      example: 'monthly'
    }),
    ApiDateRangeQuery()
  );
}

export function ApiAnalyticsResponse() {
  return ApiOkResponse({
    description: 'Analytics data retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            kpis: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  metric: { type: 'string', example: 'totalRevenue' },
                  value: { type: 'number', example: 125000.50 },
                  change: { type: 'number', example: 15.5 },
                  currency: { type: 'string', example: 'USD' }
                }
              }
            },
            charts: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: { type: 'string', example: 'revenue' },
                  title: { type: 'string', example: 'Revenue Trends' },
                  chartType: { type: 'string', example: 'line' },
                  data: { type: 'array', items: { type: 'object' } }
                }
              }
            }
          }
        },
        period: { type: 'string', example: 'monthly' },
        date: { type: 'string', example: '2024-01-15' }
      }
    }
  });
}

// ==================== File Upload Decorators ====================

export function ApiFileUpload() {
  return applyDecorators(
    ApiBody({
      description: 'File upload',
      schema: {
        type: 'object',
        properties: {
          file: {
            type: 'string',
            format: 'binary',
            description: 'File to upload'
          }
        }
      }
    }),
    ApiOkResponse({
      description: 'File uploaded successfully',
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'File uploaded successfully' },
          data: {
            type: 'object',
            properties: {
              id: { type: 'string', example: '507f1f77bcf86cd799439011' },
              filename: { type: 'string', example: 'image.jpg' },
              url: { type: 'string', example: 'https://cdn.example.com/uploads/image.jpg' },
              size: { type: 'number', example: 1024000 },
              mimeType: { type: 'string', example: 'image/jpeg' }
            }
          }
        }
      }
    })
  );
}

// ==================== Complete Controller Decorators ====================

export function ApiController(tag: string, description?: string) {
  return applyDecorators(
    ApiTags(tag),
    ApiErrorResponses()
  );
}

export function ApiAuthController(tag: string, description?: string) {
  return applyDecorators(
    ApiController(tag, description),
    ApiAuthRequired()
  );
}

export function ApiAdminController(tag: string, description?: string) {
  return applyDecorators(
    ApiController(tag, description),
    ApiAdminRequired()
  );
}

// ==================== Common Operation Decorators ====================

export function ApiGetOperation(summary: string, description?: string) {
  return applyDecorators(
    ApiOperation({ 
      summary, 
      description: description || `Retrieve ${summary.toLowerCase()}` 
    }),
    ApiSuccessResponse(`${summary} retrieved successfully`)
  );
}

export function ApiPostOperation(summary: string, description?: string) {
  return applyDecorators(
    ApiOperation({ 
      summary, 
      description: description || `Create ${summary.toLowerCase()}` 
    }),
    ApiCreatedResponse(`${summary} created successfully`)
  );
}

export function ApiPutOperation(summary: string, description?: string) {
  return applyDecorators(
    ApiOperation({ 
      summary, 
      description: description || `Update ${summary.toLowerCase()}` 
    }),
    ApiSuccessResponse(`${summary} updated successfully`)
  );
}

export function ApiDeleteOperation(summary: string, description?: string) {
  return applyDecorators(
    ApiOperation({ 
      summary, 
      description: description || `Delete ${summary.toLowerCase()}` 
    }),
    ApiSuccessResponse(`${summary} deleted successfully`)
  );
}
