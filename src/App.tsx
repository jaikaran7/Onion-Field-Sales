import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./lib/auth.tsx";
import { HomeRedirect, OwnerFrame, RequireAuth, SalesmanFrame } from "./layouts/RoleRoutes.tsx";
import { LoginPage } from "./pages/LoginPage.tsx";
import { DashboardPage } from "./pages/owner/DashboardPage.tsx";
import { QualitiesPage } from "./pages/owner/QualitiesPage.tsx";
import { QualityFormPage } from "./pages/owner/QualityFormPage.tsx";
import { SalesTeamPage } from "./pages/owner/SalesTeamPage.tsx";
import { SalespersonDetailPage } from "./pages/owner/SalespersonDetailPage.tsx";
import { SalespersonFormPage } from "./pages/owner/SalespersonFormPage.tsx";
import { SettingsPage } from "./pages/owner/SettingsPage.tsx";
import { ShopTypeFormPage } from "./pages/owner/ShopTypeFormPage.tsx";
import { ShopTypesPage } from "./pages/owner/ShopTypesPage.tsx";
import { ShopsPage } from "./pages/owner/ShopsPage.tsx";
import { AddShopPage } from "./pages/salesman/AddShopPage.tsx";
import { HomePage } from "./pages/salesman/HomePage.tsx";
import { SuccessPage } from "./pages/salesman/SuccessPage.tsx";
import { VisitsPage } from "./pages/salesman/VisitsPage.tsx";
import { ShopDetailPage } from "./pages/ShopDetailPage.tsx";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<RequireAuth role="salesman" />}>
            <Route element={<SalesmanFrame />}>
              <Route path="/home" element={<HomePage />} />
              <Route path="/add" element={<AddShopPage />} />
              <Route path="/added" element={<SuccessPage />} />
              <Route path="/visits" element={<VisitsPage />} />
              <Route path="/shop/:id" element={<ShopDetailPage />} />
            </Route>
          </Route>
          <Route element={<RequireAuth role="owner" />}>
            <Route element={<OwnerFrame />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/shops" element={<ShopsPage />} />
              <Route path="/shops/:id" element={<ShopDetailPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/settings/qualities" element={<QualitiesPage />} />
              <Route path="/settings/qualities/new" element={<QualityFormPage />} />
              <Route path="/settings/qualities/:id" element={<QualityFormPage />} />
              <Route path="/settings/shop-types" element={<ShopTypesPage />} />
              <Route path="/settings/shop-types/new" element={<ShopTypeFormPage />} />
              <Route path="/settings/shop-types/:id" element={<ShopTypeFormPage />} />
              <Route path="/team" element={<SalesTeamPage />} />
              <Route path="/team/new" element={<SalespersonFormPage />} />
              <Route path="/team/:id" element={<SalespersonDetailPage />} />
              <Route path="/team/:id/edit" element={<SalespersonFormPage />} />
            </Route>
          </Route>
          <Route path="*" element={<HomeRedirect />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
