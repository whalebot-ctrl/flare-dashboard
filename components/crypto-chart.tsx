'use client';

import { useEffect, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { RefreshCcw } from 'lucide-react';

import { getPortfolioHistory } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function CryptoChart() {
  const [chartData, setChartData] = useState<{ date: number; value: number }[]>(
    []
  );
  const [timeRange, setTimeRange] = useState<number>(7);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Update the fetchData function to handle errors better
  const fetchData = async (days: number) => {
    try {
      setRefreshing(true);
      setError(null);
      console.log(`Fetching portfolio history data for ${days} days...`);
      const data = await getPortfolioHistory(days);

      if (data.length === 0) {
        throw new Error('No chart data available');
      }

      setChartData(data);
      setLastUpdated(new Date());
      console.log(
        `Successfully loaded chart data with ${data.length} data points`
      );
    } catch (err) {
      console.error('Chart data error:', err);
      setError('Using simulated data');

      // Generate fallback data if API fails
      const fallbackData = [];
      const now = Date.now();
      const millisecondsPerDay = 24 * 60 * 60 * 1000;

      for (let i = days; i >= 0; i--) {
        const timestamp = now - i * millisecondsPerDay;
        // Start at 20k and gradually increase to 24k with some randomness
        const value =
          20000 + (4000 * (days - i)) / days + (Math.random() - 0.5) * 1000;
        fallbackData.push({ date: timestamp, value });
      }

      setChartData(fallbackData);
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Update the useEffect to reduce refresh frequency
  useEffect(() => {
    fetchData(timeRange);

    // Set up an interval to refresh data every 5 minutes
    const intervalId = setInterval(() => fetchData(timeRange), 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [timeRange, retryCount]);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const formatValue = (value: number) => {
    return `$${value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  if (loading) {
    return (
      <div className="flex h-[300px] w-full flex-col">
        <div className="mb-4 flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-60" />
        </div>
        <Skeleton className="h-[calc(300px-40px)] w-full rounded-md" />
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
          {error && (
            <div className="text-xs text-amber-500 italic">{error}</div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setRetryCount((prev) => prev + 1);
              fetchData(timeRange);
            }}
            disabled={refreshing}
            className="gap-1"
          >
            <RefreshCcw
              className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}
            />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Tabs
            defaultValue={timeRange.toString()}
            onValueChange={(value) => setTimeRange(Number(value))}
          >
            <TabsList>
              <TabsTrigger value="1">1D</TabsTrigger>
              <TabsTrigger value="7">1W</TabsTrigger>
              <TabsTrigger value="30">1M</TabsTrigger>
              <TabsTrigger value="90">3M</TabsTrigger>
              <TabsTrigger value="365">1Y</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#f0f0f0"
          />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            tickCount={5}
            minTickGap={30}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            dataKey="value"
            domain={['auto', 'auto']}
            tickFormatter={(value) =>
              `$${value.toLocaleString(undefined, { notation: 'compact' })}`
            }
            axisLine={false}
            tickLine={false}
            width={80}
          />
          <Tooltip
            formatter={(value: number) => [
              formatValue(value),
              'Portfolio Value',
            ]}
            labelFormatter={(label) => formatDate(label as number)}
            contentStyle={{ borderRadius: '8px' }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#10b981"
            fillOpacity={1}
            fill="url(#colorValue)"
            strokeWidth={2}
            activeDot={{ r: 6, strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
