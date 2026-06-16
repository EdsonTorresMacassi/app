import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-button',
  imports: [],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
})
export class ButtonComponent {
  type = input<'button' | 'submit' | 'reset'>('button');
  variant = input<'primary' | 'secondary' | 'success' | 'error' | 'link'>('primary');
  size = input<'sm' | 'md' | 'lg'>('md');
  disabled = input<boolean>(false);
  loading = input<boolean>(false);
  fullWidth = input<boolean>(false);
  circle = input<boolean>(false);

  clicked = output<Event>();

  handleClick(event: Event): void {
    if (!this.disabled() && !this.loading()) {
      this.clicked.emit(event);
    }
  }

  getButtonClasses(): string {
    const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed';
    
    let sizeClass = 'px-4 py-2.5 text-sm';
    if (this.size() === 'sm') sizeClass = 'px-3 py-1.5 text-xs';
    if (this.size() === 'lg') sizeClass = 'px-6 py-3 text-base';
    
    if (this.circle()) {
      sizeClass = 'p-0 aspect-square rounded-full';
      if (this.size() === 'sm') sizeClass += ' w-8 h-8';
      if (this.size() === 'md') sizeClass += ' w-10 h-10';
      if (this.size() === 'lg') sizeClass += ' w-12 h-12';
    }

    let colorClass = 'bg-corporate-primary text-white hover:bg-corporate-primary/90 focus:ring-corporate-primary/50';
    if (this.variant() === 'secondary') colorClass = 'bg-slate-200 text-slate-800 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600 focus:ring-slate-300';
    if (this.variant() === 'error') colorClass = 'bg-rose-500 text-white hover:bg-rose-600 focus:ring-rose-500/50';
    if (this.variant() === 'success') colorClass = 'bg-emerald-500 text-white hover:bg-emerald-600 focus:ring-emerald-500/50';
    if (this.variant() === 'link') colorClass = 'bg-transparent text-corporate-primary hover:underline hover:text-corporate-primary/80 shadow-none focus:ring-0 px-0 py-0';

    const widthClass = this.fullWidth() ? 'w-full' : '';

    return `${base} ${sizeClass} ${colorClass} ${widthClass}`;
  }
}
