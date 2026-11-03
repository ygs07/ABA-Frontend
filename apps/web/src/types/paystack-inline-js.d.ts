declare module '@paystack/inline-js' {
  type TransactionOptions = {
    key: string;
    email: string;
    amount: number;
    reference: string;
    onSuccess?: (transaction: { reference: string }) => void;
    onCancel?: () => void;
  };
  export default class PaystackPop {
    newTransaction(options: TransactionOptions): void;
  }
}
