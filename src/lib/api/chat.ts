import type { Product } from '../../store/useCartStore';

export type AiChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

type AskSeranaAiInput = {
  message: string;
  history: AiChatMessage[];
  products: Product[];
  pathname: string;
  cart: {
    itemCount: number;
    total: number;
  };
};

type AskSeranaAiResponse = {
  answer?: string;
  error?: string;
};

/**
 * Calls our server-side AI gateway. The Ollama credential never reaches the
 * browser; only public catalogue fields and the recent conversation are sent.
 */
export async function askSeranaAi(input: AskSeranaAiInput) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: input.message,
      history: input.history.slice(-8),
      pathname: input.pathname,
      cart: input.cart,
      products: input.products.slice(0, 200).map((product) => ({
        id: product.id,
        name: product.name,
        price: product.price,
        category: product.category,
        description: product.description,
        benefits: product.benefits,
        healthBenefit: product.healthBenefit,
        observation: product.observation,
        portions: product.portions,
        ingredients: product.ingredients,
        variants: product.variants,
      })),
    }),
  });

  const payload = (await response.json().catch(() => ({}))) as AskSeranaAiResponse;
  if (!response.ok || !payload.answer?.trim()) {
    throw new Error(payload.error || 'ai_unavailable');
  }
  return payload.answer.trim();
}
