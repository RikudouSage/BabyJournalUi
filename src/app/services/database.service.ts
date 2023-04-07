import { Injectable } from '@angular/core';
import {IDBPDatabase, IDBPTransaction, openDB, StoreNames} from "idb";

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private readonly databaseName = 'baby_tracker_db';

  private readonly storeNameSettings = 'settings';

  private db: IDBPDatabase | null = null;

  public async storeCryptoKey(cryptoKey: CryptoKeyPair): Promise<void> {
    const db = await this.open();
    const transaction = db.transaction(this.storeNameSettings, 'readwrite');
    const store = transaction.objectStore(this.storeNameSettings);
    await store.put({
      setting: 'cryptoKey',
      value: cryptoKey,
    });
    await transaction.done;
  }

  public async getCryptoKey(): Promise<CryptoKeyPair> {
    const db = await this.open();
    const tx = db.transaction(this.storeNameSettings, 'readonly');
    const store = tx.objectStore(this.storeNameSettings);

    return (await store.get('cryptoKey')).value;
  }

  private async open(): Promise<IDBPDatabase> {
    if (this.db === null) {
      this.db = await openDB(this.databaseName, 1, {
        upgrade: (
          database: IDBPDatabase,
          oldVersion: number,
          newVersion: number | null,
          transaction: IDBPTransaction<unknown, StoreNames<unknown>[], "versionchange">,
          event: IDBVersionChangeEvent
        ) => {
          for (let version = oldVersion; version < (newVersion ?? 0); ++version) {
            switch (version) {
              case 0:
                database.createObjectStore(this.storeNameSettings, {
                  keyPath: 'setting',
                  autoIncrement: false,
                });
                break;
            }
          }
        }
      });
    }

    return this.db;
  }
}
