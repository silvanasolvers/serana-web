import { useEffect, useRef, useState } from 'react';
import type { Product } from '../store/useCartStore';
import { listProducts } from './api/products';

type State = {
  products: Product[];
  loading: boolean;
  source: 'static' | 'db';
  error: string | null;
};

/**
 * Returns the Supabase-backed product catalog. The initial list stays empty so
 * stale bundled images are never painted while the current catalog is loading.
 */
export function useProducts(): State {
  const [state, setState] = useState<State>({
    products: [],
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
          setState({ products: [], loading: false, source: 'db', error: 'El catálogo no está disponible.' });
          return;
        }
        setState({ products: rows, loading: false, source: 'db', error: null });
      })
      .catch((err) => {
        if (aborted.current) return;
        setState({ products: [], loading: false, source: 'db', error: String(err?.message ?? err) });
      });
    return () => {
      aborted.current = true;
    };
  }, []);

  return state;
}
