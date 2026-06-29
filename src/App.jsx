import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Router, Route, Switch, Redirect, useLocation } from 'wouter';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';

import AppShell from './layouts/AppShell';

import CEODashboard from './pages/ceo/CEODashboard';
import CEOCustomers from './pages/ceo/Customers';
import CEOCustomerDetail from './pages/ceo/CustomerDetail';
import CEOEmployees from './pages/ceo/Employees';
import CEONewEmployee from './pages/ceo/NewEmployee';
import CEOEmployeeDetail from './pages/ceo/EmployeeDetail';
import CEOFinancials from './pages/ceo/Financials';
import CEOWarehouse from './pages/ceo/Warehouse';
import CEOOrders from './pages/ceo/Orders';
import CEOOrderDetail from './pages/ceo/OrderDetail';
import CEOReturns from './pages/ceo/Returns';
import CEOReports from './pages/ceo/Reports';
import CEOSettings from './pages/ceo/Settings';
import CEOAudit from './pages/ceo/Audit';
import CEOAlerts from './pages/ceo/Alerts';

import CREDashboard from './pages/cre/CREDashboard';
import CREApplications from './pages/cre/Applications';
import CREApplicationDetail from './pages/cre/ApplicationDetail';
import CRECustomers from './pages/cre/Customers';
import CRECustomerDetail from './pages/cre/CustomerDetail';
import CRETeam from './pages/cre/Team';
import CREEscalations from './pages/cre/Escalations';
import CRETickets from './pages/cre/Tickets';
import CREReports from './pages/cre/Reports';

import CREMDashboard from './pages/crem/CREMDashboard';
import CREMCustomers from './pages/crem/Customers';
import CREMCustomerActivity from './pages/crem/CustomerActivity';
import CREMLeads from './pages/crem/Leads';
import CREMNewLead from './pages/crem/NewLead';
import CREMLeadDetail from './pages/crem/LeadDetail';
import CREMVisits from './pages/crem/Visits';
import CREMFollowUps from './pages/crem/FollowUps';
import CREMTickets from './pages/crem/Tickets';
import CREMTicketDetail from './pages/crem/TicketDetail';
import CREMTasks from './pages/crem/Tasks';
import CREMReports from './pages/crem/Reports';

import AEDashboard from './pages/ae/AEDashboard';
import AEApplications from './pages/ae/Applications';
import AEApplicationDetail from './pages/ae/ApplicationDetail';
import AECustomers from './pages/ae/Customers';
import AECustomerFinancial from './pages/ae/CustomerFinancial';
import AECreditManagement from './pages/ae/CreditManagement';
import AEInvoices from './pages/ae/Invoices';
import AEInvoiceDetail from './pages/ae/InvoiceDetail';
import AEPayments from './pages/ae/Payments';
import AEPaymentReview from './pages/ae/PaymentReview';
import AEOutstanding from './pages/ae/Outstanding';
import AECollections from './pages/ae/Collections';
import AEReports from './pages/ae/Reports';

import WEDashboard from './pages/we/WEDashboard';
import WEProducts from './pages/we/Products';
import WEProductDetail from './pages/we/ProductDetail';
import WECategories from './pages/we/Categories';
import WEInventory from './pages/we/Inventory';
import WEInventoryDetail from './pages/we/InventoryDetail';
import WEOrders from './pages/we/Orders';
import WEOrderDetail from './pages/we/OrderDetail';
import WEDeliveries from './pages/we/Deliveries';
import WEReturns from './pages/we/Returns';
import WEReturnReview from './pages/we/ReturnReview';
import WEStaff from './pages/we/Staff';
import WEStaffDetail from './pages/we/StaffDetail';
import WEReports from './pages/we/Reports';

import WSDashboard from './pages/ws/WSDashboard';
import WSOrders from './pages/ws/Orders';
import WSOrderFulfillment from './pages/ws/OrderFulfillment';
import WSReturns from './pages/ws/Returns';
import WSReturnPickup from './pages/ws/ReturnPickup';

import SharedProfile from './pages/shared/Profile';
import SharedSecurity from './pages/shared/Security';
import SharedNotifications from './pages/shared/Notifications';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 2,
    },
  },
});

const ROLE_HOME = {
  CEO: '/ceo',
  CRE: '/cre',
  CREM: '/crem',
  AE: '/ae',
  WE: '/we',
  WS: '/ws',
};

function RequireAuth({ children, roles }) {
  const { user } = useAuth();
  const [location] = useLocation();

  if (!user) {
    return <Redirect to="/login" />;
  }

  if (roles && !roles.includes(user.role)) {
    const home = ROLE_HOME[user.role] || '/login';
    return <Redirect to={home} />;
  }

  return children;
}

function RootRedirect() {
  const { user } = useAuth();
  if (!user) return <Redirect to="/login" />;
  return <Redirect to={ROLE_HOME[user.role] || '/login'} />;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/">
        <RootRedirect />
      </Route>

      {/* CEO routes */}
      <Route path="/ceo">
        <RequireAuth roles={['CEO']}>
          <AppShell><CEODashboard /></AppShell>
        </RequireAuth>
      </Route>
      <Route path="/ceo/customers">
        <RequireAuth roles={['CEO']}><AppShell><CEOCustomers /></AppShell></RequireAuth>
      </Route>
      <Route path="/ceo/customers/:id">
        <RequireAuth roles={['CEO']}><AppShell><CEOCustomerDetail /></AppShell></RequireAuth>
      </Route>
      <Route path="/ceo/employees/new">
        <RequireAuth roles={['CEO']}><AppShell><CEONewEmployee /></AppShell></RequireAuth>
      </Route>
      <Route path="/ceo/employees/:id">
        <RequireAuth roles={['CEO']}><AppShell><CEOEmployeeDetail /></AppShell></RequireAuth>
      </Route>
      <Route path="/ceo/employees">
        <RequireAuth roles={['CEO']}><AppShell><CEOEmployees /></AppShell></RequireAuth>
      </Route>
      <Route path="/ceo/financials">
        <RequireAuth roles={['CEO']}><AppShell><CEOFinancials /></AppShell></RequireAuth>
      </Route>
      <Route path="/ceo/warehouse">
        <RequireAuth roles={['CEO']}><AppShell><CEOWarehouse /></AppShell></RequireAuth>
      </Route>
      <Route path="/ceo/orders/:id">
        <RequireAuth roles={['CEO']}><AppShell><CEOOrderDetail /></AppShell></RequireAuth>
      </Route>
      <Route path="/ceo/orders">
        <RequireAuth roles={['CEO']}><AppShell><CEOOrders /></AppShell></RequireAuth>
      </Route>
      <Route path="/ceo/returns">
        <RequireAuth roles={['CEO']}><AppShell><CEOReturns /></AppShell></RequireAuth>
      </Route>
      <Route path="/ceo/reports">
        <RequireAuth roles={['CEO']}><AppShell><CEOReports /></AppShell></RequireAuth>
      </Route>
      <Route path="/ceo/audit">
        <RequireAuth roles={['CEO']}><AppShell><CEOAudit /></AppShell></RequireAuth>
      </Route>
      <Route path="/ceo/alerts">
        <RequireAuth roles={['CEO']}><AppShell><CEOAlerts /></AppShell></RequireAuth>
      </Route>
      <Route path="/ceo/settings">
        <RequireAuth roles={['CEO']}><AppShell><CEOSettings /></AppShell></RequireAuth>
      </Route>

      {/* CRE routes */}
      <Route path="/cre">
        <RequireAuth roles={['CRE', 'CEO']}><AppShell><CREDashboard /></AppShell></RequireAuth>
      </Route>
      <Route path="/cre/applications/:id">
        <RequireAuth roles={['CRE', 'CEO']}><AppShell><CREApplicationDetail /></AppShell></RequireAuth>
      </Route>
      <Route path="/cre/applications">
        <RequireAuth roles={['CRE', 'CEO']}><AppShell><CREApplications /></AppShell></RequireAuth>
      </Route>
      <Route path="/cre/customers/:id">
        <RequireAuth roles={['CRE', 'CEO']}><AppShell><CRECustomerDetail /></AppShell></RequireAuth>
      </Route>
      <Route path="/cre/customers">
        <RequireAuth roles={['CRE', 'CEO']}><AppShell><CRECustomers /></AppShell></RequireAuth>
      </Route>
      <Route path="/cre/team/:id">
        <RequireAuth roles={['CRE', 'CEO']}><AppShell><CEOEmployeeDetail /></AppShell></RequireAuth>
      </Route>
      <Route path="/cre/team">
        <RequireAuth roles={['CRE', 'CEO']}><AppShell><CRETeam /></AppShell></RequireAuth>
      </Route>
      <Route path="/cre/escalations">
        <RequireAuth roles={['CRE', 'CEO']}><AppShell><CREEscalations /></AppShell></RequireAuth>
      </Route>
      <Route path="/cre/tickets">
        <RequireAuth roles={['CRE', 'CEO']}><AppShell><CRETickets /></AppShell></RequireAuth>
      </Route>
      <Route path="/cre/reports">
        <RequireAuth roles={['CRE', 'CEO']}><AppShell><CREReports /></AppShell></RequireAuth>
      </Route>

      {/* CREM routes */}
      <Route path="/crem">
        <RequireAuth roles={['CREM', 'CRE', 'CEO']}><AppShell><CREMDashboard /></AppShell></RequireAuth>
      </Route>
      <Route path="/crem/customers/:id">
        <RequireAuth roles={['CREM', 'CRE', 'CEO']}><AppShell><CREMCustomerActivity /></AppShell></RequireAuth>
      </Route>
      <Route path="/crem/customers">
        <RequireAuth roles={['CREM', 'CRE', 'CEO']}><AppShell><CREMCustomers /></AppShell></RequireAuth>
      </Route>
      <Route path="/crem/leads/new">
        <RequireAuth roles={['CREM', 'CRE', 'CEO']}><AppShell><CREMNewLead /></AppShell></RequireAuth>
      </Route>
      <Route path="/crem/leads/:id">
        <RequireAuth roles={['CREM', 'CRE', 'CEO']}><AppShell><CREMLeadDetail /></AppShell></RequireAuth>
      </Route>
      <Route path="/crem/leads">
        <RequireAuth roles={['CREM', 'CRE', 'CEO']}><AppShell><CREMLeads /></AppShell></RequireAuth>
      </Route>
      <Route path="/crem/visits">
        <RequireAuth roles={['CREM', 'CRE', 'CEO']}><AppShell><CREMVisits /></AppShell></RequireAuth>
      </Route>
      <Route path="/crem/follow-ups">
        <RequireAuth roles={['CREM', 'CRE', 'CEO']}><AppShell><CREMFollowUps /></AppShell></RequireAuth>
      </Route>
      <Route path="/crem/tickets/:id">
        <RequireAuth roles={['CREM', 'CRE', 'CEO']}><AppShell><CREMTicketDetail /></AppShell></RequireAuth>
      </Route>
      <Route path="/crem/tickets">
        <RequireAuth roles={['CREM', 'CRE', 'CEO']}><AppShell><CREMTickets /></AppShell></RequireAuth>
      </Route>
      <Route path="/crem/tasks">
        <RequireAuth roles={['CREM', 'CRE', 'CEO']}><AppShell><CREMTasks /></AppShell></RequireAuth>
      </Route>
      <Route path="/crem/reports">
        <RequireAuth roles={['CREM', 'CRE', 'CEO']}><AppShell><CREMReports /></AppShell></RequireAuth>
      </Route>

      {/* AE routes */}
      <Route path="/ae">
        <RequireAuth roles={['AE', 'CEO']}><AppShell><AEDashboard /></AppShell></RequireAuth>
      </Route>
      <Route path="/ae/applications/:id">
        <RequireAuth roles={['AE', 'CEO']}><AppShell><AEApplicationDetail /></AppShell></RequireAuth>
      </Route>
      <Route path="/ae/applications">
        <RequireAuth roles={['AE', 'CEO']}><AppShell><AEApplications /></AppShell></RequireAuth>
      </Route>
      <Route path="/ae/customers/:id/credit">
        <RequireAuth roles={['AE', 'CEO']}><AppShell><AECreditManagement /></AppShell></RequireAuth>
      </Route>
      <Route path="/ae/customers/:id">
        <RequireAuth roles={['AE', 'CEO']}><AppShell><AECustomerFinancial /></AppShell></RequireAuth>
      </Route>
      <Route path="/ae/customers">
        <RequireAuth roles={['AE', 'CEO']}><AppShell><AECustomers /></AppShell></RequireAuth>
      </Route>
      <Route path="/ae/invoices/:id">
        <RequireAuth roles={['AE', 'CEO']}><AppShell><AEInvoiceDetail /></AppShell></RequireAuth>
      </Route>
      <Route path="/ae/invoices">
        <RequireAuth roles={['AE', 'CEO']}><AppShell><AEInvoices /></AppShell></RequireAuth>
      </Route>
      <Route path="/ae/payments/:id">
        <RequireAuth roles={['AE', 'CEO']}><AppShell><AEPaymentReview /></AppShell></RequireAuth>
      </Route>
      <Route path="/ae/payments">
        <RequireAuth roles={['AE', 'CEO']}><AppShell><AEPayments /></AppShell></RequireAuth>
      </Route>
      <Route path="/ae/outstanding">
        <RequireAuth roles={['AE', 'CEO']}><AppShell><AEOutstanding /></AppShell></RequireAuth>
      </Route>
      <Route path="/ae/collections">
        <RequireAuth roles={['AE', 'CEO']}><AppShell><AECollections /></AppShell></RequireAuth>
      </Route>
      <Route path="/ae/reports">
        <RequireAuth roles={['AE', 'CEO']}><AppShell><AEReports /></AppShell></RequireAuth>
      </Route>

      {/* WE routes */}
      <Route path="/we">
        <RequireAuth roles={['WE', 'CEO']}><AppShell><WEDashboard /></AppShell></RequireAuth>
      </Route>
      <Route path="/we/products/new">
        <RequireAuth roles={['WE', 'CEO']}><AppShell><WEProductDetail /></AppShell></RequireAuth>
      </Route>
      <Route path="/we/products/:id">
        <RequireAuth roles={['WE', 'CEO']}><AppShell><WEProductDetail /></AppShell></RequireAuth>
      </Route>
      <Route path="/we/products">
        <RequireAuth roles={['WE', 'CEO']}><AppShell><WEProducts /></AppShell></RequireAuth>
      </Route>
      <Route path="/we/categories">
        <RequireAuth roles={['WE', 'CEO']}><AppShell><WECategories /></AppShell></RequireAuth>
      </Route>
      <Route path="/we/inventory/:id">
        <RequireAuth roles={['WE', 'CEO']}><AppShell><WEInventoryDetail /></AppShell></RequireAuth>
      </Route>
      <Route path="/we/inventory">
        <RequireAuth roles={['WE', 'CEO']}><AppShell><WEInventory /></AppShell></RequireAuth>
      </Route>
      <Route path="/we/orders/:id">
        <RequireAuth roles={['WE', 'CEO']}><AppShell><WEOrderDetail /></AppShell></RequireAuth>
      </Route>
      <Route path="/we/orders">
        <RequireAuth roles={['WE', 'CEO']}><AppShell><WEOrders /></AppShell></RequireAuth>
      </Route>
      <Route path="/we/deliveries">
        <RequireAuth roles={['WE', 'CEO']}><AppShell><WEDeliveries /></AppShell></RequireAuth>
      </Route>
      <Route path="/we/returns/:id">
        <RequireAuth roles={['WE', 'CEO']}><AppShell><WEReturnReview /></AppShell></RequireAuth>
      </Route>
      <Route path="/we/returns">
        <RequireAuth roles={['WE', 'CEO']}><AppShell><WEReturns /></AppShell></RequireAuth>
      </Route>
      <Route path="/we/staff/:id">
        <RequireAuth roles={['WE', 'CEO']}><AppShell><WEStaffDetail /></AppShell></RequireAuth>
      </Route>
      <Route path="/we/staff">
        <RequireAuth roles={['WE', 'CEO']}><AppShell><WEStaff /></AppShell></RequireAuth>
      </Route>
      <Route path="/we/reports">
        <RequireAuth roles={['WE', 'CEO']}><AppShell><WEReports /></AppShell></RequireAuth>
      </Route>

      {/* WS routes */}
      <Route path="/ws">
        <RequireAuth roles={['WS', 'WE', 'CEO']}><AppShell><WSDashboard /></AppShell></RequireAuth>
      </Route>
      <Route path="/ws/orders/:id">
        <RequireAuth roles={['WS', 'WE', 'CEO']}><AppShell><WSOrderFulfillment /></AppShell></RequireAuth>
      </Route>
      <Route path="/ws/orders">
        <RequireAuth roles={['WS', 'WE', 'CEO']}><AppShell><WSOrders /></AppShell></RequireAuth>
      </Route>
      <Route path="/ws/returns/:id">
        <RequireAuth roles={['WS', 'WE', 'CEO']}><AppShell><WSReturnPickup /></AppShell></RequireAuth>
      </Route>
      <Route path="/ws/returns">
        <RequireAuth roles={['WS', 'WE', 'CEO']}><AppShell><WSReturns /></AppShell></RequireAuth>
      </Route>

      {/* Shared routes */}
      <Route path="/profile">
        <RequireAuth><AppShell><SharedProfile /></AppShell></RequireAuth>
      </Route>
      <Route path="/profile/security">
        <RequireAuth><AppShell><SharedSecurity /></AppShell></RequireAuth>
      </Route>
      <Route path="/notifications">
        <RequireAuth><AppShell><SharedNotifications /></AppShell></RequireAuth>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}
