import { User, Task } from "@/types";

/**
 * Returns a list of tasks that the current user can review based on role hierarchy.
 * @param currentUser The user attempting to view/review tasks.
 * @param allTasks list of all tasks.
 * @param allUsers list of all users to lookup creator/assignee roles.
 */
export function getReviewableTasks(
  currentUser: User,
  allTasks: Task[],
  allUsers: User[]
): Task[] {
  // Helper to get role of a user by ID
  const getUserRole = (userId: string) =>
    allUsers.find((u) => u.id === userId)?.role;

  return allTasks.filter((task) => {
    // Tasks created by or assigned to users of specific roles
    // We check the creator's role primarily for "Reviewing other people's work"
    // Ideally, we'd check assignee, but for now let's check assignee(s).
    // If a task has multiple assignees, if ANY of them are in the reviewable scope, show it.
    
    // Actually, usually you review tasks *completed* by someone.
    // Let's filter by the role of the people assigned to the task.
    
    // Default: User cannot review their own tasks in this view (optional)
    if (task.assigneeIds.includes(currentUser.id)) {
        // Decide if users can review their own tasks. Assuming NO for this specific "Review Others" view.
        // return false; 
    }

    const assigneeRoles = task.assigneeIds.map(id => getUserRole(id)).filter(Boolean);

    switch (currentUser.role) {
      case "super_admin":
        // Super Admin sees EVERYONE'S tasks
        return true;

      case "admin":
        // Admin sees: Team Lead, Senior Dev, Employee
        // DOES NOT SEE: Super Admin, Other Admins (unless configured otherwise)
        return assigneeRoles.some(role => 
            role === 'team_lead' || role === 'senior_developer' || role === 'employee'
        );

      case "team_lead":
        // Team Lead sees: Senior Dev, Employee
        return assigneeRoles.some(role => 
            role === 'senior_developer' || role === 'employee'
        );

      case "senior_developer":
        // Senior Dev sees: Employee
        return assigneeRoles.some(role => 
            role === 'employee'
        );

      case "employee":
        // Employee sees nothing (or maybe peer review if enabled, but req says "Senior Dev sees Employee")
        return false;

      default:
        return false;
    }
  });
}
