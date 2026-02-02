// src/data/productsData.js
export const productsData = [
  // ========== DOCES ==========
  {
    id: 1,
    name: 'Cone de Chocolate',
    price: 8.00,
    category: 'doces',
    description: 'Cone crocante recheado com chocolate belga e confeitos coloridos',
    emoji: '🍦',
    badge: 'indisponível',
    stock: 0,
    tags: ['doce', 'chocolate', 'sobremesa', 'indisponível'],
    available: false,
    isUnavailable: true
  },
  {
    id: 2,
    name: 'Trufa Gourmet',
    price: 5.00,
    category: 'doces',
    description: 'Trufa artesanal de chocolate meio amargo com recheio cremoso',
    emoji: '🍫',
    badge: 'indisponível',
    stock: 0,
    tags: ['doce', 'chocolate', 'elegante', 'indisponível'],
    available: false,
    isUnavailable: true
  },
  {
    id: 3,
    name: 'Bolo de Pote Brownie',
    price: 12.00,
    category: 'doces',
    description: 'Brownie úmido em pote individual com calda de chocolate e nozes',
    emoji: '🍰',
    badge: 'indisponível',
    stock: 0,
    tags: ['doce', 'bolo', 'chocolate', 'indisponível'],
    available: false,
    isUnavailable: true
  },

  // ========== SALGADOS ==========
  {
    id: 4,
    name: 'Lanche Natural',
    price: 15.00,
    category: 'salgados',
    description: 'Pão integral com peito de frango grelhado, alface, tomate e molho especial',
    emoji: '🥪',
    badge: 'indisponível',
    stock: 0,
    tags: ['salgado', 'natural', 'saudável', 'indisponível'],
    available: false,
    isUnavailable: true
  },
  {
    id: 5,
    name: 'Cachorro Quente Premium',
    price: 10.00,
    category: 'salgados',
    description: 'Pão especial com salsicha, purê de batata, milho, batata palha e molhos',
    emoji: '🌭',
    badge: 'indisponível',
    stock: 0,
    tags: ['salgado', 'tradicional', 'lanche', 'indisponível'],
    available: false,
    isUnavailable: true
  },

  // ========== BEBIDAS ==========
  {
    id: 6,
    name: 'Coca-Cola 350ml',
    price: 6.00,
    category: 'bebidas',
    description: 'Refrigerante Coca-Cola original em lata gelada',
    emoji: '🥤',
    badge: 'indisponível',
    stock: 0,
    tags: ['refrigerante', 'gelado', 'clássico', 'indisponível'],
    available: false,
    isUnavailable: true
  },
  {
    id: 7,
    name: 'Sprite 350ml',
    price: 6.00,
    category: 'bebidas',
    description: 'Refrigerante Sprite limão em lata gelada',
    emoji: '🥤',
    badge: 'indisponível',
    stock: 0,
    tags: ['refrigerante', 'limão', 'gelado', 'indisponível'],
    available: false,
    isUnavailable: true
  },
  {
    id: 8,
    name: 'Fanta Uva 350ml',
    price: 6.00,
    category: 'bebidas',
    description: 'Refrigerante Fanta sabor uva em lata gelada',
    emoji: '🍇',
    badge: 'indisponível',
    stock: 0,
    tags: ['refrigerante', 'uva', 'gelado', 'indisponível'],
    available: false,
    isUnavailable: true
  },
  {
    id: 9,
    name: 'Fanta Laranja 350ml',
    price: 6.00,
    category: 'bebidas',
    description: 'Refrigerante Fanta sabor laranja em lata gelada',
    emoji: '🍊',
    badge: 'indisponível',
    stock: 0,
    tags: ['refrigerante', 'laranja', 'gelado', 'indisponível'],
    available: false,
    isUnavailable: true
  },
  {
    id: 10,
    name: 'Suco Natural 500ml',
    price: 8.00,
    category: 'bebidas',
    description: 'Suco natural de laranja ou uva, feito na hora, sem conservantes',
    emoji: '🧃',
    badge: 'indisponível',
    stock: 0,
    tags: ['suco', 'natural', 'saudável', 'indisponível'],
    available: false,
    isUnavailable: true
  },
  {
    id: 11,
    name: 'Raspadinha Gourmet',
    price: 5.00,
    category: 'bebidas',
    description: 'Gelo raspado artesanal com xarope saborizado (uva, morango ou limão)',
    emoji: '🍧',
    badge: 'indisponível',
    stock: 0,
    tags: ['gelado', 'sobremesa', 'refrescante', 'indisponível'],
    available: false,
    isUnavailable: true
  },

  // ========== RIFA ATUALIZADA ==========
  {
    id: 12,
    name: '🎟️ RIFA DA FORMATURA 2026',
    price: 15.00, // Preço normal: R$ 15,00 por número
    category: 'rifas',
    description: 'RIFA OFICIAL DO TERCEIRÃO 2026! Concorra a 1 ingresso no Hot Planet Araçatuba + 2 acompanhantes (Valor do prêmio: R$ 117,00). TODA renda será investida na nossa formatura inesquecível!',
    emoji: '🏆',
    badge: 'limited',
    stock: 900, // Total de 900 números (300 por turma)
    tags: ['rifa', 'hotplanet', 'premiação', 'formatura2026', 'especial', 'disponível'],
    shippingInfo: '🏆 SORTEIO: 15/03/2026 às 18h na escola',
    isRaffle: true,
    rafflePrize: '1 ingresso Hot Planet + 2 acompanhantes',
    rafflePrizeValue: 117.00,
    raffleDate: '15 de Março de 2026',
    raffleLocation: 'Escola Estadual - Buritama/SP',
    bulkDiscount: {
      5: 10.00,
      minForDiscount: 5
    },
    raffleClasses: {
      '3A': { 
        name: '3º ANO A', 
        totalNumbers: 300, 
        range: '001-300',
        availableCount: 300
      },
      '3B': { 
        name: '3º ANO B', 
        totalNumbers: 300, 
        range: '301-600',
        availableCount: 300
      },
      '3TECH': { 
        name: '3º TECH', 
        totalNumbers: 300, 
        range: '601-900',
        availableCount: 300
      }
    }
  },

  // ========== COMBOS ==========
  {
    id: 13,
    name: 'Combo Lanche + Refri',
    price: 20.00,
    category: 'combos',
    description: 'Lanche natural + refrigerante 350ml de sua escolha',
    emoji: '🍔🥤',
    badge: 'indisponível',
    originalPrice: 25.00,
    stock: 0,
    tags: ['combo', 'econômico', 'lanche', 'indisponível'],
    available: false,
    isUnavailable: true
  },
  {
    id: 14,
    name: 'Combo Doce + Suco',
    price: 15.00,
    category: 'combos',
    description: 'Bolo de pote brownie + suco natural 500ml',
    emoji: '🍰🧃',
    badge: 'indisponível',
    originalPrice: 20.00,
    stock: 0,
    tags: ['combo', 'doce', 'refrescante', 'indisponível'],
    available: false,
    isUnavailable: true
  },
  {
    id: 15,
    name: 'Combo Completo',
    price: 30.00,
    category: 'combos',
    description: 'Lanche + Refri + Doce (escolha cada item)',
    emoji: '🎯',
    badge: 'indisponível',
    originalPrice: 40.00,
    stock: 0,
    tags: ['combo', 'completo', 'econômico', 'indisponível'],
    available: false,
    isUnavailable: true
  }
];

export const categories = [
  { 
    id: 'all', 
    name: 'Todos os Produtos', 
    emoji: '🛒',
    description: 'Veja nossa seleção completa',
    isAvailable: false
  },
  { 
    id: 'doces', 
    name: 'Doces & Sobremesas', 
    emoji: '🍰',
    description: 'Delícias para adoçar seu dia',
    isAvailable: false
  },
  { 
    id: 'salgados', 
    name: 'Salgados & Lanches', 
    emoji: '🥪',
    description: 'Pratos salgados e lanches saborosos',
    isAvailable: false
  },
  { 
    id: 'bebidas', 
    name: 'Bebidas & Refrigerantes', 
    emoji: '🥤',
    description: 'Bebidas geladas e refrescantes',
    isAvailable: false
  },
  { 
    id: 'rifas', 
    name: 'Rifa da Formatura', 
    emoji: '🎟️',
    description: 'Participe da nossa rifa da formatura!',
    isAvailable: true
  },
  { 
    id: 'combos', 
    name: 'Combos Especiais', 
    emoji: '🎁',
    description: 'Pacotes com desconto especial',
    isAvailable: false
  }
];

export const categoryColors = {
  doces: '#FF6B6B',
  salgados: '#4ECDC4',
  bebidas: '#118AB2',
  rifas: '#FFD166',
  combos: '#06D6A0',
  all: '#6C757D'
};