import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'objectKeys'
})
export class ObjectKeysPipe implements PipeTransform {

  transform<T>(value: any): (keyof T)[] {
    return <(keyof T)[]>Object.keys(value);
  }

}
