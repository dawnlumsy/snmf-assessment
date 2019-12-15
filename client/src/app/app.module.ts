import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from './material.module';
import { FlexLayoutModule } from '@angular/flex-layout';

import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CarouselComponent } from './components/carousel.component';
import { MainComponent } from './components/main.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { CreateAccountComponent } from './components/user/create-account.component';
import { LoginComponent } from './components/user/login.component';
import { CreateAcctSuccessComponent } from './components/user/create-acct-success.component';

import { ProductComponent } from './components/product/product.component';
import { ContactUsComponent } from './components/contact-us.component';
import { ProductItemComponent } from './components/product/product-item.component';
import { ProductDetailComponent } from './components/product/product-detail.component';

import { CartComponent } from './components/cart.component';
import { CartdetailComponent } from './components/cartdetail.component';

import { AuthenticationService } from './services/authentication.service';
import { AssessmentService } from './services/assessment.service';


import { OrderDatabase } from './order.db';
import { AccountComponent } from './components/user/account.component';
import { EditaccountComponent } from './components/user/editaccount.component';
import { OrderDetailComponent } from './components/order/order-detail.component';
import { LogoutComponent } from './components/user/logout.component';



@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    CarouselComponent,
    CreateAccountComponent,
    LoginComponent,
    ProductComponent,
    ContactUsComponent,
    ProductItemComponent,
    CreateAcctSuccessComponent,
    ProductDetailComponent,
    CartComponent,
    CartdetailComponent,
    AccountComponent,
    EditaccountComponent,
    OrderDetailComponent,
    LogoutComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule, FormsModule, ReactiveFormsModule, BrowserAnimationsModule, MaterialModule, FlexLayoutModule,
    HttpClientModule, NgbModule
  ],
  providers: [AuthenticationService, AssessmentService, OrderDatabase],
  exports: [],
  bootstrap: [AppComponent]
})
export class AppModule { 

  
}
