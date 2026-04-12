import { TransactionState } from './Transaction';

export function getFreshTransactionState(): TransactionState {
  return {
    step: 1,
    type: null,
    mode: 'UPI',
    selectedUser: null,

    internalAmount: null,
    externalAmount: null,

    intDesc: '',
    extDesc: '',

    upiName: '',
    upiId: '',

    bankName: '',
    bankAcct: '',
    bankIfsc: ''
  };
}