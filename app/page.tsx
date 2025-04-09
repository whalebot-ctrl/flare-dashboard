'use client';

import Link from 'next/link';
import { Bell, ChevronDown, Menu, Plus, Search, User } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { CryptoChart } from '@/components/crypto-chart';
import { CryptoDeposit } from '@/components/crypto-deposit';
import { InvestmentTable } from '@/components/investment-table';
import { PortfolioSummary } from '@/components/portfolio-summary';
import { Sidebar } from '@/components/sidebar';
import { TransactionHistory } from '@/components/transaction-history';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <Sidebar />
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <div className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
            className="h-6 w-6"
          >
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
          <span className="text-lg font-semibold">FLARE</span>
        </div>

        {/* Search */}
        <div className="relative ml-auto flex-1 sm:flex-none sm:w-[300px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search markets..."
            className="w-full rounded-lg bg-background pl-8"
          />
        </div>

        {/* Right side buttons */}
        <div className="hidden sm:flex items-center gap-4 ml-4">
          <Button variant="outline" size="icon">
            <Bell className="h-4 w-4" />
            <span className="sr-only">Notifications</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="sm" className="gap-1">
                <User className="h-4 w-4" />
                <span className="hidden md:inline-flex">Profile</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/profile">View Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="hidden md:flex w-[250px] flex-col border-r bg-muted/40">
          <Sidebar />
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="container py-6 px-4 sm:px-6">
            {/* Top Bar */}
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <CryptoDeposit />
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  New Investment
                </Button>
              </div>
            </div>

            {/* Portfolio Summary Cards */}
            <PortfolioSummary />

            {/* Tabs Section */}
            <div className="mt-6">
              <Tabs defaultValue="portfolio">
                <div className="flex justify-between">
                  <TabsList className="w-full sm:w-auto">
                    <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
                    <TabsTrigger value="market">Market</TabsTrigger>
                    <TabsTrigger value="transactions">Transactions</TabsTrigger>
                  </TabsList>
                </div>

                {/* Portfolio Tab */}
                <TabsContent value="portfolio" className="mt-4 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Portfolio Performance</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                      <CryptoChart />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Your Investments</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <InvestmentTable />
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full">
                        View All Investments
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>

                {/* Market Tab */}
                <TabsContent value="market" className="mt-4 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Market Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        Market data will appear here.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Transactions Tab */}
                <TabsContent value="transactions" className="mt-4 space-y-6">
                  <TransactionHistory />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
