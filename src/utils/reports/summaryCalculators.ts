
export class SummaryCalculators {
  static calculateFinancialSummary(data: any[]) {
    const totalTransactions = data.length;
    const totalAmount = data.reduce((sum, item) => sum + Number(item.amount), 0);
    const totalIncome = data.filter(item => item.transaction_type === 'income').reduce((sum, item) => sum + Number(item.amount), 0);
    const totalExpenses = data.filter(item => item.transaction_type === 'expense').reduce((sum, item) => sum + Number(item.amount), 0);

    return {
      totalTransactions,
      totalAmount,
      totalIncome,
      totalExpenses,
      netAmount: totalIncome - totalExpenses,
      generatedAt: new Date().toISOString()
    };
  }

  static calculateNursingHomeSummary(data: any[]) {
    return {
      totalNursingHomes: data.length,
      totalCapacity: data.reduce((sum, item) => sum + item.capacity, 0),
      averageCapacity: data.length > 0 ? data.reduce((sum, item) => sum + item.capacity, 0) / data.length : 0,
      generatedAt: new Date().toISOString()
    };
  }

  static calculateResidentSummary(data: any[]) {
    return {
      totalResidents: data.length,
      activeResidents: data.filter(r => r.status === 'active').length,
      generatedAt: new Date().toISOString()
    };
  }

  static calculateResidentAnnualFinancialSummary(data: any[]) {
    const totalIncome = data.reduce((sum, r) => sum + r.totalIncome, 0);
    const totalExpenses = data.reduce((sum, r) => sum + r.totalExpenses, 0);

    return {
      totalResidents: data.length,
      totalIncome,
      totalExpenses,
      netAmount: totalIncome - totalExpenses,
      averageIncomePerResident: data.length > 0 ? totalIncome / data.length : 0,
      averageExpensePerResident: data.length > 0 ? totalExpenses / data.length : 0,
      generatedAt: new Date().toISOString()
    };
  }

  static calculateNursingHomeAnnualFinancialSummary(data: any[]) {
    const totalIncome = data.reduce((sum, nh) => sum + nh.totalIncome, 0);
    const totalExpenses = data.reduce((sum, nh) => sum + nh.totalExpenses, 0);

    return {
      totalNursingHomes: data.length,
      totalIncome,
      totalExpenses,
      netAmount: totalIncome - totalExpenses,
      averageIncomePerNursingHome: data.length > 0 ? totalIncome / data.length : 0,
      averageExpensePerNursingHome: data.length > 0 ? totalExpenses / data.length : 0,
      generatedAt: new Date().toISOString()
    };
  }

  static calculateResidentsIncomePerNursingHomeMonthly(data: any[]) {
    const totalNursingHomes = new Set(data.map(d => d.nursingHomeId)).size;
    const totalRecords = data.length;
    const totalIncome = data.reduce((sum, d) => sum + d.totalIncome, 0);
    const totalTransactions = data.reduce((sum, d) => sum + d.totalTransactions, 0);
    
    const allResidents = new Set();
    const residentsWithIssues = new Set();
    data.forEach(d => {
      d.residentDetails.forEach((resident: any) => {
        allResidents.add(resident.residentId);
        if (resident.hasIncomeIssues) {
          residentsWithIssues.add(resident.residentId);
        }
      });
    });

    return {
      totalNursingHomes,
      totalResidents: allResidents.size,
      totalRecords,
      totalIncome,
      totalTransactions,
      residentsWithIssues: residentsWithIssues.size,
      averageIncomePerRecord: totalRecords > 0 ? totalIncome / totalRecords : 0,
      averageTransactionsPerRecord: totalRecords > 0 ? totalTransactions / totalRecords : 0,
      generatedAt: new Date().toISOString()
    };
  }

  static calculateResidentIncomeExpenseSummary(data: any[]) {
    const totalNursingHomes = new Set(data.map(d => d.nursingHomeId)).size;
    const totalRecords = data.length;
    const totalIncome = data.reduce((sum, d) => sum + d.totalIncome, 0);
    const totalExpenses = data.reduce((sum, d) => sum + d.totalExpenses, 0);
    const netAmount = totalIncome - totalExpenses;
    
    const allResidents = new Set();
    data.forEach(d => {
      d.residentSummaries.forEach((resident: any) => {
        allResidents.add(resident.residentId);
      });
    });

    return {
      totalNursingHomes,
      totalResidents: allResidents.size,
      totalRecords,
      totalIncome,
      totalExpenses,
      netAmount,
      averageIncomePerRecord: totalRecords > 0 ? totalIncome / totalRecords : 0,
      averageExpensePerRecord: totalRecords > 0 ? totalExpenses / totalRecords : 0,
      generatedAt: new Date().toISOString()
    };
  }
}
