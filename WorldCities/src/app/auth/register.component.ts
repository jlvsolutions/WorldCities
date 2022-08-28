import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, Validators, AbstractControl, AsyncValidatorFn } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';


import { BaseFormComponent } from '../base-form.component';
import { AuthService } from './auth.service';
import { RegisterRequest } from './register-request';
import { RegisterResult } from './register-result';
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
      password: new FormControl('', Validators.required)
    });
  }

  onSubmit() {
    var registerRequest = <RegisterRequest>{};
    registerRequest.name = this.form.controls['name'].value;
    registerRequest.email = this.form.controls['email'].value;
    registerRequest.password = this.form.controls['password'].value;

    this.authService.register(registerRequest)
      .subscribe(result => {

        console.log(`Register result: ${result.message}`);
        this.registerResult = result;
        if (result.success) {
          this.router.navigate(["login"]); // TODO:  Should we just navigate to Login?
        }
      }, error => {
        console.log(error);
        switch (error.status) {
          case 400:
          case 401:
          case 500:
            this.registerResult = error.error;
            break;
        }

      });
  }

  isDupeEmail(): AsyncValidatorFn {

    console.log("RegisterComponent: isDupeEmail()");

    return (control: AbstractControl): Observable<{ [key: string]: any } | null> => {

      var user = <User>{};
      user.email = this.form.controls['email'].value;

      return this.authService.isDupeEmail(user)
        .pipe(map(result => {

          console.log("authServie.isDupeEmail() result:  " + result);
          return (result ? { isDupeEmail: true } : null);

        }));

    }
  }

}
