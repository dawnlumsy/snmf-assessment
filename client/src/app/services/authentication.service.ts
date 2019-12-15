import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AddressDetail, Order } from '../model';
import { OrderDatabase } from '../order.db'

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService implements CanActivate {

  private authenticated = false;
  private token: string = '';
  private username: string = '';

  constructor(private http: HttpClient, private router: Router, private orderDB: OrderDatabase) { }

  isAuthenticated(): boolean{
    return (this.authenticated)
  }

  getUsername() {
    return this.username;
  }

  logout(){
    this.authenticated = false;
    this.token = '';
    // Clear Dexie Local storage after order is submitted
    this.orderDB.clear();
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (!this.authenticated)
      this.router.navigate(['/login']);
    return(this.authenticated)
  }

  getCustomerAddress(): Promise<AddressDetail>{
    const headers = new HttpHeaders()
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${this.token}`);
    return(
      this.http.get<AddressDetail>('/api/getCustomerAddress', { headers }).toPromise()
    )
  }

  getCustomerInfo(): Promise<any>{
    const headers = new HttpHeaders()
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${this.token}`);
    return(
      this.http.get<any>('/api/getCustomerInfo', { headers }).toPromise()
    )
  }

  updateTel(newTel, oldTel): Promise<any>{
    const headers = new HttpHeaders()
    .set('Accept', 'application/json')
    .set('Authorization', `Bearer ${this.token}`);
    const params = new HttpParams()
      .set('newTel', newTel)
      .set('oldTel', oldTel)
    return(
      this.http.put('/api/updateTel', params, { headers }).toPromise()
        .then((result: any) => {
          // console.info('result:', result);
          return true
        })
        .catch(()=>{
          return false
        })
    )
  }
  
  createOrder(order: Order): Promise<any>{
    const headers = new HttpHeaders()
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${this.token}`);
    return(
      this.http.post('/api/createOrder', order, { headers }).toPromise()
        .then((result: any) => {
          console.info('result:', result);
          return true
        })
        .catch(()=>{
          return false
        })
    )
  }

  //authenticate(username:string, password: string, otp: string): Promise<boolean>{
  authenticate(username:string, password: string): Promise<boolean>{
    const params = new HttpParams()
      .set('username', username)
      .set('password', password)
      //.set('otp', otp)
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/x-www-form-urlencoded')

    return (
      this.http.post('/api/authenticate', params.toString(), { headers })
        .toPromise()
        // .then(()=> true)
        // .catch(() => false)
        .then((result: any) => {
          //console.info('> result:', result);
          this.authenticated = true;
          this.token =  result.access_token;
          this.username = result.username;
          return true
        })
        .catch(() => {
          this.authenticated = false;
          this.token =  ''
          this.username = ''
          return false
        })
    )
  }

}
