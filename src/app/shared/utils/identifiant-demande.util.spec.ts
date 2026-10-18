import { nouvelIdentifiantDemande } from './identifiant-demande.util';

describe('nouvelIdentifiantDemande', () => {
  const FORMAT = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

  it('rend un identifiant au format UUID v4, différent à chaque appel', () => {
    const a = nouvelIdentifiantDemande();
    const b = nouvelIdentifiantDemande();
    expect(a).toMatch(FORMAT);
    expect(b).toMatch(FORMAT);
    expect(a).not.toEqual(b);
  });

  it('fonctionne sans crypto.randomUUID (page servie en http)', () => {
    const original = (crypto as any).randomUUID;
    Object.defineProperty(crypto, 'randomUUID', { value: undefined, configurable: true, writable: true });
    try {
      const ids = new Set(Array.from({ length: 50 }, () => nouvelIdentifiantDemande()));
      ids.forEach(id => expect(id).toMatch(FORMAT));
      expect(ids.size).toBe(50);
    } finally {
      Object.defineProperty(crypto, 'randomUUID', { value: original, configurable: true, writable: true });
    }
  });
});
