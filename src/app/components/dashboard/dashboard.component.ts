import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TronCheckpoint, isTronCheckpoint, calculateTronProgress } from '../../models/tron-progress';
import { toSignal } from '@angular/core/rxjs-interop';
import { ZwiftAuthService } from '../../services/zwift-auth.service';
import { ImageMapService } from '../../services/image-map.service';
import { UNLOCKABLES } from '../../data/unlockables.data';
import { Unlockable } from '../../models/unlockable.model';
import { ItemModalComponent } from '../item-modal/item-modal.component';

type FilterMode = 'all' | 'unlocked' | 'locked';
type ViewMode = 'list' | 'grid';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ItemModalComponent],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  private authService = inject(ZwiftAuthService);
  private imageMap = inject(ImageMapService);

  authState = toSignal(this.authService.state$, {
    initialValue: this.authService.state,
  });

  levelProgress = computed(() => {
    const level = this.authState().level;
    return Number.isFinite(level) ? Math.min(100, Math.max(0, level)) : 0;
  });

  tronCheckpoint = signal<TronCheckpoint | null>(null);
  tronEditing = signal(false);
  tronError = signal('');
  tronMeters: number | null = null;
  tronProgress = computed(() => {
    const checkpoint = this.tronCheckpoint();
    return checkpoint ? calculateTronProgress(checkpoint, this.authState().totalClimbed) : null;
  });

  constructor() {
    try {
      const stored = localStorage.getItem(this.tronStorageKey());
      const checkpoint: unknown = stored ? JSON.parse(stored) : null;
      if (isTronCheckpoint(checkpoint)) this.tronCheckpoint.set(checkpoint);
    } catch { /* No saved checkpoint on this device. */ }
  }

  private tronStorageKey(): string {
    return 'zwift-tron-checkpoint.v1.' + this.authState().athleteId;
  }

  editTronCheckpoint(): void {
    this.tronMeters = this.tronProgress()?.meters ?? null;
    this.tronError.set('');
    this.tronEditing.set(true);
  }

  saveTronCheckpoint(): void {
    const meters = this.tronMeters;
    if (typeof meters !== 'number' || !Number.isFinite(meters) ||
        !Number.isInteger(meters) || meters < 0 || meters > 50000) {
      this.tronError.set('Enter a whole number between 0 and 50,000 metres.');
      return;
    }
    if (this.authState().isLoading) return;
    this.tronError.set('');
    // Capture a fresh lifetime baseline at the same time as the in-game reading.
    this.authService.sync(() => {
      const lifetimeClimbed = this.authState().totalClimbed;
      if (lifetimeClimbed === null) {
        this.tronError.set('Zwift did not return total climbing. Your checkpoint was not changed.');
        return;
      }
      const checkpoint = { meters, lifetimeClimbed };
      try {
        localStorage.setItem(this.tronStorageKey(), JSON.stringify(checkpoint));
      } catch {
        this.tronError.set('Could not save on this device. Please enable browser storage and try again.');
        return;
      }
      this.tronCheckpoint.set(checkpoint);
      this.tronEditing.set(false);
    });
  }

  filterMode = signal<FilterMode>('all');
  viewMode = signal<ViewMode>('list');
  selectedItem = signal<Unlockable | null>(null);

  enrichedItems = computed(() => {
    const xp = this.authState().currentXP;
    return UNLOCKABLES.map(item => ({
      ...item,
      imageUrl: this.imageMap.getImageUrl(item.name),
      unlocked: xp >= item.xp,
      xpToGo: xp >= item.xp ? 0 : item.xp - xp,
    }));
  });

  filteredItems = computed(() => {
    const items = this.enrichedItems();
    const mode = this.filterMode();
    if (mode === 'unlocked') return items.filter(i => i.unlocked);
    if (mode === 'locked') return items.filter(i => !i.unlocked);
    return items;
  });

  unlockedCount = computed(() => this.enrichedItems().filter(i => i.unlocked).length);
  lockedCount = computed(() => this.enrichedItems().filter(i => !i.unlocked).length);
  progressPercent = computed(() =>
    Math.round((this.unlockedCount() / this.enrichedItems().length) * 100)
  );

  nextUnlock = computed(() => {
    return this.enrichedItems().find(i => !i.unlocked) ?? null;
  });

  setFilter(mode: FilterMode): void {
    this.filterMode.set(mode);
  }

  setView(mode: ViewMode): void {
    this.viewMode.set(mode);
  }

  selectItem(item: Unlockable): void {
    this.selectedItem.set(item);
  }

  closeModal(): void {
    this.selectedItem.set(null);
  }

  sync(): void {
    this.authService.sync();
  }

  logout(): void {
    this.authService.logout();
  }

  formatXP(xp: number): string {
    return xp.toLocaleString();
  }

  trackByName(_index: number, item: Unlockable): string {
    return item.name + item.xp;
  }
}
