import { useEffect, useState } from "react";
import { getProducts } from "../api/products";
import { useAuth } from "../context/AuthContext";
import { TbLockUp } from "react-icons/tb";
import CartIcon from "../components/CartIcon";
import CartSidebar from "../components/CartSidebar";
import { Link } from "react-router-dom";
import ProductModal from "../components/ProductModal";
import { useInView } from "react-intersection-observer";

// ----------------------------------------------------------------------
// Componente: Tarjeta con animación de Scroll Reveal
// ----------------------------------------------------------------------
const AnimatedProductCard = ({ product, delay, openModal }) => {
    const { ref, inView } = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    const ProductCardContent = () => (
        <div
            onClick={() => openModal(product._id)} 
            className="
                bg-white rounded-lg group overflow-hidden 
                shadow-lg 
                hover:shadow-2xl 
                transition duration-300 cursor-pointer 
                transform hover:scale-[1.02]
            "
        >
            {/* Product Image */}
            <div className="w-full h-48 sm:h-56 md:h-64 overflow-hidden relative"> 
                <img
                    src={product.image || "https://via.placeholder.com/300x400.png?text=Fashion"}
                    alt={product.name}
                    className="w-full h-full object-cover transition duration-500 group-hover:opacity-85"
                />
                <span className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-neutral-800 text-white text-xs font-medium px-2 py-0.5 sm:px-3 sm:py-1 rounded-full">NEW</span>
            </div>

            {/* Product Info */}
            <div className="p-3 sm:p-4 text-center"> {/* PADDING AJUSTADO */}
                <h4 className="font-medium text-base sm:text-lg text-neutral-800 line-clamp-1 mb-1">
                    {product.name}
                </h4>
                <p className="text-neutral-500 text-xs sm:text-sm mb-2 sm:mb-3">
                    ¡Unidades limitadas!
                </p>
                <p className="text-black font-semibold text-lg sm:text-xl">
                    ${parseFloat(product.cost).toLocaleString()}
                </p>
                
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        openModal(product._id);
                    }}
                    // 🚨 AJUSTE CLAVE RESPONSIVE:
                    // En móviles, el botón es siempre visible (opacity-100) y sin transformación.
                    // En desktop, tiene el efecto hover (group-hover:opacity-100).
                    className="
                        mt-2 sm:mt-3 w-full bg-neutral-900 active:bg-green-400 text-white py-2 text-sm font-medium rounded-full 
                        opacity-100 transform translate-y-0 
                        sm:opacity-0 sm:group-hover:opacity-100 
                        sm:translate-y-2 sm:group-hover:translate-y-0
                        transition duration-300 active:duration-100 active:text-black
                    "
                >
                    Añadir al Carrito
                </button>
            </div>
        </div>
    );
    
    // Renderizado Condicional con Animación
    const transitionClass = `transition-all duration-700 ease-out ${inView 
        ? 'opacity-100 translate-y-0' 
        : 'opacity-0 translate-y-8'
    }`;
    
    return (
        <div
            ref={ref}
            className={`${transitionClass} transform`}
            style={{ transitionDelay: `${delay * 100}ms` }}
        >
            <ProductCardContent />
        </div>
    );
};
// ----------------------------------------------------------------------


export default function Home() {
    const [products, setProducts] = useState([]);
    const { isAuthenticated, loading } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState(null); 

    const openCart = () => setIsSidebarOpen(true);
    const openModal = (id) => setSelectedProductId(id);
    const closeModal = () => setSelectedProductId(null);

    const fetchProducts = async () => {
        try {
            const data = await getProducts();
            if (data.ok) {
                setProducts(data.products);
            }
        } catch (error) {
            console.error("Error loading products:", error);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);


    return (
        <div className="min-h-screen bg-neutral-50 font-sans">
            {/* Header - Sticky y Responsive */}
            <header className="bg-white shadow-md sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex justify-between items-center">
                    <h1 className="text-2xl sm:text-3xl font-light tracking-widest text-neutral-800 uppercase">
                        WebCommerce
                    </h1>
                    {/* Renderizado Condicional del Botón */}
                    {isAuthenticated ? (
                        <Link
                            to="/dashboard"
                            className="px-4 py-1.5 sm:px-6 sm:py-2 bg-neutral-800 text-white rounded-full text-xs sm:text-sm font-medium hover:bg-neutral-600 transition duration-300 shadow-lg hidden sm:inline-block"
                        >
                            Dashboard
                        </Link>
                    ) : (
                        <Link
                            to="/login"
                            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-neutral-100 text-neutral-800 border border-neutral-300 rounded-full text-xs sm:text-sm font-medium hover:bg-neutral-200 transition duration-300 flex items-center space-x-1"
                        >
                            <TbLockUp className="text-lg" />
                            <span className="hidden sm:inline">Iniciar Sesión</span>
                        </Link>
                    )}
                    <CartIcon onClickCart={openCart} />
                </div>
            </header>

            {/* Hero Section - Ajuste de Altura y Padding */}
            <section className="w-full bg-cover bg-center h-[50vh] sm:h-[60vh] md:h-[70vh] flex items-center"
                style={{ backgroundImage: "url('https://wallpapers.com/images/hd/4k-spring-pond-flowers-216pzooxtce7d6tt.jpg')" }}>
                {/* 🚨 AJUSTE RESPONSIVE: Padding y margen más contenido en móvil */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left bg-black bg-opacity-30 p-6 md:p-12 rounded-lg ml-2 sm:ml-4 md:ml-12">
                    <h2 className="text-3xl sm:text-5xl lg:text-7xl font-light mb-2 sm:mb-4 text-white uppercase tracking-wider leading-snug">
                        Colección <b>Primavera 2025</b>
                    </h2>
                    <p className="text-white text-sm sm:text-lg font-extralight mb-4 sm:mb-6 max-w-sm">
                        Descubre las texturas y estilos que definen la moda de esta temporada.
                    </p>
                    <a href="#products-grid" className="inline-block px-6 py-2 sm:px-8 sm:py-3 bg-white text-neutral-800 text-xs sm:text-sm font-semibold uppercase tracking-wider rounded-full shadow-xl hover:bg-neutral-200 transition duration-300">
                        Comprar Ahora
                    </a>
                </div>
            </section>

            {/* Product Grid - Padding ajustable */}
            <main id="products-grid" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
                <h3 className="text-2xl sm:text-3xl font-light text-center mb-8 sm:mb-12 text-neutral-800 uppercase tracking-widest">
                    Productos Destacados
                </h3>

                {products.length === 0 ? (
                    <p className="text-center text-gray-500 py-10">No hay productos disponibles en este momento.</p>
                ) : (
                    <div className="
                        grid 
                        grid-cols-2 
                        sm:grid-cols-3 
                        md:grid-cols-4 
                        lg:grid-cols-5 
                        gap-4 sm:gap-6 lg:gap-8 {/* ESPACIO AJUSTADO */}
                    ">
                        {products.map((product, index) => (
                            <AnimatedProductCard 
                                key={product._id} 
                                product={product} 
                                delay={index % 5}
                                openModal={openModal} 
                            />
                        ))}
                    </div>
                )}
            </main>

            {/* Footer y Modals */}
            <footer className="mt-10 sm:mt-20 border-t border-neutral-200 py-6 sm:py-10 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-neutral-500 text-xs sm:text-sm">
                    <p className="mb-2">© StevenGDev | Todos los derechos reservados.</p>
                    <div className="flex justify-center space-x-4">
                        <a href="#" className="hover:text-neutral-800 transition">Términos</a>
                        <a href="#" className="hover:text-neutral-800 transition">Privacidad</a>
                        <a href="#" className="hover:text-neutral-800 transition">Contacto</a>
                    </div>
                </div>
            </footer>
            
            {selectedProductId && (
                <ProductModal
                    productId={selectedProductId}
                    onClose={closeModal}
                />
            )}
            <CartSidebar
                isOpen={isSidebarOpen}
                close={() => setIsSidebarOpen(false)}
            />
        </div>
    );
}