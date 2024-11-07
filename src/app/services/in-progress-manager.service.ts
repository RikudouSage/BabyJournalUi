import {Injectable, Signal} from '@angular/core';
import {ApiService} from "./api.service";
import {DatabaseService} from "./database.service";
import {ActivityType} from "../enum/activity-type.enum";
import {ActivityInProgress} from "../types/activity-in-progress.type";
import {ParentalUnitSetting} from "../enum/parental-unit-setting.enum";
import {
  SharedInProgressActivity,
  SharedInProgressActivityRepository
} from "../entity/shared-in-progress-activity.entity";
import {toPromise} from "../helper/observables";
import {EncryptorService} from "./encryptor.service";
import {EncryptedValue} from "../dto/encrypted-value";
import {GlobalOfflineModeService} from "./global-offline-mode.service";

@Injectable({
  providedIn: 'root'
})
export class InProgressManager {
  private readonly isOffline: Signal<boolean>;

  constructor(
    private readonly api: ApiService,
    private readonly database: DatabaseService,
    private readonly repository: SharedInProgressActivityRepository,
    private readonly encryptor: EncryptorService,
    offlineMode: GlobalOfflineModeService,
  ) {
    this.isOffline = offlineMode.isOffline;
  }

  public async getInProgress(type: ActivityType): Promise<ActivityInProgress | null> {
    if (await this.useShared()) {
      const items = await toPromise(this.repository.collection({
        filters: {
          activityType: type,
        },
      }));
      if (!items.length) {
        return null;
      }

      const item = await this.encryptor.decryptEntity(items.first()!);
      const result = JSON.parse(item.attributes.config.decrypted);
      result.startTime = new Date(result.startTime);

      return result;
    } else {
      return await this.database.getInProgress(type);
    }
  }

  public async saveInProgress(activity: ActivityInProgress): Promise<void> {
    if (await this.useShared()) {
      const item = new SharedInProgressActivity();
      item.attributes.activityType = activity.activity;
      item.attributes.config = new EncryptedValue(await this.encryptor.encrypt(JSON.stringify(activity)));

      await toPromise(this.repository.create(item, false));
    } else {
      await this.database.saveInProgress(activity);
    }
  }

  public async removeInProgress(type: ActivityType): Promise<void> {
    if (await this.useShared()) {
      const items = await toPromise(this.repository.collection({
        filters: {
          activityType: type,
        },
      }));
      if (!items.length) {
        return;
      }

      await toPromise(this.repository.delete(items.first()!));
    } else {
      await this.database.removeInProgress(type);
    }
  }

  private async useShared(): Promise<boolean> {
    if (this.isOffline()) {
      return false;
    }

    return <boolean>(await this.api.getSettings())[ParentalUnitSetting.UseSharedInProgress];
  }
}
