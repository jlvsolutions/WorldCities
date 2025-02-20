import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, take, takeUntil } from 'rxjs';
import { AuthService } from '@app/_services';

@Component({
    selector: 'app-nav-menu',
    templateUrl: './nav-menu.component.html',
    styleUrls: ['./nav-menu.component.scss'],
    standalone: false
})
export class NavMenuComponent implements OnInit, OnDestroy {

  private destroySubject = new Subject();

  isLoggedIn: boolean = false;
  isAdministrator: boolean = false;
  displayName: string = "";

  constructor(private authService: AuthService, private router: Router) {

    this.authService.user
      .pipe(takeUntil(this.destroySubject))
      .subscribe(user => {
          this.isLoggedIn = authService.isAuthenticated();
          this.isAdministrator = authService.isAdministrator();
          this.displayName = user?.name;
          console.log(`NavMenuComponent: LoggedIn ${this.isLoggedIn}, Administrator ${this.isAdministrator}, Display Name ${this.displayName}`);
      });
  }

  onLogout(): void {
    console.log("NavMenu:  Logging out...");
    this.authService.logout();
  }

  onLogin(): void {
    console.log("NavMenu:  Logging in...");
    this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
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
