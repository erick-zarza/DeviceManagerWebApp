// =============================
// Email: info@ebenmonney.com
// www.ebenmonney.com/templates
// =============================

import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';

import { AlertService, MessageSeverity } from '../../services/alert.service';
import { AuthService } from '../../services/auth.service';
import { AccountService } from '../../services/account.service';
import { Utilities } from '../../services/utilities';
import { EqualValidator } from '../../shared/validators/equal.validator';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  isLoading = false;
  isSuccess: boolean;
  resetCode: string;

  resetPasswordForm: FormGroup;

  @ViewChild('form', { static: false })
  private form: NgForm;

  constructor(
    private route: ActivatedRoute,
    private alertService: AlertService,
    private authService: AuthService,
    private accountService: AccountService,
    private formBuilder: FormBuilder) {
    this.buildForm();
  }

  ngOnInit() {
    this.resetPasswordForm.setValue({
      usernameOrEmail: '',
      password: {
        newPassword: '',
        confirmPassword: ''
      }
    });

    this.route.queryParams.subscribe(params => {
      const loweredParams: any = Utilities.GetObjectWithLoweredPropertyNames(params);
      this.resetCode = loweredParams.code;

      if (!this.resetCode) {
        this.authService.gotoHomePage();
      }
    });
  }

  buildForm() {
    this.resetPasswordForm = this.formBuilder.group({
      usernameOrEmail: ['', Validators.required],
      password: this.formBuilder.group({
        newPassword: ['', [Validators.required, Validators.pattern(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W]).{8,}/)]],
        confirmPassword: ['', [Validators.required, EqualValidator('newPassword')]],
      })
    });
  }

  get usernameOrEmail() { return this.resetPasswordForm.get('usernameOrEmail'); }
  get newPassword() { return this.resetPasswordForm.get('password').get('newPassword'); }
  get confirmPassword() { return this.resetPasswordForm.get('password').get('confirmPassword'); }

  getUsernameOrEmail(): string {
    const formModel = this.resetPasswordForm.value;
    return formModel.usernameOrEmail;
  }

  getNewPassword(): string {
    const formModel = this.resetPasswordForm.value;
    return formModel.password.newPassword;
  }

  resetPassword() {
    if (!this.form.submitted) {
      // Causes validation to update.
      this.form.onSubmit(null);
      return;
    }

    if (!this.resetPasswordForm.valid) {
      this.alertService.showValidationError();
      return;
    }

    this.isLoading = true;
    this.alertService.startLoadingMessage('', 'Resetting password...');

    this.accountService.resetPassword(this.getUsernameOrEmail(), this.getNewPassword(), this.resetCode)
      .subscribe(() => this.saveSuccessHelper(), error => this.saveFailedHelper(error));
  }

  private saveSuccessHelper() {
    this.alertService.stopLoadingMessage();
    this.isLoading = false;
    this.isSuccess = true;
    this.alertService.showMessage('Password Change', 'Your password was successfully reset', MessageSeverity.success);
    this.authService.logout();
  }

  private saveFailedHelper(error: any) {
    this.alertService.stopLoadingMessage();
    this.isLoading = false;
    this.isSuccess = false;

    const errorMessage = Utilities.getHttpResponseMessage(error);

    if (errorMessage) {
      this.alertService.showStickyMessage('Password Reset Failed', errorMessage, MessageSeverity.error, error);
    } else {
      this.alertService.showStickyMessage('Password Reset Failed', `An error occured whilst resetting your password.\nError: ${Utilities.getResponseBody(error)}`, MessageSeverity.error, error);
    }
  }
}
