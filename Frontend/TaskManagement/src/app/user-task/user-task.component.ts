// user-task.component.ts
import { Component, OnInit } from "@angular/core";
import { RouterModule } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { UserTask, UserTaskService } from "../services/user-task.service";

@Component({
  selector: 'app-user-task',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './user-task.component.html',
})
export class UserTaskComponent implements OnInit {
  userTasks: UserTask[] = [];
  users: any[] = [];
  tasks: any[] = [];

  selectedUserTask: UserTask | null = null;
  deletingUserTask: UserTask | null = null;

  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  totalPages = 0;
  searchTerm = '';
  sortColumn = '';
  sortDirection = 'asc';

  constructor(private userTaskService: UserTaskService) {}

  ngOnInit(): void {
    this.loadUsers();
    this.loadTasks();
    this.loadUserTasks();
  }

  loadUserTasks() {
    this.userTaskService.getUserTasks(this.currentPage, this.itemsPerPage, this.searchTerm, this.sortColumn, this.sortDirection)
      .subscribe(data => {
        this.userTasks = data.data || [];
        this.totalItems = data.recordsTotal || 0;
        this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
      });
  }

  loadUsers() {
    this.userTaskService.getUsers().subscribe(data => {
      this.users = Array.isArray(data) ? data : Object.values(data);
    });
  }

  loadTasks() {
    this.userTaskService.getTasks().subscribe(data => {
      this.tasks = Array.isArray(data) ? data : Object.values(data);
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadUserTasks();
  }

  onSort(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.loadUserTasks();
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadUserTasks();
    }
  }

  onItemsPerPageChange(): void {
    this.currentPage = 1;
    this.loadUserTasks();
  }
getTaskStatus(taskId: number): string {
  const task = this.tasks.find(t => t.id === taskId);
  return task ? task.status : '';
}

getReadableStatus(status: string): string {
  switch (status) {
    case 'ToDo': return 'To Do';
    case 'InProgress': return 'In Progress';
    case 'Completed': return 'Completed';
    default: return status;
  }
}

get activeUsers() {
  return this.users.filter(u => u.status === 'Active');
}

getAvailableTasksForUser(userId: number): any[] {
  // Sare assigned task ids, except currently editing assignment (to allow editing without losing the assigned task)
  const assignedTaskIds = this.userTasks
    .filter(ut => ut.id !== this.selectedUserTask?.id)
    .map(ut => ut.taskId);

  // Filter out tasks which are already assigned
  return this.tasks.filter(t => !assignedTaskIds.includes(t.id));
}

  getUserName(userId: number): string {
    const user = this.users.find(u => u.id === userId);
    return user ? user.name : `User ${userId}`;
  }

  getTaskTitle(taskId: number): string {
    const task = this.tasks.find(t => t.id === taskId);
    return task ? task.title : `Task ${taskId}`;
  }

  openEditModal(userTask: UserTask) {
    this.selectedUserTask = { ...userTask };
  }

  addUserTask() {
    this.selectedUserTask = { userId: 0, taskId: 0 };
  }

  saveUserTask() {
    if (!this.selectedUserTask) return;

    if (this.selectedUserTask.id) {
      this.userTaskService.updateUserTask(this.selectedUserTask).subscribe(() => {
        this.selectedUserTask = null;
        this.loadUserTasks();
      });
    } else {
      this.userTaskService.addUserTask(this.selectedUserTask).subscribe(() => {
        this.selectedUserTask = null;
        this.loadUserTasks();
      });
    }
  }

  openDeleteModal(userTask: UserTask) {
    this.deletingUserTask = userTask;
  }

  confirmDelete() {
    if (!this.deletingUserTask) return;

    this.userTaskService.deleteUserTask(this.deletingUserTask.id!).subscribe(() => {
      this.deletingUserTask = null;
      this.loadUserTasks();
    });
  }

  closeModal() {
    this.selectedUserTask = null;
  }

  closeDeleteModal() {
    this.deletingUserTask = null;
  }

  getSortIcon(column: string): string {
    if (this.sortColumn !== column) return '';
    return this.sortDirection === 'asc' ? '↑' : '↓';
  }

  getPages(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  getShowingTo(): number {
    const showingTo = this.currentPage * this.itemsPerPage;
    return showingTo > this.totalItems ? this.totalItems : showingTo;
  }
}
