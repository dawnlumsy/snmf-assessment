import { Component, OnInit } from '@angular/core';
import { OrderDatabase } from '../../order.db'

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.css']
})
export class OrderDetailComponent implements OnInit {
  
  constructor(private orderDB: OrderDatabase) { }

  ngOnInit() {
    // Clear Dexie Local storage after order is submitted
    this.orderDB.clear();
  }


}
