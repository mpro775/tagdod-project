export interface IntegrationStats {
    onyxTotalItems: number;
    fullySynced: number;
    notLinkedOpportunities: number;
    lastUpdate: {
        lastSyncedAt: string;
    } | null;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
}

export interface LinkedPaginatedResponse extends PaginatedResponse<LinkedItem> {
    matchedTotal?: number;
    mismatchedTotal?: number;
    page?: number;
    limit?: number;
}

export interface LinkedProductsParams {
    limit?: number;
    page?: number;
    search?: string;
    status?: 'all' | 'matched' | 'mismatched';
    sort?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface UnlinkedProductsParams {
    limit?: number;
    page?: number;
    search?: string;
    sort?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface SkuCheckResult {
    existsInOnyx: boolean;
    onyxStock?: number;
    lastSynced?: string;
    message: string;
}

export interface UnlinkedItem {
    _id: string;
    sku: string;
    quantity: number;
    itemNameAr?: string;
    suggestion: string;
    price?: number;
    lastSyncedAt?: string;
}

export interface LinkedItem {
    sku: string;
    onyxName?: string;
    appName: string;
    onyxStock: number;
    appStock: number;
    lastSynced: string;
    isVariant: boolean;
    stockDifference: number;
    isStockMatch: boolean;
    linkType: 'product' | 'variant';
    productId?: string;
    variantId?: string;
}