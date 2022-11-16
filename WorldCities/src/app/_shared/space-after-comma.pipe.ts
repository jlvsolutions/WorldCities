import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'spaceAfterComma'
})
export class SpaceAfterCommaPipe implements PipeTransform {

  transform(value: string): string {
    var re = /,/;
    return value.replace(re, ', ');
  }

}
