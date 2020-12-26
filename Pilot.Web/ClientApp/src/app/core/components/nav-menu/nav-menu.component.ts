import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../../auth/auth.service';
import { SystemIds } from '../../data/system.ids';

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.css']
})
export class NavMenuComponent implements OnInit {

  isExpanded = false;
  isLoggedIn$: Observable<boolean>;
  documentRootId = SystemIds.rootId;

  constructor(private authService: AuthService, private router: Router) {
  }

  ngOnInit(): void {
    this.isLoggedIn$ = this.authService.isLoggedIn;
  }

  collapse(): void {
    this.isExpanded = false;
  }

  toggle(): void {
    this.isExpanded = !this.isExpanded;
  }

  toggleOff(): void {
    this.isExpanded = false;
  }

  onLogout(event: Event): boolean {
    this.collapse();
    this.authService.logout();
    this.router.navigate(['/login']);
    return false;
  }
}
