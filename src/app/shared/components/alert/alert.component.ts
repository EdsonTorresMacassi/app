import { CommonModule } from '@angular/common';
import { Component, Input, computed, signal } from '@angular/core';
import { LucideAngularModule, AlertCircle, CheckCircle2, HelpCircle, Info, TriangleAlert, X } from 'lucide-angular';

export type AlertVariant = 'error' | 'success' | 'warning' | 'info' | 'question';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.scss',
})
export class AlertComponent {
  @Input() variant: AlertVariant = 'info';
  @Input() title = '';
  @Input() description = '';
  @Input() dismissible = false;
  @Input() bordered = true;

  protected readonly visible = signal(true);
  protected readonly CheckCircle2Icon = CheckCircle2;
  protected readonly AlertCircleIcon = AlertCircle;
  protected readonly TriangleAlertIcon = TriangleAlert;
  protected readonly InfoIcon = Info;
  protected readonly HelpCircleIcon = HelpCircle;
  protected readonly CloseIcon = X;

  protected readonly alertClasses = computed(() => {
    let base = 'flex gap-3 rounded-xl px-4 py-4 text-sm shadow-sm';
    if (this.bordered) base += ' border';
    else base += ' border border-transparent';

    let color = '';
    switch(this.variant) {
      case 'success': color = 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-800/50 dark:text-emerald-300'; break;
      case 'error': color = 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-900/20 dark:border-rose-800/50 dark:text-rose-300'; break;
      case 'warning': color = 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-800/50 dark:text-amber-300'; break;
      case 'info': color = 'bg-sky-50 border-sky-200 text-sky-800 dark:bg-sky-900/20 dark:border-sky-800/50 dark:text-sky-300'; break;
      case 'question': color = 'bg-corporate-primary/10 border-corporate-primary/20 text-corporate-primary dark:bg-corporate-primary/20 dark:border-corporate-primary/30 dark:text-corporate-primary-light'; break;
    }

    return `${base} ${color}`;
  });

  protected readonly iconClasses = computed(() => {
    let base = 'mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full';
    let color = '';
    switch(this.variant) {
      case 'success': color = 'bg-emerald-100 text-emerald-600 dark:bg-emerald-800/50 dark:text-emerald-400'; break;
      case 'error': color = 'bg-rose-100 text-rose-600 dark:bg-rose-800/50 dark:text-rose-400'; break;
      case 'warning': color = 'bg-amber-100 text-amber-600 dark:bg-amber-800/50 dark:text-amber-400'; break;
      case 'info': color = 'bg-sky-100 text-sky-600 dark:bg-sky-800/50 dark:text-sky-400'; break;
      case 'question': color = 'bg-corporate-primary/20 text-corporate-primary dark:bg-corporate-primary/30 dark:text-corporate-primary-light'; break;
    }
    return `${base} ${color}`;
  });

  protected readonly closeBtnClasses = computed(() => {
    let base = 'inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors';
    let color = '';
    switch(this.variant) {
      case 'success': color = 'text-emerald-500 hover:bg-emerald-100 hover:text-emerald-800 dark:hover:bg-emerald-800/50 dark:hover:text-emerald-200'; break;
      case 'error': color = 'text-rose-500 hover:bg-rose-100 hover:text-rose-800 dark:hover:bg-rose-800/50 dark:hover:text-rose-200'; break;
      case 'warning': color = 'text-amber-500 hover:bg-amber-100 hover:text-amber-800 dark:hover:bg-amber-800/50 dark:hover:text-amber-200'; break;
      case 'info': color = 'text-sky-500 hover:bg-sky-100 hover:text-sky-800 dark:hover:bg-sky-800/50 dark:hover:text-sky-200'; break;
      case 'question': color = 'text-corporate-primary hover:bg-corporate-primary/20 hover:text-corporate-primary-dark dark:hover:bg-corporate-primary/30'; break;
    }
    return `${base} ${color}`;
  });

  protected readonly icon = computed(() => {
    switch (this.variant) {
      case 'success': return this.CheckCircle2Icon;
      case 'error': return this.AlertCircleIcon;
      case 'warning': return this.TriangleAlertIcon;
      case 'question': return this.HelpCircleIcon;
      case 'info': default: return this.InfoIcon;
    }
  });

  protected readonly hasStructuredContent = computed(() => {
    return Boolean(this.title || this.description);
  });

  close(): void {
    this.visible.set(false);
  }
}
