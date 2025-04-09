'use client';

import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, RefreshCcw, Search } from 'lucide-react';

import { getPortfolioWithPrices, type PortfolioItem } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type SortKey = 'name' | 'amount' | 'price' | 'value' | 'change';
type SortDirection = 'asc' | 'desc';

type InvestmentWithPrice = PortfolioItem & {
  price: number;
  value: number;
  change: string;
  positive: boolean;
  image?: string;
};

export function InvestmentTable() {
  const [investments, setInvestments] = useState<InvestmentWithPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('value');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [retryCount, setRetryCount] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchInvestments = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const data = await getPortfolioWithPrices();
      setInvestments(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError('Failed to load investment data. Using fallback data.');
      console.error('Investment data error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInvestments();
    const intervalId = setInterval(fetchInvestments, 60 * 1000);
    return () => clearInterval(intervalId);
  }, [retryCount]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  };

  const sortedInvestments = [...investments].sort((a, b) => {
    let aValue: any = a[sortKey];
    let bValue: any = b[sortKey];

    if (sortKey === 'change') {
      aValue = parseFloat(a.change);
      bValue = parseFloat(b.change);
    } else if (sortKey === 'name') {
      aValue = a.name.toLowerCase();
      bValue = b.name.toLowerCase();
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const filteredInvestments = sortedInvestments.filter(
    (investment) =>
      investment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      investment.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-10 w-full max-w-sm" />
          <Skeleton className="h-10 w-20" />
        </div>
        <div className="rounded-md border">
          <div className="h-12 border-b bg-muted/50 px-4" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex h-16 items-center gap-4 border-b px-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="ml-auto h-4 w-16" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="relative flex-1 max-w-sm w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search investments..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {error && <div className="text-amber-500 italic">{error}</div>}
          <div className="text-muted-foreground">
            Updated: {lastUpdated.toLocaleTimeString()}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setRetryCount((prev) => prev + 1);
              fetchInvestments();
            }}
            disabled={refreshing}
            className="gap-1"
          >
            <RefreshCcw
              className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}
            />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-md border">
        <Table className="min-w-[600px]">
          <TableHeader>
            <TableRow>
              {(
                ['name', 'amount', 'price', 'value', 'change'] as SortKey[]
              ).map((key) => (
                <TableHead
                  key={key}
                  onClick={() => handleSort(key)}
                  className={`cursor-pointer whitespace-nowrap hover:bg-muted/50 ${
                    key !== 'name' ? 'text-right' : ''
                  }`}
                >
                  {key === 'name' && 'Asset'}
                  {key === 'amount' && 'Amount'}
                  {key === 'price' && 'Price'}
                  {key === 'value' && 'Value'}
                  {key === 'change' && '24h Change'}
                  {sortKey === key && (
                    <span className="ml-1 inline-block">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInvestments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No investments found.
                </TableCell>
              </TableRow>
            ) : (
              filteredInvestments.map((investment) => (
                <TableRow key={investment.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <div className="mr-2 h-8 w-8 overflow-hidden rounded-full">
                        {investment.image ? (
                          <img
                            src={investment.image}
                            alt={investment.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-muted">
                            {investment.symbol.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <div>{investment.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {investment.symbol}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {investment.amount.toLocaleString(undefined, {
                      maximumFractionDigits: 8,
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    $
                    {investment.price.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: investment.price < 1 ? 6 : 2,
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    $
                    {investment.value.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div
                      className={`flex items-center justify-end ${
                        investment.positive ? 'text-green-500' : 'text-red-500'
                      }`}
                    >
                      {investment.positive ? (
                        <ArrowUp className="mr-1 h-4 w-4" />
                      ) : (
                        <ArrowDown className="mr-1 h-4 w-4" />
                      )}
                      {investment.change}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="text-xs text-muted-foreground">
        Data provided by CoinGecko API. Updated:{' '}
        {lastUpdated.toLocaleTimeString()}
      </div>
    </div>
  );
}
