import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'type'
})
export class TypePipe implements PipeTransform {

  transform(value: any): string {
    return typeof value;
  }

}
