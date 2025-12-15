import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { getOrderById } from '../api/orders';

// --- Componentes de UI de Soporte ---

/**
 * Componente para el badge de estado de la orden
 */
const StatusBadge = ({ status }) => {
    // ESTILOS: Ajustados para ser más sobrios y visibles
    let classes = 'px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full uppercase tracking-wider ';
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
 */
const OrderConfirmation = () => {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
                // Manteniendo la lógica de la API original
                const response = await getOrderById(orderId);
                
                if (response.ok) {
                    setOrder(response.order);
                } else {
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

    const LoadingState = ({ message }) => (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-6 font-sans">
            <div className="text-center text-xl font-light text-neutral-700 tracking-wider">{message}</div>
        </div>
    );

    if (loading) {
        return <LoadingState message="Cargando Detalles de la Orden..." />;
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-6 font-sans">
                {/* ESTILOS: Caja de error sobria */}
                <div className="bg-white p-8 rounded-lg shadow-xl border border-red-300 text-center max-w-md">
                    <h2 className="text-2xl font-light text-neutral-800 mb-4 uppercase tracking-widest">❌ Error al Cargar</h2>
                    <p className="text-neutral-600 mb-6">{error}</p>
                    <Link 
                        to="/" 
                        className="px-8 py-3 bg-neutral-900 text-white rounded-full text-sm font-medium hover:bg-neutral-700 transition duration-300 shadow-md uppercase tracking-wider"
                    >
                        Volver a la Tienda
                    </Link>
                </div>
            </div>
        );
    }

    if (!order) {
        return <LoadingState message="Orden no encontrada." />;
    }
    
    // Vista de Confirmación/Detalles de la Orden para el Cliente (SOLO ESTILOS MODIFICADOS)
    return (
        <div className="min-h-screen bg-neutral-50 p-4 sm:p-6 font-sans">
            {/* ESTILOS: Contenedor principal */}
            <div className="bg-white rounded-lg shadow-2xl max-w-5xl mx-auto p-6 sm:p-10 border border-neutral-100">
                {/* ESTILOS: Título de Confirmación */}
                <h1 className="text-4xl font-light mb-2 text-neutral-800 uppercase tracking-widest">
                    🎉 ¡Orden Confirmada!
                </h1>
                <p className="text-neutral-600 mb-8 border-b border-neutral-200 pb-4">
                    Gracias por tu compra. Aquí tienes los detalles de tu orden y su estado actual.
                </p>
                
                {/* --- Bloque de Estado y Resumen --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    
                    {/* 1. Información de la Orden */}
                    <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 shadow-sm">
                        <h3 className="font-semibold text-lg mb-2 text-neutral-800 uppercase tracking-wider">📋 Detalles</h3>
                        <p className="text-sm text-neutral-700"><strong>ID de Orden:</strong> #{order._id.slice(-6).toUpperCase()}</p>
                        <p className="text-sm text-neutral-700"><strong>Fecha:</strong> {new Date(order.createdAt).toLocaleDateString('es-ES')}</p>
                        <p className="text-sm text-neutral-700"><strong>Método de Pago:</strong> {order.paymentMethod}</p>
                    </div>

                    {/* 2. Estado Actual */}
                    <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 shadow-sm text-center md:col-span-1">
                        <h3 className="font-semibold text-lg mb-2 text-neutral-800 uppercase tracking-wider">🚚 Estado Actual</h3>
                        <div className="flex justify-center mb-1">
                            <StatusBadge status={order.status} />
                        </div>
                        <p className="text-xs text-neutral-500">
                            Última actualización: {new Date(order.updatedAt).toLocaleDateString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                    
                    {/* 3. Totales Financieros (ESTILOS MODIFICADOS, FORMATO ORIGINAL RESTAURADO) */}
                    <div className="p-4 bg-neutral-800 text-white rounded-lg shadow-lg text-right md:col-span-1">
                        <h3 className="font-semibold text-lg mb-2 text-neutral-100 uppercase tracking-wider">💰 Total Pagado</h3>
                        {/* RESTAURACIÓN DEL FORMATO ORIGINAL */}
                        <p className="text-sm text-neutral-300">Subtotal: <span className="font-medium">${(order.subtotal * 1000000).toLocaleString()}</span></p>
                        <p className="text-sm text-neutral-300">Envío: <span className="font-medium">${(order.shippingCost * 1000000).toLocaleString()}</span></p>
                        <div className="text-3xl font-extrabold text-white mt-3 pt-3 border-t border-neutral-600">
                            {/* RESTAURACIÓN DEL FORMATO ORIGINAL */}
                            ${(parseFloat(order.totalAmount.toFixed(2)) * 1000000).toLocaleString()}
                        </div>
                    </div>
                </div>

                {/* --- Dirección de Envío --- */}
                <div className="p-6 bg-white rounded-lg border border-neutral-200 shadow-md mb-10">
                    <h3 className="font-semibold text-xl mb-3 text-neutral-800 uppercase tracking-wider">📍 Envío a</h3>
                    <p className="text-base font-semibold text-neutral-700">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                    <p className="text-sm text-neutral-600">{order.shippingAddress.address}</p>
                    <p className="text-sm text-neutral-600">{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
                    <p className="text-sm mt-2 text-neutral-600">Teléfono: {order.shippingAddress.phone}</p>
                </div>
                
                {/* --- Ítems de la Orden --- */}
                <h3 className="font-semibold text-xl mb-5 text-neutral-800 border-b border-neutral-200 pb-2 uppercase tracking-wider">
                    🛍️ Ítems Comprados ({order.items.length})
                </h3>
                <div className="space-y-4">
                    {order.items.map((item, index) => (
                        <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition duration-150">
                            <img 
                                src={item.image || "https://via.placeholder.com/64x64.png?text=Producto"} 
                                alt={item.name} 
                                className="w-16 h-16 object-cover rounded-md border border-neutral-100" 
                            />
                            <div className="flex-grow">
                                <p className="font-semibold text-lg text-neutral-900">{item.name}</p>
                                <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                                    Talla: {item.sizeName || 'N/A'} | Color: {item.colorName || 'N/A'}
                                </p>
                            </div>
                            {/* VALORES RESTAURADOS */}
                            <div className="text-left sm:text-right w-full sm:w-auto">
                                <p className="text-sm text-neutral-700">
                                    Cant: <span className="font-medium">{item.quantity}</span> x ${(item.cost).toLocaleString()}
                                </p>
                                <p className="font-bold text-lg text-neutral-900 mt-1">
                                    Subtotal: ${parseFloat((item.quantity * item.cost).toFixed(2)).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Enlace de navegación principal */}
                <div className="mt-12 text-center">
                    <Link 
                        to="/" 
                        className="inline-block px-8 py-3 bg-neutral-900 text-white rounded-full text-sm font-medium hover:bg-neutral-700 transition duration-300 shadow-lg uppercase tracking-wider"
                    >
                       <span className="mr-2">🏠</span> Volver a la Tienda
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default OrderConfirmation;