import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MyTasksService, Task } from '../services/my-tasks.service';

@Component({
  selector: 'app-my-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-tasks.component.html',
  styleUrls: ['./my-tasks.component.css']
})
export class MyTasksComponent implements OnInit {
  tasks: Task[] = [];
  errorMessage = '';
  successMessage = '';
  isLoading = true;

  // Pagination properties
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  totalPages = 0;

  // Filter and sort properties
  searchTerm = '';
  statusFilter = '';
  sortColumn = '';
  sortDirection = 'asc';

  constructor(private myTasksService: MyTasksService) { }

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.myTasksService.getTasks(
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

  updateStatus(taskId: number, newStatus: string): void {
    this.myTasksService.updateTaskStatus(taskId, newStatus).subscribe({
      next: () => {
        const task = this.tasks.find(t => t.taskId === taskId);
        if (task) {
          task.status = newStatus;
        }
        this.successMessage = 'Status updated successfully.';
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        this.errorMessage = 'Error updating status: ' + err.message;
        setTimeout(() => this.errorMessage = '', 3000);
      }
    });
  }

  getSortIcon(column: string): string {
    if (this.sortColumn !== column) return '';
    return this.sortDirection === 'asc' ? '↑' : '↓';
  }
}