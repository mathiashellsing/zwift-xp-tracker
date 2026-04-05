import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Unlockable } from '../../models/unlockable.model';

@Component({
  selector: 'app-item-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './item-modal.component.html',
})
export class ItemModalComponent {
  @Input() item!: Unlockable;
  @Output() close = new EventEmitter<void>();

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.close.emit();
    }
  }
}
