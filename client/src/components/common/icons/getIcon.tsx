import {
  Dashboard as DashboardIcon,
  LocalShipping as TruckIcon,
  Send as SendIcon,
  Add as PlusIcon,
  Edit as EditIcon,
  People as UsersIcon,
  Description as FileIcon,
  AttachMoney as AttachMoneyIcon,
  Payment as PaymentIcon,
  Business as BusinessIcon,
  Group as GroupIcon,
  AccountBalanceWallet as AccountBalanceWalletIcon,
  MonetizationOn as SalesIcon,
  ReceiptLong as InvoiceIcon,
  RequestQuote as EstimatesIcon,
  Gavel as TaxIcon, // Tax substitute (closest in MUI)
  ProductionQuantityLimits as ProductIcon,
  Store as ShopIcon,
  Receipt as BillIcon, // 👈 Bill icon
  Handshake as VendorIcon, // 👈 Available in MUI v5+
  AccountTree as ChartAccountsIcon,
  MenuBook as JournalEntryIcon,
} from "@mui/icons-material";

export const getIcon = (iconName?: string): React.ReactElement | null => {
  if (!iconName) return null;

  const iconMap: Record<string, React.ReactElement> = {
    dashboard: <DashboardIcon />,
    truck: <TruckIcon />,
    OutlineSend: <SendIcon />,
    plus: <PlusIcon />,
    edit: <EditIcon />,
    users: <UsersIcon />,
    customers: <GroupIcon />,
    carriers: <TruckIcon />,
    file: <FileIcon />,
    company: <BusinessIcon />,
    AttachMoneyIcon: <AttachMoneyIcon />,
    amazonPay: <PaymentIcon />,
    sales: <SalesIcon />,
    accountBalanceWallet: <AccountBalanceWalletIcon />,
    invoices: <InvoiceIcon />,
    estimates: <EstimatesIcon />,
    tax: <TaxIcon />,
    product: <ProductIcon />,
    purchase: <ShopIcon />,
    vendors: <VendorIcon />, // ✅ replaced FaHandshake with MUI Handshake
    bills: <BillIcon />,
    chartAccounts: <ChartAccountsIcon />,
    journalEntry: <JournalEntryIcon />,
  };

  return iconMap[iconName] || null;
};
