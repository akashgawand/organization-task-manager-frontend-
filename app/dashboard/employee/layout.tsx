import RoleGuard from "@/components/layout/RoleGuard";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    // Note: Employees probably shouldn't browse other dashboards if we are strictly enforcing "only their route".
    // I'll add the higher roles here just in case Admins want to drop in, but strictly the Employee layout is for Employees.
    <RoleGuard
      allowedRoles={[
        "employee",
      ]}
    >
      {children}
    </RoleGuard>
  );
}
