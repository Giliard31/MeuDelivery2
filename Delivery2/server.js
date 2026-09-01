const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

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

// --- CLIENTES ---
app.post('/api/clientes/cadastrar', (req, res) => {
    const { nome, email, senha, tel, end } = req.body;
    if (db.clientes.find(c => c.email === email) || db.lojas.find(l => l.email === email)) {
        return res.status(400).json({ sucesso: false, mensagem: 'E-mail já cadastrado no sistema!' });
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

// --- LOJAS ---
app.get('/api/lojas', (req, res) => {
    res.json(db.lojas);
});

app.post('/api/lojas/cadastrar', (req, res) => {
    const { nome, cnpj, tel, email, senha } = req.body;
    if (db.lojas.find(l => l.email === email) || db.clientes.find(c => c.email === email)) {
        return res.status(400).json({ sucesso: false, mensagem: 'E-mail já cadastrado!' });
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
        return res.status(403).json({ sucesso: false, aprovada: false, mensagem: 'Sua loja está aguardando a aprovação do Administrador.' });
    }
    res.json({ sucesso: true, aprovada: true, loja });
});

// --- PRODUTOS ---
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
    res.json({ sucesso: true });
});

// --- ADMIN ---
app.post('/api/admin/aprovar', (req, res) => {
    const { email } = req.body;
    const loja = db.lojas.find(l => l.email === email);
    if (loja) {
        loja.aprovada = true;
        res.json({ sucesso: true, mensagem: 'Loja aprovada com sucesso!' });
    } else {
        res.status(404).json({ sucesso: false, mensagem: 'Loja não encontrada' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
