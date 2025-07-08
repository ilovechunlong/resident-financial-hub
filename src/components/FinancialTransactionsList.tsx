
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useFinancialTransactions } from '@/hooks/useFinancialTransactions';
import { FinancialTransaction } from '@/types/financial';
import { format } from 'date-fns';
import { Loader2, Edit, Trash2 } from 'lucide-react';
import { TransactionFiltersComponent, TransactionFilters } from './financial/TransactionFilters';
import { TransactionsPagination } from './financial/TransactionsPagination';
import { TransactionEditDialog } from './financial/TransactionEditDialog';

const ITEMS_PER_PAGE = 10;

export function FinancialTransactionsList() {
  const { data: transactions = [], isLoading, error, refetch } = useFinancialTransactions();
  const [currentPage, setCurrentPage] = useState(1);
  const [editingTransaction, setEditingTransaction] = useState<FinancialTransaction | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [filters, setFilters] = useState<TransactionFilters>({
    dateRange: {},
    type: undefined,
    status: undefined,
    category: undefined,
  });

  // Filter transactions based on current filters
  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      // Date range filter
      if (filters.dateRange.from) {
        const transactionDate = new Date(transaction.transaction_date);
        if (transactionDate < filters.dateRange.from) return false;
      }
      if (filters.dateRange.to) {
        const transactionDate = new Date(transaction.transaction_date);
        if (transactionDate > filters.dateRange.to) return false;
      }
      
      // Type filter
      if (filters.type && filters.type !== 'all' && transaction.transaction_type !== filters.type) {
        return false;
      }
      
      // Status filter
      if (filters.status && filters.status !== 'all' && transaction.status !== filters.status) {
        return false;
      }
      
      // Category filter
      if (filters.category && !transaction.category.toLowerCase().includes(filters.category.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  }, [transactions, filters]);

  // Paginate filtered transactions
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTransactions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredTransactions, currentPage]);

  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);

  const handleFiltersChange = (newFilters: TransactionFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleClearFilters = () => {
    setFilters({
      dateRange: {},
      type: undefined,
      status: undefined,
      category: undefined,
    });
    setCurrentPage(1);
  };

  const handleEditTransaction = (transaction: FinancialTransaction) => {
    setEditingTransaction(transaction);
    setIsEditDialogOpen(true);
  };

  const handleEditSuccess = () => {
    refetch();
  };

  const handleDeleteTransaction = (transactionId: string) => {
    // TODO: Implement delete functionality
    console.log('Delete transaction:', transactionId);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <TransactionFiltersComponent 
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
        />
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading transactions...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <TransactionFiltersComponent 
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
        />
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-red-500">Error loading transactions</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getTransactionTypeColor = (type: string) => {
    return type === 'income' ? 'text-green-600' : 'text-red-600';
  };

  const formatAmount = (amount: number, type: string) => {
    const prefix = type === 'income' ? '+' : '-';
    return `${prefix}$${amount.toFixed(2)}`;
  };

  return (
    <div className="space-y-6">
      <TransactionFiltersComponent 
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onClearFilters={handleClearFilters}
      />
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>
            View and manage all financial transactions
            {filteredTransactions.length !== transactions.length && (
              <span className="ml-2 text-sm">
                ({filteredTransactions.length} of {transactions.length} transactions)
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {paginatedTransactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {transactions.length === 0 
                ? "No transactions found. Add your first transaction above."
                : "No transactions match your current filters."
              }
            </p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment Method</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedTransactions.map((transaction: FinancialTransaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          {format(new Date(transaction.transaction_date), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={transaction.transaction_type === 'income' ? 'default' : 'secondary'}
                            className={transaction.transaction_type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                          >
                            {transaction.transaction_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{transaction.category}</TableCell>
                        <TableCell>
                          <span className={`font-medium ${getTransactionTypeColor(transaction.transaction_type)}`}>
                            {formatAmount(transaction.amount, transaction.transaction_type)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(transaction.status)}>
                            {transaction.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {transaction.payment_method ? (
                            <span className="capitalize">{transaction.payment_method.replace('_', ' ')}</span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {transaction.description ? (
                            <span className="text-sm">{transaction.description}</span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditTransaction(transaction)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteTransaction(transaction.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {totalPages > 1 && (
                <div className="flex justify-center mt-6">
                  <TransactionsPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <TransactionEditDialog
        transaction={editingTransaction}
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setEditingTransaction(null);
        }}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
}
