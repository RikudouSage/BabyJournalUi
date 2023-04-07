import {AbstractEntity, EncryptedNullableString, EncryptedStringOrUuid} from "../services/json-api/abstract.entity";
import {AbstractRepository} from "../services/json-api/abstract.repository";
import {Injectable} from "@angular/core";
import {EncryptedValue} from "../dto/encrypted-value";
import {DocumentCollection} from "../services/json-api/document-collection";
import {Child} from "./child.entity";
import {Observable, of} from "rxjs";

export class User extends AbstractEntity {
  type: string = 'user';

  override attributes: {
    name: EncryptedValue | null;
    displayName: EncryptedValue | string;
  } = {
    name: null,
    displayName: '',
  }

  override relationships: {
    selectedChild: Observable<Child | null>;
  } = {
    selectedChild: of(new Child(false)),
  }

  override encryptedValueConvertors = {
    name: EncryptedNullableString,
    displayName: EncryptedStringOrUuid,
  }
}

@Injectable({
  providedIn: 'root',
})
export class UserRepository extends AbstractRepository<User> {
  resource: typeof AbstractEntity = User;
  type: string = 'user';
}
