// server.js
const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Gmail username
    pass: process.env.EMAIL_PASS, // Gmail app password
  },
});

// API Routes
app.post('/', async (req, res) => {
  const { email, scannedAt } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'E-mail é obrigatório.' });
  }

  const scanDateTime = scannedAt || new Date();
  const formattedDateTime = scanDateTime.toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    dateStyle: 'short',
    timeStyle: 'short',
  });

  try {
    // Send email
    await transporter.sendMail({
      from: process.env.MAIL_FROM, // Sender address
      to: email, // List of receivers
      subject: 'Confirmação de QR Code', // Subject line
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2 style="text-align: center;">Confirmação de QR Code</h2>
          <p>Olá,</p>
          <p>Você escaneou um QR Code com sucesso.</p>
          <p><strong>Data e Hora:</strong> ${formattedDateTime}</p>
          <p><strong>Local:</strong> Não especificado</p>
          <br>
          <p>Atenciosamente,</p>
          <p><strong>Equipe de Suporte</strong></p>
        </div>
      `, // HTML body
    });

    res.status(200).json({ success: true, message: 'E-mail enviado com sucesso!' });
  } catch (error) {
    console.error('Erro ao enviar o e-mail:', error);
    res.status(500).json({ success: false, message: 'Erro ao enviar o e-mail.' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
