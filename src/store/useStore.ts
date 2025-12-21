import {create} from "zustand";
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
};

export type Transaction = {
  id: string;
  date: string;
  merchant: string;
  category: string;
  amount: number;
  accountId: string;
  description?: string;
};

type Store = {
  accounts: Account[];
  transactions: Transaction[];
  addTransaction: (tx: Transaction) => void;
  transfer: (fromId: string, toId: string, amount: number, description?: string) => Promise<void>;
  reload: () => void;
};

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      accounts: (accountsData as Account[]).map(a => ({ ...a })),
      transactions: (transactionsData as Transaction[]),
      addTransaction: (tx) =>
        set((s) => ({ transactions: [tx, ...s.transactions] })),
      transfer: async (fromId, toId, amount, description = "Transfer") => {
        const store = get();
        const from = store.accounts.find(a => a.id === fromId);
        const to = store.accounts.find(a => a.id === toId);
        if (!from || !to) throw new Error("Account not found");
        if (amount <= 0) throw new Error("Amount must be positive");
        if (from.balance < amount) throw new Error("Insufficient balance");

        // Save snapshots
        const prevAccounts = store.accounts.map(account => ({ ...account }));
        const prevTransactions = store.transactions.slice();

        set((s) => ({
          accounts: s.accounts.map(account => {
            if (account.id === fromId) return { ...account, balance: +(account.balance - amount).toFixed(2) };
            if (account.id === toId) return { ...account, balance: +(account.balance + amount).toFixed(2) };
            return account;
          })
        }));

        const now = dayjs().toISOString();
        const debitTx: Transaction = {
          id: uuidv4(),
          date: now,
          merchant: `Transfer to ${to.name}`,
          category: "Transfer",
          amount: -Math.abs(Number(amount.toFixed(2))),
          accountId: fromId,
          description
        };
        const creditTx: Transaction = {
          id: uuidv4(),
          date: now,
          merchant: `Transfer from ${from.name}`,
          category: "Transfer",
          amount: Math.abs(Number(amount.toFixed(2))),
          accountId: toId,
          description
        };

        set((s) => ({ transactions: [creditTx, debitTx, ...s.transactions] }));

        
        await new Promise((res) => setTimeout(res, 600));
        const randomFail = false; 

        if (randomFail) {
          set(() => ({ accounts: prevAccounts, transactions: prevTransactions }));
          throw new Error("Network error (simulated)");
        }
        return;
      },
      reload: () => set(() => ({ accounts: (accountsData as Account[]), transactions: (transactionsData as Transaction[]) }))
    }),
    {
      name: "mini-wallet-storage"
    }
  )
);
