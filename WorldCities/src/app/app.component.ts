import { Component, OnInit } from '@angular/core';
import { AuthService } from '@app/_services/auth.service';
import { ConnectionService } from 'angular-connection-service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'WorldCities';

  hasNetworkConnection: boolean = true;
  hasInternetAccess: boolean = true;

  constructor(
    private authService: AuthService,
    private connectionService: ConnectionService) {
    this.connectionService.monitor().subscribe((currentState: any) => {
      this.hasNetworkConnection = currentState.hasNetworkConnection;
      this.hasInternetAccess = currentState.hasInternetAccess;
    });
  }

  ngOnInit(): void {
    this.authService.init();
  }

  public isOnline() {
    return this.hasNetworkConnection && this.hasInternetAccess;
  }
}
