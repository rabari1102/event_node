const { body, validationResult } = require("express-validator");
const express = require("express");
const path = require("path");
const jwt = require("jsonwebtoken");
const app = express();
const User = require("../model/user");
const Events = require("../model/event");
const bcrypt = require("bcrypt");
const jwtsec = "Pragnesh@1102";
const passport = require("passport");
const eventsMiddleware = require("../middleware/eventmiddleware");
const nodemailer = require("nodemailer");
const randomstring = require("randomstring");
const { info, error, log } = require("console");
// const sendEmail = require('../emailutil/util');

// Signup page

const eventsignup = [
  body("firstName")
    .notEmpty()
    .withMessage(
      "FirstName Must be required....!,So please enter your first name"
    ),
  body("lastName")
    .notEmpty()
    .withMessage(
      "LastName Must be required....!,So please enter your last name"
    ),
  body("email")
    .notEmpty()
    .withMessage(
      "your email address is not valid..!,please enter your valid email address"
    ),
  body("Mobilenumber")
    .notEmpty()
    .isLength({ min: 10 })
    .withMessage("Mobile number must be only 10 numbers"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/
    )
    .withMessage(
      "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character"
    ),

  async (req, res) => {
    const err = validationResult(req);
    if (!err.isEmpty()) {
      return res.status(400).json({
        err: err.array(),
      });
    }
    try{
      const { firstName, lastName, email, Mobilenumber, password } = req.body;
      const resetPasswordToken = randomstring.generate();
      const resetPasswordExpires = Date.now() + 3600000;
      const hashedPassword = await bcrypt.hash(password, 10);

      await User.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        Mobilenumber,
        resetPasswordToken,
        resetPasswordExpires,
      });
    return res.status(200).json({ message: "Admin successfully signed up" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error occurred while processing the request" });
  }
}
];

// loginpage

const eventlogin = async (req, res) => {
  const { email, Mobilenumber, password } = req.body;

  try {
    var event;
    if (email) {
      event = await User.findOne({
        email,
      });
    } else if (Mobilenumber) {
      event = await User.findOne({
        Mobilenumber,
      });
    } else {
      return res
        .status(400)
        .send({ message: "please give the email adress and mobilenumber" });
    }
    if (!event) {
      return res.status(400).send({ message: "event not found" });
    }
    const passwordMatch = bcrypt.compareSync(password, event.password);

    if (!passwordMatch) {
      return res.status(400).send({ message: "password is incorrect" });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: "internal error" });
  }

  const jwtPayload = {
    role: "event",
  };
  const token = jwt.sign(jwtPayload, jwtsec);
  return res
    .status(200)
    .send({ message: "event is successfully logged in", token: token });
};

// profile page

const viewsProfile = (req, res) => {
  User.find({})
    .then((response) => {
      res.json({
        response,
      });
    })
    .catch((err) => {
      res.json({
        message: err,
      });
    });
};

// update profile page

let updateProfile = async (req, res) => {
  await body("firstName", "Must be required this field").notEmpty().run(req);
  await body("lastName", "Must be required this field").notEmpty().run(req);
  await body("email", "Please enter the valid email").isEmail().run(req);
  await body("Mobilenumber", "Please enter the valid Mobilenumber")
    .notEmpty()
    .isLength({ min: 10 })
    .withMessage("Mobile number must be only 10 numbers")
    .run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(404).json({ errors: errors.array() });
  }

  if (!User) {
    return res
      .status(404)
      .json({ message: "You do not have permission to update profile." });
  }
  let UserId = { _id: req.body._Id };

  let info = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    Mobilenumber: req.body.Mobilenumber,
  };

  let Update = await User.findOneAndUpdate(UserId, info, {
    upsert: true,
    useFindAndModify: false,
  });
  res.status(200).send(Update);
};

// logout

const eventLogout = (req, res) => {
  res.clearCookie("token");
  return res.status(200).send({ message: "Logged out successfully" });
};

//password forget

const forgetpassword = async (req, res) => {
  const email = req.body.email;
  try{
    const userData = await User.findOne({ email: email });
    if (userData) {
      const token = randomstring.generate();
      const expirationTime = Date.now() + 3600000;
      console.log("updated",userData);
      await sendresetpasswordmail(userData.name, userData.email, token);
      userData.resetPasswordToken = token;
      userData.resetPasswordExpires = expirationTime;
      await userData.save();
      res.status(200).send({
        success: true,
        msg: "please check your inbox of mail and reset your password",
      });
    } else {
      res.status(200).send({ success: true, msg: "this email does not exists." 
    });
    }
  }catch (err) {
    res.status(500).send({
      success: false,
      msg: 'Error occurred while processing the request.',

    })
  }
};

const sendresetpasswordmail = async (name, email, token) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: "pkb110201@gmail.com",
        pass: "mnotvfwnfjumqhlk",
      },
    });

    const mailOption = {
      from: "pkb110201@gmail.com",
      to: email,
      subject: 'Password Reset',
      html:
        `<p> hii ${name},</p>`+
        `<p>You can reset your password by clicking the following link:</p>` +
        `<a href="http://127.0.0.1:8080/api/event/reset?token=${token}">Reset Password</a>`,
    };
    const info = await transporter.sendMail(mailOption);;
    console.log('mail has benn sent:',info.response);
  }catch(err){
    throw new Error('error sending emmail');
  }
};

const resetpassword = async (req, res) => {
  try {
    const token = req.query.token;
    const tokenData = await User.findOne({ 
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (tokenData) {
      const password = req.body.password;

      const hashedPassword = await bcrypt.hash(password, 10);
      tokenData.password = hashedPassword;
      tokenData.resetPasswordToken = null;
      tokenData.resetPasswordExpires = null;
      await tokenData.save();
      return res.status(200).send({
        success: true,
        msg: 'User password has been reset',
      });
    }else{
      return res.status(200).send({
        success:true,
        msg:'This link has expired',
      })
    }
  }catch(err){
    return res.status(500).send({
      success: false,
      msg: 'Error occurred while processing the request.',
    });
  }
}
// createevent

const createEvent = [
  body("name")
    .notEmpty()
    .withMessage(
      "FirstName Must be required....!,So please enter your first name"
    ),
  body("date").notEmpty().withMessage("add only todays date"),
  body("description").notEmpty(),

  async (req, res) => {
    const err = validationResult(req);
    if (!err.isEmpty()) {
      return res.status(400).json({
        err: err.array(),
      });
    }

    if (err.isEmpty()) {
      await Events.create({
        name: req.body.name,
        date: req.body.date,
        description: req.body.description,
      });
      res.status(200).json({ message: "event sucessfully signup" });
    }
  },
];

// updateevent

const updateEvent = async (req, res) => {
  await body("name", "Must be required this field").notEmpty().run(req);
  await body("date", "Must be required this field")
    .notEmpty()
    .isDate()
    .run(req);

  await body("description", "Must be required this field").notEmpty().run(req);
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(404).json({ errors: errors.array() });
  }
  if (!User) {
    return res
      .status(404)
      .json({ message: "You do not have permission to update profile." });
  }

  let eventId = { _id: req.body._Id };

  let updatedata = {
    name: req.body.name,
    date: req.body.date,
    description: req.body.description,
  };

  const updatedEvent = await Events.findOneAndUpdate(eventId, updatedata, {
    upsert: true,
    useFindAndModify: false,
  });
  res.status(200).send(updatedEvent);
};

// list all event

const listevent = (req, res) => {
  Events.find({})
    .then((response) => {
      res.json({
        response,
      });
    })
    .catch((err) => {
      res.json({
        message: err,
      });
    });
};

// filter event

const filterEventsByDate = async (req, res) => {
  const { startDate, endDate } = req.query;

  try {
    const events = await Events.find({
      date: { $gte: new Date(startDate), $lte: new Date(endDate) },
    });

    res.status(200).json(events);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while retrieving events" });
  }
};

// show 1 event

const findEventById = async (req, res) => {
  const { _id } = req.params;

  try {
    const eventId = await Events.findById(_id);

    if (!eventId) {
      return res.status(404).json({ error: "can not find id" });
    }

    res.status(200).json(eventId);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while retrieving the event" });
  }
};

module.exports = {
  eventsignup,
  eventlogin,
  eventLogout,
  viewsProfile,
  updateProfile,
  forgetpassword,
  sendresetpasswordmail,
  resetpassword,
  createEvent,
  updateEvent,
  listevent,
  filterEventsByDate,
  findEventById,
};
