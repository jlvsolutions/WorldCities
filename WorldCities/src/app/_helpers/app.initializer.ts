import { AuthService } from '@app/_services';
//import { resolve } from 'path';

export function appInitializer(authservice: AuthService) {
  return () => new Promise<string>(resolve => {
    // attempt to refresh token on app start up to auto authenticate
    console.log("appInitializer:  Sending refreshToken request.");
    authservice.refreshToken()
      .subscribe(user => {
        console.log(`appInitializer: Success for ${user.email}`); 
      }, error =>
        console.log(`appInitializer: refreshToken result = ${error.statusText}, ${error.error}`))
      .add(resolve("appInitializer resolve."));
  });
}
