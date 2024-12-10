const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const Bull = require('bull');
const app = express();

// Usar CORS para permitir acesso de outros dispositivos
app.use(cors());
app.use(express.json()); // Para interpretar o JSON no corpo das requisições

// Configuração do transporter do Nodemailer para o Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'pedro.hsl2003@gmail.com',  // Seu e-mail
    pass: 'lygv qhvk bkgo ljpu', // Sua senha de aplicativo
  },
});

// Criar uma fila para enviar os e-mails
const emailQueue = new Bull('emailQueue', {
  redis: { host: '127.0.0.1', port: 6379 } // Configuração do Redis
});

// Processar a fila de e-mails
emailQueue.process(async (job) => {
  const { email } = job.data;
  try {
    const info = await transporter.sendMail({
      from: 'pedro.hsl2003@gmail.com', 
      to: email,
      subject: 'Assunto do E-mail',
      text: 'Este é o conteúdo do e-mail!',
    });
    console.log(`E-mail enviado: ${info.response}`);
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    throw error;
  }
});

// Rota para adicionar e-mails à fila
app.post('/send-email', (req, res) => {
  const { email } = req.body;

  // Adicionar o e-mail à fila
  emailQueue.add({ email }).then(() => {
    res.status(200).json({ success: true, message: 'E-mail colocado na fila de envio.' });
  }).catch((err) => {
    res.status(500).json({ success: false, message: 'Falha ao adicionar e-mail na fila.' });
  });
});

app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});
