const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SEND_GRID_API_KEY)


const welcomeEmail = (email, name)=> {

    sgMail.send({
        to: email,
        from: 'danieldeveloper@mail.com',
        subject: `${name} welcome to App. `,
        text: 'Please let us know if you have any additional questions.'
    })
}

const farewellEmail = (email, name)=> {

    sgMail.send({
        to: email,
        from: 'danieldeveloper@mail.com',
        subject: `${name} we are sad to see you go. `,
        text: 'Please let us if there is anyting we can do to better our service.'
    })
}
module.exports = { welcomeEmail, farewellEmail } 