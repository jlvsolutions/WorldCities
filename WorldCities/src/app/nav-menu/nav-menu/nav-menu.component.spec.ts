import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { NavMenuModule } from '../nav-menu.module';
import { NavMenuComponent } from './nav-menu.component';

import { AuthService } from '@app/_services';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('NavMenuComponent', () => {
  let component: NavMenuComponent;
  let fixture: ComponentFixture<NavMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    declarations: [
        NavMenuComponent
        //MatIcon,
        //MatToolbar
        //MatMenu
    ],
    imports: [RouterTestingModule,
        NavMenuModule],
    providers: [
        AuthService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
})
    .compileComponents();

    fixture = TestBed.createComponent(NavMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
