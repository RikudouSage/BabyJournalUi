import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {toPromise} from "../helper/observables";
import {ApiUrlService} from "./api-url.service";

export interface DeviceInfoResponse {
  phone: boolean;
  ios: boolean;
  android: boolean;
  chrome: boolean;
  safari: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class DeviceInfoService {
  constructor(
    private readonly httpClient: HttpClient,
    private readonly apiUrlService: ApiUrlService,
  ) {}

  public deviceInfo(): Promise<DeviceInfoResponse> {
    return toPromise(this.httpClient.get<DeviceInfoResponse>(`${this.apiUrlService.apiUrl}/device/info`));
  }
}
