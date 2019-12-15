import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { AuthenticationService } from '../../services/authentication.service';


@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent implements OnInit {

  username = '';
  firstFormGroup: FormGroup;
  yearDate = new Date();
  custInfo;
  constructor(private fb: FormBuilder, private authSvc: AuthenticationService) { }

  ngOnInit() {
    console.info('is authenticated: ', this.authSvc.isAuthenticated());
    this.username = this.authSvc.getUsername();

    this.firstFormGroup = this.createAcct();

    this.authSvc.getCustomerInfo()
      .then(result => {
        this.custInfo = result[0];
        this.updateCust();
      })
  }

  updateCust() {
    this.firstFormGroup.patchValue({
      tel: this.custInfo.tel
      // dob: this.custInfo.dob
    });
  }

  updateDetail() {
    // console.info('>>> original tel #', this.custInfo.tel);
    // console.info('>>> New Tel#', this.firstFormGroup.value.tel);
    // console.info('>>> original Dob', this.custInfo.tel);
    // console.info('>>> New DOB ', this.firstFormGroup.value.dob)
    const newTel: string = this.firstFormGroup.value.tel
    const oldTel: string = this.custInfo.tel
    this.authSvc.updateTel(newTel, oldTel)
      .then(result => {
        console.info(result);
      })
  }
  

  private createAcct(): FormGroup{
    return (
      this.fb.group ({
        // username: ['', [Validators.required, Validators.maxLength(32)]], //>> Need to enhance to have API check on the username if already exist on DB
        // email: ['', [Validators.required, Validators.email, Validators.maxLength(128)]],
        // passwordCtrl: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(128)]],
        // passwordConfirmCtrl: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(128) ]],  // >> Need to enhance password confirm validation
        tel: ['', [Validators.required, Validators.maxLength(128)]]
        // gender: ['', Validators.required],
        // dob: ['', Validators.required]
     })
    )
  }

  // private createForm(): FormGroup {
  //   const accountForm = this.fb.group({
  //     formArray: this.fb.array([
  //       this.firstFormGroup
  //     ])
  //   });
  //   return (accountForm)
  // }

}
