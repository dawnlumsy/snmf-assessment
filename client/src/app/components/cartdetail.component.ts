import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgForm } from '@angular/forms';
import { AssessmentService } from '../services/assessment.service';
import { AuthenticationService } from '../services/authentication.service';
import { Router } from '@angular/router';
import { Order, LineItem, AddressDetail } from '../model';
import { OrderDatabase } from '../order.db';
import * as uuid from 'uuid';

@Component({
  selector: 'app-cartdetail',
  templateUrl: './cartdetail.component.html',
  styleUrls: ['./cartdetail.component.css']
})
export class CartdetailComponent implements OnInit {

  @Input() lineItems: Array<LineItem>
  @Output() deleteItem = new EventEmitter();

  formGroup: FormGroup;
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  thirdFormGroup: FormGroup;
  addressDetail: AddressDetail;
  username = '';

  constructor(private orderDb: OrderDatabase, private fb: FormBuilder, 
    private assessSvc: AssessmentService, private authSvc: AuthenticationService,
    private router: Router) { }

  ngOnInit() {
    console.info('is authenticated: ', this.authSvc.isAuthenticated());
    console.info('login user is : ', this.authSvc.getUsername());
    this.username = this.authSvc.getUsername()

    // Get lineItem from Local Storage
    this.orderDb.getAll()
      .then((lineItem: Array<LineItem>) => {
        this.lineItems = lineItem;
      })

    this.firstFormGroup = this.createOrderDetail()
    this.secondFormGroup = this.createAddress()
    this.thirdFormGroup = this.createPayment()

    this.formGroup = this.fb.group({
      formArray: this.fb.array([
        this.firstFormGroup,
        this.secondFormGroup
        //this.thirdFormGroup
      ])
    });
      
    // Pass in username that is login, 
    // return last shipping address to update into the Order Cart, if no Shipping address found, populate it with the Billing Address
    this.authSvc.getCustomerAddress()
    .then(result => {
      console.info('return from svc:', result)
      this.addressDetail = result;
      this.updateAddress();
    })
  }

  updateAddress() {
    this.secondFormGroup.patchValue({
      address1: this.addressDetail[0].address1,
      address2: this.addressDetail[0].address2,
      city: this.addressDetail[0].city,
      state: this.addressDetail[0].state,
      postcode: this.addressDetail[0].postcode,
      country: this.addressDetail[0].country
    });
  }
  
  onDelete(id) {
    this.deleteItem.emit(id);
  }

  totalAmt(): string {
    let amount = 0;
    this.lineItems.forEach(item => {
      amount += parseFloat(item.price);
    });

    return amount.toFixed(2);
  }

  processOrder(){
    // console.info(this.secondFormGroup.value);
    // console.info(this.firstFormGroup.value);

    const order: Order = {
      order_id: uuid().toString().substring(0,8),
      username: this.username,
      lineItems: this.lineItems,
      totalAmt: this.totalAmt(),
      address: this.secondFormGroup.value
    }
    console.info(">>order:", order);

    this.authSvc.createOrder(order)
      .then(result=>{
        console.info('Order creation result:', result);

        if (result){
          console.info('Enter true');
          this.secondFormGroup.reset();
          this.firstFormGroup.reset();
          this.router.navigate(['/successfulOrder']);
        }
        else {
          console.info('Enter false');
          this.secondFormGroup.reset();
          this.firstFormGroup.reset();
          alert("Unable to create order! Please contact shop admin.");
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

  private createOrderDetail(): FormGroup{
    return (
      this.fb.group ({
        orderId: ['', []]
     })
    )
  }

  private createPayment(): FormGroup{
    return (
      this.fb.group ({
        cardId: ['', [Validators.required]]
      })
    )
  }

}
