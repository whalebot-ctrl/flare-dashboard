'use client';

import { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CreditCard,
  DollarSign,
  Info,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type PaymentMethod = 'bank' | 'card' | 'crypto';

export function DepositDialog() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'amount' | 'payment' | 'review' | 'success'>(
    'amount'
  );
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Bank transfer details
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');

  // Card details
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');

  // Crypto details
  const [selectedCrypto, setSelectedCrypto] = useState('BTC');

  const resetForm = () => {
    setStep('amount');
    setAmount('');
    setPaymentMethod('bank');
    setAccountName('');
    setAccountNumber('');
    setRoutingNumber('');
    setCardNumber('');
    setCardName('');
    setExpiryDate('');
    setCvv('');
    setSelectedCrypto('BTC');
    setIsSubmitting(false);
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(resetForm, 300); // Reset after dialog animation completes
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setStep('success');
    }, 1500);
  };

  const isAmountValid = () => {
    const numAmount = Number.parseFloat(amount);
    return !isNaN(numAmount) && numAmount > 0;
  };

  const isBankDetailsValid = () => {
    return (
      accountName.trim() !== '' &&
      accountNumber.trim() !== '' &&
      routingNumber.trim() !== ''
    );
  };

  const isCardDetailsValid = () => {
    return (
      cardNumber.trim() !== '' &&
      cardName.trim() !== '' &&
      expiryDate.trim() !== '' &&
      cvv.trim() !== ''
    );
  };

  const isNextButtonDisabled = () => {
    if (step === 'amount') {
      return !isAmountValid();
    }
    if (step === 'payment') {
      if (paymentMethod === 'bank') {
        return !isBankDetailsValid();
      }
      if (paymentMethod === 'card') {
        return !isCardDetailsValid();
      }
    }
    return false;
  };

  const formatCurrency = (value: string) => {
    const numValue = Number.parseFloat(value);
    if (isNaN(numValue)) return '$0.00';
    return numValue.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <DollarSign className="mr-2 h-4 w-4" />
          Deposit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        {step === 'amount' && (
          <>
            <DialogHeader>
              <DialogTitle>Deposit Funds</DialogTitle>
              <DialogDescription>
                Enter the amount you want to deposit to your account.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="amount">Amount</Label>
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
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Quick amounts:</span>
                  <div className="space-x-2">
                    {['100', '500', '1000', '5000'].map((quickAmount) => (
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
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={() => setStep('payment')}
                disabled={!isAmountValid()}
              >
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 'payment' && (
          <>
            <DialogHeader>
              <DialogTitle>Payment Method</DialogTitle>
              <DialogDescription>
                Select how you want to deposit {formatCurrency(amount)}.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Tabs
                defaultValue="bank"
                value={paymentMethod}
                onValueChange={(value) =>
                  setPaymentMethod(value as PaymentMethod)
                }
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="bank">Bank</TabsTrigger>
                  <TabsTrigger value="card">Card</TabsTrigger>
                  <TabsTrigger value="crypto">Crypto</TabsTrigger>
                </TabsList>
                <TabsContent value="bank" className="space-y-4 pt-4">
                  <div className="grid gap-2">
                    <Label htmlFor="account-name">Account Holder Name</Label>
                    <Input
                      id="account-name"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="account-number">Account Number</Label>
                    <Input
                      id="account-number"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="routing-number">Routing Number</Label>
                    <Input
                      id="routing-number"
                      value={routingNumber}
                      onChange={(e) => setRoutingNumber(e.target.value)}
                    />
                  </div>
                </TabsContent>
                <TabsContent value="card" className="space-y-4 pt-4">
                  <div className="grid gap-2">
                    <Label htmlFor="card-number">Card Number</Label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="card-number"
                        placeholder="1234 5678 9012 3456"
                        className="pl-9"
                        value={cardNumber}
                        onChange={(e) => {
                          // Format card number with spaces every 4 digits
                          const value = e.target.value
                            .replace(/\D/g, '')
                            .substring(0, 16);
                          const parts = [];
                          for (let i = 0; i < value.length; i += 4) {
                            parts.push(value.substring(i, i + 4));
                          }
                          setCardNumber(parts.join(' '));
                        }}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="card-name">Cardholder Name</Label>
                    <Input
                      id="card-name"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="expiry">Expiry Date</Label>
                      <Input
                        id="expiry"
                        placeholder="MM/YY"
                        value={expiryDate}
                        onChange={(e) => {
                          // Format expiry date as MM/YY
                          const value = e.target.value
                            .replace(/\D/g, '')
                            .substring(0, 4);
                          if (value.length <= 2) {
                            setExpiryDate(value);
                          } else {
                            setExpiryDate(
                              `${value.substring(0, 2)}/${value.substring(2)}`
                            );
                          }
                        }}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        placeholder="123"
                        value={cvv}
                        onChange={(e) => {
                          // Only allow 3-4 digits
                          const value = e.target.value
                            .replace(/\D/g, '')
                            .substring(0, 4);
                          setCvv(value);
                        }}
                      />
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="crypto" className="space-y-4 pt-4">
                  <div className="grid gap-2">
                    <Label>Select Cryptocurrency</Label>
                    <RadioGroup
                      value={selectedCrypto}
                      onValueChange={setSelectedCrypto}
                      className="flex flex-col space-y-1"
                    >
                      <div className="flex items-center space-x-2 rounded-md border p-3">
                        <RadioGroupItem value="BTC" id="btc" />
                        <Label
                          htmlFor="btc"
                          className="flex flex-1 items-center gap-2 font-normal"
                        >
                          <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-medium">
                            BTC
                          </div>
                          <div className="flex-1">Bitcoin</div>
                          <div className="text-sm text-muted-foreground">
                            1 BTC ≈ $68,245.32
                          </div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 rounded-md border p-3">
                        <RadioGroupItem value="ETH" id="eth" />
                        <Label
                          htmlFor="eth"
                          className="flex flex-1 items-center gap-2 font-normal"
                        >
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                            ETH
                          </div>
                          <div className="flex-1">Ethereum</div>
                          <div className="text-sm text-muted-foreground">
                            1 ETH ≈ $3,456.78
                          </div>
                        </Label>
                      </div>
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
                    </RadioGroup>
                  </div>
                  <div className="rounded-md bg-muted p-3">
                    <div className="flex items-start gap-2">
                      <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div className="text-sm text-muted-foreground">
                        You will receive deposit instructions after confirming
                        this transaction.
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                className="sm:mr-auto"
                onClick={() => setStep('amount')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={() => setStep('review')}
                disabled={isNextButtonDisabled()}
              >
                Review
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 'review' && (
          <>
            <DialogHeader>
              <DialogTitle>Review Deposit</DialogTitle>
              <DialogDescription>
                Please review your deposit details before confirming.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="rounded-md border p-4">
                <div className="mb-4 text-center">
                  <div className="text-sm text-muted-foreground">
                    Deposit Amount
                  </div>
                  <div className="text-3xl font-bold">
                    {formatCurrency(amount)}
                  </div>
                </div>
                <Separator className="my-4" />
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Payment Method
                    </span>
                    <span className="text-sm font-medium">
                      {paymentMethod === 'bank'
                        ? 'Bank Transfer'
                        : paymentMethod === 'card'
                        ? 'Credit/Debit Card'
                        : `Cryptocurrency (${selectedCrypto})`}
                    </span>
                  </div>
                  {paymentMethod === 'bank' && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Account Name
                        </span>
                        <span className="text-sm">{accountName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Account Number
                        </span>
                        <span className="text-sm">
                          ••••
                          {accountNumber.substring(
                            Math.max(0, accountNumber.length - 4)
                          )}
                        </span>
                      </div>
                    </>
                  )}
                  {paymentMethod === 'card' && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Card
                        </span>
                        <span className="text-sm">
                          ••••
                          {cardNumber.substring(
                            Math.max(0, cardNumber.length - 4)
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Cardholder
                        </span>
                        <span className="text-sm">{cardName}</span>
                      </div>
                    </>
                  )}
                  {paymentMethod === 'crypto' && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Cryptocurrency
                      </span>
                      <span className="text-sm">{selectedCrypto}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Processing Fee
                    </span>
                    <span className="text-sm">
                      {paymentMethod === 'card'
                        ? '$2.99'
                        : paymentMethod === 'crypto'
                        ? '1.5%'
                        : '$0.00'}
                    </span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>
                      {paymentMethod === 'card'
                        ? formatCurrency(
                            (Number.parseFloat(amount) + 2.99).toString()
                          )
                        : paymentMethod === 'crypto'
                        ? formatCurrency(
                            (Number.parseFloat(amount) * 1.015).toString()
                          )
                        : formatCurrency(amount)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="rounded-md bg-muted p-3">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="text-sm text-muted-foreground">
                    By confirming this deposit, you agree to our terms and
                    conditions. Funds will be available in your account within
                    1-3 business days for bank transfers, immediately for card
                    payments, and after 6 confirmations for crypto deposits.
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                className="sm:mr-auto"
                onClick={() => setStep('payment')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Processing...
                  </>
                ) : (
                  <>Confirm Deposit</>
                )}
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 'success' && (
          <>
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="mb-4 rounded-full bg-green-100 p-3">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="mb-2 text-2xl font-bold">Deposit Successful!</h2>
              <p className="mb-6 text-muted-foreground">
                Your deposit of {formatCurrency(amount)} has been initiated
                successfully.
              </p>
              <div className="w-full rounded-md border p-4 text-left">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Transaction ID
                    </span>
                    <span className="text-sm font-medium">
                      TXN{Math.floor(Math.random() * 1000000)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Date</span>
                    <span className="text-sm">
                      {new Date().toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Status
                    </span>
                    <span className="text-sm">
                      {paymentMethod === 'bank'
                        ? 'Pending'
                        : paymentMethod === 'card'
                        ? 'Completed'
                        : 'Pending'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Estimated Completion
                    </span>
                    <span className="text-sm">
                      {paymentMethod === 'bank'
                        ? '1-3 business days'
                        : paymentMethod === 'card'
                        ? 'Immediate'
                        : '~30 minutes'}
                    </span>
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
