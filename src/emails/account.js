const sgMail = require("@sendgrid/mail");

const sendgridAPIKey = process.env.sendgridAPIKey

sgMail.setApiKey(sendgridAPIKey);

const sendWelcomeMessage = (email, name) => {
  sgMail.send({
    to: email,
    from: "bansekajude20@gmail.com",
    subject: "this is the first mail",
    text: `hello ${name} hope you get this mail on time and as quick as posible, Be Safe`,
  });
};
const goodByeMessage = (email, name) => {
  sgMail.send({
    to: email,
    from: "bansekajude20@gmail.com",
    subject: "thanks for having used our services",
    text: `hello ${name} thanks for usig our services please is there anything we could have worked on to keep you as our user?`,
  });
};

module.exports = {
  sendWelcomeMessage,
  goodByeMessage
};
