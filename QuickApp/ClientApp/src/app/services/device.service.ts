import { Injectable } from '@angular/core';
import { Observable, Subject, forkJoin } from 'rxjs';
import { mergeMap, tap } from 'rxjs/operators';

import { DeviceEndpoint } from './device-endpoint.service';
import { AuthService } from './auth.service';
import { Role } from '../models/role.model';
import { Permission, PermissionNames, PermissionValues } from '../models/permission.model';
import { UserEdit } from '../models/user-edit.model';
import { Device } from '../models/device.model';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { DeviceDetail } from '../models/deviceDetail.model';

export type RolesChangedOperation = 'add' | 'delete' | 'modify';
export interface RolesChangedEventArg { roles: Role[] | string[]; operation: RolesChangedOperation; }

@Injectable()
export class DeviceService {
    public static readonly roleAddedOperation: RolesChangedOperation = 'add';
    public static readonly roleDeletedOperation: RolesChangedOperation = 'delete';
    public static readonly roleModifiedOperation: RolesChangedOperation = 'modify';

    private _rolesChanged = new Subject<RolesChangedEventArg>();

    baseURL = environment.apiURL;

    constructor(
        private http: HttpClient,
        private authService: AuthService,
        private deviceEndpoint: DeviceEndpoint) {

    }k

    // getDevices() {
    //     return this.deviceEndpoint.getDeviceEndpoint<Device[]>();
    // }

    getDevices(): Observable<Device[]> {
        return this.http.get<Device[]>(this.baseURL + "device");
      }

      getQueueItems(deviceId: string): Observable<DeviceDetail[]> {
        return this.http.get<DeviceDetail[]>(this.baseURL + "queueitem/" + deviceId);
      }
}

