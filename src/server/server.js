const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const app = express();

// Usar CORS para permitir acesso de outros dispositivos
app.use(cors());
app.use(express.json()); // Para interpretar o JSON no corpo das requisições

// Configuração do transporter do Nodemailer para o Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'pedro.hsl2003@gmail.com',  // Seu e-mail
    pass: 'lygv qhvk bkgo ljpu',     // Senha de aplicativo
  },
});

// Endpoint para enviar o e-mail
app.post('/send-email', (req, res) => {
  const { email } = req.body;

  const mailOptions = {
    from: 'pedro.hsl2003@gmail.com',  // Seu e-mail
    to: email,  // E-mail do cliente extraído do QR Code
    subject: 'Aviso de Visita Técnica',
    text: 'O técnico realizou a visita no local.',
  };

  // Enviando o e-mail
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
    res.status(200).json({ success: true, message: 'E-mail enviado com sucesso!' });
  });
});

// Inicia o servidor na porta 3000
app.listen(3000, () => {
  console.log('Servidor backend rodando na porta 3000');
});
