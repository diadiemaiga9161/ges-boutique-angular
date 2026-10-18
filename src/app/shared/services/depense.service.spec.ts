import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { DepenseService } from './depense.service';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

describe('DepenseService (dépenses en attente, anti-doublon)', () => {
  let service: DepenseService;
  let http: HttpTestingController;
  const url = `${environment.apiUrl}/depenses`;
  const demande = { nom: 'Essence', montant: 700, date: '2026-10-18' };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DepenseService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: { getToken: () => 'jeton' } }
      ]
    });
    service = TestBed.inject(DepenseService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lit les totaux du serveur, y compris les dépenses en attente', () => {
    let liste: any;
    service.getAll().subscribe(r => liste = r);
    http.expectOne(url).flush({ success: true, depenses: [{ id: 1 }], total: 1200, totalEnAttente: 700, nombreEnAttente: 1 });
    expect(liste).toEqual({ depenses: [{ id: 1 }], total: 1200, totalEnAttente: 700, nombreEnAttente: 1 });
  });

  it('ancien serveur sans totaux en attente : 0 par défaut', () => {
    let liste: any;
    service.getParPeriode('2026-10-01', '2026-10-31').subscribe(r => liste = r);
    http.expectOne(r => r.url === `${url}/periode`).flush({ success: true, depenses: [], total: 50 });
    expect(liste.totalEnAttente).toBe(0);
    expect(liste.nombreEnAttente).toBe(0);
    expect(liste.total).toBe(50);
  });

  it('envoie X-Client-Request-ID, le même pour un nouvel essai de la même création', () => {
    service.creer(demande, 'id-fixe-1').subscribe({ error: () => {} });
    const essai1 = http.expectOne(url);
    expect(essai1.request.headers.get('X-Client-Request-ID')).toBe('id-fixe-1');
    expect(essai1.request.headers.get('Authorization')).toBe('Bearer jeton');
    essai1.error(new ProgressEvent('network'));

    let resultat: any;
    service.creer(demande, 'id-fixe-1').subscribe(r => resultat = r);
    const essai2 = http.expectOne(url);
    expect(essai2.request.headers.get('X-Client-Request-ID')).toBe('id-fixe-1');
    essai2.flush({ success: true, message: 'Dépense déjà enregistrée', depense: { id: 9, sortieEnAttente: true } });
    expect(resultat.message).toBe('Dépense déjà enregistrée');
    expect(resultat.validationRequise).toBeTrue();
  });

  it('sans identifiant fourni, en génère un (deux créations différentes = deux identifiants)', () => {
    service.creer(demande).subscribe();
    service.creer(demande).subscribe();
    const reqs = http.match(url);
    const a = reqs[0].request.headers.get('X-Client-Request-ID');
    const b = reqs[1].request.headers.get('X-Client-Request-ID');
    expect(a).toBeTruthy();
    expect(a).not.toEqual(b);
    reqs.forEach(r => r.flush({ depense: {} }));
  });

  it('création : validationRequise du serveur est conservée avec le message', () => {
    let r: any;
    service.creer(demande, 'x').subscribe(v => r = v);
    http.expectOne(url).flush({
      success: true, validationRequise: true, depense: { id: 3, sortieEnAttente: true },
      message: 'Dépense notée. Elle doit être validée par le gérant pour être prise en compte.'
    });
    expect(r.validationRequise).toBeTrue();
    expect(r.depense.id).toBe(3);
    expect(r.message).toContain('validée par le gérant');
  });

  it('création par le gérant (argent sorti) : validationRequise faux', () => {
    expect(DepenseService.versResultatCreation({ validationRequise: false, depense: { id: 4 } }).validationRequise).toBeFalse();
    expect(DepenseService.versResultatCreation({ depense: { id: 5, sortieEnAttente: null } }).validationRequise).toBeFalse();
  });
});
