# 📊 أمثلة API للنظام الإحصائي والتقارير

## جدول المحتويات
1. [التحليلات الأساسية](#التحليلات-الأساسية)
2. [التقارير المتقدمة](#التقارير-المتقدمة)
3. [المقاييس الفورية](#المقاييس-الفورية)
4. [تحليلات المبيعات](#تحليلات-المبيعات)
5. [تحليلات المنتجات](#تحليلات-المنتجات)
6. [تحليلات العملاء](#تحليلات-العملاء)
7. [التقارير المالية](#التقارير-المالية)
8. [تحليلات السلة](#تحليلات-السلة)
9. [التصدير والمقارنات](#التصدير-والمقارنات)

---

## التحليلات الأساسية

### 1. الحصول على Dashboard الرئيسي

**Request:**
```http
GET /api/analytics/dashboard?period=monthly&compareWithPrevious=true
Authorization: Bearer {your_jwt_token}
```

**Response:**
```json
{
  "overview": {
    "totalUsers": 1500,
    "totalRevenue": 2500000,
    "totalOrders": 850,
    "activeServices": 45,
    "openSupportTickets": 12,
    "systemHealth": 98.5
  },
  "revenueCharts": {
    "daily": [
      {
        "date": "2024-01-01",
        "revenue": 85000,
        "orders": 28
      },
      {
        "date": "2024-01-02",
        "revenue": 92000,
        "orders": 31
      }
    ],
    "monthly": [
      {
        "month": "2024-01",
        "revenue": 2500000,
        "growth": 15.5
      }
    ],
    "byCategory": [
      {
        "category": "Solar Panels",
        "revenue": 1250000,
        "percentage": 50
      },
      {
        "category": "Inverters",
        "revenue": 750000,
        "percentage": 30
      }
    ]
  },
  "userCharts": {
    "registrationTrend": [...],
    "userTypes": [...],
    "geographic": [...]
  },
  "productCharts": {
    "topSelling": [...],
    "categoryPerformance": [...],
    "stockAlerts": [...]
  },
  "serviceCharts": {
    "requestTrend": [...],
    "engineerPerformance": [...],
    "responseTimes": {...}
  },
  "supportCharts": {
    "ticketTrend": [...],
    "categoryBreakdown": [...],
    "agentPerformance": [...]
  },
  "kpis": {
    "revenueGrowth": 15.5,
    "customerSatisfaction": 4.2,
    "orderConversion": 12.5,
    "serviceEfficiency": 87.3,
    "supportResolution": 94.1,
    "systemUptime": 99.9
  }
}
```

### 2. الحصول على KPIs فقط

**Request:**
```http
GET /api/analytics/kpis?period=monthly
Authorization: Bearer {your_jwt_token}
```

**Response:**
```json
{
  "data": {
    "revenueGrowth": 15.5,
    "customerSatisfaction": 4.2,
    "orderConversion": 12.5,
    "serviceEfficiency": 87.3,
    "supportResolution": 94.1,
    "systemUptime": 99.9
  },
  "period": "monthly"
}
```

### 3. مقاييس الأداء

**Request:**
```http
GET /api/analytics/performance
Authorization: Bearer {your_jwt_token}
```

**Response:**
```json
{
  "apiResponseTime": 245,
  "errorRate": 0.02,
  "uptime": 99.9,
  "concurrentUsers": 1250,
  "memoryUsage": 75.5,
  "cpuUsage": 45.2,
  "diskUsage": 68.3,
  "activeConnections": 5,
  "slowestEndpoints": [
    {
      "endpoint": "/api/search",
      "method": "GET",
      "averageTime": 1200,
      "maxTime": 5000,
      "callCount": 5000
    }
  ],
  "databaseStats": {
    "totalCollections": 12,
    "totalDocuments": 50000,
    "databaseSize": 500000000,
    "indexSize": 50000000
  }
}
```

---

## التقارير المتقدمة

### 1. إنشاء تقرير مبيعات متقدم

**Request:**
```http
POST /api/analytics/advanced/reports/generate
Authorization: Bearer {your_jwt_token}
Content-Type: application/json

{
  "title": "تقرير المبيعات الشهري - يناير 2024",
  "titleEn": "Monthly Sales Report - January 2024",
  "description": "تقرير شامل للمبيعات والإيرادات خلال شهر يناير",
  "category": "sales",
  "priority": "high",
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "filters": {
    "categories": ["solar_panels", "inverters"],
    "brands": ["brand1", "brand2"],
    "regions": ["Riyadh", "Jeddah", "Dubai"],
    "paymentMethods": ["COD", "ONLINE"],
    "orderStatus": ["COMPLETED", "DELIVERED"]
  },
  "exportSettings": {
    "formats": ["pdf", "excel"],
    "includeCharts": true,
    "includeRawData": false,
    "customBranding": {
      "logo": "https://cdn.example.com/logo.png",
      "companyName": "شركة الطاقة الشمسية",
      "colors": {
        "primary": "#007bff",
        "secondary": "#6c757d"
      }
    }
  },
  "compareWithPrevious": true,
  "includeRecommendations": true,
  "generateCharts": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "تم إنشاء التقرير بنجاح",
  "data": {
    "reportId": "REP-2024-00001",
    "title": "تقرير المبيعات الشهري - يناير 2024",
    "titleEn": "Monthly Sales Report - January 2024",
    "category": "sales",
    "priority": "high",
    "status": "completed",
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-01-31T23:59:59.999Z",
    "generatedAt": "2024-02-01T10:00:00.000Z",
    
    "summary": {
      "totalRecords": 850,
      "totalValue": 2500000,
      "currency": "YER",
      "growth": 15.5,
      "comparison": {
        "previousPeriod": 2000000,
        "difference": 500000,
        "percentageChange": 25
      }
    },
    
    "salesAnalytics": {
      "totalSales": 2500000,
      "totalOrders": 850,
      "totalRevenue": 2500000,
      "averageOrderValue": 2941.18,
      "totalDiscount": 150000,
      "netRevenue": 2350000,
      
      "topSellingProducts": [
        {
          "productId": "prod_001",
          "name": "Solar Panel 300W",
          "quantity": 150,
          "revenue": 450000
        },
        {
          "productId": "prod_002",
          "name": "Inverter 5KW",
          "quantity": 80,
          "revenue": 400000
        }
      ],
      
      "salesByDate": [
        {
          "date": "2024-01-01",
          "sales": 85000,
          "orders": 28,
          "revenue": 85000
        }
      ],
      
      "salesByCategory": [
        {
          "categoryId": "cat_001",
          "categoryName": "Solar Panels",
          "sales": 1250000,
          "revenue": 1250000,
          "percentage": 50
        }
      ],
      
      "salesByRegion": [
        {
          "region": "Riyadh Region",
          "city": "Riyadh",
          "sales": 800000,
          "revenue": 800000
        }
      ],
      
      "paymentMethods": [
        {
          "method": "COD",
          "count": 500,
          "amount": 1500000,
          "percentage": 60
        },
        {
          "method": "ONLINE",
          "count": 350,
          "amount": 1000000,
          "percentage": 40
        }
      ]
    },
    
    "insights": [
      "إجمالي الإيرادات بلغ 2,500,000 ريال بزيادة 15.5% عن الشهر السابق",
      "الألواح الشمسية تمثل 50% من إجمالي المبيعات",
      "مدينة الرياض تساهم بـ 32% من إجمالي الإيرادات",
      "الدفع عند الاستلام (COD) لا يزال الطريقة الأكثر استخداماً بنسبة 60%"
    ],
    
    "insightsEn": [
      "Total revenue reached 2,500,000 SAR with 15.5% increase from previous month",
      "Solar Panels represent 50% of total sales",
      "Riyadh city contributes 32% of total revenue",
      "Cash on Delivery (COD) remains the most used payment method at 60%"
    ],
    
    "recommendations": [
      "يُنصح بزيادة المخزون من الألواح الشمسية 300W لتلبية الطلب المتزايد",
      "تقديم عروض ترويجية على الإنفيرترات لزيادة المبيعات",
      "تحسين خيارات الدفع الإلكتروني لزيادة نسبة استخدامها",
      "التوسع في مدن جدة ودبي لزيادة الإيرادات"
    ],
    
    "recommendationsEn": [
      "Recommended to increase inventory of 300W Solar Panels to meet growing demand",
      "Offer promotional deals on Inverters to boost sales",
      "Improve online payment options to increase adoption rate",
      "Expand in Jeddah and Dubai cities to increase revenue"
    ],
    
    "alerts": [
      {
        "type": "warning",
        "message": "معدل الخصم مرتفع نسبياً (6%)",
        "messageEn": "Discount rate is relatively high (6%)",
        "severity": "medium",
        "actionRequired": true
      },
      {
        "type": "info",
        "message": "متوسط قيمة الطلب زاد بنسبة 5.88%",
        "messageEn": "Average order value increased by 5.88%",
        "severity": "low",
        "actionRequired": false
      }
    ],
    
    "chartsData": {
      "timeSeries": [...],
      "pieCharts": [...],
      "barCharts": [...],
      "lineCharts": [...]
    },
    
    "previousPeriodComparison": {
      "enabled": true,
      "startDate": "2023-12-01T00:00:00.000Z",
      "endDate": "2023-12-31T23:59:59.999Z",
      "metrics": {
        "revenue": {
          "current": 2500000,
          "previous": 2000000,
          "change": 500000,
          "percentageChange": 25
        },
        "orders": {
          "current": 850,
          "previous": 720,
          "change": 130,
          "percentageChange": 18.06
        }
      }
    },
    
    "exportedFiles": [
      "https://cdn.example.com/reports/REP-2024-00001.pdf",
      "https://cdn.example.com/reports/REP-2024-00001.xlsx"
    ],
    
    "metadata": {
      "processingTime": 3500,
      "dataSourceVersion": "1.0.0",
      "reportVersion": "1.0.0",
      "generationMode": "manual",
      "tags": ["sales", "monthly", "january"]
    }
  }
}
```

### 2. قائمة التقارير

**Request:**
```http
GET /api/analytics/advanced/reports?page=1&limit=20&category=sales
Authorization: Bearer {your_jwt_token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "reportId": "REP-2024-00001",
      "title": "تقرير المبيعات الشهري - يناير 2024",
      "category": "sales",
      "priority": "high",
      "status": "completed",
      "generatedAt": "2024-02-01T10:00:00.000Z",
      "summary": {
        "totalRecords": 850,
        "totalValue": 2500000,
        "currency": "YER",
        "growth": 15.5
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

### 3. تصدير تقرير

**Request:**
```http
POST /api/analytics/advanced/reports/REP-2024-00001/export
Authorization: Bearer {your_jwt_token}
Content-Type: application/json

{
  "format": "pdf",
  "includeCharts": true,
  "includeRawData": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "تم تصدير التقرير بنجاح",
  "data": {
    "reportId": "REP-2024-00001",
    "format": "pdf",
    "fileUrl": "https://cdn.example.com/reports/REP-2024-00001.pdf",
    "generatedAt": "2024-02-01T11:00:00.000Z"
  }
}
```

---

## المقاييس الفورية

### الحصول على المقاييس الفورية

**Request:**
```http
GET /api/analytics/advanced/realtime
Authorization: Bearer {your_jwt_token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "activeUsers": 150,
    "activeOrders": 25,
    "todaySales": 125000,
    "monthSales": 2500000,
    "todayOrders": 45,
    "todayNewCustomers": 12,
    "currentConversionRate": 3.5,
    "currentAverageOrderValue": 2777.78,
    "todayAbandonedCarts": 18,
    
    "recentOrders": [
      {
        "orderId": "66a1b2c3d4e5f6g7h8i9",
        "orderNumber": "ORD-2024-00850",
        "amount": 3500,
        "status": "PROCESSING",
        "createdAt": "2024-02-01T10:45:00.000Z"
      }
    ],
    
    "topViewedProducts": [
      {
        "productId": "prod_001",
        "name": "Solar Panel 300W",
        "views": 345
      }
    ],
    
    "systemHealth": 98.5,
    "lastUpdated": "2024-02-01T11:00:00.000Z"
  }
}
```

---

## تحليلات المبيعات

### تحليل مبيعات تفصيلي

**Request:**
```http
GET /api/analytics/advanced/sales?startDate=2024-01-01&endDate=2024-01-31&groupBy=daily&categories=solar_panels,inverters&regions=Riyadh,Jeddah
Authorization: Bearer {your_jwt_token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalSales": 2500000,
    "totalOrders": 850,
    "totalRevenue": 2500000,
    "averageOrderValue": 2941.18,
    "totalDiscount": 150000,
    "netRevenue": 2350000,
    
    "topSellingProducts": [
      {
        "productId": "prod_001",
        "name": "Solar Panel 300W",
        "quantity": 150,
        "revenue": 450000
      },
      {
        "productId": "prod_002",
        "name": "Inverter 5KW",
        "quantity": 80,
        "revenue": 400000
      },
      {
        "productId": "prod_003",
        "name": "Battery 200Ah",
        "quantity": 60,
        "revenue": 300000
      }
    ],
    
    "salesByDate": [
      {
        "date": "2024-01-01",
        "sales": 85000,
        "orders": 28,
        "revenue": 85000
      },
      {
        "date": "2024-01-02",
        "sales": 92000,
        "orders": 31,
        "revenue": 92000
      }
    ],
    
    "salesByCategory": [
      {
        "categoryId": "cat_001",
        "categoryName": "الألواح الشمسية",
        "sales": 1250000,
        "revenue": 1250000,
        "percentage": 50
      },
      {
        "categoryId": "cat_002",
        "categoryName": "الإنفيرترات",
        "sales": 750000,
        "revenue": 750000,
        "percentage": 30
      }
    ],
    
    "salesByRegion": [
      {
        "region": "منطقة الرياض",
        "city": "الرياض",
        "sales": 800000,
        "revenue": 800000
      },
      {
        "region": "منطقة مكة",
        "city": "جدة",
        "sales": 600000,
        "revenue": 600000
      }
    ],
    
    "paymentMethods": [
      {
        "method": "COD",
        "count": 500,
        "amount": 1500000,
        "percentage": 60
      },
      {
        "method": "ONLINE",
        "count": 350,
        "amount": 1000000,
        "percentage": 40
      }
    ]
  },
  "query": {
    "startDate": "2024-01-01",
    "endDate": "2024-01-31",
    "groupBy": "daily",
    "categories": ["solar_panels", "inverters"],
    "regions": ["Riyadh", "Jeddah"]
  }
}
```

---

## تحليلات المنتجات

### أداء المنتجات

**Request:**
```http
GET /api/analytics/advanced/products/performance?startDate=2024-01-01&endDate=2024-01-31&limit=10&sortBy=revenue&sortOrder=desc
Authorization: Bearer {your_jwt_token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalProducts": 250,
    "activeProducts": 230,
    "outOfStock": 15,
    "lowStock": 25,
    
    "topPerformers": [
      {
        "productId": "prod_001",
        "name": "Solar Panel 300W",
        "views": 5000,
        "sales": 150,
        "revenue": 450000,
        "rating": 4.8
      },
      {
        "productId": "prod_002",
        "name": "Inverter 5KW",
        "views": 3500,
        "sales": 80,
        "revenue": 400000,
        "rating": 4.7
      }
    ],
    
    "underPerformers": [
      {
        "productId": "prod_050",
        "name": "Solar Panel 100W",
        "views": 150,
        "sales": 5,
        "lastSold": "2024-01-15T10:00:00.000Z"
      }
    ],
    
    "categoryBreakdown": [
      {
        "categoryId": "cat_001",
        "name": "الألواح الشمسية",
        "productCount": 50,
        "totalSales": 1250000,
        "revenue": 1250000
      }
    ],
    
    "brandBreakdown": [
      {
        "brandId": "brand_001",
        "name": "Brand A",
        "productCount": 30,
        "totalSales": 800000,
        "revenue": 800000
      }
    ],
    
    "inventoryValue": 5000000,
    "averageProductRating": 4.5
  },
  "query": {
    "startDate": "2024-01-01",
    "endDate": "2024-01-31",
    "limit": 10,
    "sortBy": "revenue",
    "sortOrder": "desc"
  }
}
```

---

## تحليلات العملاء

### تحليل العملاء الشامل

**Request:**
```http
GET /api/analytics/advanced/customers?startDate=2024-01-01&endDate=2024-01-31&limit=20
Authorization: Bearer {your_jwt_token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalCustomers": 1500,
    "newCustomers": 120,
    "activeCustomers": 850,
    "returningCustomers": 730,
    "customerRetentionRate": 85.5,
    "averageLifetimeValue": 15000,
    
    "topCustomers": [
      {
        "userId": "user_001",
        "name": "أحمد محمد",
        "totalOrders": 25,
        "totalSpent": 75000,
        "lastOrderDate": "2024-01-30T15:30:00.000Z"
      },
      {
        "userId": "user_002",
        "name": "فاطمة علي",
        "totalOrders": 20,
        "totalSpent": 60000,
        "lastOrderDate": "2024-01-28T10:20:00.000Z"
      }
    ],
    
    "customersByRegion": [
      {
        "location": "الرياض",
        "count": 450,
        "percentage": 30
      },
      {
        "location": "جدة",
        "count": 320,
        "percentage": 21.33
      }
    ],
    
    "customerSegmentation": [
      {
        "segment": "VIP",
        "count": 50,
        "revenue": 750000,
        "averageOrderValue": 15000
      },
      {
        "segment": "Regular",
        "count": 500,
        "revenue": 1250000,
        "averageOrderValue": 2500
      },
      {
        "segment": "Occasional",
        "count": 950,
        "revenue": 500000,
        "averageOrderValue": 526.32
      }
    ],
    
    "churnRate": 5.2,
    
    "newVsReturning": {
      "new": 120,
      "returning": 730,
      "newPercentage": 8,
      "returningPercentage": 48.67
    }
  },
  "query": {
    "startDate": "2024-01-01",
    "endDate": "2024-01-31",
    "limit": 20
  }
}
```

---

## التقارير المالية

### التقرير المالي الشامل

**Request:**
```http
GET /api/analytics/advanced/financial?startDate=2024-01-01&endDate=2024-01-31&currency=YER&includeProjections=true&includeCashFlow=true&groupBy=monthly
Authorization: Bearer {your_jwt_token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "grossRevenue": 2500000,
    "netRevenue": 2350000,
    "totalCosts": 1500000,
    "grossProfit": 850000,
    "grossMargin": 36.17,
    "totalDiscounts": 150000,
    "totalRefunds": 25000,
    "totalShipping": 50000,
    "totalTax": 125000,
    
    "revenueByChannel": [
      {
        "channel": "web",
        "revenue": 2000000,
        "percentage": 80
      },
      {
        "channel": "mobile",
        "revenue": 500000,
        "percentage": 20
      }
    ],
    
    "profitByCategory": [
      {
        "categoryId": "cat_001",
        "name": "الألواح الشمسية",
        "revenue": 1250000,
        "cost": 750000,
        "profit": 500000,
        "margin": 40
      },
      {
        "categoryId": "cat_002",
        "name": "الإنفيرترات",
        "revenue": 750000,
        "cost": 500000,
        "profit": 250000,
        "margin": 33.33
      }
    ],
    
    "cashFlow": [
      {
        "date": "2024-01",
        "inflow": 2500000,
        "outflow": 175000,
        "net": 2325000
      }
    ],
    
    "projections": {
      "nextMonth": 2875000,
      "nextQuarter": 8625000,
      "nextYear": 34500000
    }
  },
  "query": {
    "startDate": "2024-01-01",
    "endDate": "2024-01-31",
    "currency": "YER",
    "includeProjections": true,
    "includeCashFlow": true,
    "groupBy": "monthly"
  }
}
```

---

## تحليلات السلة

### تحليل السلل المهجورة

**Request:**
```http
GET /api/analytics/advanced/cart-analytics?startDate=2024-01-01&endDate=2024-01-31&status=abandoned&includeRecovery=true&topAbandonedLimit=10
Authorization: Bearer {your_jwt_token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalCarts": 2500,
    "activeCarts": 450,
    "abandonedCarts": 1500,
    "abandonmentRate": 60,
    "recoveredCarts": 150,
    "recoveryRate": 10,
    "averageCartValue": 3500,
    "averageCartItems": 4.5,
    "conversionRate": 22,
    "checkoutDropoffRate": 15,
    "abandonedCartValue": 5250000,
    
    "topAbandonedProducts": [
      {
        "productId": "prod_002",
        "name": "Inverter 5KW",
        "abandonedCount": 85,
        "lostRevenue": 425000
      },
      {
        "productId": "prod_001",
        "name": "Solar Panel 300W",
        "abandonedCount": 75,
        "lostRevenue": 225000
      },
      {
        "productId": "prod_003",
        "name": "Battery 200Ah",
        "abandonedCount": 60,
        "lostRevenue": 300000
      }
    ]
  },
  "query": {
    "startDate": "2024-01-01",
    "endDate": "2024-01-31",
    "status": "abandoned",
    "includeRecovery": true,
    "topAbandonedLimit": 10
  }
}
```

---

## التصدير والمقارنات

### 1. مقارنة الفترات

**Request:**
```http
GET /api/analytics/advanced/comparison?currentStart=2024-01-01&currentEnd=2024-01-31&previousStart=2023-12-01&previousEnd=2023-12-31
Authorization: Bearer {your_jwt_token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "revenue": {
      "current": 2500000,
      "previous": 2000000,
      "change": 500000,
      "percentageChange": 25
    },
    "orders": {
      "current": 850,
      "previous": 720,
      "change": 130,
      "percentageChange": 18.06
    },
    "averageOrderValue": {
      "current": 2941.18,
      "previous": 2777.78,
      "change": 163.4,
      "percentageChange": 5.88
    }
  },
  "periods": {
    "current": {
      "start": "2024-01-01",
      "end": "2024-01-31"
    },
    "previous": {
      "start": "2023-12-01",
      "end": "2023-12-31"
    }
  }
}
```

### 2. اتجاهات المقاييس

**Request:**
```http
GET /api/analytics/advanced/trends/revenue?startDate=2024-01-01&endDate=2024-01-31&groupBy=daily
Authorization: Bearer {your_jwt_token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "metric": "revenue",
    "groupBy": "daily",
    "trends": [
      {
        "date": "2024-01-01",
        "value": 85000,
        "label": "الإيرادات"
      },
      {
        "date": "2024-01-02",
        "value": 92000,
        "label": "الإيرادات"
      }
    ]
  },
  "query": {
    "startDate": "2024-01-01",
    "endDate": "2024-01-31",
    "groupBy": "daily"
  }
}
```

### 3. تصدير بيانات المبيعات

**Request:**
```http
GET /api/analytics/advanced/export/sales?format=excel&startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer {your_jwt_token}
```

**Response:**
```json
{
  "success": true,
  "message": "تم إنشاء ملف التصدير بنجاح",
  "data": {
    "format": "excel",
    "fileUrl": "https://cdn.example.com/exports/sales_1706789432.xlsx",
    "generatedAt": "2024-02-01T11:30:00.000Z",
    "recordCount": 850
  }
}
```

### 4. تصدير بيانات المنتجات

**Request:**
```http
GET /api/analytics/advanced/export/products?format=csv&startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer {your_jwt_token}
```

**Response:**
```json
{
  "success": true,
  "message": "تم إنشاء ملف التصدير بنجاح",
  "data": {
    "format": "csv",
    "fileUrl": "https://cdn.example.com/exports/products_1706789500.csv",
    "generatedAt": "2024-02-01T11:35:00.000Z",
    "recordCount": 250
  }
}
```

### 5. تصدير بيانات العملاء

**Request:**
```http
GET /api/analytics/advanced/export/customers?format=json&startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer {your_jwt_token}
```

**Response:**
```json
{
  "success": true,
  "message": "تم إنشاء ملف التصدير بنجاح",
  "data": {
    "format": "json",
    "fileUrl": "https://cdn.example.com/exports/customers_1706789600.json",
    "generatedAt": "2024-02-01T11:40:00.000Z",
    "recordCount": 1500
  }
}
```

---

## نصائح مهمة

### 1. التعامل مع الأخطاء

جميع الـ APIs تعيد أخطاء بالتنسيق التالي:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "تواريخ غير صحيحة",
    "details": {
      "startDate": "يجب أن يكون التاريخ بصيغة YYYY-MM-DD"
    }
  }
}
```

### 2. Rate Limiting

- معظم endpoints محدودة بـ 100 طلب في الدقيقة
- تصدير البيانات محدود بـ 10 طلبات في الدقيقة
- توليد التقارير محدود بـ 5 طلبات في الدقيقة

### 3. Pagination

عند استخدام pagination:
- `page`: رقم الصفحة (ابتداءً من 1)
- `limit`: عدد النتائج في الصفحة (max: 100)

### 4. Date Formats

جميع التواريخ يجب أن تكون بصيغة:
- `YYYY-MM-DD` للتواريخ
- ISO 8601 للـ timestamps الكاملة

### 5. Authentication

جميع الـ APIs تتطلب JWT token:
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Postman Collection

يمكنك استيراد Collection جاهزة من:
```
https://api.example.com/postman/analytics-collection.json
```

---

## أسئلة شائعة

### كيف أحصل على تقرير للشهر الحالي؟

```bash
curl -X POST \
  http://localhost:3000/api/analytics/advanced/reports/generate \
  -H 'Authorization: Bearer {token}' \
  -H 'Content-Type: application/json' \
  -d '{
    "title": "تقرير الشهر الحالي",
    "titleEn": "Current Month Report",
    "category": "sales",
    "startDate": "2024-01-01",
    "endDate": "2024-01-31",
    "compareWithPrevious": true,
    "includeRecommendations": true
  }'
```

### كيف أحصل على المقاييس الفورية؟

```bash
curl -X GET \
  http://localhost:3000/api/analytics/advanced/realtime \
  -H 'Authorization: Bearer {token}'
```

### كيف أقارن بين شهرين؟

```bash
curl -X GET \
  'http://localhost:3000/api/analytics/advanced/comparison?currentStart=2024-01-01&currentEnd=2024-01-31&previousStart=2023-12-01&previousEnd=2023-12-31' \
  -H 'Authorization: Bearer {token}'
```

---

## دعم فني

للمساعدة والدعم:
- البريد الإلكتروني: support@example.com
- التوثيق الكامل: https://docs.example.com/analytics
- GitHub Issues: https://github.com/example/project/issues

