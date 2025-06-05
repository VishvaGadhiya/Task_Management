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

  constructor(private managerService: ManagerService) {}

  ngOnInit(): void {
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
    this.selectedManager = { ...manager };
  }

  closeModal(): void {
    this.selectedManager = null;
  }

  updateManager(): void {
    this.isSaving = true;
    this.managerService.updateManager(this.selectedManager).subscribe({
      next: () => {
        this.isSaving = false;
        this.closeModal();
        this.loadManagers();
      },
      error: (err) => {
        this.isSaving = false;
        console.error(err);
      }
    });
  }

  addManager(): void {
    this.selectedManager = {
      name: '',
      email: '',
      gender: 'Male',
      joinDate: '',
      status: 'Active',
      password: '',
      confirmPassword: '',
    };
  }

saveNewManager(): void {
  if (this.selectedManager.password !== this.selectedManager.confirmPassword) {
    this.errorMessage = "Passwords do not match.";
    return;
  }

  this.isSaving = true;
  this.managerService.addManager(this.selectedManager).subscribe({
    next: () => {
      this.isSaving = false;
      this.closeModal();
      this.loadManagers();
    },
    error: (err) => {
      this.isSaving = false;
      console.error(err);
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
