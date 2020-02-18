import { Component, OnInit, AfterViewInit, TemplateRef, ViewChild, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import { fadeInOut } from '../../services/animations';
import { AlertService, DialogType, MessageSeverity } from '../../services/alert.service';
import { AppTranslationService } from '../../services/app-translation.service';
import { AccountService } from '../../services/account.service';
import { Utilities } from '../../services/utilities';
import { Device } from '../../models/device.model';
import { Role } from '../../models/role.model';
import { Permission } from '../../models/permission.model';
import { EditUserDialogComponent } from 'src/app/admin/edit-user-dialog/edit-user-dialog.component';
import { DeviceService } from '../../services/device.service';
import { DeviceDetail } from '../../models/deviceDetail.model';

@Component({
  selector: 'devices',
  templateUrl: './devices.component.html',
  styleUrls: ['./devices.component.scss'],
  animations: [fadeInOut]
})
export class DevicesComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  displayedColumns = ['name', 'serialNumber', 'registrationDate', 'firmwareVersion'];
  displayedDetailColumns = ['deviceId','id', 'temperaturC', 'airHumidity', 'carbonMonoxide', 'healthStatus', 'timeStamp', 'queueItemString'];

  dataSource: MatTableDataSource<Device>;
  dataDetailSource: MatTableDataSource<DeviceDetail>;
  sourceDevice: Device;
  loadingIndicator: boolean;
  allRoles: Role[] = [];
  isDeviceDetail: boolean = false;

  constructor(
    private alertService: AlertService,
    private translationService: AppTranslationService,
    private deviceService: DeviceService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog) {

      
   
    this.displayedColumns.push('actions');
    

    // Assign the data to the data source for the table to render
    this.dataSource = new MatTableDataSource();
    this.dataDetailSource = new MatTableDataSource();
  }

  ngOnInit() {
    this.loadData();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  public applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue;
  }

  public applyFilterDetails(filterValue: string) {
    this.dataDetailSource.filter = filterValue;
  }

  private refresh() {
    // Causes the filter to refresh there by updating with recently added data.
    this.applyFilter(this.dataSource.filter);
    this.applyFilterDetails(this.dataDetailSource.filter);
  }

  // private updateUsers(user: User) {
  //   if (this.sourceUser) {
  //     Object.assign(this.sourceUser, user);
  //     this.alertService.showMessage('Success', `Changes to user \"${user.userName}\" was saved successfully`, MessageSeverity.success);
  //     this.sourceUser = null;
  //   } else {
  //     this.dataSource.data.push(user);
  //     this.refresh();
  //     this.alertService.showMessage('Success', `User \"${user.userName}\" was created successfully`, MessageSeverity.success);
  //   }
  // }

  private loadData() {
    this.alertService.startLoadingMessage();
    this.loadingIndicator = true;

      this.deviceService.getDevices().subscribe(
        devices => this.onDataLoadSuccessful(devices),
        error => this.onDataLoadFailed(error)
      );
  }
 
  deviceDetails(device: Device) {
    this.alertService.startLoadingMessage();
    this.loadingIndicator = true;
    this.deviceService.getQueueItems(device.id).subscribe(
     
      deviceDetail => this.onDetailDataLoadSuccessful(deviceDetail),
      error => this.onDataLoadFailed(error)
    );
  }

  private onDataLoadSuccessful(devices: Device[]/*, roles: Role[]*/) {
    
    this.alertService.stopLoadingMessage();
    this.loadingIndicator = false;
    this.dataSource.data = devices;
    console.log(this.dataSource.data);
  }

  private onDetailDataLoadSuccessful(deviceDetail: DeviceDetail[]) {
    if (deviceDetail.length > 0) {
      this.dataDetailSource.data = deviceDetail;
      this.isDeviceDetail = true;
    }
    else {
      this.isDeviceDetail = false;
    }

    this.alertService.stopLoadingMessage();
    this.loadingIndicator = false;
        
  }

  private onDataLoadFailed(error: any) {
    this.alertService.stopLoadingMessage();
    this.loadingIndicator = false;

    this.alertService.showStickyMessage('Load Error', `Unable to retrieve users from the server.\r\nErrors: "${Utilities.getHttpResponseMessages(error)}"`,
      MessageSeverity.error, error);
  }

  // public editUser(user?: User) {
  //   this.sourceUser = user;

  //   const dialogRef = this.dialog.open(EditUserDialogComponent,
  //     {
  //       panelClass: 'mat-dialog-lg',
  //       data: { user, roles: [...this.allRoles] }
  //     });
  //   dialogRef.afterClosed().subscribe(user => {
  //     if (user) {
  //       this.updateUsers(user);
  //     }
  //   });
  // }

  // public confirmDelete(user: User) {
  //   this.snackBar.open(`Delete ${user.userName}?`, 'DELETE', { duration: 5000 })
  //     .onAction().subscribe(() => {
  //       this.alertService.startLoadingMessage('Deleting...');
  //       this.loadingIndicator = true;

  //       this.accountService.deleteUser(user)
  //         .subscribe(results => {
  //           this.alertService.stopLoadingMessage();
  //           this.loadingIndicator = false;
  //           this.dataSource.data = this.dataSource.data.filter(item => item !== user);
  //         },
  //           error => {
  //             this.alertService.stopLoadingMessage();
  //             this.loadingIndicator = false;

  //             this.alertService.showStickyMessage('Delete Error', `An error occured whilst deleting the user.\r\nError: "${Utilities.getHttpResponseMessages(error)}"`,
  //               MessageSeverity.error, error);
  //           });
  //     });
  // }

  // get canManageUsers() {
  //   return this.accountService.userHasPermission(Permission.manageUsersPermission);
  // }

  // get canViewRoles() {
  //   return this.accountService.userHasPermission(Permission.viewRolesPermission);
  // }

  // get canAssignRoles() {
  //   return this.accountService.userHasPermission(Permission.assignRolesPermission);
  // }
}
