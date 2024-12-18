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
  const { email, clientName, location, scannedAt } = req.body;

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
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Visita Técnica Realizada',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <p>Prezado(a) <strong>${clientName || 'Cliente'}</strong>,</p>
          <p>Informamos que a visita técnica foi realizada com sucesso. Seguem os detalhes da visita:</p>
          <table style="border-collapse: collapse; width: 100%; margin-top: 10px;">
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Nome do Cliente:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${clientName || 'Nome não especificado'}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Local:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${location || 'Local não especificado'}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;"><strong>Data e Hora:</strong></td>
              <td style="padding: 8px; border: 1px solid #ddd;">${formattedDateTime}</td>
            </tr>
          </table>
          <p style="margin-top: 20px;">Agradecemos pela confiança em nossos serviços. Caso tenha dúvidas ou precise de mais informações, estamos à disposição.</p>
          <p>Atenciosamente,</p>
          <p style="color: #4CAF50;"><strong>Equipe Técnica</strong></p>
          <p><em>Este é um e-mail automático, por favor, não responda diretamente a esta mensagem.</em></p>
          <div style="text-align: center; margin-top: 30px;">
            <img src="cid:companyLogo" alt="Logo da Empresa" style="width: 150px; height: auto;" />
          </div>
        </div>
      `,
      attachments: [
        {
          filename: 'logo.png',
          path: './assets/logo.png', // Caminho atualizado para o arquivo da logo
          cid: 'companyLogo', // Deve corresponder ao "cid" usado no HTML acima
        },
      ],
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
