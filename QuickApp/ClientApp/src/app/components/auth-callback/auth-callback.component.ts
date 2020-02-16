// =============================
// Email: info@ebenmonney.com
// www.ebenmonney.com/templates
// =============================

import { Component, OnInit, ViewChildren, QueryList } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';

import { AlertService, MessageSeverity } from '../../services/alert.service';
import { AuthService } from '../../services/auth.service';
import { Utilities } from '../../services/utilities';
import { JwtHelper } from '../../services/jwt-helper';

@Component({
    selector: 'app-auth-callback',
    templateUrl: './auth-callback.component.html',
    styleUrls: ['./auth-callback.component.scss']
})

export class AuthCallbackComponent implements OnInit {

    message: string;
    isLoading = false;
    provider: string;
    externalAuthToken: string;
    email: string;
    loginStatusSubscription: any;
    formsSubscription: any;

    urlFragmentProcessed = false;
    urlQueryParamsProcessed = false;
    tokenProcessed = false;

    googleProvider = 'google';
    facebookProvider = 'facebook';
    twitterProvider = 'twitter';

    loginForm: FormGroup;

    @ViewChildren('form')
    private forms: QueryList<NgForm>;
    private form: NgForm;

    constructor(
        private route: ActivatedRoute,
        private alertService: AlertService,
        private authService: AuthService,
        private formBuilder: FormBuilder) {
        this.buildForm();
    }

    ngOnInit() {
        if (this.getShouldRedirect()) {
            this.authService.redirectLoginUser();
            return;
        } else {
            this.loginStatusSubscription = this.authService.getLoginStatusEvent().subscribe(() => {
                if (this.getShouldRedirect()) {
                    this.authService.redirectLoginUser();
                }
            });
        }

        this.setProvider(this.route.snapshot.url[0].path);

        this.route.fragment.subscribe(frag => {
            const fragParams: any = Utilities.getQueryParamsFromString(frag);
            this.processTokens(fragParams);
            this.urlFragmentProcessed = true;
        });

        this.route.queryParams.subscribe(params => {
            const queryParams: any = Utilities.GetObjectWithLoweredPropertyNames(params);
            this.processTokens(queryParams);
            this.urlQueryParamsProcessed = true;
        });
    }

    ngAfterViewInit() {
        this.formsSubscription = this.forms.changes.subscribe(ql => this.form = this.forms.first);
    }

    ngOnDestroy() {
        if (this.loginStatusSubscription) {
            this.loginStatusSubscription.unsubscribe();
        }

        if (this.formsSubscription) {
            this.formsSubscription.unsubscribe();
        }
    }

    buildForm() {
        this.loginForm = this.formBuilder.group({
            email: [{ value: '', disabled: true }],
            password: ['', Validators.required]
        });
    }

    get passwordControl() { return this.loginForm.get('password'); }

    get foundEmail(): string {
        const formModel = this.loginForm.getRawValue();
        return formModel.email;
    }
    set foundEmail(email: string) {
        this.loginForm.patchValue({ email });
    }

    get userPassword(): string {
        const formModel = this.loginForm.value;
        return formModel.password;
    }
    set userPassword(password: string) {
        this.loginForm.patchValue({ password });
    }

    getShouldRedirect() {
        return this.authService.isLoggedIn && !this.authService.isSessionExpired;
    }

    setProvider(url: string) {
        if (url.includes(this.googleProvider)) {
            this.provider = this.googleProvider;
        } else if (url.includes(this.facebookProvider)) {
            this.provider = this.facebookProvider;
        } else if (url.includes(this.twitterProvider)) {
            this.provider = this.twitterProvider;
        } else {
            throw new Error('Unknown login provider');
        }
    }

    processTokens(tokensObject: any) {
        if (this.tokenProcessed) {
            return;
        }

        if (tokensObject) {
            if (tokensObject.access_token) {
                if (tokensObject.id_token) {
                    const decodedIdToken = new JwtHelper().decodeToken(tokensObject.id_token);
                    this.email = decodedIdToken.email || decodedIdToken.emailAddress;
                } else {
                    this.email = null;
                }

                this.tokenProcessed = true;
                this.loginWithToken(tokensObject.access_token, this.provider, this.email);
            } else if (tokensObject.oauth_token && tokensObject.oauth_verifier) {
                if (this.provider == this.twitterProvider) {
                    this.tokenProcessed = true;
                    this.isLoading = true;
                    this.message = 'Connecting to twitter...';
                    this.authService.getTwitterAccessToken(tokensObject.oauth_token, tokensObject.oauth_verifier)
                        .subscribe(accessToken => {
                            this.isLoading = true;
                            this.message = 'Processing...';
                            this.loginWithToken(accessToken, this.provider);
                        },
                            error => {
                                this.isLoading = false;
                                this.message = null;
                                this.showLoginErrorMessage(error);
                            });
                }
            }
        }

        if (!this.tokenProcessed && (this.urlFragmentProcessed || this.urlQueryParamsProcessed)) {
            setTimeout(() => {
                this.alertService.showMessage('Invalid login', 'No valid tokens found', MessageSeverity.error);
            }, 500);

            this.message = 'Error.';
            this.authService.redirectLogoutUser();
        }
    }

    loginWithToken(token: string, provider: string, email?: string) {
        this.externalAuthToken = token;
        this.isLoading = true;
        this.message = 'Processing...';
        this.alertService.startLoadingMessage('', 'Signing in...');

        this.authService.loginWithExternalToken(token, provider, email)
            .subscribe(
                user => {
                    setTimeout(() => {
                        this.alertService.stopLoadingMessage();
                        this.isLoading = false;

                        this.alertService.showMessage('Login', `Welcome ${user.userName}!`, MessageSeverity.success);
                    }, 500);
                },
                error => {
                    this.alertService.stopLoadingMessage();
                    this.isLoading = false;
                    this.message = 'Error.';
                    this.foundEmail = Utilities.findHttpResponseMessage('email', error);

                    if (this.foundEmail) {
                        const errorMessage = Utilities.getHttpResponseMessage(error);
                        this.alertService.showStickyMessage('User already exists', this.mapLoginErrorMessage(errorMessage), MessageSeverity.default, error);
                    } else {
                        this.showLoginErrorMessage(error);
                    }
                });
    }


    linkAccountAndLogin() {
        if (!this.form.submitted) {
            this.form.onSubmit(null);
            return;
        }

        if (!this.loginForm.valid) {
            this.alertService.showValidationError();
            return;
        }

        this.isLoading = true;
        this.alertService.startLoadingMessage('', 'Attempting login...');

        this.authService.loginWithExternalToken(this.externalAuthToken, this.provider, this.email, this.userPassword)
            .subscribe(
                user => {
                    setTimeout(() => {
                        this.alertService.stopLoadingMessage();
                        this.isLoading = false;
                        this.userPassword = '';

                        this.alertService.showMessage('Login', `Welcome ${user.userName}!`, MessageSeverity.success);
                    }, 500);
                },
                error => {
                    this.alertService.stopLoadingMessage();
                    this.showLoginErrorMessage(error, false);

                    setTimeout(() => {
                        this.isLoading = false;
                    }, 500);
                });
    }

    showLoginErrorMessage(error, redirect = true) {
        setTimeout(() => {
            if (Utilities.checkNoNetwork(error)) {
                this.alertService.showStickyMessage(Utilities.noNetworkMessageCaption, Utilities.noNetworkMessageDetail, MessageSeverity.error, error);
            } else {
                const errorMessage = Utilities.getHttpResponseMessage(error);
                if (errorMessage) {
                    this.alertService.showStickyMessage('Unable to login', this.mapLoginErrorMessage(errorMessage), MessageSeverity.error, error);
                } else {
                    this.alertService.showStickyMessage('Unable to login', 'An error occured, please try again later.\nError: ' + Utilities.getResponseBody(error), MessageSeverity.error, error);
                }
            }

        }, 500);

        if (redirect) {
            this.authService.redirectLogoutUser();
        }
    }

    mapLoginErrorMessage(error: string) {
        if (error == 'invalid_username_or_password') {
            return 'Invalid username or password';
        }

        return error;
    }
}
