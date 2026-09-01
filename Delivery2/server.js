const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS livre para o GitHub Pages acessar
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// Banco de dados em memória estruturado
let db = {
    clientes: [],
    lojas: [
        { nome: 'Pizzaria Central', cnpj: '00.000.000/0001-00', tel: '85999999999', email: 'loja@central.com', senha: '123', aprovada: true }
    ],
    produtos: {
        'loja@central.com': [
            { nome: 'Pizza Grande Calabresa', preco: 49.90 }
        ]
    }
};

// --- ROTAS DE CLIENTES ---
app.post('/api/clientes/cadastrar', (req, res) => {
    const { nome, email, senha, tel, end } = req.body;
    const existe = db.clientes.find(c => c.email === email);
    if (existe) {
        return res.status(400).json({ sucesso: false, mensagem: 'E-mail já cadastrado!' });
    }
    db.clientes.push({ nome, email, senha, tel, end });
    res.json({ sucesso: true, mensagem: 'Cadastro realizado com sucesso!' });
});

app.post('/api/clientes/login', (req, res) => {
    const { email, senha } = req.body;
    const cliente = db.clientes.find(c => c.email === email && c.senha === senha);
    if (cliente) {
        res.json({ sucesso: true, usuario: { nome: cliente.nome, email: cliente.email } });
    } else {
        res.status(401).json({ sucesso: false, mensagem: 'E-mail ou senha incorretos!' });
    }
});

// --- ROTAS DE LOJAS ---
app.get('/api/lojas', (req, res) => {
    res.json(db.lojas);
});

app.post('/api/lojas/cadastrar', (req, res) => {
    const { nome, cnpj, tel, email, senha } = req.body;
    const existe = db.lojas.find(l => l.email === email);
    if (existe) {
        return res.status(400).json({ sucesso: false, mensagem: 'E-mail de loja já cadastrado!' });
    }
    db.lojas.push({ nome, cnpj, tel, email, senha, aprovada: false });
    res.json({ sucesso: true, mensagem: 'Loja cadastrada com sucesso! Aguarde a aprovação do Admin.' });
});

app.post('/api/lojas/login', (req, res) => {
    const { email, senha } = req.body;
    const loja = db.lojas.find(l => l.email === email && l.senha === senha);
    if (!loja) {
        return res.status(401).json({ sucesso: false, mensagem: 'E-mail ou senha da loja inválidos!' });
    }
    if (!loja.aprovada) {
        return res.status(403).json({ sucesso: false, mensagem: 'Sua loja ainda não foi aprovada pelo Administrador!' });
    }
    res.json({ sucesso: true, loja });
});

// --- ROTAS DE PRODUTOS ---
app.get('/api/produtos/:email', (req, res) => {
    const email = req.params.email;
    res.json(db.produtos[email] || []);
});

app.post('/api/produtos/adicionar', (req, res) => {
    const { emailLoja, nome, preco } = req.body;
    if (!db.produtos[emailLoja]) {
        db.produtos[emailLoja] = [];
    }
    db.produtos[emailLoja].push({ nome, preco });
    res.json({ sucesso: true, mensagem: 'Produto adicionado com sucesso!' });
});

// --- ROTAS DE ADMIN ---
app.post('/api/admin/aprovar', (req, res) => {
    const { email } = req.body;
    const loja = db.lojas.find(l => l.email === email);
    if (loja) {
        loja.aprovada = true;
        res.json({ sucesso: true, mensagem: 'Loja aprovada!' });
    } else {
        res.status(404).json({ sucesso: false, mensagem: 'Loja não encontrada' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
