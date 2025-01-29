import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, Validators, AbstractControl, AsyncValidatorFn } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { MatCheckbox, MatCheckboxChange } from '@angular/material/checkbox';

import { BaseFormComponent } from '@app/_helpers/base-form.component';
import { AuthService } from '@app/_services';
import { LoginRequest, RegisterRequest, IShowMessage } from '@app/_models';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent
  extends BaseFormComponent implements OnInit {

  showPassword: boolean = false;

  @ViewChild('showMessage') showMsg!: IShowMessage;
   
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
    this.showMsg.message = "Submitting registration...";
    var registerRequest = <RegisterRequest>{
      name: this.form.controls['name'].value,
      email: this.form.controls['email'].value,
      password: this.form.controls['password'].value
    };

    // Send register request.
    this.authService.register(registerRequest)
      .subscribe(registerResultMsg => {

        console.log(`Register result: Success: ${registerResultMsg.message}`);
        this.showMsg.message = registerResultMsg.message;

        if (!this.doLogin())
          this.router.navigate(["/"]);

        // Perform Login Request as well.
        console.log("Sending login request...");
        this.showMsg.message = "Welecome " + registerRequest.name + "!  Logging in...";

        var loginRequest = <LoginRequest>{
          email: this.form.controls['email'].value,
          password: this.form.controls['password'].value
        };

        this.authService.login(loginRequest)
          .subscribe(user => {
            console.log(`Login result: Success: ${user.email}`);
            this.showMsg.message = 'Login successful';
            this.router.navigate(["/"]);
          }, error => {
            this.showMsg.errMessage = 'We had a problem on our end.  Please try again.';
            this.router.navigate(["login"]); // User story: Give another change.
          });

      }, error => {
        console.error(error);
        this.showMsg.errMessage = 'We had a problem on our end.  Please try again.';
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

  showHidePassword() {
    this.showPassword = !this.showPassword;
  }
}
