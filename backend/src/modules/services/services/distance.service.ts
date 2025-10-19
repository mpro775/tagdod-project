import { Injectable } from '@nestjs/common';

@Injectable()
export class DistanceService {
  /**
   * حساب المسافة بين نقطتين باستخدام Haversine Formula
   * @param lat1 خط العرض للنقطة الأولى
   * @param lng1 خط الطول للنقطة الأولى
   * @param lat2 خط العرض للنقطة الثانية
   * @param lng2 خط الطول للنقطة الثانية
   * @returns المسافة بالكيلومتر
   */
  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // نصف قطر الأرض بالكيلومتر
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * 
      Math.cos(this.toRadians(lat2)) * 
      Math.sin(dLng / 2) * 
      Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    // تقريب إلى منزلتين عشريتين
    return Math.round(distance * 100) / 100;
  }

  /**
   * تحويل الدرجات إلى راديان
   * @param degrees الدرجات
   * @returns الراديان
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * حساب المسافة بين موقع مهندس وطلب خدمة
   * @param engineerLat خط عرض المهندس
   * @param engineerLng خط طول المهندس
   * @param requestLocation موقع الطلب (GeoJSON Point)
   * @returns المسافة بالكيلومتر
   */
  calculateDistanceToRequest(
    engineerLat: number, 
    engineerLng: number, 
    requestLocation: { type: 'Point'; coordinates: [number, number] }
  ): number {
    const [requestLng, requestLat] = requestLocation.coordinates;
    return this.calculateDistance(engineerLat, engineerLng, requestLat, requestLng);
  }

  /**
   * التحقق من أن المسافة ضمن النطاق المحدد
   * @param distance المسافة بالكيلومتر
   * @param maxRadius أقصى نطاق بالكيلومتر
   * @returns true إذا كانت المسافة ضمن النطاق
   */
  isWithinRadius(distance: number, maxRadius: number): boolean {
    return distance <= maxRadius;
  }

  /**
   * ترتيب النتائج حسب المسافة
   * @param items قائمة العناصر
   * @param distanceField اسم حقل المسافة
   * @returns العناصر مرتبة حسب المسافة
   */
  sortByDistance<T>(items: T[], distanceField: keyof T): T[] {
    return items.sort((a, b) => {
      const distanceA = a[distanceField] as number;
      const distanceB = b[distanceField] as number;
      return distanceA - distanceB;
    });
  }
}
