import {Component, Input, OnInit} from '@angular/core';
import {ControlValueAccessor, FormArray, FormControl, NG_VALUE_ACCESSOR} from "@angular/forms";

interface Control {
  unit: string;
  amount: number;
}

@Component({
  selector: 'app-unit-amount',
  templateUrl: './unit-amount.component.html',
  styleUrls: ['./unit-amount.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: UnitAmountComponent,
    },
  ],
})
export class UnitAmountComponent implements ControlValueAccessor, OnInit {
  @Input() public config: Control[] = [];

  public form: FormArray<FormControl<Control | null>> = new FormArray<FormControl<Control|null>>([]);

  private onChange: ((value: Control[]) => void) | null = null;
  private onTouched: (() => void) | null = null;

  public registerOnChange(func: (value: Control[]) => void): void {
    this.onChange = func;
  }

  public registerOnTouched(func: () => void): void {
    this.onTouched = func;
  }

  public writeValue(value: Control[]): void {
    if (value.length !== this.config.length) {
      throw new Error("Invalid value provided");
    }

    this.config = value;
    for (let i = 0; i < this.form.controls.length; ++i) {
      this.form.controls[i].patchValue(value[i]);
    }
  }

  public ngOnInit(): void {
    for (const item of this.config) {
      this.form.controls.push(new FormControl<Control>(item));
    }

    this.form.valueChanges.subscribe(changes => {
      for (const change of changes) {
        if (change === null) {
          return;
        }
      }

      if (!this.onChange) {
        return;
      }
      this.onChange(<Control[]>changes);

      if (!this.onTouched) {
        return;
      }
      this.onTouched();
    });
  }

}
