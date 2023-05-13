import {Injectable} from '@angular/core';
import {environment} from "../../environments/environment";
import {EncryptorService} from "./encryptor.service";
import {HttpClient} from "@angular/common/http";
import {lastValueFrom, switchMap} from "rxjs";
import {UserManagerService} from "./user-manager.service";
import {ParentalUnitSetting} from "../enum/parental-unit-setting.enum";
import {toObservable, toPromise} from "../helper/observables";
import {map} from "rxjs/operators";

type Settings = {
  [setting in ParentalUnitSetting]: string | number | null;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly defaultApiUrl = environment.apiUrl;
  private readonly apiUrlConfigName = 'apiUrl';

  get apiUrl(): string {
    return localStorage.getItem(this.apiUrlConfigName) ?? this.defaultApiUrl;
  }

  set apiUrl(url: string | null) {
    if (url === null) {
      localStorage.removeItem(this.apiUrlConfigName);
    } else {
      localStorage.setItem(this.apiUrlConfigName, url);
    }
  }

  constructor(
    private readonly encryptor: EncryptorService,
    private readonly httpClient: HttpClient,
    private readonly userManager: UserManagerService,
  ) {
  }

  public async register(name: string | null, familyName: string | null, parentalUnitId: string | null): Promise<void> {
    if (parentalUnitId === null) {
      await this.encryptor.createKey();
    }
    if (name !== null) {
      name = await this.encryptor.encrypt(name);
    }
    if (familyName !== null) {
      familyName = await this.encryptor.encrypt(familyName);
    }

    const response = await lastValueFrom(this.httpClient.post<{id: string}>(`${this.apiUrl}/account/create`, {
      name: name,
      parentalUnitName: familyName,
      parentalUnitId: parentalUnitId,
    }, {
      headers: {
        'X-No-User-Id': '1',
      },
    }));

    this.userManager.login(response.id);
  }

  public async refreshShareCode(): Promise<void> {
    await lastValueFrom(this.httpClient.post<void>(`${this.apiUrl}/account/refresh-share-code`, {}));
  }

  public getSettings(): Promise<Settings> {
    return toPromise(this.httpClient.get<{[setting in ParentalUnitSetting]: string | null}>(`${this.apiUrl}/account/settings`).pipe(
      map(async value => {
        if (value[ParentalUnitSetting.FeedingBreakLength] !== null) {
          value[ParentalUnitSetting.FeedingBreakLength] = await this.encryptor.decrypt(value[ParentalUnitSetting.FeedingBreakLength]);
        }

        return value;
      }),
      switchMap(value => toObservable(value)),
    ));
  }

  public async saveSettings(settings: Partial<Settings>, isEncrypted: boolean = false): Promise<void> {
    let encrypted = settings;
    if (!isEncrypted) {
      encrypted = {};
      for (const key of Object.keys(settings)) {
        encrypted[<ParentalUnitSetting>key] = await this.encryptor.encrypt(String(settings[<ParentalUnitSetting>key]));
      }
    }
    await toPromise(this.httpClient.patch<void>(`${this.apiUrl}/account/settings`, encrypted));
  }

}
