const express = require('express');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

// Carregar variáveis de ambiente locais (apenas para desenvolvimento)
dotenv.config();

const app = express();
app.use(express.json()); // Permite ler JSON no corpo das requisições

// Rota de envio de e-mail
app.post('/api/send-email', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: "E-mail não fornecido" });
  }

  try {
    // Configuração do Nodemailer para usar o Gmail
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Seu e-mail configurado na Vercel
        pass: process.env.EMAIL_PASS, // Senha de aplicativo gerada pelo Gmail
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Aviso de Visita Técnica",
      text: "O técnico realizou a visita no local.",
    };

    // Enviar o e-mail
    await transporter.sendMail(mailOptions);

    return res.status(200).json({ success: true, message: "E-mail enviado com sucesso!" });
  } catch (error) {
    console.error("Erro ao enviar e-mail:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Definir a porta do servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
