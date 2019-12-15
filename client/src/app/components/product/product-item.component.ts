import { Component, OnInit } from '@angular/core';
import { AssessmentService } from '../../services/assessment.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Products } from '../../model';


@Component({
  selector: 'app-product-item',
  templateUrl: '../product/product-item.component.html',
  styleUrls: ['../product/product-item.component.css']
})
export class ProductItemComponent implements OnInit {

  prod_type
  products: Products;

  constructor(private assessSvc: AssessmentService, private router: Router, private activatedRoute :ActivatedRoute
    ) { }

  ngOnInit() {
    this.prod_type = this.activatedRoute.snapshot.params.prod_type;

    this.assessSvc.getProduct(this.prod_type)
      .then(result => {
        // console.info('return result from svc:', result)
        this.products = result;
      })
  }

  productdetail(prod_type_desc, product_detail_id) {
    // console.info('selected prod_type_desc & product_detail_id: ', prod_type_desc, ' & ' , product_detail_id);
    this.router.navigate(['product', prod_type_desc, product_detail_id])
  }
  

}
