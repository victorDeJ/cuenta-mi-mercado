import { RxJsonSchema } from "rxdb";

export interface GroceryList {
  id: string;
  itemIds: string[];
  description: string;
  subtotalInDollars: number;
  totalIVA: number;
  totalInDollars: number;
  bcvRate: number;
  bcvRateId: string;
  bsTotalBCV: number;
  kontigoRate: number;
  kontigoRateId: string;
  dollarsTotalKontigo: number;
  completed: boolean;
  createdAt: string;
}

export const GROCERY_LIST_SCHEMA: RxJsonSchema<GroceryList>  = {
  title: 'grocery-list',
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 100 },
    itemIds: { type: 'array', items: { type: 'string' } },
    description: { type: 'string', maxLength: 100 },
    subtotalInDollars: { type: 'number' },
    totalIVA: { type: 'number' },
    totalInDollars: { type: 'number' },
    bcvRate: { type: 'number' },
    bcvRateId: { type: 'string' },
    bsTotalBCV: { type: 'number' },
    kontigoRate: { type: 'number' },
    kontigoRateId: { type: 'string' },
    dollarsTotalKontigo: { type: 'number' },
    completed: { type: 'boolean' },
    createdAt: { type: 'string', format: 'date-time' }
  },
  required: ['id', 'itemIds', 'subtotalInDollars', 'totalIVA', 'totalInDollars', 'bcvRate', 'bcvRateId', 'bsTotalBCV', 'kontigoRate', 'kontigoRateId', 'dollarsTotalKontigo', 'completed', 'createdAt']
};