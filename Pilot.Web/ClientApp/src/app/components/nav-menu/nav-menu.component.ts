import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { SystemIds } from 'src/app/core/data/system.ids';
import { AuthService } from 'src/app/auth/auth.service';
import { RepositoryService } from 'src/app/core/repository.service';

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.css']
})
export class NavMenuComponent implements OnInit {

  isExpanded = false;
  isLoggedIn$: Observable<boolean>;
  documentRootId = SystemIds.rootId;

  constructor(private authService: AuthService, private router: Router, private repository: RepositoryService) {
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
    this.repository.clear();
    this.router.navigate(['/login']);
    return false;
  }
}
