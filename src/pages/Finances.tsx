
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { FinancialSummary } from '@/components/FinancialSummary';
import { FinancialTransactionForm } from '@/components/FinancialTransactionForm';
import { FinancialTransactionsList } from '@/components/FinancialTransactionsList';

export default function Finances() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleFormSuccess = () => {
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Financial Tracking</h1>
          <p className="text-muted-foreground">
            Monitor income, expenses, and financial health of your care home operations.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Transaction
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Transaction</DialogTitle>
              <DialogDescription>
                Record a new financial transaction for your care home.
              </DialogDescription>
            </DialogHeader>
            <FinancialTransactionForm onSuccess={handleFormSuccess} />
          </DialogContent>
        </Dialog>
      </div>

      <FinancialSummary />
      
      <FinancialTransactionsList />
    </div>
  );
}
