// Função para processar produtos baseado na disponibilidade
export const processProductsForAvailability = (productsData) => {
  return productsData.map(product => {
    // Verifica se é uma rifa
    const isRaffle = product.category === 'rifas';
    
    // Se não for rifa, marca como indisponível
    if (!isRaffle) {
      return {
        ...product,
        available: false,           // Marca como indisponível
        stock: 0,                   // Estoque zero
        badge: 'indisponível',      // Muda o badge
        description: `${product.description} (Indisponível no momento - Apenas rifas estão disponíveis)`,
        originalPrice: product.price, // Guarda o preço original
        price: product.price,       // Mantém o preço visível mas...
        // Adiciona propriedades extras para UI
        isUnavailable: true,
        availabilityMessage: 'Disponível em breve',
        tags: [...(product.tags || []), 'indisponível']
      };
    }
    
    // Se for rifa, mantém como está (mas garante que está disponível)
    return {
      ...product,
      available: true,
      stock: product.stock || 900,
      isRaffle: true,
      availabilityMessage: 'Disponível'
    };
  });
};

// Função para obter apenas produtos disponíveis (rifas)
export const getAvailableProducts = (productsData) => {
  return productsData.filter(product => product.category === 'rifas');
};

// Função para contar produtos disponíveis
export const countAvailableProducts = (productsData) => {
  return productsData.filter(product => product.category === 'rifas').length;
};

// Função para categorias filtradas (mostrar status de disponibilidade)
export const getCategoriesWithAvailability = (categories, productsData) => {
  return categories.map(category => {
    const productsInCategory = productsData.filter(p => p.category === category.id);
    const availableCount = productsInCategory.filter(p => p.category === 'rifas').length;
    
    return {
      ...category,
      totalCount: productsInCategory.length,
      availableCount: availableCount,
      isAvailable: category.id === 'rifas' || category.id === 'all'
    };
  });
};