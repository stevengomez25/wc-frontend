// src/pages/CheckoutPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useCart } from '../context/cartContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // 👈 IMPORTANTE: Importar Axios
import { createOrder } from '../api/orders';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const API_URL = `${BACKEND_URL}/api`;

const WAREHOUSE_LAT = 7.0651;
const WAREHOUSE_LON = -73.0788;
const EARTH_RADIUS_KM = 6371;

function haversine(lat1, lon1, lat2, lon2) {
    // Conversión a radianes
    const R = EARTH_RADIUS_KM;
    const toRad = (x) => (x * Math.PI) / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    // Distancia en KM
    const distance = R * c;

    return distance;
}
// NOTA: Debes tener una forma de obtener el token del usuario logueado.
// Por ahora, lo simulamos o asumimos que se gestiona externamente.
const useAuthToken = () => {
    // Reemplaza esto con tu lógica real de obtención de JWT (ej: de localStorage o de tu contexto de autenticación)
    // return localStorage.getItem('authToken'); 
    return null; // Dejamos null si la orden puede ser como "invitado"
}

export default function CheckoutPage() {
    const { cartItems, subtotal, clearCart } = useCart();
    const navigate = useNavigate();
    const token = useAuthToken(); // Obtener el token (puede ser null para invitados)
    // const { order, setOrder } = useState(null);



    // 2. LÓGICA DE TARIFAS (Ejemplo simple)
    function calculateShippingCost(distanceKm) {
        if (distanceKm < 50) return 8000;
        if (distanceKm < 200) return 15000;
        if (distanceKm < 500) return 25000;
        return 35000; // Envío de larga distancia
    }
    // 1. ESTADO PARA EL FORMULARIO DE ENVÍO
    const [shippingDetails, setShippingDetails] = useState({
        firstName: '', lastName: '', email: '', phone: '',
        address: '', city: '', state: '', zip: '', notes: ''
    });

    const [shippingCost, setShippingCost] = useState(0); // 👈 Inicializamos en 0
    const [isProcessing, setIsProcessing] = useState(false);
    const [isCalculatingShipping, setIsCalculatingShipping] = useState(false); // 👈 NUEVO: Estado para mostrar carga de envío

    // Función para manejar el cambio en los inputs del formulario
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setShippingDetails(prev => ({ ...prev, [name]: value }));
    };

    // --- CÁLCULOS FINANCIEROS ---
    // Convertimos el subtotal del contexto a un número para cálculos


    const TAX_RATE = parseFloat(0.19);
    // Creamos una simulación de costo de envío, asumiendo que debe ser parte del objeto de orden.
    const taxAmount = parseFloat((subtotal * TAX_RATE));
    const totalAmount = parseFloat(subtotal + taxAmount + shippingCost);

    // -----------------------------------------------------------------------------------
    // FUNCIÓN CENTRAL: GEOCÓDIGO Y CÁLCULO DE ENVÍO
    // -----------------------------------------------------------------------------------

    const getCoordinatesAndCalculateShipping = useCallback(async () => {
        const { address, city, state, zip } = shippingDetails;

        // Regla: Solo intentar geocodificar si el CP y la dirección principal están llenos.
        if (!zip || zip.length < 5 || !address) {
            setShippingCost(0); // Reinicia el costo si la info es incompleta
            return;
        }

        setIsCalculatingShipping(true);
        const fullAddress = `${address}, ${city}, ${state}, ${zip}, Colombia`;

        try {
            // 1. Petición a Nominatim para obtener Lat/Lon del Destino
            const response = await axios.get(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(fullAddress)}&format=json&limit=1`,
                {
                    // Buenas prácticas de Nominatim: Identificar tu aplicación
                    headers: { 'User-Agent': 'MiECommerceApp/1.0 (mi-email@ejemplo.com)' }
                }
            );

            if (response.data && response.data.length > 0) {
                const result = response.data[0];
                const destLat = parseFloat(result.lat);
                const destLon = parseFloat(result.lon);

                // 2. Cálculo de la Distancia
                const distanceKm = haversine(WAREHOUSE_LAT, WAREHOUSE_LON, destLat, destLon);

                // 3. Cálculo del Costo de Envío
                const newShippingCost = calculateShippingCost(distanceKm);

                // 4. Actualizar el estado del componente
                setShippingCost(newShippingCost);
                console.log(`Distancia calculada: ${distanceKm.toFixed(2)} km. Costo de envío: $${newShippingCost.toLocaleString()}`);

            } else {
                // Si Nominatim no encuentra la dirección
                setShippingCost(50000); // Tarifa fija alta de emergencia o error
                console.warn("Geocodificación fallida. Usando tarifa de emergencia.");
            }

        } catch (error) {
            console.error("Error al geocodificar o calcular el envío:", error);
            setShippingCost(50000); // Tarifa fija alta en caso de error de API
        } finally {
            setIsCalculatingShipping(false);
        }
    }, [shippingDetails]); // Depende de los detalles de envío

    // -----------------------------------------------------------------------------------
    // EFECTO: DISPARAR EL CÁLCULO CUANDO EL CÓDIGO POSTAL CAMBIE
    // -----------------------------------------------------------------------------------

    // Se dispara cuando 'zip' cambia.
    useEffect(() => {
        // Opcional: puedes usar un debounce aquí para no disparar en cada tecla
        const timer = setTimeout(() => {
            getCoordinatesAndCalculateShipping();
        }, 800); // Espera 800ms después de que el usuario deja de escribir

        return () => clearTimeout(timer); // Limpia el timer si el valor cambia de nuevo
    }, [shippingDetails.zip, getCoordinatesAndCalculateShipping]);

    // --- FUNCIÓN DE PROCESAMIENTO DE ORDEN (INTEGRACIÓN DE API) ---
    const handlePlaceOrder = async (e) => {
        e.preventDefault(); // Evita el envío del formulario HTML

        // Validación básica
        if (cartItems.length === 0) {
            alert("Tu carrito está vacío. ¡Añade productos antes de ordenar!");
            navigate('/');
            return;
        }

        // Validación de formulario (simple)
        const requiredFields = ['firstName', 'lastName', 'email', 'address', 'city', 'state', 'zip'];
        const isFormValid = requiredFields.every(field => shippingDetails[field].trim() !== '');

        if (!isFormValid) {
            alert("Por favor, completa todos los campos de información de envío requeridos.");
            return;
        }

        setIsProcessing(true);

        const orderData = {
            // Asegúrate que los ítems contengan los campos que tu controlador espera (sku, productId, etc.)
            items: cartItems.map(item => {
                // Intenta usar campos ya presentes
                const pid = item.productId || item._id || item.id
                    // Si no hay productId, intenta extraerlo del uniqueId (formato: `${productId}-${size}-${color}`)
                    || (typeof item.uniqueId === 'string' ? item.uniqueId.split('-')[0] : null);

                return {
                    ...item,
                    productId: pid,
                    sizeName: item.sizeName,
                    colorName: item.colorName,
                    quantity: item.quantity,
                    cost: item.cost,
                };
            }),
            shippingAddress: shippingDetails, // Usamos los datos del formulario
            subtotal: subtotal,
            shippingCost: shippingCost,
            taxAmount: taxAmount,
            totalAmount: totalAmount,
            paymentMethod: "Credit Card (Simulated)", // o el valor real que obtengas del formulario/pasarela
        };

        console.log("Enviando orden a /api/orders:", orderData);

        try {
            // Llamada POST a tu controlador createOrder
            const response = await axios.post(`${API_URL}/orders`, orderData, {
                headers: {
                    // Si el usuario está logueado, envía el token. Si no, se procesa como invitado.
                    ...(token && { Authorization: `Bearer ${token}` }),
                },
            });

            console.log("Estructura de la respuesta:", response.data); // 👈 Añade esto

            // ÉXITO: Tu controlador respondió con un status 201
            const newOrder = response.data.order;

            // 1. Limpiar el carrito después de la orden exitosa
            clearCart();

            // 2. Redirigir al usuario
            alert(`✅ ¡Orden #${newOrder._id.slice(-6).toUpperCase()} procesada con éxito! Se ha actualizado el stock.`);
            navigate(`/order-confirmation/${newOrder._id}`);

        } catch (error) {
            // ERROR: Captura errores de red o errores 400/500 de tu backend
            let errorMessage = "Error desconocido al procesar el pago.";

            if (error.response && error.response.data && error.response.data.message) {
                // Este es el mensaje que viene de tu controlador (ej: "Stock insuficiente", "Discrepancia de precio")
                errorMessage = error.response.data.message;
            } else {
                console.error("Error al llamar a la API:", error);
            }

            alert(`❌ Error al crear la orden: ${errorMessage}. Por favor, revisa tu carrito.`);

        } finally {
            setIsProcessing(false);
        }
    };


    // Si el carrito está vacío, redirigir al Home
    if (cartItems.length === 0 && !isProcessing) {
        return (
            <div className="text-center py-20">
                <h1 className="text-3xl font-light text-neutral-700">Tu carrito está vacío.</h1>
                <button
                    onClick={() => navigate('/')}
                    className="mt-6 px-6 py-2 bg-neutral-800 text-white rounded-full hover:bg-neutral-600 transition"
                >
                    Volver a la Tienda
                </button>
            </div>
        );
    }


    // --- RENDERIZADO DEL CHECKOUT ---
    return (
        <div className="max-w-6xl mx-auto px-4 py-12 min-h-screen bg-neutral-50">
            <h1 className="text-4xl font-light text-neutral-800 mb-8 tracking-wider uppercase border-b pb-4">
                Finalizar Compra
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                {/* COLUMNA 1 & 2: Formulario de Envío/Pago */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Sección 1: Detalles de Envío */}
                    <div className="bg-white p-6 rounded-lg shadow-xl border border-neutral-100">
                        <h2 className="text-2xl font-semibold mb-6 text-neutral-800 border-b pb-3">
                            1. Información de Envío
                        </h2>
                        {/* 🎯 El formulario ahora usa el estado `shippingDetails` y el handler `handleInputChange` */}
                        <form className="space-y-6" onSubmit={handlePlaceOrder}>
                            {/* FILA 1: Nombre y Apellido */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="firstName" className="block text-sm font-medium text-neutral-700 mb-1">Nombre</label>
                                    <input
                                        type="text" id="firstName" name="firstName" required
                                        value={shippingDetails.firstName} onChange={handleInputChange}
                                        placeholder="Ej: Juan"
                                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg shadow-sm focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500 transition duration-150"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="lastName" className="block text-sm font-medium text-neutral-700 mb-1">Apellido</label>
                                    <input
                                        type="text" id="lastName" name="lastName" required
                                        value={shippingDetails.lastName} onChange={handleInputChange}
                                        placeholder="Ej: Pérez"
                                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg shadow-sm focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500 transition duration-150"
                                    />
                                </div>
                            </div>

                            {/* FILA 2: Correo Electrónico y Teléfono */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1">Correo Electrónico</label>
                                    <input
                                        type="email" id="email" name="email" required
                                        value={shippingDetails.email} onChange={handleInputChange}
                                        placeholder="tu.correo@ejemplo.com"
                                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg shadow-sm focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500 transition duration-150"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-neutral-700 mb-1">Teléfono</label>
                                    <input
                                        type="tel" id="phone" name="phone"
                                        value={shippingDetails.phone} onChange={handleInputChange}
                                        placeholder="Ej: +57 300 123 4567"
                                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg shadow-sm focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500 transition duration-150"
                                    />
                                </div>
                            </div>

                            {/* FILA 3: Dirección Completa */}
                            <div>
                                <label htmlFor="address" className="block text-sm font-medium text-neutral-700 mb-1">Dirección (Calle y Número)</label>
                                <input
                                    type="text" id="address" name="address" required
                                    value={shippingDetails.address} onChange={handleInputChange}
                                    placeholder="Ej: Carrera 1 # 1A - 2B"
                                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg shadow-sm focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500 transition duration-150"
                                />
                            </div>

                            {/* FILA 4: Ciudad, Departamento/Estado y Código Postal */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label htmlFor="city" className="block text-sm font-medium text-neutral-700 mb-1">Ciudad</label>
                                    <input
                                        type="text" id="city" name="city" required
                                        value={shippingDetails.city} onChange={handleInputChange}
                                        placeholder="Ej: Bogotá"
                                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg shadow-sm focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500 transition duration-150"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="state" className="block text-sm font-medium text-neutral-700 mb-1">Departamento/Estado</label>
                                    <input
                                        type="text" id="state" name="state" required
                                        value={shippingDetails.state} onChange={handleInputChange}
                                        placeholder="Ej: Cundinamarca"
                                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg shadow-sm focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500 transition duration-150"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="zip" className="block text-sm font-medium text-neutral-700 mb-1">Código Postal</label>
                                    <input
                                        type="text" id="zip" name="zip" required
                                        value={shippingDetails.zip} onChange={handleInputChange}
                                        placeholder="Ej: 110111"
                                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg shadow-sm focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500 transition duration-150"
                                    />
                                </div>
                            </div>

                            {/* FILA 5: Notas de Envío */}
                            <div>
                                <label htmlFor="notes" className="block text-sm font-medium text-neutral-700 mb-1">Notas de Envío (Opcional)</label>
                                <textarea
                                    id="notes" name="notes" rows="3"
                                    value={shippingDetails.notes} onChange={handleInputChange}
                                    placeholder="Ej: Dejar con el portero o entregar solo después de las 5 PM."
                                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg shadow-sm focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500 transition duration-150 resize-none"
                                ></textarea>
                            </div>

                            {/* El botón de ordenar ahora es el botón de submit del formulario */}
                            <button
                                type="submit" // 👈 CRUCIAL: type="submit" para que el onSubmit del form lo active
                                disabled={isProcessing || cartItems.length === 0}
                                className={`w-full py-3 mt-6 text-white rounded-full font-semibold uppercase tracking-wider transition duration-300 shadow-lg
                                    ${isProcessing || cartItems.length === 0
                                        ? 'bg-neutral-400 cursor-not-allowed'
                                        : 'bg-green-600 hover:bg-green-700'}
                                `}
                            >
                                {isProcessing ? 'PROCESANDO ORDEN...' : 'CONFIRMAR Y ORDENAR'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* COLUMNA 3: Resumen de la Orden */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-lg shadow-xl sticky top-24">
                        <h2 className="text-2xl font-semibold mb-6 text-neutral-700 border-b pb-3">Resumen de la Orden</h2>

                        {/* Lista de Items y Totales (sin cambios) */}
                        <div className="space-y-4 mb-6 max-h-60 overflow-y-auto">
                            {cartItems.map((item) => (
                                <div key={item.uniqueId} className="flex justify-between items-start text-sm border-b pb-2">
                                    <div className="flex-1 pr-2">
                                        <p className="font-medium text-neutral-800 line-clamp-1">{item.name}</p>
                                        <p className="text-xs text-neutral-500">
                                            {item.sizeName} / {item.colorName} ({item.quantity})
                                        </p>
                                    </div>
                                    <span className="font-semibold">${(item.cost * item.quantity).toLocaleString()}</span>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-2 border-t pt-4">
                            <div className="flex justify-between text-base text-neutral-600">
                                <span>Subtotal de Productos:</span>
                                <span>${(subtotal * 1).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-base text-neutral-600">
                                <span>Envío:</span>
                                <span>${(shippingCost).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-base text-neutral-600">
                                <span>Impuestos ({TAX_RATE * 100}%):</span>
                                <span>${parseFloat((taxAmount * 1).toFixed(2)).toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="flex justify-between font-bold text-2xl mt-4 border-t pt-4">
                            <span>TOTAL:</span>
                            <span>${parseInt((totalAmount * 1)).toLocaleString()}</span>
                        </div>

                        {/* El botón de ordenar ha sido movido dentro del <form> */}
                        <button
                            onClick={() => navigate('/')}
                            className="w-full py-2 mt-2 text-sm text-neutral-500 hover:text-neutral-800 transition"
                        >
                            Volver a la tienda
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}