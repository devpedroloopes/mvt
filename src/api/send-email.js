const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Configuração do Nodemailer para o servidor SMTP
const transporter = nodemailer.createTransport({
  host: 'email-ssl.com.br', // Servidor SMTP de saída
  port: 465, // Porta para SSL
  secure: true, // Usar SSL
  auth: {
    user: 'info@conforlab.com.br', // Seu e-mail corporativo
    pass: 'Conforl@b123', // Sua senha ou senha configurada
  },
});

// Rota para enviar e-mails
app.post('/send-email', async (req, res) => {
  const { email, clientName, location, scannedAt } = req.body;

  // Validar os dados recebidos
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
        from: 'info@conforlab.com.br', // Remetente
        to: recipient, // Destinatário
        subject: 'Aviso de Visita Técnica Realizada - Conforlab',
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
            <p style="font-size: 18px; color: #4CAF50; font-weight: bold; text-align: center;">
              Conforlab - Qualidade em Serviços Técnicos
            </p>
            <p style="font-size: 16px; color: #333; margin-top: 20px;">
              Prezado(a) cliente,
            </p>
            <p style="font-size: 16px; color: #333;">
              Informamos que nossa equipe técnica da <span style="color: #4CAF50; font-weight: bold;">Conforlab</span> realizou a visita técnica conforme solicitado. Seguem os detalhes:
            </p>
            <p style="font-size: 16px; color: #333;">
              <strong>Cliente:</strong> ${clientName || 'Cliente não informado'}<br />
              <strong>Local:</strong> ${location || 'Local não especificado'}<br />
              <strong>Data e Hora:</strong> ${formattedDateTime}
            </p>
            <p style="font-size: 16px; color: #333; margin-top: 20px;">
              Agradecemos pela confiança em nossa equipe. Caso precise de mais informações ou tenha alguma dúvida, estamos à disposição.
            </p>
            <p style="font-size: 16px; color: #333; margin-top: 20px;">
              Atenciosamente,<br />
              <span style="color: #4CAF50; font-weight: bold;">Equipe Conforlab</span>
            </p>
            <p style="font-size: 14px; color: #999; text-align: center; margin-top: 20px;">
              <em>Este é um e-mail automático. Por favor, não responda diretamente a esta mensagem.</em>
            </p>
          </div>
        `,
      });
    }

    res.status(200).json({ success: true, message: 'E-mails enviados com sucesso!' });
  } catch (error) {
    console.error('Erro ao enviar o e-mail:', error);
    res.status(500).json({ success: false, message: 'Erro ao enviar o e-mail.' });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
