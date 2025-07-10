
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FinancialTransactionForm } from '@/components/FinancialTransactionForm';
import { FinancialTransaction } from '@/types/financial';

interface TransactionEditDialogProps {
  transaction: FinancialTransaction | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function TransactionEditDialog({ 
  transaction, 
  isOpen, 
  onClose, 
  onSuccess 
}: TransactionEditDialogProps) {
  const handleSuccess = () => {
    console.log('Transaction updated successfully, closing dialog and refreshing data');
    onSuccess();
    onClose();
  };

  const handleClose = () => {
    console.log('Closing transaction edit dialog');
    onClose();
  };

  if (!transaction) {
    console.log('No transaction provided to edit dialog');
    return null;
  }

  console.log('Rendering edit dialog for transaction:', transaction.id);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Transaction</DialogTitle>
        </DialogHeader>
        <FinancialTransactionForm 
          initialData={transaction}
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}
