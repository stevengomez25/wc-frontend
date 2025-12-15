import { useState } from "react";
import { createProduct } from "../api/products";

export default function CreateProductModal({ close, reload }) {
  // 1. Estado para el formulario principal (campos simples)
  const [form, setForm] = useState({
    name: "",
    code: "",
    cost: "",
    description: "",
    image: "",
  });

  // 2. Estado centralizado para las Variantes (Talla, Color, Stock)
  // Este array se mapea directamente al campo 'variants' de Mongoose.
  const [variants, setVariants] = useState([]); 

  // 3. Estado temporal para la nueva variante a agregar
  const [newVariantData, setNewVariantData] = useState({
    sizeName: "",
    colorName: "",
    quantity: 0
  });

  const [message, setMessage] = useState("");

  // --- Funciones de Manejo General ---
  const handleChange = (e) => {
    // Manejo de inputs del formulario principal
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  
  // --- Funciones de Manejo de Variantes ---

  const handleNewVariantChange = (e) => {
    const { name, value } = e.target;
    
    const processedValue = name === 'quantity'
      ? parseInt(value, 10) || 0
      : value;

    setNewVariantData({
      ...newVariantData,
      [name]: processedValue
    });
  };

  const handleAddVariant = () => {
    const { sizeName, colorName, quantity } = newVariantData;
    
    // Limpieza y estandarización
    const trimmedSize = sizeName.trim().toUpperCase();
    const trimmedColor = colorName.trim();
    
    if (!trimmedSize || !trimmedColor || quantity < 0) {
      setMessage("Debes especificar Talla, Color y Stock (>= 0).");
      return;
    }

    // Comprobar duplicados (misma talla Y mismo color)
    const existingVariant = variants.find(v => 
      v.sizeName === trimmedSize && v.colorName.toUpperCase() === trimmedColor.toUpperCase()
    );

    if (existingVariant) {
      setMessage(`La variante Talla: ${trimmedSize} y Color: ${trimmedColor} ya ha sido agregada.`);
      return;
    }
    
    // 1. Generar un SKU básico para esta nueva variante (usaremos el código del producto al final)
    // El SKU completo se generará en handleSubmit, pero verificamos que al menos los datos base estén listos.
    
    setVariants([
      ...variants,
      { 
        sizeName: trimmedSize, 
        colorName: trimmedColor, 
        quantity: quantity 
      }
    ]);
    
    // Limpiar el estado temporal
    setNewVariantData({ sizeName: "", colorName: "", quantity: 0 });
    setMessage("");
  };

  const handleRemoveVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  // --- Función de Envío Final ---

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.code || !form.cost) {
      setMessage("Error: Los campos Nombre, Código y Costo son obligatorios.");
      return;
    }

    if (variants.length === 0) {
      setMessage("Debes agregar al menos una variante (Talla, Color y Stock).");
      return;
    }

    // 1. Procesar variantes: Generar SKU y calcular stock total
    const productCodeBase = form.code.trim().toUpperCase();
    let totalStock = 0;
    
    const processedVariants = variants.map((variant, index) => {
      // Usar slugging simple para el SKU
      const sizeSlug = variant.sizeName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      const colorSlug = variant.colorName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      const sku = `${productCodeBase}-${sizeSlug}-${colorSlug}`; // Generar SKU
      
      totalStock += variant.quantity; // Sumar al stock total

      return {
        ...variant,
        sku: sku,
      };
    });

    try {
      const productData = {
        ...form,
        variants: processedVariants, // Array con SKU incluido
        stock: totalStock, // Stock total calculado
      };

      const data = await createProduct(productData);

      if (data.ok) {
        setMessage("¡Producto y variantes creados con éxito!");
        reload();
        setTimeout(() => close(), 800);
      } else {
        setMessage(data.message || "Error al crear el producto. Verifique si el Código del producto ya existe.");
      }
    } catch (err) {
      setMessage("Error del servidor");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-xl p-6 animate-fadeIn">

        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Crear Producto con Variantes
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* CAMPOS PRINCIPALES */}
          <input name="name" placeholder="Product Name (Requerido)" onChange={handleChange} className="w-full border p-2 rounded-md" required />
          <input name="code" placeholder="Product Code (Requerido)" onChange={handleChange} className="w-full border p-2 rounded-md" required />
          <input name="cost" type="number" placeholder="Cost (Requerido)" onChange={handleChange} className="w-full border p-2 rounded-md" required min="0" />
          <textarea name="description" placeholder="Description" rows={3} onChange={handleChange} className="w-full border p-2 rounded-md" />
          <input name="image" placeholder="Image URL (opcional)" onChange={handleChange} className="w-full border p-2 rounded-md" />

          {/* === CAMPO DINÁMICO DE VARIANTES (Talla + Color + Stock) === */}
          <div className="border border-indigo-300 p-3 rounded-md bg-indigo-50">
            <label className="block text-base font-semibold text-gray-800 mb-2">📋 Añadir Variante (Talla, Color, Stock):</label>

            <div className="flex space-x-2 mb-3 items-end">
              
              {/* TALLA */}
              <div className="flex-1">
                <label className="text-xs text-gray-500 block">Talla (Ej: S)</label>
                <input
                  type="text"
                  name="sizeName"
                  value={newVariantData.sizeName}
                  onChange={handleNewVariantChange}
                  placeholder="Talla"
                  className="w-full border p-2 rounded-md"
                />
              </div>
              
              {/* COLOR */}
              <div className="flex-1">
                <label className="text-xs text-gray-500 block">Color (Ej: Rojo)</label>
                <input
                  type="text"
                  name="colorName"
                  value={newVariantData.colorName}
                  onChange={handleNewVariantChange}
                  placeholder="Color"
                  className="w-full border p-2 rounded-md"
                />
              </div>
              
              {/* STOCK */}
              <div className="w-24">
                <label className="text-xs text-gray-500 block">Stock</label>
                <input
                  type="number"
                  name="quantity"
                  value={newVariantData.quantity}
                  onChange={handleNewVariantChange}
                  placeholder="0"
                  min="0"
                  className="w-full border p-2 rounded-md"
                />
              </div>

              <button
                type="button"
                onClick={handleAddVariant}
                className="bg-indigo-600 text-white px-3 py-2 rounded-md hover:bg-indigo-700 transition h-[42px]"
              >
                ➕
              </button>
            </div>

            {/* Lista de Variantes Añadidas */}
            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
              {variants.map((v, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center bg-white border border-dashed text-gray-800 text-sm px-3 py-2 rounded-md shadow-sm"
                >
                  <span className="font-medium">
                    Talla: {v.sizeName} | Color: {v.colorName} | Stock: {v.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveVariant(index)}
                    className="text-red-500 hover:text-red-700 font-bold ml-4 text-lg"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            {variants.length === 0 && (
              <p className="text-sm text-gray-500 italic mt-2 text-center">Añade al menos una variante (combinación Talla, Color y Stock).</p>
            )}
          </div>
          {/* ========================================================= */}
          
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition mt-6">
            Crear Producto ({variants.length} Variantes)
          </button>
        </form>

        {/* Mensaje de estado */}
        {message && (
          <p className={`text-center mt-3 font-medium ${message.includes('Error') || message.includes('ya ha sido agregada') ? 'text-red-600' : 'text-green-600'}`}>{message}</p>
        )}

        <button
          onClick={close}
          className="mt-4 text-center w-full text-gray-600 hover:underline"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}