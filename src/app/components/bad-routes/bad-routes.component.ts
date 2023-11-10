import { Component } from '@angular/core';
import { CommonModule, UpperCasePipe } from '@angular/common';

@Component({
  selector: 'app-bad-routes',
  standalone: true,
  imports: [CommonModule, UpperCasePipe],
  templateUrl: './bad-routes.component.html',
  styleUrls: ['./bad-routes.component.css']
})
export class BadRoutesComponent {

}
