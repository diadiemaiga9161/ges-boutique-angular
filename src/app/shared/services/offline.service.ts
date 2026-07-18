import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { fromEvent, merge, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { db, SyncOperation } from '../db/app-db';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class OfflineService {
  isOnline = signal(navigator.onLine);
  pendingCount = signal(0);

  constructor(private http: HttpClient) {
    merge(
      fromEvent(window, 'online').pipe(map(() => true)),
      fromEvent(window, 'offline').pipe(map(() => false))
    ).subscribe(online => {
      this.isOnline.set(online);
      if (online) {
        this.syncPendingOperations();
      }
    });

    this.refreshPendingCount();

    // Sync toutes les 30 secondes si online
    setInterval(() => {
      if (this.isOnline()) {
        this.syncPendingOperations();
      }
    }, 30000);
  }

  async refreshPendingCount(): Promise<void> {
    const count = await db.syncQueue.where('status').anyOf(['PENDING', 'ERROR']).count();
    this.pendingCount.set(count);
  }

  async cacherProduits(produits: any[], boutiqueId: number): Promise<void> {
    const toCache = produits.map(p => ({ ...p, boutiqueId, syncedAt: Date.now() }));
    await db.produits.where('boutiqueId').equals(boutiqueId).delete();
    await db.produits.bulkPut(toCache);
  }

  async getProduitsCaches(boutiqueId: number): Promise<any[]> {
    return db.produits.where('boutiqueId').equals(boutiqueId).toArray();
  }

  async ajouterOperation(op: Omit<SyncOperation, 'id' | 'retries' | 'status'>): Promise<void> {
    await db.syncQueue.add({ ...op, retries: 0, status: 'PENDING' });
    await this.refreshPendingCount();
  }

  async syncPendingOperations(): Promise<void> {
    const pending = await db.syncQueue
      .where('status')
      .anyOf(['PENDING', 'ERROR'])
      .limit(10)
      .toArray();

    for (const op of pending) {
      await db.syncQueue.update(op.id!, { status: 'IN_PROGRESS' });
      try {
        const payload = JSON.parse(op.payload);
        await this.executeOperation(op.type, payload);
        await db.syncQueue.update(op.id!, { status: 'DONE' });
      } catch (err: any) {
        const retries = (op.retries || 0) + 1;
        await db.syncQueue.update(op.id!, {
          status: retries >= 3 ? 'ERROR' : 'PENDING',
          retries,
          error: err?.message || 'Erreur inconnue'
        });
      }
    }
    await this.refreshPendingCount();
  }

  private async executeOperation(type: string, payload: any): Promise<void> {
    switch (type) {
      case 'CREATE_VENTE':
        await this.http.post(`${environment.apiUrl}/ventes`, payload).toPromise();
        break;
      case 'CREATE_CREDIT':
        await this.http.post(`${environment.apiUrl}/credits`, payload).toPromise();
        break;
    }
  }

  getProduits(boutiqueId: number): Observable<any[]> {
    if (this.isOnline()) {
      return this.http.get<any[]>(`${environment.apiUrl}/produits`);
    }
    return new Observable(obs => {
      this.getProduitsCaches(boutiqueId).then(p => {
        obs.next(p);
        obs.complete();
      });
    });
  }
}
