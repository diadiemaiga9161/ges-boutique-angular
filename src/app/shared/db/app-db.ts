import Dexie, { Table } from 'dexie';

export interface CachedProduit {
  id?: number;
  nom: string;
  prixVente: number;
  prixAchat?: number;
  stock: number;
  seuilAlerte?: number;
  categorie?: string;
  boutiqueId: number;
  syncedAt: number;
}

export interface CachedVente {
  id?: number;
  localId?: string;
  reference?: string;
  montantTotal: number;
  dateVente: string;
  modePaiement: string;
  clientNom?: string;
  lignes?: any[];
  boutiqueId: number;
  synced: boolean;
  syncedAt: number;
}

export interface SyncOperation {
  id?: number;
  type: 'CREATE_VENTE' | 'CREATE_CREDIT' | 'UPDATE_PRODUIT';
  payload: string;
  createdAt: number;
  retries: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'DONE' | 'ERROR';
  error?: string;
}

export class AppDb extends Dexie {
  produits!: Table<CachedProduit>;
  ventes!: Table<CachedVente>;
  syncQueue!: Table<SyncOperation>;

  constructor() {
    super('GesBoutiqueDB');
    this.version(1).stores({
      produits: '++id, boutiqueId, nom, syncedAt',
      ventes: '++id, localId, boutiqueId, synced, syncedAt',
      syncQueue: '++id, type, status, createdAt'
    });
  }
}

export const db = new AppDb();
