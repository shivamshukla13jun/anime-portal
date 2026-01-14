import { Route } from "@/routes";
// =============================================================================
// 1. Options DEFINITIONS (Mirrors backend for consistency)
// =============================================================================
// =============================================================================
// 0. CONSTANTS
// =============================================================================
const rolePermissionsJSON = {
  roles: [
    {
      role: 'superadmin',
       resources: [
        {
          resource: 'Users',
          source: [
            {   title: 'Create', methods: 'POST' },
            {  title: 'Read All', methods: 'GET' },
            {  title: 'Read', methods: 'GET' },
            {  title: 'Update', methods: 'PUT' },
            { title: 'Delete', methods: 'DELETE' },
            {  title: 'Activate', methods: 'PUT' },
            { title: 'Block', methods: 'PUT' }
          ]
        }
      ]
    },
    {
      role: 'admin',
      resources: [
        {
          resource: 'Users',
          source: [
            {   title: 'Create', methods: 'POST' },
            {  title: 'Read All', methods: 'GET' },
            {  title: 'Read', methods: 'GET' },
            {  title: 'Update', methods: 'PUT' },
            { title: 'Delete', methods: 'DELETE' },
            {  title: 'Activate', methods: 'PUT' },
            { title: 'Block', methods: 'PUT' }
          ]
        }
      ]
    }
  ]
} as const
// Generate union types for paths and methods dynamically
// Paths union type
export type ResourceType = typeof rolePermissionsJSON['roles'][number]['resources'][number]['source'][number]['title'] | 'layout' |'menu-management'

// Methods union type
export type ActionType = typeof rolePermissionsJSON['roles'][number]['resources'][number]['source'][number]['methods'];
export type ParentResourceType = typeof rolePermissionsJSON['roles'][number]['resources'][number]["resource"][number] | 'layout' |'menu-management' 

export const invoiceStatusOptions = ["Pending", "Partial", "Paid", "Overdue", "Cancelled", "Close"] as const;
export const PaymentMethodsOptions = ["Cash"] as const;
export const Roles = ['seller', 'admin', 'superadmin', 'customer'] as const;
// =============================================================================
// 1. TYPE DEFINITIONS (Mirrors backend for consistency)
// =============================================================================
export type InvoiceStatusType = typeof invoiceStatusOptions[number];
export type PaymentMethodsType = typeof PaymentMethodsOptions[number];
export type Role = typeof Roles[number];

export type Title = 'mr' | 'mrs' | 'ms' | 'dr'
export interface IActionPermission {
  title: string;
  method: string;
  access: boolean;
}

export interface IResourcePermission {
  resource: string; // e.g. "users"
  source: IActionPermission[];
  
}
export interface IRolePermission {
  role: Role;
  resources: IResourcePermission[];
}


export interface IUser {
  _id?: string;
  name: string;
  email: string;
  password?: string;
  repeatPassword?: string;
  role: Role
  isActive?: boolean;
  isBlocked?: boolean;
  isUpdate?: boolean,
 
}

export interface PermissionCheck {
  action: ActionType;
  parentResource: ParentResourceType;
  resource: ResourceType;
}
// Render public routes
export interface RoteExtended extends Route {
    parentResource: ParentResourceType;

  action: ActionType;
  resource: ResourceType;
}

export interface SidebarMenuItem {
  path: string;
  title: string;
  icon?: string;
  icontype?: string;
   action: ActionType;
    resource: ResourceType;
  parentResource: ParentResourceType;
  children?: SidebarMenuItem[];
  hideInMenu?: boolean;
}

export interface SideDrawerProps {
  drawerWidth: number;
}

export interface IExpenseItem {
  value: number | any
  service: string | any
  desc: string;
  positive: boolean;
}

export interface IFile {
  fieldname: string;
  file?: File;
  id?: string;
  preview?: string;
  isNew?: boolean;
  originalname: string;
  encoding: string;
  mimetype: string;
  destination: string;
  filename: string;
  path: string;
  size: number;
  url?: string

}
export interface Attachment {
  file?: File;
  preview?: string;
  [key: string]: any;
}

export interface ITaxOption {
  _id: string;
  value: number;
  label: string;
}
export interface LoginFormData {
  email: string;
  password: string;
}



export interface INotification {
  _id: string;
  title: string;
  message: string;
  link: string
  isRead: boolean;
  updatedAt: string;
  createdAt: Date;
  UserId: string;
  expenseId?: string;
}
export interface INotificationUpdate {
  _id?: string;
  title?: string;
  message?: string;
  isRead: boolean;
  loadId?: string;
  updatedAt?: string;
  createdAt?: Date;
  UserId?: string;
  expenseId?: string;
}

export interface IMenuItem {
  path: string;
  title: string;
  icon?: string;
  icontype?: any
  children?: IMenuItem[];
  allowedRoles: string[];
  hideInMenu?: boolean;
}

export interface SidebarState {
  isOpen: boolean;
  activeMenu: string;
  openMenus: string[];
}

export interface CustomerDashboardData {
  data: {
    overdueInvoices: {
      count: number;
      totalAmount: number;
      percentage: number
    };
    paidInvoices: {
      count: number;
      totalAmount: number;
      percentage: number
    };
    totalInvoices: {
      count: number;
      totalAmount: number;
      percentage: number
    };
    recentPaidInvoices: {
      count: number;
      totalAmount: number;
      percentage: number
    };
    partialInvoices: {
      count: number;
      totalAmount: number;
      percentage: number
    };
    openBills: {
      count: number;
      totalAmount: number;
      percentage: number
    };
    UnbillIncome: {
      count: number;
      totalAmount: number;
      percentage: number
      loads: string[];
    };
  }

}
export interface IProductVariant {
  name: string;
  sku: string;
  price: number;
  stock: number;
  attributes: Record<string, any>;
  images: string[];
  isActive: boolean;
}
export interface IProduct  {
  _id?:string;
  name: string;
  description: string;
  basePrice: number;
  category: string;
  subcategory?: string;
  brand?: string;
  sku: string;
  images: string[];
  variants: IProductVariant[];
  stock: number;
  isActive: boolean;
  tags: string[];
  specifications: Record<string, any>;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  createdAt: Date;
  updatedAt: Date;
  createdBy: IUser;
}