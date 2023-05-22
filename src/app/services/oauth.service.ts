import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {ApiUrlService} from "./api-url.service";
import {map} from "rxjs/operators";
import {toPromise} from "../helper/observables";
import {DatabaseService} from "./database.service";
import {AppLanguage} from "../types/app-language";
import {getFirstSupportedLanguage} from "../helper/language";
import {UserManagerService} from "./user-manager.service";
import {EncryptorService} from "./encryptor.service";

interface OAuthClient {
  identifier: string;
  name: string;
}

interface IsAuthorizedResponse {
  success: boolean;
  error?: string;
  redirectUrl?: string;
}

export interface ScopeResponse {
  scope: string;
  required: boolean;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class OAuthService {
  constructor(
    private readonly httpClient: HttpClient,
    private readonly apiUrlService: ApiUrlService,
    private readonly database: DatabaseService,
    private readonly userManager: UserManagerService,
    private readonly encryptor: EncryptorService,
  ) {
  }

  public async getClientName(clientId: string): Promise<string> {
    return toPromise(this.httpClient.get<OAuthClient>(`${this.apiUrlService.apiUrl}/oauth/client-info/${clientId}`, {
      withCredentials: true,
    }).pipe(
      map(result => result.name),
    ));
  }

  public async getScopeInfo(): Promise<ScopeResponse[]> {
    let language = this.database.getLanguage();
    if (language === AppLanguage.Default) {
      language = getFirstSupportedLanguage();
    }
    return toPromise(this.httpClient.get<ScopeResponse[]>(`${this.apiUrlService.apiUrl}/${language}/oauth/scopes`));
  }

  public async isAuthorized(clientId: string, scopes: string[]): Promise<IsAuthorizedResponse> {
    return toPromise(this.httpClient.get<IsAuthorizedResponse>(`${this.apiUrlService.apiUrl}/oauth/authorize-check`, {
      withCredentials: true,
    }));
  }

  public redirectToAuthorizationResult(approved: boolean, scopes: string[] | null = null) {
    let url: string;
    if (scopes === null) {
      url = `${this.apiUrlService.apiUrl}/oauth/approve/${this.userManager.getUserId()}/${Number(approved)}`;
    } else {
      url = `${this.apiUrlService.apiUrl}/oauth/approve/${this.userManager.getUserId()}/${Number(approved)}/${scopes.join(' ')}`;
    }

    window.location.href = url;
  }

  public async storePrivateKeys(): Promise<void> {
    await toPromise(this.httpClient.post<void>(`${this.apiUrlService.apiUrl}/oauth/store-keys`, {
      keys: await this.encryptor.exportKey(),
    }));
  }

  public async revoke(clientId: string): Promise<void> {
    await toPromise(this.httpClient.post<void>(`${this.apiUrlService.apiUrl}/oauth/revoke/${clientId}`, {}));
  }

  public async setScopes(clientId: string, scopes: string[]): Promise<void> {
    await toPromise(this.httpClient.patch(`${this.apiUrlService.apiUrl}/oauth/modify-scopes/${clientId}`, {
      scopes: scopes,
    }));
  }
}
