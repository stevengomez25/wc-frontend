import { useState, useEffect } from "react";
// ASUME que crearás esta función de API
import { updateProduct } from "../api/products";

// Recibe el objeto del producto y las funciones de control
export default function EditProductModal({ close, reload, productToEdit }) {
  // 1. Estados Iniciales: Cargar los datos simples del producto
  const [form, setForm] = useState({
    name: productToEdit.name || "",
    code: productToEdit.code || "",
    cost: productToEdit.cost || 0,
    description: productToEdit.description || "",
    image: productToEdit.image || "",
  });

  // 2. 🎯 Estado para el array unificado de variantes (SKU)
  // Carga los datos de 'variants' del producto a editar
  const [variants, setVariants] = useState(productToEdit.variants || []);

  // 3. Estado temporal para añadir una nueva variante
  const [newVariantData, setNewVariantData] = useState({
    sku: "",
    sizeName: "",
    colorName: "",
    quantity: 0,
  });

  const [message, setMessage] = useState("");

  // Sincronización (si la prop productToEdit cambia)
  useEffect(() => {
    setForm({
      name: productToEdit.name || "",
      code: productToEdit.code || "",
      cost: productToEdit.cost || 0,
      description: productToEdit.description || "",
      image: productToEdit.image || "",
    });
    setVariants(productToEdit.variants || []);
  }, [productToEdit]);


  // --- Funciones de Manejo General ---
  const handleChange = (e) => {
    const value = e.target.type === "number" ? parseFloat(e.target.value) : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };
  
  // --- Funciones de Variantes (SKU) ---

  const handleNewVariantChange = (e) => {
    let value = e.target.value;
    if (e.target.name === 'quantity') {
      value = parseInt(e.target.value, 10) || 0;
    } else if (e.target.name === 'sizeName') {
      // Opcional: forzar mayúsculas para la talla aquí
      value = value.toUpperCase(); 
    }
    setNewVariantData({ ...newVariantData, [e.target.name]: value });
  };

  const handleAddVariant = () => {
    const { sku, sizeName, colorName, quantity } = newVariantData;
    const trimmedSku = sku.trim();

    if (trimmedSku && sizeName.trim() && colorName.trim() && quantity >= 0) {
      // Verificar unicidad del SKU en el frontend
      const existingVariant = variants.find(v => v.sku === trimmedSku);
      if (existingVariant) {
        setMessage(`El SKU ${trimmedSku} ya existe. Usa la lista para editar su stock.`);
        return;
      }

      // Añadir la nueva variante
      setVariants([...variants, { sku: trimmedSku, sizeName: sizeName.trim(), colorName: colorName.trim(), quantity }]);
      setNewVariantData({ sku: "", sizeName: "", colorName: "", quantity: 0 }); // Limpiar formulario
    } else {
      setMessage("Debes completar SKU, Talla, Color y Stock para añadir una variante.");
    }
  };

  const handleRemoveVariant = (skuToRemove) => {
    setVariants(variants.filter(v => v.sku !== skuToRemove));
  };
  
  // Función para editar el stock de una variante existente directamente
  const handleEditVariantQuantity = (sku, newQuantity) => {
    setVariants(variants.map(v => 
      v.sku === sku ? { ...v, quantity: parseInt(newQuantity, 10) || 0 } : v
    ));
  };


  // --- Función de Envío Final ---

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // 3. 🎯 Sincronizar: Incluir el array 'variants' editado
      const productData = {
        ...form,
        variants: variants, // 👈 ¡Campo clave para el nuevo esquema!
        // Ya no enviamos availableSizes ni availableColors
      };

      // Enviar el ID del producto y los datos actualizados
      const data = await updateProduct(productToEdit._id, productData); 

      if (data.ok) {
        setMessage("Product updated successfully!");
        reload();
        setTimeout(() => close(), 800);
      } else {
        setMessage(data.message || "Error updating product");
      }
    } catch (err) {
      setMessage("Server error during update");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-xl p-6 animate-fadeIn">

        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Edit Product: {productToEdit.name}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* CAMPOS PRINCIPALES */}
          <div className="grid grid-cols-2 gap-4">
            <input name="name" placeholder="Product Name" value={form.name || ""} onChange={handleChange} className="w-full border p-2 rounded-md" required />
            <input name="code" placeholder="Product Code" value={form.code || ""} onChange={handleChange} className="w-full border p-2 rounded-md" required />
            <input name="cost" type="number" placeholder="Cost" value={form.cost || 0} onChange={handleChange} min="0" className="w-full border p-2 rounded-md" required />
          </div>
          
          <textarea name="description" placeholder="Description" rows={3} value={form.description || ""} onChange={handleChange} className="w-full border p-2 rounded-md" />
          <input name="image" placeholder="Image URL (optional)" value={form.image || ""} onChange={handleChange} className="w-full border p-2 rounded-md" />

<div className="w-full border p-2 rounded-md">
                <label className="text-xs text-gray-500">Category</label>
                <select
                  name="category"
                  onChange={handleChange}
                  className="w-full border p-2 rounded-md"
                >
                  <option value="" disabled selected>{productToEdit.category} ( Actual )</option>
                  <option value="men">hombre</option>
                  <option value="women">mujer</option>
                  <option value="kids">niños</option>
                  <option value="babies">bebés</option>
                  <option value="misc">misceláneo</option>
                </select>
              </div>

          {/* === CAMPO DINÁMICO DE VARIANTES (SKU) === */}
          <div className="border border-gray-300 p-4 rounded-md bg-gray-50">
            <label className="block text-base font-bold text-gray-800 mb-3">📦 Gestión de Variantes (SKU):</label>

            {/* Lista de Variantes Añadidas/Existentes */}
            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto mb-4 border p-2 bg-white rounded-md">
              {variants.length > 0 ? (
                variants.map((v) => (
                  <div
                    key={v.sku}
                    className="flex justify-between items-center bg-gray-100 border text-gray-800 text-sm px-3 py-2 rounded-lg shadow-sm"
                  >
                    {/* Info de Variante */}
                    <div className="flex flex-col flex-grow">
                      <span className="font-semibold text-xs text-blue-600">SKU: {v.sku}</span>
                      <span className="font-medium text-sm">
                        Talla: {v.sizeName} / Color: {v.colorName}
                      </span>
                    </div>
                    
                    {/* Input de Cantidad y Botón de Eliminar */}
                    <div className="flex items-center space-x-2 ml-4">
                      <span className="text-xs font-semibold">Stock:</span>
                      <input
                        type="number"
                        value={v.quantity}
                        min="0"
                        onChange={(e) => handleEditVariantQuantity(v.sku, e.target.value)}
                        className="w-16 border p-1 rounded-md text-right focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(v.sku)}
                        className="text-red-500 hover:text-red-700 font-bold text-lg p-1 transition"
                      >
                        ×
                      </button>
                  </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 italic">No hay variantes definidas. Añade una nueva combinación.</p>
              )}
            </div>
            
            {/* Input para AÑADIR NUEVA VARIANTE */}
            <div className="grid grid-cols-5 gap-2 items-end pt-3 border-t border-gray-200">
              {/* SKU */}
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-700">SKU Único</label>
                <input
                  type="text"
                  name="sku"
                  value={newVariantData.sku}
                  onChange={handleNewVariantChange}
                  placeholder="Ej: POLO-M-AZ"
                  className="w-full border p-2 rounded-md"
                />
              </div>

              {/* Talla */}
              <div>
                <label className="block text-xs font-medium text-gray-700">Talla</label>
                <input
                  type="text"
                  name="sizeName"
                  value={newVariantData.sizeName}
                  onChange={handleNewVariantChange}
                  placeholder="M"
                  className="w-full border p-2 rounded-md"
                />
              </div>

              {/* Color */}
              <div>
                <label className="block text-xs font-medium text-gray-700">Color</label>
                <input
                  type="text"
                  name="colorName"
                  value={newVariantData.colorName}
                  onChange={handleNewVariantChange}
                  placeholder="Azul"
                  className="w-full border p-2 rounded-md"
                />
              </div>

              {/* Cantidad (Stock) */}
              <div className="flex space-x-2">
                <div className="w-16">
                  <label className="block text-xs font-medium text-gray-700">Stock</label>
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
                  className="bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 transition h-[42px] self-end"
                >
                  ➕
                </button>
              </div>
            </div>
          </div>
          {/* ========================================================= */}

          <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition mt-6">
            Actualizar Producto
          </button>
        </form>

        {message && (
          <p className={`text-center mt-3 font-medium ${message.includes('Error') || message.includes('SKU') ? 'text-red-600' : 'text-green-600'}`}>{message}</p>
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