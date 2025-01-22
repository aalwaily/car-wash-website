require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Move static files to public directory
app.use(express.static(path.join(__dirname, 'public')));

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;

        console.log('Email Config:', {
            service: process.env.EMAIL_SERVICE,
            user: process.env.EMAIL_USER,
            recipient: process.env.EMAIL_RECIPIENT,
            // Don't log the password
        });

        // Create transporter (configure with your email service)
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // Verify the connection configuration
        try {
            await transporter.verify();
            console.log('SMTP connection verified successfully');
        } catch (verifyError) {
            console.error('SMTP Verification Error:', verifyError);
            throw new Error('Failed to verify SMTP connection: ' + verifyError.message);
        }

        // Email options
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_RECIPIENT,
            subject: `New Contact Form Submission from ${name}`,
            text: `
                Name: ${name}
                Email: ${email}
                Phone: ${phone}
                Message: ${message}
            `
        };

        console.log('Attempting to send email to:', process.env.EMAIL_RECIPIENT);

        // Send email
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);

        res.status(200).json({ message: 'Message sent successfully!' });
    } catch (error) {
        console.error('Detailed error in email sending:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ 
            message: 'Sorry, there was an error sending your message. Please try again later.',
            error: error.message 
        });
    }
});

// Serve index.html for all routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
