import RoleGuard from "@/components/layout/RoleGuard";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowedRoles={["super_admin"]}>{children}</RoleGuard>;
}
