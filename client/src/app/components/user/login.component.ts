import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthenticationService } from '../../services/authentication.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: '../user/login.component.html',
  styleUrls: ['../user/login.component.css']
})
export class LoginComponent implements OnInit {

  failure: boolean = false;
  constructor(private authSvc: AuthenticationService, private router: Router) { }

  ngOnInit() {
  }

  performLogin(form: NgForm){
    //console.info('> ', form.value);
    this.authSvc.authenticate(form.value['username'], form.value['password'])//, form.value['otp'])
    .then(result => {
      if (result) {
        //console.info('authenticated result:', result);
        this.router.navigate(['/account'])
      }
      else
        this.failure = true;
    })
  }
}
