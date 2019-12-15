drop database if exists boutique;

create database boutique;

use boutique;

create table users (
    username varchar(32) not null,
    email varchar(128) not null,
    password varchar(128) not null,
    gsecret VARCHAR(256),
    
    primary key (username)
);

insert into users(username, email, password, gsecret) values
	('fred', 'fred@gmail.com', sha2('fredfred', 256), 'JM2UUR2JKRFUKR2CJFEFKT2DKNHU4R2EJNKVGRCLIJFUKVJSKJIQ'),
	('dawnlum', 'dawnlum@hotmail.com', sha2('dawndawn', 256), null);

create table address (
    address_id int auto_increment,
    username varchar(32),
    add_type int not null, -- 1 = Billing, 2 = Shipping
    address1 varchar(256) not null,
    address2 varchar(256),
    city varchar(128),
    state varchar(128),
    postcode varchar(128),
    country varchar(128),
    postedDate date,

    primary key (address_id),
    constraint fk_username_1
        foreign key(username) references users(username)
);

insert into address (username, add_type, address1, address2, city, state, postcode, country, postedDate) values 
    ('fred', '1','abc street', '', 'Unknown City', 'Funny State', '123456', 'Singapore', '2019-12-07'),
    ('dawnlum', '1','36 Soo Chow Drive', '', 'Singapore', 'Singapore', '575543', 'Singapore', '2019-12-08');

create table customers (
    username varchar(32) not null,
    tel varchar(128) not null,
    gender varchar(1) not null,
    dob date not null,

    primary key (username)
);

insert into customers (username, tel, gender, dob) values 
    ('fred', '91234567', 'M', '1996-01-02'),
    ('dawnlum', '97775103', 'F', '1978-11-26');

create table products (
    prod_type int not null,
    -- 1 - dress
    -- 2 - shirt
    -- 3 - skirt_pants
    -- 4 - accessories
	prod_type_desc varchar(64),
    
    primary key (prod_type)
);

insert into products (prod_type, prod_type_desc) values
	(1, 'dress'),
	(2, 'shirt'),
    (3, 'skirt_pant'),
    (4, 'accessories');

create table product_details (
    prod_detail_id varchar(20) not null,		-- 'SK_00000001'
    prod_type int not null,						-- 1 - Dress
    prod_name varchar(256) not null,			-- Blacky Dress
    prod_desc varchar(1000),					-- Suitable for evening wear
    selling_price varchar(13) not null,		    -- 25.00
    img_path varchar(256),						-- 

    primary key (prod_detail_id),
    constraint fk_prod_type_1
        foreign key(prod_type) references products(prod_type)
);

insert into product_details (prod_detail_id, prod_type, prod_name, prod_desc, selling_price, img_path) values
	('SK_00000001', 1, 'Blacky Dress', 'Suitable for evening wear', '22.00', 'blacky_dress.jpg'),
	('SK_00000002', 1, 'Short Sleeve Wrap Dress', 'Causal Wear or suitable for office dress down wear', '18.50', 'short_sleeve_wrap_dress.jpg'),
	('SK_00000003', 1, 'Demin Dress', 'Causal Wear suitable for party or day out', '20.90', 'denim_dress.jpg'),
	('SK_00000004', 2, 'Spring Autumn Career', 'Long-sleeved Slim OL Shirt Blouse suitable for office or causal wear', '25.90', 'spring_autumn_career.jpg'),
    ('SK_00000005', 2, 'Korean Style Trendy Office Wear', 'Korean Style - Trendy Office Wear, Women Blouses Elegant Slim Casual Long Sleeve Confident', '29.90', 'korean_style_trendy_shirt.jpg'),
    ('SK_00000006', 3, 'Briena Tweed Midi Skirt', 'Midi length- Concealed back zip- Made of tweed- Lined with polyester', '30.00' , 'briena_tweed_midi_skirt.jpg'),
    ('SK_00000007', 3, 'Pleated Wide Leg Culottes', 'Polyester, Includes an elastic waistband, Pleating throughout, Relaxed fit on the body', '15.20' , 'pleated_wide_leg_culottes.jpg'),
	('SK_00000008', 4, 'Wedding Bridal Vintage Leaf Headband Headpiece Tiara Bride Hair Accessories', 'This fabulous and very elegant bridal hair Accessory is totally handmade in one copy, made with hight quality glass pearls. Approx. 34 cm (13.39 inches). The princess headband will decorate you elegant and you can change the shape as you want by changing the bead. Delicate wedding accessory will perfectly complement most wedding hairstyles. ', '7.90','leaf_headband.jpg');

create table product_attribute (
    prod_detail_id varchar(20) not null,
    color varchar(30),                  -- ['Blue', 'Grey', 'Green', 'Black'],    
    size varchar(20),                   -- ['XS', 'S', 'M', 'L', 'XL'],
    quantity int,

    primary key(prod_detail_id, color, size),
    constraint fk_prod_detail_id
        foreign key(prod_detail_id) references product_details(prod_detail_id)
);

insert into product_attribute (prod_detail_id, color, size, quantity) values 
    ('SK_00000001','Black','XS',50),
    ('SK_00000001','Black','S',50),
    ('SK_00000001','Black','M',50),
    ('SK_00000001','Black','L',50),
    ('SK_00000001','Black','XL',50),
    ('SK_00000002','Blue','XS',10),
    ('SK_00000002','Blue','S',10),
    ('SK_00000002','Blue','M',10),
    ('SK_00000002','Blue','L',10),
    ('SK_00000002','Blue','XL',10),
    ('SK_00000002','Grey','XS',20),
    ('SK_00000002','Grey','S',20),
    ('SK_00000002','Grey','M',20),
    ('SK_00000002','Grey','L',20),
    ('SK_00000002','Grey','XL',20),
    ('SK_00000002','Green','XS',8),
    ('SK_00000002','Green','S',8),
    ('SK_00000002','Green','M',8),
    ('SK_00000002','Green','L',8),
    ('SK_00000002','Green','XL',8),
    ('SK_00000003','Blue','XS',15),
    ('SK_00000003','Blue','S',15),
    ('SK_00000003','Blue','M',15),
    ('SK_00000003','Blue','L',15),
    ('SK_00000003','Blue','XL',15),
    ('SK_00000004','White','XS',10),
    ('SK_00000004','White','S',10),
    ('SK_00000004','White','M',10),
    ('SK_00000004','White','L',10),
    ('SK_00000004','White','XL',10),
    ('SK_00000004','Black','XS',22),
    ('SK_00000004','Black','S',22),
    ('SK_00000004','Black','M',22),
    ('SK_00000004','Black','L',22),
    ('SK_00000004','Black','XL',22),
    ('SK_00000005','Beige','XS',20),
    ('SK_00000005','Beige','S',20),
    ('SK_00000005','Beige','M',20),
    ('SK_00000005','Beige','L',20),
    ('SK_00000005','Beige','XL',20),
    ('SK_00000006','Cream','S',6),
    ('SK_00000006','Cream','M',7),
    ('SK_00000006','Cream','L',8),
    ('SK_00000006','Black','S',6),
    ('SK_00000006','Black','M',7),
    ('SK_00000006','Black','L',8),
    ('SK_00000007','Brown','S',8),
    ('SK_00000007','Brown','M',21),
    ('SK_00000007','Brown','L',10),
    ('SK_00000008','Silver','Standard Size',30);

create table orders (
    order_id varchar(20) not null,
    username varchar(32) not null,
    address_id int not null,
    postedDate date,

    primary key(order_id),
    constraint fk_username_3
        foreign key(username) references users(username),
    constraint fk_address_id_1
        foreign key(address_id) references address(address_id)
);


create table order_detail (
    order_id varchar(20) not null,
    prod_detail_id varchar(20) not null,
    color varchar(30),
    size varchar(20),
    unitprice varchar(13) not null,
    quantity int,
    price varchar(15) not null,

    primary key(order_id, prod_detail_id, size, color)
--     constraint fk_prod_detail_id_2
--         foreign key(prod_detail_id) references product_details(prod_detail_id),
--     constraint fk_prod_attribute_id
--         foreign key(prod_detail_id, size, color) references product_attribute(prod_detail_id, color, size)
);