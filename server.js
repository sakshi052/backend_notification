const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const twilio = require('twilio');
require('dotenv').config();

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

// Twilio client setup
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

app.post('/send-notification', async (req, res) => {
  const { to, phone, subject, message, type } = req.body;

  if (!type || !message) {
    return res.status(400).json({ error: 'type and message are required' });
  }

  if (type === 'email' && (!to || !subject)) {
    return res.status(400).json({ error: 'Email type requires to and subject fields' });
  }

  if (type === 'sms' && !phone) {
    return res.status(400).json({ error: 'SMS type requires phone field' });
  }

  try {
    if (type === 'email') {
      // Send Email
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        text: message
      });

      console.log('✅ Email sent to:', to);
      return res.json({ success: true, message: 'Email sent successfully' });

    } else if (type === 'sms') {
      // Send SMS
      await twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone
      });

      console.log('📱 SMS sent to:', phone);
      return res.json({ success: true, message: 'SMS sent successfully' });

    } else {
      return res.status(400).json({ error: 'Invalid type. Use "email" or "sms"' });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Sending failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

app.post('/send-notification', async (req, res) => {
  const { to, phone, subject, message, type } = req.body;

  if (!type || !message) {
    return res.status(400).json({ error: 'type and message are required' });
  }

  if (type === 'email' && (!to || !subject)) {
    return res.status(400).json({ error: 'Email type requires to and subject fields' });
  }

  if (type === 'sms' && !phone) {
    return res.status(400).json({ error: 'SMS type requires phone field' });
  }

  try {
    await publishToQueue('notification_queue', { type, to, phone, subject, message });
    return res.json({ success: true, message: 'Notification queued successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: 'Queueing failed' });
  }
});
