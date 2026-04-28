import { useEffect, useRef, useState } from 'react';
import type { Product } from '../store/useCartStore';
import { listProducts } from './api/products';
import { products as staticProducts } from '../data/products';

type State = {
  products: Product[];
  loading: boolean;
  source: 'static' | 'db';
  error: string | null;
};

/**
 * Returns the product catalog. Renders the bundled static catalog instantly so
 * the page never flashes empty, then upgrades to the DB-backed list once the
 * Supabase fetch lands. Falls back silently to the static list if the network
 * call fails (no Supabase configured, offline, RLS issue, etc).
 */
export function useProducts(): State {
  const [state, setState] = useState<State>({
    products: staticProducts,
    loading: true,
    source: 'static',
    error: null,
  });
  const aborted = useRef(false);

  useEffect(() => {
    aborted.current = false;
    listProducts()
      .then((rows) => {
        if (aborted.current) return;
        if (rows.length === 0) {
          setState((prev) => ({ ...prev, loading: false }));
          return;
        }
        setState({ products: rows, loading: false, source: 'db', error: null });
      })
      .catch((err) => {
        if (aborted.current) return;
        setState((prev) => ({ ...prev, loading: false, error: String(err?.message ?? err) }));
      });
    return () => {
      aborted.current = true;
    };
  }, []);

  return state;
}
