import { User, Team, Project, UserRole, rolePermissions } from "@/types";
import { ExtendedProject } from "@/features/projects/types";

/**
 * Checks if a user can assign a task to another user based on roles and team membership.
 */
export function canAssignTask(
  assigner: User,
  assignee: User,
  assignerTeams: Team[] = [] // Needed for Team Level checks
): boolean {
  const permissions = rolePermissions[assigner.role];

  // 1. Check basic role-based allowlist
  if (!permissions.canAssignTasksTo.includes(assignee.role)) {
    return false;
  }

  // 2. Super Admin & Admin can assign to anyone in their allowlist (Global/Dept)
  // For simplicity MVP: Admin acts as global manager for now, or we'd check Department match.
  if (assigner.role === "super_admin" || assigner.role === "admin") {
    return true;
  }

  // 3. Team Lead & Senior Developer: Can only assign to employees IN THEIR TEAM
  if (assigner.role === "team_lead" || assigner.role === "senior_developer") {
    // Get all member IDs from teams where this user is a lead
    // Note: for Senior Developer, this logic assumes they are treated similarly to Team Leads for assignment
    // within the teams they are part of or lead. If Senior Developers don't lead teams but can assign, 
    // we might need to adjust this to check membership instead of leadership, or assume they are assigned as leads/proxies.
    // For now, mirroring Team Lead permissions as requested.
    const leadTeamIds = assignerTeams
      .filter((t) => t.leadId === assigner.id)
      .map((t) => t.id);
    
    // Check if assignee is in any of those teams
    const isMemberOfLeadTeam = assignerTeams.some(
      (t) => leadTeamIds.includes(t.id) && t.memberIds.includes(assignee.id)
    );

    return isMemberOfLeadTeam;
  }

  // 4. Employee: Generally cannot assign, but if they could (personal tasks), it's to self.
  if (assigner.role === "employee") {
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
  const permissions = rolePermissions[user.role];

  // 1. Super Admin sees all
  if (permissions.canViewAllProjects) {
    return true;
  }

  // 2. Admin: Sees Department Projects
  // Assuming Project has 'department' or we check if project belongs to a team in their department
  if (user.role === "admin") {
      // If project has department field (it might not in current type, skipping for now or assume true for Department Admin)
      // MVP: Admins see all projects for now as they are "Managers"
      return true; 
  }

  // 3. Team Lead & Employee: See projects assigned to their team OR they are member of
  if (permissions.canViewTeamProjects) {
    // Check if project is assigned to any of user's teams
    // Type guard for teamId property which might not depend on the type if we check existing props
    // Assuming standard Project has basic fields.
    const projectId = project.id;
    const isTeamProject = userTeams.some(t => t.projectIds.includes(projectId));
    
    // Check if user is directly a member of the project
    // Handle both Project (no members) and ExtendedProject (has members)
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
    const permissions = rolePermissions[user.role];

    if (type === 'system') return permissions.canViewAllAnalytics;
    if (type === 'department') return permissions.canViewDepartmentAnalytics;
    // Team analytics usually available to leads
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
  const permissions = rolePermissions[currentUser.role];

  // 1. Filter by role allowlist first
  let assignable = allUsers.filter((u) => 
    permissions.canAssignTasksTo.includes(u.role)
  );

  // 2. Super Admin: Can assign to anyone in the role allowlist (effectively everyone)
  if (currentUser.role === "super_admin") {
    return assignable;
  }

  // 3. Admin: Can assign to Team Leads and Employees
  // Refinement: Should only assign to people in their department
  if (currentUser.role === "admin") {
    if (currentUser.department) {
      return assignable.filter((u) => u.department === currentUser.department);
    }
    return assignable;
  }

  // 4. Team Lead & Senior Developer: Can only assign to members of their OWN teams
  if (currentUser.role === "team_lead" || currentUser.role === "senior_developer") {
    // Get all unique member IDs from teams this user leads
    const leadTeamIds = userTeams
      .filter((t) => t.leadId === currentUser.id)
      .flatMap((t) => t.memberIds);
    
    return assignable.filter((u) => leadTeamIds.includes(u.id));
  }

  // 5. Employee: Can only assign to self (if creating a personal task)
  if (currentUser.role === "employee") {
    return [currentUser];
  }

  return [];
}
