import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Método não permitido" });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: "E-mail não fornecido" });
  }

  try {
    // Configurar o Nodemailer com o Gmail
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Variável de ambiente para o e-mail
        pass: process.env.EMAIL_PASS, // Variável de ambiente para a senha
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
    return res.status(500).json({ success: false, message: error.message });
  }
}
