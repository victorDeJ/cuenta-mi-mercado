import { RxJsonSchema } from 'rxdb';
import { WeightType } from '../enums/weight-type';
import { IVAType } from '../enums/IVA-type';

export interface GroceryItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
  IVAType: IVAType;
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
    IVAType: { type: 'string', enum: [IVAType.EXEMPT, IVAType.REDUCED, IVAType.GENERAL],},
    weight: { type: 'number',},
    wieghtType: { type: 'number', enum: [WeightType.GR, WeightType.KG],},
    totalInDollars: { type: 'number',},
    createdAt: { type: 'string',},
  },
  required: ['id', 'description', 'quantity', 'price', 'totalInDollars', 'createdAt']
};
