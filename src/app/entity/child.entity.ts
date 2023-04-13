import {AbstractEntity, EncryptedNullableString, EncryptedStringOrUuid} from "../services/json-api/abstract.entity";
import {AbstractRepository} from "../services/json-api/abstract.repository";
import {EncryptedValue} from "../dto/encrypted-value";
import {Injectable} from "@angular/core";

export class Child extends AbstractEntity {
  type: string = 'child';

  override attributes: {
    name: EncryptedValue | null;
    displayName: EncryptedValue | string;
    gender: EncryptedValue | null;
    birthDay: EncryptedValue | null;
    birthWeight: EncryptedValue | null;
    birthHeight: EncryptedValue | null;
  } = {
    name: null,
    displayName: '',
    gender: null,
    birthDay: null,
    birthWeight: null,
    birthHeight: null,
  };

  override encryptedValueConvertors = {
    name: EncryptedNullableString,
    displayName: EncryptedStringOrUuid,
    gender: EncryptedNullableString,
    birthDay: EncryptedNullableString,
    birthHeight: EncryptedNullableString,
    birthWeight: EncryptedNullableString,
  };
}

@Injectable({
  providedIn: 'root',
})
export class ChildRepository extends AbstractRepository<Child> {
  resource: typeof AbstractEntity = Child;
  type: string = 'child';
}
