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

// Nodemailer Transporter (configurado para o Outlook)
const transporter = nodemailer.createTransport({
  host: 'email-ssl.com.br', // Servidor de saída (SMTP)
  port: 465, // Porta para SSL
  secure: true, // Conexão segura SSL
  auth: {
    user: process.env.EMAIL_USER, // Seu e-mail corporativo (configurado no .env)
    pass: process.env.EMAIL_PASS, // Sua senha (ou senha de aplicativo)
  },
});

// API Routes
app.post('/', async (req, res) => {
  const { email, clientName, location, scannedAt, username } = req.body;

  if (!email || !Array.isArray(email) || email.length === 0) {
    return res.status(400).json({ success: false, message: 'E-mails são obrigatórios e devem ser uma lista.' });
  }

  const scanDateTime = scannedAt || new Date();
  const formattedDateTime = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(new Date(scanDateTime));

  const emailHtml = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Aviso de Visita Realizada</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f9f9f9;
          margin: 0;
          padding: 0;
        }
        .email-container {
          max-width: 600px;
          margin: 20px auto;
          background: #fff;
          border-radius: 6px;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .email-header {
          text-align: center;
          padding-bottom: 20px;
          border-bottom: 1px solid #ddd;
        }
        .email-header h1 {
          font-size: 20px;
          margin: 0;
          color: #4CAF50;
        }
        .email-body {
          margin-top: 20px;
        }
        .email-body p {
          margin: 10px 0;
          font-size: 16px;
        }
        .email-footer {
          margin-top: 20px;
          text-align: center;
          font-size: 14px;
          color: #777;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="email-header">
          <h1>Aviso de Visita Realizada</h1>
        </div>
        <div class="email-body">
          <p>Prezado(a) <strong>${clientName || 'Cliente'}</strong>,</p>
          <p>Informamos que a visita técnica ao local indicado foi realizada com sucesso. Seguem os detalhes:</p>
          <p><strong>Local:</strong> ${location || 'Não especificado'}</p>
          <p><strong>Data e Hora:</strong> ${formattedDateTime}</p>
          <p><strong>Visitante Técnico:</strong> ${username || 'Não identificado'}</p>
          <p>Estamos à disposição para quaisquer dúvidas ou informações adicionais.</p>
        </div>
        <div class="email-footer">
          <p>Atenciosamente,</p>
          <p><strong>[Nome da Sua Empresa]</strong></p>
          <p>[Informações de Contato]</p>
        </div>
      </div>
    </body>
    </html>`;

  try {
    for (const recipient of email) {
      await transporter.sendMail({
        from: process.env.EMAIL_USER, // Endereço do remetente
        to: recipient, // Destinatário
        subject: `Aviso de Visita Realizada - ${clientName || 'Local não especificado'}`, // Assunto
        html: emailHtml,
      });
    }
    res.json({ success: true, message: 'E-mail enviado com sucesso!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erro ao enviar o e-mail.' });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
