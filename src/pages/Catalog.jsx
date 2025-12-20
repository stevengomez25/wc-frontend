import { useEffect, useState, useMemo } from "react";
import { getProducts } from "../api/products";
import { useAuth } from "../context/AuthContext";
import { TbLockUp, TbFilter, TbSortAscending, TbX } from "react-icons/tb";
import { Link } from "react-router-dom";
import CartIcon from "../components/CartIcon";
import CartSideBar from "../components/CartSidebar";
import ProductModal from "../components/ProductModal";
import { useInView } from "react-intersection-observer";

// Reutilizamos tu componente de tarjeta para mantener la consistencia
const AnimatedProductCard = ({ product, delay, openModal }) => {
    const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

    return (
        <div
            ref={ref}
            style={{ transitionDelay: `${delay * 50}ms` }}
            className={`transition-all duration-700 ease-out transform ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
            <div
                onClick={() => openModal(product._id)}
                className="bg-white rounded-lg group overflow-hidden shadow-md hover:shadow-xl transition duration-300 cursor-pointer transform hover:scale-[1.03]"
            >
                <div className="w-full h-64 md:h-80 overflow-hidden relative">
                    <img
                        src={product.image || "https://via.placeholder.com/300x400.png?text=VestiRapido"}
                        alt={product.name}
                        className="w-full h-full object-cover transition duration-500 group-hover:opacity-85"
                    />
                    {product.discount && (
                        <span className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                            -{product.discount}% OFF
                        </span>
                    )}
                </div>
                <div className="p-4 text-left">
                    <h4 className="font-semibold text-neutral-800 line-clamp-1 mb-1">{product.name}</h4>
                    <p className="text-neutral-500 text-xs mb-2">Colección VestiRápido</p>
                    <p className="text-neutral-900 font-extrabold text-lg">
                        ${parseFloat(product.cost).toLocaleString()}
                    </p>
                    <button className="mt-4 w-full bg-neutral-900 text-white py-2 text-sm font-medium rounded-md sm:opacity-0 sm:group-hover:opacity-100 transition duration-300">
                        Ver detalles
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function Catalog() {
    const [allProducts, setAllProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const { isAuthenticated } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState(null);
    
    // Estados de Filtros
    const [filters, setFilters] = useState({
        priceRange: 500000, // Precio máximo inicial
        color: "",
        size: "",
        onlyStock: false
    });
    const [sortBy, setSortBy] = useState("default");
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    const openModal = (id) => setSelectedProductId(id);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await getProducts();
                if (data.ok) {
                    setAllProducts(data.products);
                    setFilteredProducts(data.products);
                }
            } catch (error) {
                console.error("Error loading products:", error);
            }
        };
        fetchProducts();
    }, []);

    // Lógica de Filtrado y Ordenamiento
    useEffect(() => {
        let result = [...allProducts];

        // Filtro por precio
        result = result.filter(p => p.cost <= filters.priceRange);

        // Filtro por color (asumiendo que el producto tiene la propiedad color)
        if (filters.color) {
            result = result.filter(p => p.color === filters.color);
        }

        // Filtro por talla
        if (filters.size) {
            result = result.filter(p => p.sizes?.includes(filters.size));
        }

        // Disponibilidad
        if (filters.onlyStock) {
            result = result.filter(p => p.stock > 0);
        }

        // Ordenamiento
        if (sortBy === "low-to-high") {
            result.sort((a, b) => a.cost - b.cost);
        } else if (sortBy === "high-to-low") {
            result.sort((a, b) => b.cost - a.cost);
        }

        setFilteredProducts(result);
    }, [filters, sortBy, allProducts]);

    return (
        <div className="min-h-screen bg-neutral-50 font-sans">
            {/* Header (Igual que el Home para consistencia) */}
            <header className="bg-white shadow-sm sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <Link to="/" className="text-2xl font-extrabold tracking-tighter text-neutral-900 uppercase">
                        VestiRápido
                    </Link>
                    <div className="flex items-center space-x-4">
                        <CartIcon onClickCart={() => setIsSidebarOpen(true)} />
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row gap-8">
                    
                    {/* BARRA LATERAL DE FILTROS (Desktop) */}
                    <aside className="hidden md:block w-64 flex-shrink-0">
                        <div className="sticky top-24 space-y-8">
                            <div>
                                <h3 className="text-lg font-bold text-neutral-900 mb-4 uppercase tracking-widest">Filtros</h3>
                                
                                {/* Rango de Precio */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                                        Precio máximo: ${filters.priceRange}
                                    </label>
                                    <input 
                                        type="range" 
                                        min="0" 
                                        max="1000000" 
                                        step="10000"
                                        value={filters.priceRange}
                                        onChange={(e) => setFilters({...filters, priceRange: e.target.value})}
                                        className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-900"
                                    />
                                </div>

                                {/* Tallas */}
                                <div className="mb-6">
                                    <span className="block text-sm font-medium text-neutral-700 mb-3">Talla</span>
                                    <div className="flex flex-wrap gap-2">
                                        {['S', 'M', 'L', 'XL'].map(size => (
                                            <button 
                                                key={size}
                                                onClick={() => setFilters({...filters, size: filters.size === size ? "" : size})}
                                                className={`px-3 py-1 border text-xs font-bold rounded ${filters.size === size ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-600 hover:border-neutral-900'}`}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Disponibilidad */}
                                <div className="flex items-center mb-6">
                                    <input 
                                        type="checkbox" 
                                        id="stock"
                                        checked={filters.onlyStock}
                                        onChange={(e) => setFilters({...filters, onlyStock: e.target.checked})}
                                        className="w-4 h-4 text-neutral-900 border-neutral-300 rounded focus:ring-neutral-900"
                                    />
                                    <label htmlFor="stock" className="ml-2 text-sm text-neutral-700">Solo en stock</label>
                                </div>

                                <button 
                                    onClick={() => setFilters({priceRange: 1000000, color: "", size: "", onlyStock: false})}
                                    className="text-xs text-red-600 underline uppercase font-bold"
                                >
                                    Limpiar filtros
                                </button>
                            </div>
                        </div>
                    </aside>

                    {/* CONTENIDO PRINCIPAL */}
                    <div className="flex-1">
                        {/* Barra Superior de Ordenamiento */}
                        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 pb-4 border-b border-neutral-200">
                            <h2 className="text-xl font-bold text-neutral-800 uppercase tracking-tight mb-4 sm:mb-0">
                                Catálogo <span className="text-neutral-400 font-light">({filteredProducts.length})</span>
                            </h2>
                            
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center text-sm text-neutral-600">
                                    <TbSortAscending className="mr-2 text-lg" />
                                    <select 
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="bg-transparent border-none focus:ring-0 cursor-pointer font-medium"
                                    >
                                        <option value="default">Ordenar por</option>
                                        <option value="low-to-high">Precio: Menor a Mayor</option>
                                        <option value="high-to-low">Precio: Mayor a Menor</option>
                                    </select>
                                </div>
                                <button 
                                    onClick={() => setIsMobileFilterOpen(true)}
                                    className="md:hidden flex items-center bg-neutral-100 px-4 py-2 rounded-full text-sm font-bold"
                                >
                                    <TbFilter className="mr-1" /> Filtros
                                </button>
                            </div>
                        </div>

                        {/* Grid de Productos */}
                        {filteredProducts.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-xl shadow-inner">
                                <p className="text-neutral-400 italic">No se encontraron productos con esos filtros.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                                {filteredProducts.map((product, index) => (
                                    <AnimatedProductCard 
                                        key={product._id} 
                                        product={product} 
                                        delay={index % 6} 
                                        openModal={openModal}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Modal de Filtros para Móviles */}
            {isMobileFilterOpen && (
                <div className="fixed inset-0 z-50 flex justify-end bg-black bg-opacity-50 transition-opacity">
                    <div className="w-80 bg-white h-full p-6 overflow-y-auto">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="font-bold uppercase tracking-widest">Filtros</h3>
                            <button onClick={() => setIsMobileFilterOpen(false)}><TbX className="text-2xl" /></button>
                        </div>
                        {/* (Aquí repetirías los mismos inputs de la barra lateral para móvil) */}
                    </div>
                </div>
            )}

            {/* Footer y Modales existentes */}
            {selectedProductId && <ProductModal productId={selectedProductId} onClose={() => setSelectedProductId(null)} />}
            <CartSideBar isOpen={isSidebarOpen} close={() => setIsSidebarOpen(false)} />
        </div>
    );
};