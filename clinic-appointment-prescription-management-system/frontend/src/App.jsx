
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import InventoryDashboard from "./pages/InventoryDashboard";
import MedicineList from "./pages/pharmacy-inventory/Medicine-Inventory/MedicineList";
import InsertMedicine from "./pages/pharmacy-inventory/Medicine-Inventory/InsertMedicine";
import UpdateMedicine from "./pages/pharmacy-inventory/Medicine-Inventory/UpdateMedicine";
import DeleteMedicine from "./pages/pharmacy-inventory/Medicine-Inventory/DeleteMedicine";
import LabItemList from "./pages/pharmacy-inventory/Lab-Inventory/LabItemList";
import InsertLabItem from "./pages/pharmacy-inventory/Lab-Inventory/InsertLabItem";
import UpdateLabItem from "./pages/pharmacy-inventory/Lab-Inventory/UpdateLabItem";
import DeleteLabItem from "./pages/pharmacy-inventory/Lab-Inventory/DeleteLabItem";
import OrdersPage from "./pages/OrdersPage";
import PharmacistDashboard from "./pages/pharmacy-inventory/PharmacistDashboard";
import InventoryManagerProfile from "./components/InventoryManagerProfile";
import PharmacistProfile from "./components/PharmacistProfile";
import "./components/Sidebar/Sidebar.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<InventoryDashboard />} />
        <Route path="/dashboard" element={<InventoryDashboard />} />
        <Route path="/medicine/list" element={<MedicineList />} />
        <Route path="/medicine/add" element={<InsertMedicine />} />
        <Route path="/medicine/edit/:id" element={<UpdateMedicine />} />
        <Route path="/medicine/delete/:id" element={<DeleteMedicine />} />
        <Route path="/lab/list" element={<LabItemList />} />
        <Route path="/lab/add" element={<InsertLabItem />} />
        <Route path="/lab/edit/:id" element={<UpdateLabItem />} />
        <Route path="/lab/delete/:id" element={<DeleteLabItem />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/pharmacist/dashboard" element={<PharmacistDashboard />} />
        <Route path="/inventory-manager-profile" element={<InventoryManagerProfile />} />
        <Route path="/pharmacist-profile" element={<PharmacistProfile />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
