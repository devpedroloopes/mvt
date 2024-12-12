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
  const { email, name, location, scannedAt } = req.body;

  if (!email || !name) {
    return res.status(400).json({ success: false, message: 'E-mail e nome do cliente são obrigatórios.' });
  }

  const scanDateTime = scannedAt || new Date();
  const formattedDateTime = scanDateTime.toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
  }).replace(/\//g, '/'); // Ensure dd/mm/yyyy hh:mm format

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Aviso de Visita Técnica: ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; color: #333;">
          <h2 style="text-align: center; color: #0056b3;">Aviso de Visita Técnica</h2>
          <p>Prezado(a) <strong>${name}</strong>,</p>
          <p>Informamos que nossa equipe realizou uma visita técnica conforme os detalhes abaixo:</p>
          <ul style="list-style: none; padding: 0; margin: 15px 0;">
            <li><strong>Data e Hora:</strong> ${formattedDateTime}</li>
            <li><strong>Local:</strong> ${location || 'Local não especificado'}</li>
          </ul>
          <p>Caso tenha alguma dúvida ou precise de informações adicionais, não hesite em nos contatar.</p>
          <p>Atenciosamente,</p>
          <p style="font-weight: bold; color: #0056b3;">Equipe de Suporte Técnico</p>
        </div>
      `,
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
