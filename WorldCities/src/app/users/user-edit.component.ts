import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { FormGroup, FormControl, FormBuilder, Validators, AbstractControl, AsyncValidatorFn, AsyncValidator } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

import { environment } from './../../environments/environment';
import { User } from './../auth/user';
import { BaseFormComponent } from '../base-form.component';
import { UserService } from './user.service';

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

  /** One method of unsubscribing to prevent memory leaks.
   */
  private destroySubject = new Subject();

  trueFalseValues: string[] = ["True", "False"];

  constructor(
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private userService: UserService) {

    super();
  }

  ngOnInit(): void {
    this.form = new FormGroup({
      name: new FormControl('', Validators.required),
      email: new FormControl('', Validators.required, ),
      emailConfirmed: new FormControl('', Validators.required),
      lockoutEnabled: new FormControl('', Validators.required),
      roles: new FormControl('', Validators.required)

    });

    this.loadData();
  }

  loadData() {

    // Load the roles that can be associated with a user.
    this.loadRoles();

    // Retrieve the ID from the 'id' parameter.
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
    if (this.id) {
      // EDIT Mode
      console.log("Loading user data for edit");

      // Get the user
      this.userService.get(this.id)

        .subscribe(result => {
          this.user = result;
          this.title = "Edit - " + this.user.name;

          // Update the form with the user values.
          this.form.patchValue(this.user);
        }, error => console.error(error));
    }
    else {
      // ADD Mode
      this.title = "Create a new user";
      console.log("Preparing to add a new user.");
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
      user.roles = this.form.controls['roles'].value.toString().split(",");
      user.emailConfirmed = this.form.controls['emailConfirmed'].value;
      user.lockoutEnabled = this.form.controls['lockoutEnabled'].value;

      if (this.id) {
        // EDIT mode
        this.userService
          .put(user)
          .subscribe(result => {

            console.log("User " + user!.name + " has been updated.");

            // go back to users view
            this.router.navigate(['/users']);
          }, error => console.error(error));
      }
      else {
        // ADD NEW mode
        this.userService
          .post(user)
          .subscribe(result => {

            console.log("User " + result.name + " has been created.");

            // go back to cities view
            this.router.navigate(['/users']);
          }, error => console.error(error));
      }
    }
  }

  isDupeEmail(emailValue: string): AsyncValidatorFn {
    return (control: AbstractControl): Observable<{ [key: string]: any } | null> => {

      return this.userService.isDupeEmailValue(emailValue)
        .pipe(map(result => {
          return (result ? { isDupeField: true } : null);
        }));
    }
  }

}
