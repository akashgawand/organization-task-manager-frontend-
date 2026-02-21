// Permission feature exports
export { usePermission, usePermissions, useAuth, useRBAC } from "./hooks/usePermission";
export { default as PermissionGate } from "./components/PermissionGate";
export { rolePermissions } from "./types";
export * from "./utils";
export type { Permission, UserRole } from "./types";
