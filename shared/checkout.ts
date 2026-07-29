export type WebDeliveryType = 'domicilio' | 'recogida';

export const DELIVERY_FEE_COP = 12_500;

export const STORE_PICKUP = {
  name: 'Recogida en tienda',
  addressLine: 'Carrera 45F #40 sur 03',
  areaLine: 'Barrio Alcalá, Envigado',
  detailLine: 'Urb. Villas del Vallejuelo',
  scheduleDays: 'Lunes a Sábado',
  scheduleHours: '8:00 a.m. — 6:00 p.m.',
} as const;

export const STORE_PICKUP_CHECKOUT_ADDRESS =
  `${STORE_PICKUP.name} · ${STORE_PICKUP.addressLine}, ${STORE_PICKUP.areaLine}, ${STORE_PICKUP.detailLine.replace('Urb. ', 'Urb ')}`;
