import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, take, takeUntil } from 'rxjs';
import { AuthService } from '@app/_services/auth.service';

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
  displayName: string = "";
  isAdministrator: boolean = false;

  constructor(private authService: AuthService, private router: Router) {

    this.authService.authStatus
      .pipe(takeUntil(this.destroySubject))
      .subscribe(result => {
        this.isLoggedIn = result;
      });

    this.authService.displayName
      .pipe(takeUntil(this.destroySubject))
      .subscribe(result => {
        this.displayName = result;
      });

    this.authService.administrator
      .pipe(takeUntil(this.destroySubject))
      .subscribe(result => {
        this.isAdministrator = result;
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
  }

  ngOnDestroy() {
    this.destroySubject.next(true);
    this.destroySubject.complete();
  }
}
