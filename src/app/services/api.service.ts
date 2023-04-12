import { Injectable } from '@angular/core';
import {environment} from "../../environments/environment";
import {EncryptorService} from "./encryptor.service";
import {HttpClient} from "@angular/common/http";
import {lastValueFrom, Observable} from "rxjs";
import {UserManagerService} from "./user-manager.service";
import {ActivityType} from "../enum/activity-type.enum";
import {map} from "rxjs/operators";
import {FeedingType} from "../types/feeding-type.type";

export interface ActivityStreamItem {
  id: string;
  startTime: string;
  endTime: string;
  note: string | null;
  activityType: ActivityType;
  childName: string | null;
  [key: string]: string | null;
}

export interface BottleFeedingActivityStreamItem extends ActivityStreamItem {
  type: FeedingType;
  amount: string;
  bottleContentType: string | null;
}

export interface BreastFeedingActivityStreamItem extends ActivityStreamItem {
  breast: string;
}

export interface DiaperingActivityStreamItem extends ActivityStreamItem {
  wet: string;
  poopy: string;
  quantity: string | null;
  poopColor: string | null;
}

export type ActivityStream = ActivityStreamItem[];

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

  public getActivityStream(): Observable<Promise<ActivityStream>> {
    return this.httpClient.get<ActivityStream>(`${this.apiUrl}/activities`).pipe(
      map (async stream => {
        return await Promise.all(stream.map(async item => {
          for (const key of Object.keys(item)) {
            if (key === 'id' || key === 'activityType' || item[key] === null) {
              continue;
            }

            item[key] = await this.encryptor.decrypt(<string>item[key]);
          }

          return item;
        }));
      }),
      map (async stream => {
        return (await stream).sort((a, b): number => {
          if (a.startTime === b.startTime) {
            return 0;
          }
          const dateA = new Date(a.startTime);
          const dateB = new Date(b.startTime);

          return dateA.getTime() > dateB.getTime() ? -1 : 1;
        });
      }),
    );
  }
}
