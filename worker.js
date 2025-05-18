const amqp = require('amqplib');
const nodemailer = require('nodemailer');
const twilio = require('twilio');
require('dotenv').config();

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

async function startWorker() {
  const connection = await amqp.connect(process.env.RABBITMQ_URL);
  const channel = await connection.createChannel();
  const queue = 'notification_queue';

  await channel.assertQueue(queue, { durable: true });
  console.log(`📬 Worker is listening to '${queue}'...`);

  channel.consume(queue, async (msg) => {
    if (msg !== null) {
      const data = JSON.parse(msg.content.toString());
      console.log('📩 Received:', data);

      try {
        if (data.type === 'email') {
          const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS
            }
          });

          await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: data.to,
            subject: data.subject,
            text: data.message
          });

          console.log('✅ Email sent to:', data.to);
        } else if (data.type === 'sms') {
          await twilioClient.messages.create({
            body: data.message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: data.phone
          });

          console.log('📱 SMS sent to:', data.phone);
        }

        channel.ack(msg);
      } catch (err) {
        console.error('❌ Notification failed:', err.message);
        channel.nack(msg); // Retry depending on your logic
      }
    }
  });
}

startWorker().catch(console.error);
