export interface AddressDetail {
    address_id?: number;
    add_type?: number;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
}

export interface Account {
    username: string;
    email: string;
    password: string;
    tel: string;
    gender: string;
    dob: Date;
    address: AddressDetail[];
}

export interface Products {
    prod_type_desc: string;
    prod_detail_id: string;
    prod_type: number;
    prod_name: string;
    prod_desc: string;
    selling_price: number;
    img_path: string;  
}

export interface LineItem {
    prod_detail_id: string;
    description: string;
    color: string;
    size: string;
    unitprice: string;
    quantity: number;
    price: string;
  }

  export interface OrderDetail {
      order_id: string;
      prod_detail_id: string;
      color: string;
      size: string;
      unitprice: string;
      quantity: number;
      price: string;
  }
  
  export interface Order {
    order_id: string;
    username: string;
    lineItems: LineItem[];
    totalAmt: string;
    address: AddressDetail[];
  }
  