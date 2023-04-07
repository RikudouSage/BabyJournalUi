import {AbstractEntity, EncryptedNullableString} from "../services/json-api/abstract.entity";
import {AbstractRepository} from "../services/json-api/abstract.repository";
import {Injectable} from "@angular/core";
import {EncryptedValue} from "../dto/encrypted-value";

export class ParentalUnit extends AbstractEntity {
  type: string = 'parental-unit';

  override attributes: {
    name: EncryptedValue | null,
  } = {
    name: null,
  };

  override encryptedValueConvertors = {
    name: EncryptedNullableString,
  }
}

@Injectable({
  providedIn: 'root',
})
export class ParentalUnitRepository extends AbstractRepository<ParentalUnit> {
  resource: typeof AbstractEntity = ParentalUnit;
  type: string = 'parental-unit';
}
