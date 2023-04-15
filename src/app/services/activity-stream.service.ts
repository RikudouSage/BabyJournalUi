import {Injectable} from '@angular/core';
import {ApiService} from "./api.service";
import {DatabaseService} from "./database.service";
import {forkJoin, iif, Observable, of, switchMap, tap} from "rxjs";
import {map} from "rxjs/operators";
import {HttpClient} from "@angular/common/http";
import {EncryptorService} from "./encryptor.service";
import {ActivityType} from "../enum/activity-type.enum";
import {FeedingType} from "../types/feeding-type.type";
import {toObservable} from "../helper/observables";


export interface ActivityStreamItem {
  id: string;
  startTime: string;
  endTime: string | null;
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

export interface PumpingActivityStreamItem extends ActivityStreamItem {
  breast: string;
  amount: string;
  parentName: string;
}

export type ActivityStream = ActivityStreamItem[];

@Injectable({
  providedIn: 'root'
})
export class ActivityStreamService {
  private cache: ActivityStream = [];
  private cacheUntil: number | null = null;

  private maxTimeUntilFullFetch = 2 * 60 * 60 * 1_000; // in milliseconds

  constructor(
    private readonly api: ApiService,
    private readonly database: DatabaseService,
    private readonly httpClient: HttpClient,
    private readonly encryptor: EncryptorService,
  ) {
  }

  public getActivityStream(): Observable<ActivityStream> {
    return iif(
      () => new Date().getTime() < (this.cacheUntil ?? 0),
      of(this.cache),
      iif(
        // () => new Date().getTime() - (this.database.fullActivityStreamLastFetched()?.getTime() ?? 0) > this.maxTimeUntilFullFetch,
        () => false, // todo think of a better flow
        this.getFullActivityStream().pipe(
          tap(() => this.database.setFullActivityStreamLastFetched()),
        ),
        forkJoin(
          this.getCachedActivityStream(),
          this.getChangedActivityStream(),
        ).pipe(
          map(([cached, changes]) => {
            return cached.concat(changes);
          }),
        ),
      ),
    ).pipe(
      tap(stream => {
        this.cache = stream;
        this.cacheUntil = new Date().getTime() + 1_000;
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
      switchMap(value => toObservable(value)),
    );
  }

  public getFullActivityStream(): Observable<ActivityStream> {
    return this.httpClient.get<ActivityStream>(`${this.api.apiUrl}/activities`).pipe(
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
      tap(async stream => {
        const promises = [];
        for (const item of await stream) {
          promises.push(this.database.storeActivityStreamItem(item));
        }

        await Promise.all(promises);
      }),
      switchMap(stream => toObservable(stream)),
    );
  }

  private getCachedActivityStream(): Observable<ActivityStream> {
    return toObservable(this.database.getActivityStream());
  }

  private getChangedActivityStream(): Observable<ActivityStream> {
    return this.httpClient.get<ActivityStream>(`${this.api.apiUrl}/activities/changes`).pipe(
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
      tap(async stream => {
        const promises = [];
        for (const item of await stream) {
          promises.push(this.database.storeActivityStreamItem(item));
        }

        await Promise.all(promises);
      }),
      switchMap(stream => toObservable(stream)),
    );
  }
}
