import { useOrderStore } from '../store/useOrderStore';
import { motion } from 'motion/react';
import { ShoppingBag, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function DashboardPage() {
  const { orders, updateStatus } = useOrderStore();

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard de Pedidos</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">
              Total Pedidos: {orders.length}
            </span>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay pedidos</h3>
            <p className="mt-1 text-sm text-gray-500">Los pedidos del chatbot aparecerán aquí.</p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {orders.map((order) => (
                <motion.li
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white hover:bg-gray-50 transition-colors"
                >
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center truncate">
                        <p className="text-sm font-medium text-indigo-600 truncate">
                          Pedido #{order.id}
                        </p>
                        <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status === 'completed' ? 'Completado' :
                           order.status === 'processing' ? 'Procesando' : 'Pendiente'}
                        </span>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          ${order.total.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          <ShoppingBag className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                          {order.items.map(item => `${item.quantity}x ${item.name}`).join(', ')}
                        </p>
                        <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                          <Clock className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                          {new Date(order.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <div className="flex space-x-2">
                          {order.status !== 'completed' && (
                            <button
                              onClick={() => updateStatus(order.id, 'completed')}
                              className="text-green-600 hover:text-green-900"
                              title="Marcar como completado"
                            >
                              <CheckCircle className="h-5 w-5" />
                            </button>
                          )}
                          {order.status !== 'processing' && order.status !== 'completed' && (
                            <button
                              onClick={() => updateStatus(order.id, 'processing')}
                              className="text-yellow-600 hover:text-yellow-900"
                              title="Marcar como procesando"
                            >
                              <Clock className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
