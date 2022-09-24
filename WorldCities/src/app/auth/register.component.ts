import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, Validators, AbstractControl, AsyncValidatorFn } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { MatCheckbox, MatCheckboxChange } from '@angular/material/checkbox';


import { BaseFormComponent } from '../base-form.component';
import { AuthService } from './auth.service';
import { RegisterRequest } from './register-request';
import { RegisterResult } from './register-result';
import { LoginRequest } from './login-request';
import { LoginResult } from './login-result';
import { User } from './user';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent
  extends BaseFormComponent implements OnInit {

  title?: string;
  registerResult?: RegisterResult;
  loginResult?: LoginResult;
  progressMessage?: string;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private authService: AuthService) {
    super();
  }

  ngOnInit(): void {
    this.form = new FormGroup({
      name: new FormControl('', Validators.required ),
      email: new FormControl('', [Validators.required, Validators.email], this.isDupeEmail()),
      password: new FormControl('', Validators.required),
      login: new FormControl()
    });
    this.form.controls["login"].setValue("checked");
  }

  onLoginCbChanged(event: MatCheckboxChange) {
    console.log("Login checkbox checked: " + event.checked);
  }

  onSubmit() {
    console.log(`Sending registration request.  Login checkbox is ${this.form.controls["login"].value}.`);
    this.registerResult = undefined;
    this.loginResult = undefined;
    this.progressMessage = "Submitting registration...";
    var registerRequest = <RegisterRequest>{};
    registerRequest.name = this.form.controls['name'].value;
    registerRequest.email = this.form.controls['email'].value;
    registerRequest.password = this.form.controls['password'].value;

    // Send register request.
    this.authService.register(registerRequest)
      .subscribe(result => {

        console.log(`Register result: Success: ${result.success}, Message: ${result.message}`);
        this.registerResult = result;

        if (result.success) {
          this.progressMessage = "Welecome " + registerRequest.name + "!";

          if (this.doLogin()) {

            // Perform Login Request as well.
            console.log("Login checkbox is checked.  Sending login request.");
            this.progressMessage += " Logging in...";
            var loginRequest = <LoginRequest>{};
            loginRequest.email = this.form.controls['email'].value;
            loginRequest.password = this.form.controls['password'].value;

            // Send login request.
            this.authService.login(loginRequest)
              .subscribe(loginResult => {

                console.log(`Login result: Success: ${loginResult.success}, Message: ${loginResult.message}`);
                this.loginResult = loginResult;

                if (loginResult.success)
                  this.router.navigate(["/"]);

              }, error => {
                console.log(error);
                this.loginResult = <LoginResult>{ success: false, message: 'We had a problem on our end.  Please try again.' };
              });
          }
          else
            this.router.navigate(["/"]);
       }

      }, error => {
        console.error(error);
        this.registerResult = <RegisterResult>{ success: false, message: 'We had a problem on our end.  Please try again.' };
        /* temp keep following for reference
        switch (error.status) {
          case 400:
          case 401:
          case 500:
            if (this.registerResult != undefined)
              this.registerResult.message = 'We had a problem on our end.  Please try again.';
            break; 
        }
        */
      });

  }

  private doLogin(): boolean {
    return this.form.controls["login"].value;
  }

  private isDupeEmail(): AsyncValidatorFn {

    console.log("RegisterComponent: isDupeEmail()");
    return (control: AbstractControl): Observable<{ [key: string]: any } | null> => {

      var testEmail = control.value.toString();
      return this.authService.isDupeEmail(testEmail)
        .pipe(map(result => {

          console.log("authServie.isDupeEmail() result:  " + result);
          return (result ? { isDupeEmail: true } : null);

        }));

    }
  }

}
