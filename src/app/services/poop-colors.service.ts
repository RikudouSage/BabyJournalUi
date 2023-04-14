import {Injectable} from '@angular/core';
import {PoopColor} from "../types/poop-color";
import {TranslateService} from "@ngx-translate/core";

@Injectable({
  providedIn: 'root'
})
export class PoopColorsService {
  public readonly poopColors: PoopColor[] = [
    {
      name: this.translator.get('Dark brown'),
      color: '#6a380c'
    },
    {
      name: this.translator.get('Light brown'),
      color: '#b86642',
    },
    {
      name: this.translator.get('Mustard'),
      color: '#c69b62',
    },
    {
      name: this.translator.get('Green'),
      color: '#79782f',
    },
    {
      name: this.translator.get('Red'),
      color: '#e52121',
    },
    {
      name: this.translator.get('Orange'),
      color: '#e68524',
    },
    {
      name: this.translator.get('Yellow'),
      color: '#dfdf17',
    },
    {
      name: this.translator.get('White'),
      color: '#f0ecec',
    },
    {
      name: this.translator.get('Black'),
      color: '#1f1b1b',
    },
  ];

  constructor(
    private readonly translator: TranslateService,
  ) {
  }

  public findByColor(color: string): PoopColor {
    for (const storedColor of this.poopColors) {
      if (storedColor.color === color) {
        return storedColor;
      }
    }

    throw new Error(`Color not found: ${color}`);
  }
}
