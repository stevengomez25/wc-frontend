import React, { createContext, useContext, useState, useEffect } from 'react';
// import { useAuth } from './AuthContext'; // Descomentar si quieres fusionar carritos al iniciar sesión

// --- CONFIGURACIÓN Y HOOK DE ACCESO ---
const CartContext = createContext();

// Hook personalizado para consumir el contexto fácilmente
export const useCart = () => useContext(CartContext);

// Nombre de la clave que se usará en localStorage
const LOCAL_STORAGE_KEY = 'webcommerce_cart';

const generateUniqueId = (product) => {
    // Usamos productId + Talla + Color para garantizar la unicidad
    return `${product.productId}-${product.sizeName || 'N/A'}-${product.colorName || 'N/A'}`;
};

// --- FUNCIÓN DEL PROVEEDOR DEL CONTEXTO ---
export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState([]);
    const [isCartLoading, setIsCartLoading] = useState(true);

    // const { isAuthenticated, user } = useAuth(); // Descomentar si usas AuthContext

    // 1. Cargar el carrito desde localStorage al inicio
    useEffect(() => {
        const storedCart = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (storedCart) {
            try {
                setCartItems(JSON.parse(storedCart));
            } catch (error) {
                console.error("Error parsing cart from localStorage:", error);
                setCartItems([]);
            }
        }
        setIsCartLoading(false);
    }, []);

    // 2. Sincronizar el carrito con localStorage cada vez que cartItems cambia
    useEffect(() => {
        if (!isCartLoading) {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cartItems));
            // NOTA: Si usaras una API, la llamada PATCH/POST al backend iría aquí también.
        }
    }, [cartItems, isCartLoading]);


    // --- FUNCIONES DE MANEJO DEL CARRITO ---

    /**
     * Añade un producto al carrito o incrementa su cantidad.
     * @param {Object} product - El objeto del producto a añadir (debe tener _id, name, cost).
     * @param {number} quantity - Cantidad a añadir.
     */
    const addToCart = (product, quantity = 1) => {

        const uniqueId = generateUniqueId(product); // El identificador de la variante

        setCartItems(currentItems => {
            // ❌ Antes: item => item._id === product._id
            // ✅ Ahora: item => item.uniqueId === uniqueId
            const itemIndex = currentItems.findIndex(item => item.uniqueId === uniqueId); // <--- CAMBIO CLAVE

            if (itemIndex > -1) {
                // Variante existente: Crea copias inmutables y aumenta la cantidad.
                const newItems = [...currentItems];
                const existingItem = newItems[itemIndex];
                newItems[itemIndex] = { ...existingItem, quantity: existingItem.quantity + quantity };

                return newItems;
            } else {
                // Variante nueva: Añádela al carrito.
                return [...currentItems, {
                    _id: product._id, // Mantenemos el ID del producto principal
                    name: product.name,
                    cost: product.cost,
                    image: product.image,
                    // Agregamos los datos específicos de la variante para visualización
                    sizeName: product.sizeName,
                    colorName: product.colorName,
                    uniqueId: uniqueId, // USAMOS ESTE COMO IDENTIFICADOR ÚNICO DEL ÍTEM
                    quantity: quantity
                }];
            }
        });
    };

    /**
     * Elimina completamente un ítem del carrito o reduce su cantidad.
     * @param {string} productId - El _id del producto.
     * @param {boolean} removeAll - Si es true, elimina el producto del carrito.
     */
    const updateQuantity = (uniqueId, newQuantity) => {
        setCartItems(currentItems => {
            const itemIndex = currentItems.findIndex(item => item.uniqueId === uniqueId);

            if (itemIndex > -1) {
                if (newQuantity <= 0) {
                    // Si la cantidad es 0 o menos, elimínalo
                    return currentItems.filter(item => item.uniqueId !== uniqueId);
                } else {
                    // Actualiza la cantidad
                    const newItems = [...currentItems];
                    newItems[itemIndex].quantity = newQuantity;
                    return newItems;
                }
            }
            return currentItems; // No se encontró, retorna el estado actual
        });
    };

    /**
     * Elimina un ítem por completo del carrito.
     * @param {string} productId - El _id del producto.
     */
    const removeItem = (uniqueId) => {
        setCartItems(currentItems =>
            currentItems.filter(item => item.uniqueId !== uniqueId)
        );
    };

    /**
     * Limpia completamente el carrito.
     */
    const clearCart = () => {
        setCartItems([]);
    };

    // Calcular totales y datos derivados
    const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const subtotal = cartItems.reduce((acc, item) => acc + (item.cost * item.quantity), 0);
    const formattedSubtotal = subtotal.toLocaleString();

    // --- OBJETO DE VALOR ---
    const contextValue = {
        cartItems,
        totalItems,
        subtotal: formattedSubtotal,
        isCartLoading,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        // Aquí puedes agregar la función checkout si no requiere autenticación
    };

    return (
        <CartContext.Provider value={contextValue}>
            {children}
        </CartContext.Provider>
    );
}