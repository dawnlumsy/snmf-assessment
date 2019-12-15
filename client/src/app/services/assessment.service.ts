import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Account, Products, AddressDetail } from '../model';

@Injectable({
  providedIn: 'root'
})
export class AssessmentService {

  constructor(private http: HttpClient) { }

  createAccount(account: Account): Promise<any>{
    // console.info("Enter Svc createAccount > Account: ", account);
    // console.info(account.address['address1'].values);
    // console.info(account.address['address1']);
    const params = new HttpParams()
      .set('username', account.username)
      .set('email', account.email)
      .set('password', account.password)
      .set('tel', account.tel)
      .set('gender', account.gender)
      .set('dob', account.dob.toString())
      .set('add_type', '1') // Billing Address
      .set('address1', account.address['address1'])
      .set('address2', account.address['address2'])
      .set('city', account.address['city'])
      .set('state', account.address['state'])
      .set('postcode', account.address['postcode'])
      .set('country', account.address['country'])
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/x-www-form-urlencoded')
    return(
      this.http.post('/api/createAccount', params.toString(), { headers })
        .toPromise()
        .then((result: any) => {
          // console.info('result:', result);
          return true
        })
        .catch(()=>{
          return false
        })
    )
  }

  getProduct(product_type: String): Promise<Products>{
    // console.info('Enter into Svc getProduct: ', product_type );
    return (
      this.http.get<Products>('/api/product/'+product_type).toPromise()
    )
  }

  getProductDetail(prod_type: String, product_detail_id: String): Promise<any>{
    // console.info('Enter into Svc getProductDetail: ', prod_type , ' & ' , product_detail_id );
    return (
      this.http.get<any>('/api/product/'+ prod_type + '/'+ product_detail_id).toPromise()
    )
  }

  getProductDetailByColor(prod_type: String, product_detail_id: String, color: String): Promise<any>{
    // console.info('Enter into Svc getProductDetailByColor: ', prod_type , ' & ' , product_detail_id , ' & ' , color);
    return (
      this.http.get<any>('/api/product/'+ prod_type + '/'+ product_detail_id + '/' + color).toPromise()
    )
  }

  getUsernameValid(username): Promise<any>{
    console.info('Username:', username);
    const params = new HttpParams()
      .set('username', username)
    return(
      this.http.get<any>('/api/getUsernameValid', {params}).toPromise()
        .then(()=> true)
        .catch(() => false)
    )
  }
}
