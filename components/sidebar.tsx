import Link from 'next/link';
import {
  BarChart3,
  CreditCard,
  DollarSign,
  Home,
  PieChart,
  Settings,
  User,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

export function Sidebar() {
  return (
    <ScrollArea className="h-full py-6">
      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-lg font-semibold">Navigation</h2>
        <div className="space-y-1">
          <Button variant="secondary" asChild className="w-full justify-start">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
          </Button>
          <Button variant="ghost" asChild className="w-full justify-start">
            <Link href="#">
              <PieChart className="mr-2 h-4 w-4" />
              Portfolio
            </Link>
          </Button>
          <Button variant="ghost" asChild className="w-full justify-start">
            <Link href="#">
              <BarChart3 className="mr-2 h-4 w-4" />
              Market
            </Link>
          </Button>
          <Button variant="ghost" asChild className="w-full justify-start">
            <Link href="#">
              <CreditCard className="mr-2 h-4 w-4" />
              Transactions
            </Link>
          </Button>
        </div>
      </div>

      {/* Account Section */}
      <div className="px-3 py-2 mt-6">
        <h2 className="mb-2 px-4 text-lg font-semibold">Account</h2>
        <div className="space-y-1">
          <Button variant="ghost" asChild className="w-full justify-start">
            <Link href="/profile">
              <User className="mr-2 h-4 w-4" />
              Profile
            </Link>
          </Button>
          <Button variant="ghost" asChild className="w-full justify-start">
            <Link href="/settings">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </Button>
        </div>
      </div>
    </ScrollArea>
  );
}
