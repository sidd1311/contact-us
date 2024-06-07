const express = require('express');
var bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
require('dotenv').config();


var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set('view engine', 'ejs');



// Connect to MongoDB once when the server starts

// In the URL I have changed the database to conatct-db
mongoose.connect('mongodb+srv://siddbhardwaj2005:GjK7iXeBfRICErMH@cluster0.jzpnccz.mongodb.net/contact-db?retryWrites=true&w=majority&appName=Cluster0', {
})
.then(() => console.log('MongoDB connected to contact-db...'))
.catch(err => console.log(err));

// Defining Schema to store in MongoDB
const querySchema = new mongoose.Schema({
  name: String,
  email: String,
  query: String,
});

const Query = mongoose.model('Query', querySchema);

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USER, // Your Gmail email
    pass: process.env.GMAIL_PASS,        // Your Gmail App Password
  }
});

async function sendEmail(to, subject, text) {
  const mailOptions = {
    from: 'siddbhardwaj2005@gmail.com',
    to: to,
    subject: subject,
    text: text,
  };

  try {
    let info = await transporter.sendMail(mailOptions);
    console.log('Mail Sent Successfully:', info.response);
  } catch (error) {
    console.log('Error in sending email:', error);
  }
}

app.get('/', function (req, res) {
  res.render('index', { msg: null });
});

app.post('/contact', async function (req, res) {
  let nm = req.body.name;
  let em = req.body.email;
  let qu = req.body.query;
  console.log(nm);
console.log('GMAIL_USER:', process.env.GMAIL_USER);
console.log('GMAIL_PASS:', process.env.GMAIL_PASS);

  try {
    const query = new Query({ name: nm, email: em, query: qu });
    await query.save();

    let sub = 'Contact Form Received Successfully';
    let text = `Dear ${nm},\nYour contact query is received successfully.\nYour Query is: ${qu}\nWe will reach out to you ASAP.`;
    await sendEmail(em, sub, text);

    // Send an email to the admin
    let adminSub = 'New Query Received';
    let adminText = `Query received from: ${em}\nName: ${nm}\nQuery: ${qu}`;
    await sendEmail('bhardwajsidd2005@gmail.com', adminSub, adminText);
    await sendEmail('siddbhardwaj2005@gmail.com', adminSub, adminText); // Replace 'admin@example.com' with the actual admin email

    res.render('index', { msg: "Sent Successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
