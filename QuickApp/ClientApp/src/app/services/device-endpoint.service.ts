import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AuthService } from './auth.service';
import { EndpointBase } from './endpoint-base.service';
import { ConfigurationService } from './configuration.service';


@Injectable()
export class DeviceEndpoint extends EndpointBase {

    private readonly _deviceUrl: string = '/api/device';

    get deviceUrl() { return this.configurations.baseUrl + this._deviceUrl; }

    constructor(private configurations: ConfigurationService, http: HttpClient, authService: AuthService) {
        super(http, authService);
    }


    getDeviceEndpoint<T>(): Observable<T> {
        const endpointUrl = this.deviceUrl;

        return this.http.get<T>(endpointUrl, this.requestHeaders).pipe<T>(
            catchError(error => {
                return this.handleError(error, () => this.getDeviceEndpoint());
            }));
    }
}
