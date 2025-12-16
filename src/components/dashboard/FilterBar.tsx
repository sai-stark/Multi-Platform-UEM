import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FilterState {
  platform: string;
  compliance: string;
  status: string;
}

interface FilterBarProps {
  onFilterChange?: (filters: FilterState) => void;
}

export function FilterBar({ onFilterChange }: FilterBarProps) {
  const { t } = useLanguage();
  const [filters, setFilters] = useState<FilterState>({
    platform: 'all',
    compliance: 'all',
    status: 'all',
  });

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const clearFilters = () => {
    const defaultFilters = { platform: 'all', compliance: 'all', status: 'all' };
    setFilters(defaultFilters);
    onFilterChange?.(defaultFilters);
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== 'all');

  return (
    <div 
      className="filter-bar"
      role="search"
      aria-label="Device filters"
    >
      <div className="flex items-center gap-2 text-muted-foreground">
        <Filter className="w-4 h-4" aria-hidden="true" />
        <span className="text-sm font-medium">Filters:</span>
      </div>

      {/* Platform Filter */}
      <div className="flex items-center gap-2">
        <label 
          htmlFor="platform-filter" 
          className="text-sm text-muted-foreground"
        >
          {t('filter.platform')}:
        </label>
        <Select 
          value={filters.platform} 
          onValueChange={(v) => handleFilterChange('platform', v)}
        >
          <SelectTrigger 
            id="platform-filter"
            className="w-32 bg-background"
            aria-label={`Platform filter: ${filters.platform}`}
          >
            <SelectValue placeholder={t('filter.all')} />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="all">{t('filter.all')}</SelectItem>
            <SelectItem value="android">Android</SelectItem>
            <SelectItem value="ios">iOS</SelectItem>
            <SelectItem value="windows">Windows</SelectItem>
            <SelectItem value="macos">macOS</SelectItem>
            <SelectItem value="linux">Linux</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Compliance Filter */}
      <div className="flex items-center gap-2">
        <label 
          htmlFor="compliance-filter" 
          className="text-sm text-muted-foreground"
        >
          {t('filter.compliance')}:
        </label>
        <Select 
          value={filters.compliance} 
          onValueChange={(v) => handleFilterChange('compliance', v)}
        >
          <SelectTrigger 
            id="compliance-filter"
            className="w-36 bg-background"
            aria-label={`Compliance filter: ${filters.compliance}`}
          >
            <SelectValue placeholder={t('filter.all')} />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="all">{t('filter.all')}</SelectItem>
            <SelectItem value="compliant">Compliant</SelectItem>
            <SelectItem value="non-compliant">Non-Compliant</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Status Filter */}
      <div className="flex items-center gap-2">
        <label 
          htmlFor="status-filter" 
          className="text-sm text-muted-foreground"
        >
          {t('filter.status')}:
        </label>
        <Select 
          value={filters.status} 
          onValueChange={(v) => handleFilterChange('status', v)}
        >
          <SelectTrigger 
            id="status-filter"
            className="w-32 bg-background"
            aria-label={`Status filter: ${filters.status}`}
          >
            <SelectValue placeholder={t('filter.all')} />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="all">{t('filter.all')}</SelectItem>
            <SelectItem value="online">Online</SelectItem>
            <SelectItem value="offline">Offline</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="ml-auto"
          aria-label="Clear all filters"
        >
          <X className="w-4 h-4 mr-1" aria-hidden="true" />
          Clear
        </Button>
      )}
    </div>
  );
}
