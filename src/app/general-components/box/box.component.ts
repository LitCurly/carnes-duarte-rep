import { Component, Input } from '@angular/core';

@Component({
  selector: 'box',
  template: '<div [ngClass]="className" [ngStyle]="styles"><ng-content></ng-content></div>',
  styles: []
})
export class BoxComponent {
  @Input() className: string = '';
  @Input() styles: { [key: string]: any } = {};
}
