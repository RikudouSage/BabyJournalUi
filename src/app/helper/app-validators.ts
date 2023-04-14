import {AbstractControl, FormGroup, ValidationErrors, ValidatorFn} from "@angular/forms";

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

  public static requiredIf(callback: (group: FormGroup) => boolean, controlName: string) {
    return (group: AbstractControl): ValidationErrors | null => {
      if (!callback(<FormGroup>group)) {
        return null;
      }

      const control = (<FormGroup>group).controls[controlName];
      if (control === undefined) {
        return {
          required: {
            [controlName]: true,
          },
        };
      }

      if (!control.value && control.value !== 0) {
        return {
          required: {
            [controlName]: true,
          },
        };
      }

      return null;
    }
  };
}
