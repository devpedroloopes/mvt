const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const Bull = require('bull');
const app = express();

// Usar CORS para permitir acesso de outros dispositivos
app.use(cors());  // Habilita todas as origens. Em produção, você pode limitar a origem.
app.use(express.json()); // Para interpretar o JSON no corpo das requisições

// Configuração do transporter do Nodemailer para o Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'pedro.hsl2003@gmail.com',  // Seu e-mail
    pass: 'lygv qhvk bkgo ljpu',     // Senha de aplicativo
  },
});

// Criar uma fila para enviar os e-mails com Redis
const emailQueue = new Bull('emailQueue', {
  redis: { host: '127.0.0.1', port: 6379 }  // Configuração do Redis
});

// Processar a fila de e-mails
emailQueue.process(async (job) => {
  const { email } = job.data;
  try {
    const info = await transporter.sendMail({
      from: 'pedro.hsl2003@gmail.com',  // Seu e-mail
      to: email,  // E-mail do cliente extraído do QR Code
      subject: 'Aviso de Visita Técnica',
      text: 'O técnico realizou a visita no local.',
    });
    console.log(`E-mail enviado: ${info.response}`);
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    throw error;
  }
});

// Endpoint para adicionar e-mails à fila
app.post('/send-email', (req, res) => {
  const { email } = req.body;

  // Adicionar o e-mail à fila
  emailQueue.add({ email }).then(() => {
    res.status(200).json({ success: true, message: 'E-mail colocado na fila de envio.' });
  }).catch((err) => {
    res.status(500).json({ success: false, message: 'Falha ao adicionar e-mail na fila.' });
  });
});

// Iniciar o servidor na porta 3000 (no Render será configurado para rodar em outra porta)
app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});
