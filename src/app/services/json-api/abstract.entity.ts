import {lastValueFrom, Observable} from 'rxjs';
import {DocumentCollection} from './document-collection';
import {EncryptedValue} from "../../dto/encrypted-value";

export type ValueConverter = (value: any) => boolean;

export const EncryptedString: ValueConverter = (value: string) => true;
export const EncryptedNullableString: ValueConverter = (value: string | null) => typeof value === 'string';
export const EncryptedStringOrUuid: ValueConverter = (value: string) => !/^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi.test(value);

export interface Relationships {
  [key: string]: Observable<DocumentCollection<any> | AbstractEntity | null>;
}

export abstract class AbstractEntity {
  public id: string | number | null = null;
  public abstract type: string;

  public attributes: object = {};
  public relationships: Relationships = {};

  public encryptedValueConvertors: {
    [key: string]: ValueConverter;
  } = {}

  constructor(
    public initialized = true
  ) {
  }

  public async serialize(wholeTree: boolean = true, primary: boolean = true): Promise<any> {
    const object = {
      data: {
        id: this.id,
        type: this.type,
        attributes: {},
        relationships: {}
      }
    };

    if (!wholeTree && !primary && this.id) {
      return object;
    }

    for (const attributeName in this.attributes) {
      if (this.attributes.hasOwnProperty(attributeName)) {
        let attributeValue = (this.attributes as any)[attributeName];
        if (attributeValue instanceof EncryptedValue) {
          attributeValue = attributeValue.encrypted;
        }
        (object.data.attributes as any)[attributeName] = attributeValue;
      }
    }

    for (const relationshipName in this.relationships) {
      if (this.relationships.hasOwnProperty(relationshipName)) {
        const relationshipValue = this.relationships[relationshipName];

        const resolved = await lastValueFrom(relationshipValue);
        if (resolved !== null && !resolved.initialized) {
          continue;
        }
        let result: any;
        if (resolved instanceof DocumentCollection) {
          result = [];
          for (const item of resolved) {
            result.push((await item.serialize(wholeTree, false)).data);
          }
        } else if (resolved === null) {
          result = null;
        } else {
          result = (await resolved.serialize(wholeTree, false)).data;
        }

        (object.data.relationships as any)[relationshipName] = {
          data: result
        };
      }
    }

    return object;
  }
}
