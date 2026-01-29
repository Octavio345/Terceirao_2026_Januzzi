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
    badge: 'popular',
    stock: 50,
    tags: ['doce', 'chocolate', 'sobremesa']
  },
  {
    id: 2,
    name: 'Trufa Gourmet',
    price: 5.00,
    category: 'doces',
    description: 'Trufa artesanal de chocolate meio amargo com recheio cremoso',
    emoji: '🍫',
    stock: 80,
    tags: ['doce', 'chocolate', 'elegante']
  },
  {
    id: 3,
    name: 'Bolo de Pote Brownie',
    price: 12.00,
    category: 'doces',
    description: 'Brownie úmido em pote individual com calda de chocolate e nozes',
    emoji: '🍰',
    badge: 'novo',
    stock: 30,
    tags: ['doce', 'bolo', 'chocolate']
  },

  // ========== SALGADOS ==========
  {
    id: 4,
    name: 'Lanche Natural',
    price: 15.00,
    category: 'salgados',
    description: 'Pão integral com peito de frango grelhado, alface, tomate e molho especial',
    emoji: '🥪',
    stock: 40,
    tags: ['salgado', 'natural', 'saudável']
  },
  {
    id: 5,
    name: 'Cachorro Quente Premium',
    price: 10.00,
    category: 'salgados',
    description: 'Pão especial com salsicha, purê de batata, milho, batata palha e molhos',
    emoji: '🌭',
    badge: 'mais vendido',
    stock: 60,
    tags: ['salgado', 'tradicional', 'lanche']
  },

  // ========== BEBIDAS ==========
  {
    id: 6,
    name: 'Coca-Cola 350ml',
    price: 6.00,
    category: 'bebidas',
    description: 'Refrigerante Coca-Cola original em lata gelada',
    emoji: '🥤',
    stock: 100,
    tags: ['refrigerante', 'gelado', 'clássico']
  },
  {
    id: 7,
    name: 'Sprite 350ml',
    price: 6.00,
    category: 'bebidas',
    description: 'Refrigerante Sprite limão em lata gelada',
    emoji: '🥤',
    stock: 80,
    tags: ['refrigerante', 'limão', 'gelado']
  },
  {
    id: 8,
    name: 'Fanta Uva 350ml',
    price: 6.00,
    category: 'bebidas',
    description: 'Refrigerante Fanta sabor uva em lata gelada',
    emoji: '🍇',
    stock: 70,
    tags: ['refrigerante', 'uva', 'gelado']
  },
  {
    id: 9,
    name: 'Fanta Laranja 350ml',
    price: 6.00,
    category: 'bebidas',
    description: 'Refrigerante Fanta sabor laranja em lata gelada',
    emoji: '🍊',
    stock: 70,
    tags: ['refrigerante', 'laranja', 'gelado']
  },
  {
    id: 10,
    name: 'Suco Natural 500ml',
    price: 8.00,
    category: 'bebidas',
    description: 'Suco natural de laranja ou uva, feito na hora, sem conservantes',
    emoji: '🧃',
    badge: 'natural',
    stock: 50,
    tags: ['suco', 'natural', 'saudável']
  },
  {
    id: 11,
    name: 'Raspadinha Gourmet',
    price: 5.00,
    category: 'bebidas',
    description: 'Gelo raspado artesanal com xarope saborizado (uva, morango ou limão)',
    emoji: '🍧',
    badge: 'novo',
    stock: 40,
    tags: ['gelado', 'sobremesa', 'refrescante']
  },

  // ========== RIFA ÚNICA E ESPECIAL ==========
{
    id: 12,
    name: '🎟️ RIFA DA FORMATURA 2026',
    price: 15.00, // Preço normal: R$ 15,00
    category: 'rifas',
    description: 'RIFA OFICIAL DO TERCEIRÃO 2026! Concorra a 1 ingresso no Hot Planet Araçatuba + 2 acompanhantes. TODA renda será investida na nossa formatura inesquecível!',
    emoji: '🏆',
    badge: 'limited',
    stock: 299, // Total de números disponíveis
    tags: ['rifa', 'hotplanet', 'premiação', 'formatura2026', 'especial'],
    shippingInfo: '🏆 SORTEIO: 15/03/2026 às 18h na escola',
    originalPrice: 20.00,
    discount: 25, // 25% de desconto no preço normal
    isRaffle: true,
    rafflePrize: '1 ingresso Hot Planet + 2 acompanhantes',
    raffleDate: '15 de Março de 2026',
    raffleLocation: 'Escola Estadual - Buritama/SP',
    // NOVO: Informações de desconto para compra em quantidade
    bulkDiscount: {
      5: 10.00, // 5 números por R$ 10 cada (total R$ 50)
      minForDiscount: 5 // Mínimo para desconto
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
    badge: 'promoção',
    originalPrice: 25.00,
    stock: 25,
    tags: ['combo', 'econômico', 'lanche']
  },
  {
    id: 14,
    name: 'Combo Doce + Suco',
    price: 15.00,
    category: 'combos',
    description: 'Bolo de pote brownie + suco natural 500ml',
    emoji: '🍰🧃',
    originalPrice: 20.00,
    stock: 20,
    tags: ['combo', 'doce', 'refrescante']
  },
  {
    id: 15,
    name: 'Combo Completo',
    price: 30.00,
    category: 'combos',
    description: 'Lanche + Refri + Doce (escolha cada item)',
    emoji: '🎯',
    badge: 'super oferta',
    originalPrice: 40.00,
    stock: 15,
    tags: ['combo', 'completo', 'econômico']
  }
];

export const categories = [
  { 
    id: 'all', 
    name: 'Todos os Produtos', 
    emoji: '🛒',
    description: 'Veja nossa seleção completa'
  },
  { 
    id: 'doces', 
    name: 'Doces & Sobremesas', 
    emoji: '🍰',
    description: 'Delícias para adoçar seu dia'
  },
  { 
    id: 'salgados', 
    name: 'Salgados & Lanches', 
    emoji: '🥪',
    description: 'Pratos salgados e lanches saborosos'
  },
  { 
    id: 'bebidas', 
    name: 'Bebidas & Refrigerantes', 
    emoji: '🥤',
    description: 'Bebidas geladas e refrescantes'
  },
  { 
    id: 'rifas', 
    name: 'Rifa Especial', 
    emoji: '🎟️',
    description: 'Participe da nossa rifa da formatura!'
  },
  { 
    id: 'combos', 
    name: 'Combos Especiais', 
    emoji: '🎁',
    description: 'Pacotes com desconto especial'
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