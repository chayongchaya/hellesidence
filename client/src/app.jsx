import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Sidebar from './components/Sidebar'

// Pages - Master
import Dashboard        from './pages/Dashboard'
import HostelPage       from './pages/HostelPage'
import TenantsPage      from './pages/TenantsPage'
import RoomsPage        from './pages/RoomsPage'
import RoomTypesPage    from './pages/RoomTypesPage'
import FurniturePage    from './pages/FurniturePage'
import ProductCodesPage from './pages/ProductCodesPage'
import StaffPage        from './pages/StaffPage'
import SuppliersPage    from './pages/SuppliersPage'

// Pages - Transactions
import ContractsPage   from './pages/ContractsPage'
import ContractForm    from './features/contracts/ContractForm'
import ContractView    from './pages/ContractView'
import BillingPage     from './pages/BillingPage'
import BillingView     from './pages/BillingView'
import BillingForm     from './features/billing/BillingForm'
import PaymentsPage    from './pages/PaymentsPage'
import PaymentForm     from './features/payments/PaymentForm'
import PaymentView     from './pages/PaymentView'
import InspectionsPage from './pages/InspectionsPage'
import InspectionForm  from './features/inspections/InspectionForm'
import InspectionView  from './pages/InspectionView'
import ExpensesPage    from './pages/ExpensesPage'
import ExpenseForm     from './features/expenses/ExpenseForm'
import ExpenseView     from './pages/ExpenseView'
import MaintenancePage from './pages/MaintenancePage'
import MaintenanceForm from './features/maintenance/MaintenanceForm'
import MaintenanceView from './pages/MaintenanceView'

// Reports
import ReportsHub             from './pages/ReportsHub'
import ReportTenants          from './pages/reports/ReportTenants'
import ReportContracts        from './pages/reports/ReportContracts'
import ReportRentalIncome     from './pages/reports/ReportRentalIncome'
import ReportRooms            from './pages/reports/ReportRooms'
import ReportAvailableRooms   from './pages/reports/ReportAvailableRooms'
import ReportOccupancy        from './pages/reports/ReportOccupancy'
import ReportMaintenance               from './pages/reports/ReportMaintenance'
import ReportMaintenanceRequestVoucher from './pages/reports/ReportMaintenanceRequestVoucher'
import ReportMaintenanceCost           from './pages/reports/ReportMaintenanceCost'
import ReportMonthlyBills     from './pages/reports/ReportMonthlyBills'
import ReportBillingStatement from './pages/reports/ReportBillingStatement'
import ReportChargesByType    from './pages/reports/ReportChargesByType'
import ReportPayments         from './pages/reports/ReportPayments'
import ReportUnpaidBalances   from './pages/reports/ReportUnpaidBalances'
import ReportPaymentsByMethod from './pages/reports/ReportPaymentsByMethod'
import ReportExpenses         from './pages/reports/ReportExpenses'
import ReportExpenseVoucher   from './pages/reports/ReportExpenseVoucher'
import ReportExpensesByCat    from './pages/reports/ReportExpensesByCat'

function Layout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">{children}</div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard"     element={<Dashboard />} />
          <Route path="/hostel"        element={<HostelPage />} />
          <Route path="/tenants"       element={<TenantsPage />} />
          <Route path="/rooms"         element={<RoomsPage />} />
          <Route path="/room-types"    element={<RoomTypesPage />} />
          <Route path="/furniture"     element={<FurniturePage />} />
          <Route path="/product-codes" element={<ProductCodesPage />} />
          <Route path="/staff"         element={<StaffPage />} />
          <Route path="/suppliers"     element={<SuppliersPage />} />
          <Route path="/contracts"            element={<ContractsPage />} />
          <Route path="/contracts/new"        element={<ContractForm />} />
          <Route path="/contracts/:id/view"   element={<ContractView />} />
          <Route path="/contracts/:id/edit"   element={<ContractForm />} />
          <Route path="/billing"            element={<BillingPage />} />
          <Route path="/billing/new"        element={<BillingForm />} />
          <Route path="/billing/:id/view"   element={<BillingView />} />
          <Route path="/billing/:id/edit"   element={<BillingForm />} />
          <Route path="/payments"             element={<PaymentsPage />} />
          <Route path="/payments/new"         element={<PaymentForm />} />
          <Route path="/payments/:id/view"    element={<PaymentView />} />
          <Route path="/payments/:id/edit"    element={<PaymentForm />} />
          <Route path="/inspections"           element={<InspectionsPage />} />
          <Route path="/inspections/new"       element={<InspectionForm />} />
          <Route path="/inspections/:id/view"  element={<InspectionView />} />
          <Route path="/inspections/:id/edit"  element={<InspectionForm />} />
          <Route path="/expenses"             element={<ExpensesPage />} />
          <Route path="/expenses/new"         element={<ExpenseForm />} />
          <Route path="/expenses/:id/view"    element={<ExpenseView />} />
          <Route path="/expenses/:id/edit"    element={<ExpenseForm />} />
          <Route path="/maintenance"           element={<MaintenancePage />} />
          <Route path="/maintenance/new"       element={<MaintenanceForm />} />
          <Route path="/maintenance/:id/view"  element={<MaintenanceView />} />
          <Route path="/maintenance/:id/edit"  element={<MaintenanceForm />} />
          <Route path="/reports"                    element={<ReportsHub />} />
          <Route path="/reports/tenants"            element={<ReportTenants />} />
          <Route path="/reports/contracts"          element={<ReportContracts />} />
          <Route path="/reports/rental-income"      element={<ReportRentalIncome />} />
          <Route path="/reports/rooms"              element={<ReportRooms />} />
          <Route path="/reports/available-rooms"    element={<ReportAvailableRooms />} />
          <Route path="/reports/occupancy"          element={<ReportOccupancy />} />
          <Route path="/reports/maintenance"                  element={<ReportMaintenance />} />
          <Route path="/reports/maintenance-request-voucher" element={<ReportMaintenanceRequestVoucher />} />
          <Route path="/reports/maintenance-cost"            element={<ReportMaintenanceCost />} />
          <Route path="/reports/monthly-bills"      element={<ReportMonthlyBills />} />
          <Route path="/reports/billing-statement"  element={<ReportBillingStatement />} />
          <Route path="/reports/charges-by-type"    element={<ReportChargesByType />} />
          <Route path="/reports/payments"           element={<ReportPayments />} />
          <Route path="/reports/unpaid-balances"    element={<ReportUnpaidBalances />} />
          <Route path="/reports/payments-by-method" element={<ReportPaymentsByMethod />} />
          <Route path="/reports/expenses"           element={<ReportExpenses />} />
          <Route path="/reports/expense-voucher"    element={<ReportExpenseVoucher />} />
          <Route path="/reports/expenses-by-cat"    element={<ReportExpensesByCat />} />
        </Routes>
      </Layout>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
    </BrowserRouter>
  )
}
