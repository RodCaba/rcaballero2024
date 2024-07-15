const express = require("express");
const morgan = require("morgan");
const path = require("path");
require("dotenv").config();

const app  = express();

const PORT = process.env.PORT || 8080;

const mailchimp = require("@mailchimp/mailchimp_marketing");

mailchimp.setConfig({
    apiKey: process.env.MAIL_CHIMP_API_KEY,
    server: "us5",
});


app.use(morgan('tiny'));

app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));

app.use(express.static(path.join(__dirname, "Template")));



app.post('/form', (req, res) => {
    const { conName, conLName, conEmail, conPhone, conService, conMessage } = req.body;
    console.log(req.body);
    let responseStatus = {
        status: ""
    };
    async function run(){
        const response = await mailchimp.lists.addListMember(process.env.MAIL_CHIMP_LIST_ID, {
            email_address: conEmail,
            status: "subscribed",
            merge_fields: {
                "FNAME": conName,
                "LNAME": conLName,
                "PHONE": conPhone,
                "SERVICE": conService,
                "MESSAGE": conMessage,
            }
        });
    }
    
    run().then(()=> {
        responseStatus.status = 200;
        console.log(responseStatus);
        res.redirect('/')
    }).catch(() => {
        responseStatus.status = 400;
        console.log(responseStatus);
        res.redirect('/')
    })
    
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'Template', 'index.html'))
});

app.listen(PORT, console.log(`Server starting at ${PORT}`))