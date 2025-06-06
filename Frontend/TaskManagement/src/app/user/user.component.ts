import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
  users: any[] = [];
  errorMessage: string | null = null;
  isLoading = true;

  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  totalPages = 0;

  searchTerm = '';
  genderFilter = '';
  statusFilter = '';

  sortColumn = '';
  sortDirection = 'asc';

  selectedUser: any = null;
  deletingUser: any = null;
  isSaving = false;
  isDeleting = false;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.userService.getUsers(
      this.currentPage,
      this.itemsPerPage,
      this.searchTerm,
      this.genderFilter,
      this.statusFilter,
      this.sortColumn,
      this.sortDirection
    ).subscribe({
      next: (response) => {
        this.users = response.data || [];
        this.totalItems = response.recordsTotal || 0;
        this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.message || 'Failed to load users.';
        this.isLoading = false;
      }
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadUsers();
  }

  onFilter(): void {
    this.currentPage = 1;
    this.loadUsers();
  }

  onSort(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.loadUsers();
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadUsers();
    }
  }

  onItemsPerPageChange(): void {
    this.currentPage = 1;
    this.loadUsers();
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

  openEditModal(user: any): void {
    this.selectedUser = { ...user };
    this.selectedUser.joinDate = this.formatDateForInput(this.selectedUser.joinDate);
  }

  closeModal(): void {
    this.selectedUser = null;
  }

updateUser(): void {
  if (!this.selectedUser) return;

  this.isSaving = true;
  this.errorMessage = null; 

  this.userService.updateUser(this.selectedUser.id, this.selectedUser).subscribe({
    next: (response: any) => {
      this.isSaving = false;
      if (response?.success) {
        this.closeModal();
        this.loadUsers();
      } else {
        this.errorMessage = response?.message || 'User update failed.';
      }
    },
    error: (err) => {
      this.isSaving = false;
      
      if (err.error?.message) {
        this.errorMessage = err.error.message;
      } 
      else if (err.error?.errors) {
        const errors = err.error.errors;
        this.errorMessage = Object.values(errors).flat().join(' ');
      } 
      else {
        this.errorMessage = err.message || 'Failed to update user.';
      }
    }
  });
}

  openDeleteModal(user: any): void {
    this.deletingUser = user;
  }

  closeDeleteModal(): void {
    this.deletingUser = null;
  }

confirmDelete(): void {
  if (!this.deletingUser) return;

  this.isDeleting = true;

  this.userService.deleteUser(this.deletingUser.id).subscribe({
    next: (response) => {
      this.isDeleting = false;
      if (response?.success) {
        this.closeDeleteModal();
        this.loadUsers();
      } else {
        this.errorMessage = response.message || 'User could not be deleted.';
      }
    },
    error: (err) => {
      this.isDeleting = false;

      const backendMessage = err.error?.message || 'Failed to delete user.';
      this.errorMessage = backendMessage;
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
