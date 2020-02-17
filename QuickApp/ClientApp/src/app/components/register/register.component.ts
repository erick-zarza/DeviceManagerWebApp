// =============================
// Email: info@somesite.com
// www.somesite.com/templates
// =============================

import { Component, OnInit, OnDestroy, Input, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';

import { AlertService, MessageSeverity, DialogType } from '../../services/alert.service';
import { AuthService } from '../../services/auth.service';
import { AccountService } from '../../services/account.service';
import { ConfigurationService } from '../../services/configuration.service';
import { Utilities } from '../../services/utilities';
import { UserEdit } from '../../models/user-edit.model';
import { EqualValidator } from '../../shared/validators/equal.validator';

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit, OnDestroy {
    isLoading = false;
    loginStatusSubscription: any;

    registerForm: FormGroup;

    @ViewChild('form', { static: true })
    private form: NgForm;

    constructor(
        private alertService: AlertService,
        private authService: AuthService,
        private accountService: AccountService,
        private configurations: ConfigurationService,
        private formBuilder: FormBuilder) {
        this.buildForm();
    }

    ngOnInit() {
        this.registerForm.setValue({
            userName: '',
            email: '',
            password: {
                newPassword: '',
                confirmPassword: ''
            }
        });

        if (this.getShouldRedirect()) {
            this.authService.redirectLoginUser();
        } else {
            this.loginStatusSubscription = this.authService.getLoginStatusEvent()
                .subscribe(() => {
                    if (this.getShouldRedirect()) {
                        this.authService.redirectLoginUser();
                    }
                });
        }
    }

    ngOnDestroy() {
        if (this.loginStatusSubscription) {
            this.loginStatusSubscription.unsubscribe();
        }
    }

    buildForm() {
        this.registerForm = this.formBuilder.group({
            userName: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            password: this.formBuilder.group({
                newPassword: ['', [Validators.required, Validators.pattern(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W]).{8,}/)]],
                confirmPassword: ['', [Validators.required, EqualValidator('newPassword')]],
            })
        });
    }

    get userName() { return this.registerForm.get('userName'); }
    get email() { return this.registerForm.get('email'); }
    get newPassword() { return this.registerForm.get('password').get('newPassword'); }
    get confirmPassword() { return this.registerForm.get('password').get('confirmPassword'); }

    getShouldRedirect() {
        return this.authService.isLoggedIn && !this.authService.isSessionExpired;
    }

    getNewUser(): UserEdit {
        const formModel = this.registerForm.value;
        const newUser = new UserEdit();

        newUser.userName = formModel.userName;
        newUser.email = formModel.email;
        newUser.newPassword = formModel.password.newPassword;

        return newUser;
    }

    register() {
        if (!this.form.submitted) {
            // Causes validation to update.
            this.form.onSubmit(null);
            return;
        }

        if (!this.registerForm.valid) {
            this.alertService.showValidationError();
            return;
        }

        this.isLoading = true;
        this.alertService.startLoadingMessage('', 'Registering new user...');

        this.accountService.newUser(this.getNewUser(), true)
            .subscribe(() => this.saveSuccessHelper(), error => this.saveFailedHelper(error));
    }

    private saveSuccessHelper() {
        const user = this.getNewUser();
        this.alertService.stopLoadingMessage();
        this.alertService.showMessage('Success', `User account "${user.userName}" was created successfully`, MessageSeverity.success);

        this.login(user.userName, user.newPassword);
    }


    private saveFailedHelper(error: any) {
        this.isLoading = false;
        this.alertService.stopLoadingMessage();
        this.alertService.showStickyMessage('Save Error', 'The below errors occured during registration:', MessageSeverity.error, error);
        this.alertService.showStickyMessage(error, null, MessageSeverity.error);
    }


    login(username: string, password: string) {
        this.isLoading = true;
        this.alertService.startLoadingMessage('', 'Attempting login...');

        this.authService.loginWithPassword({ userName: username, password, rememberMe: false })
            .subscribe(
                user => {
                    setTimeout(() => {
                        this.alertService.stopLoadingMessage();
                        this.isLoading = false;
                        this.registerForm.reset();

                        this.alertService.showMessage('Login', `Welcome ${user.userName}!`, MessageSeverity.success);
                        this.alertService.showStickyMessage('', 'Your account was created successfully', MessageSeverity.success);
                    }, 500);
                },
                error => {
                    this.alertService.stopLoadingMessage();

                    if (Utilities.checkNoNetwork(error)) {
                        this.alertService.showStickyMessage(Utilities.noNetworkMessageCaption, Utilities.noNetworkMessageDetail, MessageSeverity.error, error);
                    } else {
                        const errorMessage = Utilities.getHttpResponseMessage(error);

                        if (errorMessage) {
                            this.alertService.showStickyMessage('Unable to login', this.mapLoginErrorMessage(errorMessage), MessageSeverity.error, error);
                        } else {
                            this.alertService.showStickyMessage('Unable to login', 'An error occured whilst loggin in, please try again later.\nError: ' + Utilities.getResponseBody(error), MessageSeverity.error, error);
                        }
                    }
                    setTimeout(() => {
                        this.isLoading = false;
                    }, 500);
                });
    }


    mapLoginErrorMessage(error: string) {

        if (error == 'invalid_username_or_password') {
            return 'Invalid username or password';
        }

        if (error == 'invalid_grant') {
            return 'This account has been disabled';
        }

        return error;
    }
}
