import React from 'react';
import { FaFacebookF, FaLinkedinIn, FaYoutube, FaInstagram } from 'react-icons/fa';

const Blog = () => {
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

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      {/* --- Navegación --- */}
      <nav className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
        <div className="text-xl font-bold tracking-tight">VestiRápido</div>
        <div className="hidden md:flex space-x-8 items-center text-sm font-medium">
          <a href="#" className="hover:text-gray-500">Blog</a>
          <a href="#" className="hover:text-gray-500">Niños y bebés</a>
          <a href="#" className="hover:text-gray-500">Hombres</a>
          <a href="#" className="hover:text-gray-500">Mujeres</a>
          <button className="bg-black text-white px-6 py-2 rounded-sm hover:bg-gray-800 transition text-xs uppercase tracking-widest">
            Catálogo Completo
          </button>
        </div>
      </nav>

      {/* --- Contenido del Artículo --- */}
      <main className="max-w-6xl mx-auto px-6 py-16">
        <header className="mb-12">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight tracking-tight">
            Vístete para Triunfar: Cómo Tu Ropa Impulsa Tu Bienestar Psicológico
          </h1>
          <p className="text-gray-500 italic text-lg">
            Tu Armadura Invisible: Vístete para Conquistar Tu Día.
          </p>
        </header>

        {/* Sección de Estilos (Representación Visual) */}
        <section className="mb-16">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
             {['Classic', 'Dramatic', 'Sporty/Natural', 'Romantic', 'Artistic'].map((style) => (
               <div key={style} className="text-center">
                 <div className="bg-gray-100 aspect-[2/3] mb-3 rounded-sm flex items-end justify-center overflow-hidden border border-gray-50">
                    <div className="w-full h-full bg-gradient-to-t from-gray-200 to-transparent"></div>
                 </div>
                 <span className="italic font-serif text-sm text-gray-600">{style}</span>
               </div>
             ))}
          </div>
        </section>

        {/* Texto del Artículo */}
        <article className="max-w-3xl mx-auto space-y-8 text-lg leading-relaxed text-gray-700">
          <p>
            En un mundo donde la primera impresión cuenta, la forma en que nos vestimos va mucho más allá de la simple estética. 
            La moda, lejos de ser superficial, es una poderosa herramienta que influye directamente en nuestro estado de ánimo, confianza y percepción social...
          </p>
          
          <div className="pt-4">
            <h2 className="font-bold text-2xl mb-4 text-black">El Efecto de la Cognición Vestida: Vístete Inteligente, Siéntete Inteligente</h2>
            <p>
              La <strong>"cognición vestida"</strong> es un término psicológico que describe cómo la ropa que usamos puede influir en nuestros procesos cognitivos 
              y nuestro comportamiento. Un estudio de la Universidad de Northwestern encontró que cuando los participantes usaban una bata de laboratorio (asociada con la atención y precisión), su rendimiento mejoraba significativamente.
            </p>
          </div>

          <div>
            <h2 className="font-bold text-2xl mb-4 text-black">Aumento de la Autoestima y la Confianza</h2>
            <p>
              La relación entre la ropa y la autoestima es innegable. Vestir prendas que nos sientan bien y que nos gustan eleva nuestra imagen corporal 
              y nos hace sentir más atractivos y capaces. Cuando te miras al espejo y te gusta lo que ves, tu cerebro libera endorfinas.
            </p>
          </div>
        </article>

        {/* Imágenes Centrales / Ilustraciones */}
        <section className="grid md:grid-cols-2 gap-12 my-20 items-center">
          <div className="relative group">
            <img 
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=800" 
              alt="Fashion Style" 
              className="rounded-sm shadow-xl grayscale hover:grayscale-0 transition duration-500" 
            />
          </div>
          <div className="flex justify-center p-8 bg-gray-50 rounded-sm italic text-gray-400 border border-dashed border-gray-300">
             [Ilustración: Rosie the Riveter / Empoderamiento]
          </div>
        </section>

        <section className="max-w-3xl mx-auto text-center mb-24 py-12 border-y border-gray-100">
           <p className="text-xl text-gray-800">
             Te invitamos a explorar nuestro catálogo y descubrir cómo un nuevo atuendo puede ser el impulso que necesitas 
             para sentirte más seguro, feliz y preparado para enfrentar cualquier desafío. 
             <br /><span className="font-bold mt-4 block text-black">¡Vístete bien, siéntete bien y conquista el mundo!</span>
           </p>
        </section>

        {/* --- Artículos Relacionados --- */}
        <section className="border-t pt-16">
          <h2 className="text-3xl font-bold mb-10 tracking-tight">Artículos o publicaciones relacionados</h2>
          <div className="grid md:grid-cols-3 gap-10">
            {relatedPosts.map((post, index) => (
              <div key={index} className="group cursor-pointer">
                <div className="aspect-[4/3] overflow-hidden rounded-sm mb-4 bg-gray-100">
                  <img 
                    src={post.image} 
                    alt={post.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                </div>
                <h3 className="font-bold text-lg mb-2 leading-snug group-hover:text-gray-600">{post.title}</h3>
                <p className="text-gray-400 text-sm uppercase tracking-widest">{post.author}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* --- Footer --- */}
      <footer className="bg-white border-t px-8 py-20 mt-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <h2 className="text-xl font-bold mb-6">VestiRápido</h2>
            <div className="flex space-x-5 text-gray-400">
              <FaFacebookF className="cursor-pointer hover:text-black transition" />
              <FaLinkedinIn className="cursor-pointer hover:text-black transition" />
              <FaYoutube className="cursor-pointer hover:text-black transition" />
              <FaInstagram className="cursor-pointer hover:text-black transition" />
            </div>
          </div>
          
          <div>
            <h4 className="font-bold mb-5 text-sm uppercase tracking-widest">Mujeres</h4>
            <ul className="text-gray-500 space-y-3 text-sm">
              <li className="hover:text-black cursor-pointer">Formal</li>
              <li className="hover:text-black cursor-pointer">Casual</li>
              <li className="hover:text-black cursor-pointer">Hogar</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-5 text-sm uppercase tracking-widest">Hombres</h4>
            <ul className="text-gray-500 space-y-3 text-sm">
              <li className="hover:text-black cursor-pointer">Torso superior</li>
              <li className="hover:text-black cursor-pointer">Torso inferior</li>
              <li className="hover:text-black cursor-pointer">Calzado</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-5 text-sm uppercase tracking-widest">Niños y bebés</h4>
            <ul className="text-gray-500 space-y-3 text-sm">
              <li className="hover:text-black cursor-pointer">Ropa y Accesorios niños</li>
              <li className="hover:text-black cursor-pointer">Ropa para bebé</li>
              <li className="hover:text-black cursor-pointer">Accesorios para bebé</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Blog;