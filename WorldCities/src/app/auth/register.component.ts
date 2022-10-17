import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, Validators, AbstractControl, AsyncValidatorFn } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { MatCheckbox, MatCheckboxChange } from '@angular/material/checkbox';


import { BaseFormComponent } from '@app/base-form.component';
import { ShowMessageComponent } from '@app/show-message/show-message.component';
import { AuthService } from '@app/_services/auth.service';
import { RegisterRequest } from './register-request';
import { RegisterResult } from './register-result';
import { LoginRequest } from './login-request';
import { LoginResult } from './login-result';
import { User } from '@app/_models/user';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent
  extends BaseFormComponent implements OnInit {

  @ViewChild(ShowMessageComponent) show!: ShowMessageComponent;
   

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
    console.log(`Sending registration request. Login checkbox is ${this.form.controls["login"].value}.`);
    this.show.setMessages(true, "Submitting registration...")
    var registerRequest = <RegisterRequest>{
      name: this.form.controls['name'].value,
      email: this.form.controls['email'].value,
      password: this.form.controls['password'].value
    };

    // Send register request.
    this.authService.register(registerRequest)
      .subscribe(result => {

        console.log(`Register result: Success: ${result.success}, Message: ${result.message}`);
        if (!result.success) {
          this.show.setMessages(result.success, result.message);
          return;
        }

        if (!this.doLogin())
          this.router.navigate(["/"]);

        // Perform Login Request as well.
        console.log("Login checkbox is checked.  Sending login request.");
        this.show.setMessages(result.success, "Welecome " + registerRequest.name + "!  Logging in...")
        var loginRequest = <LoginRequest>{
          email: this.form.controls['email'].value,
          password: this.form.controls['password'].value
        };
        this.authService.login(loginRequest)
          .subscribe(loginResult => {

            console.log(`Login result: Success: ${loginResult.success}, Message: ${loginResult.message}`);
            if (loginResult.success)
              this.router.navigate(["/"]);
            else
              this.router.navigate(["login"]); // User story: Give another chance.

          }, error => {
            console.error(error);
            this.router.navigate(["login"]); // User story: Give another change.
          });

      }, error => {
        console.error(error);
        this.show.setMessages(false, 'We had a problem on our end.  Please try again.')
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
