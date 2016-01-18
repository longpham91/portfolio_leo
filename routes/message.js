var nodemailer = require('nodemailer');

exports.post = function(request, response) {
    if ((!request.body.name) || (!request.body.email) || (!request.body.phone) || (!request.body.message)) {
        return response.status(500).json({ success: false, data: 'No argements provided!'});
    }
    
    var smtpTransport = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // use SSL
        auth: {
            user: "longpham91@gmail.com",
            pass: "BerlinSaigon26121991"
        }
    });
    
    var name = request.body.name;
    var email = request.body.email;
    var phone = request.body.phone;
    var message = request.body.message;
    
    var mailOptions = {
        from: email, // sender address 
        to: 'longpham91@gmail.com', // list of receivers 
        subject: 'Website Contact Form: ' + name, // Subject line
        html: 'You have received a new message from your website contact form.<br /><br />Here are the details:<br /><br /><strong>Name</strong>: '+ name + '<br /><br /><strong>Email</strong>: ' + email + '<br /><br /><strong>Phone</strong>: ' + phone + '<br /><br /><strong>Message</strong>:<br />' + message
    };
    
    smtpTransport.sendMail(mailOptions, function(error, info){
        if(error){
            return response.status(500).json({ success: false, data: error});
        }
        response.json({result: 'Message sent: ' + info.response});
    });
}