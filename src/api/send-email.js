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
  const formattedDateTime = scanDateTime.toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    dateStyle: 'short',
    timeStyle: 'short',
  });

  const emailHtml = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Relatório de Visita Técnica</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f4f4f9;
          margin: 0;
          padding: 0;
        }
        .email-container {
          max-width: 600px;
          margin: 20px auto;
          background: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .email-header {
          background: #4CAF50;
          color: #ffffff;
          text-align: center;
          padding: 20px;
        }
        .email-header h1 {
          margin: 0;
          font-size: 24px;
        }
        .email-body {
          padding: 20px;
        }
        .email-body p {
          margin: 10px 0;
          font-size: 16px;
        }
        .email-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        .email-table th, .email-table td {
          text-align: left;
          padding: 10px;
          border-bottom: 1px solid #dddddd;
        }
        .email-table th {
          background-color: #f4f4f9;
          font-weight: bold;
        }
        .email-footer {
          margin-top: 20px;
          text-align: center;
          font-size: 14px;
          color: #777;
        }
        .email-footer p {
          margin: 5px 0;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="email-header">
          <h1>Relatório de Visita Técnica</h1>
        </div>
        <div class="email-body">
          <p>Prezado(a) <strong>${clientName || 'Cliente'}</strong>,</p>
          <p>Gostaríamos de informar que a visita técnica programada foi realizada com sucesso. Seguem os detalhes da visita:</p>
          <table class="email-table">
            <tr>
              <th>Cliente</th>
              <td>${clientName || 'Não especificado'}</td>
            </tr>
            <tr>
              <th>Localização</th>
              <td>${location || 'Não especificado'}</td>
            </tr>
            <tr>
              <th>Data e Hora da Visita</th>
              <td>${formattedDateTime}</td>
            </tr>
            <tr>
              <th>Visitante Técnico</th>
              <td>${username || 'Visitante não identificado'}</td>
            </tr>
          </table>
          <p>Se houver alguma dúvida ou necessidade de esclarecimentos adicionais, não hesite em nos contatar.</p>
          <p>Agradecemos pela confiança em nossos serviços e permanecemos à disposição para futuros atendimentos.</p>
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
        subject: `Relatório de Visita Técnica - ${clientName || 'Local não especificado'}`, // Assunto
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
