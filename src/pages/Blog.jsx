import React from 'react';
import { Link } from "react-router-dom";
import { useInView } from "react-intersection-observer";
import { FaFacebookF, FaLinkedinIn, FaYoutube, FaInstagram } from 'react-icons/fa';
import { TbLockUp } from "react-icons/tb";

// ----------------------------------------------------------------------
// Componente de Envoltura para Animación (Scroll Reveal)
// ----------------------------------------------------------------------
const RevealSection = ({ children, delay = 0 }) => {
    const { ref, inView } = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    return (
        <div
            ref={ref}
            className={`transition-all duration-1000 ease-out transform ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                }`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
};

const Blog = () => {
    const navItems = [
        { name: "Blog", to: "/blog" },
        { name: "Niños y bebés", to: "/kidsbabies" },
        { name: "Hombres", to: "/men" },
        { name: "Mujeres", to: "/women" },
    ];

    const relatedPosts = [
        {
            title: "Del Vestido a la Tendencia: Un Viaje por la Historia de la Moda",
            author: "Steven Gómez",
            image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&q=80&w=600",
        },
        {
            title: "No Te Quedes Atrás: Las Prendas Que Dominarán la Temporada.",
            author: "Steven Gómez",
            image: "https://images.unsplash.com/photo-1529139513402-e209979b1af8?auto=format&fit=crop&q=80&w=600",
        },
        {
            title: "De la pasarela a la calle: el impacto silencioso de la moda en nuestro día a día",
            author: "Steven Gómez",
            image: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80&w=600",
        },
    ];
    const styleItems = [
        {
            name: 'Classic',
            path: '/catalog?style=classic',
            image: 'https://www.hollomen.com/cdn/shop/articles/how-to-dress-like-a-classic-gentleman-everyday-939856.jpg?v=1693387536'
        },
        {
            name: 'Dramatic',
            path: '/catalog?style=dramatic',
            image: 'https://dress-magazine.com/wp-content/uploads/2022/09/myagkiy-dramatik-stil.jpg'
        },
        {
            name: 'Sporty/Natural',
            path: '/catalog?style=sporty',
            image: 'https://akns-images.eonline.com/eol_images/Entire_Site/20241130/rs_1024x759-241230090914-new_year_workout_clothes_hero_image.jpg?fit=around%7C1024:759&output-quality=90&crop=1024:759;center,top'
        },
        {
            name: 'Romantic',
            path: '/catalog?style=romantic',
            image: 'https://i.pinimg.com/originals/a8/45/f3/a845f3020f6b487c07158c54836d6da5.jpg'
        },
        {
            name: 'Artistic',
            path: '/catalog?style=artistic',
            image: 'https://i.pinimg.com/474x/6c/3c/14/6c3c1417968d68bf0c448e68cfddd4c2.jpg'
        },
    ];

    return (
        <div className="min-h-screen bg-neutral-50 font-sans text-neutral-900">
            {/* --- HEADER (Estilo Home) --- */}
            <header className="bg-white shadow-md sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <Link to="/" className="text-2xl sm:text-3xl font-extrabold tracking-widest text-neutral-900 uppercase">
                            VestiRápido
                        </Link>

                        <nav className="hidden md:flex space-x-6 text-sm font-medium items-center text-neutral-700">
                            {navItems.map((item) => (
                                <Link key={item.name} to={item.to} className="hover:text-neutral-900 transition duration-150">
                                    {item.name}
                                </Link>
                            ))}
                            <Link to="/catalog" className="px-4 py-1 bg-neutral-900 text-white rounded-full hover:bg-neutral-700 transition duration-150 text-xs">
                                Catálogo Completo
                            </Link>
                        </nav>

                        <div className="flex items-center space-x-4">
                            <Link to="/login" className="px-4 py-2 bg-neutral-100 text-neutral-800 border border-neutral-300 rounded-full text-xs font-medium hover:bg-neutral-200 transition flex items-center space-x-1">
                                <TbLockUp className="text-lg" />
                                <span className="hidden sm:inline">Entrar</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* --- CONTENIDO DEL BLOG --- */}
            <main className="max-w-6xl mx-auto px-6 py-16">

                <RevealSection>
                    <header className="mb-16 text-center md:text-left">
                        <h1 className="text-4xl md:text-7xl font-black mb-6 leading-none text-neutral-900 uppercase tracking-tighter">
                            Vístete para <br /><span className="text-neutral-400">Triunfar</span>
                        </h1>
                        <p className="text-neutral-500 italic text-xl border-l-4 border-neutral-900 pl-4">
                            Tu Armadura Invisible: Vístete para Conquistar Tu Día.
                        </p>
                    </header>
                </RevealSection>

                {/* Sección de Estilos con Animación en Cascada */}
                <section className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-20">
                    {styleItems.map((item, index) => (
                        <RevealSection key={item.name} delay={index * 100}>
                            <Link to={item.path} className="group block cursor-pointer">
                                {/* Contenedor de Imagen */}
                                <div className="bg-neutral-100 aspect-[2/3] mb-3 overflow-hidden shadow-sm border border-neutral-200 group-hover:shadow-xl transition-all duration-500 transform group-hover:scale-[1.02]">
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition duration-700 ease-in-out"
                                    />
                                </div>

                                {/* Etiqueta / Link de texto */}
                                <p className="text-center italic font-serif text-sm text-neutral-600 uppercase tracking-widest group-hover:text-neutral-900 transition-colors duration-300">
                                    {item.name}
                                </p>
                            </Link>
                        </RevealSection>
                    ))}
                </section>
                {/* Cuerpo del Artículo */}
                <RevealSection>
                    <article className="max-w-3xl mx-auto space-y-10 text-lg leading-relaxed text-neutral-700">
                        <p className="first-letter:text-5xl first-letter:font-bold first-letter:mr-3 first-letter:float-left">
                            En un mundo donde la primera impresión cuenta, la forma en que nos vestimos va mucho más allá de la simple estética. La moda, lejos de ser superficial, es una poderosa herramienta que influye directamente en nuestro estado de ánimo, confianza y percepción social. En nuestra tienda online, no solo te ofrecemos ropa; te ofrecemos una inversión en tu bienestar psicológico.
                        </p>

                        <div className="bg-white p-8 border-l-8 border-neutral-900 shadow-md">
                            <h2 className="font-black text-2xl mb-4 text-neutral-900 uppercase">Cognición Vestida</h2>
                            <p>
                                Este término psicológico describe cómo la ropa influye en los procesos cognitivos.
                                Estudios de la Universidad de Northwestern demuestran que el rendimiento mejora según la prenda que vestimos.
                            </p>
                        </div>
                        <p className="first-letter:text-5xl first-letter:font-bold first-letter:mr-3 first-letter:float-left">
                            La relación entre la ropa y la autoestima es innegable. Vestir prendas que nos sientan bien y que nos gustan eleva nuestra imagen corporal y nos hace sentir más atractivos y capaces. Cuando te miras al espejo y te gusta lo que ves, tu cerebro libera endorfinas, mejorando tu humor y tu confianza.
                            En nuestra página web, entendemos el poder transformador de la ropa. Cada prenda de nuestra colección ha sido seleccionada pensando no solo en la calidad y el diseño, sino también en cómo te hará sentir. <br /><br />
                            Te invitamos a explorar nuestro catálogo y descubrir cómo un nuevo atuendo puede ser el impulso que necesitas para sentirte más seguro, feliz y preparado para enfrentar cualquier desafío. Vístete bien, siéntete bien y ¡conquista el mundo!
                        </p>
                    </article>
                </RevealSection>

                {/* Imágenes Centrales con estilo Home */}
                <div className="grid md:grid-cols-2 gap-8 my-20">
                    <RevealSection>
                        <div className="h-96 bg-neutral-200 rounded-lg overflow-hidden shadow-2xl">
                            <img
                                src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=800"
                                alt="Fashion" className="w-full h-full object-cover grayscale hover:grayscale-0 transition duration-700"
                            />
                        </div>
                    </RevealSection>
                    <RevealSection delay={200}>
                        <div className="h-96 flex flex-col justify-center items-center bg-neutral-900 text-white p-10 text-center rounded-lg">
                            <h3 className="text-4xl font-black uppercase mb-4">¡Siéntete Bien!</h3>
                            <p className="font-light">Tu confianza empieza con lo que decides ponerte cada mañana.</p>
                        </div>
                    </RevealSection>
                </div>

                {/* --- ARTÍCULOS RELACIONADOS (Estilo Product Grid) --- */}
                <section className="border-t border-neutral-200 pt-20">
                    <h3 className="text-3xl font-black text-center mb-16 text-neutral-800 uppercase tracking-widest">
                        Seguir leyendo
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {relatedPosts.map((post, index) => (
                            <RevealSection key={index} delay={index * 150}>
                                <div className="bg-white group overflow-hidden shadow-md hover:shadow-2xl transition duration-300 transform hover:scale-[1.03]">
                                    <div className="aspect-video overflow-hidden">
                                        <img
                                            src={post.image}
                                            alt={post.title}
                                            className="w-full h-full object-cover transition duration-500 group-hover:opacity-80"
                                        />
                                    </div>
                                    <div className="p-6">
                                        <h4 className="font-bold text-lg text-neutral-800 mb-2 line-clamp-2 group-hover:text-neutral-600 transition">
                                            {post.title}
                                        </h4>
                                        <p className="text-neutral-400 text-xs uppercase tracking-widest">{post.author}</p>
                                    </div>
                                </div>
                            </RevealSection>
                        ))}
                    </div>
                </section>
            </main>

            {/* --- FOOTER (Estilo Home) --- */}
            <footer className="mt-20 border-t-8 border-neutral-900 py-16 bg-white">
                <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div className="text-center md:text-left">
                        <h2 className="text-2xl font-black mb-6 tracking-tighter uppercase">VestiRápido</h2>
                        <div className="flex justify-center md:justify-start space-x-5 text-neutral-400">
                            <FaFacebookF className="hover:text-black cursor-pointer transition" />
                            <FaInstagram className="hover:text-black cursor-pointer transition" />
                            <FaYoutube className="hover:text-black cursor-pointer transition" />
                        </div>
                    </div>

                    {["Mujeres", "Hombres", "Niños y bebés"].map((cat) => (
                        <div key={cat} className="text-center md:text-left">
                            <h4 className="font-bold mb-4 uppercase text-xs tracking-widest">{cat}</h4>
                            <ul className="text-neutral-500 space-y-2 text-sm">
                                <li className="hover:text-black cursor-pointer transition">Ver todo</li>
                                <li className="hover:text-black cursor-pointer transition">Nuevos arribos</li>
                                <li className="hover:text-black cursor-pointer transition">Ofertas</li>
                            </ul>
                        </div>
                    ))}
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-neutral-500 text-xs sm:text-sm">
                    <p className="mb-2">©{new Date().getFullYear()} VestiRápido | Todos los derechos reservados.</p>
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
        </div>
    );
};

export default Blog;