import { BehaviorSubject, of, throwError } from 'rxjs';
import Swal from 'sweetalert2';
import { DepensesComponent } from './depenses.component';

/**
 * Page Dépenses : dépenses en attente de validation (caisse par sessions), totaux, droits du
 * bouton Valider, anti-doublon à la création. Le composant est créé sans gabarit (logique seule).
 */
describe('DepensesComponent — dépenses en attente', () => {
  let permissions: Record<string, boolean>;
  let depenseService: any;
  let paiementService: any;
  let boutiqueService: any;
  let mesPermissions$: BehaviorSubject<any>;
  let composant: DepensesComponent;

  const ancienne = { id: 1, nom: 'Loyer', montant: 1000, date: '2026-10-01', typeDepense: 'Loyer' };              // champ vide
  const effective = { id: 2, nom: 'Eau', montant: 300, date: '2026-10-02', typeDepense: 'Eau', sortieEnAttente: false };
  const enAttente = { id: 3, nom: 'Essence', montant: 700, date: '2026-10-03', typeDepense: 'Transport', sortieEnAttente: true };
  const annulee = { id: 4, nom: 'Erreur', montant: 5000, date: '2026-10-04', typeDepense: 'Eau', annulee: true, validee: true };

  beforeEach(() => {
    permissions = { DEPENSES_VOIR: true, DEPENSES_GERER: true, DEPENSES_SUPPRIMER: true };
    mesPermissions$ = new BehaviorSubject<any>({ actif: true, toutAutorise: true, permissions: [], roleNom: 'Gérant' });
    const roleService: any = { peut: (m: string, a: string) => !!permissions[`${m}_${a}`], mesPermissions$ };
    depenseService = {
      getAll: jasmine.createSpy('getAll').and.returnValue(of({ depenses: [], total: 0, totalEnAttente: 0, nombreEnAttente: 0 })),
      getTypes: () => of([]),
      creer: jasmine.createSpy('creer'),
      modifier: jasmine.createSpy('modifier'),
      formatPrice: (v: number) => `${v} FCFA`
    };
    paiementService = { getTous: jasmine.createSpy('getTous').and.returnValue(of([])) };
    boutiqueService = { getFonctionnalitesAvancees: jasmine.createSpy('fonctionnalites').and.returnValue(of([{ cle: 'CAISSE_SESSIONS', libelle: '', actif: false }])) };
    composant = new DepensesComponent(roleService, depenseService, paiementService, {} as any, boutiqueService);
    composant.depenses = [ancienne, effective, enAttente, annulee] as any;
    composant.paiementsEmploye = [{ id: 7, employeNomComplet: 'Awa', montant: 2000, datePaiement: '2026-10-05', statut: 'PAYE' }] as any;
    spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: false } as any));
  });

  it('reconnaît une dépense en attente (et seulement elle)', () => {
    expect(composant.estEnAttente(enAttente)).toBeTrue();
    expect(composant.estEnAttente(ancienne)).toBeFalse();
    expect(composant.estEnAttente(effective)).toBeFalse();
    expect(composant.estEnAttente({ ...enAttente, annulee: true })).toBeFalse();
  });

  it('total effectif : hors annulées et hors en attente ; salaires et anciennes comptés', () => {
    // 1000 (ancienne) + 300 (effective) + 2000 (salaire) ; 700 en attente et 5000 annulée exclus
    expect(composant.totalDepensesFiltrees).toBe(3300);
    expect(composant.depensesEnAttenteFiltrees.length).toBe(1);
    expect(composant.totalEnAttenteFiltrees).toBe(700);
  });

  it('résumé par type et moyenne ignorent les dépenses en attente', () => {
    const types = composant.resumeParTypeFiltrees.map(t => t.type);
    expect(types).not.toContain('Transport');
    // 5 lignes dont 1 en attente : 3300 / 4 (l'annulée reste comptée dans le nombre, comme avant)
    expect(composant.moyenneDepensesFiltrees).toBe(3300 / 4);
    composant.calculerTotauxParType();
    expect(composant.totauxParType.map(t => t.type)).not.toContain('Transport');
  });

  it('les filtres type et mois s\'appliquent aussi aux dépenses en attente', () => {
    composant.typeFiltre = 'Eau';
    expect(composant.depensesEnAttenteFiltrees.length).toBe(0);
    expect(composant.totalDepensesFiltrees).toBe(300);
    composant.typeFiltre = 'Transport';
    expect(composant.totalEnAttenteFiltrees).toBe(700);
    expect(composant.totalDepensesFiltrees).toBe(0);
  });

  it('sans aucune dépense en attente, totaux identiques à l\'ancien calcul', () => {
    composant.depenses = [ancienne, effective, annulee] as any;
    const ancienCalcul = composant.depensesFiltrees.filter((d: any) => !d.annulee).reduce((s: number, d: any) => s + d.montant, 0);
    expect(composant.totalDepensesFiltrees).toBe(ancienCalcul);
    expect(composant.depensesEnAttenteFiltrees.length).toBe(0);
    expect(composant.moyenneDepensesFiltrees).toBe(ancienCalcul / composant.depensesFiltrees.length);
  });

  it('bouton Valider : « supprimer » requis pour une dépense en attente, « modifier » sinon', () => {
    permissions['DEPENSES_SUPPRIMER'] = false; // caissier
    expect(composant.peutValider(enAttente)).toBeFalse();
    expect(composant.peutValider(effective)).toBeTrue();
    permissions['DEPENSES_SUPPRIMER'] = true;  // gérant
    expect(composant.peutValider(enAttente)).toBeTrue();
    permissions['DEPENSES_GERER'] = false;
    expect(composant.peutValider(effective)).toBeFalse();
  });

  it('anti-doublon : même identifiant après une erreur, nouveau après un succès', () => {
    composant.startCreate();
    composant.form = { nom: 'Essence', montant: 700, date: '2026-10-18' };
    depenseService.creer.and.returnValue(throwError(() => new Error('Réseau coupé')));
    composant.save();
    const id1 = depenseService.creer.calls.mostRecent().args[1];
    composant.save(); // nouvel essai de la même création
    const id2 = depenseService.creer.calls.mostRecent().args[1];
    expect(id1).toBeTruthy();
    expect(id2).toBe(id1);

    depenseService.creer.and.returnValue(of({ depense: { id: 9 }, validationRequise: false, message: '' }));
    composant.save();
    expect(depenseService.creer.calls.mostRecent().args[1]).toBe(id1);
    composant.startCreate(); // nouvelle dépense
    composant.form = { nom: 'Pain', montant: 100, date: '2026-10-18' };
    composant.save();
    expect(depenseService.creer.calls.mostRecent().args[1]).not.toBe(id1);
  });

  it('création en attente : fenêtre « en attente de validation », pas « déduit de la caisse »', () => {
    composant.startCreate();
    composant.form = { nom: 'Essence', montant: 700, date: '2026-10-18' };
    depenseService.creer.and.returnValue(of({ depense: enAttente, validationRequise: true, message: '' }));
    composant.save();
    const options: any = (Swal.fire as jasmine.Spy).calls.mostRecent().args[0];
    expect(options.title).toContain('en attente de validation');
    expect(options.html).toContain('Aucun argent n\'est encore sorti de la caisse');
    expect(options.timer).toBeUndefined();
  });

  it('création par le gérant : message historique conservé', () => {
    composant.startCreate();
    composant.form = { nom: 'Pain', montant: 100, date: '2026-10-18' };
    depenseService.creer.and.returnValue(of({ depense: { id: 10 }, validationRequise: false, message: 'Dépense enregistrée et déduite de la caisse' }));
    composant.save();
    const options: any = (Swal.fire as jasmine.Spy).calls.mostRecent().args[0];
    expect(options.title).toBe('Dépense créée');
    expect(options.text).toBe('Le montant a été déduit de la caisse.');
  });

  it('modification d\'une dépense en attente : la caisse n\'a pas bougé', () => {
    composant.startEdit(enAttente as any);
    depenseService.modifier.and.returnValue(of(enAttente));
    composant.save();
    const options: any = (Swal.fire as jasmine.Spy).calls.mostRecent().args[0];
    expect(options.text).toContain('la caisse n\'a pas bougé');
  });

  it('suppression d\'une dépense en attente : message sans remise en caisse', () => {
    composant.supprimer(enAttente as any);
    const options: any = (Swal.fire as jasmine.Spy).calls.mostRecent().args[0];
    expect(options.html).toContain('la caisse ne changera pas');
    composant.supprimer(effective as any);
    const options2: any = (Swal.fire as jasmine.Spy).calls.mostRecent().args[0];
    expect(options2.html).toContain('Le montant sera remis en caisse');
  });

  it('validation d\'une dépense en attente : annonce la sortie d\'argent', () => {
    composant.valider(enAttente as any);
    const options: any = (Swal.fire as jasmine.Spy).calls.mostRecent().args[0];
    expect(options.html).toContain('vont sortir de la caisse maintenant');
    composant.valider(effective as any);
    const options2: any = (Swal.fire as jasmine.Spy).calls.mostRecent().args[0];
    expect(options2.html).not.toContain('vont sortir de la caisse');
  });

  // ------------------------------------------------------------------ rôle Caissier, rechargement, texte du formulaire

  const refus403 = () => throwError(() => ({ status: 403, message: 'Http failure response: 403' }));
  const erreur500 = () => throwError(() => ({ status: 500, message: 'Erreur serveur sur les salaires' }));

  it('1. caissier : les dépenses s\'affichent malgré le 403 sur les salaires, avec une note', () => {
    depenseService.getAll.and.returnValue(of({ depenses: [enAttente, effective], total: 300, totalEnAttente: 700, nombreEnAttente: 1 }));
    paiementService.getTous.and.returnValue(refus403());
    composant.load();
    expect(composant.depenses.length).toBe(2);
    expect(composant.salairesIndisponibles).toBeTrue();
    expect(composant.paiementsEmploye.length).toBe(0);
    expect(composant.totalDepensesFiltrees).toBe(300);
    expect(composant.loading).toBeFalse();
    expect(Swal.fire).not.toHaveBeenCalled();
  });

  it('2. les autres erreurs de chargement restent affichées (salaires 500, liste en erreur, filtre)', () => {
    paiementService.getTous.and.returnValue(erreur500());
    composant.load();
    expect((Swal.fire as jasmine.Spy).calls.mostRecent().args[0].text).toBe('Erreur serveur sur les salaires');
    expect(composant.salairesIndisponibles).toBeFalse();

    paiementService.getTous.and.returnValue(of([]));
    depenseService.getAll.and.returnValue(throwError(() => new Error('Erreur chargement dépenses')));
    composant.load();
    expect((Swal.fire as jasmine.Spy).calls.mostRecent().args[0].text).toBe('Erreur chargement dépenses');

    composant.dateDebut = '2026-10-01'; composant.dateFin = '2026-10-31';
    depenseService.getParPeriode = () => of({ depenses: [], total: 0, totalEnAttente: 0, nombreEnAttente: 0 });
    paiementService.getTous.and.returnValue(erreur500());
    composant.filtrer();
    expect((Swal.fire as jasmine.Spy).calls.mostRecent().args[0].text).toBe('Erreur serveur sur les salaires');
  });

  it('2b. filtre par période : le 403 sur les salaires ne bloque pas non plus', () => {
    composant.dateDebut = '2026-10-01'; composant.dateFin = '2026-10-31';
    depenseService.getParPeriode = () => of({ depenses: [effective], total: 300, totalEnAttente: 0, nombreEnAttente: 0 });
    paiementService.getTous.and.returnValue(refus403());
    composant.filtrer();
    expect(composant.depenses.length).toBe(1);
    expect(composant.salairesIndisponibles).toBeTrue();
    expect(Swal.fire).not.toHaveBeenCalled();
  });

  it('3. dépense créée puis rechargement en échec : jamais recréée, bande « non actualisée », Réessayer relit seulement', async () => {
    let fermerConfirmation!: (v: any) => void;
    (Swal.fire as jasmine.Spy).and.callFake(() => new Promise(res => fermerConfirmation = res));
    composant.depenses = [ancienne] as any;
    composant.startCreate();
    composant.form = { nom: 'Essence', montant: 700, date: '2026-10-18' };
    depenseService.creer.and.returnValue(of({ depense: enAttente, validationRequise: true, message: '' }));
    depenseService.getAll.and.returnValue(throwError(() => new Error('Réseau coupé')));
    composant.save();

    // La liste n'est relue qu'une fois la confirmation fermée : rien ne peut la remplacer avant.
    expect(depenseService.getAll).not.toHaveBeenCalled();
    fermerConfirmation({ isConfirmed: true });
    await new Promise(r => setTimeout(r));
    expect(depenseService.getAll).toHaveBeenCalledTimes(1);

    expect(depenseService.creer).toHaveBeenCalledTimes(1);
    expect(composant.listeNonActualisee).toBeTrue();
    expect(composant.depenses).toEqual([ancienne] as any);
    const fenetres = (Swal.fire as jasmine.Spy).calls.allArgs().map(a => a[0] as any);
    expect(fenetres.length).toBe(1);
    expect(fenetres[0].title).toContain('en attente de validation');

    depenseService.getAll.and.returnValue(of({ depenses: [ancienne, enAttente], total: 1000, totalEnAttente: 700, nombreEnAttente: 1 }));
    composant.reessayerChargement();
    expect(composant.listeNonActualisee).toBeFalse();
    expect(composant.depenses.length).toBe(2);
    expect(depenseService.creer).toHaveBeenCalledTimes(1);
  });

  it('3b. Réessayer qui échoue encore : la bande reste, aucune fenêtre d\'erreur, aucune création', () => {
    depenseService.getAll.and.returnValue(throwError(() => new Error('Toujours coupé')));
    composant.reessayerChargement();
    expect(composant.listeNonActualisee).toBeTrue();
    expect(Swal.fire).not.toHaveBeenCalled();
    expect(depenseService.creer).not.toHaveBeenCalled();
  });

  it('4. texte du formulaire : « en attente » si la caisse par sessions est active et le rôle limité', () => {
    boutiqueService.getFonctionnalitesAvancees.and.returnValue(of([{ cle: 'CAISSE_SESSIONS', libelle: '', actif: true }]));
    mesPermissions$.next({ actif: true, toutAutorise: false, permissions: ['DEPENSES_GERER'], roleNom: 'Caissier' });
    composant.ngOnInit();
    expect(composant.comportementCreation).toBe('attente');
  });

  it('5. gérant (tous les droits) : texte « déduit de la caisse »', () => {
    boutiqueService.getFonctionnalitesAvancees.and.returnValue(of([{ cle: 'CAISSE_SESSIONS', libelle: '', actif: true }]));
    mesPermissions$.next({ actif: true, toutAutorise: true, permissions: [], roleNom: 'Gérant' });
    composant.ngOnInit();
    expect(composant.comportementCreation).toBe('immediat');
  });

  it('6. mode historique (caisse par sessions éteinte) : texte « déduit », salaires chargés, ni note ni bande', () => {
    composant.ngOnInit();
    expect(composant.comportementCreation).toBe('immediat');
    expect(composant.salairesIndisponibles).toBeFalse();
    expect(composant.listeNonActualisee).toBeFalse();
    composant.ngOnDestroy();
  });

  it('comportement incertain : texte neutre (fonctions illisibles, droits non confirmés, clé absente)', () => {
    boutiqueService.getFonctionnalitesAvancees.and.returnValue(throwError(() => new Error('réseau')));
    composant.ngOnInit();
    expect(composant.comportementCreation).toBe('inconnu');

    boutiqueService.getFonctionnalitesAvancees.and.returnValue(of([{ cle: 'CAISSE_SESSIONS', libelle: '', actif: true }]));
    mesPermissions$.next({ actif: false, toutAutorise: true, permissions: [], roleNom: '' });
    composant.ngOnInit();
    expect(composant.comportementCreation).toBe('inconnu');

    boutiqueService.getFonctionnalitesAvancees.and.returnValue(of([]));
    composant.ngOnInit();
    expect(composant.comportementCreation).toBe('inconnu');
  });

  // ------------------------------------------------------------------ I2 : tentative au résultat inconnu

  const perdue = () => throwError(() => Object.assign(new Error('Erreur création dépense'), { status: 0 }));
  const refusee = () => throwError(() => Object.assign(new Error('Le montant doit être supérieur à 0'), { status: 400 }));
  const succes = (d: any = { id: 50 }) => of({ depense: d, validationRequise: false, message: 'Dépense enregistrée et déduite de la caisse' });
  const dernierId = () => depenseService.creer.calls.mostRecent().args[1];
  const derniereDemande = () => depenseService.creer.calls.mostRecent().args[0];

  it('I2-1. erreur réseau puis nouvel essai : identifiant identique', () => {
    composant.startCreate();
    composant.form = { nom: 'Essence', montant: 700, date: '2026-10-18' };
    depenseService.creer.and.returnValue(perdue());
    composant.save();
    const id1 = dernierId();
    composant.save();
    expect(dernierId()).toBe(id1);
    expect(composant.tentativeIncertaine?.identifiant).toBe(id1);
  });

  it('I2-2. fermeture puis réouverture après une erreur : même identifiant, même demande, champs bloqués', () => {
    composant.startCreate();
    composant.form = { nom: 'Essence', montant: 700, date: '2026-10-18' };
    depenseService.creer.and.returnValue(perdue());
    composant.save();
    const id1 = dernierId();
    const fenetre: any = (Swal.fire as jasmine.Spy).calls.mostRecent().args[0];
    expect(fenetre.title).toBe('Résultat inconnu');

    composant.cancel();
    composant.startCreate();
    expect(composant.enRepriseIncertaine).toBeTrue();
    expect(composant.form).toEqual({ nom: 'Essence', montant: 700, date: '2026-10-18' });

    composant.form.montant = 9999; // une modification ne doit pas partir avec l'ancien identifiant
    depenseService.creer.and.returnValue(succes());
    composant.save();
    expect(dernierId()).toBe(id1);
    expect(derniereDemande().montant).toBe(700);
    expect(composant.tentativeIncertaine).toBeNull();
  });

  it('I2-3. succès confirmé puis nouvelle dépense : nouvel identifiant', () => {
    composant.startCreate();
    composant.form = { nom: 'Pain', montant: 100, date: '2026-10-18' };
    depenseService.creer.and.returnValue(succes());
    composant.save();
    const id1 = dernierId();
    composant.startCreate();
    expect(composant.enRepriseIncertaine).toBeFalse();
    composant.form = { nom: 'Lait', montant: 200, date: '2026-10-18' };
    composant.save();
    expect(dernierId()).not.toBe(id1);
  });

  it('I2-4. réponse « déjà enregistrée » : confirmation cohérente, tentative levée, liste relue ensuite', async () => {
    let fermer!: (v: any) => void;
    composant.startCreate();
    composant.form = { nom: 'Essence', montant: 700, date: '2026-10-18' };
    depenseService.creer.and.returnValue(perdue());
    composant.save();
    const id1 = dernierId();
    composant.cancel();
    composant.startCreate();

    (Swal.fire as jasmine.Spy).and.callFake(() => new Promise(res => fermer = res));
    depenseService.getAll.calls.reset();
    depenseService.creer.and.returnValue(of({ depense: { id: 51, nom: 'Essence', montant: 700 }, validationRequise: false, message: 'Dépense déjà enregistrée' }));
    composant.save();
    expect(dernierId()).toBe(id1);
    const fenetre: any = (Swal.fire as jasmine.Spy).calls.mostRecent().args[0];
    expect(fenetre.title).toBe('Dépense déjà enregistrée');
    expect(fenetre.text).toContain('pas été ajoutée une deuxième fois');
    expect(fenetre.text).not.toContain('attend la validation'); // dépense du gérant : argent déjà sorti
    expect(composant.tentativeIncertaine).toBeNull();
    expect(depenseService.getAll).not.toHaveBeenCalled();
    fermer({ isConfirmed: true });
    await new Promise(r => setTimeout(r));
    expect(depenseService.getAll).toHaveBeenCalledTimes(1);
  });

  it('I2-5. abandon explicite : confirmation demandée, liste relue, nouvel identifiant pour la nouvelle dépense', async () => {
    composant.startCreate();
    composant.form = { nom: 'Essence', montant: 700, date: '2026-10-18' };
    depenseService.creer.and.returnValue(perdue());
    composant.save();
    const id1 = dernierId();

    // Refus de l'abandon : la tentative est gardée
    (Swal.fire as jasmine.Spy).and.returnValue(Promise.resolve({ isConfirmed: false } as any));
    composant.abandonnerTentative();
    await new Promise(r => setTimeout(r));
    expect(composant.tentativeIncertaine?.identifiant).toBe(id1);

    // Abandon confirmé
    (Swal.fire as jasmine.Spy).and.returnValue(Promise.resolve({ isConfirmed: true } as any));
    depenseService.getAll.calls.reset();
    composant.abandonnerTentative();
    const avertissement: any = (Swal.fire as jasmine.Spy).calls.mostRecent().args[0];
    expect(avertissement.html).toContain('Vérifiez d\'abord la liste');
    await new Promise(r => setTimeout(r));
    expect(composant.tentativeIncertaine).toBeNull();
    expect(composant.enRepriseIncertaine).toBeFalse();
    expect(depenseService.getAll).toHaveBeenCalledTimes(1);

    composant.form = { nom: 'Gaz', montant: 300, date: '2026-10-18' };
    depenseService.creer.and.returnValue(succes());
    composant.save();
    expect(dernierId()).not.toBe(id1);
    expect(derniereDemande().nom).toBe('Gaz');
  });

  it('I2-4b. « déjà enregistrée » pour une dépense en attente : la fenêtre le rappelle', () => {
    composant.startCreate();
    composant.form = { nom: 'Essence', montant: 700, date: '2026-10-18' };
    depenseService.creer.and.returnValue(of({ depense: { id: 52, sortieEnAttente: true }, validationRequise: true, message: 'Dépense déjà enregistrée' }));
    composant.save();
    const fenetre: any = (Swal.fire as jasmine.Spy).calls.mostRecent().args[0];
    expect(fenetre.title).toBe('Dépense déjà enregistrée');
    expect(fenetre.text).toContain('attend la validation du gérant');
  });

  it('I2-6. refus certain (4xx) : pas de tentative incertaine, saisie modifiable, message du serveur', () => {
    composant.startCreate();
    composant.form = { nom: 'Essence', montant: 700, date: '2026-10-18' };
    depenseService.creer.and.returnValue(refusee());
    composant.save();
    expect(composant.tentativeIncertaine).toBeNull();
    expect(composant.enRepriseIncertaine).toBeFalse();
    expect((Swal.fire as jasmine.Spy).calls.mostRecent().args[0].text).toBe('Le montant doit être supérieur à 0');
  });

  it('I2-7. erreur serveur 500 : résultat incertain (la dépense a pu être enregistrée)', () => {
    composant.startCreate();
    composant.form = { nom: 'Essence', montant: 700, date: '2026-10-18' };
    depenseService.creer.and.returnValue(throwError(() => Object.assign(new Error('Erreur serveur'), { status: 500 })));
    composant.save();
    expect(composant.tentativeIncertaine).not.toBeNull();
  });
});
