import { User, Team, Project, UserRole, rolePermissions } from "@/types";
import { ExtendedProject } from "@/features/projects/types";

/** Normalize role to lowercase for consistent comparison regardless of DB casing */
const normalizeRole = (role: string): UserRole =>
  role.toLowerCase() as UserRole;

/**
 * Checks if a user can assign a task to another user based on roles and team membership.
 */
export function canAssignTask(
  assigner: User,
  assignee: User,
  assignerTeams: Team[] = []
): boolean {
  const role = normalizeRole(assigner.role);
  const permissions = rolePermissions[role];
  if (!permissions) return false;

  const assigneeRole = normalizeRole(assignee.role);

  // 1. Check basic role-based allowlist
  if (!permissions.canAssignTasksTo.includes(assigneeRole)) {
    return false;
  }

  // 2. Super Admin & Admin can assign to anyone in their allowlist (Global/Dept)
  if (role === "super_admin" || role === "admin") {
    return true;
  }

  // 3. Team Lead & Senior Developer: Can only assign to employees IN THEIR TEAM
  if (role === "team_lead" || role === "senior_developer") {
    const leadTeamIds = assignerTeams
      .filter((t) => t.leadId === assigner.id)
      .map((t) => t.id);

    const isMemberOfLeadTeam = assignerTeams.some(
      (t) => leadTeamIds.includes(t.id) && t.memberIds.includes(assignee.id)
    );

    return isMemberOfLeadTeam;
  }

  // 4. Employee: Can only assign to self
  if (role === "employee") {
    return assigner.id === assignee.id;
  }

  return false;
}

/**
 * Checks if a user can view a specific project.
 */
export function canViewProject(
  user: User,
  project: Project | ExtendedProject,
  userTeams: Team[] = []
): boolean {
  const role = normalizeRole(user.role);
  const permissions = rolePermissions[role];
  if (!permissions) return false;

  // 1. Super Admin sees all
  if (permissions.canViewAllProjects) {
    return true;
  }

  // 2. Admin: Sees all projects (department manager)
  if (role === "admin") {
    return true;
  }

  // 3. Team Lead & Employee: See projects assigned to their team OR they are member of
  if (permissions.canViewTeamProjects) {
    const projectId = project.id;
    const isTeamProject = userTeams.some(t => t.projectIds.includes(projectId));

    let isDirectMember = false;
    if ('members' in project) {
       isDirectMember = (project as ExtendedProject).members.some(m => m.userId === user.id);
    }

    return isTeamProject || isDirectMember;
  }

  return false;
}

/**
 * Checks if a user can view specific analytics.
 */
export function canViewAnalytics(user: User, type: 'system' | 'department' | 'team'): boolean {
  const role = normalizeRole(user.role);
  const permissions = rolePermissions[role];
  if (!permissions) return false;

  if (type === 'system') return permissions.canViewAllAnalytics;
  if (type === 'department') return permissions.canViewDepartmentAnalytics;
  return true;
}

/**
 * Returns a list of users that the current user can assign tasks to.
 */
export function getAssignableUsers(
  currentUser: User,
  allUsers: User[],
  userTeams: Team[] = []
): User[] {
  const role = normalizeRole(currentUser.role);
  const permissions = rolePermissions[role];
  if (!permissions) return [];

  // 1. Filter by role allowlist first (normalize both sides)
  let assignable = allUsers.filter((u) =>
    permissions.canAssignTasksTo.includes(normalizeRole(u.role))
  );

  // 2. Super Admin: Can assign to anyone in the role allowlist
  if (role === "super_admin") {
    return assignable;
  }

  // 3. Admin: Can assign to people in their department (or everyone if no dept set)
  if (role === "admin") {
    if (currentUser.department) {
      return assignable.filter((u) => u.department === currentUser.department);
    }
    return assignable;
  }

  // 4. Team Lead & Senior Developer: Can only assign to members of their OWN teams
  if (role === "team_lead" || role === "senior_developer") {
    const leadTeamIds = userTeams
      .filter((t) => t.leadId === currentUser.id)
      .flatMap((t) => t.memberIds);

    return assignable.filter((u) => leadTeamIds.includes(u.id));
  }

  // 5. Employee: Can only assign to self (personal tasks)
  if (role === "employee") {
    return [currentUser];
  }

  return [];
}
