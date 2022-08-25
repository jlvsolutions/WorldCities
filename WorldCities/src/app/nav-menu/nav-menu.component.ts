import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.scss']
})
export class NavMenuComponent implements OnInit, OnDestroy {

  private destroySubject = new Subject();
  isLoggedIn: boolean = false;
  userName: string = "";

  constructor(private authService: AuthService, private router: Router) {

    this.authService.authStatus
      .pipe(takeUntil(this.destroySubject))
      .subscribe(result => {
        this.isLoggedIn = result;
      });

    this.authService.userName
      .pipe(takeUntil(this.destroySubject))
      .subscribe(result => {
        this.userName = result;
      });
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(["/"]);
  }

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isAuthenticated();
  }

  ngOnDestroy() {
    this.destroySubject.next(true);
    this.destroySubject.complete();
  }
}
