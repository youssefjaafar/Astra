import type { Task } from "@/lib/types";

export const tasks: Task[] = [
  {
    id: "t1",
    title: "Deep work block for Astra product architecture",
    area: "Work",
    priority: "High",
    due: "09:30",
    complete: false,
  },
  {
    id: "t2",
    title: "Read 20 pages before evening review",
    area: "Personal",
    priority: "Medium",
    due: "18:30",
    complete: false,
  },
  {
    id: "t3",
    title: "Call Alex",
    area: "Reminder",
    priority: "Medium",
    due: "15:00",
    complete: true,
  },
  {
    id: "t4",
    title: "Prep tomorrow's meals",
    area: "Personal",
    priority: "Low",
    due: "20:00",
    complete: false,
  },
];
