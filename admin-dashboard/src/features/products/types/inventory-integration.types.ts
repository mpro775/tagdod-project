/**
 * Inventory Integration Types
 * Types for Onyx inventory integration API responses
 */

// إحصائيات لوحة التكامل
export interface IntegrationStats {
    onyxTotalItems: number;      // إجمالي أصناف أونكس
    fullySynced: number;         // المربوطة بنجاح
    notLinkedOpportunities: number; // غير المربوطة (الفرص)
    lastUpdate: {
        lastSyncedAt: string;      // تاريخ آخر تحديث
    } | null;
}

// نتيجة فحص SKU
export interface SkuCheckResult {
    existsInOnyx: boolean;
    onyxStock?: number;
    lastSynced?: string;
    message: string;
}

// صنف غير مربوط
export interface UnlinkedItem {
    _id: string;
    sku: string;
    quantity: number;
    itemNameAr?: string; // ✅ تأكد من وجود هذا السطر ومطابقته للباك إند
    suggestion: string;
}
export interface LinkedItem {
    sku: string;
    onyxName?: string;
    appName: string;
    onyxStock: number;
    appStock: number;
    lastSynced: string;
    isVariant: boolean;
}