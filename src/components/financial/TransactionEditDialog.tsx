
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
    onSuccess();
    onClose();
  };

  if (!transaction) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
