import { Component, OnInit } from '@angular/core';
import { ManagerService } from '../services/manager.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
 
@Component({
  selector: 'app-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manager.component.html',
  styleUrls: ['./manager.component.css'],
})
export class ManagerComponent implements OnInit {
  managers: any[] = [];
  selectedManager: any = null;
  deletingManager: any = null;
 
  isLoading = false;
  isSaving = false;
  isDeleting = false;
  errorMessage: string | null = null;
 
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  totalPages = 0;
 
  searchTerm = '';
  genderFilter = '';
  statusFilter = '';
 
  sortColumn = '';
  sortDirection = 'asc';
  today: string = '';

 
  formSubmitted = false;
formErrors: any = {};
 
  constructor(private managerService: ManagerService) {}
 
  ngOnInit(): void {
    const utcDate = new Date();
  const yyyyMMdd = utcDate.toISOString().split('T')[0]; // gets YYYY-MM-DD in UTC
  this.today = yyyyMMdd;
    this.loadManagers();
  }
 
  loadManagers(): void {
    this.isLoading = true;
    this.managerService.getManagers(this.currentPage, this.itemsPerPage, this.searchTerm, this.genderFilter, this.statusFilter, this.sortColumn, this.sortDirection).subscribe({
      next: (response) => {
        this.managers = response.data || [];
        this.totalItems = response.recordsTotal || 0;
        this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = err.message || 'Failed to load managers.';
        this.isLoading = false;
      }
    });
  }
 
onSearch(): void {
  if (!this.searchTerm) {
    this.loadManagers();
    return;
  }
 
  const term = this.searchTerm.toLowerCase();
  this.managers = this.managers.filter(manager =>
    manager.name.toLowerCase().includes(term) ||
    manager.email.toLowerCase().includes(term) ||
    manager.gender.toLowerCase().includes(term) ||
    manager.status.toLowerCase().includes(term) ||
    manager.joinDate.toLowerCase().includes(term)
  );
}
 
  onFilter(): void {
    this.currentPage = 1;
    this.loadManagers();
  }
 
  onSort(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.loadManagers();
  }
 
  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadManagers();
    }
  }
 
  onItemsPerPageChange(): void {
    this.currentPage = 1;
    this.loadManagers();
  }
 
openEditModal(manager: any): void {
  this.formSubmitted = false;
  this.errorMessage = '';
  this.selectedManager = {
    ...manager,
    joinDate: manager.joinDate?.split('T')?.[0] || ''  
  };
}

 
  closeModal(): void {
    this.selectedManager = null;
  }
 
  updateManager(): void {
  this.formSubmitted = true;
  this.formErrors = {};
  
 
  if (!this.selectedManager.name) {
    this.formErrors.name = 'Name is required';
  }
 
  if (!this.selectedManager.email) {
    this.formErrors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.selectedManager.email)) {
    this.formErrors.email = 'Please enter a valid email';
  }
 
  if (!this.selectedManager.joinDate) {
    this.formErrors.joinDate = 'Join date is required';
  } else {
    this.selectedManager.joinDate = new Date(this.selectedManager.joinDate).toISOString().split('T')[0];
  }
 
  if (Object.keys(this.formErrors).length > 0) {
    return;
  }
 
  this.isSaving = true;
  this.errorMessage = null;
 
  this.managerService.updateManager(this.selectedManager).subscribe({
    next: () => {
      this.isSaving = false;
      this.closeModal();
      this.loadManagers();
    },
    error: (err) => {
      this.isSaving = false;
      console.error('Error updating manager:', err);
     
      if (err.status === 400) {
        if (err.error && err.error.errors) {
          this.formErrors = err.error.errors;
        }
        else if (err.error && typeof err.error === 'object') {
          this.formErrors = err.error;
        }
        else if (err.error && err.error.message) {
          this.errorMessage = err.error.message;
        }
        else {
          this.errorMessage = 'Invalid data. Please check your input.';
        }
      } else {
        this.errorMessage = 'Something went wrong; please try again later.';
      }
    }
  });
}
 
  addManager(): void {
    this.selectedManager = {
      name: '',
      email: '',
      gender: 'Male',
    joinDate: this.today,
      status: 'Active',
      password: '',
      confirmPassword: '',
    };
  }
 
saveNewManager(): void {
  this.formSubmitted = true;
  this.formErrors = {};
 
  // Validation
  if (!this.selectedManager.name) {
    this.formErrors.name = 'Name is required';
  }
 
  if (!this.selectedManager.email) {
    this.formErrors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.selectedManager.email)) {
    this.formErrors.email = 'Please enter a valid email';
  }
 
  if (!this.selectedManager.joinDate) {
    this.formErrors.joinDate = 'Join date is required';
  } else {
    // Format date to YYYY-MM-DD if needed
    this.selectedManager.joinDate = new Date(this.selectedManager.joinDate).toISOString().split('T')[0];
  }
 
  if (!this.selectedManager.id) {
    if (!this.selectedManager.password) {
      this.formErrors.password = 'Password is required';
    } else if (this.selectedManager.password.length < 6) {
      this.formErrors.password = 'Password must be at least 6 characters';
    }
   
    if (!this.selectedManager.confirmPassword) {
      this.formErrors.confirmPassword = 'Please confirm password';
    } else if (this.selectedManager.password !== this.selectedManager.confirmPassword) {
      this.formErrors.confirmPassword = 'Passwords do not match';
    }
  }
 
  if (Object.keys(this.formErrors).length > 0) {
    return;
  }
 
  const payload = {
    id: 0, 
    name: this.selectedManager.name,
    email: this.selectedManager.email,
    gender: this.selectedManager.gender,
    joinDate: this.selectedManager.joinDate,
    status: this.selectedManager.status,
    password: this.selectedManager.password,
    confirmPassword: this.selectedManager.confirmPassword
  };
 
  this.isSaving = true;
  this.errorMessage = null;
 
  this.managerService.addManager(payload).subscribe({
    next: () => {
      this.isSaving = false;
      this.closeModal();
      this.loadManagers();
    },
    error: (err) => {
      this.isSaving = false;
      console.error('Error saving manager:', err);
     
      if (err.status === 400) {
        if (err.error && err.error.errors) {
          // Handle field-specific errors from API
          this.formErrors = err.error.errors;
        }
        else if (err.error && typeof err.error === 'object') {
          // Handle other validation errors
          this.formErrors = err.error;
        }
        else if (err.error && err.error.message) {
          this.errorMessage = err.error.message;
        }
        else {
          this.errorMessage = 'Invalid data. Please check your input.';
        }
      } else {
        this.errorMessage = 'Something went wrong; please try again later.';
      }
    }
  });
}
 
 
  openDeleteModal(manager: any): void {
    this.deletingManager = manager;
  }
 
  closeDeleteModal(): void {
    this.deletingManager = null;
  }
 
  confirmDelete(): void {
    this.isDeleting = true;
    this.managerService.deleteManager(this.deletingManager.id).subscribe({
      next: () => {
        this.isDeleting = false;
        this.closeDeleteModal();
        this.loadManagers();
      },
      error: (err) => {
        this.isDeleting = false;
        console.error(err);
      }
    });
  }
 
  getSortIcon(column: string): string {
    if (this.sortColumn !== column) return '';
    return this.sortDirection === 'asc' ? '↑' : '↓';
  }
 
  getShowingTo(): number {
    const potentialEnd = this.currentPage * this.itemsPerPage;
    return potentialEnd > this.totalItems ? this.totalItems : potentialEnd;
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
}