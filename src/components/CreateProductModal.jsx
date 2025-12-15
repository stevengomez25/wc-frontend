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

  // 2. Estado para la lista de Tallas (solo nombres, sin stock aquí)
  const [availableSizes, setAvailableSizes] = useState([]); // Array de strings: ["S", "M", "L"]
  // Estado temporal para la nueva talla a agregar
  const [newSizeName, setNewSizeName] = useState("");

  // 3. Estado para la lista de Colores (solo nombres, sin stock aquí)
  const [availableColors, setAvailableColors] = useState([]); // Array de strings: ["Rojo", "Azul"]
  // Estado temporal para el nuevo color a agregar
  const [newColorName, setNewColorName] = useState("");

  const [message, setMessage] = useState("");

  // --- Funciones de Manejo General ---
  const handleChange = (e) => {
    // Manejo de inputs del formulario principal
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  
  // --- Funciones de Tallas (Solo nombres) ---

  const handleNewSizeChange = (e) => {
    setNewSizeName(e.target.value);
  };

  const handleAddSize = () => {
    const trimmedSize = newSizeName.trim().toUpperCase();

    // Comprobamos que el nombre no esté vacío y no exista ya
    if (trimmedSize && !availableSizes.includes(trimmedSize)) {
      setAvailableSizes([...availableSizes, trimmedSize]);
      setNewSizeName(""); // Limpiar input
    } else if (availableSizes.includes(trimmedSize)) {
      setMessage(`La talla ${trimmedSize} ya ha sido agregada.`);
    }
  };

  const handleRemoveSize = (sizeNameToRemove) => {
    setAvailableSizes(availableSizes.filter(s => s !== sizeNameToRemove));
  };
  
  // --- Funciones de Colores (Solo nombres) ---

  const handleNewColorChange = (e) => {
    setNewColorName(e.target.value);
  };

  const handleAddColor = () => {
    const trimmedColor = newColorName.trim();

    // Comprobamos que el nombre no esté vacío y no exista ya (comparación case-insensitive)
    const exists = availableColors.some(c => c.toUpperCase() === trimmedColor.toUpperCase());

    if (trimmedColor && !exists) {
      setAvailableColors([...availableColors, trimmedColor]);
      setNewColorName(""); // Limpiar input
    } else if (exists) {
      setMessage(`El color ${trimmedColor} ya ha sido agregado.`);
    }
  };

  const handleRemoveColor = (colorNameToRemove) => {
    setAvailableColors(availableColors.filter(c => c !== colorNameToRemove));
  };

  // --- Función de Envío Final ---

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Usar valores por defecto si no se especifican tallas o colores, para crear al menos una variante "N/A"
    const sizes = availableSizes.length > 0 ? availableSizes : ["N/A"];
    const colors = availableColors.length > 0 ? availableColors : ["N/A"];

    if (sizes[0] === "N/A" && colors[0] === "N/A") {
      setMessage("Debes agregar al menos una talla O un color para crear el producto.");
      return;
    }
    
    if (!form.name || !form.code || !form.cost) {
      setMessage("Error: Los campos Nombre, Código y Costo son obligatorios.");
      return;
    }

    // 1. Generar el array de VARIANTS (Combinación Talla x Color)
    const productCodeBase = form.code.trim().toUpperCase();
    const variants = [];
    let variantIndex = 1;
    let totalStock = 0;

    for (const sizeName of sizes) {
      for (const colorName of colors) {
        // Generar un SKU único concatenando el código base y los atributos.
        // Se recomienda usar una función de indexación para SKUs reales, pero para este caso es suficiente:
        const sizeSlug = sizeName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        const colorSlug = colorName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        const sku = `${productCodeBase}-${sizeSlug}-${colorSlug}`.substring(0, 50);

        variants.push({
          sku: sku,
          sizeName: sizeName,
          colorName: colorName,
          quantity: 0, // Stock inicial es 0, ya que el usuario no ingresó stock por combinación.
        });
        variantIndex++;
      }
    }
    
    // 2. Preparar el objeto final para el backend
    try {
      const productData = {
        ...form,
        // ¡Usamos el array combinado 'variants' y el campo 'stock'!
        variants: variants,
        stock: totalStock, 
      };

      const data = await createProduct(productData);

      if (data.ok) {
        setMessage("¡Producto creado con éxito!");
        reload();
        setTimeout(() => close(), 800);
      } else {
        setMessage(data.message || "Error al crear el producto.");
      }
    } catch (err) {
      setMessage("Error del servidor al intentar crear el producto.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-xl p-6 animate-fadeIn">

        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Crear Producto
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* CAMPOS PRINCIPALES */}
          <input name="name" placeholder="Product Name (Requerido)" onChange={handleChange} className="w-full border p-2 rounded-md" required />
          <input name="code" placeholder="Product Code (Requerido)" onChange={handleChange} className="w-full border p-2 rounded-md" required />
          <input name="cost" type="number" placeholder="Cost (Requerido)" onChange={handleChange} className="w-full border p-2 rounded-md" required min="0" />
          <textarea name="description" placeholder="Description" rows={3} onChange={handleChange} className="w-full border p-2 rounded-md" />
          
          {/* === CAMPO DINÁMICO DE TALLAS (Solo nombres) === */}
          {/* Se elimina el input de 'Stock' de esta sección */}
          <div className="border border-gray-300 p-3 rounded-md bg-gray-50">
            <label className="block text-base font-semibold text-gray-800 mb-2">📐 Tallas disponibles:</label>

            <div className="flex space-x-2 mb-3 items-end">
              <div className="flex-grow">
                <label className="text-xs text-gray-500 block">Talla (Ej: S, M, XL)</label>
                <input
                  type="text"
                  name="sizeName"
                  value={newSizeName}
                  onChange={handleNewSizeChange}
                  placeholder="Talla"
                  className="w-full border p-2 rounded-md"
                />
              </div>
              
              {/* SECCIÓN DE STOCK ELIMINADA */}
              
              <button
                type="button"
                onClick={handleAddSize}
                className="bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 transition h-[42px]"
              >
                ➕
              </button>
            </div>

            {/* Lista de Tallas Añadidas */}
            <div className="flex flex-col gap-2 max-h-40 overflow-y-auto">
              {availableSizes.map((sizeName) => (
                <div
                  key={sizeName}
                  className="flex justify-between items-center bg-white border border-dashed text-gray-800 text-sm px-3 py-2 rounded-md shadow-sm"
                >
                  <span className="font-medium">
                    Talla: {sizeName}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSize(sizeName)}
                    className="text-red-500 hover:text-red-700 font-bold ml-4 text-lg"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            {availableSizes.length === 0 && (
              <p className="text-sm text-gray-500 italic mt-2 text-center">Añade al menos una talla, o usa la sección de colores.</p>
            )}
          </div>
          {/* ========================================================= */}
          
          {/* === CAMPO DINÁMICO DE COLORES (Solo nombres) === */}
          {/* Se elimina el input de 'Stock' de esta sección */}
          <div className="border border-gray-300 p-3 rounded-md bg-gray-50">
            <label className="block text-base font-semibold text-gray-800 mb-2">🎨 Colores disponibles:</label>

            <div className="flex space-x-2 mb-3 items-end">
              <div className="flex-grow">
                <label className="text-xs text-gray-500 block">Color (Ej: Rojo, Azul)</label>
                <input
                  type="text"
                  name="colorName"
                  value={newColorName}
                  onChange={handleNewColorChange}
                  placeholder="Color"
                  className="w-full border p-2 rounded-md"
                />
              </div>
              
              {/* SECCIÓN DE STOCK ELIMINADA */}

              <button
                type="button"
                onClick={handleAddColor}
                className="bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 transition h-[42px]"
              >
                ➕
              </button>
            </div>

            {/* Lista de Colores Añadidos */}
            <div className="flex flex-col gap-2 max-h-40 overflow-y-auto">
              {availableColors.map((colorName) => (
                <div
                  key={colorName}
                  className="flex justify-between items-center bg-white border border-dashed text-gray-800 text-sm px-3 py-2 rounded-md shadow-sm"
                >
                  <span className="font-medium">
                    Color: {colorName}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveColor(colorName)}
                    className="text-red-500 hover:text-red-700 font-bold ml-4 text-lg"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            {availableColors.length === 0 && (
              <p className="text-sm text-gray-500 italic mt-2 text-center">Añade al menos un color, o usa la sección de tallas.</p>
            )}
          </div>
          {/* ========================================================= */}
          
          <input name="image" placeholder="Image URL (optional)" onChange={handleChange} className="w-full border p-2 rounded-md" />

          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition mt-6">
            Crear Producto y sus Variantes
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