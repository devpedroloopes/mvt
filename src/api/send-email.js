const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

// Carregar variáveis de ambiente locais (apenas para desenvolvimento)
dotenv.config();

async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Método não permitido" });
  }

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
}

// Exportando a função
module.exports = handler;
