import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, NgForm, FormGroupDirective } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AssessmentService } from '../../services/assessment.service';
import { map } from 'rxjs/operators';
import { Order, LineItem } from '../../model';
import { OrderDatabase } from '../../order.db';

@Component({
  selector: 'app-product-detail',
  templateUrl: '../product/product-detail.component.html',
  styleUrls: ['../product/product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {

  product_detail: any; img_path; prod_type; product_detail_id;
  prod_detail_id; prod_name; selling_price; prod_desc;
  distinctColor; selectedColor; stock
  //order: Order  = null;
  lineItem: LineItem; retrievelineItem;

  // ngForm: FormGroup;


  constructor(private router: Router, private activatedRoute: ActivatedRoute, 
    private accessSvc: AssessmentService, private orderDB: OrderDatabase, private fb: FormBuilder) { }

  ngOnInit() {
    this.prod_type = this.activatedRoute.snapshot.params.prod_type;
    this.product_detail_id = this.activatedRoute.snapshot.params.product_detail_id;

    // console.info('Inside product_detail Component, product_type: ',  this.prod_type);
    // console.info('Inside product_detail_id Component, product_detail_id: ',  this.product_detail_id);
    
    this.accessSvc.getProductDetail(this.prod_type,this.product_detail_id)
      .then(result => {
        // console.info('result in product_detail component: ', result);
        // console.info('product_type:', this.prod_type);
        this.product_detail = result;

        this.determineColor();
        this.prod_detail_id = result[0].prod_detail_id;
        this.img_path= result[0].img_path;
        this.prod_name = result[0].prod_name;
        this.selling_price = result[0].selling_price;
        this.prod_desc = result[0].prod_desc;
      })

    // this.ngForm = this.createGroup();
      
  }

  determineColor() {
    this.distinctColor = [...new Set(this.product_detail.map(a => a.color))];
    // console.info("this distinct color:", this.distinctColor);
  }

  determineSizeByColor(event){
    // console.log('event: ', event);
    // console.info('the selected color is_', event.target.value, '_');
    this.selectedColor = event.target.value;
    this.accessSvc.getProductDetailByColor(this.prod_type,this.prod_detail_id,this.selectedColor)
      .then(result => {
        this.stock = result;
        // console.info(result);
      })
  }

  submit(form: NgForm) {
    // push this into local storage
    // console.info("product_detail_id:", this.product_detail_id);
    // console.info("form values:", form.value);

    let itemPrice = (parseInt(form.value['quantity'])*parseFloat(this.selling_price)).toFixed(2);

    this.lineItem = {
      prod_detail_id: this.prod_detail_id + '_' + form.value.color + '_' + form.value.size,
      description: this.prod_name,
      color: form.value.color,
      size: form.value.size,
      unitprice: this.selling_price,
      quantity: parseInt(form.value['quantity']),
      price: itemPrice
    }

    console.info(">>lineItem:", this.lineItem);  

//    this.orderDB.lineItems.add(this.lineItem)
      this.orderDB.add(this.lineItem)
      .then(result => {
        console.info('result: ', result);
      })
      .catch(error => {
        console.error('Insert error: ', error);
      })   

  }

  back() {
    this.router.navigate(['/product/'+this.prod_type]);
  }

  /*private createGroup(): FormGroup {
    return (this.fb.group({
      color: this.fb.control('', [ Validators.required ]),
      size: this.fb.control('', [ Validators.required ]),
      quantity: this.fb.control('1', [ Validators.required ])
    }));
  };*/


}
