import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.css']
})
export class LogoutComponent implements OnInit {

  constructor(private mySvc: AuthenticationService) { }

  ngOnInit() {
    this.mySvc.logout();
    // console.info('is authenticated: ', this.mySvc.isAuthenticated());
  }


}
