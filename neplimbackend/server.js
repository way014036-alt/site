require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// MERCADO PAGO — usado somente para pagamentos; entrega do jogo é manual
const { MercadoPagoConfig, Payment } = require("mercadopago");

const app = express();
app.use(cors());
app.use(express.json());

// ═══════════════════════════════════════════════
// CONFIGURAÇÃO DO MERCADO PAGO
// ═══════════════════════════════════════════════
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN
});
const payment = new Payment(client);

// ═══════════════════════════════════════════════
// ENTREGA MANUAL PELO DISCORD
// ═══════════════════════════════════════════════
// O backend NÃO gera e NÃO solicita Steam Keys de fornecedor.
// Depois de um pagamento aprovado, ele cria somente um código NEPLIM-...
// que o cliente apresenta em um ticket. A entrega do jogo fica manual.
const BOT_SYNC_SECRET = process.env.BOT_SYNC_SECRET || "troque_esse_segredo_em_producao";


// ═══════════════════════════════════════════════
// CÓDIGOS DE COMPROVANTE PARA SUPORTE NO DISCORD
// ═══════════════════════════════════════════════
// Estes códigos NÃO são Steam Keys. Cada pagamento aprovado recebe um código
// NEPLIM-... único. O cliente envia esse código no ticket e o bot usa
// /bot/validar-codigo para vinculá-lo a um usuário do Discord uma única vez.
const SUPPORT_CODES_FILE = path.join(__dirname, "support_codes.json");
const SUPPORT_CODE_PREFIX = "NEPLIM-";
const SUPPORT_CODE_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
const SUPPORT_CODE_RANDOM_LENGTH = 24;
const SUPPORT_CODE_REGEX = /^NEPLIM-[A-Z0-9]{8,128}$/;

function atomicWriteJson(filePath, value) {
  const tempPath = `${filePath}.${process.pid}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(value, null, 2), "utf8");
  fs.renameSync(tempPath, filePath);
}

function loadSupportCodes() {
  if (!fs.existsSync(SUPPORT_CODES_FILE)) {
    atomicWriteJson(SUPPORT_CODES_FILE, []);
  }

  try {
    const parsed = JSON.parse(fs.readFileSync(SUPPORT_CODES_FILE, "utf8"));
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Erro ao carregar support_codes.json:", error);
    return [];
  }
}

function saveSupportCodes(codes) {
  atomicWriteJson(SUPPORT_CODES_FILE, codes);
}

function normalizeSupportCode(code) {
  return String(code || "").trim().toUpperCase();
}

function generateRandomSupportCode(existingCodes) {
  const used = new Set(existingCodes.map(item => normalizeSupportCode(item.code)));

  for (let attempt = 0; attempt < 100; attempt += 1) {
    let suffix = "";
    for (let index = 0; index < SUPPORT_CODE_RANDOM_LENGTH; index += 1) {
      suffix += SUPPORT_CODE_ALPHABET[crypto.randomInt(0, SUPPORT_CODE_ALPHABET.length)];
    }

    const candidate = `${SUPPORT_CODE_PREFIX}${suffix}`;
    if (!used.has(candidate)) return candidate;
  }

  throw new Error("Não foi possível gerar um código de suporte único.");
}

function findSupportCodeByPaymentId(paymentId, codes = null) {
  const list = codes || loadSupportCodes();
  return list.find(item => String(item.paymentId) === String(paymentId)) || null;
}

function ensureSupportCodeForPurchase({ paymentId, emailUsuario, nomeUsuario, tituloJogo, valor, metodo }) {
  const codes = loadSupportCodes();
  const existingIndex = codes.findIndex(item => String(item.paymentId) === String(paymentId));

  if (existingIndex !== -1) {
    const existing = codes[existingIndex];
    let changed = false;
    const updates = {
      emailUsuario: emailUsuario || existing.emailUsuario || null,
      nomeUsuario: nomeUsuario || existing.nomeUsuario || null,
      productName: tituloJogo || existing.productName || "Jogo Digital",
      value: Number(valor ?? existing.value ?? 0),
      paymentMethod: metodo || existing.paymentMethod || "desconhecido",
      paymentStatus: "approved"
    };

    for (const [key, value] of Object.entries(updates)) {
      if (existing[key] !== value) {
        existing[key] = value;
        changed = true;
      }
    }

    if (changed) {
      existing.updatedAt = new Date().toISOString();
      saveSupportCodes(codes);
    }
    return existing;
  }

  const record = {
    code: generateRandomSupportCode(codes),
    paymentId: String(paymentId),
    emailUsuario: emailUsuario || null,
    nomeUsuario: nomeUsuario || null,
    productName: tituloJogo || "Jogo Digital",
    value: Number(valor) || 0,
    paymentMethod: metodo || "desconhecido",
    paymentStatus: "approved",
    status: "available",
    createdAt: new Date().toISOString(),
    usedAt: null,
    buyerDiscordId: null,
    buyerDiscordUsername: null,
    validatedByDiscordId: null,
    validatedByDiscordUsername: null,
    guildId: null,
    channelId: null
  };

  codes.push(record);
  saveSupportCodes(codes);
  return record;
}

function syncSupportCodeIntoPurchaseFiles(record) {
  const sales = loadSales();
  const saleIndex = sales.findIndex(item => String(item.id_pagamento) === String(record.paymentId));
  if (saleIndex !== -1) {
    sales[saleIndex].support_code = record.code;
    // Compatibilidade com o frontend antigo, que exibe apenas o campo steam_key.
    // O valor abaixo é um comprovante de compra, NÃO uma Steam Key.
    sales[saleIndex].steam_key = record.code;
    sales[saleIndex].delivery_type = "manual_ticket";
    sales[saleIndex].support_code_status = record.status;
    sales[saleIndex].support_code_used_by_discord_id = record.buyerDiscordId || null;
    sales[saleIndex].support_code_used_at = record.usedAt || null;
    saveSales(sales);
  }

  if (record.emailUsuario) {
    const users = loadUsers();
    const userIndex = users.findIndex(
      user => String(user.email || "").toLowerCase() === String(record.emailUsuario).toLowerCase()
    );

    if (userIndex !== -1 && Array.isArray(users[userIndex].compras)) {
      const purchase = users[userIndex].compras.find(
        item => String(item.id_pagamento) === String(record.paymentId)
      );

      if (purchase) {
        purchase.support_code = record.code;
        // Compatibilidade com a tela atual de Minhas Compras.
        purchase.steam_key = record.code;
        purchase.delivery_type = "manual_ticket";
        purchase.support_code_status = record.status;
        purchase.support_code_used_by_discord_id = record.buyerDiscordId || null;
        purchase.support_code_used_at = record.usedAt || null;
        saveUsers(users);
      }
    }
  }
}

// Middleware: protege as rotas que só o bot de Discord deve acessar
function verificarSegredoBot(req, res, next) {
  const segredo = req.headers["x-bot-secret"];
  if (!segredo || segredo !== BOT_SYNC_SECRET) {
    return res.status(401).json({ erro: "Não autorizado." });
  }
  next();
}

// Compatibilidade com versões antigas do bot: nunca há Steam Keys pendentes.
// Isso impede que um sync_loja.py antigo continue tentando chamar fornecedores.
app.get("/bot/pedidos-pendentes", verificarSegredoBot, (_req, res) => {
  return res.json([]);
});

app.post("/bot/entregar-key", verificarSegredoBot, (_req, res) => {
  return res.status(410).json({
    erro: "Entrega automática desativada. A entrega agora é manual pelo ticket do Discord."
  });
});

// Valida e consome um código de comprovante enviado pelo cliente no ticket.
// A leitura e a gravação são síncronas dentro desta requisição, evitando que
// duas validações concorrentes usem o mesmo código nesta instância do servidor.
app.post("/bot/validar-codigo", verificarSegredoBot, (req, res) => {
  try {
    const codigo = normalizeSupportCode(req.body?.codigo);
    const discordUserId = String(req.body?.discordUserId || "").trim();
    const discordUsername = String(req.body?.discordUsername || "Usuário não informado").trim();
    const validadoPorId = String(req.body?.validadoPorId || "").trim();
    const validadoPorUsername = String(req.body?.validadoPorUsername || "Validador não informado").trim();
    const guildId = String(req.body?.guildId || "").trim();
    const channelId = String(req.body?.channelId || "").trim();

    if (!SUPPORT_CODE_REGEX.test(codigo)) {
      return res.status(400).json({
        status: "invalid",
        message: "Formato de código inválido."
      });
    }

    if (!/^\d{15,25}$/.test(discordUserId)) {
      return res.status(400).json({
        status: "invalid",
        message: "discordUserId inválido."
      });
    }

    const codes = loadSupportCodes();
    const index = codes.findIndex(item => normalizeSupportCode(item.code) === codigo);

    if (index === -1) {
      return res.status(404).json({
        status: "invalid",
        message: "Código não encontrado ou não pertence a uma compra aprovada."
      });
    }

    const record = codes[index];
    const sale = loadSales().find(
      item => String(item.id_pagamento) === String(record.paymentId)
    );

    if (record.paymentStatus !== "approved" || (sale && sale.status !== "approved")) {
      return res.status(422).json({
        status: "invalid",
        message: "A compra ligada a este código não está aprovada."
      });
    }

    if (record.status === "used" || record.buyerDiscordId) {
      return res.status(409).json({
        status: "already_activated",
        message: "Este código já foi validado anteriormente.",
        buyerDiscordId: record.buyerDiscordId,
        buyerName: record.buyerDiscordUsername,
        orderId: record.paymentId,
        productName: record.productName,
        activatedAt: record.usedAt
      });
    }

    record.status = "used";
    record.usedAt = new Date().toISOString();
    record.buyerDiscordId = discordUserId;
    record.buyerDiscordUsername = discordUsername;
    record.validatedByDiscordId = validadoPorId || null;
    record.validatedByDiscordUsername = validadoPorUsername || null;
    record.guildId = guildId || null;
    record.channelId = channelId || null;
    record.updatedAt = record.usedAt;

    codes[index] = record;
    saveSupportCodes(codes);
    syncSupportCodeIntoPurchaseFiles(record);

    return res.status(200).json({
      status: "validated",
      message: "Código válido e vinculado ao comprador no Discord.",
      buyerDiscordId: record.buyerDiscordId,
      buyerName: record.buyerDiscordUsername,
      orderId: record.paymentId,
      productName: record.productName,
      activatedAt: record.usedAt
    });
  } catch (error) {
    console.error("Erro ao validar código de suporte:", error);
    return res.status(500).json({
      status: "error",
      message: "Erro interno ao validar o código."
    });
  }
});

// ═══════════════════════════════════════════════
// SISTEMA DE USUÁRIOS (persistência em arquivo JSON)
// ═══════════════════════════════════════════════
const USERS_FILE = path.join(__dirname, "users.json");
const JWT_SECRET = process.env.JWT_SECRET || "neplim_store_secret_super_seguro";

// ═══════════════════════════════════════════════
// SISTEMA DE ADMINISTRADOR (login fixo, separado dos usuários comuns)
// ═══════════════════════════════════════════════
// Usuário e senha do admin vêm SEMPRE do .env — nunca de users.json.
// O ADMIN_JWT_SECRET é diferente do JWT_SECRET de cliente: um token de
// cliente jamais vai ser aceito nas rotas /admin/*, e vice-versa.
const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASS = process.env.ADMIN_PASS || "troque_essa_senha";
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || "neplim_admin_secret_troque_em_producao";

const PRODUCTS_FILE = path.join(__dirname, "products.json");
const SALES_FILE = path.join(__dirname, "sales.json");
const COUPONS_FILE = path.join(__dirname, "coupons.json");

// Carrega ou inicializa o arquivo de usuários
function loadUsers() {
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([]));
  }
  try {
    const data = fs.readFileSync(USERS_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Salva a lista de usuários no arquivo JSON
function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// Carrega ou inicializa o arquivo de produtos
function loadProducts() {
  if (!fs.existsSync(PRODUCTS_FILE)) {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify([]));
  }
  try {
    const data = fs.readFileSync(PRODUCTS_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Salva a lista de produtos no arquivo JSON
function saveProducts(products) {
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
}

// Carrega ou inicializa o arquivo de vendas (histórico centralizado para o painel ADM)
function loadSales() {
  if (!fs.existsSync(SALES_FILE)) {
    fs.writeFileSync(SALES_FILE, JSON.stringify([]));
  }
  try {
    const data = fs.readFileSync(SALES_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Salva a lista de vendas no arquivo JSON
function saveSales(sales) {
  fs.writeFileSync(SALES_FILE, JSON.stringify(sales, null, 2));
}

// Carrega ou inicializa o arquivo de cupons de desconto
function loadCoupons() {
  if (!fs.existsSync(COUPONS_FILE)) {
    fs.writeFileSync(COUPONS_FILE, JSON.stringify([]));
  }
  try {
    const data = fs.readFileSync(COUPONS_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Salva a lista de cupons no arquivo JSON
function saveCoupons(coupons) {
  fs.writeFileSync(COUPONS_FILE, JSON.stringify(coupons, null, 2));
}

// Registra uma venda no histórico centralizado (usado pelo painel ADM)
function registrarVendaCentralizada({ emailUsuario, nomeUsuario, tituloJogo, valor, idPagamento, metodo, steamKey, supportCode }) {
  const sales = loadSales();
  const jaExiste = sales.some(s => s.id_pagamento === String(idPagamento));
  if (jaExiste) return;
  sales.push({
    id: uuidv4(),
    id_pagamento: String(idPagamento),
    email_usuario: emailUsuario || null,
    nome_usuario: nomeUsuario || null,
    titulo_jogo: tituloJogo || "Jogo Digital",
    valor: Number(valor) || 0,
    metodo: metodo || "desconhecido",
    status: "approved",
    // Quando há código de suporte, ele ocupa temporariamente o campo antigo
    // para o frontend atual conseguir exibi-lo sem uma alteração imediata.
    steam_key: supportCode || steamKey || null,
    support_code: supportCode || null,
    delivery_type: supportCode ? "manual_ticket" : "legacy",
    support_code_status: supportCode ? "available" : null,
    support_code_used_by_discord_id: null,
    support_code_used_at: null,
    data: new Date().toISOString()
  });
  saveSales(sales);
}

// Middleware de Autenticação para Proteger Rotas de Cliente
function verificarToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ erro: "Não autorizado. Token ausente." });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.usuarioLogado = decoded; // insere id e email no req
    next();
  } catch (error) {
    return res.status(401).json({ erro: "Token inválido ou expirado." });
  }
}

// Middleware de Autenticação para Proteger Rotas de ADM
// Usa um segredo JWT totalmente separado do token de cliente — um token
// de cliente nunca passa aqui, mesmo que o usuário tente forjar o payload.
function verificarTokenAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ erro: "Não autorizado. Token de admin ausente." });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, ADMIN_JWT_SECRET);
    if (decoded.role !== "admin") {
      return res.status(403).json({ erro: "Acesso restrito ao administrador." });
    }
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ erro: "Token de admin inválido ou expirado." });
  }
}

// Normaliza texto para comparação "parecido" (remove acentos, espaços, case, símbolos)
function normalizarParaComparacao(texto) {
  return String(texto || "")
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove acentos
    .replace(/[^a-z0-9]/g, ""); // remove espaços, pontuação, símbolos
}

// Impede que um usuário comum cadastre nome ou e-mail parecido com os dados do admin,
// evitando confusão ou tentativa de se passar pelo administrador da loja.
function pareceComAdmin(nome, email) {
  const adminUserNorm = normalizarParaComparacao(ADMIN_USER);
  const nomeNorm = normalizarParaComparacao(nome);
  const emailLocalPart = normalizarParaComparacao(String(email || "").split("@")[0]);

  if (!adminUserNorm) return false;

  // Bloqueia igualdade exata normalizada, e também o nome do admin "contido" no
  // nome/e-mail escolhido (ex.: "admin", "Administrador", "adm1n", "the-admin")
  if (nomeNorm === adminUserNorm || nomeNorm.includes(adminUserNorm)) return true;
  if (emailLocalPart === adminUserNorm || emailLocalPart.includes(adminUserNorm)) return true;

  // Bloqueia também a palavra genérica "admin"/"administrador" como precaução extra
  if (/admin/.test(nomeNorm) || /admin/.test(emailLocalPart)) return true;

  return false;
}

// ═══════════════════════════════════════════════
// ROTAS DE AUTENTICAÇÃO
// ═══════════════════════════════════════════════

// Cadastro de Usuário
app.post("/register", async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ erro: "Preencha todos os campos obrigatórios." });
    }

    if (pareceComAdmin(nome, email)) {
      return res.status(400).json({ erro: "Este nome ou e-mail não pode ser utilizado." });
    }

    const users = loadUsers();
    const jaExiste = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (jaExiste) {
      return res.status(400).json({ erro: "Este e-mail já está cadastrado." });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const novoUsuario = {
      id: uuidv4(),
      nome,
      email,
      senhaHash,
      compras: [], // Histórico de compras inicializado vazio
      criadoEm: new Date().toISOString()
    };

    users.push(novoUsuario);
    saveUsers(users);

    return res.status(201).json({ mensagem: "Usuário cadastrado com sucesso!" });
  } catch (error) {
    console.error("Erro no cadastro:", error);
    return res.status(500).json({ erro: "Erro interno no servidor." });
  }
});

// Login de Usuário
app.post("/login", async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ erro: "E-mail e senha são obrigatórios." });
    }

    const users = loadUsers();
    const usuario = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!usuario) {
      return res.status(400).json({ erro: "E-mail ou senha incorretos." });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senhaHash);
    if (!senhaValida) {
      return res.status(400).json({ erro: "E-mail ou senha incorretos." });
    }

    // Gera o Token JWT contendo ID e E-mail
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, nome: usuario.nome },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      mensagem: "Login realizado com sucesso!",
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email
      }
    });
  } catch (error) {
    console.error("Erro no login:", error);
    return res.status(500).json({ erro: "Erro interno no servidor." });
  }
});

// Trocar a senha do usuário logado (Configurações)
app.put("/alterar-senha", verificarToken, async (req, res) => {
  try {
    const { senhaAtual, novaSenha } = req.body;

    if (!senhaAtual || !novaSenha) {
      return res.status(400).json({ erro: "Preencha a senha atual e a nova senha." });
    }
    if (novaSenha.length < 6) {
      return res.status(400).json({ erro: "A nova senha deve ter ao menos 6 caracteres." });
    }

    const users = loadUsers();
    const index = users.findIndex(u => u.id === req.usuarioLogado.id);
    if (index === -1) {
      return res.status(404).json({ erro: "Usuário não encontrado." });
    }

    const senhaValida = await bcrypt.compare(senhaAtual, users[index].senhaHash);
    if (!senhaValida) {
      return res.status(400).json({ erro: "Senha atual incorreta." });
    }

    users[index].senhaHash = await bcrypt.hash(novaSenha, 10);
    saveUsers(users);

    return res.json({ mensagem: "Senha alterada com sucesso!" });
  } catch (error) {
    console.error("Erro ao alterar senha:", error);
    return res.status(500).json({ erro: "Erro interno no servidor." });
  }
});

// ═══════════════════════════════════════════════
// LOGIN DO ADMINISTRADOR (separado do login de cliente)
// ═══════════════════════════════════════════════
app.post("/admin/login", (req, res) => {
  try {
    const { usuario, senha } = req.body;

    if (!usuario || !senha) {
      return res.status(400).json({ erro: "Usuário e senha são obrigatórios." });
    }

    // Comparação simples e direta: usuário/senha fixos, vindos do .env.
    // Não há cadastro, não há bcrypt aqui — é só o dono da loja.
    if (usuario !== ADMIN_USER || senha !== ADMIN_PASS) {
      return res.status(401).json({ erro: "Usuário ou senha incorretos." });
    }

    const token = jwt.sign(
      { role: "admin", usuario: ADMIN_USER },
      ADMIN_JWT_SECRET,
      { expiresIn: "12h" }
    );

    return res.json({ mensagem: "Login de administrador realizado com sucesso!", token });
  } catch (error) {
    console.error("Erro no login de admin:", error);
    return res.status(500).json({ erro: "Erro interno no servidor." });
  }
});

// ═══════════════════════════════════════════════
// ROTA PÚBLICA DE PRODUTOS (consumida pela loja)
// ═══════════════════════════════════════════════
app.get("/produtos", (req, res) => {
  try {
    const products = loadProducts();
    // Para o público, só mostramos produtos ativos
    return res.json(products.filter(p => p.active !== false));
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    return res.status(500).json({ erro: "Erro ao carregar produtos." });
  }
});

// ═══════════════════════════════════════════════
// ROTAS DE PAGAMENTO & HISTÓRICO
// ═══════════════════════════════════════════════

// Buscar histórico de compras do usuário logado
app.get("/minhas-compras", verificarToken, (req, res) => {
  try {
    const users = loadUsers();
    const usuario = users.find(u => u.id === req.usuarioLogado.id);

    if (!usuario) {
      return res.status(404).json({ erro: "Usuário não encontrado." });
    }

    const compras = (usuario.compras || []).map(compra => {
      const codigoSuporte = compra.support_code || null;
      return {
        ...compra,
        codigo_suporte: codigoSuporte,
        support_code: codigoSuporte,
        // Compatibilidade com o frontend atual. Não é uma Steam Key.
        steam_key: codigoSuporte || compra.steam_key || null,
        delivery_type: codigoSuporte ? "manual_ticket" : (compra.delivery_type || "legacy"),
        mensagem_entrega: codigoSuporte
          ? "Abra um ticket no Discord e envie este código para receber o jogo manualmente."
          : null
      };
    });

    return res.json(compras);
  } catch (error) {
    console.error("Erro ao buscar compras:", error);
    return res.status(500).json({ erro: "Erro ao carregar o histórico de compras." });
  }
});

// Criar Pagamento via Cartão de Crédito/Débito
app.post("/criar-pagamento-cartao", async (req, res) => {
  try {
    const { token, payment_method_id, issuer_id, installments, valor, emailUsuario, tituloJogo, cpf, appId } = req.body;

    if (!token || !payment_method_id || !valor || !emailUsuario || !tituloJogo) {
      return res.status(400).json({ erro: "Dados insuficientes para gerar o pagamento." });
    }

    const uniqueId = uuidv4();

    const paymentData = {
      body: {
        transaction_amount: Number(valor),
        token,
        description: `Compra de ${tituloJogo} - Neplim Store`,
        installments: Number(installments) || 1,
        payment_method_id,
        issuer_id: issuer_id ? Number(issuer_id) : undefined,
        metadata: {
          email_usuario: emailUsuario,
          titulo_jogo: tituloJogo,
          app_id: appId !== undefined && appId !== null ? String(appId) : null
        },
        external_reference: uniqueId,
        payer: {
          email: emailUsuario,
          first_name: "Cliente",
          last_name: "NeplimStore",
          identification: cpf ? { type: "CPF", number: String(cpf).replace(/\D/g, "") } : undefined
        },
        notification_url: `${process.env.SITE_URL}/webhook-mercadopago`
      }
    };

    const response = await payment.create(paymentData);

    return res.json({
      id: response.id,
      status: response.status,
      status_detail: response.status_detail
    });
  } catch (error) {
    console.error("Erro ao criar pagamento com cartão:", error);
    return res.status(500).json({ erro: "Erro ao processar pagamento com cartão.", detalhes: error.message });
  }
});

// Criar Pagamento via Pix
app.post("/criar-pix", async (req, res) => {
  try {
    const { valor, emailUsuario, tituloJogo, appId, cupom } = req.body;

    if (!valor || !emailUsuario || !tituloJogo) {
      return res.status(400).json({ erro: "Dados insuficientes para gerar o Pix." });
    }

    const uniqueId = uuidv4();
    let valorFinal = Number(valor);
    let cupomAplicado = null;

    // Localizamos o produto do catálogo pelo appId (identificador da Steam),
    // que é o dado que o frontend já tem disponível na vitrine de jogos.
    const products = loadProducts();
    const produtoComprado = appId ? products.find(p => Number(p.appId) === Number(appId)) : null;

    // Se um cupom foi informado, revalidamos tudo aqui no backend (nunca confiamos
    // só no valor que o navegador calculou) e recalculamos o valor final.
    if (cupom && produtoComprado) {
      const codigoNormalizado = String(cupom).trim().toUpperCase();
      const coupons = loadCoupons();
      const cupomEncontrado = coupons.find(c => c.codigo === codigoNormalizado);

      if (cupomEncontrado &&
          cupomEncontrado.active !== false &&
          (!cupomEncontrado.validoAte || new Date(cupomEncontrado.validoAte) >= new Date()) &&
          (cupomEncontrado.usosMaximos === null || cupomEncontrado.usosAtuais < cupomEncontrado.usosMaximos) &&
          (cupomEncontrado.validoParaTodos || cupomEncontrado.produtosAplicaveis.includes(Number(produtoComprado.id)))) {
        valorFinal = Number((valorFinal * (1 - cupomEncontrado.percentual / 100)).toFixed(2));
        cupomAplicado = codigoNormalizado;
      }
    }

    // Criando a requisição do pagamento
    const paymentData = {
      body: {
        transaction_amount: valorFinal,
        description: `Compra de ${tituloJogo} - Neplim Store`,
        payment_method_id: "pix",
        // Vinculamos o e-mail do usuário, o jogo, o appId (para gerar a key depois) e o cupom (se houver)
        metadata: {
          email_usuario: emailUsuario,
          titulo_jogo: tituloJogo,
          app_id: appId !== undefined && appId !== null ? String(appId) : null,
          cupom_aplicado: cupomAplicado
        },
        external_reference: uniqueId,
        payer: {
          email: emailUsuario,
          first_name: "Cliente",
          last_name: "NeplimStore"
        },
        notification_url: `${process.env.SITE_URL}/webhook-mercadopago`
      }
    };

    const response = await payment.create(paymentData);

    return res.json({
      id: response.id,
      status: response.status,
      qr_code: response.point_of_interaction.transaction_data.qr_code,
      qr_code_base64: response.point_of_interaction.transaction_data.qr_code_base64,
      ticket_url: response.point_of_interaction.transaction_data.ticket_url,
      valorFinal,
      cupomAplicado
    });
  } catch (error) {
    console.error("Erro ao criar Pix:", error);
    return res.status(500).json({ erro: "Erro ao gerar Pix.", detalhes: error.message });
  }
});

// Consultar Status Individual do Pagamento (Polling do Frontend)
app.get("/status-pagamento/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const pagamento = await payment.get({ id });

    let supportRecord = findSupportCodeByPaymentId(pagamento.id);
    if (pagamento.status === "approved" && !supportRecord) {
      const emailUsuario = pagamento.metadata?.email_usuario;
      const users = loadUsers();
      const user = emailUsuario
        ? users.find(item => String(item.email || "").toLowerCase() === String(emailUsuario).toLowerCase())
        : null;

      supportRecord = ensureSupportCodeForPurchase({
        paymentId: pagamento.id,
        emailUsuario,
        nomeUsuario: user?.nome || null,
        tituloJogo: pagamento.metadata?.titulo_jogo,
        valor: pagamento.transaction_amount,
        metodo: pagamento.payment_method_id === "pix" ? "pix" : "cartao"
      });
      syncSupportCodeIntoPurchaseFiles(supportRecord);
    }

    return res.json({
      id: pagamento.id,
      status: pagamento.status,
      status_detail: pagamento.status_detail,
      codigo_suporte: pagamento.status === "approved" ? supportRecord?.code || null : null,
      support_code: pagamento.status === "approved" ? supportRecord?.code || null : null,
      // Compatibilidade com o frontend atual. Este valor NÃO é uma Steam Key.
      steam_key: pagamento.status === "approved" ? supportRecord?.code || null : null,
      delivery_type: pagamento.status === "approved" ? "manual_ticket" : null,
      mensagem_entrega: pagamento.status === "approved"
        ? "Abra um ticket no Discord e envie o código NEPLIM para receber o jogo manualmente."
        : null
    });
  } catch (error) {
    console.error("Erro ao consultar status do pagamento:", error);
    return res.status(500).json({ erro: "Erro ao consultar status do pagamento.", detalhes: error.message });
  }
});

// Webhook para receber notificações automáticas do Mercado Pago
app.post("/webhook-mercadopago", async (req, res) => {
  try {
    console.log("Webhook recebido:", req.body);
    
    // O Mercado Pago envia notificações de vários tipos, queremos apenas "payment"
    if (req.body?.action === "payment.created" || req.body?.type === "payment" || req.body?.data?.id) {
      const paymentId = req.body?.data?.id || req.body?.id;
      
      if (paymentId) {
        const pagamento = await payment.get({ id: paymentId });
        console.log(`Status do pagamento ${paymentId}:`, pagamento.status);

        if (pagamento.status === "approved") {
          // Extraímos as informações salvas lá na rota /criar-pix ou /criar-pagamento-cartao
          const emailUsuario = pagamento.metadata?.email_usuario;
          const tituloJogo = pagamento.metadata?.titulo_jogo;
          const valorPago = pagamento.transaction_amount;
          const metodoPagamento = pagamento.payment_method_id === "pix" ? "pix" : "cartao";
          const cupomUsado = pagamento.metadata?.cupom_aplicado;

          // Incrementa o contador de usos do cupom (uma única vez por pagamento aprovado)
          if (cupomUsado) {
            const coupons = loadCoupons();
            const indexCupom = coupons.findIndex(c => c.codigo === cupomUsado);
            if (indexCupom !== -1) {
              // Evita incrementar de novo se o webhook for reenviado pelo Mercado Pago
              const sales = loadSales();
              const jaContabilizado = sales.some(s => s.id_pagamento === String(paymentId));
              if (!jaContabilizado) {
                coupons[indexCupom].usosAtuais = (coupons[indexCupom].usosAtuais || 0) + 1;
                saveCoupons(coupons);
              }
            }
          }
          // Nenhuma Steam Key é gerada automaticamente.
          // O código de suporte abaixo será entregue ao cliente para abrir um ticket.

          // Registra no histórico centralizado de vendas (painel ADM), independente
          // de o e-mail corresponder a um usuário cadastrado — a venda no Mercado
          // Pago aconteceu de qualquer forma e o admin precisa ver isso.
          let nomeUsuarioEncontrado = null;
          const usersParaNome = loadUsers();
          const userEncontradoParaNome = emailUsuario
            ? usersParaNome.find(u => u.email.toLowerCase() === emailUsuario.toLowerCase())
            : null;
          if (userEncontradoParaNome) nomeUsuarioEncontrado = userEncontradoParaNome.nome;

          const supportRecord = ensureSupportCodeForPurchase({
            paymentId,
            emailUsuario,
            nomeUsuario: nomeUsuarioEncontrado,
            tituloJogo,
            valor: valorPago,
            metodo: metodoPagamento
          });

          registrarVendaCentralizada({
            emailUsuario,
            nomeUsuario: nomeUsuarioEncontrado,
            tituloJogo,
            valor: valorPago,
            idPagamento: paymentId,
            metodo: metodoPagamento,
            steamKey: null,
            supportCode: supportRecord.code
          });

          if (emailUsuario) {
            const users = loadUsers();
            const indexUsuario = users.findIndex(u => u.email.toLowerCase() === emailUsuario.toLowerCase());

            if (indexUsuario !== -1) {
              // Verifica se essa compra já não foi adicionada para evitar duplicidade no webhook
              if (!users[indexUsuario].compras) {
                users[indexUsuario].compras = [];
              }

              const compraJaExiste = users[indexUsuario].compras.some(c => c.id_pagamento === paymentId.toString());

              if (!compraJaExiste) {
                // Adiciona a nova compra ao histórico do usuário
                users[indexUsuario].compras.push({
                  id: uuidv4(),
                  id_pagamento: paymentId.toString(),
                  titulo_jogo: tituloJogo || "Jogo Digital",
                  valor: valorPago,
                  status: "approved",
                  // O frontend atual lê steam_key; aqui guardamos o código do ticket.
                  // Não é uma Steam Key de ativação.
                  steam_key: supportRecord.code,
                  support_code: supportRecord.code,
                  delivery_type: "manual_ticket",
                  support_code_status: "available",
                  support_code_used_by_discord_id: null,
                  support_code_used_at: null,
                  data: new Date().toISOString()
                });

                saveUsers(users);
                console.log(`Sucesso: Compra registrada para o usuário ${emailUsuario}`);
              }
            } else {
              console.log(`Aviso: Pagamento aprovado mas usuário correspondente (${emailUsuario}) não foi localizado.`);
            }
          }

          // Garante que vendas/compras já existentes também recebam o mesmo código.
          syncSupportCodeIntoPurchaseFiles(supportRecord);
        }
      }
    }
    
    // Sempre retorne 200 para o Mercado Pago não achar que o seu servidor caiu
    return res.sendStatus(200);
  } catch (error) {
    console.error("Erro no processamento do Webhook:", error);
    // Mesmo com erro interno, retornamos 200 ou 201 para estancar as tentativas repetidas do MP na fila
    return res.sendStatus(200);
  }
});

// ═══════════════════════════════════════════════
// PAINEL ADM — VENDAS, ESTATÍSTICAS E PRODUTOS
// Todas as rotas abaixo exigem o token de admin (verificarTokenAdmin).
// ═══════════════════════════════════════════════

// Lista todas as vendas registradas (mais recentes primeiro)
app.get("/admin/vendas", verificarTokenAdmin, (req, res) => {
  try {
    const sales = loadSales();
    return res.json(sales.slice().reverse());
  } catch (error) {
    console.error("Erro ao buscar vendas:", error);
    return res.status(500).json({ erro: "Erro ao carregar vendas." });
  }
});

// Estatísticas gerais para os cards do topo do painel
app.get("/admin/estatisticas", verificarTokenAdmin, (req, res) => {
  try {
    const sales = loadSales();
    const users = loadUsers();
    const products = loadProducts();

    const totalVendido = sales.reduce((soma, v) => soma + (Number(v.valor) || 0), 0);
    const totalVendas = sales.length;
    const ticketMedio = totalVendas > 0 ? totalVendido / totalVendas : 0;

    // Vendas dos últimos 7 dias, agrupadas por dia (para um gráfico simples no painel)
    const hoje = new Date();
    const seteDiasAtras = new Date(hoje);
    seteDiasAtras.setDate(hoje.getDate() - 6);
    seteDiasAtras.setHours(0, 0, 0, 0);

    const vendasPorDia = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date(seteDiasAtras);
      d.setDate(seteDiasAtras.getDate() + i);
      const chave = d.toISOString().slice(0, 10);
      vendasPorDia[chave] = 0;
    }
    sales.forEach(v => {
      const chave = String(v.data || "").slice(0, 10);
      if (chave in vendasPorDia) vendasPorDia[chave] += Number(v.valor) || 0;
    });

    return res.json({
      totalVendido,
      totalVendas,
      ticketMedio,
      totalUsuarios: users.length,
      totalProdutos: products.length,
      produtosAtivos: products.filter(p => p.active !== false).length,
      vendasPorDia: Object.entries(vendasPorDia).map(([data, valor]) => ({ data, valor }))
    });
  } catch (error) {
    console.error("Erro ao calcular estatísticas:", error);
    return res.status(500).json({ erro: "Erro ao calcular estatísticas." });
  }
});

// Lista TODOS os produtos (inclusive inativos) — usado na tela de gerenciamento
app.get("/admin/produtos", verificarTokenAdmin, (req, res) => {
  try {
    const products = loadProducts();
    return res.json(products);
  } catch (error) {
    console.error("Erro ao buscar produtos (admin):", error);
    return res.status(500).json({ erro: "Erro ao carregar produtos." });
  }
});

// Cria um novo produto
app.post("/admin/produtos", verificarTokenAdmin, (req, res) => {
  try {
    const { title, price, category, description, appId, originalPrice, discount, active } = req.body;

    if (!title || !price) {
      return res.status(400).json({ erro: "Título e preço são obrigatórios." });
    }

    const products = loadProducts();
    const novoId = products.length > 0 ? Math.max(...products.map(p => Number(p.id) || 0)) + 1 : 1;

    const novoProduto = {
      id: novoId,
      appId: appId ? Number(appId) : undefined,
      title,
      price,
      originalPrice: originalPrice || undefined,
      discount: discount ? Number(discount) : undefined,
      category: category || "Ação",
      reviewScore: "Muito Positivo",
      players: "Single / Multiplayer",
      description: description || `${title} — disponível na Neplim Store com Steam Key e entrega imediata por e-mail.`,
      developer: "—",
      publisher: "—",
      releaseDate: "—",
      genres: category ? [category] : ["Ação"],
      active: active !== false
    };

    products.push(novoProduto);
    saveProducts(products);

    return res.status(201).json(novoProduto);
  } catch (error) {
    console.error("Erro ao criar produto:", error);
    return res.status(500).json({ erro: "Erro ao criar produto." });
  }
});

// Edita um produto existente
app.put("/admin/produtos/:id", verificarTokenAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const products = loadProducts();
    const index = products.findIndex(p => String(p.id) === String(id));

    if (index === -1) {
      return res.status(404).json({ erro: "Produto não encontrado." });
    }

    // Atualiza apenas os campos enviados, preservando o restante do produto
    products[index] = { ...products[index], ...req.body, id: products[index].id };
    saveProducts(products);

    return res.json(products[index]);
  } catch (error) {
    console.error("Erro ao editar produto:", error);
    return res.status(500).json({ erro: "Erro ao editar produto." });
  }
});

// Converte um preço no formato "R$ 9,99" para número (9.99)
function parsePrecoBRL(precoStr) {
  if (typeof precoStr === "number") return precoStr;
  if (!precoStr) return 0;
  const limpo = String(precoStr).replace(/[^\d,.-]/g, "").replace(",", ".");
  const numero = parseFloat(limpo);
  return isNaN(numero) ? 0 : numero;
}

// Converte um número (9.99) para o formato "R$ 9,99"
function formatarPrecoBRL(numero) {
  const arredondado = Math.max(0, Number(numero)).toFixed(2);
  return `R$ ${arredondado.replace(".", ",")}`;
}

// Remove um produto
app.delete("/admin/produtos/:id", verificarTokenAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const products = loadProducts();
    const index = products.findIndex(p => String(p.id) === String(id));

    if (index === -1) {
      return res.status(404).json({ erro: "Produto não encontrado." });
    }

    products.splice(index, 1);
    saveProducts(products);

    return res.json({ mensagem: "Produto removido com sucesso." });
  } catch (error) {
    console.error("Erro ao remover produto:", error);
    return res.status(500).json({ erro: "Erro ao remover produto." });
  }
});

// Ajusta o preço de vários produtos de uma vez (todos, ou filtrados por categoria)
// Aceita dois modos:
//   modo "fixo"       -> define o mesmo preço para todos os produtos afetados
//   modo "percentual" -> aplica um ajuste (+ ou -) sobre o preço atual de cada produto
app.post("/admin/produtos/ajuste-em-massa", verificarTokenAdmin, (req, res) => {
  try {
    const { modo, valor, categoria } = req.body;

    if (!modo || (modo !== "fixo" && modo !== "percentual")) {
      return res.status(400).json({ erro: "Informe o modo do ajuste: 'fixo' ou 'percentual'." });
    }
    if (valor === undefined || valor === null || isNaN(Number(valor))) {
      return res.status(400).json({ erro: "Informe um valor numérico válido." });
    }
    if (modo === "fixo" && Number(valor) < 0) {
      return res.status(400).json({ erro: "O preço fixo não pode ser negativo." });
    }

    const products = loadProducts();
    let afetados = 0;

    const atualizados = products.map(produto => {
      // Se uma categoria foi informada, só altera produtos daquela categoria.
      // Se não foi informada (ou veio "todas"), aplica em todos os produtos.
      const dentroDoFiltro = !categoria || categoria === "todas" || produto.category === categoria;
      if (!dentroDoFiltro) return produto;

      afetados++;
      let novoPrecoNumero;

      if (modo === "fixo") {
        novoPrecoNumero = Number(valor);
      } else {
        const precoAtual = parsePrecoBRL(produto.price);
        novoPrecoNumero = precoAtual * (1 + Number(valor) / 100);
      }

      return { ...produto, price: formatarPrecoBRL(novoPrecoNumero) };
    });

    saveProducts(atualizados);

    return res.json({
      mensagem: `Preço atualizado em ${afetados} produto${afetados !== 1 ? "s" : ""}.`,
      produtosAfetados: afetados
    });
  } catch (error) {
    console.error("Erro ao ajustar preços em massa:", error);
    return res.status(500).json({ erro: "Erro ao ajustar preços em massa." });
  }
});

// ═══════════════════════════════════════════════
// PAINEL ADM — CUPONS DE DESCONTO
// ═══════════════════════════════════════════════

// Lista todos os cupons (inclusive expirados/inativos) — tela de gerenciamento
app.get("/admin/cupons", verificarTokenAdmin, (req, res) => {
  try {
    const coupons = loadCoupons();
    return res.json(coupons.slice().reverse());
  } catch (error) {
    console.error("Erro ao buscar cupons:", error);
    return res.status(500).json({ erro: "Erro ao carregar cupons." });
  }
});

// Cria um novo cupom de desconto (percentual, válido para produtos específicos ou para todos)
app.post("/admin/cupons", verificarTokenAdmin, (req, res) => {
  try {
    const { codigo, percentual, produtosAplicaveis, validoParaTodos, validoAte, usosMaximos, active } = req.body;

    if (!codigo || !percentual) {
      return res.status(400).json({ erro: "Código e percentual de desconto são obrigatórios." });
    }
    if (Number(percentual) <= 0 || Number(percentual) > 100) {
      return res.status(400).json({ erro: "O percentual de desconto deve ser entre 1 e 100." });
    }
    // Só exigimos a lista de produtos se o cupom NÃO for válido para todos
    if (!validoParaTodos && (!Array.isArray(produtosAplicaveis) || produtosAplicaveis.length === 0)) {
      return res.status(400).json({ erro: "Selecione ao menos um produto para o cupom, ou marque 'válido para todos'." });
    }

    const codigoNormalizado = String(codigo).trim().toUpperCase();

    const coupons = loadCoupons();
    const jaExiste = coupons.some(c => c.codigo === codigoNormalizado);
    if (jaExiste) {
      return res.status(400).json({ erro: "Já existe um cupom com esse código." });
    }

    const novoCupom = {
      id: uuidv4(),
      codigo: codigoNormalizado,
      percentual: Number(percentual),
      // Se validoParaTodos for true, ignoramos a lista específica de produtos
      validoParaTodos: !!validoParaTodos,
      // IDs dos produtos (do products.json) em que o cupom pode ser aplicado
      produtosAplicaveis: validoParaTodos ? [] : produtosAplicaveis.map(id => Number(id)),
      validoAte: validoAte || null, // data ISO; null = sem expiração
      usosMaximos: usosMaximos ? Number(usosMaximos) : null, // null = ilimitado
      usosAtuais: 0,
      active: active !== false,
      criadoEm: new Date().toISOString()
    };

    coupons.push(novoCupom);
    saveCoupons(coupons);

    return res.status(201).json(novoCupom);
  } catch (error) {
    console.error("Erro ao criar cupom:", error);
    return res.status(500).json({ erro: "Erro ao criar cupom." });
  }
});

// Edita um cupom existente
app.put("/admin/cupons/:id", verificarTokenAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const coupons = loadCoupons();
    const index = coupons.findIndex(c => String(c.id) === String(id));

    if (index === -1) {
      return res.status(404).json({ erro: "Cupom não encontrado." });
    }

    const dadosAtualizados = { ...req.body };
    if (dadosAtualizados.codigo) {
      dadosAtualizados.codigo = String(dadosAtualizados.codigo).trim().toUpperCase();
    }
    if (dadosAtualizados.produtosAplicaveis) {
      dadosAtualizados.produtosAplicaveis = dadosAtualizados.produtosAplicaveis.map(pid => Number(pid));
    }
    // Se o cupom passou a ser válido para todos, esvaziamos a lista específica
    if (dadosAtualizados.validoParaTodos) {
      dadosAtualizados.produtosAplicaveis = [];
    }

    // Preserva o ID e o contador de usos já realizados
    coupons[index] = {
      ...coupons[index],
      ...dadosAtualizados,
      id: coupons[index].id,
      usosAtuais: coupons[index].usosAtuais
    };
    saveCoupons(coupons);

    return res.json(coupons[index]);
  } catch (error) {
    console.error("Erro ao editar cupom:", error);
    return res.status(500).json({ erro: "Erro ao editar cupom." });
  }
});

// Remove um cupom
app.delete("/admin/cupons/:id", verificarTokenAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const coupons = loadCoupons();
    const index = coupons.findIndex(c => String(c.id) === String(id));

    if (index === -1) {
      return res.status(404).json({ erro: "Cupom não encontrado." });
    }

    coupons.splice(index, 1);
    saveCoupons(coupons);

    return res.json({ mensagem: "Cupom removido com sucesso." });
  } catch (error) {
    console.error("Erro ao remover cupom:", error);
    return res.status(500).json({ erro: "Erro ao remover cupom." });
  }
});

// ═══════════════════════════════════════════════
// ROTA PÚBLICA — VALIDAR CUPOM NO CHECKOUT
// ═══════════════════════════════════════════════
// Recebe o código digitado pelo cliente e o appId do jogo no carrinho.
// Retorna o percentual de desconto se o cupom for válido para aquele produto.
app.post("/validar-cupom", (req, res) => {
  try {
    const { codigo, appId } = req.body;

    if (!codigo || !appId) {
      return res.status(400).json({ erro: "Informe o código do cupom e o produto." });
    }

    const codigoNormalizado = String(codigo).trim().toUpperCase();
    const coupons = loadCoupons();
    const cupom = coupons.find(c => c.codigo === codigoNormalizado);

    if (!cupom) {
      return res.status(404).json({ erro: "Cupom não encontrado." });
    }
    if (cupom.active === false) {
      return res.status(400).json({ erro: "Este cupom não está mais ativo." });
    }
    if (cupom.validoAte && new Date(cupom.validoAte) < new Date()) {
      return res.status(400).json({ erro: "Este cupom expirou." });
    }
    if (cupom.usosMaximos !== null && cupom.usosAtuais >= cupom.usosMaximos) {
      return res.status(400).json({ erro: "Este cupom já atingiu o limite de usos." });
    }
    if (!cupom.validoParaTodos) {
      const products = loadProducts();
      const produto = products.find(p => Number(p.appId) === Number(appId));
      if (!produto || !cupom.produtosAplicaveis.includes(Number(produto.id))) {
        return res.status(400).json({ erro: "Este cupom não é válido para o produto selecionado." });
      }
    }

    return res.json({
      codigo: cupom.codigo,
      percentual: cupom.percentual
    });
  } catch (error) {
    console.error("Erro ao validar cupom:", error);
    return res.status(500).json({ erro: "Erro ao validar cupom." });
  }
});

// Cria códigos para vendas aprovadas antigas que ainda não possuam comprovante.
function backfillApprovedSupportCodes() {
  try {
    const sales = loadSales();
    for (const sale of sales) {
      if (sale.status !== "approved" || !sale.id_pagamento) continue;

      const record = ensureSupportCodeForPurchase({
        paymentId: sale.id_pagamento,
        emailUsuario: sale.email_usuario,
        nomeUsuario: sale.nome_usuario,
        tituloJogo: sale.titulo_jogo,
        valor: sale.valor,
        metodo: sale.metodo
      });
      syncSupportCodeIntoPurchaseFiles(record);
    }
  } catch (error) {
    console.error("Erro ao criar códigos para vendas antigas:", error);
  }
}

backfillApprovedSupportCodes();

// Inicialização do servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando com sucesso na porta ${PORT}`);
});
