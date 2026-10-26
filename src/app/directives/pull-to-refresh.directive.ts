import {
  AfterViewInit, Directive, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, Output, inject,
} from '@angular/core';

export const PULL_REFRESH_THRESHOLD = 64;

@Directive({ selector: '[appPullToRefresh]', standalone: true })
export class PullToRefreshDirective implements AfterViewInit, OnChanges, OnDestroy {
  @Input() refreshDisabled = false;
  @Output() refreshRequested = new EventEmitter<void>();
  @Output() pullDistanceChange = new EventEmitter<number>();

  private element = inject<ElementRef<HTMLElement>>(ElementRef);
  private listeners = new AbortController();
  private startX = 0;
  private startY = 0;
  private tracking = false;
  private distance = 0;

  ngAfterViewInit(): void {
    const root = this.element.nativeElement;
    const signal = this.listeners.signal;
    root.addEventListener('touchstart', this.onStart, { passive: true, signal });
    root.addEventListener('touchmove', this.onMove, { passive: false, signal });
    root.addEventListener('touchend', this.onEnd, { passive: true, signal });
    root.addEventListener('touchcancel', this.onCancel, { passive: true, signal });
  }

  ngOnChanges(): void {
    if (this.refreshDisabled) this.reset();
  }

  ngOnDestroy(): void {
    this.listeners.abort();
  }

  private atTop(): boolean {
    return (this.element.nativeElement.ownerDocument.scrollingElement?.scrollTop ?? 0) <= 0;
  }

  private setDistance(distance: number): void {
    this.distance = distance;
    this.pullDistanceChange.emit(distance);
  }

  private reset(): void {
    this.tracking = false;
    this.setDistance(0);
  }

  private onStart = (event: TouchEvent): void => {
    this.reset();
    if (this.refreshDisabled || event.touches.length !== 1 || !this.atTop()) return;
    const target = event.target as HTMLElement | null;
    if (target?.closest('input, textarea, select, button, a, [contenteditable], [role="button"]')) return;
    // Leave gestures in independently scrollable content to that content.
    for (let node = target; node && node !== this.element.nativeElement; node = node.parentElement) {
      const overflow = node.ownerDocument.defaultView?.getComputedStyle(node).overflowY;
      if ((overflow === 'auto' || overflow === 'scroll') && node.scrollHeight > node.clientHeight) return;
    }
    this.startX = event.touches[0].clientX;
    this.startY = event.touches[0].clientY;
    this.tracking = true;
  };

  private onMove = (event: TouchEvent): void => {
    if (!this.tracking) return;
    if (this.refreshDisabled || event.touches.length !== 1 || !this.atTop()) {
      this.reset();
      return;
    }
    const dy = event.touches[0].clientY - this.startY;
    const dx = Math.abs(event.touches[0].clientX - this.startX);
    if (dy < 0 || (dx > 8 && dx > dy)) {
      this.reset();
      return;
    }
    if (dy <= 8 || dy < dx * 1.25) {
      this.setDistance(0);
      return;
    }
    if (!event.cancelable) {
      this.reset();
      return;
    }
    event.preventDefault();
    this.setDistance(Math.min(112, dy * 0.5));
  };

  private onEnd = (): void => {
    const refresh = this.tracking && !this.refreshDisabled &&
      this.atTop() && this.distance >= PULL_REFRESH_THRESHOLD;
    this.reset();
    if (refresh) this.refreshRequested.emit();
  };

  private onCancel = (): void => this.reset();
}
