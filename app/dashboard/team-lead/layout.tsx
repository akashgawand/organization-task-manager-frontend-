import RoleGuard from "@/components/layout/RoleGuard";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={["team_lead"]}>
      {children}
    </RoleGuard>
  );
}
