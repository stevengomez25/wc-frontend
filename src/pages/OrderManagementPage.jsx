import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios'; // Se utiliza axios para interactuar con tu controlador

// --- Componentes de UI de Soporte (Simulados) ---
const Button = ({ onClick, children, className, disabled }) => (
    <button 
        onClick={onClick} 
        disabled={disabled}
        className={`p-2 rounded text-white transition-opacity ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`}
    >
        {children}
    </button>
);
const Select = ({ value, onChange, options }) => (
    <select value={value} onChange={onChange} className="p-2 border border-gray-300 rounded text-sm bg-white">
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
    const API_BASE_URL = '/api/orders'; 

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
                        Authorization: `Bearer ${token}`, // Necesitas pasar el token de administrador
                    },
                }
            );
            
            setOrders(response.data.orders);
            setTotalPages(response.data.pages);
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

    if (loading) return <div className="p-6 text-center text-xl">Cargando Órdenes...</div>;

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
        <div className="p-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-extrabold mb-6 text-indigo-700">🛒 Panel de Administración de Órdenes</h1>
            
            {/* --- Panel de Filtros y Control --- */}
            <div className="flex items-center space-x-6 p-4 mb-6 bg-white rounded-xl shadow-md border border-gray-200">
                <div className="flex items-center space-x-2">
                    <label className="font-semibold text-gray-700">Estado:</label>
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
                    <label className="font-semibold text-gray-700">Mostrar:</label>
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
            
            {/* --- Tabla de Órdenes --- */}
            <div className="bg-white shadow-xl rounded-xl overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-indigo-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Cliente</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Fecha</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Total</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Estado</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {orders.length > 0 ? (
                            orders.map((order) => (
                                <tr key={order._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        #{order._id.slice(-6).toUpperCase()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {order.customer 
                                            ? `${order.customer.firstName} ${order.customer.lastName}`
                                            : 'Invitado'
                                        }
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(order.createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-700">
                                        ${order.totalAmount.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <StatusBadge status={order.status} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2 items-center">
                                            <Button 
                                                className="bg-blue-600 text-xs px-3 py-1"
                                                onClick={() => fetchOrderDetails(order._id)}
                                            >
                                                Ver Detalles
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
            <div className="flex justify-between items-center mt-6 p-4 bg-white rounded-xl shadow-md">
                <p className="text-sm text-gray-700">
                    Mostrando página <span className="font-medium">{currentPage}</span> de <span className="font-medium">{totalPages}</span>
                </p>
                <div className="space-x-2">
                    <Button 
                        onClick={() => setCurrentPage(p => p - 1)}
                        disabled={currentPage === 1}
                        className={`bg-indigo-500`}
                    >
                        &larr; Anterior
                    </Button>
                    <Button 
                        onClick={() => setCurrentPage(p => p + 1)}
                        disabled={currentPage === totalPages}
                        className={`bg-indigo-500`}
                    >
                        Siguiente &rarr;
                    </Button>
                </div>
            </div>
        </div>
    );
};

// --- Componente auxiliar para el badge de estado ---
const StatusBadge = ({ status }) => {
    let classes = 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full ';
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

// --- Componente auxiliar para la vista de detalles ---
const OrderDetailsView = ({ order, onClose, onStatusUpdate, statusOptions }) => {
    return (
        <div className="p-8 bg-white rounded-xl shadow-2xl border border-gray-100 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-indigo-700">Detalles de la Orden #{order._id.slice(-6).toUpperCase()}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* 1. Información General */}
                <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-bold text-lg mb-2 text-gray-800">Cliente & Estado</h3>
                    <p><strong>Cliente:</strong> {order.customer ? `${order.customer.firstName} ${order.customer.lastName}` : 'Invitado'}</p>
                    <p><strong>Email:</strong> {order.customer ? order.customer.email : 'N/A'}</p>
                    <p><strong>Fecha:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                    <div className="flex items-center mt-2">
                        <strong className="mr-2">Estado Actual:</strong> <StatusBadge status={order.status} />
                    </div>
                    <div className="mt-3">
                        <Select 
                            value={order.status} 
                            onChange={(e) => onStatusUpdate(order._id, e.target.value)}
                            options={statusOptions}
                        />
                    </div>
                </div>

                {/* 2. Dirección de Envío */}
                <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-bold text-lg mb-2 text-gray-800">Dirección de Envío</h3>
                    <p>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                    <p>{order.shippingAddress.address}</p>
                    <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
                    <p>Teléfono: {order.shippingAddress.phone}</p>
                    <p className="italic text-sm mt-1">Notas: {order.shippingAddress.notes || 'Ninguna'}</p>
                </div>

                {/* 3. Resumen Financiero */}
                <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-bold text-lg mb-2 text-gray-800">Totales Financieros</h3>
                    <p>Subtotal: ${order.subtotal.toFixed(2)}</p>
                    <p>Costo Envío: ${order.shippingCost.toFixed(2)}</p>
                    <p>Impuestos: ${order.taxAmount.toFixed(2)}</p>
                    <p className="text-xl font-bold text-green-700 mt-2">Total: ${order.totalAmount.toFixed(2)}</p>
                    <p className="text-sm mt-2">Método de Pago: {order.paymentMethod}</p>
                    <p className="text-sm">Estado Pago: {order.paymentStatus}</p>
                </div>
            </div>

            {/* 4. Ítems de la Orden */}
            <h3 className="font-bold text-xl mb-4 text-gray-800 border-b pb-2">Ítems Comprados ({order.items.length})</h3>
            <div className="space-y-4">
                {order.items.map((item, index) => (
                    <div key={index} className="flex items-center space-x-4 p-3 border rounded-lg hover:bg-yellow-50">
                        {/*  */}
                        <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-md border" />
                        <div className="flex-grow">
                            <p className="font-semibold">{item.name} ({item.productCode})</p>
                            <p className="text-sm text-gray-600">
                                Talla: **{item.sizeName}** | Color: **{item.colorName}** | ID Único: {item.uniqueId}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-md">Cant: **{item.quantity}** x ${item.cost.toFixed(2)}</p>
                            <p className="font-bold text-md text-indigo-600">Total Ítem: ${(item.quantity * item.cost).toFixed(2)}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 text-right">
                <Button 
                    onClick={onClose}
                    className="bg-gray-500 px-6 py-2"
                >
                    &larr; Volver al Listado
                </Button>
            </div>
        </div>
    );
};

export default AdminOrderDashboard;