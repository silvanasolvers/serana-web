import LegalLayout from '../components/LegalLayout';

export default function DevolucionesPage() {
  return (
    <LegalLayout
      kicker="Política · Devoluciones"
      title="Devoluciones y"
      italic="Reembolsos"
      intro="Cocinamos cada plato con cuidado, pero entendemos que a veces algo no sale como debería. Esta política explica cómo manejamos devoluciones, reembolsos y reclamos, conforme a la Ley 1480 de 2011 (Estatuto del Consumidor)."
      lastUpdated="abril 2026"
    >
      <h2>1. Productos perecederos: caso especial</h2>
      <p>
        Por tratarse de alimentos preparados y productos perecederos, las devoluciones físicas no
        aplican una vez se ha entregado y aceptado el pedido en buen estado. Sin embargo, sí
        cubrimos cualquier inconformidad legítima con reposición o reembolso.
      </p>

      <h2>2. Cuándo aplica un reembolso</h2>
      <p>Procesamos reembolso completo o parcial cuando:</p>
      <ul>
        <li>El producto llega en mal estado, dañado o con empaque vulnerado.</li>
        <li>Hay un error de cocina (ingredientes equivocados, plato distinto al pedido).</li>
        <li>El pedido nunca llegó pese a haber pagado.</li>
        <li>Hay una diferencia significativa entre lo descrito en la web y lo recibido.</li>
        <li>Cancelas un pedido <strong>antes</strong> de que entre a producción (te avisamos por WhatsApp si ya está en preparación).</li>
      </ul>

      <h2>3. Cuándo no aplica</h2>
      <ul>
        <li>El pedido fue recibido en buen estado y conforme a lo solicitado.</li>
        <li>El producto fue consumido parcial o totalmente sin reportar inconformidad inmediata.</li>
        <li>Hubo un cambio de opinión después de la entrega.</li>
        <li>El usuario proporcionó datos de entrega incorrectos.</li>
      </ul>

      <h2>4. Cómo reportar una inconformidad</h2>
      <p>Tienes <strong>24 horas desde la entrega</strong> para reportar cualquier problema:</p>
      <ol>
        <li>
          Escríbenos a <a href="mailto:contacto@serana.co">contacto@serana.co</a> o por WhatsApp al
          número que aparece en tu confirmación.
        </li>
        <li>Incluye número de pedido, descripción clara del problema y, si es posible, una foto.</li>
        <li>
          Nuestro equipo responde en máximo <strong>24 horas hábiles</strong> con una solución:
          reposición del plato, crédito en tu próxima compra o reembolso.
        </li>
      </ol>

      <h2>5. Plazos de reembolso</h2>
      <p>
        Cuando aplique reembolso al medio de pago original, los tiempos dependen del banco o
        billetera:
      </p>
      <ul>
        <li><strong>Tarjetas crédito/débito:</strong> entre 5 y 15 días hábiles, según el banco emisor.</li>
        <li><strong>PSE / transferencia:</strong> entre 3 y 7 días hábiles.</li>
        <li><strong>Nequi y billeteras:</strong> entre 1 y 3 días hábiles.</li>
        <li><strong>Crédito Serana:</strong> inmediato, queda disponible en tu cuenta.</li>
      </ul>

      <h2>6. Cancelación del derecho de retracto</h2>
      <p>
        Conforme al artículo 47 de la Ley 1480 de 2011, el derecho de retracto no aplica para
        bienes perecederos ni alimentos preparados. Esto no excluye los demás derechos del
        consumidor garantizados por la ley (calidad, idoneidad, seguridad e información).
      </p>

      <h2>7. Garantía mínima</h2>
      <p>
        Por la naturaleza perecedera de los productos, la garantía aplica al momento de la entrega
        y debe reportarse dentro de las 24 horas siguientes. Para productos no perecederos
        (libros, kits, suscripciones físicas), aplica la garantía mínima presunta de la Ley 1480.
      </p>

      <h2>8. Cancelación de suscripciones</h2>
      <p>
        Puedes pausar o cancelar tu suscripción en cualquier momento. Cancelaciones recibidas con
        al menos <strong>48 horas de anticipación</strong> al próximo cobro evitan que se procese
        ese ciclo. Si la cancelación llega con menos tiempo, el cobro se mantiene y la cancelación
        aplica al ciclo siguiente; el pedido pagado se entrega normalmente.
      </p>

      <h2>9. Tu satisfacción es la métrica real</h2>
      <p>
        Más allá de la letra pequeña, queremos que cada pedido se sienta como una buena decisión.
        Si algo no estuvo a la altura, escríbenos sin formalismos. Lo resolvemos.
      </p>
    </LegalLayout>
  );
}
