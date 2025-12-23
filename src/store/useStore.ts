import { create } from "zustand";
import { persist } from "zustand/middleware";
import dayjs from "dayjs";
import { v4 as uuidv4 } from "uuid";
import accountsData from "../data/accounts.json";
import transactionsData from "../data/transactions.json";

/* types */
export type Account = {
  id: string;
  name: string;
  balance: number;
  currency?: string;
  color?: string;
};

export type Transaction = {
  id: string;
  date: string;
  merchant: string;
  category: string;
  amount: number;
  accountId: string;
  description?: string;
  isRecurring?: boolean;
  recurringId?: string;
};

export type Budget = {
  id: string;
  category: string;
  limit: number;
  period: "monthly" | "weekly" | "yearly";
  startDate: string;
  endDate?: string;
  spent?: number;
};

export type RecurringTransaction = {
  id: string;
  merchant: string;
  category: string;
  amount: number;
  accountId: string;
  description?: string;
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  startDate: string;
  endDate?: string;
  lastProcessed?: string;
  isActive: boolean;
};

export type AccountHistory = {
  date: string;
  accountId: string;
  balance: number;
};

type Store = {
  accounts: Account[];
  transactions: Transaction[];
  budgets: Budget[];
  recurringTransactions: RecurringTransaction[];
  accountHistory: AccountHistory[];
  deleteTransaction: (id: string) => void;

  // Core actions
  addTransaction: (tx: Transaction) => void;
  transfer: (
    fromId: string,
    toId: string,
    amount: number,
    description?: string
  ) => Promise<void>;
  reload: () => void;

  // Budget actions
  addBudget: (budget: Budget) => void;
  updateBudget: (id: string, updates: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
  calculateBudgetSpending: (budget: Budget) => number;

  // Recurring transaction actions
  addRecurringTransaction: (rt: Omit<RecurringTransaction, "id">) => void;
  updateRecurringTransaction: (
    id: string,
    updates: Partial<RecurringTransaction>
  ) => void;
  deleteRecurringTransaction: (id: string) => void;
  processRecurringTransactions: () => void;

  // History actions
  addAccountHistory: (history: AccountHistory) => void;
  getAccountHistory: (accountId: string, days?: number) => AccountHistory[];

  // Export actions
  exportTransactions: (format: "csv" | "json") => string;

  // Filter actions
  filterTransactions: (options: {
    startDate?: string;
    endDate?: string;
    category?: string;
    minAmount?: number;
    maxAmount?: number;
    accountId?: string;
  }) => Transaction[];
};

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      accounts: (accountsData as Account[]).map((a) => ({
        ...a,
        color: a.color || (a.id === "main" ? "#3B82F6" : "#10B981"),
      })),
      transactions: transactionsData as Transaction[],
      budgets: [],
      recurringTransactions: [],
      accountHistory: [],

      addTransaction: (tx) => {
        set((s) => {
          // Update account balance
          const updatedAccounts = s.accounts.map((account) => {
            if (account.id === tx.accountId) {
              return {
                ...account,
                balance: +(account.balance + tx.amount).toFixed(2),
              };
            }
            return account;
          });

          // Add to history
          const newHistory: AccountHistory = {
            date: dayjs().toISOString(),
            accountId: tx.accountId,
            balance:
              updatedAccounts.find((a) => a.id === tx.accountId)?.balance || 0,
          };

          return {
            transactions: [tx, ...s.transactions],
            accounts: updatedAccounts,
            accountHistory: [newHistory, ...s.accountHistory],
          };
        });
      },

      transfer: async (fromId, toId, amount, description = "Transfer") => {
        const store = get();
        const from = store.accounts.find((a) => a.id === fromId);
        const to = store.accounts.find((a) => a.id === toId);
        if (!from || !to) throw new Error("Account not found");
        if (amount <= 0) throw new Error("Amount must be positive");
        if (from.balance < amount) throw new Error("Insufficient balance");

        // Save snapshots
        const prevAccounts = store.accounts.map((account) => ({ ...account }));
        const prevTransactions = store.transactions.slice();

        set((s) => ({
          accounts: s.accounts.map((account) => {
            if (account.id === fromId)
              return {
                ...account,
                balance: +(account.balance - amount).toFixed(2),
              };
            if (account.id === toId)
              return {
                ...account,
                balance: +(account.balance + amount).toFixed(2),
              };
            return account;
          }),
        }));

        const now = dayjs().toISOString();
        const debitTx: Transaction = {
          id: uuidv4(),
          date: now,
          merchant: `Transfer to ${to.name}`,
          category: "Transfer",
          amount: -Math.abs(Number(amount.toFixed(2))),
          accountId: fromId,
          description,
        };
        const creditTx: Transaction = {
          id: uuidv4(),
          date: now,
          merchant: `Transfer from ${from.name}`,
          category: "Transfer",
          amount: Math.abs(Number(amount.toFixed(2))),
          accountId: toId,
          description,
        };

        set((s) => ({ transactions: [creditTx, debitTx, ...s.transactions] }));

        await new Promise((res) => setTimeout(res, 600));
        const randomFail = false;

        if (randomFail) {
          set(() => ({
            accounts: prevAccounts,
            transactions: prevTransactions,
          }));
          throw new Error("Network error (simulated)");
        }
        return;
      },

      reload: () =>
        set(() => ({
          accounts: accountsData as Account[],
          transactions: transactionsData as Transaction[],
          budgets: [],
          recurringTransactions: [],
          accountHistory: [],
        })),

      // Budget methods
      addBudget: (budget) => {
        const budgetWithId = { ...budget, id: uuidv4(), spent: 0 };
        set((s) => ({ budgets: [...s.budgets, budgetWithId] }));
      },

      updateBudget: (id, updates) =>
        set((s) => ({
          budgets: s.budgets.map((budget) =>
            budget.id === id ? { ...budget, ...updates } : budget
          ),
        })),

      deleteBudget: (id) =>
        set((s) => ({
          budgets: s.budgets.filter((budget) => budget.id !== id),
        })),

      // In your useStore.ts, update calculateBudgetSpending:
      calculateBudgetSpending: (budget) => {
        const { transactions } = get();
        const now = dayjs();

        // Get transactions for the current budget period
        const relevantTransactions = transactions.filter((t) => {
          const txDate = dayjs(t.date);
          const isCurrentPeriod = () => {
            switch (budget.period) {
              case "weekly":
                return (
                  txDate.isAfter(now.startOf("week")) &&
                  txDate.isBefore(now.endOf("week"))
                );
              case "monthly":
                return (
                  txDate.isAfter(now.startOf("month")) &&
                  txDate.isBefore(now.endOf("month"))
                );
              case "yearly":
                return (
                  txDate.isAfter(now.startOf("year")) &&
                  txDate.isBefore(now.endOf("year"))
                );
              default:
                return txDate.isAfter(now.startOf("month"));
            }
          };

          return (
            t.category === budget.category &&
            t.amount < 0 && // Only count expenses (negative amounts)
            isCurrentPeriod()
          );
        });

        const totalSpent = Math.abs(
          relevantTransactions.reduce((sum, t) => sum + t.amount, 0)
        );
        return parseFloat(totalSpent.toFixed(2));
      },
      addRecurringTransaction: (rt: Omit<RecurringTransaction, "id">) => {
        const recurringWithId = { ...rt, id: uuidv4() };
        set((s) => ({
          recurringTransactions: [...s.recurringTransactions, recurringWithId],
        }));
      },

      updateRecurringTransaction: (id, updates) =>
        set((s) => ({
          recurringTransactions: s.recurringTransactions.map((rt) =>
            rt.id === id ? { ...rt, ...updates } : rt
          ),
        })),

      deleteTransaction: (id: string) => {
        set((state) => {
          // Find the transaction to delete
          const transaction = state.transactions.find((t) => t.id === id);
          if (!transaction) return state;

          console.log("Deleting transaction:", transaction);

          // Update account balance (reverse the transaction)
          const updatedAccounts = state.accounts.map((account) => {
            if (account.id === transaction.accountId) {
              // Subtract the transaction amount (if it was -200, subtracting -200 = +200)
              const newBalance = account.balance - transaction.amount;
              return {
                ...account,
                balance: parseFloat(newBalance.toFixed(2)),
              };
            }
            return account;
          });

          // Remove the transaction
          const updatedTransactions = state.transactions.filter(
            (t) => t.id !== id
          );

          // Update account history with new balance
          const updatedHistory = [...state.accountHistory];
          const account = updatedAccounts.find(
            (a) => a.id === transaction.accountId
          );
          if (account) {
            updatedHistory.unshift({
              date: new Date().toISOString(),
              accountId: transaction.accountId,
              balance: account.balance,
            });
          }

          return {
            transactions: updatedTransactions,
            accounts: updatedAccounts,
            accountHistory: updatedHistory,
          };
        });
      },

      // In your useStore.ts, update the deleteRecurringTransaction function:
deleteRecurringTransaction: (id: string) => {
  set((state) => {
    // First, find the recurring transaction being deleted
    const recurringToDelete = state.recurringTransactions.find(rt => rt.id === id);
    if (!recurringToDelete) return state;
    
    console.log('Deleting recurring transaction:', recurringToDelete);
    
    // Find all transactions that were created by this recurring transaction
    const transactionsFromThisRecurring = state.transactions.filter(
      t => t.recurringId === id || (t.isRecurring && t.merchant === recurringToDelete.merchant)
    );
    
    console.log('Found transactions to delete:', transactionsFromThisRecurring.length);
    
    const updatedAccounts = [...state.accounts];
    let updatedTransactions = [...state.transactions];
    const updatedHistory = [...state.accountHistory];
    
    // For each transaction created by this recurring, reverse it
    transactionsFromThisRecurring.forEach(tx => {
      // Reverse the account balance
      const accountIndex = updatedAccounts.findIndex(a => a.id === tx.accountId);
      if (accountIndex !== -1) {
        const oldBalance = updatedAccounts[accountIndex].balance;
        const newBalance = oldBalance - tx.amount; // Subtract because we're reversing
        
        console.log(`Reversing transaction ${tx.id}: Account ${tx.accountId}: ${oldBalance} -> ${newBalance}`);
        
        updatedAccounts[accountIndex] = {
          ...updatedAccounts[accountIndex],
          balance: parseFloat(newBalance.toFixed(2))
        };
        
        // Add new history entry
        updatedHistory.unshift({
          date: new Date().toISOString(),
          accountId: tx.accountId,
          balance: parseFloat(newBalance.toFixed(2))
        });
      }
      
      // Remove the transaction
      updatedTransactions = updatedTransactions.filter(t => t.id !== tx.id);
    });
    
    // Remove the recurring transaction template
    const updatedRecurringTransactions = state.recurringTransactions.filter(rt => rt.id !== id);
    
    return {
      transactions: updatedTransactions,
      accounts: updatedAccounts,
      recurringTransactions: updatedRecurringTransactions,
      accountHistory: updatedHistory
    };
  });
},

      processRecurringTransactions: () => {
        set((state) => {
          const now = dayjs();
          const newTransactions = [...state.transactions];
          const updatedAccounts = [...state.accounts];
          let updatedRecurring = [...state.recurringTransactions];
          const newHistory = [...state.accountHistory];

          console.log("=== PROCESSING RECURRING TRANSACTIONS ===");

          // Process ALL active recurring transactions regardless of last processed date
          const toProcess = state.recurringTransactions.filter(
            (rt) => rt.isActive
          );

          console.log(
            `Found ${toProcess.length} active recurring transactions to process`
          );

          toProcess.forEach((rt) => {
            console.log(`Processing: ${rt.merchant} - $${rt.amount}`);

            // Create new transaction
            const transaction: Transaction = {
              id: uuidv4(),
              date: now.toISOString(),
              merchant: rt.merchant,
              category: rt.category,
              amount: rt.amount,
              accountId: rt.accountId,
              description: rt.description || `Recurring: ${rt.frequency}`,
              isRecurring: true,
              recurringId: rt.id,
            };

            newTransactions.unshift(transaction);

            // Update account balance
            const accountIndex = updatedAccounts.findIndex(
              (a) => a.id === rt.accountId
            );
            if (accountIndex !== -1) {
              const oldBalance = updatedAccounts[accountIndex].balance;
              const newBalance = oldBalance + rt.amount;

              console.log(
                `Account ${rt.accountId} (${updatedAccounts[accountIndex].name}): $${oldBalance} → $${newBalance}`
              );

              updatedAccounts[accountIndex] = {
                ...updatedAccounts[accountIndex],
                balance: parseFloat(newBalance.toFixed(2)),
              };

              // Add to history
              newHistory.unshift({
                date: now.toISOString(),
                accountId: rt.accountId,
                balance: parseFloat(newBalance.toFixed(2)),
              });
            }

            // Update lastProcessed date
            updatedRecurring = updatedRecurring.map((r) =>
              r.id === rt.id ? { ...r, lastProcessed: now.toISOString() } : r
            );
          });

          console.log("=== PROCESSING COMPLETE ===");
          console.log("Updated accounts:", updatedAccounts);
          console.log("New transactions added:", toProcess.length);

          return {
            transactions: newTransactions,
            accounts: updatedAccounts,
            recurringTransactions: updatedRecurring,
            accountHistory: newHistory,
          };
        });
      },
      // History methods
      addAccountHistory: (history) =>
        set((s) => ({ accountHistory: [history, ...s.accountHistory] })),

      getAccountHistory: (accountId, days = 30) => {
        const { accountHistory } = get();
        const cutoff = dayjs().subtract(days, "day");

        return accountHistory
          .filter(
            (h) => h.accountId === accountId && dayjs(h.date).isAfter(cutoff)
          )
          .sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf());
      },

      // Export methods
      exportTransactions: (format) => {
        const { transactions } = get();

        if (format === "csv") {
          const headers = [
            "Date",
            "Merchant",
            "Category",
            "Amount",
            "Account",
            "Description",
          ];
          const rows = transactions.map((t) => [
            dayjs(t.date).format("YYYY-MM-DD"),
            t.merchant,
            t.category,
            t.amount.toString(),
            t.accountId,
            t.description || "",
          ]);

          return [headers, ...rows].map((row) => row.join(",")).join("\n");
        } else {
          return JSON.stringify(transactions, null, 2);
        }
      },

      // Filter methods
      filterTransactions: (options) => {
        const { transactions } = get();

        return transactions.filter((t) => {
          if (
            options.startDate &&
            dayjs(t.date).isBefore(dayjs(options.startDate))
          )
            return false;
          if (options.endDate && dayjs(t.date).isAfter(dayjs(options.endDate)))
            return false;
          if (options.category && t.category !== options.category) return false;
          if (
            options.minAmount !== undefined &&
            Math.abs(t.amount) < options.minAmount
          )
            return false;
          if (
            options.maxAmount !== undefined &&
            Math.abs(t.amount) > options.maxAmount
          )
            return false;
          if (options.accountId && t.accountId !== options.accountId)
            return false;

          return true;
        });
      },
    }),
    {
      name: "mini-wallet-storage",
    }
  )
);
