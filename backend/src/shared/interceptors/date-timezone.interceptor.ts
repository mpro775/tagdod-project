import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { YEMEN_TIMEZONE } from '../utils/date.util';
import { Types } from 'mongoose';

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
   * Uses WeakSet to track visited objects and prevent infinite recursion
   */
  private convertDatesInObject(obj: any, visited: WeakSet<object> = new WeakSet()): any {
    if (obj === null || obj === undefined) {
      return obj;
    }

    // Handle primitives
    if (typeof obj !== 'object') {
      return obj;
    }

    // Handle Date objects
    if (obj instanceof Date) {
      return this.convertDateToYemenTime(obj);
    }

    // Handle Mongoose ObjectId - convert to string
    if (obj instanceof Types.ObjectId || (obj.constructor && obj.constructor.name === 'ObjectId')) {
      return obj.toString();
    }

    // Prevent infinite recursion by tracking visited objects
    if (visited.has(obj)) {
      return obj; // Return as-is if already visited (circular reference)
    }

    // Mark object as visited
    visited.add(obj);

    // Handle arrays
    if (Array.isArray(obj)) {
      return obj.map(item => this.convertDatesInObject(item, visited));
    }

    // Handle Buffer (from Mongoose)
    if (Buffer.isBuffer(obj)) {
      return obj;
    }

    // Handle RegExp
    if (obj instanceof RegExp) {
      return obj;
    }

    // Handle plain objects
    try {
      const converted: any = {};
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          // Skip internal Mongoose properties that might cause issues
          if (key.startsWith('$') || key === '__v' || key === '__parentArray') {
            continue;
          }
          
          try {
            converted[key] = this.convertDatesInObject(obj[key], visited);
          } catch (error) {
            // If conversion fails for a property, skip it
            converted[key] = obj[key];
          }
        }
      }
      return converted;
    } catch (error) {
      // If conversion fails entirely, return original object
      return obj;
    }
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        try {
          // Convert all dates in the response to Yemen timezone
          return this.convertDatesInObject(data);
        } catch (error) {
          // If conversion fails, return original data to prevent breaking the API
          console.error('DateTimezoneInterceptor error:', error);
          return data;
        }
      }),
    );
  }
}

