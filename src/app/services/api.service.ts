import { Injectable } from '@angular/core';
import {environment} from "../../environments/environment";
import {EncryptorService} from "./encryptor.service";
import {DatabaseService} from "./database.service";
import {HttpClient} from "@angular/common/http";
import {lastValueFrom} from "rxjs";
import {UserManagerService} from "./user-manager.service";

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

  public async register(name: string | null, familyName: string | null) {
    await this.encryptor.createKey();
    if (name !== null) {
      name = await this.encryptor.encrypt(name);
    }
    if (familyName !== null) {
      familyName = await this.encryptor.encrypt(familyName);
    }

    const response = await lastValueFrom(this.httpClient.post<{id: string}>(`${this.apiUrl}/account/create`, {
      name: name,
      parentalUnitName: familyName,
    }, {
      headers: {
        'X-No-User-Id': '1',
      },
    }));

    this.userManager.login(response.id);
  }
}
