import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'join',
    standalone: false
})
export class JoinPipe implements PipeTransform {

  transform(value: any[], separator = ', '): string {
    return value.join(separator);
  }
}
