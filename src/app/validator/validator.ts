import {AbstractControl, ValidationErrors} from "@angular/forms";

export interface Validator {
  validate(control: AbstractControl): ValidationErrors | null;
}
