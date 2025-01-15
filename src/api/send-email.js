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

  try {
    for (const recipient of email) {
      await transporter.sendMail({
        from: process.env.EMAIL_USER, // Endereço do remetente
        to: recipient, // Destinatário
        subject: `Relatório de Visita Técnica - ${clientName || 'Local não especificado'}`, // Assunto
        text: `Prezado(a) ${clientName || 'Cliente'},

Gostaríamos de informar que a visita técnica programada foi realizada com sucesso. Seguem os detalhes da visita:

Cliente: ${clientName || 'Não especificado'}
Localização: ${location || 'Não especificado'}
Data e Hora da Visita: ${formattedDateTime}
Visitante Técnico: ${username || 'Visitante não identificado'}

Se houver alguma dúvida ou necessidade de esclarecimentos adicionais, não hesite em nos contatar.

Agradecemos pela confiança em nossos serviços e permanecemos à disposição para futuros atendimentos.

Atenciosamente,
[Nome da Sua Empresa]
[Informações de Contato]`,

        html: `
          <h2>Relatório de Visita Técnica</h2>
          <p><strong>Prezado(a) ${clientName || 'Cliente'},</strong></p>
          <p>Gostaríamos de informar que a visita técnica programada foi realizada com sucesso. Seguem os detalhes da visita:</p>

          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr>
              <td><strong>Cliente:</strong></td>
              <td>${clientName || 'Não especificado'}</td>
            </tr>
            <tr>
              <td><strong>Localização:</strong></td>
              <td>${location || 'Não especificado'}</td>
            </tr>
            <tr>
              <td><strong>Data e Hora da Visita:</strong></td>
              <td>${formattedDateTime}</td>
            </tr>
            <tr>
              <td><strong>Visitante Técnico:</strong></td>
              <td>${username || 'Visitante não identificado'}</td>
            </tr>
          </table>

          <p style="margin-top: 20px;">Se houver alguma dúvida ou necessidade de esclarecimentos adicionais, não hesite em nos contatar.</p>

          <p>Agradecemos pela confiança em nossos serviços e permanecemos à disposição para futuros atendimentos.</p>

          <p>Atenciosamente,<br />
          [Nome da Sua Empresa]<br />
          [Informações de Contato]</p>
        `,
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
