import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGaurd implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {
  }

  // extend the canActivate interface
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): 
    Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    if (route.component?.name == 'UsersComponent') {
      if (this.authService.isAdministrator()) {
        return true;
      }
      else {
        this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
        return false;
      }
    }

    if (this.authService.isAuthenticated()) {
      return true;
    }

    this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
}
