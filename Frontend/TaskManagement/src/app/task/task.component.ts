import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../services/task.service';

@Component({
  selector: 'app-task',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css']
})
export class TaskComponent implements OnInit {
  tasks: any[] = [];
  errorMessage: string | null = null;
  isLoading = true;

  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  totalPages = 0;

  searchTerm = '';
  statusFilter = '';

  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  selectedTask: any = null;  
  deletingTask: any = null;  
  isSaving = false;
  isDeleting = false;
  statusSummary = {
    toDo: 0,
    inProgress: 0,
    completed: 0,
  };
  isStatusLoading = true;

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    this.loadTasks();
        this.loadStatusSummary();

  }

  loadTasks(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.taskService.getTasksPaginated(
      this.currentPage,
      this.itemsPerPage,
      this.searchTerm,
      this.statusFilter,
      this.sortColumn,
      this.sortDirection
    ).subscribe({
      next: (response) => {
        this.tasks = response.data || [];
        this.totalItems = response.recordsTotal || 0;
        this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.message || 'Failed to load tasks.';
        this.isLoading = false;
      }
    });
  }
 loadStatusSummary(): void {
    this.isStatusLoading = true;
    this.taskService.getStatusSummary().subscribe({
      next: (data) => {
        this.statusSummary.toDo = data.toDo ?? 0;
        this.statusSummary.inProgress = data.inProgress ?? 0;
        this.statusSummary.completed = data.completed ?? 0;
        this.isStatusLoading = false;
      },
      error: () => {
        this.isStatusLoading = false;
      },
    });
  }
  onSearch(): void {
    this.currentPage = 1;
    this.loadTasks();
  }

  onFilter(): void {
    this.currentPage = 1;
    this.loadTasks();
  }

  onSort(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.loadTasks();
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadTasks();
    }
  }

  onItemsPerPageChange(): void {
    this.currentPage = 1;
    this.loadTasks();
  }

  getPages(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = startPage + maxVisiblePages - 1;
    
    if (endPage > this.totalPages) {
      endPage = this.totalPages;
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  getShowingTo(): number {
    const potentialEnd = this.currentPage * this.itemsPerPage;
    return potentialEnd > this.totalItems ? this.totalItems : potentialEnd;
  }

  openAddModal(): void {
    this.selectedTask = {
      title: '',
      description: '',
      status: 'ToDo',
      dueDate: this.formatDateForInput(new Date())
    };
  }

  openEditModal(task: any): void {
    this.selectedTask = { ...task };
    this.selectedTask.dueDate = this.formatDateForInput(this.selectedTask.dueDate);
  }

  closeModal(): void {
    this.selectedTask = null;
    this.errorMessage = null;
  }

saveTask(): void {
  if (!this.selectedTask || !this.selectedTask.title?.trim() || !this.selectedTask.status || !this.selectedTask.dueDate) {
    this.errorMessage = 'Please fill all required fields.';
    return;
  }

  const newTitle = this.selectedTask.title.trim().toLowerCase();
  const newDescription = (this.selectedTask.description || '').trim().toLowerCase();

  const isDuplicate = this.tasks.some(task => {
    if (task.id === this.selectedTask.id) return false;

    const existingTitle = (task.title || '').trim().toLowerCase();
    const existingDescription = (task.description || '').trim().toLowerCase();

    return existingTitle === newTitle || existingDescription === newDescription;
  });

  if (isDuplicate) {
    this.errorMessage = 'A task with the same title or description already exists.';
    return;
  }

  this.errorMessage = null;
  this.isSaving = true;

  const observable = this.selectedTask.id 
    ? this.taskService.updateTask(this.selectedTask)
    : this.taskService.addTask(this.selectedTask);

  observable.subscribe({
    next: () => {
      this.isSaving = false;
      this.closeModal();
      this.loadTasks();
    },
    error: (err) => {
      this.isSaving = false;
      this.errorMessage = err.message || 'Failed to save task.';
    }
  });
}


  openDeleteModal(task: any): void {
    this.deletingTask = task;
  }

  closeDeleteModal(): void {
    this.deletingTask = null;
    this.errorMessage = null;
  }

  confirmDelete(): void {
    if (!this.deletingTask) return;

    this.isDeleting = true;
    this.taskService.deleteTask(this.deletingTask.id).subscribe({
      next: () => {
        this.isDeleting = false;
        this.closeDeleteModal();
        this.loadTasks();
      },
      error: (err) => {
        this.isDeleting = false;
        this.errorMessage = err.message || 'Failed to delete task.';
      }
    });
  }

  private formatDateForInput(dateStr: string | Date): string {
    const date = new Date(dateStr);
    const yyyy = date.getFullYear();
    const mm = (date.getMonth() + 1).toString().padStart(2, '0');
    const dd = date.getDate().toString().padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  getSortIcon(column: string): string {
    if (this.sortColumn !== column) return '';
    return this.sortDirection === 'asc' ? '↑' : '↓';
  }
}
