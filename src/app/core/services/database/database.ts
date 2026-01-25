import { Injectable, isDevMode } from '@angular/core';
import { createRxDatabase, addRxPlugin, RxDatabase } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';
import { wrappedValidateAjvStorage } from 'rxdb/plugins/validate-ajv';
import { RxDBJsonDumpPlugin } from 'rxdb/plugins/json-dump';
import { RxDBUpdatePlugin } from 'rxdb/plugins/update';
import { GROCERY_ITEM_SCHEMA } from './collections/grocery-item';
import { EXCHANGE_RATE_SCHEMA } from './collections/exchange-rate';
import { GROCERY_LIST_SCHEMA } from './collections/grocery-list';
import { Temporal } from '@js-temporal/polyfill';
import { Collection } from './enums/collections';
import { ExchangeRateType } from './enums/Exchange-rate-type';

@Injectable({
  providedIn: 'root',
})
export class Database {
  private dbPromise?: Promise<RxDatabase>;

  constructor() {
    console.log('Database constructor');
    this.init();
  }

  private async init() {
    addRxPlugin(RxDBJsonDumpPlugin);
    addRxPlugin(RxDBUpdatePlugin);
    if (isDevMode()) {
      addRxPlugin(RxDBDevModePlugin);
    }

    this.dbPromise = createRxDatabase({
      name: 'cuenta_mi_mercado_db',
      storage: wrappedValidateAjvStorage({
        storage: getRxStorageDexie(),
      }),
    });

    const db = await this.dbPromise;

    await db.addCollections({
      [Collection.GROCERY]: {
        schema: GROCERY_ITEM_SCHEMA,
      },
      [Collection.EXCHANGE_RATE]: {
        schema: EXCHANGE_RATE_SCHEMA,
      },
      [Collection.GROCERY_LIST]: {
        schema: GROCERY_LIST_SCHEMA,
      },
    });
    // const setExchangeRateBCV = await db[Collection.EXCHANGE_RATE].insert({
    //   id: 'BCV1',
    //   rateType: ExchangeRateType.BCV,
    //   amount: 350,
    //   createdAt: Temporal.Now.instant().toString(),
    // });
    // const setExchangeRateKontigo = await db[Collection.EXCHANGE_RATE].insert({
    //   id: 'Kontigo1',
    //   rateType: ExchangeRateType.KONTIGO,
    //   amount: 420.05,
    //   createdAt: Temporal.Now.instant().toString(),
    // });
    // const myCollection = db[Collection.EXCHANGE_RATE];
    // myCollection.exportJSON().then((json) => console.log("👽 Content: \n ",json));

    return db;
  }

  async getDb() {
    if (!this.dbPromise) {
      this.dbPromise = this.init();
    }
    return this.dbPromise;
  }

  async getData(collectionName: string, idOrQuery?: string | any) {
    const db = await this.getDb();
    const collection = db.collections[collectionName];

    if (!idOrQuery) {
      const docs = await collection.find().exec();
      return docs.map((doc) => doc.toJSON());
    }

    if (typeof idOrQuery === 'string') {
      const doc = await collection.findOne(idOrQuery).exec();
      return doc ? doc.toJSON() : null;
    }

    const docs = await collection.find(idOrQuery).exec();
    return docs.map((doc) => doc.toJSON());
  }

  async insertData(collectionName: string, data: any) {
    const db = await this.getDb();
    const collection = db.collections[collectionName];
    return await collection.insert(data);
  }

  async updateData(collectionName: string, id: string, data: any) {
    const db = await this.getDb();
    const collection = db.collections[collectionName];
    const doc = await collection.findOne(id).exec();
    return await doc.patch(data);
  }

  async deleteData(collectionName: string, id: string) {
    const db = await this.getDb();
    const collection = db.collections[collectionName];
    const doc = await collection.findOne(id).exec();
    return await doc.remove();
  }

}
