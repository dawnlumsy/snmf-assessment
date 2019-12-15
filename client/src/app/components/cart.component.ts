import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
// import { AssessmentService } from '../services/assessment.service';
import { AuthenticationService } from '../services/authentication.service';
import { Order, LineItem } from '../model';
import { OrderDatabase } from '../order.db';
import * as uuid from 'uuid';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {

  cartList: Array<LineItem> = [];
  
  constructor(private orderDb: OrderDatabase//, private assessSvc: AssessmentService
    ,private authSvc: AuthenticationService) { }

  ngOnInit() {
    //console.info('is authenticated: ', this.authSvc.isAuthenticated());

    this.orderDb.getAll()
      .then((lineItems: Array<LineItem>) => {
        this.cartList = lineItems;
      });
  }

  onDeleteItem(prod_detail_id){
    this.orderDb.remove(prod_detail_id)
      .then(()=> {
        this.cartList = this.cartList.filter((lineItems) => lineItems.prod_detail_id !== prod_detail_id);
      })
  }

}
