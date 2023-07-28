import {Injectable} from '@angular/core';
import {deleteDB, IDBPDatabase, IDBPTransaction, openDB, StoreNames} from "idb";
import {BottleContentType} from "../enum/bottle-content-type.enum";
import {ActivityType} from "../enum/activity-type.enum";
import {FeedingType} from "../types/feeding-type.type";
import {ActivityInProgress} from "../types/activity-in-progress.type";
import {AppLanguage} from "../types/app-language";
import {BreastIndex} from "../enum/breast-index.enum";
import {ActivityStream, ActivityStreamItem} from "./activity-stream.service";
import {getPrimaryBrowserLanguage} from "../helper/language";

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private readonly databaseName = 'baby_tracker_db';

  private readonly storeNameSettings = 'settings';
  private readonly storeNameInProgress = 'in_progress';
  private readonly storeNameCachedLastDates = 'last_dates';
  private readonly storeNameActivityStreamCache = 'activity_stream';

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

  public async getLastNursingBreast(): Promise<BreastIndex> {
    return await this.getSetting("lastBreastTabNursing") ?? BreastIndex.Left;
  }

  public async saveLastNursingBreast(breast: BreastIndex): Promise<void> {
    return await this.saveSetting("lastBreastTabNursing", breast);
  }

  public async getLastPumpingBreast(): Promise<BreastIndex> {
    return await this.getSetting("lastBreastTabPumping") ?? BreastIndex.Left;
  }

  public async saveLastPumpingBreast(breast: BreastIndex): Promise<void> {
    return await this.saveSetting("lastBreastTabPumping", breast);
  }

  public async getLastPumpingParentId(): Promise<string | null> {
    return await this.getSetting("lastPumpingParentId") ?? null;
  }

  public async saveLastPumpingParentId(id: string): Promise<void> {
    return await this.saveSetting("lastPumpingParentId", id);
  }

  public async getLastBottleFeedingAmount(): Promise<number | null> {
    return await this.getSetting('lastBottleFeedingAmount') ?? null;
  }

  public async setLastBottleFeedingAmount(amount: number): Promise<void> {
    await this.saveSetting('lastBottleFeedingAmount', amount);
  }

  public async getLastSolidFeedingAmount(): Promise<number | null> {
    return await this.getSetting('lastSolidFeedingAmount') ?? null;
  }

  public async setLastSolidFeedingAmount(amount: number): Promise<void> {
    await this.saveSetting('lastSolidFeedingAmount', amount);
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

  public async getLastActivityDate(type: ActivityType): Promise<Date | null> {
    const db = await this.open();
    const tx = db.transaction(this.storeNameCachedLastDates, 'readonly');
    const store = tx.objectStore(this.storeNameCachedLastDates);

    const result = await store.get(type);
    if (result === undefined) {
      return null;
    }

    return result.date;
  }

  public async saveLastActivityDate(type: ActivityType, date: Date | null): Promise<void> {
    const db = await this.open();
    const transaction = db.transaction(this.storeNameCachedLastDates, 'readwrite');
    const store = transaction.objectStore(this.storeNameCachedLastDates);
    await store.put({
      activity: type,
      date: date,
    });
    await transaction.done;
  }

  public async storeActivityStreamItem(item: ActivityStreamItem): Promise<void> {
    const db = await this.open();
    const transaction = db.transaction(this.storeNameActivityStreamCache, 'readwrite');
    const store = transaction.objectStore(this.storeNameActivityStreamCache);
    await store.put(item);
    await transaction.done;
  }

  public async removeActivityStreamItem(item: ActivityStreamItem | string): Promise<void> {
    const id = typeof item === 'string' ? item : item.id;

    const db = await this.open();
    const transaction = db.transaction(this.storeNameActivityStreamCache, 'readwrite');
    const store = transaction.objectStore(this.storeNameActivityStreamCache);
    await store.delete(id);
    await transaction.done;
  }

  public async getActivityStreamItem(id: string): Promise<ActivityStreamItem | null> {
    const db = await this.open();
    const tx = db.transaction(this.storeNameActivityStreamCache, 'readonly');
    const store = tx.objectStore(this.storeNameActivityStreamCache);

    const result = await store.get(id);
    if (result === undefined) {
      return null;
    }

    return result;
  }

  public async getActivityStream(): Promise<ActivityStream> {
    const db = await this.open();
    const tx = db.transaction(this.storeNameActivityStreamCache, 'readonly');
    const store = tx.objectStore(this.storeNameActivityStreamCache);

    return (await store.getAll()) ?? [];
  }

  public async initialActivityStreamLoadFinished(): Promise<boolean> {
    return await this.getSetting('initial_loading_finished') ?? false;
  }

  public async setInitialActivityStreamLoadFinished(finished: boolean = true): Promise<void> {
    await this.saveSetting('initial_loading_finished', finished);
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

  public async deleteAll(): Promise<void> {
    this.db?.close();
    await deleteDB(this.databaseName);
  }

  public getLanguage(): AppLanguage {
    return <any>localStorage.getItem('language') ?? 'default';
  }

  public getEffectiveLanguage(): AppLanguage {
    const language = this.getLanguage();
    if (language !== AppLanguage.Default) {
      return language;
    }

    const browserLanguage = getPrimaryBrowserLanguage();
    if (Object.values(AppLanguage).indexOf(<any>browserLanguage) > 0) {
      return <AppLanguage>browserLanguage;
    }

    return AppLanguage.English;
  }

  public storeLanguage(language: AppLanguage): void {
    if (language === AppLanguage.Default) {
      localStorage.removeItem('language');
    } else {
      localStorage.setItem('language', language);
    }
  }

  public fullActivityStreamLastFetched(): Date | null {
    const result = localStorage.getItem('fullActivityStreamLastFetched');
    if (result === null) {
      return null;
    }

    return new Date(result);
  }

  public setFullActivityStreamLastFetched(date: Date = new Date()) {
    localStorage.setItem('fullActivityStreamLastFetched', date.toISOString());
  }

  public getWeightUnit(): string {
    return localStorage.getItem('weight_unit') ?? 'g';
  }

  public setWeightUnit(unit: string): void {
    localStorage.setItem('weight_unit', unit);
  }

  private async open(): Promise<IDBPDatabase> {
    if (this.db === null) {
      this.db = await openDB(this.databaseName, 3, {
        upgrade: (
          database: IDBPDatabase,
          oldVersion: number,
          newVersion: number | null,
          transaction: IDBPTransaction<unknown, StoreNames<unknown>[], "versionchange">,
          event: IDBVersionChangeEvent
        ) => {
          for (let version = oldVersion; version <= (newVersion ?? 0); ++version) {
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
              case 2:
                database.createObjectStore(this.storeNameCachedLastDates, {
                  keyPath: 'activity',
                  autoIncrement: false,
                });
                break;
              case 3:
                database.createObjectStore(this.storeNameActivityStreamCache, {
                  keyPath: 'id',
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
