
import { useEffect, useState } from "react";
import { getProducts } from "../api/products";
import { useAuth } from "../context/AuthContext";
import { TbLockUp } from "react-icons/tb";
import CartIcon from "../components/CartIcon";
// @ts-ignore
import CartSideBar from "../components/CartSidebar";
import { Link } from "react-router-dom";
import ProductModal from "../components/ProductModal";
import { useInView } from "react-intersection-observer";

// ----------------------------------------------------------------------
// Componente: Tarjeta con animación de Scroll Reveal
// ADAPTADA A ESTILO VESTIRÁPIDO (Minimalista, Denim/Neutro)
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
                shadow-md 
                hover:shadow-xl 
                transition duration-300 cursor-pointer 
                transform hover:scale-[1.03]
            "
        >
            {/* Product Image */}
            {/* Relación de aspecto un poco más alta, como en los catálogos */}
            <div className="w-full h-56 sm:h-64 md:h-72 overflow-hidden relative">
                <img
                    src={
                        product.image ||
                        "https://via.placeholder.com/300x400.png?text=VestiRapido+Fashion"
                    }
                    alt={product.name}
                    className="w-full h-full object-cover transition duration-500 group-hover:opacity-85"
                />
                {/* Etiqueta de Oferta, alineada con el concepto de descuentos del mockup */}
                <span className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-red-600 text-white text-xs font-bold px-2 py-0.5 sm:px-3 sm:py-1 rounded-full shadow-lg">
                    -40% OFF
                </span>
            </div>

            {/* Product Info */}
            <div className="p-4 sm:p-5 text-left">
                {/* Alineación a la izquierda para un look de catálogo más estándar */}
                <h4 className="font-semibold text-base sm:text-lg text-neutral-800 line-clamp-1 mb-1">
                    {product.name}
                </h4>
                <p className="text-neutral-500 text-xs sm:text-sm mb-2 sm:mb-3">
                    Prenda Básica
                </p>
                <p className="text-neutral-900 font-extrabold text-lg sm:text-xl">
                    ${parseFloat(product.cost).toLocaleString()}
                </p>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        openModal(product._id);
                    }}
                    // Botón con estilo más neutro/clásico
                    className="
                      mt-3 sm:mt-4 w-full bg-neutral-900 hover:bg-neutral-700 text-white py-2 text-sm font-medium rounded-md 
                      opacity-100 transform translate-y-0 
                      sm:opacity-0 sm:group-hover:opacity-100 
                      sm:translate-y-2 sm:group-hover:translate-y-0
                      transition duration-300 active:scale-[0.98]
                    "
                >
                    Agregar al Carrito
                </button>
            </div>
        </div>
    );

    // Renderizado Condicional con Animación
    const transitionClass = `transition-all duration-700 ease-out ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
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
                // Limitamos a 5 productos por fila, como sugiere el mockup
                setProducts(data.products);
            }
        } catch (error) {
            console.error("Error loading products:", error);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // Navegación principal, basada en los enlaces del mockup (Page 1)
    const navItems = [
        { name: "Blog", to: "/blog" },
        { name: "Niños y bebés", to: "/kidsbabies" },
        { name: "Hombres", to: "/men" },
        { name: "Mujeres", to: "/women" },
    ];

    return (
        <div className="min-h-screen bg-neutral-50 font-sans">
            {/* Header - Sticky y Responsive */}
            <header className="bg-white shadow-md sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
                    <div className="flex justify-between items-center mb-2 sm:mb-0">
                        {/* Logo VestiRápido */}
                        <Link to="/" className="text-2xl sm:text-3xl font-extrabold tracking-widest text-neutral-900 uppercase">
                            VestiRápido
                        </Link>

                        {/* Links para Desktop */}
                        <nav className="hidden md:flex space-x-6 text-sm font-medium text-center items-center text-neutral-700">
                            {navItems.map((item) => (
                                <Link key={item.name} to={item.to} className="hover:text-neutral-900 transition duration-150">
                                    {item.name}
                                </Link>
                            ))}
                            <Link to="/catalog" className="px-4 py-1 bg-neutral-900 text-center text-white rounded-full hover:bg-neutral-700 transition duration-150">
                                Catálogo Completo
                            </Link>
                        </nav>

                        {/* Iconos de Usuario y Carrito */}
                        <div className="flex items-center space-x-4">
                            {isAuthenticated ? (
                                <Link
                                    to="/dashboard"
                                    className="hidden md:inline-block px-4 py-2 bg-neutral-800 text-white rounded-full text-sm font-medium hover:bg-neutral-600 transition duration-300 shadow-lg"
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
                    </div>

                    {/* Navegación para Móviles (Simplificada) */}
                    <nav className="flex md:hidden justify-center space-x-4 mt-2 text-xs font-medium text-neutral-700 border-t pt-2">
                        {navItems.map((item) => (
                            <Link key={item.name} to={item.to} className="hover:text-neutral-900 transition duration-150">
                                {item.name}
                            </Link>
                        ))}
                    </nav>
                </div>
            </header>

            {/* Hero Section - Adaptado al estilo de la Pag. 3 del mockup */}
            <section
                className="w-full bg-cover bg-center h-[60vh] sm:h-[70vh] flex items-center relative"
                style={{
                    // Usamos una imagen de fondo con un patrón, similar a la Pag. 3
                    backgroundImage: "url('https://www.visitstockholm.com/media/images/2022-02-11_Ganni_butik_klader_mode_1.width-1440.jpg')", // Reemplazar con la imagen del patrón
                    backgroundColor: "#f0f0f0", // Color de fallback si la imagen no carga
                    backgroundBlendMode: 'multiply',
                }}
            >
                <div className="absolute inset-0 bg-black opacity-40"></div> {/* Oscurecimiento para texto */}

                {/* Contenido centrado, alineado con "¡Hora de brillar!" */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 w-full">
                    <h2 className="text-4xl sm:text-6xl lg:text-8xl font-black mb-3 sm:mb-4 text-white uppercase tracking-wider">
                        ¡Hora de brillar!
                    </h2>
                    <p className="text-white text-base sm:text-xl font-light mb-8 sm:mb-10 max-w-lg mx-auto">
                        Consigue los artículos de ropa que necesites para lucir fascinante en tu día a día, todo en un solo lugar!
                    </p>
                    <a
                        href="#products-grid"
                        className="inline-block px-8 py-3 sm:px-10 sm:py-4 bg-white text-neutral-900 text-sm sm:text-base font-bold uppercase tracking-wider rounded-lg shadow-xl hover:bg-neutral-200 transition duration-300"
                    >
                        Comprar ahora
                    </a>
                </div>
            </section>

            {/* Product Grid - Productos más vendidos (Adaptado) */}
            <main
                id="products-grid"
                className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20"
            >
                <h3 className="text-3xl sm:text-4xl font-extrabold text-center mb-10 sm:mb-16 text-neutral-800 uppercase tracking-wider">
                    Productos más vendidos
                </h3>

                {products.length === 0 ? (
                    <p className="text-center text-gray-500 py-10">
                        No hay productos disponibles en este momento.
                    </p>
                ) : (
                    <div
                        className="
                        grid 
                        grid-cols-2 
                        sm:grid-cols-3 
                        md:grid-cols-4 
                        lg:grid-cols-5 
                        gap-4 sm:gap-6 lg:gap-8 
                      "
                    >
                        {/* Solo mostramos los 5 primeros para simular la sección de "Productos más vendidos" */}
                        {products.slice(0, 5).map((product, index) => (
                            <AnimatedProductCard
                                key={product._id}
                                product={product}
                                // Delay se mantiene para la animación en cascada
                                delay={index}
                                openModal={openModal}
                            />
                        ))}
                    </div>
                )}

                {/* Botón para ver el catálogo completo, alineado con el mockup */}
                <div className="text-center mt-12 sm:mt-16">
                    <Link
                        to="/catalog"
                        className="inline-block px-8 py-3 bg-neutral-900 text-white text-sm font-medium rounded-md hover:bg-neutral-700 transition duration-300 shadow-lg"
                    >
                        Ver Catálogo
                    </Link>
                </div>
            </main>

            {/* Footer y Modals */}
            <footer className="mt-10 sm:mt-20 border-t-8 border-neutral-900 py-6 sm:py-10 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-neutral-500 text-xs sm:text-sm">
                    <p className="mb-2">© VestiRápido | Todos los derechos reservados.</p>
                    <div className="flex justify-center space-x-4">
                        <a href="#" className="hover:text-neutral-800 transition">
                            Términos
                        </a>
                        <a href="#" className="hover:text-neutral-800 transition">
                            Privacidad
                        </a>
                        <a href="/contactar" className="hover:text-neutral-800 transition">
                            Contactar
                        </a>
                    </div>
                </div>
            </footer>

            {selectedProductId && (
                <ProductModal productId={selectedProductId} onClose={closeModal} />
            )}
            <CartSideBar
                isOpen={isSidebarOpen}
                close={() => setIsSidebarOpen(false)}
            />
        </div>
    );
}