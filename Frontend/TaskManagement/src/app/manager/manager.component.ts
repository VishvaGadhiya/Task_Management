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
  selectedImageFile: File | null = null;
  previewImageUrl: string | ArrayBuffer | null = null;

  formSubmitted = false;
  formErrors: any = {};

  constructor(private managerService: ManagerService) {}

  ngOnInit(): void {
    const utcDate = new Date();
    const yyyyMMdd = utcDate.toISOString().split('T')[0];
    this.today = yyyyMMdd;
    this.loadManagers();
  }

  loadManagers(): void {
    this.isLoading = true;
    this.managerService.getManagers(
      this.currentPage,
      this.itemsPerPage,
      this.searchTerm,
      this.genderFilter,
      this.statusFilter,
      this.sortColumn,
      this.sortDirection
    ).subscribe({
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

  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedImageFile = file;
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewImageUrl = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onItemsPerPageChange(): void {
    this.currentPage = 1;
    this.loadManagers();
  }

  openEditModal(manager: any): void {
    this.formSubmitted = false;
    this.errorMessage = '';
    this.selectedImageFile = null;
    this.previewImageUrl = null;
    
    this.selectedManager = {
      ...manager,
      joinDate: manager.joinDate?.split('T')?.[0] || ''
    };
    
    if (manager.profileImagePath) {
      this.previewImageUrl = manager.profileImagePath;
    }
  }

  closeModal(): void {
    this.selectedManager = null;
    this.selectedImageFile = null;
    this.previewImageUrl = null;
    this.formSubmitted = false;
    this.formErrors = {};
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

    const formData = new FormData();
    formData.append('name', this.selectedManager.name);
    formData.append('email', this.selectedManager.email);
    formData.append('gender', this.selectedManager.gender);
    formData.append('joinDate', this.selectedManager.joinDate);
    formData.append('status', this.selectedManager.status);

    // Only append password if it's being changed
    if (this.selectedManager.password) {
      formData.append('password', this.selectedManager.password);
    }

    // Append image file if selected
    if (this.selectedImageFile) {
      formData.append('profileImage', this.selectedImageFile);
    }

    this.isSaving = true;
    this.errorMessage = null;

    this.managerService.updateManager(this.selectedManager.id, formData).subscribe({
      next: () => {
        this.isSaving = false;
        this.closeModal();
        this.loadManagers();
      },
      error: (err) => {
        this.isSaving = false;
        console.error('Error updating manager:', err);
        
        if (err.status === 400) {
          if (err.error?.errors) {
            this.formErrors = err.error.errors;
          } else if (typeof err.error === 'object') {
            this.formErrors = err.error;
          } else if (err.error?.message) {
            this.errorMessage = err.error.message;
          } else {
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
    this.selectedImageFile = null;
    this.previewImageUrl = null;
    this.formErrors = {};
    this.formSubmitted = false;
  }

  saveNewManager(): void {
    this.formSubmitted = true;
    this.formErrors = {};

    // Validate fields
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

    if (Object.keys(this.formErrors).length > 0) {
      return;
    }

    const formData = new FormData();
    formData.append('name', this.selectedManager.name);
    formData.append('email', this.selectedManager.email);
    formData.append('gender', this.selectedManager.gender);
    formData.append('joinDate', this.selectedManager.joinDate);
    formData.append('status', this.selectedManager.status);
    formData.append('password', this.selectedManager.password);
    formData.append('confirmPassword', this.selectedManager.confirmPassword);

    if (this.selectedImageFile) {
      formData.append('profileImage', this.selectedImageFile);
    }

    this.isSaving = true;
    this.errorMessage = null;

    this.managerService.addManager(formData).subscribe({
      next: () => {
        this.isSaving = false;
        this.closeModal();
        this.loadManagers();
      },
      error: (err) => {
        this.isSaving = false;
        console.error('Error saving manager:', err);

        if (err.status === 400) {
          if (err.error?.errors) {
            this.formErrors = err.error.errors;
          } else if (typeof err.error === 'object') {
            this.formErrors = err.error;
          } else if (err.error?.message) {
            this.errorMessage = err.error.message;
          } else {
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
        this.errorMessage = err.message || 'Failed to delete manager.';
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
getImageUrl(imageFileName: string): string {
  return `https://localhost:7125/${imageFileName}`;
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