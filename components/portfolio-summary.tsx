'use client';

import { useEffect, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, RefreshCcw } from 'lucide-react';

import { getPortfolioSummary } from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function PortfolioSummary() {
  const [summary, setSummary] = useState<{
    totalValue: number;
    totalChange: number;
    changePercentage: number;
    positiveChange: boolean;
    lastUpdated: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchSummary = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const data = await getPortfolioSummary();
      setSummary(data);
    } catch (err) {
      setError('Failed to load portfolio data. Using fallback data.');
      console.error('Portfolio summary error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSummary();
    const intervalId = setInterval(fetchSummary, 60 * 1000);
    return () => clearInterval(intervalId);
  }, [retryCount]);

  const formatCurrency = (value: number) =>
    value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const formatChange = (value: number) =>
    value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      signDisplay: 'always',
    });

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString();
  };

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 px-4 sm:px-6 lg:px-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="mt-2 h-8 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-28" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <Card className="p-6 text-center">
          <p className="mb-4 text-muted-foreground">
            Unable to load portfolio data
          </p>
          <Button
            onClick={() => {
              setRetryCount((prev) => prev + 1);
              fetchSummary();
            }}
          >
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="text-sm text-muted-foreground">
            Last updated: {formatTime(summary.lastUpdated)}
          </div>
          {error && (
            <div className="text-xs text-amber-500 italic">{error}</div>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setRetryCount((prev) => prev + 1);
            fetchSummary();
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

      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Portfolio Value</CardDescription>
            <CardTitle className="text-xl sm:text-2xl">
              {formatCurrency(summary.totalValue)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-sm flex items-center ${
                summary.positiveChange ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {summary.positiveChange ? (
                <ArrowUpRight className="mr-1 h-4 w-4" />
              ) : (
                <ArrowDownRight className="mr-1 h-4 w-4" />
              )}
              {summary.changePercentage.toFixed(2)}% (
              {formatChange(summary.totalChange)})
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>24h Change</CardDescription>
            <CardTitle className="text-xl sm:text-2xl">
              {summary.positiveChange ? '+' : ''}
              {summary.changePercentage.toFixed(2)}%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-sm ${
                summary.positiveChange ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {formatChange(summary.totalChange)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Available Cash</CardDescription>
            <CardTitle className="text-xl sm:text-2xl">$3,456.78</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Last deposit 2 days ago
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Profit/Loss</CardDescription>
            <CardTitle className="text-xl sm:text-2xl">+$4,321.55</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-green-500">+17.65% all time</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
