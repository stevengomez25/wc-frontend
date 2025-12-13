import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { getOrderById } from '../api/orders';

// --- Componentes de UI de Soporte (Copiados del dashboard) ---
// (Necesitas asegurar que estos componentes auxiliares (StatusBadge) estén accesibles
// o definidos aquí o importados desde un archivo compartido, como se muestra a continuación)

/**
 * Componente para el badge de estado de la orden
 */
const StatusBadge = ({ status }) => {
    let classes = 'px-2 py-0.5 inline-flex text-xs leading-5 font-medium rounded-full ';
    switch (status) {
        case 'Delivered':
            classes += 'bg-green-100 text-green-800';
            break;
        case 'Shipped':
            classes += 'bg-blue-100 text-blue-800';
            break;
        case 'Processing':
            classes += 'bg-indigo-100 text-indigo-800';
            break;
        case 'Cancelled':
            classes += 'bg-red-100 text-red-800';
            break;
        case 'Pending':
        default:
            classes += 'bg-yellow-100 text-yellow-800';
            break;
    }
    return <span className={classes}>{status}</span>;
};
// --------------------------------------------------

/**
 * Componente principal para que el cliente revise su orden.
 * Asume que el ID de la orden viene del path de la URL (ej: /order-confirmation/12345).
 */
const OrderConfirmation = () => {
    const { orderId } = useParams(); // Obtener el ID de la URL
    const API_BASE_URL = '/api/orders/order-confirmation'; // Ruta pública/semi-pública para clientes

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Función para obtener los detalles de la orden
    useEffect(() => {
        const fetchOrder = async () => {
            if (!orderId) {
                setError('ID de Orden no proporcionado en la URL.');
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);
            try {
                // Asume que esta ruta NO requiere autenticación JWT para el cliente,
                // sino solo el ID (tal vez un token de seguridad único en el backend
                // si se requiere más protección, pero para este ejercicio usamos solo el ID).
                const response = await getOrderById(orderId);
                
                console.log(response);
                
                if (response.ok) {
                    setOrder(response.order);
                } else {
                     // Esto puede ocurrir si el backend devuelve un 200 pero sin datos
                    setError('No se encontraron detalles para esta orden.'); 
                }
            } catch (err) {
                console.error('Error al obtener la orden:', err.response?.data?.message || err.message);
                setError('Error al cargar los detalles de la orden. Asegúrate de que el ID es correcto.');
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderId]);

    // ------------------ RENDERIZADO ------------------

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
            <div className="text-center text-xl text-gray-700">Cargando Detalles de la Orden...</div>
        </div>;
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
                <div className="bg-white p-8 rounded-xl shadow-xl border border-red-200 text-center max-w-md">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">❌ Error al Cargar la Orden</h2>
                    <p className="text-gray-700 mb-6">{error}</p>
                    <Link 
                        to="/" 
                        className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition duration-150 font-medium"
                    >
                        Volver a la Tienda
                    </Link>
                </div>
            </div>
        );
    }

    if (!order) {
        // En caso de que no haya error pero la orden sea nula
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
                <div className="text-center text-xl text-gray-700">Orden no encontrada.</div>
            </div>
        );
    }
    
    // Vista de Confirmación/Detalles de la Orden para el Cliente
    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
            <div className="bg-white rounded-xl shadow-2xl border border-gray-100 max-w-5xl mx-auto p-6 sm:p-8">
                <h1 className="text-3xl font-bold mb-2 text-green-600">🎉 ¡Orden Confirmada!</h1>
                <p className="text-gray-700 mb-6 border-b pb-4">Gracias por tu compra. Aquí tienes los detalles de tu orden y su estado actual.</p>
                
                {/* --- Bloque de Estado y Resumen --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* 1. Información de la Orden */}
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 shadow-sm">
                        <h3 className="font-bold text-lg mb-2 text-blue-800">📋 Detalles</h3>
                        <p className="text-sm"><strong>ID de Orden:</strong> #{order._id.slice(-6).toUpperCase()}</p>
                        <p className="text-sm"><strong>Fecha:</strong> {new Date(order.createdAt).toLocaleDateString('es-ES')}</p>
                        <p className="text-sm"><strong>Método de Pago:</strong> {order.paymentMethod}</p>
                    </div>

                    {/* 2. Estado Actual */}
                    <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200 shadow-sm text-center md:col-span-1">
                        <h3 className="font-bold text-lg mb-2 text-yellow-800">🚚 Estado Actual</h3>
                        <div className="flex justify-center">
                            <StatusBadge status={order.status} />
                        </div>
                        <p className="text-xs mt-2 text-gray-600">Última actualización: {new Date(order.updatedAt).toLocaleDateString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    
                    {/* 3. Totales Financieros */}
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm text-right md:col-span-1">
                        <h3 className="font-bold text-lg mb-2 text-gray-800">💰 Total Pagado</h3>
                        <p className="text-sm">Subtotal: <span className="font-medium">${(order.subtotal * 1000000).toLocaleString()}</span></p>
                        <p className="text-sm">Envío: <span className="font-medium">${(order.shippingCost * 1000000).toLocaleString()}</span></p>
                        <div className="text-2xl font-extrabold text-blue-600 mt-2 pt-2 border-t border-gray-300">
                            ${(parseFloat(order.totalAmount.toFixed(2)) * 1000000).toLocaleString()}
                        </div>
                    </div>
                </div>

                {/* --- Dirección de Envío --- */}
                <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm mb-8">
                    <h3 className="font-bold text-xl mb-2 text-gray-800">📍 Envío a</h3>
                    <p className="text-base font-semibold">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                    <p className="text-sm">{order.shippingAddress.address}</p>
                    <p className="text-sm">{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
                    <p className="text-sm mt-1">Teléfono: {order.shippingAddress.phone}</p>
                </div>
                
                {/* --- Ítems de la Orden --- */}
                <h3 className="font-bold text-xl mb-4 text-gray-800 border-b pb-2">🛍️ Ítems Comprados ({order.items.length})</h3>
                <div className="space-y-4">
                    {order.items.map((item, index) => (
                        <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-neutral-50 transition duration-150">
                            <img 
                                src={item.image || "https://via.placeholder.com/64x64.png?text=Producto"} 
                                alt={item.name} 
                                className="w-16 h-16 object-cover rounded-md border" 
                            />
                            <div className="flex-grow">
                                <p className="font-semibold text-gray-900">{item.name}</p>
                                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                                    Talla: {item.sizeName || 'N/A'} | Color: {item.colorName || 'N/A'}
                                </p>
                            </div>
                            <div className="text-left sm:text-right w-full sm:w-auto">
                                <p className="text-sm text-gray-700">Cant: {item.quantity} x ${(item.cost).toLocaleString()}</p>
                                <p className="font-bold text-md text-blue-600">Subtotal: ${parseFloat((item.quantity * item.cost).toFixed(2)).toLocaleString()}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 text-center">
                    <Link 
                        to="/" 
                        className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition duration-150 font-medium inline-flex items-center"
                    >
                       <span className="mr-2">🏠</span> Volver a la página principal
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default OrderConfirmation;