import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '@app/_services';

/** Ensures user is registered as an administrator and logged in. */
@Injectable({
  providedIn: 'root'
})
export class AdminAuthGaurd implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {
  }

  // extend the canActivate interface
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot):
    Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    if (this.authService.isAdministrator()) {
      return true;
    }

    this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
}
