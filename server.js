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

        console.log('Attempting to create transporter with config:', {
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER
            }
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

        console.log('Attempting to send email with options:', {
            from: mailOptions.from,
            to: mailOptions.to,
            subject: mailOptions.subject
        });

        // Send email
        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'Message sent successfully!' });
    } catch (error) {
        console.error('Detailed error:', error);
        res.status(500).json({ message: 'Sorry, there was an error sending your message. Please try again later.' });
    }
});

// Serve index.html for all routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
