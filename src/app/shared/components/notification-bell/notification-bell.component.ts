import { Component, OnInit, OnDestroy, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { NotificationsService, Notification } from '../../services/notification/notification.service';

@Component({
  selector: 'app-notification-bell',
  templateUrl: './notification-bell.component.html',
  styleUrls: ['./notification-bell.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class NotificationBellComponent implements OnInit, OnDestroy {

  count = 0;
  notifications: Notification[] = [];
  ouvert = false;
  private subs: Subscription[] = [];

  constructor(
    private notifService: NotificationsService,
    private router: Router,
    private el: ElementRef
  ) {}

  @HostListener('document:click', ['$event'])
  onDocClick(e: Event): void {
    if (!this.el.nativeElement.contains(e.target)) this.ouvert = false;
  }

  ngOnInit(): void {
    this.subs.push(
      this.notifService.count$.subscribe(c => this.count = c),
      this.notifService.nonLues$.subscribe(n => this.notifications = n)
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  toggle(): void {
    this.ouvert = !this.ouvert;
  }

  fermer(): void {
    this.ouvert = false;
  }

  cliquer(n: Notification): void {
    this.notifService.marquerLue(n.id).subscribe();
    this.ouvert = false;
    if (n.lien) this.router.navigateByUrl(n.lien);
  }

  toutLire(): void {
    this.notifService.marquerToutesLues().subscribe();
  }

  icone(type: string): string {
    const map: Record<string, string> = {
      STOCK_FAIBLE: 'i-Bar-Chart',
      RUPTURE_STOCK: 'i-Warning',
      TRANSFERT_RECU: 'i-Arrow-Right',
      TRANSFERT_MODIFIE: 'i-Pen-2',
      TRANSFERT_CONFIRME: 'i-Check',
    };
    return map[type] ?? 'i-Bell';
  }

  couleur(type: string): string {
    if (type === 'RUPTURE_STOCK') return 'danger';
    if (type === 'STOCK_FAIBLE') return 'warning';
    if (type === 'TRANSFERT_CONFIRME') return 'success';
    return 'info';
  }
}
