require('dotenv').config();
const express = require('express');
const app = express();
const axios = require('axios')
const nodemailer = require('nodemailer');
const PORT = 6969;

//urls, expected enrollment, max enrollments, email to notify
const URLS=[
    "https://courses.rice.edu/courses/!SWKSCAT.cat?p_action=COURSE&p_term=202520&p_crn=23186",
    "https://courses.rice.edu/courses/!SWKSCAT.cat?p_action=COURSE&p_term=202520&p_crn=22598"
]
const EXPENROLL=[
    28, 
    20
]
const EXPMAX=[
    28, 
    20
]
const EMAILS=[
    "ck62@rice.edu",
    "ck62@rice.edu"
]

// set up mailer
let transport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
});

// checks every 10 secs
function checkLinks() {
    for(let i = 0; i < URLS.length; i++) {
        try {
            axios(URLS[i]).then((response) => {
                // get current enrollment & max enrollment
                const html = response.data;
                // this def not the best way to do this but I didn't want to make a parser for 2 lines
                let enrollment = html.slice(html.indexOf("ed: </b>"), html.indexOf("ed: </b>") + 10);
                enrollment = enrollment.replace("ed: </b>", "");
                let maxEnrollment = html.slice(html.indexOf("Enrollment: </b>"), html.indexOf("Enrollment: </b>") + 18);
                maxEnrollment = maxEnrollment.replace("Enrollment: </b>", "");
                if(parseInt(enrollment) != EXPENROLL[i] || parseInt(maxEnrollment) != EXPMAX[i]) {
                    // trigger to sign up
                    const mailOptions = {
                        from: process.env.EMAIL_USERNAME,
                        to: EMAILS[i],
                        subject: 'YOU NEED TO SIGN UP FOR CLASS',
                        text: `BRO RUN RUN RUN RUN THIS CLASS OPEN OR SMTH: ${URLS[i]}`,
                    };
                    
                    // send message to sign up
                    transport.sendMail(mailOptions, function(err, info) {
                       if (err) {
                            console.log(err)
                       } else {
                            console.log(info);
                       }
                    });
                }
                console.log(enrollment);
                console.log(maxEnrollment);
            });
        } catch (error) {
            console.log(error, error.message);
        }
    }
}

setInterval(checkLinks, 10000);
 
app.listen(PORT, () => {
  console.log(`running on PORT:${PORT}`);
});
