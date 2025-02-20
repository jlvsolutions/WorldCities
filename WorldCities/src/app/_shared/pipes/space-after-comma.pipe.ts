import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'spaceAfterComma',
    standalone: false
})
export class SpaceAfterCommaPipe implements PipeTransform {

  transform(value: string): string {
    var re = /,/g;
    return value.toString().replace(re, ', ');
  }

}
