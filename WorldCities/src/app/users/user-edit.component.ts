import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { FormGroup, FormControl, FormBuilder, Validators, AbstractControl, AsyncValidatorFn, ValidatorFn, FormControlOptions } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

import { environment } from './../../environments/environment';
import { User } from './../auth/user';
import { BaseFormComponent } from '../base-form.component';
import { UserService } from './user.service';
import { AuthService } from './../auth/auth.service';
import { validateHorizontalPosition } from '@angular/cdk/overlay';
import { MatCheckboxChange } from '@angular/material/checkbox';

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.scss']
})
export class UserEditComponent extends BaseFormComponent implements OnInit {

  /** The view title
   */
  title?: string;

  /** The user object to edit or create
   */
  user?: User;

  /** The user object id, as fetched from the active route:
   * It's NULL when we're adding a new user,
   * and not NULL when er're editing an existing one.
   */
  id: string | null = null;

  /** The roles observable for the select (using async pipe).
   * (Another technique to prevent memory leaks)
   */
  roles?: Observable<string[]>;

  setPasswordChecked?: boolean = false;
  setPasswordCheckboxHidden?: string; // shows if undefined.  hides if empty string or 'hidden'

  /** One method of unsubscribing to prevent memory leaks.
   */
  private destroySubject = new Subject();

  constructor(
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private authService: AuthService) {

    super();
  }

  ngOnInit(): void {
    this.form = new FormGroup({
      name: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email], this.isDupeEmail()),
      emailConfirmed: new FormControl('', Validators.required),
      lockoutEnabled: new FormControl('', Validators.required),
      setPassword: new FormControl(),
      password: new FormControl({ value: "", disabled: true }),
      roles: new FormControl('', Validators.required)

    });

    this.loadData();
  }

  onCheckChanged(event: MatCheckboxChange) {
    console.log("onCheckChanged():  Checkbox checked:" + event.checked);
    this.setPasswordChecked = event.checked;
    if (this.setPasswordChecked)
      this.form.get('password')?.enable()
    else
      this.form.get('password')?.disable();
  }

  loadData() {

    // Load the roles that can be associated with a user.
    this.loadRoles();

    // Retrieve the ID from the 'id' parameter.
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
    if (this.id) {
      // EDIT Mode
      this.setPasswordCheckboxHidden = "false";
      console.log("Loading user data for edit");

      // Get the user
      this.userService.get(this.id)

        .subscribe(result => {
          this.user = result;
          this.title = "Edit - " + this.user.name;
          console.log("Loaded data for user: " + this.user.email);

          // Update the form with the user values.
          this.form.patchValue(this.user);
        }, error => console.error(error));
    }
    else {
      // ADD Mode
      this.title = "Create a new user";
      this.setPasswordCheckboxHidden = "hidden";
      console.log("Preparing to add a new user.");

      // TODO:  Add logic to prep the form controls, i.e. setPasswordChecked and password.
      this.setPasswordChecked = true;
      this.form.controls['setPassword'].setValue(true);
      this.form.controls['setPassword'].disable();
      this.form.controls['password'].enable();

    }
  }

  loadRoles() {
    this.roles = this.userService.getRoles();
  }

  onSubmit() {
    var user = (this.id) ? this.user : <User>{};

    console.log("user-edit onSubmit: " + this.user?.name);

    if (user) {
      user.name = this.form.controls['name'].value;
      user.email = this.form.controls['email'].value;
      user.emailConfirmed = this.form.controls['emailConfirmed'].value.toString().toLowerCase() === 'true';
      user.lockoutEnabled = this.form.controls['lockoutEnabled'].value.toString().toLowerCase() === 'true';
      user.roles = this.form.controls['roles'].value.toString().split(",");
      user.newPassword = this.form.controls['password'].value;

      if (this.id) {
        // EDIT mode

        if (!this.setPasswordChecked)
          user.newPassword = '';

        this.userService.put(user)
          .subscribe(result => {

            console.log("User " + user!.name + " has been updated.");

            // go back to users view
            this.router.navigate(['/users']);
          }, error => console.error(error));
      }
      else {
        // ADD NEW mode
        this.userService.post(user)
          .subscribe(result => {

            console.log("User " + user?.name + " has been created.");

            // go back to cities view
            this.router.navigate(['/users']);
          }, error => console.error(error));
      }
    }
  }

  isDupeEmail(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<{ [key: string]: any } | null> => {

      var user = <User>{};
      user.id = this.id ?? '';
      user.email = this.form.controls['email'].value;

      return this.authService.isDupeEmail(user)
        .pipe(map(result => {

          console.log("authServie.isDupeEmail() result:  " + result);
          return (result ? { isDupeField: true } : null);
        }));
    }
  }

  /*
  isPasswordRequired(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {

      if (!(this.setPasswordChecked))
        return null;

      if (control.value == undefined || control.value == null || control.value == '')
        return { isPasswordRequired: true };

      return null;
    }
  }
  */
}
