import { Task } from "@/types";
import TaskCard from "@/components/shared/TaskCard";
import { Inbox } from "lucide-react";

interface ListViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

export default function ListView({ tasks, onTaskClick }: ListViewProps) {
  if (tasks.length === 0) {
    return (
      <div className="flex-center flex-col py-16 text-center">
        <Inbox className="w-12 h-12 text-[rgb(var(--color-text-tertiary))]" />
        <p className="mt-4 text-[rgb(var(--color-text-secondary))]">
          No tasks found
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <div key={task.id} className="cursor-pointer">
          <TaskCard task={task} onClick={() => onTaskClick(task)} />
        </div>
      ))}
    </div>
  );
}
