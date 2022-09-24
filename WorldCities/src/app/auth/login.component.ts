import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, Validators, AbstractControl, AsyncValidatorFn } from '@angular/forms';

import { BaseFormComponent } from '../base-form.component';
import { AuthService } from './auth.service';
import { LoginRequest } from './login-request';
import { LoginResult } from './login-result';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent
  extends BaseFormComponent implements OnInit {

  title?: string;
  errMessage?: string;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private authService: AuthService) {
    super();
  }

  ngOnInit(): void {
    this.form = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', Validators.required)
    });
  }

  onSubmit() {
    console.log("Logging in...");
    this.errMessage = undefined;
    var loginRequest = <LoginRequest>{};
    loginRequest.email = this.form.controls['email'].value;
    loginRequest.password = this.form.controls['password'].value;

    this.authService.login(loginRequest)
      .subscribe(result => {

        console.log(`Login result: ${result.message}`);
        if (result.success)
          this.router.navigate(["/"]);
        else
          this.errMessage = result.message;

      }, error => {
        console.error(error);
        this.errMessage = 'We had a problem on our end.  Please try again.';
      });
  }
}
