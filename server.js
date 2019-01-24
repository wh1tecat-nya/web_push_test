const fastify = require("fastify")();
const webpush = require("web-push");
const path = require("path");

const key = require("./key.json");
const mail = "mailto:wh1tecat.sec@gmail.com";

// init
fastify.register(require('fastify-static'), {
	root: path.join(__dirname, 'public'),
	prefix: '/', // optional: default '/'
});

const VAPIDKey = key;
console.log(VAPIDKey);
webpush.setVapidDetails(
	"mailto:wh1tecat.sec@gmail.com",
	VAPIDKey.publicKey,
	VAPIDKey.privateKey
	);
	

// routing
fastify.get("/", async (req, res) => {
	res.sendFile("index.html");
});

fastify.get("/api/webpush/get", (req, res) => {
	res.send({
		"publicKey": VAPIDKey.publicKey
	});
});

fastify.post('/api/webpush/subscribe', (req, res) => {
	console.log(req.body.pkey);
	const subscription = {
		endpoint : req.body.endpoint,
		keys     : {
			auth   : req.body.authkey,
			p256dh : req.body.pkey
		}
	};
	const payload = JSON.stringify({
		title: "hello",
		body : "hello world",
		url  : "http://google.co.jp/"
	});

	webpush.sendNotification(subscription, payload)
	.then((response) => {
		return res.send({
			statusCode: response.statusCode || -1,
			message   : response.message    || ''
		});
	}).catch((error) => {
		console.dir(error);
		return res.send({
			statusCode: error.statusCode || -1,
			message   : error.message    || '',
		});
	});
});

// listen server
fastify.listen(3004)
.then(address => {console.log(`Server listening on ${address}`)})
.catch(err => {
	console.error(`Error starting server: ${err}`);
	process.exit(1);
});
