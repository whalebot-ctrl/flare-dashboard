'use client';

import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Copy,
  ExternalLink,
  Info,
  RefreshCcw,
  DollarSign,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { useMediaQuery } from '@/hooks/use-mobile';

// Mock BitPay API service
const mockBitPayService = {
  // Generate a new invoice
  createInvoice: async (amount: number, currency: string) => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Generate random invoice ID and addresses
    const invoiceId = `INV-${Math.random()
      .toString(36)
      .substring(2, 10)
      .toUpperCase()}`;
    const addresses = {
      USDT: `TXxyz${Math.random().toString(36).substring(2, 30)}`,
      XRP: `rXyz${Math.random().toString(36).substring(2, 30)}`,
    };

    // Calculate expiration time (15 minutes from now)
    const expirationTime = new Date();
    expirationTime.setMinutes(expirationTime.getMinutes() + 15);

    return {
      id: invoiceId,
      status: 'new',
      amountDue: amount,
      currency,
      paymentAddresses: addresses,
      expirationTime: expirationTime.toISOString(),
      qrCodeUrl: `/placeholder.svg?height=200&width=200&text=QR-${currency}-${amount}`,
      created: new Date().toISOString(),
    };
  },

  // Check invoice status
  checkInvoiceStatus: async (invoiceId: string) => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Randomly determine status (for demo purposes)
    const statuses = ['new', 'pending', 'confirmed', 'complete', 'expired'];
    const randomIndex = Math.floor(Math.random() * 5);

    // For demo purposes, make "complete" more likely after a few checks
    const status = Math.random() > 0.7 ? 'complete' : statuses[randomIndex];

    return {
      id: invoiceId,
      status,
      lastUpdated: new Date().toISOString(),
    };
  },
};

type CryptoCurrency = 'USDT' | 'XRP';
type InvoiceStatus =
  | 'new'
  | 'pending'
  | 'confirmed'
  | 'complete'
  | 'expired'
  | 'invalid';

interface Invoice {
  id: string;
  status: InvoiceStatus;
  amountDue: number;
  currency: string;
  paymentAddresses: Record<string, string>;
  expirationTime: string;
  qrCodeUrl: string;
  created: string;
  lastUpdated?: string;
}

export function CryptoDeposit() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<
    'amount' | 'payment' | 'confirmation' | 'success'
  >('amount');
  const [amount, setAmount] = useState('');
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoCurrency>('USDT');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [statusCheckInterval, setStatusCheckInterval] =
    useState<NodeJS.Timeout | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [copySuccess, setCopySuccess] = useState(false);

  // Check if the screen is mobile
  const isMobile = useMediaQuery('(max-width: 640px)');

  // Exchange rates (mock)
  const exchangeRates = {
    USDT: 1.0,
    XRP: 0.62,
  };

  // Calculate crypto amount based on USD amount
  const calculateCryptoAmount = (usdAmount: number, crypto: CryptoCurrency) => {
    return usdAmount / exchangeRates[crypto];
  };

  // Format crypto amount
  const formatCryptoAmount = (amount: number, crypto: CryptoCurrency) => {
    return crypto === 'USDT' ? amount.toFixed(2) : amount.toFixed(6);
  };

  // Reset form state
  const resetForm = () => {
    setStep('amount');
    setAmount('');
    setSelectedCrypto('USDT');
    setInvoice(null);
    setIsSubmitting(false);
    if (statusCheckInterval) {
      clearInterval(statusCheckInterval);
      setStatusCheckInterval(null);
    }
  };

  // Handle dialog close
  const handleClose = () => {
    setOpen(false);
    setTimeout(resetForm, 300); // Reset after dialog animation completes

    if (statusCheckInterval) {
      clearInterval(statusCheckInterval);
      setStatusCheckInterval(null);
    }
  };

  // Create a new invoice
  const createInvoice = async () => {
    setIsSubmitting(true);
    try {
      const newInvoice = await mockBitPayService.createInvoice(
        Number.parseFloat(amount),
        selectedCrypto
      );
      setInvoice(newInvoice);
      setStep('payment');

      // Start checking status
      startStatusChecking(newInvoice.id);

      // Calculate time left for expiration
      const expirationTime = new Date(newInvoice.expirationTime).getTime();
      const now = new Date().getTime();
      setTimeLeft(Math.floor((expirationTime - now) / 1000));
    } catch (error) {
      console.error('Error creating invoice:', error);
      // Handle error
    } finally {
      setIsSubmitting(false);
    }
  };

  // Start checking invoice status
  const startStatusChecking = (invoiceId: string) => {
    // Clear any existing interval
    if (statusCheckInterval) {
      clearInterval(statusCheckInterval);
    }

    // Check immediately
    checkInvoiceStatus(invoiceId);

    // Then check every 10 seconds
    const interval = setInterval(() => {
      checkInvoiceStatus(invoiceId);
    }, 10000);

    setStatusCheckInterval(interval);
  };

  // Check invoice status
  const checkInvoiceStatus = async (invoiceId: string) => {
    try {
      const statusUpdate = await mockBitPayService.checkInvoiceStatus(
        invoiceId
      );

      setInvoice((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          status: statusUpdate.status as InvoiceStatus,
          lastUpdated: statusUpdate.lastUpdated,
        };
      });

      // If payment is complete, move to success step
      if (statusUpdate.status === 'complete') {
        if (statusCheckInterval) {
          clearInterval(statusCheckInterval);
          setStatusCheckInterval(null);
        }
        setStep('success');
      }
    } catch (error) {
      console.error('Error checking invoice status:', error);
    }
  };

  // Copy address to clipboard
  const copyAddressToClipboard = () => {
    if (!invoice) return;

    const address = invoice.paymentAddresses[selectedCrypto];
    navigator.clipboard.writeText(address);

    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  // Update countdown timer
  useEffect(() => {
    if (timeLeft <= 0 || step !== 'payment') return;

    const timer = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, step]);

  // Format time left
  const formatTimeLeft = () => {
    if (timeLeft <= 0) return '00:00';
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  };

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
      }
    };
  }, [statusCheckInterval]);

  // Validate amount
  const isAmountValid = () => {
    const numAmount = Number.parseFloat(amount);
    return !isNaN(numAmount) && numAmount >= 10; // Minimum $10 deposit
  };

  // Format currency
  const formatCurrency = (value: string) => {
    const numValue = Number.parseFloat(value);
    if (isNaN(numValue)) return '$0.00';
    return numValue.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    });
  };

  // Get status badge color
  const getStatusColor = (status: InvoiceStatus) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-600';
      case 'pending':
        return 'bg-yellow-100 text-yellow-600';
      case 'confirmed':
        return 'bg-purple-100 text-purple-600';
      case 'complete':
        return 'bg-green-100 text-green-600';
      case 'expired':
        return 'bg-red-100 text-red-600';
      case 'invalid':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  // Get status text
  const getStatusText = (status: InvoiceStatus) => {
    switch (status) {
      case 'new':
        return 'Awaiting Payment';
      case 'pending':
        return 'Payment Detected';
      case 'confirmed':
        return 'Confirming';
      case 'complete':
        return 'Completed';
      case 'expired':
        return 'Expired';
      case 'invalid':
        return 'Invalid';
      default:
        return status;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <DollarSign className="mr-2 h-4 w-4" />
          Deposit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] w-[95vw] max-h-[90vh] overflow-y-auto">
        {step === 'amount' && (
          <>
            <DialogHeader>
              <DialogTitle>Deposit Crypto</DialogTitle>
              <DialogDescription>
                Deposit cryptocurrency to fund your investment account.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="crypto-currency">Select Cryptocurrency</Label>
                <RadioGroup
                  value={selectedCrypto}
                  onValueChange={(value) =>
                    setSelectedCrypto(value as CryptoCurrency)
                  }
                  className="flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-2 rounded-md border p-3">
                    <RadioGroupItem value="USDT" id="usdt" />
                    <Label
                      htmlFor="usdt"
                      className="flex flex-1 items-center gap-2 font-normal"
                    >
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-medium">
                        USDT
                      </div>
                      <div className="flex-1">Tether</div>
                      <div className="text-sm text-muted-foreground">
                        1 USDT ≈ $1.00
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 rounded-md border p-3">
                    <RadioGroupItem value="XRP" id="xrp" />
                    <Label
                      htmlFor="xrp"
                      className="flex flex-1 items-center gap-2 font-normal"
                    >
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                        XRP
                      </div>
                      <div className="flex-1">XRP</div>
                      <div className="text-sm text-muted-foreground">
                        1 XRP ≈ $0.62
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="amount">Amount (USD)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="amount"
                    placeholder="0.00"
                    className="pl-9"
                    value={amount}
                    onChange={(e) => {
                      // Only allow numbers and decimal point
                      const value = e.target.value.replace(/[^0-9.]/g, '');
                      // Ensure only one decimal point
                      const parts = value.split('.');
                      if (parts.length > 2) {
                        return;
                      }
                      // Limit to 2 decimal places
                      if (parts[1] && parts[1].length > 2) {
                        return;
                      }
                      setAmount(value);
                    }}
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  {isAmountValid() && (
                    <div className="mt-1">
                      ≈{' '}
                      {formatCryptoAmount(
                        calculateCryptoAmount(
                          Number.parseFloat(amount),
                          selectedCrypto
                        ),
                        selectedCrypto
                      )}{' '}
                      {selectedCrypto}
                    </div>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between text-sm mt-2 gap-2">
                  <span className="text-muted-foreground">Quick amounts:</span>
                  <div className="flex flex-wrap gap-2">
                    {['50', '100', '500', '1000'].map((quickAmount) => (
                      <Button
                        key={quickAmount}
                        variant="outline"
                        size="sm"
                        className="h-6 px-2"
                        onClick={() => setAmount(quickAmount)}
                      >
                        ${quickAmount}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-md bg-muted p-3 mt-2">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-muted-foreground">
                    Minimum deposit amount is $10. Deposits typically take 10-30
                    minutes to confirm on the blockchain.
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={handleClose}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                onClick={createInvoice}
                disabled={!isAmountValid() || isSubmitting}
                className="w-full sm:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Creating Invoice...
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 'payment' && invoice && (
          <>
            <DialogHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <DialogTitle>Pay with {selectedCrypto}</DialogTitle>
                <div
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    invoice.status
                  )} w-fit`}
                >
                  {getStatusText(invoice.status)}
                </div>
              </div>
              <DialogDescription>
                Send exactly{' '}
                {formatCryptoAmount(
                  calculateCryptoAmount(
                    invoice.amountDue,
                    selectedCrypto as CryptoCurrency
                  ),
                  selectedCrypto as CryptoCurrency
                )}{' '}
                {selectedCrypto} to the address below.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {/* QR Code */}
              <div className="flex justify-center">
                <div className="p-4 border rounded-lg bg-white">
                  <img
                    src={invoice.qrCodeUrl || '/placeholder.svg'}
                    alt={`QR Code for ${selectedCrypto} payment`}
                    className="w-[150px] h-[150px] sm:w-[200px] sm:h-[200px]"
                  />
                </div>
              </div>

              {/* Payment Details */}
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label className="text-sm text-muted-foreground">
                    {selectedCrypto} Address
                  </Label>
                  <div className="flex items-center relative">
                    <Input
                      readOnly
                      value={invoice.paymentAddresses[selectedCrypto]}
                      className="font-mono text-xs sm:text-sm pr-12 overflow-x-auto"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 mr-2"
                      onClick={copyAddressToClipboard}
                    >
                      {copySuccess ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                      <span className="sr-only">Copy address</span>
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">
                      Amount
                    </Label>
                    <div className="font-medium text-sm sm:text-base break-words">
                      {formatCryptoAmount(
                        calculateCryptoAmount(
                          invoice.amountDue,
                          selectedCrypto as CryptoCurrency
                        ),
                        selectedCrypto as CryptoCurrency
                      )}{' '}
                      {selectedCrypto}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">
                      Expires in
                    </Label>
                    <div
                      className={`font-medium text-sm sm:text-base ${
                        timeLeft < 60 ? 'text-red-500' : ''
                      }`}
                    >
                      {formatTimeLeft()}
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="rounded-md bg-muted p-3">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-muted-foreground">
                      <p className="mb-1">
                        Send only {selectedCrypto} to this address. Sending any
                        other cryptocurrency may result in permanent loss.
                      </p>
                      <p>
                        This page will automatically update when your payment is
                        detected.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Updates */}
              {invoice.status !== 'new' && (
                <div
                  className={`rounded-md p-3 ${
                    invoice.status === 'complete'
                      ? 'bg-green-50 border border-green-200'
                      : invoice.status === 'pending'
                      ? 'bg-yellow-50 border border-yellow-200'
                      : invoice.status === 'confirmed'
                      ? 'bg-purple-50 border border-purple-200'
                      : 'bg-red-50 border border-red-200'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {invoice.status === 'complete' ? (
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    ) : (
                      <RefreshCcw
                        className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                          invoice.status === 'pending'
                            ? 'text-yellow-500'
                            : invoice.status === 'confirmed'
                            ? 'text-purple-500'
                            : 'text-red-500'
                        } ${
                          invoice.status === 'pending' ||
                          invoice.status === 'confirmed'
                            ? 'animate-spin'
                            : ''
                        }`}
                      />
                    )}
                    <div className="text-sm">
                      {invoice.status === 'complete' &&
                        'Payment complete! Your account will be credited shortly.'}
                      {invoice.status === 'pending' &&
                        'Payment detected! Waiting for blockchain confirmation.'}
                      {invoice.status === 'confirmed' &&
                        'Payment confirmed! Finalizing your deposit.'}
                      {invoice.status === 'expired' &&
                        'This invoice has expired. Please create a new one.'}
                      {invoice.status === 'invalid' &&
                        'There was an issue with this payment. Please contact support.'}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              {invoice.status === 'expired' ? (
                <Button onClick={() => setStep('amount')} className="w-full">
                  Create New Invoice
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="sm:mr-auto w-full sm:w-auto"
                    onClick={() => {
                      if (statusCheckInterval) {
                        clearInterval(statusCheckInterval);
                        setStatusCheckInterval(null);
                      }
                      setStep('amount');
                    }}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <Button
                      variant="outline"
                      onClick={() => checkInvoiceStatus(invoice.id)}
                      className="gap-1 w-full sm:w-auto"
                    >
                      <RefreshCcw className="h-4 w-4" />
                      Check Status
                    </Button>
                    <Button
                      onClick={() => {
                        // For demo purposes, force complete status
                        setInvoice((prev) => {
                          if (!prev) return null;
                          return {
                            ...prev,
                            status: 'complete',
                            lastUpdated: new Date().toISOString(),
                          };
                        });
                        if (statusCheckInterval) {
                          clearInterval(statusCheckInterval);
                          setStatusCheckInterval(null);
                        }
                        setStep('success');
                      }}
                      className="w-full sm:w-auto"
                    >
                      Demo: Complete Payment
                    </Button>
                  </div>
                </>
              )}
            </DialogFooter>
          </>
        )}

        {step === 'success' && invoice && (
          <>
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="mb-4 rounded-full bg-green-100 p-3">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="mb-2 text-xl sm:text-2xl font-bold">
                Deposit Successful!
              </h2>
              <p className="mb-6 text-sm sm:text-base text-muted-foreground">
                Your deposit of {formatCurrency(invoice.amountDue.toString())}{' '}
                has been confirmed.
              </p>
              <div className="w-full rounded-md border p-4 text-left">
                <div className="space-y-3">
                  <div className="flex justify-between flex-wrap gap-1">
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      Transaction ID
                    </span>
                    <span className="text-xs sm:text-sm font-medium">
                      {invoice.id}
                    </span>
                  </div>
                  <div className="flex justify-between flex-wrap gap-1">
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      Amount
                    </span>
                    <span className="text-xs sm:text-sm">
                      {formatCryptoAmount(
                        calculateCryptoAmount(
                          invoice.amountDue,
                          selectedCrypto as CryptoCurrency
                        ),
                        selectedCrypto as CryptoCurrency
                      )}{' '}
                      {selectedCrypto}
                      <span className="text-muted-foreground ml-1">
                        ({formatCurrency(invoice.amountDue.toString())})
                      </span>
                    </span>
                  </div>
                  <div className="flex justify-between flex-wrap gap-1">
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      Date
                    </span>
                    <span className="text-xs sm:text-sm">
                      {new Date().toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between flex-wrap gap-1">
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      Status
                    </span>
                    <span
                      className={`text-xs sm:text-sm px-2 py-0.5 rounded-full ${getStatusColor(
                        'complete'
                      )}`}
                    >
                      {getStatusText('complete')}
                    </span>
                  </div>
                  <Separator />
                  <div className="pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      asChild
                    >
                      <a
                        href="#"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center"
                      >
                        View on Blockchain
                        <ExternalLink className="ml-2 h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleClose} className="w-full">
                Done
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
