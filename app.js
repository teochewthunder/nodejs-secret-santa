var auth = require("./auth.js");
var express = require("express");

var app = express();

var handlebars = require("express-handlebars").create({defaultLayout:"main"});
app.engine("handlebars", handlebars.engine);

app.set("view engine", "handlebars");
app.set("port", process.env.PORT || 3000);

app.get("/", (req, res) => {
	res.render("index");
});

app.get("/santa/:intSantas", (req, res) => {
	let no_of_santas = parseInt(req.params.intSantas);

	if (no_of_santas < 3) no_of_santas = 3;
	res.render("santa", { 
		santas: [...Array(no_of_santas).keys()]
		.map(i => ({ 
			id: i, 
			value: (i === no_of_santas - 1 ? 0 : i + 1)
		}))
	});
});

app.post("/process", async (req, res) => {
	let no_of_santas = parseInt(req.body.hidSantas);

	var nodemailer = require("nodemailer");
	var transport = nodemailer.createTransport({
		service: "Gmail",
		host: "smtp.gmail.com",
		secure: true,
		port: 465,
		auth: {
			user: auth.mail.user,
			pass: auth.mail.password
		}
	});

	try {
		for(let i = 0; i < no_of_santas; i++) {
			var santaFor = req.body["hidAssigned" + i];
			var santaForName = req.body["txtName" + santaFor];
			var santaForEmail = req.body["txtEmail" + santaFor];

			const html = await new Promise((resolve, reject) => {
				res.render("emailtemplate", {
					layout: null,
					message: `You are the Secret Santa for ${santaForName} ${santaForEmail}.`
				}, (error, html) => {
					if (error) {
						reject(error);
					} else {
						resolve(html);
					}
				});	
			});

			var options = {
				from: "teochewthunder@gmail.com",
				to: req.body["txtEmail" + i],
				subject: "You are a Secret Santa",
				html: html
			};

			await transport.sendMail(options);		
		}
	} catch(error) {
		console.log(error);
		res.render("500", { errorMessage: error.code });		
	}
});

app.use((req, res, next)=> {
	res.status(404);
	res.render("404");
});

app.use((err, req, res, next)=> {
	res.status(500);
	res.render("500", { errorMessage: err.code });
});

app.listen(app.get("port"), ()=> {

});