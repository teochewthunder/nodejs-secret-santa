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

app.post("/process", (req, res) => {
	let no_of_santas = req.body.hidSantas;
	let assignment = [...Array(no_of_santas).keys()];
	let santas = [];

	for (let i = 0; i < no_of_santas; i++) {
		var index = Math.floor(Math.random * no_of_santas);
		var assigned = assignment[index];
		assignment.splice(index, 1);

		santas.push(
			{
				name: req.body["txtName" + i],
				email: req.body["txtEmail" + i],
				assigned: assigned
			}
		);
	}

	res.render("assigned", { santas: santas });
});

app.post("/process1", (req, res) => {
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

	res.render("emailtemplate", {
		layout: null,
		message: req.body.txtMessage.split("\n").join("<br />")
	}, (error, html) => {
		if (error) {
			console.log(error);
			res.render("500", { errorMessage: error.code });
		} else {
			var options = {
				from: "teochwthunder@gmail.com",
				to: req.body.txtEmail,
				subject: "You are a Secret Santa",
				html: html
			};

			transport.sendMail(options, (error) => { 
				if (error) {
					console.log(error);
					res.render("500", { errorMessage: error.code });
				} else {
					res.redirect(303, "/thankyou");
				}
			});	
		}
	});
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