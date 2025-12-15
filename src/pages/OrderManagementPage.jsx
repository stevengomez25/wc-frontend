import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { parse } from 'postcss';
import { Link } from 'react-router-dom';
import { getOrders } from '../api/orders';

// --- Componentes de UI de Soporte (Simulados) ---
const Button = ({ onClick, children, className, disabled }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`p-2 rounded text-sm font-medium transition duration-300 ease-in-out ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`}
    >
        {children}
    </button>
);
const Select = ({ value, onChange, options }) => (
    <select
        value={value}
        onChange={onChange}
        className="p-2 border border-neutral-300 rounded text-sm bg-white focus:ring-blue-500 focus:border-blue-500 transition duration-150"
    >
        {options.map(opt => (
            <option key={opt.value} value={opt.value}>
                {opt.label}
            </option>
        ))}
    </select>
);
// --------------------------------------------------

const AdminOrderDashboard = ({ token }) => {
    // ⚠️ Importante: El token de autenticación se requiere para acceder a las rutas privadas (Admin).
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
    const API_BASE_URL = `${BACKEND_URL}/api/orders`;

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit, setLimit] = useState(10);
    const [filterStatus, setFilterStatus] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null); // Para mostrar detalles

    const orderStatusOptions = [
        { value: '', label: 'Todos' },
        { value: 'Pending', label: 'Pendiente' },
        { value: 'Processing', label: 'En Proceso' },
        { value: 'Shipped', label: 'Enviado' },
        { value: 'Delivered', label: 'Entregado' },
        { value: 'Cancelled', label: 'Cancelado' },
    ];

    // Función que llama a tu controlador getOrders (GET /api/orders)
    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            // Se usan los parámetros 'page', 'limit' y 'status' que tu controlador espera.
            const response = await axios.get(
                `${API_BASE_URL}?page=${currentPage}&limit=${limit}&status=${filterStatus}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`, // Necesitas pasar el token de administrador
                    },
                }
            );

            const { orders: fetchedOrders = [], pages: fetchedPages = 1 } = response.data || {};

            setOrders(fetchedOrders); // Siempre será un array ([]) o el array de órdenes
            setTotalPages(fetchedPages); // Siempre será un número (1) o el número real de páginas
            setLoading(false);

        } catch (error) {
            console.error('Error al obtener órdenes:', error.response?.data?.message || error.message);
            setLoading(false);
            alert('Error al cargar las órdenes. Asegúrate de que estás autenticado como Administrador.');
        }
    }, [currentPage, limit, filterStatus, token]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);


    // Función que llama a tu controlador updateOrderStatus (PUT /api/orders/:id/status)
    const handleStatusUpdate = async (orderId, newStatus) => {
        if (!window.confirm(`¿Seguro que quieres cambiar el estado de la orden ID ${orderId.slice(-4)} a "${newStatus}"?`)) {
            return;
        }

        try {
            await axios.put(
                `${API_BASE_URL}/${orderId}/status`,
                { status: newStatus },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            // Recargar la lista para mostrar el estado actualizado
            fetchOrders();
            alert(`Estado de la orden ${orderId.slice(-4)} actualizado a ${newStatus}`);

        } catch (error) {
            console.error('Error al actualizar estado:', error.response?.data?.message || error.message);
            alert('Error al actualizar el estado. Verifica si el estado es válido.');
        }
    };

    // Función que llama a tu controlador getOrder (GET /api/orders/:id)
    const fetchOrderDetails = async (orderId) => {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/${orderId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSelectedOrder(response.data.order);
        } catch (error) {
            console.error('Error al obtener detalles:', error.response?.data?.message || error.message);
            alert('Error al cargar los detalles de la orden.');
        }
    };

    // ------------------ RENDERIZADO ------------------

    if (loading) return <div className="p-6 text-center text-xl text-gray-700">Cargando Órdenes...</div>;

    // Si se ha seleccionado una orden, muestra los detalles
    if (selectedOrder) {
        return (
            <OrderDetailsView
                order={selectedOrder}
                onClose={() => setSelectedOrder(null)}
                onStatusUpdate={handleStatusUpdate}
                statusOptions={orderStatusOptions.filter(opt => opt.value !== '')}
            />
        );
    }

    // Vista de Dashboard principal
    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">📦 Panel de Órdenes</h1>
                </div>
                <Link to="/dashboard" className="bg-blue-400 hover:bg-blue-300 p-2 rounded m-2">
                    DASHBOARD
                </Link>

                {/* --- Panel de Filtros y Control (Responsive) --- */}
                <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6 p-4 mb-6 bg-white rounded-xl shadow-lg border border-gray-200">
                    <div className="flex items-center space-x-2">
                        <label className="font-semibold text-gray-700 text-sm sm:text-base">Estado:</label>
                        <Select
                            value={filterStatus}
                            onChange={(e) => {
                                setFilterStatus(e.target.value);
                                setCurrentPage(1);
                            }}
                            options={orderStatusOptions}
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <label className="font-semibold text-gray-700 text-sm sm:text-base">Mostrar:</label>
                        <Select
                            value={limit}
                            onChange={(e) => {
                                setLimit(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                            options={[
                                { value: 5, label: 5 },
                                { value: 10, label: 10 },
                                { value: 25, label: 25 },
                            ]}
                        />
                    </div>
                </div>

                {/* --- Tabla de Órdenes (Responsive con scroll) --- */}
                <div className="bg-white shadow-xl rounded-xl overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-200 text-gray-700">
                            <tr>
                                <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wider min-w-[100px]">ID</th>
                                <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wider min-w-[150px]">Cliente</th>
                                <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wider min-w-[100px]">Fecha</th>
                                <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wider min-w-[100px]">Total</th>
                                <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wider min-w-[100px]">Estado</th>
                                <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wider min-w-[200px]">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {orders && orders.length > 0 ? (
                                orders.map((order) => (
                                    <tr key={order._id} className="hover:bg-gray-50 transition duration-150">
                                        <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            #{order._id.slice(-6).toUpperCase()}
                                        </td>
                                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {order.customer
                                                ? `${order.customer.firstName} ${order.customer.lastName}`
                                                : 'Invitado'
                                            }
                                        </td>
                                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(order.createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </td>
                                        <td className="px-3 py-4 whitespace-nowrap text-sm font-bold text-blue-600">
                                            ${(parseFloat(order.totalAmount.toFixed(2)) * 1000000).toLocaleString()}
                                        </td>
                                        <td className="px-3 py-4 whitespace-nowrap">
                                            <StatusBadge status={order.status} />
                                        </td>
                                        <td className="px-3 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 items-start sm:items-center">
                                                <Button
                                                    className="bg-blue-600 text-white text-xs px-3 py-1"
                                                    onClick={() => fetchOrderDetails(order._id)}
                                                >
                                                    Detalles
                                                </Button>
                                                <Select
                                                    value={order.status}
                                                    onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                                                    options={orderStatusOptions.filter(opt => opt.value !== '')}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="p-6 text-center text-gray-500">No se encontraron órdenes con los filtros seleccionados.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* --- Paginación --- */}
                <div className="flex flex-col sm:flex-row justify-between items-center mt-6 p-4 bg-white rounded-xl shadow-lg border border-gray-200 space-y-4 sm:space-y-0">
                    <p className="text-sm text-gray-700">
                        Mostrando página <span className="font-medium text-gray-900">{currentPage}</span> de <span className="font-medium text-gray-900">{totalPages}</span>
                    </p>
                    <div className="space-x-2">
                        <Button
                            onClick={() => setCurrentPage(p => p - 1)}
                            disabled={currentPage === 1}
                            className={`bg-neutral-100 text-neutral-800 border border-neutral-300 hover:bg-neutral-200`}
                        >
                            &larr; Anterior
                        </Button>
                        <Button
                            onClick={() => setCurrentPage(p => p + 1)}
                            disabled={currentPage === totalPages}
                            className={`bg-neutral-100 text-neutral-800 border border-neutral-300 hover:bg-neutral-200`}
                        >
                            Siguiente &rarr;
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Componente auxiliar para el badge de estado ---
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

// --- Componente auxiliar para la vista de detalles (Responsive) ---
const OrderDetailsView = ({ order, onClose, onStatusUpdate, statusOptions }) => {
    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
            <div className="bg-white rounded-xl shadow-2xl border border-gray-100 max-w-6xl mx-auto p-6 sm:p-8">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">Detalles de la Orden #{order._id.slice(-6).toUpperCase()}</h2>

                {/* Contenedor de Información - Responsive Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {/* 1. Información General */}
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
                        <h3 className="font-bold text-lg mb-2 text-gray-800">👤 Cliente & Estado</h3>
                        <p className="text-sm"><strong>Cliente:</strong> {order.customer ? `${order.customer.firstName} ${order.customer.lastName}` : 'Invitado'}</p>
                        <p className="text-sm"><strong>Email:</strong> {order.customer ? order.customer.email : 'N/A'}</p>
                        <p className="text-sm"><strong>Fecha:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                        <div className="flex flex-wrap items-center mt-3">
                            <strong className="mr-2 text-sm">Estado Actual:</strong> <StatusBadge status={order.status} />
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <strong className="block mb-1 text-sm text-gray-700">Actualizar Estado:</strong>
                            <Select
                                value={order.status}
                                onChange={(e) => onStatusUpdate(order._id, e.target.value)}
                                options={statusOptions}
                            />
                        </div>
                    </div>

                    {/* 2. Dirección de Envío */}
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
                        <h3 className="font-bold text-lg mb-2 text-gray-800">📍 Dirección de Envío</h3>
                        <p className="text-sm font-medium">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                        <p className="text-sm">{order.shippingAddress.address}</p>
                        <p className="text-sm">{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
                        <p className="text-sm mt-1">Teléfono: {order.shippingAddress.phone}</p>
                        <p className="italic text-xs mt-3 p-2 bg-white rounded border">Notas: {order.shippingAddress.notes || 'Ninguna'}</p>
                    </div>

                    {/* 3. Resumen Financiero */}
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
                        <h3 className="font-bold text-lg mb-2 text-gray-800">💰 Totales Financieros</h3>
                        <p className="text-sm">Subtotal: <span className="font-medium">${(order.subtotal * 1000000).toLocaleString()}</span></p>
                        <p className="text-sm">Costo Envío: <span className="font-medium">${(order.shippingCost * 1000000).toLocaleString()}</span></p>
                        <p className="text-sm">Impuestos: <span className="font-medium">${(parseFloat(order.taxAmount.toFixed(2)) * 1000000).toLocaleString()}</span></p>
                        <div className="text-xl font-bold text-blue-600 mt-3 pt-3 border-t border-gray-200">
                            Total: ${(parseFloat(order.totalAmount.toFixed(2)) * 1000000).toLocaleString()}
                        </div>
                        <p className="text-xs mt-2 text-gray-600">Método de Pago: {order.paymentMethod}</p>
                        <p className="text-xs text-gray-600">Estado Pago: {order.paymentStatus}</p>
                    </div>
                </div>

                {/* 4. Ítems de la Orden */}
                <h3 className="font-bold text-xl mb-4 text-gray-800 border-b pb-2">🛍️ Ítems Comprados ({order.items.length})</h3>
                <div className="space-y-4">
                    {order.items.map((item, index) => (
                        <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-neutral-50 transition duration-150">
                            <img
                                src={item.image || "https://via.placeholder.com/64x64.png?text=No+Img"}
                                alt={item.name}
                                className="w-16 h-16 object-cover rounded-md border"
                            />
                            <div className="flex-grow">
                                <p className="font-semibold text-gray-900">{item.name} <span className="text-sm font-normal text-gray-500">({item.uniqueId})</span></p>
                                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                                    Talla: {item.sizeName || 'N/A'} | Color: {item.colorName || 'N/A'} </p>
                            </div>
                            <div className="text-left sm:text-right w-full sm:w-auto">
                                <p className="text-sm text-gray-700">Cant: {item.quantity} x ${parseFloat(item.cost.toFixed(2)).toLocaleString()}</p>
                                <p className="font-bold text-md text-blue-600">Total Ítem: ${parseFloat((item.quantity * item.cost).toFixed(2)).toLocaleString()}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 text-right">
                    <Button
                        onClick={onClose}
                        className="bg-neutral-100 text-neutral-800 border border-neutral-300 hover:bg-neutral-200 px-6 py-2"
                    >
                        &larr; Volver al Listado
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default AdminOrderDashboard;