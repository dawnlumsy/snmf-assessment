require('dotenv').config();
const fs = require('fs');

const mysql = require('mysql');
const aws = require('aws-sdk');
const MongoClient = require('mongodb').MongoClient;

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const multer = require('multer');
const request = require('request-promise');

const jwt = require('jsonwebtoken');
const otplib = require('otplib');
const qrcode = require('qrcode');


const db = require('./dbutil');
const mkQuery = require('./mydbutil');
//const config = require('./config');

let config;

if (fs.existsSync(__dirname + '/config.js')) {
	config = require(__dirname + '/config');
	config.ssl = {
		 ca: fs.readFileSync(config.mysql.cacert)
	};
} else {
    console.info('using env');
	config = {
        sessionSecret: process.env.TOKEN_SECRET,
        mysql: {
            host: process.env.DB_HOST, 
            port: process.env.DB_PORT,	
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: 'boutique',
            connectionLimit: 4,
            ssl: {
                ca: process.env.DB_CA
            }
        },
        s3:{
            accessKey: process.env.S3_ACCESS_KEY,
            secret: process.env.S3_SECRET_KEY
        },
        mongodb: {
            url: process.env.MONGO_URL
        },
        gmap: {
            key: process.env.GOOGLE_KEY
        },
        STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY
    };
}


const stripe = require("stripe")(config.STRIPE_SECRET_KEY);


//const { loadConfig, testConnections } = require('./initdb');



const conns = {
    mysql: mysql.createPool(config.mysql),
    s3: new aws.S3({
        endpoint: new aws.Endpoint('sgp1.digitaloceanspaces.com'),
        accessKeyId: config.s3.accessKey,
        secretAccessKey: config.s3.secret
    }),
    mongodb: new MongoClient(config.mongodb.url, { useUnifiedTopology: true })
}

//const conns = loadConfig(config);
const pool = mysql.createPool(config.mysql);

const PORT = parseInt(process.argv[2] || process.env.APP_PORT || process.env.PORT) || 3000;
const fileUpload = multer({ dest: __dirname + '/tmp' });

// SQL Statments
const CREATE_USER = 'insert into users (username, email, password) values (?, ?, sha2(?, 256))';
const CREATE_ADDRESS = 'insert into address (username, add_type, address1, address2, city, state, postcode, country, postedDate) values (?, ?, ?, ?, ?, ?, ?, ?, ?)';
const CREATE_CUSTOMER = 'insert into customers (username, tel, dob, gender) values (?, ?, ?, ?)';
const CREATE_ORDER = 'insert into orders (order_id, username, address_id, postedDate) values (?, ?, ?, ?)';
const CREATE_ORDER_DETAIL = 'insert into order_detail (order_id, prod_detail_id, color, size, unitprice, quantity, price) values (?, ?, ?, ?, ?, ?, ?)';
const REDUCE_PROD_ATTRIBUTE_QTY = 'update product_attribute set quantity = quantity - ? where prod_detail_id = ? and color = ? and size = ?';
const FIND_USER = 'select count(*) as user_count from users where username = ? and password = sha2(?, 256)';
const FIND_USER_GSECRET = 'select gsecret from users where username = ?';
const GET_USER_DETAILS = 'select username, email from users where username = ?';
const GET_ALL_DIFF_PROD_TYPE = 'select p.prod_type_desc, pd.* from products p inner join product_details pd on p.prod_type = pd.prod_type and p.prod_type_desc = ?';
const GET_PROD_DETAIL =
    `select p.prod_type_desc, pd.*, pa.* from products p 
inner join product_details pd on p.prod_type = pd.prod_type
inner join product_attribute pa on pd.prod_detail_id = pa.prod_detail_id
and p.prod_type_desc = ?
and pd.prod_detail_id = ?
order by pa.color, size`;
const GET_PROD_DETAIL_COLOR =
    `select  pa.size, pa.quantity
from products p 
inner join product_details pd on p.prod_type = pd.prod_type
inner join product_attribute pa on pd.prod_detail_id = pa.prod_detail_id
and p.prod_type_desc = ?
and pd.prod_detail_id = ?
and pa.color = ?
and pa.quantity <>0
order by FIELD(pa.size, 'XS','S','M', 'L', 'XL')`;
//Get the address of a user that is login, return last shipping address to update into the Order Cart, if no Shipping address found, populate it with the Billing Address
const GET_CUSTOMER_BY_ADDRESS = `select address_id, add_type, address1, address2, city, state, postcode, country 
FROM address where username = ? order by FIELD(add_type, 2, 1), postedDate desc`;
const GETUSERNAMEVALID = 'select count(*) as user_count from users where username = ?'
const GETCUSTOMERINFO = `select u.username, u.email, c.tel, c.gender, c.dob 
from users u inner join customers c where c.username = u.username and u.username = ?`;
const UPDATE_TEL = 'update customers set tel = ? where username = ? and tel = ?';



const createUser = mkQuery(CREATE_USER, pool);
const createAddress = mkQuery(CREATE_ADDRESS, pool);
const createCustomer = mkQuery(CREATE_CUSTOMER, pool);
const createOrder = mkQuery(CREATE_ORDER, pool);
const createOrderDetails = mkQuery(CREATE_ORDER_DETAIL, pool);
const reduceProdAttributeQty = mkQuery(REDUCE_PROD_ATTRIBUTE_QTY, pool);
const findUser = mkQuery(FIND_USER, pool);
const findUserGSecret = mkQuery(FIND_USER_GSECRET, pool);
const getUserDetails = mkQuery(GET_USER_DETAILS, pool);
const getAllProdType = mkQuery(GET_ALL_DIFF_PROD_TYPE, pool);
const getProdDetail = mkQuery(GET_PROD_DETAIL, pool);
const getProdDetailColor = mkQuery(GET_PROD_DETAIL_COLOR, pool);
const getCustomerByAddress = mkQuery(GET_CUSTOMER_BY_ADDRESS, pool);
const getUsernameValid = mkQuery(GETUSERNAMEVALID, pool);
const getCustomerInfo = mkQuery(GETCUSTOMERINFO, pool);
const updateTel = mkQuery(UPDATE_TEL, pool);



const authenticateUser = (param) => {
    return (
        findUser(param)
            .then(result => (result.length && result[0].user_count > 0))
    )
};
/*const authenticateUserGSecret = (param) => {
    return (
        findUserGSecret (param[0])
            .then(result => (otplib.authenticator.generate(result[0].gsecret)==param[1]))
    )
};*/
const jwtToken = () => {

}

const passport = require('passport');
const LocalStrategry = require('passport-local').Strategy

passport.use(
    new LocalStrategry(
        {
            usernameField: 'username',
            passwordField: 'password'
        },
        (username, password, done) => {
            authenticateUser([username, password])
                .then(result => {
                    if (result)
                        return (done(null, username))
                    done(null, false);
                })
        }
    )
)

const app = express();
app.use(cors());
app.use(morgan('tiny'));
app.use(express.urlencoded({ extended: true }));

app.use(express.static(__dirname + '/public'));

app.use(passport.initialize())

app.get('/api/getUsernameValid',
    (req, resp) => {
        const username = req.query.username || '';
        //console.info('>> Server side username: ', username)
        getUsernameValid([username])
            .then(result => {
                console.info(result[0].user_count);
                if (result[0].user_count == 0) {
                    console.info("inside user-count =0 before response")
                    return resp.status(200).json({ message: 'user is valid for choosing' });
                }
                return resp.status(400).json({ message: 'username already exist' });
            }) // to validate user for new provisioning
            .catch(error => {
                return resp.status(400).json({ error });
            })
    }
)

app.post('/api/createAccount',
    (req, resp) => {
        const postedDate = new Date();
        params = [req.body.username, req.body.email, req.body.password]
        address_params = [
            req.body.username, parseInt(req.body.add_type), req.body.address1, req.body.address2,
            req.body.city, req.body.state, req.body.postcode, req.body.country, postedDate
        ]
        customer_params = [req.body.username, req.body.tel, (new Date(req.body.dob)), req.body.gender]

        // console.info('User params are:', params);
        // console.info('Address params are:', address_params);
        // console.info('Customer params are:', customer_params);

        const p1 = createUser(params)
        const p2 = createAddress(address_params)
        const p3 = createCustomer(customer_params)

        Promise.all([p1, p2, p3])
            .then(results => {
                const r0 = results[0];
                const r1 = results[1];
                const r2 = results[2]
                // console.info('>r0 = ', r0);
                // console.info('>r1 = ', r1);
                // console.info('>r2 = ', r2);
                return resp.status(200).json({ message: 'created ' });
            })
            .catch(error => {
                console.info(error);
                return resp.status(400).json({ error: `failure to create account ${error}` });
            })
    }
)

app.get('/api/getCustomerAddress', express.json(),
    (req, resp, next) => {
        const authorization = req.get('Authorization');
        console.info("inside createOrder:", authorization);
        if (!(authorization && authorization.startsWith('Bearer ')))
            return resp.status(403).json({ message: 'not authorized' })

        const tokenStr = authorization.substring('Bearer '.length)
        console.info("inside tokenStr:", tokenStr);
        try {
            console.info("inside try req.jwt:", jwt.verify(tokenStr, config.sessionSecret));
            req.jwt = jwt.verify(tokenStr, config.sessionSecret);
            next()
        } catch (e) {
            return resp.status(401).json({ message: 'invalid token' })
        }
    },
    (req, resp) => {
        getCustomerByAddress([req.jwt.sub])
            .then(result => {
                resp.status(200).json(result);
            })
            .catch(error => {
                resp.status(400).json({ error: `Unable to get address detail ${error}` });
            })
    }
)

app.get('/api/getCustomerInfo', express.json(),
    (req, resp, next) => {
        const authorization = req.get('Authorization');
        console.info("inside createOrder:", authorization);
        if (!(authorization && authorization.startsWith('Bearer ')))
            return resp.status(403).json({ message: 'not authorized' })

        const tokenStr = authorization.substring('Bearer '.length)
        console.info("inside tokenStr:", tokenStr);
        try {
            console.info("inside try req.jwt:", jwt.verify(tokenStr, config.sessionSecret));
            req.jwt = jwt.verify(tokenStr, config.sessionSecret);
            next()
        } catch (e) {
            return resp.status(401).json({ message: 'invalid token' })
        }
    },
    (req, resp) => {
        getCustomerInfo([req.jwt.sub])
            .then(result => {
                console.info(result);
                resp.status(200).json(result);
            })
            .catch(error => {
                resp.status(400).json({ error: `Unable to get customer info ${error}` });
            })
    }
)

app.put('/api/updateTel', express.json(),
    (req, resp, next) => {
        const authorization = req.get('Authorization');
        console.info("inside createOrder:", authorization);
        if (!(authorization && authorization.startsWith('Bearer ')))
            return resp.status(403).json({ message: 'not authorized' })

        const tokenStr = authorization.substring('Bearer '.length)
        console.info("inside tokenStr:", tokenStr);
        try {
            console.info("inside try req.jwt:", jwt.verify(tokenStr, config.sessionSecret));
            req.jwt = jwt.verify(tokenStr, config.sessionSecret);
            next()
        } catch (e) {
            return resp.status(401).json({ message: 'invalid token' })
        }
    },
    (req, resp) => {
        console.info('newTel ', req.body.newTel)
        console.info('username ', req.jwt.sub)
        console.info('oldTel ', req.body.oldTel)
        updateTel([req.body.newTel, req.jwt.sub, req.body.oldTel])
            .then(result => {
                resp.status(200).json(result);
            })
            .catch(error => {
                resp.status(400).json({ error: `Unable to update tel ${error}` });
            })
    }
)

// Unable to incooperate the stripe
/*app.put('/api/pay', express.json(),
    (req, resp, next) => {
        const authorization = req.get('Authorization');
        // console.info("inside pay:", authorization);
        if (!(authorization && authorization.startsWith('Bearer ')))
            return resp.status(403).json({ message: 'not authorized' })

        const tokenStr = authorization.substring('Bearer '.length)
        // console.info("inside tokenStr:", tokenStr);
        try {
            // console.info("inside try req.jwt:", jwt.verify(tokenStr, config.sessionSecret));
            req.jwt = jwt.verify(tokenStr, config.sessionSecret);
            next()
        } catch (e) {
            return resp.status(401).json({ message: 'invalid token' })
        }
    },
    (req, resp) => {
        let amount = 10 * 100;

        console.info('username ', req.jwt.sub)
        // create a customer
        stripe.customers.create({
            email: req.jwt.data.email, // customer email
            source: req.body.stripeToken // token for the card
        })
            .then(customer =>
                stripe.charges.create({ // charge the customer
                    amount,
                    description: "Sample Charge",
                    currency: "sgd",
                    customer: customer.id
                }))
            .then(charge => resp.status(200).json(charge)) // render the payment successful alter page after payment
            .catch(error => {
                resp.status(400).json({ error: `Unable to make payment ${error}` });
            })

    }
)*/

app.post('/api/createOrder', express.json(),
    (req, resp, next) => {

        const authorization = req.get('Authorization');
        if (!(authorization && authorization.startsWith('Bearer ')))
            return resp.status(403).json({ message: 'not authorized' })

        const tokenStr = authorization.substring('Bearer '.length)
        try {
            req.jwt = jwt.verify(tokenStr, config.sessionSecret);
            next()
        } catch (e) {
            return resp.status(401).json({ message: 'invalid token' })
        }
    },
    (req, resp) => {
        //console.info('token: ', req.jwt);
        //console.info('username: ', req.jwt.sub);
        //console.info(req.body);
        const postedDate = new Date();
        address_params = [
            req.jwt.sub, 2, req.body.address.address1, req.body.address.address2,
            req.body.address.city, req.body.address.state, req.body.address.postcode, req.body.address.country, postedDate
        ]
        params = [req.body.order_id, req.jwt.sub, 'address_id', postedDate]

        console.info('Address params are:', address_params);


        createAddress(address_params)
            .then(result => {
                console.info('Insert into Address with Shipping address:', result);
                console.info('Id:', result.insertId);
                params = [req.body.order_id, req.jwt.sub, result.insertId, postedDate]
                console.info('Order params are:', params);

                createOrder(params)
                    .then(result => {
                        console.info('Insert into Orders table');

                        req.body.lineItems.forEach(det => {

                            orderDetail_params = [req.body.order_id, det.prod_detail_id.substring(0, 11), det.color, det.size, det.unitprice, det.quantity, req.body.totalAmt]
                            prodAttr_params = [det.quantity, det.prod_detail_id.substring(0, 11), det.color, det.size];
                            console.info('Order Detail params are:', orderDetail_params);
                            console.info('prodAttr_params are:', prodAttr_params);

                            const p1 = createOrderDetails(orderDetail_params);
                            const p2 = reduceProdAttributeQty(prodAttr_params);
                            Promise.all([p1, p2])
                                .then(results => {
                                    const r0 = results[0];
                                    const r1 = results[1];
                                    console.info('>r0 = ', r0);
                                    console.info('>r1 = ', r1);
                                })
                                .catch(error => {
                                    console.info(error);
                                    resp.status(400).json({ error: `failure to create order ${error}` });
                                })
                        });
                        resp.status(200).json({ message: 'Order created' });
                    })
                    .catch(error => {
                        resp.status(400).json(error);
                    })
            })
    }
)

app.get('/api/map/storelocation',
    (req, resp) => {
        const qs = {
            address: '36 Soo Chow Drive, Singapore 575543',
            key: config.gmap.key
        }

        request.get('https://maps.googleapis.com/maps/api/geocode/json', { qs })
            .then(result => {
                //console.info(result);
                if (!result)
                    return resp.status(404).json({ error })

                lat = JSON.parse(result).results[0].geometry.location.lat;
                lng = JSON.parse(result).results[0].geometry.location.lng;

                console.info(lat, lng);

                const qs_static = {
                    center: `${lat},${lng}`,
                    zoom: 15,
                    size: '300x300',
                    format: 'png',
                    key: config.gmap.key,
                    markers: `size:mid|color:red|label:A|${lat},${lng}`
                }

                request.get('https://maps.googleapis.com/maps/api/staticmap', { qs: qs_static, encoding: null })
                    .then(result => {
                        console.info(result);
                        if (!result)
                            return resp.status(404).json({ error })
                        resp.status(200).type('image/png').send(result);
                    })
                    .catch(error => {
                        console.log(error);
                    })
            })
            .catch(error => { resp.status(500).json({ error }) })
    }
)

app.get('/api/product/:prod_type/:product_detail_id/:color',
    (req, resp) => {
        console.info('the product_type is ', req.params.prod_type);
        console.info('the product_detail_id is ', req.params.product_detail_id);
        console.info('the color is ', req.params.color);
        getProdDetailColor([req.params.prod_type, req.params.product_detail_id, req.params.color])
            .then(result => {
                resp.status(200).json(result);
            })
            .catch(error => {
                resp.status(400).json({ error: `Unable to get product detail color ${error}` });
            })
    }
)

app.get('/api/product/:prod_type/:product_detail_id',
    (req, resp) => {
        console.info('the product_type is ', req.params.prod_type);
        console.info('the product_detail_id is ', req.params.product_detail_id);
        getProdDetail([req.params.prod_type, req.params.product_detail_id])
            .then(result => {
                console.info("getProdDetail result: ", result);
                resp.status(200).json(result);
            })
            .catch(error => {
                resp.status(400).json({ error: `Unable to get product detail ${error}` });
            })
    }
)

app.get('/api/product/:prod_type',
    (req, resp) => {
        console.info('the product is ', req.params.prod_type);
        getAllProdType([req.params.prod_type])
            .then(result => {
                console.info("getAllProdType result: ", result);
                resp.status(200).json(result);
            })
            .catch(error => {
                resp.status(400).json({ error: `Unable to get product ${error}` });
            })
    }
)

app.get('/status/:code',
    (req, resp) => {
        // need to do a little more checking
        req.status(parseInt(req.params.code)).json({ message: 'incorrect login' })
    }
)

app.post('/api/authenticate',
    passport.authenticate('local', {
        failureRedirect: '/status/401',
        session: false // ignore to use session
    }),
    (req, resp) => {
        // issue the JWT
        console.info("authenticate user: ", req.user);
        // console.info("req.body.otp:", req.body.otp);
        getUserDetails([req.user])
            .then(result => {
                console.info('result: ', result);
                const d = new Date();
                const rec = result[0];
                const token = jwt.sign({
                    sub: rec.username,
                    iss: 'boutique-app',
                    iat: d.getTime() / 1000,
                    exp: (d.getTime() / 1000) + (60 * 20),
                    data: {
                        email: rec.email
                    }
                }, config.sessionSecret)
                resp.status(200).json({ token_type: 'Bearer', access_token: token, username: rec.username })
            })
            .catch(error => {
                resp.status(400).json({ error: `failure to login ${error}` });
            })
    }
)

const testConnections = (conns) => {
	const p = [];
	p.push(new Promise(
		(resolve, reject) => {
			conns.mysql.getConnection(
				(err, conn) => {
					if (err)
						return reject(err);
					conn.ping(err => {
						conn.release();
						if (err)
							return reject(err);
						console.info('resolved mysql');
						resolve();
					})
				}
			)
		}
	));

	p.push(new Promise(
		(resolve, reject) => {
			conns.mongodb.connect(
				err => {
					if (err)
						return reject(err);
					console.info('resolved mongodb');
					resolve();
				}
			)
		}
	))

	p.push(new Promise(
		(resolve, reject) => {
			const params = {
				Bucket: 'dawn123',
				Key: 'cat.jpg'
			}
			conns.s3.getObject(params,
				(err, result) => {
					if (err)
						return reject(err);
					console.info('resolved s3');
					resolve();
				}
			)
		}
	))

	return (Promise.all(p))
}

testConnections(conns)
    .then(() => {
        app.listen(PORT,
            () => {
                console.info(`Application started on port ${PORT} at ${new Date()}`);
            }
        )
    })
    .catch(error => {
        console.error(error);
        process.exit(-1);
    })