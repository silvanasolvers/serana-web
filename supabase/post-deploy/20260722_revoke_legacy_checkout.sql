-- Run only after the checkout-v2 web release has been verified in production.
revoke execute on function public.create_order_anon(jsonb) from anon, authenticated;
