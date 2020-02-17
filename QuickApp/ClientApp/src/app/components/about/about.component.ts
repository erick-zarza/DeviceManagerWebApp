// =============================
// Email: info@somesite.com
// www.somesite.com/templates
// =============================

import { Component } from '@angular/core';
import { fadeInOut } from '../../services/animations';

@Component({
    selector: 'about',
    templateUrl: './about.component.html',
    styleUrls: ['./about.component.scss'],
    animations: [fadeInOut]
})
export class AboutComponent { }
