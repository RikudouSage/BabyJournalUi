import {Injectable} from '@angular/core';
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class ApiUrlService {
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
}
