# 📣 Backend Notification System

A simple Node.js backend service for sending notifications via Email, SMS, and an internal queue using RabbitMQ.

## 📦 Installation

bash
npm install


## ⚙ Environment Setup

Create a .env file in the project root and configure the following variables:

```env
PORT=3000
RABBITMQ_URL=amqp://localhost

EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password

TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

```
Make sure RabbitMQ is running locally or accessible via the RABBITMQ_URL you provide.

## 🚀 Running the Project

Start the Express server:

bash
npm start

## In a separate terminal, start the worker service:

bash
node worker.js
```

## 🔧 Dependencies

- express
- body-parser
- dotenv
- nodemailer
- twilio
- amqplib
