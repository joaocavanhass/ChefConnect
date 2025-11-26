// backend/server.js
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../FRONTEND')));

// "Banco de dados" em memória
let users = [];
let recipes = [
  {
    id: 1,
    title: "Frango Assado com Ervas",
    description: "Frango suculento assado com ervas frescas e limão",
    ingredients: ["1 frango inteiro", "3 dentes de alho", "2 colheres de azeite", "Ervas frescas"],
    instructions: ["Preaqueça o forno", "Tempere o frango", "Asse por 1h15"],
    category: "prato-principal",
    difficulty: "medio",
    time: 75,
    servings: 4
  },
  {
    id: 2,
    title: "Mousse de Chocolate",
    description: "Sobremesa rápida e deliciosa",
    ingredients: ["200g chocolate", "3 ovos", "2 colheres de açúcar"],
    instructions: ["Derreta o chocolate", "Bata as claras em neve", "Misture e leve à geladeira"],
    category: "sobremesa",
    difficulty: "facil",
    time: 20,
    servings: 4
  }
];

// Rotas de Usuário
app.post('/api/users/register', (req, res) => {
  const { name, email, password } = req.body;

  if (users.find(user => user.email === email)) {
    return res.status(400).json({ error: 'Email já cadastrado' });
  }

  const newUser = {
    id: Date.now(),
    name,
    email,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  
  res.status(201).json({ 
    message: 'Usuário cadastrado com sucesso!',
    user: newUser 
  });
});

// Rota de login
app.post('/api/users/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  
  if (!user) {
    return res.status(401).json({ error: 'Usuário não encontrado' });
  }

  res.json({ 
    message: 'Login realizado com sucesso',
    user: user
  });
});

// Buscar receitas
app.get('/api/recipes/search', (req, res) => {
  const query = req.query.q?.toLowerCase() || '';
  
  const filteredRecipes = recipes.filter(recipe => 
    recipe.title.toLowerCase().includes(query) ||
    recipe.description.toLowerCase().includes(query) ||
    recipe.ingredients.some(ing => ing.toLowerCase().includes(query))
  );

  res.json({ recipes: filteredRecipes });
});

// Todas as receitas
app.get('/api/recipes', (req, res) => {
  res.json({ recipes });
});

// Adicionar nova receita
app.post('/api/recipes', (req, res) => {
  const recipe = {
    id: Date.now(),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  
  recipes.push(recipe);
  res.status(201).json(recipe);
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});