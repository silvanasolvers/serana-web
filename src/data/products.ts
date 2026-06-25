import { Product } from '../store/useCartStore';

export const products: Product[] = [
  // Ensaladas Gourmet
  {
    id: 'ensalada-almendras',
    name: 'Ensalada de Almendras Caramelizadas',
    price: 34900,
    description: 'Contiene grasas saludables y proteínas, ideal para días activos o personas que necesitan energía.',
    image: 'https://picsum.photos/seed/ensalada-almendras/400/300',
    category: 'ensaladas-gourmet',
    benefits: ['Grasas saludables', 'Proteínas'],
    healthBenefit: 'Contiene grasas saludables y proteínas, ideal para días activos o personas que necesitan energía.',
    observation: 'Contiene alérgenos, viene acompañada de vinagreta de miel y balsámico y su topping es queso ricotta.',
    portions: 3,
    variants: [
      { label: '450 gr', price: 34900 },
      { label: '250 gr', price: 23900 },
    ],
    ingredients: ['cogollo europeo', 'rúcula', 'queso ricota', 'orégano', 'pimienta negra recién molida', 'cebolla chalota remojada', 'almendras peladas caramelizadas', 'miel de abejas', 'mix tomate cherry', 'uva importada', 'vinagreta de miel y balsámico']
  },
  {
    id: 'ensalada-quinoa',
    name: 'Ensalada de Quinoa',
    price: 37900,
    description: 'Contiene la proteína vegetal más completa: quinoa. Además aporta fibra y probióticos por su vinagreta.',
    image: 'https://picsum.photos/seed/ensalada-quinoa/400/300',
    category: 'ensaladas-gourmet',
    benefits: ['Proteína vegetal', 'Fibra'],
    healthBenefit: 'Contiene la proteína vegetal más completa: quinoa. Además aporta fibra y probióticos por su vinagreta.',
    observation: 'Contiene proteína vegetal, acompañada de una mayo griega de ajo y su topping es queso feta.',
    portions: 3,
    variants: [
      { label: '450 gr', price: 37900 },
      { label: '250 gr', price: 25900 },
    ],
    ingredients: ['mezclum', 'rúcula', 'frutos secos mix', 'quinoa cocida', 'cebolla puerro tostada', 'tomate uvalina', 'mayonesa griega de ajo', 'queso feta', 'zanahoria']
  },
  {
    id: 'ensalada-italiana',
    name: 'Ensalada Italiana',
    price: 36900,
    description: 'Es una ensalada alta en proteína, te da energía sostenida y sacia tu apetito por horas, como una cena normal.',
    image: 'https://picsum.photos/seed/ensalada-italiana/400/300',
    category: 'ensaladas-gourmet',
    benefits: ['Proteína animal', 'Energía'],
    healthBenefit: 'Es una ensalada alta en proteína, te da energía sostenida y sacia tu apetito por horas, como una cena normal.',
    observation: 'Contiene proteína animal de alta calidad, acompañada de pesto y su topping es queso mozzarella di bufala ciliegine.',
    portions: 3,
    variants: [
      { label: '450 gr', price: 36900 },
      { label: '250 gr', price: 23900 },
    ],
    ingredients: ['rúcula', 'mix tomate uvalina', 'pasta corta cocida', 'aceituna', 'burrata', 'pepino mediterráneo', 'cebolla chalota', 'pesto', 'mortadela italiana']
  },
  {
    id: 'ensalada-sandia-feta',
    name: 'Ensalada de Sandía y Feta',
    price: 31900,
    description: 'Contiene electrolitos que hidratan tu cuerpo profundamente. Además es digestiva.',
    image: 'https://picsum.photos/seed/ensalada-sandia-feta/400/300',
    category: 'ensaladas-gourmet',
    benefits: ['Hidratante', 'Digestiva'],
    healthBenefit: 'Contiene electrolitos que hidratan tu cuerpo profundamente. Además es digestiva.',
    observation: 'Acompañada de una vinagreta fresca de naranja y cilantro y su topping es el queso feta.',
    portions: 3,
    variants: [
      { label: '450 gr', price: 31900 },
      { label: '250 gr', price: 21900 },
    ],
    ingredients: ['sandía baby', 'queso feta', 'pepino mediterráneo', 'menta', 'vinagreta de naranja y cilantro', 'garbanzo crocante']
  },
  {
    id: 'ensalada-baby',
    name: 'Ensalada Baby',
    price: 31900,
    description: 'Es alta en fibra y micronutrientes, una ensalada ultra limpia y funcional. Contiene antioxidantes diversos.',
    image: 'https://picsum.photos/seed/ensalada-baby/400/300',
    category: 'ensaladas-gourmet',
    benefits: ['Fibra', 'Micronutrientes'],
    healthBenefit: 'Es alta en fibra y micronutrientes, una ensalada ultra limpia y funcional. Contiene antioxidantes diversos.',
    observation: 'Acompañada de un hummus cremoso y balanceado.',
    portions: 3,
    variants: [
      { label: '450 gr', price: 31900 },
      { label: '250 gr', price: 24900 },
    ],
    ingredients: ['zanahoria baby', 'mazorquita baby', 'palmitos', 'mix tomate cherry', 'cebolla chalota remojada', 'pepino mediterráneo', 'espinaca bogotana', 'brotes', 'hummus']
  },
  {
    id: 'ensalada-serana',
    name: 'Ensalada Serana',
    price: 29900,
    description: 'Alto en antioxidantes, buena fuente de fibra y balance entre lo dulce y lo salado.',
    image: 'https://picsum.photos/seed/ensalada-serana/400/300',
    category: 'ensaladas-gourmet',
    benefits: ['Antioxidantes', 'Fibra'],
    healthBenefit: 'Alto en antioxidantes, buena fuente de fibra y balance entre lo dulce y lo salado.',
    observation: 'Acompañada de una vinagreta de fresa y menta y sus toppings son el queso parmesano y los croutones.',
    portions: 3,
    variants: [
      { label: '450 gr', price: 29900 },
      { label: '250 gr', price: 19000 },
    ],
    ingredients: ['rúcula', 'queso parmesano', 'croutones', 'mix tomate cherry', 'uva importada', 'fresa', 'cebolla puerro tostada', 'pepino europeo', 'vinagreta de fresa y menta', 'zanahoria']
  },

  // Ensaladas Tradicionales
  {
    id: 'ensalada-cesar',
    name: 'Ensalada César',
    price: 26900,
    description: 'Es una ensalada que te da alta saciedad, es el equilibrio entre frescura y densidad nutricional.',
    image: 'https://qlgjqvgjuscquhspjqdp.supabase.co/storage/v1/object/public/AETHERA-DOCS/ensalada%20cesar.jpeg',
    category: 'ensaladas-tradicionales',
    benefits: ['Alta saciedad', 'Frescura'],
    healthBenefit: 'Es una ensalada que te da alta saciedad, es el equilibrio entre frescura y densidad nutricional.',
    observation: 'Acompañada de una salsa césar especiada y sus toppings son el queso parmesano y los croutones.',
    portions: 3,
    variants: [
      { label: '300 gr', price: 26900 },
      { label: '125 gr', price: 16500 },
    ],
    ingredients: ['cogollo europeo', 'queso parmesano', 'croutones', 'crujiente de garbanzos', 'brotes microgreen', 'salsa césar', 'maicitos', 'tomate perla']
  },
  {
    id: 'ensalada-primavera',
    name: 'Ensalada Primavera',
    price: 19900,
    description: 'Es una ensalada hidratante, digestiva y ligera, con aporte de vitaminas y antioxidantes.',
    image: 'https://qlgjqvgjuscquhspjqdp.supabase.co/storage/v1/object/public/AETHERA-DOCS/Ensalada_primavera_en_bol_54288481e0.jpeg',
    category: 'ensaladas-tradicionales',
    benefits: ['Hidratante', 'Digestiva'],
    healthBenefit: 'Es una ensalada hidratante, digestiva y ligera, con aporte de vitaminas y antioxidantes.',
    observation: 'Vinagreta de mostaza y miel y su topping es el puerro caramelizado.',
    portions: 4,
    variants: [
      { label: '500 gr', price: 19900 },
      { label: '250 gr', price: 15500 },
    ],
    ingredients: ['pepino sin semilla', 'tomate san marzano sin semilla', 'mango tommy', 'cebolla puerro tostada', 'cilantro', 'hierbabuena', 'vinagreta de mostaza y miel']
  },
  {
    id: 'verduras-saltear',
    name: 'Verduras para Saltear',
    price: 13900,
    description: 'Es alta en fibra, limpia tu sistema digestivo y mejora tu función intestinal. Es un detox natural.',
    image: 'https://qlgjqvgjuscquhspjqdp.supabase.co/storage/v1/object/public/AETHERA-DOCS/verduras%20para%20saltear.jpeg',
    category: 'ensaladas-tradicionales',
    benefits: ['Fibra', 'Detox natural'],
    healthBenefit: 'Es alta en fibra, limpia tu sistema digestivo y mejora tu función intestinal. Es un detox natural.',
    observation: 'No tiene toppings ni contiene alérgenos.',
    portions: 4,
    variants: [
      { label: '500 gr', price: 13900 },
      { label: '250 gr', price: 9000 },
    ],
    ingredients: ['zucchini', 'zanahoria', 'apio', 'brócoli', 'cebolla roja', 'cebolla puerro', 'pimentón']
  },
  {
    id: 'pico-de-gallo',
    name: 'Pico de Gallo',
    price: 14900,
    description: 'Es digestiva y antiinflamatoria.',
    image: 'https://qlgjqvgjuscquhspjqdp.supabase.co/storage/v1/object/public/AETHERA-DOCS/pico%20de%20gallo.jpeg',
    category: 'ensaladas-tradicionales',
    benefits: ['Digestiva', 'Antiinflamatoria'],
    healthBenefit: 'Es digestiva y antiinflamatoria.',
    observation: 'No tiene toppings ni contiene alérgenos.',
    portions: 4,
    variants: [
      { label: '500 gr', price: 14900 },
      { label: '250 gr', price: 9900 },
    ],
    ingredients: ['tomate de aliño', 'cebolla blanca', 'cilantro']
  },
  {
    id: 'ceviche-mango',
    name: 'Ceviche de Mango',
    price: 14900,
    description: 'Es una ensalada que por su alto contenido de vitamina C es detox y beneficiosa para el sistema inmune.',
    image: 'https://tjjrnpwwfvmsukfrfchr.supabase.co/storage/v1/object/public/productos/ceviche_de_mango_producto.jpeg',
    category: 'ensaladas-tradicionales',
    benefits: ['Vitamina C', 'Sistema inmune'],
    healthBenefit: 'Es una ensalada que por su alto contenido de vitamina C es detox y beneficiosa para el sistema inmune.',
    observation: 'Su topping es limón entero y salpimienta.',
    portions: 4,
    variants: [
      { label: '500 gr', price: 14900 },
      { label: '250 gr', price: 9900 },
    ],
    ingredients: ['mango tommy', 'cebolla morada', 'ají dulce', 'pimentón', 'cilantro', 'ajo', 'limón tahiti', 'pimienta', 'sal']
  },

  // Salsas y Vinagretas
  {
    id: 'salsa-cesar',
    name: 'Salsa César (200ml)',
    price: 26900,
    description: 'Excelente fuente de grasas buenas y proteína, útil para saciar y complementar tus comidas.',
    image: 'https://picsum.photos/seed/salsa-cesar/400/300',
    category: 'salsas',
    benefits: ['Grasas buenas', 'Proteína'],
    healthBenefit: 'Excelente fuente de grasas buenas y proteína, útil para saciar y complementar tus comidas.',
    observation: 'Contiene trazos de huevo, posible alérgeno. Es una salsa balanceada y especiada ideal para ensaladas frescas.',
    portions: 10
  },
  {
    id: 'vinagreta-mostaza-miel',
    name: 'Vinagreta Mostaza y Miel (200ml)',
    price: 26900,
    description: 'Perfecta combinación para tu activación metabólica y energía rápida. Un preentreno ligero.',
    image: 'https://picsum.photos/seed/vinagreta-mostaza-miel/400/300',
    category: 'salsas',
    benefits: ['Energía rápida', 'Metabolismo'],
    healthBenefit: 'Perfecta combinación para tu activación metabólica y energía rápida. Un preentreno ligero.',
    observation: 'Contiene semillas de chía.',
    portions: 10
  },
  {
    id: 'pesto',
    name: 'Pesto (200ml)',
    price: 33900,
    description: 'Una de las salsas más completas nutricionalmente, aporta grasas saludables, proteína y calcio.',
    image: 'https://picsum.photos/seed/pesto/400/300',
    category: 'salsas',
    benefits: ['Grasas saludables', 'Calcio'],
    healthBenefit: 'Una de las salsas más completas nutricionalmente, aporta grasas saludables, proteína y calcio.',
    observation: 'Contiene trazos de nueces, posible alérgeno.',
    portions: 10
  },
  {
    id: 'mayonesa-griega',
    name: 'Mayonesa Griega de Ajo (200ml)',
    price: 27900,
    description: 'La salsa más proteica de la lista, con proteínas, probióticos y cualidad digestiva.',
    image: 'https://picsum.photos/seed/mayonesa-griega/400/300',
    category: 'salsas',
    benefits: ['Proteica', 'Probióticos'],
    healthBenefit: 'La salsa más proteica de la lista, con proteínas, probióticos y cualidad digestiva.',
    observation: 'Contiene lácteos, posible alérgeno.',
    portions: 10
  },
  {
    id: 'vinagreta-fresa-menta',
    name: 'Vinagreta Fresa y Menta (200ml)',
    price: 22900,
    description: 'Una salsa con alta carga antioxidante y muy fresca.',
    image: 'https://picsum.photos/seed/vinagreta-fresa-menta/400/300',
    category: 'salsas',
    benefits: ['Antioxidante', 'Fresca'],
    healthBenefit: 'Una salsa con alta carga antioxidante y muy fresca.',
    observation: 'Es una vinagreta balanceada y dulce, contiene azúcar.',
    portions: 10
  },
  {
    id: 'vinagreta-miel-balsamico',
    name: 'Vinagreta Miel y Balsámico (200ml)',
    price: 29900,
    description: 'Te brinda protección cardiovascular y regula tu glucosa con energía natural.',
    image: 'https://picsum.photos/seed/vinagreta-miel-balsamico/400/300',
    category: 'salsas',
    benefits: ['Cardiovascular', 'Energía natural'],
    healthBenefit: 'Te brinda protección cardiovascular y regula tu glucosa con energía natural.',
    observation: 'Es una vinagreta balanceada, entre dulce y ácida.',
    portions: 10
  },
  {
    id: 'vinagreta-naranja-cilantro',
    name: 'Vinagreta Naranja y Cilantro (200ml)',
    price: 21900,
    description: 'Una vinagreta altísima en vitamina C, tiene efecto detox natural y refuerza tu sistema inmune.',
    image: 'https://picsum.photos/seed/vinagreta-naranja-cilantro/400/300',
    category: 'salsas',
    benefits: ['Vitamina C', 'Detox'],
    healthBenefit: 'Una vinagreta altísima en vitamina C, tiene efecto detox natural y refuerza tu sistema inmune.',
    observation: 'Es una vinagreta fresca y frutal.',
    portions: 10
  },
  {
    id: 'hummus',
    name: 'Hummus (200ml)',
    price: 21900,
    description: 'Una salsa con proteína vegetal de alta calidad, aporta fibra y regula el azúcar en sangre.',
    image: 'https://picsum.photos/seed/hummus/400/300',
    category: 'salsas',
    benefits: ['Proteína vegetal', 'Fibra'],
    healthBenefit: 'Una salsa con proteína vegetal de alta calidad, aporta fibra y regula el azúcar en sangre.',
    observation: 'Es una salsa clásica cremosa, ideal para acompañar carbohidratos como pan o pasta.',
    portions: 10
  },
  {
    id: 'chimichurri',
    name: 'Chimichurri (200ml)',
    price: 26900,
    description: 'Tiene poder antiinflamatorio y mejora la digestión de proteínas, ideal para acompañar carnes.',
    image: 'https://picsum.photos/seed/chimichurri/400/300',
    category: 'salsas',
    benefits: ['Antiinflamatorio', 'Digestivo'],
    healthBenefit: 'Tiene poder antiinflamatorio y mejora la digestión de proteínas, ideal para acompañar carnes.',
    observation: 'Contiene pimienta, posible alérgeno.',
    portions: 10
  },

  // Sopas prelistas
  {
    id: 'crema-tomate',
    name: 'Crema de Tomate (Libra)',
    price: 18900,
    description: 'Poderoso antioxidante, protege el corazón y la piel. Baja en calorías y rica en nutrientes.',
    image: 'https://picsum.photos/seed/crema-tomate/400/300',
    category: 'sopas',
    benefits: ['Antioxidante', 'Baja en calorías'],
    healthBenefit: 'Poderoso antioxidante, protege el corazón y la piel. Baja en calorías y rica en nutrientes.',
    portions: 4,
    ingredients: ['tomate san marzano', 'cebolla blanca', 'albahaca', 'ajo', 'pimienta negra en grano']
  },
  {
    id: 'crema-auyama',
    name: 'Crema de Auyama (Libra)',
    price: 12900,
    description: 'Fortalece la visión y el sistema inmune, tiene efecto antiinflamatorio y recupera energía.',
    image: 'https://picsum.photos/seed/crema-auyama/400/300',
    category: 'sopas',
    benefits: ['Sistema inmune', 'Antiinflamatoria'],
    healthBenefit: 'Fortalece la visión y el sistema inmune, tiene efecto antiinflamatorio y recupera energía.',
    portions: 4,
    ingredients: ['ahuyama', 'zanahoria', 'apio', 'cebolla blanca', 'pimentón', 'pimienta blanca entera', 'ajo']
  },
  {
    id: 'crema-hongos',
    name: 'Crema de Hongos (Libra)',
    price: 26900,
    description: 'Rica en nutrientes que ayudan al sistema nervioso y al fortalecimiento cerebral. Aporta enfoque mental.',
    image: 'https://picsum.photos/seed/crema-hongos/400/300',
    category: 'sopas',
    benefits: ['Enfoque mental', 'Sistema nervioso'],
    healthBenefit: 'Rica en nutrientes que ayudan al sistema nervioso y al fortalecimiento cerebral. Aporta enfoque mental.',
    portions: 4,
    ingredients: ['champiñón', 'crimini', 'cebolla larga', 'cebolla blanca', 'cebolla puerro', 'papa criolla', 'ajo', 'pimienta negra', 'pimienta verde']
  },
  {
    id: 'crema-verduras',
    name: 'Crema de Verduras (Libra)',
    price: 13900,
    description: 'Es alta en fibra y ayuda a la limpieza intestinal. Aporta nutrientes completos para la salud en general.',
    image: 'https://picsum.photos/seed/crema-verduras/400/300',
    category: 'sopas',
    benefits: ['Fibra', 'Limpieza intestinal'],
    healthBenefit: 'Es alta en fibra y ayuda a la limpieza intestinal. Aporta nutrientes completos para la salud en general.',
    portions: 4,
    ingredients: ['ahuyama', 'zanahoria', 'apio', 'cebolla morada', 'cebolla puerro', 'espinaca', 'ajo', 'pimienta blanca', 'pimienta verde']
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
    description: 'Contiene pepino, piña, apio, menta y espinaca: especial para tu sistema digestivo y la desinflamación abdominal.',
    image: 'https://picsum.photos/seed/jugo-verde/400/300',
    category: 'bebidas',
    benefits: ['Detox', 'Energizante']
  },
  {
    id: 'batido-circulacion',
    name: 'Batido Circulación (x5)',
    price: 18900,
    description: 'Contiene remolacha, cúrcuma, zanahoria y mora: para tus músculos y la circulación efectiva de la sangre.',
    image: 'https://picsum.photos/seed/batido-circulacion/400/300',
    category: 'bebidas',
    benefits: ['Saludable', 'Natural']
  },
  {
    id: 'batido-detox',
    name: 'Batido Detox Antiestrés (x5)',
    price: 18900,
    description: 'Contiene papaya, piña, pepino y jengibre: calma el estrés y te activa la microbiota.',
    image: 'https://picsum.photos/seed/batido-detox/400/300',
    category: 'bebidas',
    benefits: ['Relajante', 'Depurativo']
  },
  {
    id: 'jugo-naranja',
    name: 'Jugo de Naranja (x6)',
    price: 39900,
    description: 'Jugos siempre frescos, dulcecitos y con naranjas seleccionadas.',
    image: 'https://picsum.photos/seed/jugo-naranja/400/300',
    category: 'bebidas',
    benefits: ['Vitamina C', 'Refrescante']
  },
  {
    id: 'shot-metabolico',
    name: 'Shot Metabólico (x6)',
    price: 48900,
    description: 'Una combinación de ingredientes que te activan el metabolismo y te ayudan a bajar de peso.',
    image: 'https://picsum.photos/seed/shot-metabolico/400/300',
    category: 'bebidas',
    benefits: ['Metabolismo', 'Energía']
  },
  {
    id: 'shot-serenidad',
    name: 'Shot Serenidad (x6)',
    price: 49500,
    description: 'Un shot que te calma el estrés y te calma el sistema nervioso central.',
    image: 'https://picsum.photos/seed/shot-serenidad/400/300',
    category: 'bebidas',
    benefits: ['Calma', 'Bienestar']
  },
  {
    id: 'shot-concentracion',
    name: 'Shot Concentración (x6)',
    price: 59500,
    description: 'Un shot cargado de antioxidantes que tiene repercusión directa y positiva en tu cerebro.',
    image: 'https://picsum.photos/seed/shot-concentracion/400/300',
    category: 'bebidas',
    benefits: ['Enfoque', 'Mental']
  },
  {
    id: 'shot-antiinflamatorio',
    name: 'Shot Antiinflamatorio (x6)',
    price: 49500,
    description: 'Este shot con ingredientes que te desinflaman y te hace sentir más ligero.',
    image: 'https://picsum.photos/seed/shot-antiinflamatorio/400/300',
    category: 'bebidas',
    benefits: ['Salud', 'Recuperación']
  },
  {
    id: 'shot-muscular',
    name: 'Shot Muscular (x6)',
    price: 44500,
    description: 'El shot perfecto para activar tu cuerpo, para deportistas o incluso para un mejor rendimiento sexual.',
    image: 'https://picsum.photos/seed/shot-muscular/400/300',
    category: 'bebidas',
    benefits: ['Recuperación', 'Fuerza']
  },
  {
    id: 'shot-piel',
    name: 'Shot Piel Perfecta (x6)',
    price: 35900,
    description: 'El shot que tiene todos los ingredientes que tienen beneficios directos a la salud cutánea.',
    image: 'https://picsum.photos/seed/shot-piel/400/300',
    category: 'bebidas',
    benefits: ['Belleza', 'Nutrición']
  },

  // Frutas picadas
  {
    id: 'mango-picado',
    name: 'Mango Picado (Libra)',
    price: 13900,
    description: 'Delicioso mango tommy picadito: pídelo maduro, pintón o verde.',
    image: 'https://picsum.photos/seed/mango-picado/400/300',
    category: 'frutas-picadas',
    benefits: ['Listo para comer', 'Dulce']
  },
  {
    id: 'pina-picada',
    name: 'Piña Picada (Libra)',
    price: 15900,
    description: 'Piña en cubitos sin corazón, cuidadosamente seleccionada.',
    image: 'https://picsum.photos/seed/pina-picada/400/300',
    category: 'frutas-picadas',
    benefits: ['Diurética', 'Dulce']
  },
  {
    id: 'fresa-picada',
    name: 'Fresa Picada (Libra)',
    price: 16900,
    description: 'Fresas grandes siempre rojas y de la mejor calidad.',
    image: 'https://picsum.photos/seed/fresa-picada/400/300',
    category: 'frutas-picadas',
    benefits: ['Antioxidantes', 'Fresca']
  },
  {
    id: 'sandia-baby-picada',
    name: 'Sandía Baby Picada (Libra)',
    price: 15500,
    description: 'Las sandías más rojitas y maduras.',
    image: 'https://picsum.photos/seed/sandia-baby-picada/400/300',
    category: 'frutas-picadas',
    benefits: ['Hidratante', 'Baja en calorías']
  },
  {
    id: 'coco-picado',
    name: 'Coco Picado (Libra)',
    price: 26000,
    description: 'Sin cáscara, sin dificultades, sólo la carne del coco como te gusta.',
    image: 'https://picsum.photos/seed/coco-picado/400/300',
    category: 'frutas-picadas',
    benefits: ['Energía', 'Grasas saludables']
  },
  {
    id: 'melon-picado',
    name: 'Melón Picado (Libra)',
    price: 17900,
    description: 'Melón siempre maduro, rosado y dulcecito.',
    image: 'https://picsum.photos/seed/melon-picado/400/300',
    category: 'frutas-picadas',
    benefits: ['Refrescante', 'Vitaminas']
  },
  {
    id: 'guayaba-manzana-picada',
    name: 'Guayaba Manzana Picada (Libra)',
    price: 16900,
    description: 'Seleccionamos siempre cuidadosamente para que su textura sea impecable.',
    image: 'https://picsum.photos/seed/guayaba-manzana-picada/400/300',
    category: 'frutas-picadas',
    benefits: ['Vitamina C', 'Fibra']
  },
  {
    id: 'uchuva',
    name: 'Uchuva (Libra)',
    price: 17900,
    description: 'Sin capacho, lavada y desinfectada.',
    image: 'https://picsum.photos/seed/uchuva/400/300',
    category: 'frutas-picadas',
    benefits: ['Exótica', 'Antioxidante']
  },
  {
    id: 'papaya-picada',
    name: 'Papaya Picada (Libra)',
    price: 13500,
    description: 'Seleccionamos las papayas más dulces y deliciosas.',
    image: 'https://picsum.photos/seed/papaya-picada/400/300',
    category: 'frutas-picadas',
    benefits: ['Digestiva', 'Suave']
  },
  {
    id: 'baby-bowl-berry',
    name: 'Baby Bowl Berry Mix (250g)',
    price: 21000,
    description: 'Una combinación de frutos del bosque: frambuesa, fresa y arándanos, simplemente exquisito.',
    image: 'https://picsum.photos/seed/baby-bowl-berry/400/300',
    category: 'frutas-picadas',
    benefits: ['Antioxidantes', 'Snack perfecto']
  },
  {
    id: 'baby-bowl-amarillos',
    name: 'Baby Bowl Frutos Amarillos (250g)',
    price: 9000,
    description: 'Una combinación de mango con piña deliciosa.',
    image: 'https://picsum.photos/seed/baby-bowl-amarillos/400/300',
    category: 'frutas-picadas',
    benefits: ['Vitamina C', 'Tropical']
  },
  // Verduras picadas y mercado fresco
  {
    id: 'zucchini-picado',
    name: 'Zucchini Verde/Amarillo Picado (Libra)',
    price: 12000,
    description: 'Un vegetal infaltable en tus preparaciones.',
    image: 'https://picsum.photos/seed/zucchini-picado/400/300',
    category: 'verduras-picadas',
    benefits: ['Bajo en calorías', 'Versátil']
  },
  {
    id: 'pimenton-picado',
    name: 'Pimentón Rojo Picado (Libra)',
    price: 16500,
    description: 'Un ingrediente que le da sabor a tus comidas.',
    image: 'https://picsum.photos/seed/pimenton-picado/400/300',
    category: 'verduras-picadas',
    benefits: ['Vitamina C', 'Sabor']
  },
  {
    id: 'cebolla-blanca-picada',
    name: 'Cebolla Blanca Picada (Libra)',
    price: 12900,
    description: 'Qué es de una comida sin la sazón de las cebollas.',
    image: 'https://picsum.photos/seed/cebolla-blanca-picada/400/300',
    category: 'verduras-picadas',
    benefits: ['Básica', 'Sabor']
  },
  {
    id: 'tomate-cherry',
    name: 'Tomate Cherry (Libra)',
    price: 20500,
    description: 'Un tomate redondo y acidito, delicioso para ensaladas.',
    image: 'https://picsum.photos/seed/tomate-cherry/400/300',
    category: 'mercado-fresco',
    benefits: ['Snack', 'Ensaladas']
  },
  {
    id: 'lechuga-hidroponica',
    name: 'Lechuga Hidropónica (250g)',
    price: 8900,
    description: 'Una lechuga crespa de consistencia firme, lavada y desinfectada.',
    image: 'https://picsum.photos/seed/lechuga-hidroponica/400/300',
    category: 'mercado-fresco',
    benefits: ['Fresca', 'Crujiente']
  },
  {
    id: 'mezclum',
    name: 'Mezclum Orgánico Lavado (250g)',
    price: 24500,
    description: 'Una variedad de 11 hojas orgánicas e hidropónicas, lavado y desinfectado.',
    image: 'https://picsum.photos/seed/mezclum/400/300',
    category: 'mercado-fresco',
    benefits: ['Orgánico', 'Premium']
  },
  {
    id: 'cebolla-roja',
    name: 'Cebolla Roja Picada (Libra)',
    price: 12900,
    description: 'De sabor más fuerte que la blanca pero te realza las comidas de la mejor manera.',
    image: 'https://picsum.photos/seed/cebolla-roja/400/300',
    category: 'verduras-picadas',
    benefits: ['Sabor intenso', 'Versátil']
  },
  {
    id: 'cebolla-puerro',
    name: 'Cebolla Puerro (Libra)',
    price: 5900,
    description: 'Para cremas, salteados y sopas.',
    image: 'https://picsum.photos/seed/cebolla-puerro/400/300',
    category: 'mercado-fresco',
    benefits: ['Aromática', 'Versátil']
  },
  {
    id: 'cebolla-larga',
    name: 'Cebolla Larga (Atado)',
    price: 4900,
    description: 'Para guisos y sopas.',
    image: 'https://picsum.photos/seed/cebolla-larga/400/300',
    category: 'mercado-fresco',
    benefits: ['Tradicional', 'Sabor']
  },
  {
    id: 'habichuela',
    name: 'Habichuela (Libra)',
    price: 8900,
    description: 'Contiene fibra y le hace bien a tu salud digestiva.',
    image: 'https://picsum.photos/seed/habichuela/400/300',
    category: 'mercado-fresco',
    benefits: ['Fibra', 'Digestiva']
  },
  {
    id: 'rabano',
    name: 'Rábano (Libra)',
    price: 7900,
    description: 'Un alimento que favorece la salud cardiovascular y digestiva.',
    image: 'https://picsum.photos/seed/rabano/400/300',
    category: 'mercado-fresco',
    benefits: ['Cardiovascular', 'Digestivo']
  },
  {
    id: 'auyama',
    name: 'Auyama (Libra)',
    price: 6900,
    description: 'Para hacer sopas, puré o hacer láminas en el airfryer.',
    image: 'https://picsum.photos/seed/auyama/400/300',
    category: 'mercado-fresco',
    benefits: ['Versátil', 'Nutritiva']
  },
  {
    id: 'remolacha',
    name: 'Remolacha (Libra)',
    price: 7900,
    description: 'El vegetal que mejora tu salud cardiovascular.',
    image: 'https://picsum.photos/seed/remolacha/400/300',
    category: 'mercado-fresco',
    benefits: ['Cardiovascular', 'Antioxidante']
  },
  {
    id: 'tomate-aliño',
    name: 'Tomate de Aliño (Libra)',
    price: 6900,
    description: 'No es un vegetal, es una fruta, pero especial para hacer ensaladas y guisos.',
    image: 'https://picsum.photos/seed/tomate-aliño/400/300',
    category: 'mercado-fresco',
    benefits: ['Esencial', 'Versátil']
  },
  {
    id: 'tomate-uvalina',
    name: 'Tomate Uvalina (Libra)',
    price: 12900,
    description: 'Parecido al cherry pero más dulce y ovalado.',
    image: 'https://picsum.photos/seed/tomate-uvalina/400/300',
    category: 'mercado-fresco',
    benefits: ['Dulce', 'Ensaladas']
  },
  {
    id: 'repollo',
    name: 'Repollo Blanco/Morado (Libra)',
    price: 5900,
    description: 'Un alimento completo que te mejora la digestión.',
    image: 'https://picsum.photos/seed/repollo/400/300',
    category: 'mercado-fresco',
    benefits: ['Digestión', 'Fibra']
  },
  {
    id: 'apio',
    name: 'Apio (Atado)',
    price: 5900,
    description: 'Un vegetal potente para tu salud digestiva y metabólica.',
    image: 'https://picsum.photos/seed/apio/400/300',
    category: 'mercado-fresco',
    benefits: ['Digestivo', 'Metabólico']
  },
  {
    id: 'brocoli',
    name: 'Brócoli (Libra)',
    price: 8900,
    description: 'Proteína vegetal, un superalimento.',
    image: 'https://picsum.photos/seed/brocoli/400/300',
    category: 'mercado-fresco',
    benefits: ['Superalimento', 'Proteína']
  },
  {
    id: 'pepino',
    name: 'Pepino (Libra)',
    price: 5900,
    description: 'Altamente hidratante y bajo en calorías.',
    image: 'https://picsum.photos/seed/pepino/400/300',
    category: 'mercado-fresco',
    benefits: ['Hidratante', 'Ligero']
  },
  {
    id: 'penca-sabila',
    name: 'Penca Sábila (Libra)',
    price: 7900,
    description: 'Sirve como tópico (quemaduras, hidratar la piel y cicatrizar heridas) o para hacer licuados y mejorar tu digestión.',
    image: 'https://picsum.photos/seed/penca-sabila/400/300',
    category: 'mercado-fresco',
    benefits: ['Medicinal', 'Digestiva']
  },
  {
    id: 'yuca-pelada',
    name: 'Yuca Pelada Desvenada (Libra)',
    price: 6900,
    description: 'Perfectamente seleccionada, bien lavada y sin vena.',
    image: 'https://picsum.photos/seed/yuca-pelada/400/300',
    category: 'mercado-fresco',
    benefits: ['Lista', 'Tradicional']
  },
  {
    id: 'zanahoria',
    name: 'Zanahoria (Libra)',
    price: 4900,
    description: 'Dulce y fresca, especial para tu salud ocular.',
    image: 'https://picsum.photos/seed/zanahoria/400/300',
    category: 'mercado-fresco',
    benefits: ['Vitamina A', 'Salud ocular']
  },
  {
    id: 'lechuga-batavia',
    name: 'Lechuga Batavia (Libra)',
    price: 5900,
    description: 'La inconfundible lechuga batavia para ensaladas, ya lista para consumir.',
    image: 'https://picsum.photos/seed/lechuga-batavia/400/300',
    category: 'mercado-fresco',
    benefits: ['Fresca', 'Lista']
  },
  {
    id: 'perejil',
    name: 'Perejil (150g)',
    price: 3900,
    description: 'Lavado y desinfectado, pídelo crespo o liso.',
    image: 'https://picsum.photos/seed/perejil/400/300',
    category: 'mercado-fresco',
    benefits: ['Aromático', 'Fresco']
  },
  {
    id: 'coliflor',
    name: 'Coliflor (Libra)',
    price: 8900,
    description: 'Un vegetal que te ayuda a perder peso, bajo en calorías y cargado de proteína.',
    image: 'https://picsum.photos/seed/coliflor/400/300',
    category: 'mercado-fresco',
    benefits: ['Bajo en calorías', 'Proteína']
  },
  {
    id: 'cilantro',
    name: 'Cilantro Lavado (150g)',
    price: 3900,
    description: 'Cilantro fresco, desinfectado y lavado.',
    image: 'https://picsum.photos/seed/cilantro/400/300',
    category: 'mercado-fresco',
    benefits: ['Aromático', 'Fresco']
  },

    {
    id: 'papa-capira', name: 'Papa Capira (Libra)', price: 4900,
    description: 'Lavadas y desinfectadas.', image: 'https://picsum.photos/seed/papa-capira/400/300',
    category: 'mercado-fresco', benefits: ['Tradicional', 'Lista']
  },
  {
    id: 'papa-criolla', name: 'Papa Criolla (Libra)', price: 6900,
    description: 'Lavadas y desinfectadas.', image: 'https://picsum.photos/seed/papa-criolla/400/300',
    category: 'mercado-fresco', benefits: ['Colombiana', 'Lista']
  },
  {
    id: 'papa-nevada', name: 'Papa Nevada (Libra)', price: 5900,
    description: 'Lavadas y desinfectadas.', image: 'https://picsum.photos/seed/papa-nevada/400/300',
    category: 'mercado-fresco', benefits: ['Versátil', 'Lista']
  },
  {
    id: 'frijol-rojo', name: 'Frijol Rojo (Libra)', price: 7900,
    description: 'Desinfectado y seleccionado.', image: 'https://picsum.photos/seed/frijol-rojo/400/300',
    category: 'mercado-fresco', benefits: ['Proteína', 'Tradicional']
  },
  {
    id: 'guineo', name: 'Guineo (Libra)', price: 4900,
    description: 'Siempre verde y fresco.', image: 'https://picsum.photos/seed/guineo/400/300',
    category: 'mercado-fresco', benefits: ['Verde', 'Fresco']
  },
  {
    id: 'platano', name: 'Plátano (Libra)', price: 4900,
    description: 'Pídelo verde, pintón o maduro.', image: 'https://picsum.photos/seed/platano/400/300',
    category: 'mercado-fresco', benefits: ['Versátil', 'Tradicional']
  },
  {
    id: 'yuca-libra', name: 'Yuca (Libra)', price: 4900,
    description: 'Seleccionada con ojo de halcón.', image: 'https://picsum.photos/seed/yuca-libra/400/300',
    category: 'mercado-fresco', benefits: ['Tradicional', 'Seleccionada']
  },
  {
    id: 'champinon', name: 'Champiñón (Libra)', price: 14900,
    description: 'Pide media libra, libra o kilo.', image: 'https://picsum.photos/seed/champinon/400/300',
    category: 'mercado-fresco', benefits: ['Gourmet', 'Versátil']
  },
  {
    id: 'orellana', name: 'Orellana (Libra)', price: 16900,
    description: 'Pide media libra, libra o kilo.', image: 'https://picsum.photos/seed/orellana/400/300',
    category: 'mercado-fresco', benefits: ['Gourmet', 'Premium']
  },
  {
    id: 'tomate-san-marzano', name: 'Tomate San Marzano (Libra)', price: 9900,
    description: 'Perfectamente seleccionados.', image: 'https://picsum.photos/seed/tomate-san-marzano/400/300',
    category: 'mercado-fresco', benefits: ['Premium', 'Salsas']
  },
  {
    id: 'cebolla-morada', name: 'Cebolla Morada (Libra)', price: 5900,
    description: 'Lavada, pelada y limpia.', image: 'https://picsum.photos/seed/cebolla-morada/400/300',
    category: 'mercado-fresco', benefits: ['Sabor', 'Lista']
  },
  {
    id: 'cebollin', name: 'Cebollín (Atado)', price: 3900,
    description: 'Lavado y desinfectado.', image: 'https://picsum.photos/seed/cebollin/400/300',
    category: 'mercado-fresco', benefits: ['Aromático', 'Fresco']
  },
  {
    id: 'cebolla-chalota', name: 'Cebolla Chalota (Libra)', price: 12900,
    description: 'Son más dulces y delicadas.', image: 'https://picsum.photos/seed/cebolla-chalota/400/300',
    category: 'mercado-fresco', benefits: ['Gourmet', 'Dulce']
  },
  {
    id: 'ajo', name: 'Ajo (Libra)', price: 3900,
    description: 'Seleccionado con cuidado.', image: 'https://picsum.photos/seed/ajo/400/300',
    category: 'mercado-fresco', benefits: ['Esencial', 'Sabor']
  },
  {
    id: 'lechuga-romana', name: 'Lechuga Romana (Libra)', price: 5900,
    description: 'Para ensaladas y emparedados.', image: 'https://picsum.photos/seed/lechuga-romana/400/300',
    category: 'mercado-fresco', benefits: ['Fresca', 'Crujiente']
  },
  {
    id: 'cogollo-europeo', name: 'Cogollo Europeo (Libra)', price: 7900,
    description: 'Para ensaladas y emparedados.', image: 'https://picsum.photos/seed/cogollo-europeo/400/300',
    category: 'mercado-fresco', benefits: ['Premium', 'Ensaladas']
  },
  {
    id: 'arracacha', name: 'Arracacha (Libra)', price: 5900,
    description: 'Tubérculo tradicional colombiano.', image: 'https://picsum.photos/seed/arracacha/400/300',
    category: 'mercado-fresco', benefits: ['Tradicional', 'Nutritiva']
  },
  {
    id: 'jengibre', name: 'Jengibre (100g)', price: 4900,
    description: 'Raíz potente para infusiones y preparaciones.', image: 'https://picsum.photos/seed/jengibre/400/300',
    category: 'mercado-fresco', benefits: ['Medicinal', 'Antiinflamatorio']
  },
  {
    id: 'aji-dulce', name: 'Ají Dulce (Libra)', price: 7900,
    description: 'Sabor sin picante.', image: 'https://picsum.photos/seed/aji-dulce/400/300',
    category: 'mercado-fresco', benefits: ['Aromático', 'Suave']
  },
  {
    id: 'aji-rocoto', name: 'Ají Rocoto Picante (Libra)', price: 12900,
    description: 'Para los amantes del picante.', image: 'https://picsum.photos/seed/aji-rocoto/400/300',
    category: 'mercado-fresco', benefits: ['Picante', 'Intenso']
  },
  {
    id: 'jalapeno', name: 'Jalapeño (Libra)', price: 9900,
    description: 'El clásico picante mexicano.', image: 'https://picsum.photos/seed/jalapeno/400/300',
    category: 'mercado-fresco', benefits: ['Picante', 'Versátil']
  },
  {
    id: 'mazorca', name: 'Bandeja Mazorca (Libra)', price: 5900,
    description: 'Lista para asar o cocinar.', image: 'https://picsum.photos/seed/mazorca/400/300',
    category: 'mercado-fresco', benefits: ['Tradicional', 'Versátil']
  },
  {
    id: 'berenjena', name: 'Berenjena (Libra)', price: 7900,
    description: 'Versátil para múltiples preparaciones.', image: 'https://picsum.photos/seed/berenjena/400/300',
    category: 'mercado-fresco', benefits: ['Versátil', 'Baja en calorías']
  },
  {
    id: 'col-bruselas', name: 'Col de Bruselas (Libra)', price: 14900,
    description: 'Perfectas para hornear o saltear.', image: 'https://picsum.photos/seed/col-bruselas/400/300',
    category: 'mercado-fresco', benefits: ['Premium', 'Nutritiva']
  },
  {
    id: 'esparragos', name: 'Espárragos (Atado)', price: 12900,
    description: 'Frescos y listos para preparar.', image: 'https://picsum.photos/seed/esparragos/400/300',
    category: 'mercado-fresco', benefits: ['Gourmet', 'Saludable']
  },
  {
    id: 'kale', name: 'Kale (250g)', price: 8900,
    description: 'Superalimento de moda.', image: 'https://picsum.photos/seed/kale/400/300',
    category: 'mercado-fresco', benefits: ['Superalimento', 'Antioxidante']
  },
  {
    id: 'espinaca', name: 'Espinaca (250g)', price: 5900,
    description: 'Hojas frescas y nutritivas.', image: 'https://picsum.photos/seed/espinaca/400/300',
    category: 'mercado-fresco', benefits: ['Hierro', 'Nutritiva']
  },
  {
    id: 'acelga', name: 'Acelga (Atado)', price: 4900,
    description: 'Hojas verdes nutritivas.', image: 'https://picsum.photos/seed/acelga/400/300',
    category: 'mercado-fresco', benefits: ['Nutritiva', 'Versátil']
  },
  {
    id: 'col-china', name: 'Col China (Libra)', price: 6900,
    description: 'Ideal para salteados asiáticos.', image: 'https://picsum.photos/seed/col-china/400/300',
    category: 'mercado-fresco', benefits: ['Asiática', 'Ligera']
  },
  {
    id: 'hinojo', name: 'Hinojo (Libra)', price: 8900,
    description: 'Sabor anisado único.', image: 'https://picsum.photos/seed/hinojo/400/300',
    category: 'mercado-fresco', benefits: ['Aromático', 'Digestivo']
  },
  {
    id: 'eneldo', name: 'Eneldo (Atado)', price: 3900,
    description: 'Hierba aromática fresca.', image: 'https://picsum.photos/seed/eneldo/400/300',
    category: 'mercado-fresco', benefits: ['Aromático', 'Gourmet']
  },
  {
    id: 'menta', name: 'Menta (Atado)', price: 3900,
    description: 'Fresca y aromática.', image: 'https://picsum.photos/seed/menta/400/300',
    category: 'mercado-fresco', benefits: ['Refrescante', 'Aromática']
  },
  {
    id: 'yerbabuena', name: 'Yerbabuena (Atado)', price: 3900,
    description: 'Para infusiones y cocina.', image: 'https://picsum.photos/seed/yerbabuena/400/300',
    category: 'mercado-fresco', benefits: ['Aromática', 'Digestiva']
  },
  {
    id: 'albahaca', name: 'Albahaca (Atado)', price: 3900,
    description: 'La reina de las hierbas aromáticas.', image: 'https://picsum.photos/seed/albahaca/400/300',
    category: 'mercado-fresco', benefits: ['Aromática', 'Italiana']
  },
  {
    id: 'tomillo', name: 'Tomillo (Atado)', price: 3900,
    description: 'Hierba esencial de cocina.', image: 'https://picsum.photos/seed/tomillo/400/300',
    category: 'mercado-fresco', benefits: ['Aromático', 'Esencial']
  },
  {
    id: 'romero', name: 'Romero (Atado)', price: 3900,
    description: 'Perfecto para carnes y asados.', image: 'https://picsum.photos/seed/romero/400/300',
    category: 'mercado-fresco', benefits: ['Aromático', 'Asados']
  },

  {
    id: 'manzana-libra', name: 'Manzana (Libra)', price: 8900,
    description: 'Pídela verdes o rojas.', image: 'https://picsum.photos/seed/manzana-libra/400/300',
    category: 'mercado-fresco', benefits: ['Fresca', 'Versátil']
  },
  {
    id: 'pera-libra', name: 'Pera (Libra)', price: 9900,
    description: 'Seleccionadas cuidadosamente.', image: 'https://picsum.photos/seed/pera-libra/400/300',
    category: 'mercado-fresco', benefits: ['Dulce', 'Jugosa']
  },
  {
    id: 'banano-libra', name: 'Banano (Racimo)', price: 5900,
    description: 'Por racimos.', image: 'https://picsum.photos/seed/banano-libra/400/300',
    category: 'mercado-fresco', benefits: ['Energía', 'Potasio']
  },
  {
    id: 'limon-libra', name: 'Limón (Libra)', price: 4900,
    description: 'Los más jugosos y frescos.', image: 'https://picsum.photos/seed/limon-libra/400/300',
    category: 'mercado-fresco', benefits: ['Vitamina C', 'Fresco']
  },
  {
    id: 'granadilla', name: 'Granadilla (Libra)', price: 12900,
    description: 'Una fruta exótica colombiana.', image: 'https://picsum.photos/seed/granadilla/400/300',
    category: 'mercado-fresco', benefits: ['Exótica', 'Digestiva']
  },
  {
    id: 'mango-libra', name: 'Mango (Libra)', price: 7900,
    description: 'Un infaltable en tu nevera.', image: 'https://picsum.photos/seed/mango-libra/400/300',
    category: 'mercado-fresco', benefits: ['Tropical', 'Dulce']
  },
  {
    id: 'coco-libra', name: 'Coco (Libra)', price: 8900,
    description: 'El sabor dulce inconfundible del coco.', image: 'https://picsum.photos/seed/coco-libra/400/300',
    category: 'mercado-fresco', benefits: ['Tropical', 'Energía']
  },
  {
    id: 'lulo', name: 'Lulo (Libra)', price: 8900,
    description: 'Acidito y especial para hacer jugo.', image: 'https://picsum.photos/seed/lulo/400/300',
    category: 'mercado-fresco', benefits: ['Cítrico', 'Jugos']
  },
  {
    id: 'kiwi-libra', name: 'Kiwi (Libra)', price: 19900,
    description: 'Importados de calidad.', image: 'https://picsum.photos/seed/kiwi-libra/400/300',
    category: 'mercado-fresco', benefits: ['Importado', 'Vitamina C']
  },
  {
    id: 'durazno', name: 'Durazno (Libra)', price: 12900,
    description: 'Una fruta deliciosa con sabor delicado.', image: 'https://picsum.photos/seed/durazno/400/300',
    category: 'mercado-fresco', benefits: ['Dulce', 'Delicado']
  },
  {
    id: 'pitahaya', name: 'Pitahaya (Libra)', price: 14900,
    description: 'Para mejorar tu salud digestiva.', image: 'https://picsum.photos/seed/pitahaya/400/300',
    category: 'mercado-fresco', benefits: ['Digestiva', 'Exótica']
  },
  {
    id: 'mandarina', name: 'Mandarina (Libra)', price: 6900,
    description: 'Un cítrico que acompaña loncheras.', image: 'https://picsum.photos/seed/mandarina/400/300',
    category: 'mercado-fresco', benefits: ['Cítrica', 'Snack']
  },
  {
    id: 'fresa-libra', name: 'Fresa (Libra)', price: 12900,
    description: 'Dulces y grandes perfectamente seleccionadas.', image: 'https://picsum.photos/seed/fresa-libra/400/300',
    category: 'mercado-fresco', benefits: ['Dulce', 'Seleccionada']
  },
  {
    id: 'guayaba-pera', name: 'Guayaba Pera (Libra)', price: 7900,
    description: 'La guayaba rosadita y dulce.', image: 'https://picsum.photos/seed/guayaba-pera/400/300',
    category: 'mercado-fresco', benefits: ['Dulce', 'Jugos']
  },
  {
    id: 'guayaba-manzana-libra', name: 'Guayaba Manzana (Libra)', price: 7900,
    description: 'La guayaba verde y acidita.', image: 'https://picsum.photos/seed/guayaba-manzana-libra/400/300',
    category: 'mercado-fresco', benefits: ['Acidita', 'Fresca']
  },
  {
    id: 'aguacate-hass', name: 'Aguacate Hass (Libra)', price: 5900,
    description: 'Perfecto para hacer guacamole.', image: 'https://picsum.photos/seed/aguacate-hass/400/300',
    category: 'mercado-fresco', benefits: ['Grasas saludables', 'Versátil']
  },
  {
    id: 'sandia-baby-libra', name: 'Sandía Baby (Libra)', price: 12900,
    description: 'Las sandías más dulces.', image: 'https://picsum.photos/seed/sandia-baby-libra/400/300',
    category: 'mercado-fresco', benefits: ['Hidratante', 'Dulce']
  },
  {
    id: 'tomate-arbol', name: 'Tomate de Árbol (Libra)', price: 6900,
    description: 'Perfecto para hacer jugo.', image: 'https://picsum.photos/seed/tomate-arbol/400/300',
    category: 'mercado-fresco', benefits: ['Jugos', 'Vitaminas']
  },
  {
    id: 'papaya-maradol', name: 'Papaya Maradol (Libra)', price: 8900,
    description: 'Seleccionada perfectamente.', image: 'https://picsum.photos/seed/papaya-maradol/400/300',
    category: 'mercado-fresco', benefits: ['Digestiva', 'Dulce']
  },
  {
    id: 'melon-libra', name: 'Melón (Libra)', price: 9900,
    description: 'Dulce y exquisito.', image: 'https://picsum.photos/seed/melon-libra/400/300',
    category: 'mercado-fresco', benefits: ['Dulce', 'Refrescante']
  },
  {
    id: 'guanabana', name: 'Guanábana (Libra)', price: 14900,
    description: 'Perfectamente seleccionada.', image: 'https://picsum.photos/seed/guanabana/400/300',
    category: 'mercado-fresco', benefits: ['Exótica', 'Jugos']
  },
  {
    id: 'mangostino', name: 'Mangostino (Libra)', price: 19900,
    description: 'Un sabor único y exótico.', image: 'https://picsum.photos/seed/mangostino/400/300',
    category: 'mercado-fresco', benefits: ['Exótico', 'Premium']
  },
  {
    id: 'rambutan', name: 'Rambután (Libra)', price: 24900,
    description: 'Un producto exclusivo.', image: 'https://picsum.photos/seed/rambutan/400/300',
    category: 'mercado-fresco', benefits: ['Exclusivo', 'Exótico']
  },
  {
    id: 'arandanos', name: 'Arándanos (125g)', price: 14900,
    description: 'Fruta cargada de antioxidantes.', image: 'https://picsum.photos/seed/arandanos/400/300',
    category: 'mercado-fresco', benefits: ['Antioxidantes', 'Premium']
  },
  {
    id: 'frambuesa', name: 'Frambuesa (125g)', price: 17900,
    description: 'Exclusivo y exótico.', image: 'https://picsum.photos/seed/frambuesa/400/300',
    category: 'mercado-fresco', benefits: ['Exclusivo', 'Antioxidante']
  },
  {
    id: 'maracuya', name: 'Maracuyá (Libra)', price: 7900,
    description: 'La fruta de la pasión.', image: 'https://picsum.photos/seed/maracuya/400/300',
    category: 'mercado-fresco', benefits: ['Tropical', 'Jugos']
  },
  {
    id: 'naranja-libra', name: 'Naranja (Libra)', price: 4900,
    description: 'Dulces y perfectamente seleccionadas.', image: 'https://picsum.photos/seed/naranja-libra/400/300',
    category: 'mercado-fresco', benefits: ['Vitamina C', 'Jugos']
  },
  {
    id: 'aguacate-papelillo', name: 'Aguacate Papelillo (Libra)', price: 4900,
    description: 'Especial para acompañar almuerzos y ensaladas.', image: 'https://picsum.photos/seed/aguacate-papelillo/400/300',
    category: 'mercado-fresco', benefits: ['Tradicional', 'Versátil']
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
