import { Component, OnInit } from '@angular/core';
import { AuthService } from '@app/_services/auth.service';
import { ConnectionService } from 'angular-connection-service';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { filter, map } from 'rxjs';

import { User } from '@app/_models';

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
    private connectionService: ConnectionService,
    private activatedRoute: ActivatedRoute,
    private titleService: Title,
    private router: Router  ) {

    this.connectionService.monitor().subscribe((currentState: any) => {
      this.hasNetworkConnection = currentState.hasNetworkConnection;
      this.hasInternetAccess = currentState.hasInternetAccess;
    });
  }

  ngOnInit(): void {
    this.setPageTitle();
  }

  public isOnline() {
    return this.hasNetworkConnection && this.hasInternetAccess;
  }

  setPageTitle(): void {
    const defaultPageTitle = 'WorldCities';
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => {
        let child = this.activatedRoute.firstChild;

        if (!child)
          return this.activatedRoute.snapshot.data['title'] || defaultPageTitle;

        while (child.firstChild)
          child = child.firstChild;

        if (child.snapshot.data['title'])
          return child.snapshot.data['title'];
      })
    ).subscribe((title: string) => this.titleService.setTitle('WorldCities | ' + title));
  }
}
