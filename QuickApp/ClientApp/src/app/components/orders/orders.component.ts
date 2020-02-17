// =============================
// Email: info@somesite.com
// www.somesite.com/templates
// =============================

import { Component } from '@angular/core';
import { fadeInOut } from '../../services/animations';

@Component({
    selector: 'orders',
    templateUrl: './orders.component.html',
    styleUrls: ['./orders.component.scss'],
    animations: [fadeInOut]
})
export class OrdersComponent {
}
