'use client';

import { useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronDown,
  Download,
  ExternalLink,
  Search,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Mock transaction data
const mockTransactions = [
  //... your mock data here
];

type TransactionType = 'deposit' | 'withdrawal';
type TransactionStatus = 'completed' | 'pending' | 'failed';

interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  currency: string;
  usdValue: number;
  status: TransactionStatus;
  date: string;
  address: string;
  txHash: string;
}

export function TransactionHistory() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<TransactionType[]>([
    'deposit',
    'withdrawal',
  ]);
  const [statusFilter, setStatusFilter] = useState<TransactionStatus[]>([
    'completed',
    'pending',
    'failed',
  ]);

  // Filter transactions based on search and filters
  const filteredTransactions = mockTransactions.filter((tx) => {
    // Check if transaction matches search query
    const matchesSearch =
      tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.currency.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.txHash.toLowerCase().includes(searchQuery.toLowerCase());

    // Check if transaction matches type filter
    const matchesType = typeFilter.includes(tx.type as TransactionType);

    // Check if transaction matches status filter
    const matchesStatus = statusFilter.includes(tx.status as TransactionStatus);

    return matchesSearch && matchesType && matchesStatus;
  });

  // Toggle type filter
  const toggleTypeFilter = (type: TransactionType) => {
    if (typeFilter.includes(type)) {
      // Don't allow removing all filters
      if (typeFilter.length === 1) {
        return;
      }
      setTypeFilter((prev) => prev.filter((t) => t !== type));
    } else {
      setTypeFilter((prev) => [...prev, type]);
    }
  };

  // Toggle status filter
  const toggleStatusFilter = (status: TransactionStatus) => {
    if (statusFilter.includes(status)) {
      // Don't allow removing all filters
      if (statusFilter.length === 1) {
        return;
      }
      setStatusFilter((prev) => prev.filter((s) => s !== status));
    } else {
      setStatusFilter((prev) => [...prev, status]);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      ' • ' +
      date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    );
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    });
  };

  // Truncate hash
  const truncateHash = (hash: string) => {
    return hash.substring(0, 8) + '...' + hash.substring(hash.length - 8);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
        <CardDescription>
          View your deposit and withdrawal history
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Flex container with responsive width */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative w-full sm:w-[300px] lg:w-[350px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search transactions..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              {/* Type Filter Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1">
                    Type
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuCheckboxItem
                    checked={typeFilter.includes('deposit')}
                    onCheckedChange={() => toggleTypeFilter('deposit')}
                  >
                    Deposits
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={typeFilter.includes('withdrawal')}
                    onCheckedChange={() => toggleTypeFilter('withdrawal')}
                  >
                    Withdrawals
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Status Filter Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1">
                    Status
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuCheckboxItem
                    checked={statusFilter.includes('completed')}
                    onCheckedChange={() => toggleStatusFilter('completed')}
                  >
                    Completed
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={statusFilter.includes('pending')}
                    onCheckedChange={() => toggleStatusFilter('pending')}
                  >
                    Pending
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={statusFilter.includes('failed')}
                    onCheckedChange={() => toggleStatusFilter('failed')}
                  >
                    Failed
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Export Button */}
              <Button variant="outline" size="sm" className="gap-1">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No transactions found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-8 w-8 rounded-full flex items-center justify-center ${
                              tx.type === 'deposit'
                                ? 'bg-green-100 text-green-600'
                                : 'bg-blue-100 text-blue-600'
                            }`}
                          >
                            {tx.type === 'deposit' ? (
                              <ArrowDownLeft className="h-4 w-4" />
                            ) : (
                              <ArrowUpRight className="h-4 w-4" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium">
                              {tx.type === 'deposit' ? 'Deposit' : 'Withdrawal'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {tx.id}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {tx.amount} {tx.currency}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatCurrency(tx.usdValue)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>{formatDate(tx.date)}</div>
                        <div className="text-xs text-muted-foreground truncate max-w-[150px]">
                          {truncateHash(tx.txHash)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            tx.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : tx.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {tx.status.charAt(0).toUpperCase() +
                            tx.status.slice(1)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <a
                            href="#"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center"
                          >
                            <ExternalLink className="h-4 w-4" />
                            <span className="sr-only">View on blockchain</span>
                          </a>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="text-xs text-muted-foreground">
            Showing {filteredTransactions.length} of {mockTransactions.length}{' '}
            transactions
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
