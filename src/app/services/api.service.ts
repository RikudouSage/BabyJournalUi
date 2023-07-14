import {Injectable} from '@angular/core';
import {EncryptorService} from "./encryptor.service";
import {HttpClient} from "@angular/common/http";
import {lastValueFrom, switchMap} from "rxjs";
import {UserManagerService} from "./user-manager.service";
import {DefaultParentalUnitSettings, ParentalUnitSetting} from "../enum/parental-unit-setting.enum";
import {toObservable, toPromise} from "../helper/observables";
import {map} from "rxjs/operators";
import {ApiUrlService} from "./api-url.service";

type Settings = {
  [setting in ParentalUnitSetting]: string | number | boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  get apiUrl(): string {
    return this.apiUrlService.apiUrl;
  }

  set apiUrl(url: string | null) {
    this.apiUrlService.apiUrl = url;
  }

  constructor(
    private readonly encryptor: EncryptorService,
    private readonly httpClient: HttpClient,
    private readonly userManager: UserManagerService,
    private readonly apiUrlService: ApiUrlService,
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

  public async deleteUser(): Promise<void> {
    await toPromise(this.httpClient.delete<void>(`${this.apiUrl}/account/delete`));
  }

  public async refreshShareCode(): Promise<void> {
    await lastValueFrom(this.httpClient.post<void>(`${this.apiUrl}/account/refresh-share-code`, {}));
  }

  public getSettings(): Promise<Settings> {
    return toPromise(this.httpClient.get<{[setting in ParentalUnitSetting]: string | null}>(`${this.apiUrl}/account/settings`).pipe(
      map(async value => {
        const result: Partial<Settings> = {};
        for (const untypedKey of Object.keys(value)) {
          const key = <ParentalUnitSetting>untypedKey;
          if (value[key] === null) {
            result[key] = DefaultParentalUnitSettings[key];
          } else {
            result[key] = await this.encryptor.decrypt(<string>value[key]);
            if (result[key] === 'true' || result[key] === 'false') {
              result[key] = result[key] === 'true';
            }
          }
        }

        return <Settings>result;
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
