import { RxJsonSchema } from 'rxdb';
import { WeightType } from '../enums/weight-type';

export interface GroceryItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
  weight: number;
  wieghtType: WeightType,
  totalInDollars: number;
  createdAt: string;
}

export const GROCERY_ITEM_SCHEMA: RxJsonSchema<GroceryItem> = {
  title: 'grocery item schema',
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 100 },
    description: { type: 'string', },
    quantity: { type: 'number', },
    price: { type: 'number', },
    weight: { type: 'number',},
    wieghtType: { type: 'number', enum: [WeightType.GR, WeightType.KG],},
    totalInDollars: { type: 'number',},
    createdAt: { type: 'string',},
  },
  required: ['id', 'description', 'quantity', 'price', 'totalInDollars', 'createdAt']
};
