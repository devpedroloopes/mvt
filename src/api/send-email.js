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
      line-height: 1.5;
      margin: 0;
      padding: 0;
      color: #333333;
    }
    .email-container {
      max-width: 600px;
      margin: 20px auto;
      padding: 20px;
      border: 1px solid #dddddd; /* Borda externa única */
      border-radius: 8px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    }
    .email-header {
      text-align: center;
      padding: 10px 0;
    }
    .email-header h1 {
      font-size: 20px;
      color: #0056b3;
      margin: 0;
    }
    .email-body {
      padding: 10px 0;
    }
    .email-body p {
      margin: 10px 0;
      font-size: 16px;
    }
    .email-body .section-title {
      font-size: 18px;
      font-weight: bold;
      color: #0056b3;
      margin-top: 20px;
    }
    .email-body .details {
      margin: 10px 0;
    }
    .email-body .details p {
      margin: 5px 0;
      font-size: 15px;
    }
    .email-body .note {
      font-size: 14px;
      color: #888888; /* Cinza claro para menos destaque */
      margin-top: 20px;
      text-align: center;
    }
    .email-footer {
      text-align: center;
      padding: 10px 0;
      font-size: 14px;
      color: #555555;
    }
    .email-footer p {
      margin: 5px 0;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <!-- Header -->
    <div class="email-header">
      <h1>Conforlab - Aviso de Visita</h1>
    </div>

    <!-- Body -->
    <div class="email-body">
      <p>Prezado(a) <strong>${clientName || 'Cliente'}</strong>,</p>
      <p>Informamos que nossa equipe técnica concluiu a visita ao local indicado. Agradecemos pela confiança em nossos serviços e estamos à disposição para eventuais dúvidas ou necessidades futuras.</p>

      <p class="section-title">Detalhes da Visita</p>
      <div class="details">
        <p><strong>Local:</strong> ${location || 'Não especificado'}</p>
        <p><strong>Data e Hora:</strong> ${formattedDateTime}</p>
        <p><strong>Técnico:</strong> ${username || 'Não identificado'}</p>
      </div>

      <p class="note">Este e-mail é gerado automaticamente. Por favor, não responda a esta mensagem.</p>
    </div>

    <!-- Footer -->
    <div class="email-footer">
      <p>Atenciosamente,</p>
      <p><strong>Equipe Conforlab</strong></p>
      <p>📞 Telefone: (11) 5094-6280 | ✉️ E-mail: tratamento@conforlab.com.br</p>
      <p>🌐 Site: <a href="https://www.conforlab.com.br" style="color: #0056b3; text-decoration: none;">www.conforlab.com.br</a></p>
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
