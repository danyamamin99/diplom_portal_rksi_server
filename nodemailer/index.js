const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: "mamin@stud.rksi.ru",
        pass: "3030Astra"
    }},
    {
        from: "Портал дипломников РКСИ <mamin@stud.rksi.ru>"
    }
);

module.exports = transporter;