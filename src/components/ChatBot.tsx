import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowRight,
  CreditCard,
  Instagram,
  Loader2,
  MessageCircle,
  Music2,
  Send,
  ShoppingBag,
  Sparkles,
  X,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { captureLead } from '../lib/api/leads';
import { trackOrder } from '../lib/api/orders';
import { useProducts } from '../lib/useProducts';
import { normalizeSearch } from '../lib/search';
import { useCartStore, type Product } from '../store/useCartStore';
import { getComboDefinition, resolveComboGroups } from '../data/comboCustomizations';
import { buildWhatsAppUrl, WHATSAPP_DISPLAY } from '../lib/contact';
import { markCheckoutFromBot } from '../lib/checkoutSource';
import { askSeranaAi, type AiChatMessage } from '../lib/api/chat';

type ChatAction =
  | { kind: 'message'; label: string; value: string }
  | { kind: 'add'; label: string; productId: string; variantLabel?: string }
  | { kind: 'checkout'; label: string }
  | { kind: 'cart'; label: string }
  | { kind: 'link'; label: string; href: string; external?: boolean }
  | { kind: 'whatsapp'; label: string; message?: string };

interface Message {
  id: string;
  text: string;
  sender: 'bot' | 'user';
  actions?: ChatAction[];
  products?: Product[];
}

type IndexedProduct = {
  product: Product;
  text: string;
  name: string;
  category: string;
  ingredients: string;
};

const COP = (n: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);

const BOT_INTRO =
  '¡Hola! Soy tu asistente virtual de Serana. Puedo recomendar productos, explicar ingredientes, ayudarte a armar tu compra y llevarte al pago seguro.';

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'intro',
    text: BOT_INTRO,
    sender: 'bot',
    actions: [
      { kind: 'message', label: 'Ver menú', value: 'Ver menú' },
      { kind: 'message', label: 'Recomiéndame', value: 'Quiero una recomendación para comer mejor' },
      { kind: 'message', label: 'Ver combos', value: 'Muéstrame combos' },
      { kind: 'message', label: 'Armar compra', value: 'Quiero hacer una compra' },
      { kind: 'message', label: 'Estado pedido', value: 'Estado de mi pedido' },
      { kind: 'whatsapp', label: 'Asesor humano', message: 'Hola, quiero hablar con un asesor de Serana.' },
    ],
  },
];

const SOCIAL_LINKS = [
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/serana.ac?igsh=bXhwYnprcnR2M25r',
    Icon: Instagram,
  },
  {
    label: 'TikTok',
    href: 'https://www.tiktok.com/search?q=serana',
    Icon: Music2,
  },
  {
    label: 'WhatsApp',
    href: buildWhatsAppUrl('Hola, quiero hablar con un asesor de Serana.'),
    Icon: MessageCircle,
  },
];

const STOP_WORDS = new Set([
  'quiero',
  'necesito',
  'busco',
  'para',
  'algo',
  'una',
  'uno',
  'con',
  'los',
  'las',
  'que',
  'del',
  'por',
  'favor',
  'me',
  'mi',
  'el',
  'la',
  'de',
  'y',
  'o',
  'en',
  'un',
]);

const CATEGORY_LABELS: Record<string, string> = {
  combos: 'combos',
  'ensaladas-gourmet': 'ensaladas gourmet',
  'ensaladas-tradicionales': 'ensaladas tradicionales',
  sopas: 'sopas y cremas',
  bebidas: 'bebidas y shots',
  salsas: 'salsas y complementos',
  'frutas-picadas': 'frutas picadas',
  'verduras-picadas': 'verduras picadas',
  'mercado-fresco': 'mercado fresco',
};

const GOAL_QUERIES: Array<{ keys: string[]; query: string; headline: string }> = [
  {
    keys: ['detox', 'desinflamar', 'inflamacion', 'limpiar', 'digestivo', 'digestion'],
    query: 'detox fibra digestiva antiinflamatoria limpia',
    headline: 'Para sentirte más ligera y apoyar digestión, miraría estas opciones.',
  },
  {
    keys: ['energia', 'activo', 'oficina', 'trabajo', 'concentracion', 'enfoque'],
    query: 'energia proteina concentracion oficina enfoque',
    headline: 'Para energía sostenida y jornada activa, estas opciones convierten muy bien.',
  },
  {
    keys: ['familia', 'semanal', 'semana', 'mercado', 'abastecer'],
    query: 'combo familiar combo oficina combo para 1 o 2',
    headline: 'Para resolver la semana, lo más eficiente suele ser un combo semipersonalizado.',
  },
  {
    keys: ['ninos', 'niños', 'lonchera', 'colegio'],
    query: 'lonchera niños saludable fruta ensalada',
    headline: 'Para loncheras, conviene algo práctico, fresco y fácil de rotar.',
  },
  {
    keys: ['ligero', 'liviano', 'cena', 'ensalada', 'bajar'],
    query: 'ensalada hidratante digestiva ligera fibra',
    headline: 'Si quieres algo fresco y ligero, estas son buenas puertas de entrada.',
  },
  {
    keys: ['sopa', 'crema', 'caliente'],
    query: 'crema sopa',
    headline: 'Para algo reconfortante y práctico, las sopas prelistas son la mejor ruta.',
  },
];

export default function ChatBot() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { products, loading } = useProducts();
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);
  const cartItems = useCartStore((state) => state.items);
  const cartTotal = useCartStore((state) => state.total);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef<string>('');
  const leadCapturedRef = useRef(false);
  const isCompactFlow = pathname === '/login' || pathname === '/cuenta' || pathname.startsWith('/checkout');

  const indexedProducts = useMemo<IndexedProduct[]>(
    () =>
      products.map((product) => ({
        product,
        name: normalizeSearch(product.name),
        category: normalizeSearch(product.category),
        ingredients: normalizeSearch(product.ingredients?.join(' ') ?? ''),
        text: normalizeSearch(
          [
            product.name,
            product.category,
            product.description,
            product.healthBenefit,
            product.observation,
            product.portions,
            product.benefits.join(' '),
            product.ingredients?.join(' '),
            product.variants?.map((variant) => variant.label).join(' '),
          ]
            .filter(Boolean)
            .join(' '),
        ),
      })),
    [products],
  );

  if (!sessionIdRef.current) {
    sessionIdRef.current = `chat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen, isTyping]);

  const toggleChat = () => {
    setIsOpen((current) => !current);
    if (!isOpen) setHasUnread(false);
  };

  const captureFirstLead = (text: string) => {
    if (leadCapturedRef.current) return;
    leadCapturedRef.current = true;
    void captureLead({
      channel: 'chatbot',
      message: text.trim(),
      metadata: {
        session_id: sessionIdRef.current,
        cart_count: cartItems.length,
      },
    });
  };

  const addBotMessage = (message: Omit<Message, 'id' | 'sender'>) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        sender: 'bot',
        ...message,
      },
    ]);
  };

  const handleSendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMessage: Message = {
      id: `${Date.now()}-user`,
      text: trimmed,
      sender: 'user',
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);
    captureFirstLead(trimmed);

    try {
      const response = await buildBotResponse(trimmed);
      addBotMessage(response);
    } catch {
      addBotMessage(unknownResponse(trimmed));
    } finally {
      setIsTyping(false);
    }
  };

  const handleAction = (action: ChatAction) => {
    if (action.kind === 'message') {
      void handleSendMessage(action.value);
      return;
    }

    if (action.kind === 'add') {
      const product = products.find((item) => item.id === action.productId);
      if (!product) {
        addBotMessage(unknownResponse(`Agregar ${action.productId}`));
        return;
      }
      addProductFromBot(product, action.variantLabel);
      return;
    }

    if (action.kind === 'cart') {
      openCart();
      addBotMessage({
        text: cartItems.length
          ? `Abrí tu canasta. Llevas ${cartItems.length} producto${cartItems.length === 1 ? '' : 's'} por ${COP(cartTotal())}.`
          : 'Tu canasta todavía está vacía. Dime qué necesitas y te recomiendo.',
        actions: cartItems.length
          ? [{ kind: 'checkout', label: 'Completar compra' }]
          : [{ kind: 'message', label: 'Recomiéndame', value: 'Quiero una recomendación' }],
      });
      return;
    }

    if (action.kind === 'checkout') {
      goToCheckout();
      return;
    }

    if (action.kind === 'link') {
      if (action.external) window.open(action.href, '_blank', 'noopener,noreferrer');
      else navigate(action.href);
      return;
    }

    if (action.kind === 'whatsapp') {
      window.open(buildWhatsAppUrl(action.message ?? 'Hola, quiero asesoría de Serana.'), '_blank', 'noopener,noreferrer');
    }
  };

  const addProductFromBot = (product: Product, variantLabel?: string) => {
    if (getComboDefinition(product)) {
      addBotMessage({
        text: `Ese combo necesita personalización para que cocina e inventario sepan exactamente qué restar. Te llevo a su categoría para escoger frutas, verduras, sopas y ensaladas.`,
        products: [product],
        actions: [
          { kind: 'link', label: 'Personalizar combo', href: `/shop?category=combos&search=${encodeURIComponent(product.name)}` },
          { kind: 'whatsapp', label: 'Asesor humano', message: `Hola, quiero ayuda para personalizar ${product.name}.` },
        ],
      });
      return;
    }

    if (product.variants?.length && !variantLabel) {
      addBotMessage({
        text: `${product.name} tiene varias presentaciones. Elige una para agregarla a la canasta.`,
        products: [product],
        actions: product.variants.map((variant) => ({
          kind: 'add',
          label: `Agregar ${variant.label}`,
          productId: product.id,
          variantLabel: variant.label,
        })),
      });
      return;
    }

    const selectedVariant = variantLabel
      ? product.variants?.find((variant) => variant.label === variantLabel)
      : null;
    const productForCart = selectedVariant
      ? {
          ...product,
          id: `${product.id}-${slugifyVariant(selectedVariant.label)}`,
          name: `${product.name} - ${selectedVariant.label}`,
          price: selectedVariant.price,
        }
      : product;

    addItem(productForCart);
    addBotMessage({
      text: `Listo: agregué ${productForCart.name} a tu canasta. Puedes seguir armando el pedido o completar entrega y pago seguro en checkout.`,
      products: [product],
      actions: [
        { kind: 'checkout', label: 'Ir a pagar' },
        { kind: 'cart', label: 'Ver canasta' },
        { kind: 'message', label: 'Recomendar complemento', value: `Qué complemento va bien con ${product.name}` },
      ],
    });
  };

  const goToCheckout = () => {
    if (cartItems.length === 0) {
      addBotMessage({
        text: 'Antes de pagar necesitamos agregar al menos un producto. Dime qué quieres lograr: detox, energía, familia, oficina, lonchera, ensalada, sopa o fruta.',
        actions: [
          { kind: 'message', label: 'Quiero energía', value: 'Quiero algo para energía' },
          { kind: 'message', label: 'Combo semanal', value: 'Quiero un combo para la semana' },
          { kind: 'message', label: 'Algo ligero', value: 'Quiero algo ligero' },
        ],
      });
      return;
    }
    markCheckoutFromBot();
    navigate('/checkout');
    setIsOpen(false);
  };

  const buildBotResponse = async (text: string): Promise<Omit<Message, 'id' | 'sender'>> => {
    const normalized = normalizeSearch(text);

    if (isOrderStatusIntent(normalized)) {
      return await buildOrderStatusResponse(text);
    }

    if (isCheckoutIntent(normalized)) {
      if (cartItems.length === 0) {
        return {
          text: 'Puedo ayudarte a comprar, pero primero armemos la canasta. ¿Buscas algo para ti, para familia/oficina o una recomendación saludable?',
          actions: [
            { kind: 'message', label: 'Para mí', value: 'Recomiéndame para una persona' },
            { kind: 'message', label: 'Familia/oficina', value: 'Recomiéndame combos para familia u oficina' },
            { kind: 'message', label: 'Ver productos', value: 'Ver menú' },
          ],
        };
      }
      return {
        text: `Tu canasta tiene ${cartItems.length} producto${cartItems.length === 1 ? '' : 's'} por ${COP(cartTotal())}. En checkout llenas datos de entrega y ahí se genera el pago seguro.`,
        actions: [
          { kind: 'checkout', label: 'Completar entrega y pago' },
          { kind: 'cart', label: 'Revisar canasta' },
        ],
      };
    }

    if (isMenuIntent(normalized)) {
      return {
        text: `Tenemos ${products.length} referencias entre combos, ensaladas, sopas, bebidas, salsas, frutas, verduras y mercado fresco. Puedes preguntarme por objetivo o ingrediente.`,
        actions: [
          { kind: 'link', label: 'Abrir menú completo', href: '/shop' },
          { kind: 'message', label: 'Combos', value: 'Muéstrame combos' },
          { kind: 'message', label: 'Ensaladas', value: 'Recomiéndame ensaladas' },
          { kind: 'message', label: 'Sopas', value: 'Muéstrame sopas y cremas' },
        ],
      };
    }

    const recommendations = recommendProducts(normalized);
    try {
      const contextProducts = recommendations.products.length
        ? [
            ...recommendations.products,
            ...products.filter((product) => !recommendations.products.some((match) => match.id === product.id)),
          ]
        : products;
      const history: AiChatMessage[] = messages.slice(-8).map((message) => ({
        role: message.sender === 'bot' ? 'assistant' : 'user',
        content: message.text,
      }));
      const answer = await askSeranaAi({
        message: text,
        history,
        products: contextProducts,
        pathname,
        cart: { itemCount: cartItems.length, total: cartTotal() },
      });

      if (recommendations.products.length > 0) {
        return {
          text: answer,
          products: recommendations.products,
          actions: productActions(recommendations.products, text),
        };
      }

      return {
        text: answer,
        actions: [
          { kind: 'link', label: 'Ver menú', href: '/shop' },
          { kind: 'message', label: 'Recomiéndame', value: 'Recomiéndame algo según lo que necesito' },
          { kind: 'whatsapp', label: 'Asesor humano', message: `Hola, tengo esta duda en Serana: ${text}` },
        ],
      };
    } catch {
      if (recommendations.products.length > 0) {
        return productRecommendationResponse(recommendations.headline, recommendations.products, text);
      }
    }

    return unknownResponse(text);
  };

  const buildOrderStatusResponse = async (text: string): Promise<Omit<Message, 'id' | 'sender'>> => {
    const parsed = parseTrackingRequest(text);
    if (!parsed) {
      return {
        text: 'Para revisar estado necesito el número de pedido y el celular con el que compraste. Ejemplo: “pedido 1234, celular 3002500474”.',
        actions: [
          { kind: 'whatsapp', label: 'Consultar por WhatsApp', message: 'Hola, quiero consultar el estado de mi pedido Serana.' },
        ],
      };
    }

    try {
      const order = await trackOrder(parsed.orderNumber, parsed.phone);
      return {
        text: `Pedido #${order.order_number}: estado ${order.status}, pago ${order.payment_status}, total ${COP(Number(order.total_amount))}. Si necesitas una novedad puntual, te conecta un asesor por WhatsApp.`,
        actions: [
          { kind: 'whatsapp', label: 'Hablar con asesor', message: `Hola, quiero revisar el pedido #${order.order_number}.` },
        ],
      };
    } catch {
      return {
        text: 'No pude consultar ese pedido con los datos enviados. Puede ser un número incompleto o un celular diferente al registrado.',
        actions: [
          { kind: 'message', label: 'Intentar otra vez', value: 'Estado de mi pedido' },
          { kind: 'whatsapp', label: 'Asesor WhatsApp', message: 'Hola, necesito ayuda con el estado de mi pedido Serana.' },
        ],
      };
    }
  };

  const recommendProducts = (normalizedText: string): { headline: string; products: Product[] } => {
    if (!products.length) {
      return { headline: 'Estoy cargando el catálogo. Intenta de nuevo en un momento.', products: [] };
    }

    const comboIntent = includesAny(normalizedText, ['combo', 'kit', 'familiar', 'oficina', 'lonchera', 'semana']);
    if (comboIntent) {
      return {
        headline: 'Los combos son la forma más completa de convertir una compra grande sin armar todo desde cero.',
        products: searchProducts('combo familiar oficina lonchera semana', 4, true),
      };
    }

    const category = categoryFromText(normalizedText);
    if (category) {
      const categoryProducts = products
        .filter((product) => product.category === category)
        .sort((a, b) => b.price - a.price)
        .slice(0, 4);
      return {
        headline: `Estas son buenas opciones de ${CATEGORY_LABELS[category] ?? category}.`,
        products: categoryProducts,
      };
    }

    const goal = GOAL_QUERIES.find((item) => includesAny(normalizedText, item.keys));
    if (goal) {
      return {
        headline: goal.headline,
        products: searchProducts(goal.query, 4, true),
      };
    }

    const directMatches = searchProducts(normalizedText, 4, true);
    if (directMatches.length > 0) {
      return {
        headline: directMatches.length === 1
          ? 'Encontré este producto y te dejo la información clave para decidir.'
          : 'Encontré estas opciones relacionadas con lo que preguntas.',
        products: directMatches,
      };
    }

    return { headline: '', products: [] };
  };

  const productRecommendationResponse = (
    headline: string,
    matchedProducts: Product[],
    originalQuestion: string,
  ): Omit<Message, 'id' | 'sender'> => {
    const [first] = matchedProducts;
    const text = [
      headline,
      first ? `Mi primera recomendación: ${first.name}. ${salesReason(first)}` : '',
      'Si quieres comprar, puedo agregar productos simples al carrito o llevarte a personalizar combos antes del pago.',
    ]
      .filter(Boolean)
      .join('\n\n');

    return {
      text,
      products: matchedProducts,
      actions: productActions(matchedProducts, originalQuestion),
    };
  };

  const productActions = (matchedProducts: Product[], originalQuestion: string): ChatAction[] => {
    const actions: ChatAction[] = [];
    for (const product of matchedProducts.slice(0, 3)) {
      if (getComboDefinition(product)) {
        actions.push({
          kind: 'link',
          label: `Personalizar ${shortProductName(product.name)}`,
          href: `/shop?category=combos&search=${encodeURIComponent(product.name)}`,
        });
      } else if (product.variants?.length) {
        for (const variant of product.variants.slice(0, 2)) {
          actions.push({
            kind: 'add',
            label: `Agregar ${shortProductName(product.name)} ${variant.label}`,
            productId: product.id,
            variantLabel: variant.label,
          });
        }
      } else {
        actions.push({
          kind: 'add',
          label: `Agregar ${shortProductName(product.name)}`,
          productId: product.id,
        });
      }
      if (actions.length >= 4) break;
    }

    actions.push({ kind: 'checkout', label: 'Ir a pagar' });
    actions.push({
      kind: 'whatsapp',
      label: 'Asesor humano',
      message: `Hola, tengo esta duda en Serana: ${originalQuestion}`,
    });
    return actions;
  };

  const searchProducts = (query: string, limit = 4, requireScore = false): Product[] => {
    const terms = searchTerms(query);
    if (terms.length === 0) return [];

    return indexedProducts
      .map((entry) => {
        let score = 0;
        const joinedQuery = normalizeSearch(query);
        if (entry.name.includes(joinedQuery)) score += 60;
        if (entry.category.includes(joinedQuery)) score += 18;
        for (const term of terms) {
          if (entry.name.includes(term)) score += 14;
          if (entry.category.includes(term)) score += 8;
          if (entry.ingredients.includes(term)) score += 7;
          if (entry.text.includes(term)) score += 4;
        }
        return { product: entry.product, score };
      })
      .filter((entry) => (requireScore ? entry.score > 0 : true))
      .sort((a, b) => b.score - a.score || b.product.price - a.product.price)
      .slice(0, limit)
      .map((entry) => entry.product);
  };

  const unknownResponse = (question: string): Omit<Message, 'id' | 'sender'> => ({
    text: `Quiero darte una respuesta precisa y no inventarme información. Puedo buscar por producto, ingrediente, beneficio o ayudarte a comprar. Si esto requiere confirmación humana, un asesor te atiende por WhatsApp en ${WHATSAPP_DISPLAY}.`,
    actions: [
      { kind: 'message', label: 'Buscar producto', value: question.length > 2 ? `Busca ${question}` : 'Ver menú' },
      { kind: 'message', label: 'Recomiéndame', value: 'Quiero una recomendación' },
      { kind: 'whatsapp', label: 'Hablar por WhatsApp', message: `Hola, tengo esta pregunta sobre Serana: ${question}` },
    ],
  });

  return (
    <>
      <div
        className={`fixed bottom-4 right-4 z-50 flex-col items-end pointer-events-none sm:bottom-6 sm:right-6 ${
          isCompactFlow ? 'hidden sm:flex' : 'flex'
        }`}
      >
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mb-3 hidden flex-col gap-2 pointer-events-auto sm:flex"
            >
              {SOCIAL_LINKS.map(({ label, href, Icon }, idx) => (
                <motion.a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  title={label}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-serana-forest/10 bg-white text-serana-forest shadow-lg transition-colors hover:bg-serana-ochre hover:text-serana-forest"
                >
                  <Icon className="h-4 w-4" strokeWidth={1.7} />
                </motion.a>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {!isOpen && hasUnread && (
            <motion.div
              initial={{ opacity: 0, x: 20, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="relative mb-2 mr-1 hidden rounded-2xl rounded-br-none border border-gray-100 bg-white px-3 py-2 text-xs font-medium text-gray-800 shadow-lg pointer-events-auto sm:block"
            >
              <p>Te ayudo a elegir y comprar</p>
              <div className="absolute -bottom-1.5 right-0 h-2.5 w-2.5 rotate-45 border-b border-r border-gray-100 bg-white" />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          className="relative flex h-14 w-14 items-center justify-center rounded-full bg-serana-forest text-white shadow-xl transition-all hover:bg-serana-forest/90 pointer-events-auto"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleChat}
          aria-label={isOpen ? 'Cerrar chat Serana' : 'Abrir chat Serana'}
        >
          {!isOpen && hasUnread && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-serana-forest opacity-30" />
          )}
          {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
          {!isOpen && hasUnread && (
            <span className="absolute right-0 top-0 block h-3.5 w-3.5 rounded-full bg-red-500 ring-2 ring-white" />
          )}
        </motion.button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95, x: 20 }}
            animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
            exit={{ opacity: 0, y: 20, scale: 0.95, x: 20 }}
            className="fixed inset-x-3 bottom-[calc(6rem+env(safe-area-inset-bottom))] z-50 flex h-[min(440px,calc(100svh-12rem))] min-h-0 flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl sm:inset-x-auto sm:right-6 sm:h-[min(560px,calc(100svh-8rem))] sm:w-[420px]"
          >
            <div className="shrink-0 flex items-center gap-3 bg-serana-forest p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                <ShoppingBag className="text-white" size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-serif text-xl leading-tight text-white">Serana IA</h3>
                <p className="text-xs text-white/70">
                  {loading ? 'Cargando catálogo…' : `Asistente IA · ${products.length} productos`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-white/72 transition hover:bg-white/10 hover:text-white"
                aria-label="Cerrar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-gray-50 p-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[88%] ${msg.sender === 'user' ? 'order-2' : ''}`}>
                    <div
                      className={`whitespace-pre-line rounded-2xl p-3 text-sm leading-relaxed ${
                        msg.sender === 'user'
                          ? 'rounded-br-none bg-serana-forest text-white'
                          : 'rounded-bl-none border border-gray-100 bg-white text-gray-800 shadow-sm'
                      }`}
                    >
                      <p>{msg.text}</p>
                    </div>
                    {msg.sender === 'bot' && msg.products?.length ? (
                      <div className="mt-2 space-y-2">
                        {msg.products.slice(0, 4).map((product) => (
                          <ProductSuggestionCard key={product.id} product={product} products={products} />
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}

              {messages[messages.length - 1]?.sender === 'bot' && messages[messages.length - 1]?.actions?.length ? (
                <div className="flex flex-wrap gap-2">
                  {messages[messages.length - 1].actions?.map((action) => (
                    <button
                      key={`${action.kind}-${action.label}`}
                      type="button"
                      onClick={() => handleAction(action)}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition-colors ${
                        action.kind === 'checkout'
                          ? 'border-serana-forest bg-serana-forest text-serana-cream hover:bg-serana-olive'
                          : 'border-serana-ochre/25 bg-serana-ochre/10 text-serana-terracotta hover:bg-serana-ochre/20'
                      }`}
                    >
                      {action.kind === 'checkout' && <CreditCard className="h-3.5 w-3.5" />}
                      {action.kind === 'whatsapp' && <MessageCircle className="h-3.5 w-3.5" />}
                      {action.kind === 'message' && <Sparkles className="h-3.5 w-3.5" />}
                      {action.label}
                    </button>
                  ))}
                </div>
              ) : null}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-none border border-gray-100 bg-white p-3 shadow-sm">
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="shrink-0 border-t border-gray-100 bg-white p-4">
              <form
                onSubmit={(e: FormEvent<HTMLFormElement>) => {
                  e.preventDefault();
                  void handleSendMessage(inputText);
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Pregunta por producto, ingrediente o compra..."
                  className="min-w-0 flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-serana-forest transition-all placeholder:text-serana-forest/40 focus:border-serana-forest/50 focus:outline-none focus:ring-1 focus:ring-serana-forest/30"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-serana-forest text-white transition-colors hover:bg-serana-forest/90 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Enviar mensaje"
                >
                  <Send size={18} />
                </button>
              </form>
              <p className="mt-2 text-[10px] leading-snug text-serana-forest/42">
                La IA puede equivocarse. Para alergias o datos críticos, confirma por WhatsApp: {WHATSAPP_DISPLAY}.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function ProductSuggestionCard({ product, products }: { product: Product; products: Product[] }) {
  const comboDefinition = getComboDefinition(product);
  const comboGroups = comboDefinition ? resolveComboGroups(comboDefinition, products) : [];
  return (
    <article className="grid grid-cols-[52px_1fr] gap-3 rounded-2xl border border-serana-forest/8 bg-white p-2.5 shadow-sm">
      <img
        src={product.image}
        alt={product.name}
        className="h-14 w-14 rounded-xl bg-serana-cream object-cover"
        loading="lazy"
        referrerPolicy="no-referrer"
      />
      <div className="min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-serif text-base leading-tight text-serana-forest">{product.name}</h4>
          <span className="shrink-0 text-[11px] font-black text-serana-terracotta">{COP(product.price)}</span>
        </div>
        <p className="mt-1 text-[11px] leading-snug text-serana-forest/62">
          {product.description || product.healthBenefit || 'Producto Serana seleccionado.'}
        </p>
        {product.ingredients?.length ? (
          <p className="mt-1 text-[10px] leading-snug text-serana-forest/45">
            Ingredientes: {product.ingredients.slice(0, 6).join(', ')}
            {product.ingredients.length > 6 ? '...' : ''}
          </p>
        ) : null}
        {comboGroups.length ? (
          <p className="mt-1 text-[10px] leading-snug text-serana-olive">
            Personalizable: {comboGroups.map((group) => `${group.shortLabel} ${group.max}`).join(' · ')}
          </p>
        ) : null}
      </div>
    </article>
  );
}

function searchTerms(value: string) {
  return normalizeSearch(value)
    .split(/[^a-z0-9]+/g)
    .map((term) => term.trim())
    .filter((term) => term.length > 2 && !STOP_WORDS.has(term));
}

function includesAny(value: string, terms: string[]) {
  return terms.some((term) => value.includes(normalizeSearch(term)));
}

function isMenuIntent(value: string) {
  return includesAny(value, ['menu', 'menú', 'catalogo', 'catálogo', 'productos', 'ver opciones', 'ver todo']);
}

function isCheckoutIntent(value: string) {
  return includesAny(value, ['comprar', 'compra', 'pedido', 'pedir', 'pagar', 'pago', 'checkout', 'finalizar']);
}

function isOrderStatusIntent(value: string) {
  return includesAny(value, ['estado', 'seguimiento', 'rastrear', 'pedido #', 'orden']);
}

function categoryFromText(value: string) {
  if (includesAny(value, ['ensalada gourmet', 'gourmet'])) return 'ensaladas-gourmet';
  if (includesAny(value, ['ensalada tradicional', 'tradicional'])) return 'ensaladas-tradicionales';
  if (includesAny(value, ['sopa', 'crema'])) return 'sopas';
  if (includesAny(value, ['bebida', 'jugo', 'shot', 'batido'])) return 'bebidas';
  if (includesAny(value, ['salsa', 'vinagreta', 'hummus', 'pesto'])) return 'salsas';
  if (includesAny(value, ['fruta picada', 'frutas picadas', 'baby bowl'])) return 'frutas-picadas';
  if (includesAny(value, ['verdura picada', 'verduras picadas'])) return 'verduras-picadas';
  if (includesAny(value, ['mercado fresco', 'fruver', 'sin picar'])) return 'mercado-fresco';
  return null;
}

function parseTrackingRequest(text: string) {
  const numbers = text.match(/\d{3,}/g);
  if (!numbers || numbers.length < 2) return null;
  const orderNumber = Number(numbers.find((number) => number.length <= 6) ?? numbers[0]);
  const phone = numbers.find((number) => number.length >= 7 && Number(number) !== orderNumber);
  if (!orderNumber || !phone) return null;
  return { orderNumber, phone };
}

function salesReason(product: Product) {
  const details = [
    product.healthBenefit || product.description,
    product.observation,
    product.ingredients?.length ? `Trae ${product.ingredients.slice(0, 5).join(', ')}${product.ingredients.length > 5 ? ' y más' : ''}.` : '',
  ].filter(Boolean);
  return details.slice(0, 2).join(' ');
}

function shortProductName(name: string) {
  return name.replace(/\s*\([^)]*\)/g, '').split(' ').slice(0, 3).join(' ');
}

function slugifyVariant(label: string) {
  return normalizeSearch(label).replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}
