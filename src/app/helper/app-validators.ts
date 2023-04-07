import {AbstractControl, ValidationErrors, ValidatorFn} from "@angular/forms";

export class AppValidators {
  public static isEnum(enumType: any): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value === null) {
        return null;
      }

      if (Object.values(enumType).indexOf(control.value) > -1) {
        return null;
      }

      return {
        isEnum: {value: control.value, enumType: enumType},
      };
    }
  }
}
