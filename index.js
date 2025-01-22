// require("dotenv").config();

const express = require("express");
const ejsLayouts = require("express-ejs-layouts");
// const mongoose = require("mongoose");
const expressSession = require("express-session");
const Product = require("./models/Product");
const Cart = require('./models/Cart');
const nodemailer = require('nodemailer');
let app = express();

app.use(express.static("public"));
app.use(ejsLayouts);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/send', (req, res) => {
  const { name, email, message } = req.body;

  // Create a transporter object using SMTP transport
  let transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
          user: email, // sender's email address entered by the user
          pass: 'dsaqw_2476' // sender's email password (not recommended to hardcode, use environment variables)
      }
  });

  // Email message options
  let mailOptions = {
      from: email, // sender's email address
      to: 'zainy370@gmail.com', // your email address
      subject: 'SNIK Customer Query',
      text: `Hello,\n\nYou have received a message from ${name} (${email}).\n\nMessage:\n${message}`
  };

  // Send email
  transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
          console.log(error);
          res.send('Failed to send your message. Please try again later.');
      } else {
          console.log('Email sent: ' + info.response);
          res.send('Your message has been sent successfully.');
      }
  });
});


app.use(
  expressSession({
    secret: 'my secret key',
    resave: false,
    saveUninitialized: true,
  })
);

app.use((req, res, next)=>{
  res.locals.message = req.session.message;
  delete res.locals.message;
  next();
});

app.set("view engine", "ejs");

app.use(require("./middlewares/main-site"));
const authRouter = require("./routes/auth");

app.use(authRouter);
app.use("", require("./routes/routes"));


app.use("/api/products", require("./routes/api/products"));







app.listen(8000);

// mongoose
//   .connect('mongodb://0.0.0.0:27017/snik', {})
//   .then(() => console.log("Connected to DB"))
//   .catch((e) => console.log("DB Error - " + e));
