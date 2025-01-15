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
    dateStyle: 'long',
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
          background-color: #ffffff;
          margin: 0;
          padding: 20px;
        }
        .email-container {
          max-width: 600px;
          margin: 20px auto;
          background: #ffffff;
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 20px;
        }
        .email-header {
          text-align: center;
          margin-bottom: 20px;
        }
        .email-header h1 {
          font-size: 20px;
          color: #0056b3;
        }
        .email-body {
          font-size: 14px;
          color: #333;
        }
        .email-body p {
          margin: 10px 0;
        }
        .email-footer {
          margin-top: 20px;
          font-size: 12px;
          color: #555;
          text-align: left;
          border-top: 1px solid #ddd;
          padding-top: 10px;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="email-header">
          <h1>Conforlab - Aviso de Visita Realizada</h1>
        </div>
        <div class="email-body">
          <p>Prezado(a) <strong>${clientName || 'Cliente'}</strong>,</p>
          <p>Informamos que nossa equipe técnica concluiu a visita ao local indicado. Agradecemos pela confiança em nossos serviços e reiteramos nosso compromisso com a excelência.</p>
          <p><strong>Detalhes da Visita:</strong></p>
          <p><strong>Local:</strong> ${location || 'Não especificado'}</p>
          <p><strong>Data e Hora:</strong> ${formattedDateTime}</p>
          <p><strong>Técnico:</strong> ${username || 'Não identificado'}</p>
          <p>Este e-mail é automático e não requer resposta. Em caso de dúvidas, nossa equipe está à disposição para atendê-lo.</p>
        </div>
        <div class="email-footer">
          <p>Atenciosamente,</p>
          <p>Equipe Conforlab</p>
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
