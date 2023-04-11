import {Injectable} from '@angular/core';
import {IDBPDatabase, IDBPTransaction, openDB, StoreNames} from "idb";
import {BottleContentType} from "../enum/bottle-content-type.enum";
import {ActivityType} from "../enum/activity-type.enum";
import {FeedingType} from "../types/feeding-type.type";
import {ActivityInProgress} from "../types/activity-in-progress.type";
import {AppLanguage} from "../types/app-language";

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private readonly databaseName = 'baby_tracker_db';

  private readonly storeNameSettings = 'settings';
  private readonly storeNameInProgress = 'in_progress';

  private db: IDBPDatabase | null = null;

  public async storeCryptoKey(cryptoKey: CryptoKeyPair): Promise<void> {
    await this.saveSetting('cryptoKey', cryptoKey);
    if (!await navigator.storage.persisted()) {
      await navigator.storage.persist();
    }
  }

  public async getCryptoKey(): Promise<CryptoKeyPair> {
    const key = (await this.getSetting('cryptoKey')) as CryptoKeyPair | undefined;
    if (key === undefined) {
      throw new Error('There is no crypto key stored');
    }

    return key;
  }

  public async getLastOpenedFeedingType(): Promise<FeedingType | null> {
    return await this.getSetting('lastFeedingType') ?? null;
  }

  public async saveLastOpenedFeedingType(type: FeedingType): Promise<void> {
    await this.saveSetting('lastFeedingType', type);
  }

  public async getLastBottleFeedingAmount(): Promise<number | null> {
    return await this.getSetting('lastBottleFeedingAmount') ?? null;
  }

  public async setLastBottleFeedingAmount(amount: number): Promise<void> {
    await this.saveSetting('lastBottleFeedingAmount', amount);
  }

  public async getLastBottleContentType(): Promise<BottleContentType | null> {
    return await this.getSetting('lastBottleContentType') ?? null;
  }

  public async setLastBottleContentType(type: BottleContentType): Promise<void> {
    await this.saveSetting('lastBottleContentType', type);
  }

  public async saveInProgress(activity: ActivityInProgress) {
    const db = await this.open();
    const transaction = db.transaction(this.storeNameInProgress, 'readwrite');
    const store = transaction.objectStore(this.storeNameInProgress);
    await store.put(activity);
    await transaction.done;
  }

  public async getInProgress(type: ActivityType): Promise<ActivityInProgress | null> {
    const db = await this.open();
    const tx = db.transaction(this.storeNameInProgress, 'readonly');
    const store = tx.objectStore(this.storeNameInProgress);

    return (await store.get(type)) ?? null;
  }

  public async removeInProgress(type: ActivityType): Promise<void> {
    const db = await this.open();
    const transaction = db.transaction(this.storeNameInProgress, 'readwrite');
    const store = transaction.objectStore(this.storeNameInProgress);
    await store.delete(type);
    await transaction.done;
  }

  private async getSetting<T>(settingName: string): Promise<T | undefined> {
    const db = await this.open();
    const tx = db.transaction(this.storeNameSettings, 'readonly');
    const store = tx.objectStore(this.storeNameSettings);

    return (await store.get(settingName))?.value;
  }

  private async saveSetting<T>(settingName: string, value: T): Promise<void> {
    const db = await this.open();
    const transaction = db.transaction(this.storeNameSettings, 'readwrite');
    const store = transaction.objectStore(this.storeNameSettings);
    await store.put({
      setting: settingName,
      value: value,
    });
    await transaction.done;
  }

  public async deleteAll() {
    const stores = [this.storeNameSettings, this.storeNameInProgress];
    const db = await this.open();
    for (const storeName of stores) {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      await store.clear();
      await tx.done;
    }
  }

  public getLanguage(): AppLanguage {
    return <any>localStorage.getItem('language') ?? 'default';
  }

  public storeLanguage(language: AppLanguage): void {
    if (language === AppLanguage.Default) {
      localStorage.removeItem('language');
    } else {
      localStorage.setItem('language', language);
    }
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
                database.createObjectStore(this.storeNameInProgress, {
                  keyPath: 'activity',
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
