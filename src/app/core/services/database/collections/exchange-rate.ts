import { RxJsonSchema } from "rxdb";
import { ExchangeRateType } from "../enums/Exchange-rate-type";

export interface ExchangeRate {
  id: string;
  rateType: ExchangeRateType;
  amount: number;
  createdAt: string;
}

export const EXCHANGE_RATE_SCHEMA: RxJsonSchema<ExchangeRate> = {
  title: 'exchange-rate',
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 100 },
    rateType: { type: 'number' },
    amount: { type: 'number' },
    createdAt: { type: 'string', format: 'date-time' }
  },
  required: ['id', 'rateType', 'amount', 'createdAt']
};
