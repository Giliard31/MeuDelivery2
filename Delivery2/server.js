const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Permitir acesso público (CORS básico)
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// Banco de dados em memória temporária (ou arquivo)
let db = {
    clientes: [],
    lojas: [
        { nome: 'Pizzaria Central', email: 'loja@central.com', senha: '123', aprovada: true }
    ],
    produtos: {
        'loja@central.com': [
            { nome: 'Pizza Grande Calabresa', preco: 49.90 }
        ]
    }
};

// --- ROTAS DA API ---

// Listar lojas aprovadas para o cliente ver
app.get('/api/lojas', (req, res) => {
    res.json(db.lojas);
});

// Cadastrar nova loja (Vai como pendente)
app.post('/api/lojas/cadastrar', (req, res) => {
    const { nome, cnpj, tel, email, senha } = req.body;
    db.lojas.push({ nome, cnpj, tel, email, senha, aprovada: false });
    res.json({ sucesso: true, mensagem: 'Loja cadastrada com sucesso!' });
});

// Admin aprovar loja
app.post('/api/admin/aprovar', (req, res) => {
    const { email } = req.body;
    const loja = db.lojas.find(l => l.email === email);
    if (loja) {
        loja.aprovada = true;
        res.json({ sucesso: true });
    } else {
        res.status(404).json({ sucesso: false, mensagem: 'Loja não encontrada' });
    }
});

// Cadastrar produto da loja
app.post('/api/produtos/adicionar', (req, res) => {
    const { emailLoja, nome, preco } = req.body;
    if (!db.produtos[emailLoja]) {
        db.produtos[emailLoja] = [];
    }
    db.produtos[emailLoja].push({ nome, preco });
    res.json({ sucesso: true });
});

// Ver produtos de uma loja
app.get('/api/produtos/:email', (req, res) => {
    const email = req.params.email;
    res.json(db.produtos[email] || []);
});

// Porta dinâmica fornecida pelo Render ou porta 3000 local
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
