import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { YEMEN_TIMEZONE } from '../utils/date.util';

/**
 * Interceptor to convert all Date fields from UTC to Yemen timezone (Asia/Aden)
 * This ensures that all dates returned from API endpoints are in Yemen local time
 */
@Injectable()
export class DateTimezoneInterceptor implements NestInterceptor {
  /**
   * Convert a date to Yemen timezone ISO string
   * Returns the date as ISO string with Yemen timezone offset (+03:00)
   */
  private convertDateToYemenTime(date: Date | string | number): string {
    if (!date) return null as any;
    
    const dateObj = typeof date === 'string' || typeof date === 'number'
      ? new Date(date)
      : date;

    if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
      return null as any;
    }

    // Use Intl.DateTimeFormat to get the date components in Yemen timezone
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: YEMEN_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    // Parse the formatted string to get individual components
    const parts = formatter.formatToParts(dateObj);
    const year = parts.find(p => p.type === 'year')?.value;
    const month = parts.find(p => p.type === 'month')?.value;
    const day = parts.find(p => p.type === 'day')?.value;
    const hour = parts.find(p => p.type === 'hour')?.value;
    const minute = parts.find(p => p.type === 'minute')?.value;
    const second = parts.find(p => p.type === 'second')?.value;

    // Get milliseconds from original date (milliseconds don't change with timezone)
    const milliseconds = dateObj.getMilliseconds().toString().padStart(3, '0');

    // Return as ISO string with Yemen timezone offset (+03:00)
    // Format: YYYY-MM-DDTHH:mm:ss.SSS+03:00
    // Note: This represents the same moment in time but displayed in Yemen local time
    return `${year}-${month}-${day}T${hour}:${minute}:${second}.${milliseconds}+03:00`;
  }

  /**
   * Recursively convert all Date objects in an object to Yemen timezone strings
   */
  private convertDatesInObject(obj: any): any {
    if (obj === null || obj === undefined) {
      return obj;
    }

    // If it's a Date object, convert it
    if (obj instanceof Date) {
      return this.convertDateToYemenTime(obj);
    }

    // If it's an array, process each element
    if (Array.isArray(obj)) {
      return obj.map(item => this.convertDatesInObject(item));
    }

    // If it's an object (but not Date), process each property
    if (typeof obj === 'object') {
      const converted: any = {};
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          converted[key] = this.convertDatesInObject(obj[key]);
        }
      }
      return converted;
    }

    // For primitives, return as is
    return obj;
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        // Convert all dates in the response to Yemen timezone
        return this.convertDatesInObject(data);
      }),
    );
  }
}

