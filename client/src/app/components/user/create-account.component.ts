import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { Account, AddressDetail } from '../../model';
import { AssessmentService } from '../../services/assessment.service';
import { Router } from '@angular/router';
// import custom validator to validate that password and confirm password fields match
import { MustMatch } from '../helpers/must-match.validator';

@Component({
  selector: 'app-create-account',
  templateUrl: '../user/create-account.component.html',
  styleUrls: ['../user/create-account.component.css']
})
export class CreateAccountComponent implements OnInit {

  formGroup: FormGroup;
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  yearDate = new Date();
  hide1 = true;
  hide2 = true;
  failure: boolean = false;
  
  /** Returns a FormArray with the name 'formArray'. */
  get formArray(): AbstractControl | null { return this.formGroup.get('formArray'); }

  constructor(private fb: FormBuilder, private accessSvc: AssessmentService, private router: Router) {}

  ngOnInit() {
    this.firstFormGroup = this.createAcct()
    this.secondFormGroup = this.createAddress() 

    this.formGroup = this.fb.group({
      formArray: this.fb.array([
        this.firstFormGroup,
        this.secondFormGroup 
      ])
    });
  }

  getUsernameValid(){
    // console.info(this.formArray.value[0]['username']);
    this.accessSvc.getUsernameValid(this.formArray.value[0]['username'])
      .then(result => {
        if (result) {
          console.info('>> return result in Client', result);
          this.failure = false;
        }
        else
          this.failure = true;
      })
      .catch(
        error => {console.info(error)}
      )
  }

  submit(){
    const account: Account={
      username: this.formArray.value[0]['username'],
      email: this.formArray.value[0]['email'],
      password: this.formArray.value[0]['passwordConfirmCtrl'],
      tel: this.formArray.value[0]['tel'],
      gender: this.formArray.value[0]['gender'],
      dob: this.formArray.value[0]['dob'],
      address: this.formArray.value[1]
    }
    // console.info('>> Account details:', account);
    this.accessSvc.createAccount(account)
      .then(result => {
        // console.info('Account creation result:', result);
        // result return true
        if (result){
          this.formArray.reset();
          this.router.navigate(['/successful']);
        }
        else {
          this.formArray.reset();
          alert("Unable to create account! Please contact shop admin.");
          this.router.navigate(['/']);
        }
      })
      .catch(error => console.error('error: ', error));
  }

  private createAddress(): FormGroup{
    return (
      this.fb.group ({
        address1: ['', [Validators.required, Validators.maxLength(256)]],
        address2: ['', Validators.maxLength(256)],
        city: ['', [Validators.required, Validators.maxLength(128)]],
        state: ['', [Validators.required, Validators.maxLength(128)]],
        postcode: ['', [Validators.required, Validators.maxLength(128)]],
        country: ['Singapore', [Validators.required, Validators.maxLength(128)]]
      })
    )
  }

  private createAcct(): FormGroup{
    return (
      this.fb.group ({
        username: ['', [Validators.required, Validators.maxLength(32)]], //>> Need to enhance to have API check on the username if already exist on DB
        email: ['', [Validators.required, Validators.email, Validators.maxLength(128)]],
        passwordCtrl: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(128)]],
        passwordConfirmCtrl: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(128)]],// >> Need to enhance password confirm validation
        tel: ['', [Validators.required, Validators.maxLength(128)]],
        gender: ['', Validators.required],
        dob: ['', Validators.required]
     }, 
     {  
       validator: MustMatch('passwordCtrl', 'passwordConfirmCtrl')
     })
    )
  }
  

}
