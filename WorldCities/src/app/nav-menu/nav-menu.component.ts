import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, take, takeUntil } from 'rxjs';
import { AuthService } from '@app/_services/auth.service';
import { LoginResult } from '@app/auth/login-result';

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.scss']
})
  /**
   * @title Navigation Menu Component
   */
export class NavMenuComponent implements OnInit, OnDestroy {

  private destroySubject = new Subject();

  isLoggedIn: boolean = false;
  isAdministrator: boolean = false;
  displayName: string = "";

  constructor(private authService: AuthService, private router: Router) {

    this.authService.user
      .pipe(takeUntil(this.destroySubject))
      .subscribe(user => {
        console.log(`NavMenuComponent: user = ${user?.user?.name}, ${user?.user?.email}`);
        this.isLoggedIn = authService.isAuthenticated() ;
        this.isAdministrator = authService.isAdministrator();
        this.displayName = user?.user?.name;
      });
  }

  onLogout(): void {
    console.log("Logging out...");
    this.authService.logout();
    this.router.navigate(["/"]);
  }

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isAuthenticated();
    this.isAdministrator = this.authService.isAdministrator();
    if (this.isLoggedIn)
      this.displayName = this.authService.userName();
  }

  ngOnDestroy() {
    this.destroySubject.next(true);
    this.destroySubject.complete();
  }
}
