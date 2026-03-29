import { Product } from '../store/useCartStore';

export const products: Product[] = [
  // Ensaladas Tradicionales
  {
    id: 'pico-de-gallo',
    name: 'Pico de Gallo (Libra)',
    price: 14900,
    description: 'Una ensalada que se adapta a tus gustos, con limón y salva muy bien pero también la puedes convertir en un hogao.',
    image: 'https://qlgjqvgjuscquhspjqdp.supabase.co/storage/v1/object/public/AETHERA-DOCS/pico%20de%20gallo.jpeg',
    category: 'ensaladas',
    benefits: ['Fresco', 'Natural', 'Sin conservantes']
  },
  {
    id: 'ceviche-mango',
    name: 'Ceviche de Mango (Libra)',
    price: 14900,
    description: 'Una joya hecha ensalada: fresca, dulce y su sabor inconfundible acevichado.',
    image: 'https://qlgjqvgjuscquhspjqdp.supabase.co/storage/v1/object/public/AETHERA-DOCS/cerviche%20de%20mango.jpeg',
    category: 'ensaladas',
    benefits: ['Rico en vitamina C', 'Bajo en calorías']
  },
  {
    id: 'verduras-saltear',
    name: 'Verduras para Saltear (Libra)',
    price: 14900,
    description: 'Para hacer con arroces, con cualquier proteína, salteados o al vapor. Totalmente versátil.',
    image: 'https://qlgjqvgjuscquhspjqdp.supabase.co/storage/v1/object/public/AETHERA-DOCS/verduras%20para%20saltear.jpeg',
    category: 'ensaladas',
    benefits: ['Listo para cocinar', 'Variedad de nutrientes']
  },
  {
    id: 'ensalada-cesar',
    name: 'Ensalada César (Libra)',
    price: 26900,
    description: 'Una ensalada con su propio toque Serana pero con el sabor inconfundible de la césar tradicional.',
    image: 'https://qlgjqvgjuscquhspjqdp.supabase.co/storage/v1/object/public/AETHERA-DOCS/ensalada%20cesar.jpeg',
    category: 'ensaladas',
    benefits: ['Clásica', 'Deliciosa']
  },
  {
    id: 'ensalada-primavera',
    name: 'Ensalada Primavera (Libra)',
    price: 20900,
    description: 'Una combinación que es frescura total, simple pero deliciosa.',
    image: 'https://qlgjqvgjuscquhspjqdp.supabase.co/storage/v1/object/public/AETHERA-DOCS/Ensalada_primavera_en_bol_54288481e0.jpeg',
    category: 'ensaladas',
    benefits: ['Ligera', 'Refrescante']
  },

  // Ensaladas Gourmet
  {
    id: 'ensalada-almendras',
    name: 'Ensalada de Almendras Caramelizadas (450g)',
    price: 34900,
    description: 'Ensalada con trazos de almendras, crujiente, dulce y de sabor elevado.',
    image: 'https://picsum.photos/seed/ensalada-almendras/400/300',
    category: 'ensaladas',
    benefits: ['Gourmet', 'Texturas únicas']
  },
  {
    id: 'ensalada-quinoa',
    name: 'Ensalada de Quinoa (450g)',
    price: 37900,
    description: 'Una ensalada proteica sin dejar de ser veggie, de sabor espectacular.',
    image: 'https://picsum.photos/seed/ensalada-quinoa/400/300',
    category: 'ensaladas',
    benefits: ['Superalimento', 'Alta proteína']
  },
  {
    id: 'ensalada-italiana',
    name: 'Ensalada Italiana (450g)',
    price: 36900,
    description: 'Una ensalada que te transporta a un viaje por Italia.',
    image: 'https://picsum.photos/seed/ensalada-italiana/400/300',
    category: 'ensaladas',
    benefits: ['Mediterránea', 'Sabrosa']
  },
  {
    id: 'ensalada-sandia-feta',
    name: 'Ensalada Sandía y Feta (450g)',
    price: 29900,
    description: 'Ensalada al mejor estilo del verano griego.',
    image: 'https://picsum.photos/seed/ensalada-sandia-feta/400/300',
    category: 'ensaladas',
    benefits: ['Hidratante', 'Contraste de sabores']
  },
  {
    id: 'ensalada-baby',
    name: 'Ensalada Baby (450g)',
    price: 31900,
    description: 'Una mezcla de vegetales babys que le dan un sabor único a la ensalada.',
    image: 'https://picsum.photos/seed/ensalada-baby/400/300',
    category: 'ensaladas',
    benefits: ['Tierna', 'Delicada']
  },
  {
    id: 'ensalada-serana',
    name: 'Ensalada Serana (450g)',
    price: 29900,
    description: 'Ensalada frutal con sabores que elevan el alma, dulce y fresca.',
    image: 'https://picsum.photos/seed/ensalada-serana/400/300',
    category: 'ensaladas',
    benefits: ['Especialidad', 'Equilibrada']
  },

  // Salsas y Vinagretas
  {
    id: 'salsa-cesar',
    name: 'Salsa César (200ml)',
    price: 26900,
    description: 'Sin su salsa la ensalada César está incompleta.',
    image: 'https://picsum.photos/seed/salsa-cesar/400/300',
    category: 'salsas',
    benefits: ['Cremosa', 'Sabor auténtico']
  },
  {
    id: 'vinagreta-mostaza-miel',
    name: 'Vinagreta Mostaza y Miel (200ml)',
    price: 26900,
    description: 'Una clásica pero deliciosa con el toque gourmet Serana.',
    image: 'https://picsum.photos/seed/vinagreta-mostaza-miel/400/300',
    category: 'salsas',
    benefits: ['Versátil', 'Sin conservantes']
  },
  {
    id: 'pesto',
    name: 'Pesto (200ml)',
    price: 33900,
    description: 'La inconfundible, hecho con ingredientes frescos y de alta calidad.',
    image: 'https://picsum.photos/seed/pesto/400/300',
    category: 'salsas',
    benefits: ['Aromático', 'Artesanal']
  },
  {
    id: 'mayonesa-griega',
    name: 'Mayonesa Griega de Ajo (200ml)',
    price: 27900,
    description: 'La versión más saludable de la mayonesa, con bajo porcentaje de aceite y con altas cantidades de proteína.',
    image: 'https://picsum.photos/seed/mayonesa-griega/400/300',
    category: 'salsas',
    benefits: ['Cremosa', 'Sabor intenso']
  },
  {
    id: 'vinagreta-fresa-menta',
    name: 'Vinagreta Fresa y Menta (200ml)',
    price: 22900,
    description: 'Con un sabor único, la vinagreta de fresa y menta podrá ser tu favorita.',
    image: 'https://picsum.photos/seed/vinagreta-fresa-menta/400/300',
    category: 'salsas',
    benefits: ['Innovadora', 'Refrescante']
  },
  {
    id: 'vinagreta-miel-balsamico',
    name: 'Vinagreta Miel y Balsámico (200ml)',
    price: 29900,
    description: 'Una clásica de la cocina, hecha para paladares educados.',
    image: 'https://picsum.photos/seed/vinagreta-miel-balsamico/400/300',
    category: 'salsas',
    benefits: ['Clásica', 'Elegante']
  },
  {
    id: 'vinagreta-naranja-cilantro',
    name: 'Vinagreta Naranja y Cilantro (200ml)',
    price: 20900,
    description: 'Una vinagreta muy fresca y acidita para acompañar todo tipo de ensaladas.',
    image: 'https://picsum.photos/seed/vinagreta-naranja-cilantro/400/300',
    category: 'salsas',
    benefits: ['Cítrica', 'Ligera']
  },
  {
    id: 'hummus',
    name: 'Hummus (200ml)',
    price: 22900,
    description: 'El clásico mediterráneo que queda bien con todo y con pan.',
    image: 'https://picsum.photos/seed/hummus/400/300',
    category: 'salsas',
    benefits: ['Proteína vegetal', 'Saludable']
  },
  {
    id: 'chimichurri',
    name: 'Chimichurri (200ml)',
    price: 26900,
    description: 'Hecho a mano, con su sabor inconfundible para asados y carnes.',
    image: 'https://picsum.photos/seed/chimichurri/400/300',
    category: 'salsas',
    benefits: ['Especiado', 'Tradicional']
  },

  // Sopas
  {
    id: 'crema-tomate',
    name: 'Crema de Tomate (Libra)',
    price: 18900,
    description: 'Crema de tomate san marzano, con un toque dulce y especial.',
    image: 'https://picsum.photos/seed/crema-tomate/400/300',
    category: 'sopas',
    benefits: ['Casera', 'Natural']
  },
  {
    id: 'crema-auyama',
    name: 'Crema de Auyama (Libra)',
    price: 12900,
    description: 'Una crema para alimentar a tu familia.',
    image: 'https://picsum.photos/seed/crema-auyama/400/300',
    category: 'sopas',
    benefits: ['Vitaminas', 'Suave']
  },
  {
    id: 'crema-hongos',
    name: 'Crema de Hongos (Libra)',
    price: 26900,
    description: 'Para hacer una salsa o para hacerla en crema. Con un sabor umami intenso y espectacular.',
    image: 'https://picsum.photos/seed/crema-hongos/400/300',
    category: 'sopas',
    benefits: ['Gourmet', 'Sabor intenso']
  },
  {
    id: 'crema-verduras',
    name: 'Crema de Verduras (Libra)',
    price: 13900,
    description: 'Una crema que siempre cae como una caricia al corazón.',
    image: 'https://picsum.photos/seed/crema-verduras/400/300',
    category: 'sopas',
    benefits: ['Nutritiva', 'Ligera']
  },
  {
    id: 'sancocho',
    name: 'Sancocho (Libra)',
    price: 13900,
    description: 'Sopa tradicional colombiana de tubérculos sancochados.',
    image: 'https://picsum.photos/seed/sancocho/400/300',
    category: 'sopas',
    benefits: ['Tradicional', 'Completo']
  },
  {
    id: 'frijoles',
    name: 'Frijoles (Libra)',
    price: 18900,
    description: 'Sopa tradicional colombiana, especial para tu día a día.',
    image: 'https://picsum.photos/seed/frijoles/400/300',
    category: 'sopas',
    benefits: ['Proteína', 'Caseros']
  },

  // Bebidas (Jugos y Shots)
  {
    id: 'jugo-verde',
    name: 'Jugo Verde (x5)',
    price: 18900,
    description: 'Pack de 5 jugos verdes desintoxicantes.',
    image: 'https://picsum.photos/seed/jugo-verde/400/300',
    category: 'bebidas',
    benefits: ['Detox', 'Energizante']
  },
  {
    id: 'batido-circulacion',
    name: 'Batido Circulación (x5)',
    price: 18900,
    description: 'Ayuda a mejorar tu circulación.',
    image: 'https://picsum.photos/seed/batido-circulacion/400/300',
    category: 'bebidas',
    benefits: ['Saludable', 'Natural']
  },
  {
    id: 'batido-detox',
    name: 'Batido Detox Antiestrés (x5)',
    price: 18900,
    description: 'Relájate y limpia tu organismo.',
    image: 'https://picsum.photos/seed/batido-detox/400/300',
    category: 'bebidas',
    benefits: ['Relajante', 'Depurativo']
  },
  {
    id: 'jugo-naranja',
    name: 'Jugo de Naranja (x6)',
    price: 39900,
    description: '100% natural, recién exprimido.',
    image: 'https://picsum.photos/seed/jugo-naranja/400/300',
    category: 'bebidas',
    benefits: ['Vitamina C', 'Refrescante']
  },
  {
    id: 'shot-metabolico',
    name: 'Shot Metabólico (x6)',
    price: 48900,
    description: 'Acelera tu metabolismo naturalmente.',
    image: 'https://picsum.photos/seed/shot-metabolico/400/300',
    category: 'bebidas',
    benefits: ['Metabolismo', 'Energía']
  },
  {
    id: 'shot-serenidad',
    name: 'Shot Serenidad (x6)',
    price: 49500,
    description: 'Para momentos de calma.',
    image: 'https://picsum.photos/seed/shot-serenidad/400/300',
    category: 'bebidas',
    benefits: ['Calma', 'Bienestar']
  },
  {
    id: 'shot-concentracion',
    name: 'Shot Concentración (x6)',
    price: 59500,
    description: 'Mejora tu enfoque mental.',
    image: 'https://picsum.photos/seed/shot-concentracion/400/300',
    category: 'bebidas',
    benefits: ['Enfoque', 'Mental']
  },
  {
    id: 'shot-antiinflamatorio',
    name: 'Shot Antiinflamatorio (x6)',
    price: 49500,
    description: 'Combate la inflamación.',
    image: 'https://picsum.photos/seed/shot-antiinflamatorio/400/300',
    category: 'bebidas',
    benefits: ['Salud', 'Recuperación']
  },
  {
    id: 'shot-muscular',
    name: 'Shot Muscular (x6)',
    price: 44500,
    description: 'Apoyo para tus músculos.',
    image: 'https://picsum.photos/seed/shot-muscular/400/300',
    category: 'bebidas',
    benefits: ['Recuperación', 'Fuerza']
  },
  {
    id: 'shot-piel',
    name: 'Shot Piel Perfecta (x6)',
    price: 35900,
    description: 'Nutrición para tu piel desde dentro.',
    image: 'https://picsum.photos/seed/shot-piel/400/300',
    category: 'bebidas',
    benefits: ['Belleza', 'Nutrición']
  },

  // Frutas
  {
    id: 'mango-picado',
    name: 'Mango Picado (Libra)',
    price: 13900,
    description: 'Mango dulce y fresco, listo para comer.',
    image: 'https://picsum.photos/seed/mango-picado/400/300',
    category: 'frutas',
    benefits: ['Listo para comer', 'Dulce']
  },
  {
    id: 'pina-picada',
    name: 'Piña Picada (Libra)',
    price: 15900,
    description: 'Piña oro miel picada en cubos.',
    image: 'https://picsum.photos/seed/pina-picada/400/300',
    category: 'frutas',
    benefits: ['Diurética', 'Dulce']
  },
  {
    id: 'fresa-picada',
    name: 'Fresa Picada (Libra)',
    price: 16900,
    description: 'Fresas seleccionadas y limpias.',
    image: 'https://picsum.photos/seed/fresa-picada/400/300',
    category: 'frutas',
    benefits: ['Antioxidantes', 'Fresca']
  },
  {
    id: 'sandia-baby-picada',
    name: 'Sandía Baby Picada (Libra)',
    price: 15500,
    description: 'Sandía sin semillas, dulce y jugosa.',
    image: 'https://picsum.photos/seed/sandia-baby-picada/400/300',
    category: 'frutas',
    benefits: ['Hidratante', 'Baja en calorías']
  },
  {
    id: 'coco-picado',
    name: 'Coco Picado (Libra)',
    price: 26000,
    description: 'Trozos de coco fresco.',
    image: 'https://picsum.photos/seed/coco-picado/400/300',
    category: 'frutas',
    benefits: ['Energía', 'Grasas saludables']
  },
  {
    id: 'melon-picado',
    name: 'Melón Picado (Libra)',
    price: 17900, // Assuming price from context
    description: 'Melón dulce y aromático.',
    image: 'https://picsum.photos/seed/melon-picado/400/300',
    category: 'frutas',
    benefits: ['Refrescante', 'Vitaminas']
  },
  {
    id: 'guayaba-manzana-picada',
    name: 'Guayaba Manzana Picada (Libra)',
    price: 16900,
    description: 'Crujiente y dulce.',
    image: 'https://picsum.photos/seed/guayaba-manzana-picada/400/300',
    category: 'frutas',
    benefits: ['Vitamina C', 'Fibra']
  },
  {
    id: 'uchuva',
    name: 'Uchuva (Libra)',
    price: 17900,
    description: 'Uchuvas frescas seleccionadas.',
    image: 'https://picsum.photos/seed/uchuva/400/300',
    category: 'frutas',
    benefits: ['Exótica', 'Antioxidante']
  },
  {
    id: 'papaya-picada',
    name: 'Papaya Picada (Libra)',
    price: 13500,
    description: 'Papaya dulce en cubos.',
    image: 'https://picsum.photos/seed/papaya-picada/400/300',
    category: 'frutas',
    benefits: ['Digestiva', 'Suave']
  },
  {
    id: 'baby-bowl-berry',
    name: 'Baby Bowl Berry Mix (250g)',
    price: 21000,
    description: 'Mix de frutos rojos.',
    image: 'https://picsum.photos/seed/baby-bowl-berry/400/300',
    category: 'frutas',
    benefits: ['Antioxidantes', 'Snack perfecto']
  },
  {
    id: 'baby-bowl-amarillos',
    name: 'Baby Bowl Frutos Amarillos (250g)',
    price: 9000,
    description: 'Mix de frutas amarillas.',
    image: 'https://picsum.photos/seed/baby-bowl-amarillos/400/300',
    category: 'frutas',
    benefits: ['Vitamina C', 'Tropical']
  },

  // Verduras
  {
    id: 'zucchini-picado',
    name: 'Zucchini Verde/Amarillo Picado (Libra)',
    price: 12000,
    description: 'Listo para saltear.',
    image: 'https://picsum.photos/seed/zucchini-picado/400/300',
    category: 'verduras',
    benefits: ['Bajo en calorías', 'Versátil']
  },
  {
    id: 'pimenton-picado',
    name: 'Pimentón Rojo Picado (Libra)',
    price: 16500,
    description: 'Pimentón rojo fresco en julianas o cubos.',
    image: 'https://picsum.photos/seed/pimenton-picado/400/300',
    category: 'verduras',
    benefits: ['Vitamina C', 'Sabor']
  },
  {
    id: 'cebolla-blanca-picada',
    name: 'Cebolla Blanca Picada (Libra)',
    price: 12900,
    description: 'Lista para tus aderezos.',
    image: 'https://picsum.photos/seed/cebolla-blanca-picada/400/300',
    category: 'verduras',
    benefits: ['Básica', 'Sabor']
  },
  {
    id: 'tomate-cherry',
    name: 'Tomate Cherry (Libra)',
    price: 20500,
    description: 'Pequeños y dulces.',
    image: 'https://picsum.photos/seed/tomate-cherry/400/300',
    category: 'verduras',
    benefits: ['Snack', 'Ensaladas']
  },
  {
    id: 'lechuga-hidroponica',
    name: 'Lechuga Hidropónica (250g)',
    price: 8900,
    description: 'Limpia y lista para consumir.',
    image: 'https://picsum.photos/seed/lechuga-hidroponica/400/300',
    category: 'verduras',
    benefits: ['Fresca', 'Crujiente']
  },
  {
    id: 'mezclum',
    name: 'Mezclum Orgánico Lavado (250g)',
    price: 24500,
    description: 'Mix de hojas verdes orgánicas.',
    image: 'https://picsum.photos/seed/mezclum/400/300',
    category: 'verduras',
    benefits: ['Orgánico', 'Premium']
  },

  // Combos
  {
    id: 'combo-1-2',
    name: 'Combo para 1 o 2',
    price: 390000,
    description: 'Selección perfecta para parejas o consumo individual.',
    image: 'https://picsum.photos/seed/combo-1-2/400/300',
    category: 'combos',
    benefits: ['Completo', 'Ahorro']
  },
  {
    id: 'combo-familiar',
    name: 'Combo Familiar',
    price: 590000,
    description: 'Abastecimiento completo para la familia.',
    image: 'https://picsum.photos/seed/combo-familiar/400/300',
    category: 'combos',
    benefits: ['Familiar', 'Gran ahorro']
  },
  {
    id: 'combo-tardes',
    name: 'Combo para Tardes',
    price: 290000,
    description: 'Snacks y bebidas para tus tardes.',
    image: 'https://picsum.photos/seed/combo-tardes/400/300',
    category: 'combos',
    benefits: ['Snacks', 'Merienda']
  },
  {
    id: 'combo-lonchera',
    name: 'Combo Lonchera Niños',
    price: 280000,
    description: 'Opciones saludables para el colegio.',
    image: 'https://picsum.photos/seed/combo-lonchera/400/300',
    category: 'combos',
    benefits: ['Niños', 'Saludable']
  },
  {
    id: 'combo-oficina',
    name: 'Combo Oficina',
    price: 310000,
    description: 'Energía y salud para tu jornada laboral.',
    image: 'https://picsum.photos/seed/combo-oficina/400/300',
    category: 'combos',
    benefits: ['Productividad', 'Práctico']
  },
  {
    id: 'combo-mascotas',
    name: 'Combo Mascotas',
    price: 110000,
    description: 'Lo mejor para tus peludos.',
    image: 'https://picsum.photos/seed/combo-mascotas/400/300',
    category: 'combos',
    benefits: ['Mascotas', 'Cuidado']
  },
  {
    id: 'kit-jugos',
    name: 'Kit Jugos de Fruta (18 und)',
    price: 95900,
    description: 'Variedad de jugos naturales.',
    image: 'https://picsum.photos/seed/kit-jugos/400/300',
    category: 'combos',
    benefits: ['Variedad', 'Natural']
  },
  {
    id: 'kit-ensaladas',
    name: 'Kit Ensaladas Tradicional (5 und)',
    price: 110000,
    description: 'Tus ensaladas favoritas para la semana.',
    image: 'https://picsum.photos/seed/kit-ensaladas/400/300',
    category: 'combos',
    benefits: ['Semanal', 'Práctico']
  }
];
