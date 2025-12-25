import React from 'react';
import { Facebook, Linkedin, Youtube, Instagram } from 'lucide-react';

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
        <div className="text-xl font-bold">VestiRápido</div>
        <div className="hidden md:flex space-x-8 items-center text-sm font-medium">
          <a href="#" className="hover:text-gray-500">Blog</a>
          <a href="#" className="hover:text-gray-500">Niños y bebés</a>
          <a href="#" className="hover:text-gray-500">Hombres</a>
          <a href="#" className="hover:text-gray-500">Mujeres</a>
          <button className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition">
            Catálogo Completo
          </button>
        </div>
      </nav>

      {/* --- Contenido del Artículo --- */}
      <main className="max-w-5xl mx-auto px-6 py-16">
        <header className="mb-12">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
            Vístete para Triunfar: Cómo Tu Ropa Impulsa Tu Bienestar Psicológico
          </h1>
          <p className="text-gray-500 italic text-lg">
            Tu Armadura Invisible: Vístete para Conquistar Tu Día.
          </p>
        </header>

        {/* Imagen Estilos (Placeholder representación) */}
        <section className="mb-16">
          <div className="grid grid-cols-5 gap-4">
             {/* Aquí irían las ilustraciones de Classic, Dramatic, etc. */}
             {['Classic', 'Dramatic', 'Sporty/Natural', 'Romantic', 'Artistic'].map((style) => (
               <div key={style} className="text-center">
                 <div className="bg-gray-100 h-64 mb-2 rounded-lg flex items-end justify-center overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-t from-gray-200 to-transparent"></div>
                 </div>
                 <span className="italic font-serif text-sm">{style}</span>
               </div>
             ))}
          </div>
        </section>

        {/* Texto del Artículo */}
        <article className="max-w-3xl mx-auto space-y-8 text-lg leading-relaxed text-gray-800">
          <p>
            En un mundo donde la primera impresión cuenta, la forma en que nos vestimos va mucho más allá de la simple estética. 
            La moda, lejos de ser superficial, es una poderosa herramienta que influye directamente en nuestro estado de ánimo...
          </p>
          
          <div>
            <h2 className="font-bold text-xl mb-2">El Efecto de la Cognición Vestida: Vístete Inteligente, Siéntete Inteligente</h2>
            <p>
              La "cognición vestida" es un término psicológico que describe cómo la ropa que usamos puede influir en nuestros procesos cognitivos 
              y nuestro comportamiento. Un estudio de la Universidad de Northwestern encontró que cuando los participantes usaban una bata de laboratorio...
            </p>
          </div>

          <div>
            <h2 className="font-bold text-xl mb-2">Aumento de la Autoestima y la Confianza</h2>
            <p>
              La relación entre la ropa y la autoestima es innegable. Vestir prendas que nos sientan bien y que nos gustan eleva nuestra imagen corporal 
              y nos hace sentir más atractivos y capaces.
            </p>
          </div>
        </article>

        {/* Imágenes Centrales */}
        <section className="grid md:grid-cols-2 gap-8 my-16 items-center">
          <div className="bg-gray-50 p-4 rounded-xl">
            <img src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=800" alt="Fashion collage" className="rounded-lg shadow-lg" />
          </div>
          <div className="bg-gray-50 p-4 rounded-xl flex justify-center">
             <div className="w-64 h-64 bg-blue-100 rounded-full flex items-center justify-center text-blue-800 font-bold">
               [Ilustración Empoderamiento]
             </div>
          </div>
        </section>

        <section className="max-w-3xl mx-auto text-center mb-24">
           <p className="text-lg mb-8">
             Te invitamos a explorar nuestro catálogo y descubrir cómo un nuevo atuendo puede ser el impulso que necesitas 
             para sentirte más seguro, feliz y preparado para enfrentar cualquier desafío.
           </p>
        </section>

        {/* --- Artículos Relacionados --- */}
        <section className="border-t pt-16">
          <h2 className="text-3xl font-bold mb-10">Artículos o publicaciones relacionados</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {relatedPosts.map((post, index) => (
              <div key={index} className="group cursor-pointer">
                <div className="aspect-video overflow-hidden rounded-lg mb-4">
                  <img 
                    src={post.image} 
                    alt={post.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>
                <h3 className="font-bold text-lg mb-2 group-hover:underline">{post.title}</h3>
                <p className="text-gray-500 text-sm">{post.author}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* --- Footer --- */}
      <footer className="bg-white border-t px-8 py-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <h2 className="text-xl font-bold mb-6">VestiRápido</h2>
            <div className="flex space-x-4 text-gray-600">
              <Facebook size={20} className="cursor-pointer hover:text-black" />
              <Linkedin size={20} className="cursor-pointer hover:text-black" />
              <Youtube size={20} className="cursor-pointer hover:text-black" />
              <Instagram size={20} className="cursor-pointer hover:text-black" />
            </div>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">Mujeres</h4>
            <ul className="text-gray-500 space-y-2 text-sm">
              <li>Formal</li>
              <li>Casual</li>
              <li>Hogar</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Hombres</h4>
            <ul className="text-gray-500 space-y-2 text-sm">
              <li>Torso superior</li>
              <li>Torso inferior</li>
              <li>Calzado</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Niños y bebés</h4>
            <ul className="text-gray-500 space-y-2 text-sm">
              <li>Ropa y Accesorios niños</li>
              <li>Ropa para bebé</li>
              <li>Accesorios para bebé</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Blog;