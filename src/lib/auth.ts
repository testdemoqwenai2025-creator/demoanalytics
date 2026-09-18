// Role-based access control utilities.
// Used by both the mock auth (current) and NextAuth (future) implementations.

export type Role = 'demo' | 'admin' | 'enterprise'

export interface RolePermissions {
  canViewDashboards: boolean
  canViewMarkets: boolean
  canViewNews: boolean
  canViewStories: boolean
  canViewPricing: boolean
  canUploadFiles: boolean
  canExportData: boolean
  canManageApiKeys: boolean
  canConfigureDataSources: boolean
  canViewAuditLog: boolean
  canManageUsers: boolean
  canInstallPlugins: boolean
  canUseSso: boolean
}

export const ROLE_PERMISSIONS: Record<Role, RolePermissions> = {
  demo: {
    canViewDashboards: true,
    canViewMarkets: true,
    canViewNews: true,
    canViewStories: true,
    canViewPricing: true,
    canUploadFiles: false,
    canExportData: true,
    canManageApiKeys: false,
    canConfigureDataSources: false,
    canViewAuditLog: false,
    canManageUsers: false,
    canInstallPlugins: false,
    canUseSso: false,
  },
  admin: {
    canViewDashboards: true,
    canViewMarkets: true,
    canViewNews: true,
    canViewStories: true,
    canViewPricing: true,
    canUploadFiles: true,
    canExportData: true,
    canManageApiKeys: true,
    canConfigureDataSources: true,
    canViewAuditLog: true,
    canManageUsers: false,
    canInstallPlugins: false,
    canUseSso: false,
  },
  enterprise: {
    canViewDashboards: true,
    canViewMarkets: true,
    canViewNews: true,
    canViewStories: true,
    canViewPricing: true,
    canUploadFiles: true,
    canExportData: true,
    canManageApiKeys: true,
    canConfigureDataSources: true,
    canViewAuditLog: true,
    canManageUsers: true,
    canInstallPlugins: true,
    canUseSso: true,
  },
}

export function getPermissions(role: Role | null): RolePermissions {
  if (!role) return ROLE_PERMISSIONS.demo
  return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.demo
}

export function can(role: Role | null, permission: keyof RolePermissions): boolean {
  return getPermissions(role)[permission]
}

// Mock user database (in production, this would be Prisma + NextAuth)
export interface MockUser {
  email: string
  password: string  // In production: hashed via NextAuth credentials provider
  role: Role
  name: string
}

export const MOCK_USERS: MockUser[] = [
  { email: 'demo@meridian.template', password: 'demo', role: 'demo', name: 'Demo User' },
  { email: 'admin@meridian.template', password: 'admin', role: 'admin', name: 'Admin User' },
  { email: 'enterprise@meridian.template', password: 'enterprise', role: 'enterprise', name: 'Enterprise User' },
]

export function authenticate(email: string, password: string): MockUser | null {
  const user = MOCK_USERS.find(u => u.email === email && u.password === password)
  return user || null
}
