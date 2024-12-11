require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/api/send-email', async (req, res) => {
  const { email } = req.body;

  if (!email || !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
    return res.status(400).json({ success: false, message: 'E-mail inválido ou não fornecido' });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Aviso de Visita Técnica',
      text: 'O técnico realizou a visita no local.',
    };

    await transporter.sendMail(mailOptions);
    return res.status(200).json({ success: true, message: 'E-mail enviado com sucesso!' });
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error.message);
    return res.status(500).json({ success: false, message: 'Erro ao enviar o e-mail' });
  }
});

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
