import { Injectable } from "@angular/core";
import Dexie from 'dexie';
import { Order, LineItem } from './model';

@Injectable()
// Must extend Dexie
export class OrderDatabase extends Dexie {

  lineItems: Dexie.Table<LineItem, string>;

  constructor() {
    // call super with the database name
    super('eshop');
    // Create the collection
    this.version(1).stores({
      //indexing 2 fields
      lineItems: 'prod_detail_id,color,size',
    })
    this.lineItems = this.table('lineItems');
  }
  
  getAll() {
    return this.lineItems.toArray();
  }

  add(data) {
    return this.lineItems.add(data);
  }

  update(id, data) {
    return this.lineItems.update(id, data);
  }
  
  remove(id){
    return this.lineItems.delete(id);
  }

  getValue() {
    return this.lineItems.each;
  }

  clear(){
    return this.lineItems.clear();
  }

  // delTable(){
  //   return Dexie.delete('eshop');
  // }
  
}
