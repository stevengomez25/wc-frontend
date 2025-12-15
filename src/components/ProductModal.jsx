// src/components/ProductModal.jsx

import { useEffect, useState, useCallback, useMemo } from 'react';
import { getProductById } from '../api/products';
import { FaShoppingCart, FaCheckCircle, FaTimes } from 'react-icons/fa';
import { useCart } from "../context/cartContext";

// --- Función Auxiliar para obtener el stock de una variante específica (NUEVA LÓGICA) ---
const getStockForSelection = (product, sizeName, colorName) => {
    // Si no hay selecciones o producto, el stock es 0
    if (!product || !sizeName || !colorName || !product.variants || product.variants.length === 0) {
        return 0;
    }

    // 🎯 Buscar el stock directamente en el array 'variants' por la combinación de talla y color
    const variant = product.variants.find(v => 
        v.sizeName === sizeName && v.colorName === colorName
    );

    // Si la combinación existe, devuelve la cantidad; si no, devuelve 0.
    return variant ? variant.quantity : 0;
};
// ------------------------------------------------------------------------


// --- Componente principal del Modal ---
export default function ProductModal({ productId, onClose }) {
    if (!productId) return null;

    // 1. 🥇 HOOKS DE ESTADO Y CONTEXTO
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSizeName, setSelectedSizeName] = useState(null);
    const [selectedColorName, setSelectedColorName] = useState(null);
    const [isAdded, setIsAdded] = useState(false);
    
    // Obtener el contexto del carrito
    const { addToCart } = useCart();
    
    // 2. DERIVACIÓN DE DATOS REQUERIDOS (NUEVA LÓGICA)
    // Extraer tallas y colores ÚNICOS para los selectores de botones
    const availableSizes = useMemo(() => {
        if (!product || !product.variants) return [];
        // Mapea y devuelve solo los nombres de tallas únicos
        return [...new Set(product.variants.map(v => v.sizeName))].map(sizeName => ({ sizeName }));
    }, [product]);

    const availableColors = useMemo(() => {
        if (!product || !product.variants) return [];
        // Mapea y devuelve solo los nombres de colores únicos
        return [...new Set(product.variants.map(v => v.colorName))].map(colorName => ({ colorName }));
    }, [product]);


    // --- LÓGICA DE DISPONIBILIDAD CRUZADA (ADAPTADA) ---

    /**
     * Determina si una talla específica tiene stock disponible para CUALQUIER variante,
     * o stock para la combinación si ya se seleccionó un color.
     */
    const isSizeAvailableForColor = useCallback((sizeName) => {
        if (!product || !product.variants) return false; 
        
        if (!selectedColorName) {
            // Caso 1: No hay color seleccionado, ¿Esta talla existe en AL MENOS UNA variante con stock > 0?
            return product.variants.some(v => v.sizeName === sizeName && v.quantity > 0);
        }

        // Caso 2: Color seleccionado, ¿La combinación [sizeName + selectedColorName] tiene stock?
        return getStockForSelection(product, sizeName, selectedColorName) > 0;
    }, [product, selectedColorName]);


    /**
     * Determina si un color específico tiene stock disponible para CUALQUIER variante,
     * o stock para la combinación si ya se seleccionó una talla.
     */
    const isColorAvailableForSize = useCallback((colorName) => {
        if (!product || !product.variants) return false;

        if (!selectedSizeName) {
            // Caso 1: No hay talla seleccionada, ¿Este color existe en AL MENOS UNA variante con stock > 0?
            return product.variants.some(v => v.colorName === colorName && v.quantity > 0);
        }

        // Caso 2: Talla seleccionada, ¿La combinación [selectedSizeName + colorName] tiene stock?
        return getStockForSelection(product, selectedSizeName, colorName) > 0;
    }, [product, selectedSizeName]);


    // Función de mapeo de color, memoizada para rendimiento (SIN CAMBIOS)
    const getColorCode = useMemo(() => (name) => {
        const colorMap = {
            'NEGRO': '#000000', 'BLANCO': '#ffffff', 'GRIS': '#9ca3af', 'NAVY': '#000080',
            'ROJO': '#dc2626', 'AZUL': '#3b82f6', 'VERDE': '#10b981', 'AMARILLO': '#facc15'
        };
        return colorMap[name.toUpperCase()] || name.toLowerCase();
    }, []);
    // -------------------------------------------------------------------------------------

    // Stock actual de la combinación seleccionada
    const currentStock = getStockForSelection(product, selectedSizeName, selectedColorName);
    const isAvailable = currentStock > 0;

    // --- LÓGICA DE FETCHING (SIN CAMBIOS) ---
    useEffect(() => {
        let isMounted = true;
        async function fetchProduct() {
            setLoading(true);
            setError(null);
            setProduct(null);

            try {
                const data = await getProductById(productId);

                if (isMounted) {
                    if (data && data.ok) {
                        setProduct(data.product);
                        // Resetear las selecciones al cargar un nuevo producto
                        setSelectedSizeName(null); 
                        setSelectedColorName(null);
                    } else {
                        setError('Producto no encontrado.');
                    }
                }
            } catch (err) {
                console.error("Fetch error:", err);
                if (isMounted) {
                    setError('Error al conectar con el servidor.');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }
        fetchProduct();

        return () => {
            isMounted = false;
        };
    }, [productId]);

    // --- MANEJO DE ADD TO CART (adaptado para obtener el SKU) ---
    const handleAddToCart = () => {
        if (!product || !selectedSizeName || !selectedColorName || !isAvailable) {
            alert("Por favor, selecciona una combinación de TALLA y COLOR disponible.");
            return;
        }

        // 🎯 Buscar el SKU de la variante seleccionada
        const selectedVariant = product.variants.find(v => 
            v.sizeName === selectedSizeName && v.colorName === selectedColorName
        );

        if (!selectedVariant) {
             alert("Error interno: SKU de variante no encontrado.");
             return;
        }

        const itemToAdd = {
            productId: product._id, 
            productCode: product.code, 
            sku: selectedVariant.sku, // 👈 Se añade el SKU
            name: product.name,
            cost: product.cost,
            image: product.image,
            sizeName: selectedSizeName,
            colorName: selectedColorName,
            quantity: 1, 
            maxStock: currentStock, 
        };

        addToCart(itemToAdd);

        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2500);
    };


    // 2. Renderizado Condicional de Estados
    if (loading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center">
                <div className="bg-white p-10 rounded-lg shadow-2xl">
                    <p className="text-xl text-neutral-800 font-light uppercase tracking-widest">Cargando...</p>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center">
                <div className="bg-white p-10 rounded-lg shadow-2xl">
                    <p className="text-xl text-red-600 font-light uppercase">{error || 'Producto no disponible.'}</p>
                    <button onClick={onClose} className="mt-4 text-sm text-neutral-600 hover:text-neutral-800">Cerrar</button>
                </div>
            </div>
        );
    }
    // -------------------------------------------------------------------------------------

    // --- Renderizado del Producto (La estructura visual no necesita cambios) ---
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto relative">
                
                {/* Botón de Cierre */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-neutral-700 hover:text-neutral-900 z-50 p-2 bg-white rounded-full shadow-md transition"
                    aria-label="Cerrar ventana de producto"
                >
                    <FaTimes className="w-5 h-5" />
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8 lg:p-12">

                    {/* COLUMNA IZQUIERDA: IMAGEN */}
                    <div>
                        <img
                            src={product.image || "https://placehold.co/800x600"}
                            alt={product.name}
                            className="w-full h-[400px] object-cover rounded-md border border-neutral-200"
                        />
                    </div>

                    {/* COLUMNA DERECHA: INFORMACIÓN Y OPCIONES */}
                    <div className="flex flex-col justify-start">

                        {/* TÍTULO Y PRECIO */}
                        <p className="text-sm font-light text-neutral-500 uppercase tracking-widest mb-1">
                            {product.description.split(" ")[0] || "Ropa Casual"}
                        </p>
                        <h1 className="text-3xl lg:text-4xl font-light text-neutral-900 mb-4 uppercase tracking-wider">
                            {product.name}
                        </h1>
                        <p className="text-2xl font-semibold text-neutral-800 mb-6 border-b pb-4 border-neutral-100">
                            ${parseFloat(product.cost).toLocaleString('es-CO')}
                        </p>

                        {/* ESTADO DE STOCK (VISIBLE) */}
                        <p className={`mb-4 text-md font-semibold ${isAvailable ? 'text-green-600' : 'text-gray-600'}`}>
                            {selectedSizeName && selectedColorName
                                ? (isAvailable ? `Stock Disponible: ${currentStock} unidades.` : 'AGOTADO para esta combinación')
                                : 'Selecciona talla y color para ver stock'}
                        </p>


                        {/* SELECCIÓN DE TALLA (ADAPTADA) */}
                        <div className="mb-4">
                            <h3 className="font-light text-neutral-800 mb-3 tracking-widest uppercase text-sm">
                                TALLA: <span className="font-semibold">{selectedSizeName || 'SELECCIONAR'}</span>
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {/* Ahora iteramos sobre la lista de tallas ÚNICAS derivada con useMemo */}
                                {availableSizes.map(({ sizeName }) => {
                                    const isSizeOptionAvailable = isSizeAvailableForColor(sizeName);

                                    return (
                                        <button
                                            key={sizeName}
                                            onClick={() => setSelectedSizeName(sizeName)}
                                            disabled={!isSizeOptionAvailable}
                                            className={`w-12 h-10 border text-sm font-light uppercase transition duration-200 
                                                ${!isSizeOptionAvailable
                                                    ? 'bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed line-through'
                                                    : selectedSizeName === sizeName
                                                        ? 'bg-neutral-800 text-white border-neutral-800'
                                                        : 'bg-white text-neutral-700 hover:bg-neutral-100 border-neutral-300'
                                                }`}
                                        >
                                            {sizeName}
                                        </button>
                                    );
                                })}
                                {!availableSizes.length && <p className="text-sm text-gray-400">No hay tallas disponibles.</p>}
                            </div>
                        </div>

                        {/* SELECCIÓN DE COLOR (ADAPTADA) */}
                        <div className="mb-8">
                            <h3 className="font-light text-neutral-800 mb-3 tracking-widest uppercase text-sm">
                                COLOR: <span className="font-semibold">{selectedColorName || 'SELECCIONAR'}</span>
                            </h3>
                            <div className="flex gap-3">
                                {/* Ahora iteramos sobre la lista de colores ÚNICOS derivada con useMemo */}
                                {availableColors.map(({ colorName }) => {
                                    const isColorOptionAvailable = isColorAvailableForSize(colorName);

                                    return (
                                        <button
                                            key={colorName}
                                            onClick={() => setSelectedColorName(colorName)}
                                            disabled={!isColorOptionAvailable}
                                            className={`w-7 h-7 rounded-full border-2 transition duration-200 shadow-sm relative 
                                                ${selectedColorName === colorName
                                                    ? 'ring-2 ring-neutral-800 ring-offset-2'
                                                    : 'hover:ring-1 ring-neutral-300'
                                                }`}
                                            style={{
                                                backgroundColor: getColorCode(colorName),
                                                opacity: isColorOptionAvailable ? 1 : 0.5, 
                                                borderColor: getColorCode(colorName) === '#ffffff' ? '#d1d5db' : getColorCode(colorName)
                                            }}
                                            aria-label={`Seleccionar color ${colorName} (${isColorOptionAvailable ? 'Disponible' : 'Agotado'})`}
                                        >
                                            {!isColorOptionAvailable && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="w-full h-px bg-red-600 rotate-45 transform"></div>
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                                {!availableColors.length && <p className="text-sm text-gray-400">No hay colores disponibles.</p>}
                            </div>
                        </div>

                        {/* DESCRIPCIÓN Y BOTÓN DE CARRITO (sin cambios funcionales, solo la lógica de AddToCart se ajustó arriba) */}
                        <div className="mt-auto pt-6 border-t border-neutral-100">
                            <h2 className="text-lg font-light text-neutral-800 mb-3 uppercase tracking-wider">Descripción</h2>
                            <p className="text-gray-600 leading-relaxed text-base font-light mb-8">
                                {product.description || "Este es un artículo de alta calidad, diseñado para ofrecer durabilidad y estilo minimalista, con una composición de materiales premium."}
                            </p>

                            <button
                                onClick={handleAddToCart}
                                disabled={!selectedSizeName || !selectedColorName || !isAvailable}
                                className={`w-full flex items-center justify-center space-x-3 py-3 px-8 rounded-full text-lg font-medium uppercase tracking-wider transition duration-300 shadow-lg 
                                    ${isAdded
                                        ? 'bg-green-600 text-white'
                                        : (!selectedSizeName || !selectedColorName || !isAvailable
                                            ? 'bg-neutral-300 text-neutral-600 cursor-not-allowed'
                                            : 'bg-neutral-800 text-white hover:bg-neutral-600')
                                    }`}
                            >
                                {isAdded ? (
                                    <><FaCheckCircle className="w-5 h-5" /> <span>PRODUCTO AÑADIDO</span></>
                                ) : (
                                    <><FaShoppingCart className="w-5 h-5" /> <span>Añadir al Carrito</span></>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}