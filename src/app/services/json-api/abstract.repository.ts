import {AbstractEntity} from './abstract.entity';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {from, Observable, of, tap} from 'rxjs';
import {Injectable} from '@angular/core';
import {catchError, map, switchMap} from 'rxjs/operators';
import {JsonApiRegistry} from './json-api-registry';
import {DocumentCollection} from './document-collection';
import {EncryptedValue} from "../../dto/encrypted-value";
import {ApiUrlService} from "../api-url.service";

type Seconds = number;

interface Filters {
  [key: string]: string | string[] | null;
}

interface FetchConfig {
  include?: string[];
  filters?: Filters;
  maxResults?: number;
  sort?: string;
  useCache?: boolean;
  cacheValidity?: Seconds;
  page?: number;
}

@Injectable({
  providedIn: 'root'
})
export abstract class AbstractRepository<T extends AbstractEntity> {
  abstract resource: typeof AbstractEntity;
  abstract type: string;

  protected useCache = false;
  protected cacheValidity: Seconds = 10;

  private cache: {[key: string]: {value: T | DocumentCollection<T>, validUntil: Date}} = {};

  constructor(
    private httpClient: HttpClient,
    private registry: JsonApiRegistry,
    private apiUrlService: ApiUrlService,
  ) {
  }

  private getUrl(id: string | number | null = null, config: FetchConfig = {}) {
    let url = `${this.apiUrlService.apiUrl}/${this.type}`;
    if (id !== null) {
      url += `/${id}`;
    }

    let queryParams = new HttpParams();

    const filters = config.filters;
    for (const filterName in filters) {
      if (filters.hasOwnProperty(filterName)) {
        let filterValue = filters[filterName];
        if (Array.isArray(filterValue)) {
          filterValue = filterValue.join(',');
        }
        queryParams = queryParams.set(`filter[${filterName}]`, filterValue ?? 'null');
      }
    }

    if (config.maxResults !== undefined && config.maxResults !== null) {
      queryParams = queryParams.set('limit', config.maxResults);
    }
    if (config.sort !== undefined) {
      queryParams = queryParams.set('sort', config.sort);
    }
    if (config.include !== undefined) {
      queryParams = queryParams.set('include', config.include.join(','));
    }
    if (config.page !== undefined) {
      queryParams = queryParams.set('page', config.page);
    }

    if (queryParams.toString()) {
      url += `?${queryParams.toString()}`;
    }

    return url;
  }

  public get(id: string | number, config: FetchConfig = {}): Observable<T> {
    const useCache = config.useCache ?? this.useCache;
    const cacheKey = "get" + String(id) + JSON.stringify(config);
    const cacheValidity = config.cacheValidity ?? this.cacheValidity;
    if (
      useCache
      && this.cache[cacheKey] !== undefined
      && this.cache[cacheKey].validUntil > new Date()
    ) {
      return of(this.cache[cacheKey].value as T);
    }

    return this.httpClient.get(this.getUrl(id, config)).pipe(
      map((response: any) => {
        return this.parse(response.data, response.included || []);
      }),
      tap(response => {
        if (useCache) {
          const date = new Date();
          date.setSeconds(date.getSeconds() + cacheValidity);

          this.cache[cacheKey] = {
            value: response,
            validUntil: date,
          };
        }
      }),
    );
  }

  public collection(
    config: FetchConfig = {},
  ): Observable<DocumentCollection<T>> {
    const useCache = config.useCache ?? this.useCache;
    const cacheKey = "collection" + JSON.stringify(config);
    const cacheValidity = config.cacheValidity ?? this.cacheValidity;
    if (
      useCache
      && this.cache[cacheKey] !== undefined
      && this.cache[cacheKey].validUntil > new Date()
    ) {
      return of(this.cache[cacheKey].value as DocumentCollection<T>);
    }

    const url = this.getUrl(null, config);

    return this.httpClient.get(url).pipe(
      map((response: any) => {
        const collection = new DocumentCollection<T>();
        const result: T[] = [];

        const data = response.data;
        for (const item of data) {
          result.push(this.parse(item, response.included || []));
        }

        collection.setData(result);
        collection.setTotalItems(response.meta.totalItems);

        return collection;
      }),
      tap(response => {
        if (useCache) {
          const date = new Date();
          date.setSeconds(date.getSeconds() + cacheValidity);

          this.cache[cacheKey] = {
            value: response,
            validUntil: date,
          };
        }
      }),
    );
  }

  public create(entity: T, wholeTree: boolean = true): Observable<T> {
    return from(entity.serialize(wholeTree)).pipe(
      switchMap(serialized => {
        return this.httpClient.post(this.getUrl(), serialized, {
          headers: new HttpHeaders({
            'Content-Type': 'application/vnd.api+json'
          }),
        }).pipe(
          map((response: any) => {
            return this.parse(response.data);
          })
        );
      })
    );
  }

  public update(entity: T, wholeTree: boolean = true): Observable<T> {
    return from(entity.serialize(wholeTree)).pipe(
      switchMap(serialized => {
        return this.httpClient.patch(this.getUrl(entity.id), serialized, {
          headers: new HttpHeaders({
            'Content-Type': 'application/vnd.api+json'
          }),
        }).pipe(
          map((response: any) => this.parse(response.data)),
          tap(() => this.flushCache()),
        )
      })
    );
  }

  public delete(entity: T): Observable<boolean> {
    return this
      .httpClient
      .delete(
        this.getUrl(entity.id),
        {observe: "response"}
      )
      .pipe(
        map(response => {
          return response.status >= 200 && response.status < 300;
        }),
        tap(() => this.flushCache()),
        catchError(() => of(false)),
      );
  }

  private parse(object: any, included: any[] = []): T {
    // @ts-ignore
    const resource = new this.resource();
    resource.id = object.id;
    resource.type = object.type;

    if (typeof object.attributes === 'object') {
      const attributes = object.attributes;
      for (const attributeName in attributes) {
        if (attributes.hasOwnProperty(attributeName)) {
          let attributeValue = attributes[attributeName];
          if (typeof resource.encryptedValueConvertors[attributeName] !== 'undefined') {
            attributeValue = (resource.encryptedValueConvertors[attributeName])(attributeValue) ? new EncryptedValue(attributeValue) : attributeValue;
          }
          if (typeof resource.attributes[attributeName] !== 'undefined') {
            resource.attributes[attributeName] = attributeValue;
          }
        }
      }
    }

    const sortedIncluded: {[key: string]: {[key: string]: any}} = {};
    for (const include of included) {
      if (typeof sortedIncluded[include.type] === 'undefined') {
        sortedIncluded[include.type] = {};
      }
      sortedIncluded[include.type][include.id] = include;
    }

    if (typeof object.relationships === 'object') {
      const relationships = object.relationships;
      for (const relationshipName in relationships) {
        if (relationships.hasOwnProperty(relationshipName)) {
          const relationshipData = relationships[relationshipName].data;

          if (typeof resource.relationships[relationshipName] === 'undefined') {
            continue;
          }

          let type: string;

          if (Array.isArray(relationshipData)) {
            if (!relationshipData.length) {
              continue;
            }
            type = relationshipData[0].type;
          } else if (relationshipData === null) {
            resource.relationships[relationshipName] = of(null);
            continue;
          } else {
            type = relationshipData.type;
          }

          if (typeof this.registry.repositories[type] === 'undefined') {
            throw new Error(`Cannot access repository for type '${type}', please inject it to your component/service`);
          }

          const repository = this.registry.repositories[type];

          if (Array.isArray(relationshipData)) {
            resource.relationships[relationshipName] = repository.collection({
              filters: {
                id: relationshipData.map(item => {
                  return item.id;
                }),
              },
              maxResults: -1,
            });
          } else {
            if (
              typeof sortedIncluded[relationshipData.type] !== 'undefined'
              && typeof sortedIncluded[relationshipData.type][relationshipData.id] !== 'undefined'
            ) {
              if (typeof this.registry.repositories[relationshipData.type] === 'undefined') {
                throw new Error(`Cannot access repository for type '${type}', please inject it to your component/service`);
              }
              const repository = this.registry.repositories[relationshipData.type];

              resource.relationships[relationshipName] = of(repository.parse(sortedIncluded[relationshipData.type][relationshipData.id]));
            } else {
              resource.relationships[relationshipName] = repository.get(relationshipData.id);
            }
          }
        }
      }
    }

    return resource;
  }

  public flushCache(): void
  {
    this.cache = {};
  }
}
