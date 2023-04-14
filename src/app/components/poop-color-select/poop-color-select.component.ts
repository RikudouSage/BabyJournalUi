import {Component, EventEmitter, Input, Output} from '@angular/core';
import {PoopColorsService} from "../../services/poop-colors.service";
import {PoopColor} from "../../types/poop-color";
import {Observable} from "rxjs";

@Component({
  selector: 'app-poop-color-select',
  templateUrl: './poop-color-select.component.html',
  styleUrls: ['./poop-color-select.component.scss']
})
export class PoopColorSelectComponent {
  private _change: EventEmitter<PoopColor> = new EventEmitter<PoopColor>();
  private _initialColor: PoopColor | null = null;

  public poopColors: PoopColor[] = this.poopColorsService.poopColors;

  get initialColor(): PoopColor | null {
    return this._initialColor;
  }

  @Input() set initialColor(color: PoopColor | null) {
    if (color !== null) {
      color = this.poopColorsService.findByColor(color.color);
    }
    this._initialColor = color;
  }

  @Output() get change(): Observable<PoopColor> {
    return this._change;
  }

  constructor(
    private readonly poopColorsService: PoopColorsService,
  ) {
  }

  public async onValueChanged(color: PoopColor) {
    this._change.next(color);
  }
}
