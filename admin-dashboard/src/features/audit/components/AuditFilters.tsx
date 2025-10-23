import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Switch } from '@/shared/components/ui/switch';
import { Calendar } from '@/shared/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui/popover';
import { CalendarIcon, Filter, X } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
  AuditLogFilters,
  AuditAction,
  AuditResource,
  AUDIT_ACTION_LABELS,
  AUDIT_RESOURCE_LABELS,
} from '../types/audit.types';

interface AuditFiltersProps {
  filters: AuditLogFilters;
  onFiltersChange: (filters: Partial<AuditLogFilters>) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  availableActions: AuditAction[];
  availableResources: AuditResource[];
}

export const AuditFilters: React.FC<AuditFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  hasActiveFilters,
  availableActions,
  availableResources,
}) => {
  const [startDate, setStartDate] = React.useState<Date | undefined>(
    filters.startDate ? new Date(filters.startDate) : undefined
  );
  const [endDate, setEndDate] = React.useState<Date | undefined>(
    filters.endDate ? new Date(filters.endDate) : undefined
  );

  const handleDateChange = (field: 'startDate' | 'endDate', date: Date | undefined) => {
    if (field === 'startDate') {
      setStartDate(date);
      onFiltersChange({ startDate: date?.toISOString() });
    } else {
      setEndDate(date);
      onFiltersChange({ endDate: date?.toISOString() });
    }
  };

  const handleClearDate = (field: 'startDate' | 'endDate') => {
    if (field === 'startDate') {
      setStartDate(undefined);
      onFiltersChange({ startDate: undefined });
    } else {
      setEndDate(undefined);
      onFiltersChange({ endDate: undefined });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            فلاتر البحث
          </CardTitle>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              مسح الفلاتر
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* User ID Filter */}
          <div className="space-y-2">
            <Label htmlFor="userId">معرف المستخدم</Label>
            <Input
              id="userId"
              placeholder="أدخل معرف المستخدم"
              value={filters.userId || ''}
              onChange={(e) => onFiltersChange({ userId: e.target.value || undefined })}
            />
          </div>

          {/* Performed By Filter */}
          <div className="space-y-2">
            <Label htmlFor="performedBy">قام بالعملية</Label>
            <Input
              id="performedBy"
              placeholder="أدخل معرف المستخدم"
              value={filters.performedBy || ''}
              onChange={(e) => onFiltersChange({ performedBy: e.target.value || undefined })}
            />
          </div>

          {/* Action Filter */}
          <div className="space-y-2">
            <Label htmlFor="action">نوع العملية</Label>
            <Select
              value={filters.action || ''}
              onValueChange={(value) => onFiltersChange({ action: value as AuditAction || undefined })}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر نوع العملية" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">جميع العمليات</SelectItem>
                {availableActions.map((action) => (
                  <SelectItem key={action} value={action}>
                    {AUDIT_ACTION_LABELS[action]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Resource Filter */}
          <div className="space-y-2">
            <Label htmlFor="resource">نوع المورد</Label>
            <Select
              value={filters.resource || ''}
              onValueChange={(value) => onFiltersChange({ resource: value as AuditResource || undefined })}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر نوع المورد" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">جميع الموارد</SelectItem>
                {availableResources.map((resource) => (
                  <SelectItem key={resource} value={resource}>
                    {AUDIT_RESOURCE_LABELS[resource]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Resource ID Filter */}
          <div className="space-y-2">
            <Label htmlFor="resourceId">معرف المورد</Label>
            <Input
              id="resourceId"
              placeholder="أدخل معرف المورد"
              value={filters.resourceId || ''}
              onChange={(e) => onFiltersChange({ resourceId: e.target.value || undefined })}
            />
          </div>

          {/* Sensitive Filter */}
          <div className="space-y-2">
            <Label htmlFor="isSensitive">العمليات الحساسة فقط</Label>
            <div className="flex items-center space-x-2">
              <Switch
                id="isSensitive"
                checked={filters.isSensitive || false}
                onCheckedChange={(checked) => onFiltersChange({ isSensitive: checked || undefined })}
              />
              <Label htmlFor="isSensitive">عرض العمليات الحساسة فقط</Label>
            </div>
          </div>
        </div>

        {/* Date Range Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Start Date */}
          <div className="space-y-2">
            <Label>تاريخ البداية</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !startDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, 'PPP', { locale: ar }) : 'اختر التاريخ'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => handleDateChange('startDate', date)}
                  initialFocus
                />
                {startDate && (
                  <div className="p-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleClearDate('startDate')}
                      className="w-full"
                    >
                      مسح التاريخ
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>

          {/* End Date */}
          <div className="space-y-2">
            <Label>تاريخ النهاية</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !endDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, 'PPP', { locale: ar }) : 'اختر التاريخ'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={(date) => handleDateChange('endDate', date)}
                  initialFocus
                />
                {endDate && (
                  <div className="p-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleClearDate('endDate')}
                      className="w-full"
                    >
                      مسح التاريخ
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
