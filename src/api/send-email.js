const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const cors = require('cors');
const fs = require('fs');
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

// Função para converter a imagem em Base64
const convertImageToBase64 = (imagePath) => {
  const image = fs.readFileSync(imagePath);
  return image.toString('base64');
};

// API Routes
app.post('/', async (req, res) => {
  const { email, clientName, location, scannedAt, signatureUrl } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'E-mail é obrigatório.' });
  }

  const scanDateTime = scannedAt || new Date();
  const formattedDateTime = scanDateTime.toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    dateStyle: 'short',
    timeStyle: 'short',
  });

  // Converter a imagem para Base64
  const base64Image = convertImageToBase64(signatureUrl); // Assumindo que signatureUrl é o caminho da imagem

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Visita Técnica Realizada',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="data:image/png;base64,${base64Image}" alt="Logo da Empresa" style="width: 150px; height: auto;" />
          </div>
          <p style="font-size: 16px; color: #333;">
            Prezados(as),
          </p>
          <p style="font-size: 16px; color: #333;">
            Informamos que a visita técnica para a empresa <strong>${clientName || 'Cliente'}</strong> foi realizada com sucesso. Seguem os detalhes da visita:
          </p>
          <p style="font-size: 16px; color: #333;">
            <strong>Local:</strong> ${location || 'Local não especificado'}<br />
            <strong>Data e Hora:</strong> ${formattedDateTime}
          </p>
          <p style="font-size: 16px; color: #333; margin-top: 20px;">
            Agradecemos pela confiança em nossos serviços. Caso tenha dúvidas ou precise de mais informações, estamos à disposição.
          </p>
          <p style="font-size: 16px; color: #333; margin-top: 20px;">
            Atenciosamente,<br />
            <span style="color: #4CAF50; font-weight: bold;">Equipe Técnica</span>
          </p>
          <p style="font-size: 14px; color: #999; text-align: center; margin-top: 20px;">
            <em>Este é um e-mail automático, por favor, não responda diretamente a esta mensagem.</em>
          </p>
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
