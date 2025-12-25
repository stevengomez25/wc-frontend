// src/App.jsx

// 1. Core React Router Imports (You need these for Routes and Route)
import { Routes, Route } from "react-router-dom";

// 2. Import ALL Page Components
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard"; // Must be imported
import AdminPanel from "./pages/AdminPanel";
import NotAuthorized from "./pages/NotAuthorized";
import Home from "./pages/Home";

import "./index.css";

// 3. Import Router Wrapper Components
import ProtectedRoute from "./components/ProtectedRoute"; // Must be imported
import AdminRoute from "./components/AdminRoute";
import Products from "./pages/Products";
import Logout from "./pages/Logout";
import ProductPage from "./pages/ProductPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderManagementPage from "./pages/OrderManagementPage";
import OrderConfirmation from "./pages/OrderConfirmation";
import Catalog from "./pages/Catalog";
import MensPage from "./pages/MensPage";
import WomensPage from "./pages/WomensPage";
import KidsBabiesPage from "./pages/KidsBabies";
import Blog from "./pages/Blog";

// 4. Define and Export the App Component (Fixes your main error)
function App() {
  return (
    <Routes>

      {/* Public Routes */}
      <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
      <Route path="/products/:id" element={<ProductPage />}></Route>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/not-authorized" eleme nt={<NotAuthorized />} />
      <Route path="/" element={<Home />} />
      <Route path="/logout" element={<Logout />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/catalog" element={<Catalog/>} />
      <Route path="/men" element={<MensPage/>} />
      <Route path="/women" element={<WomensPage/>} />
      <Route path="/kidsbabies" element={<KidsBabiesPage/>}/>
      <Route path="/blog" element={<Blog/>}/>
      

      {/* Normal Protected Route */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
            
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <OrderManagementPage />
          </ProtectedRoute>
        }
      />

      {/* Admin-only Route */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminPanel />
            <Products />
          </AdminRoute>
        }
      />

      {/* Add a main/home route if needed */}
      {/* <Route path="/" element={<Home />} /> */}

    </Routes>
  );
}

// 5. Export as Default (This is the crucial step that fixes the original error)
export default App;