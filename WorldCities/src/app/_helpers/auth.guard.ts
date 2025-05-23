import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '@app/_services';

/** Ensures user is registered and logged in. */
@Injectable({
  providedIn: 'root'
})
export class AuthGaurd  {

  constructor(private authService: AuthService, private router: Router) {
  }

  // Extend the canActivate interface
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): 
    Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const user = this.authService.userValue;
    console.log(`AuthGaurd user ${user}`);
    if (user)
      // Logged in
      return true;
    else {
      // Not logged in.  Redirect to login page.
      this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }
  }
}
