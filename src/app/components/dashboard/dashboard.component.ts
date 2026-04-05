import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  imports: [CommonModule, ItemModalComponent],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  private authService = inject(ZwiftAuthService);
  private imageMap = inject(ImageMapService);

  authState = toSignal(this.authService.state$, {
    initialValue: this.authService.state,
  });

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
