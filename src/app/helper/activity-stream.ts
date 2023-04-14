import {AbstractEntity} from "../services/json-api/abstract.entity";
import {ActivityStreamItem} from "../services/activity-stream.service";
import {EncryptedValue} from "../dto/encrypted-value";
import {ActivityType} from "../enum/activity-type.enum";

export function toActivityStreamItem(
  entity: AbstractEntity,
  type: ActivityType,
  childName: string | null,
): ActivityStreamItem {
  let result: Partial<ActivityStreamItem> = {
    id: String(entity.id),
    activityType: type,
    childName: childName,
  };

  for (const attribute of Object.keys(entity.attributes)) {
    const value = (<any>entity.attributes)[attribute];
    if (value instanceof EncryptedValue && !value.isDecrypted) {
      throw new Error("The entity must be decrypted before being passed to this function");
    }
    result[attribute] = value instanceof EncryptedValue ? value.decrypted : value;
  }

  if (result.id === undefined) {
    throw new Error('ID cannot be undefined');
  }
  if (result.startTime === undefined) {
    throw new Error('Start time cannot be undefined');
  }
  if (result.endTime === undefined) {
    throw new Error('End time cannot be undefined');
  }
  if (result.note === undefined) {
    throw new Error('Note cannot be undefined');
  }

  return <ActivityStreamItem>result;
}
