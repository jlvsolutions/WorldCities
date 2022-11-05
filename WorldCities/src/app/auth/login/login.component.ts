import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, Validators, AbstractControl, AsyncValidatorFn } from '@angular/forms';

import { BaseFormComponent } from '@app/_helpers/base-form.component';
import { ShowMessageComponent } from '@app/_shared';
import { AuthService } from '@app/_services';
import { LoginRequest } from '@app/_models';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent
  extends BaseFormComponent implements OnInit {

  showPassword: boolean = false;

  returnUrl: string = '/';
  wasRedirected: boolean = false;
  @ViewChild(ShowMessageComponent) show!: ShowMessageComponent;


  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private authService: AuthService) {
    super();
  }

  ngOnInit(): void {
    this.returnUrl = this.activatedRoute.snapshot.queryParams['returnUrl'] || '/';
    this.wasRedirected = this.returnUrl !== '/';
    this.form = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', Validators.required)
    });
  }

  onSubmit() {
    console.log("Logging in...");
    this.show.clearMessages();
    var loginRequest = <LoginRequest>{};
    loginRequest.email = this.form.controls['email'].value;
    loginRequest.password = this.form.controls['password'].value;

    this.authService.login(loginRequest)
      .subscribe(result => {

        console.log('Logged in.');
        this.router.navigateByUrl(this.returnUrl);
      }, error => {
        console.log('LoginComponent: error logging in.');
        if (error.status === 401)
          this.show.setMessages(false, error.error);
        else
          this.show.setMessages(false, 'We had a problem on our end.  Please try again.');
      });
  }

  showHidePassword() {
    this.showPassword = !this.showPassword;
  }
}
