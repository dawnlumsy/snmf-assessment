import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MainComponent } from './components/main.component';
import { CreateAccountComponent } from './components/user/create-account.component';
import { CreateAcctSuccessComponent } from './components/user/create-acct-success.component';
import { LoginComponent } from './components/user/login.component';
import { LogoutComponent } from './components/user/logout.component';
import { AccountComponent } from './components/user/account.component';
import { ProductComponent } from './components/product/product.component';
import { ContactUsComponent } from './components/contact-us.component';
import { CartComponent } from './components/cart.component';
import { OrderDetailComponent } from './components/order/order-detail.component';

import { ProductItemComponent } from './components/product/product-item.component';
import { ProductDetailComponent } from './components/product/product-detail.component';

import { AuthenticationService } from './services/authentication.service';

const routes: Routes = [
  { path: '', component: MainComponent },
  { path: 'login', component: LoginComponent },
  { path: 'logout', component: LogoutComponent, canActivate: [AuthenticationService] },
  { path: 'create-account', component: CreateAccountComponent },
  { path: 'successful', component: CreateAcctSuccessComponent },
  { path: 'successfulOrder', component: OrderDetailComponent , canActivate: [AuthenticationService] },
  { path: 'account', component: AccountComponent , canActivate: [AuthenticationService] },
  { path: 'product', component: ProductComponent },
  { path: 'product/:prod_type', component: ProductItemComponent },
  { path: 'product/:prod_type/:product_detail_id', component: ProductDetailComponent },  
  { path: 'contact-us', component: ContactUsComponent },
  { path: 'cart', component: CartComponent, canActivate: [AuthenticationService] },
  { path: 'order', component: OrderDetailComponent },
  { path: '**', redirectTo: '/', pathMatch: 'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
