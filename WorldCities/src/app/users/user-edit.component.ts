import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { FormGroup, FormControl, FormBuilder, Validators, AbstractControl, AsyncValidatorFn, ValidatorFn, FormArray } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

import { environment } from '@environments/environment';
import { User } from '@app/_models';
import { BaseFormComponent } from '@app/base-form.component';
import { ShowMessageComponent } from '@app/show-message/show-message.component';
import { UserService } from '@app/_services/user.service';
import { AuthService } from '@app/_services/auth.service';
import { validateHorizontalPosition } from '@angular/cdk/overlay';
import { MatCheckbox, MatCheckboxChange } from '@angular/material/checkbox';

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.scss']
})
export class UserEditComponent
  extends BaseFormComponent implements OnInit {

  /** The view title */
  title?: string;
  showPassword: boolean = false;

  @ViewChild(ShowMessageComponent) show!: ShowMessageComponent;

  /** The user object to edit or create */
  user?: User;

  /** The user object id, as fetched from the active route:
   * It's NULL when we're adding a new user,
   * and not NULL when editing an existing one.
   */
  id: string | null = null;

  /** If editing, contians the original email of the user
   * being edited, null otherwise.
   */
  origEmail: string | null = null;

  /** The roles array */
  roles: string[] = [];

  setPasswordChecked?: boolean = false;
  setPasswordCheckboxHidden?: string; // shows if undefined.  hides if empty string or 'hidden'

  /** One method of unsubscribing to prevent memory leaks. */
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
    console.log("ngOnInit(): Creating new FormGroup()");
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email], this.isDupeEmail()],
      emailConfirmed: ['', Validators.required],
      lockoutEnabled: ['', Validators.required],
      setPassword: [''],
      password: [{ value: '', disabled: true }],
      roles: ['', Validators.required]
    });
    console.log("Ctor():  Calling loadData()...")
    this.loadData();
    console.log("Ctor():  Calling loadData() returned.")

  }

  onSetPasswordCbChanged(event: MatCheckboxChange) {
    console.log("onCheckChanged():  Checkbox checked:" + event.checked);
    this.setPasswordChecked = event.checked;
    if (this.setPasswordChecked)
      this.form.get('password')?.enable()
    else
      this.form.get('password')?.disable();
  }

  onRoleCbChanged(event: MatCheckboxChange, role: string) {
    console.log("onRoleCbClicked():  Checkbox checked: " + role + " Value: " + event.checked);

    // Remove from users' roles
    if (this.user?.roles.includes(role) && !event.checked) {
      const index = this.user?.roles.indexOf(role);
      if (index !== -1) {
        this.user?.roles.splice(index, 1);
        this.form.controls['roles'].setValue(this.user?.roles);
        return;
      }
    }

    // Add to users' roles
    if (event.checked && !this.user?.roles.includes(role)) {
      this.user?.roles.push(role);
        this.form.controls['roles'].setValue(this.user?.roles);
    }
  }

  onSubmit() {
    var user = (this.id) ? this.user : <User>{};

    console.log(`user-edit onSubmit: User Name: ${this.user?.name}, Email: ${this.user?.email}`);
    this.show.setMessages(true, "Updating...");

    if (user) {
      user.name = this.form.controls['name'].value;
      user.email = this.form.controls['email'].value;
      user.emailConfirmed = this.form.controls['emailConfirmed'].value;
      user.lockoutEnabled = this.form.controls['lockoutEnabled'].value;
      user.roles = this.form.controls['roles'].value.toString().split(",");
      user.newPassword = this.form.controls['password'].value;

      if (this.id) {

        // EDIT mode
        if (!this.setPasswordChecked)
          user.newPassword = '';

        this.userService.put(user)
          .subscribe(result => {

            console.log("User " + user!.name + " has been updated.");
            this.show.setMessages(true, `User Name: ${result.name}, Email: ${user?.email} has been updated.`);

            // go back to users view
            this.router.navigate(['/users']);
          }, error => {
            console.error(error);
            this.show.setMessages(false, `Status code: ${error.status}, Message: ${error.statusText}`);
          });
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


  loadData() {

    console.log("loadData()")
    // Retrieve the ID from the 'id' parameter.
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
    if (this.id) {
      // EDIT Mode
      this.setPasswordCheckboxHidden = "false";
      console.log("Loading user data for edit");

      // Get the user data
      this.userService.get(this.id)

        .subscribe(result => {
          this.user = result;
          this.origEmail = this.user.email;
          this.title = "Edit - " + this.user.name;
          console.log("Loaded data for user: " + this.user.email);

          // Update the form with the user values.
          this.form.patchValue(this.user);
          this.origEmail = this.user.email;

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
      // Set the default User Role
      this.user = <User>{
        id: '', name: '', email: '', emailConfirmed: true,
        lockoutEnabled: false, newPassword: '', roles: ['RegisteredUser'],
        jwtToken: ''
      };
      this.form.patchValue(this.user);

    }

    // Load the roles that can be associated with a user.
    this.loadAllRoles();
  }

  /**
   * Loads all current user roles from the database
   * via http request
   */
  loadAllRoles() {
    console.log("loadAllRoles(): Retrieving user roles...");
    this.userService.getRoles()
      .subscribe(result => {
        console.log(`loadAllRoles(): Retrieved ${result.length} roles.`);
        console.log(`loadAllRoles(): Adding FormControls from result.  Length=${result.length}`);

        result.forEach(element => {
          var cbName = element + "checkBox";
          //console.log(`loadAllRoles(): result.forEach: ${cbName}`);
          this.form.addControl(`${cbName}`, new FormControl(cbName));
          this.form.controls[cbName].setValue(this.user?.roles.includes(element));
        });

        console.log('loadAllRoles(): Setting this.roles to result.');
        this.roles = result;
      }, error => console.error(error));
  }

  /** Validate that the email field is not already in use. */
  isDupeEmail(): AsyncValidatorFn {
    console.log("UserEditComponent: isDupeEmail()");
    return (control: AbstractControl): Observable<{ [key: string]: any } | null> => {

      var testEmail = control.value.toString();

      return this.authService.isDupeEmail(testEmail)
        .pipe(map(result => {

          console.log("authServie.isDupeEmail() result:  " + result);
          return ((this.origEmail !== testEmail) && result ? { isDupeField: true } : null);
        }));
    }
  }

  showHidePassword() {
    this.showPassword = !this.showPassword;
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
