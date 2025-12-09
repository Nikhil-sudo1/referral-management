import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { SlidersHorizontal, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
}

export interface SearchFilters {
  query: string;
  status?: string;
  university?: string;
  dateFrom?: string;
  dateTo?: string;
}

export const AdvancedSearch = ({ onSearch }: AdvancedSearchProps) => {
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    status: '',
    university: '',
    dateFrom: '',
    dateTo: '',
  });

  const activeFilterCount = Object.values(filters).filter((v) => v !== '').length;

  const handleApply = () => {
    onSearch(filters);
    setOpen(false);
  };

  const handleClear = () => {
    const clearedFilters = {
      query: '',
      status: '',
      university: '',
      dateFrom: '',
      dateTo: '',
    };
    setFilters(clearedFilters);
    onSearch(clearedFilters);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative">
          <SlidersHorizontal className="w-4 h-4 mr-2" />
          Advanced Search
          {activeFilterCount > 0 && (
            <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center gradient-primary text-primary-foreground">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Advanced Search</SheetTitle>
          <SheetDescription>
            Apply multiple filters to refine your search
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-6 mt-6">
          <div className="space-y-2">
            <Label htmlFor="search-query">Search Query</Label>
            <Input
              id="search-query"
              placeholder="Search by name, email, code..."
              value={filters.query}
              onChange={(e) => setFilters({ ...filters, query: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status-filter">Status</Label>
            <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
              <SelectTrigger id="status-filter">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All statuses</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="admitted">Admitted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date-from">Date From</Label>
            <Input
              id="date-from"
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date-to">Date To</Label>
            <Input
              id="date-to"
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={handleClear} className="flex-1">
              <X className="w-4 h-4 mr-2" />
              Clear All
            </Button>
            <Button onClick={handleApply} className="flex-1 gradient-primary">
              Apply Filters
            </Button>
          </div>

          {activeFilterCount > 0 && (
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-2">{activeFilterCount} active filter(s)</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(filters).map(([key, value]) => 
                  value ? (
                    <Badge key={key} variant="secondary">
                      {key}: {value}
                    </Badge>
                  ) : null
                )}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

