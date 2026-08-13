import { describe, it, expect } from 'vitest';
import { translations } from '../src/core/i18n/translations.js';

describe('i18n translations', () => {
  it('provides complete translations for en and es-AR', () => {
    expect(translations['en']).toBeDefined();
    expect(translations['es-AR']).toBeDefined();

    expect(translations['en'].leftTree.title).toBe('ARCHITECTURAL TREE');
    expect(translations['es-AR'].leftTree.title).toBe('ARBOL DE ARQUITECTURA');

    expect(translations['es-AR'].statusBar.search).toContain('[f] Buscar');
    expect(translations['es-AR'].settings.languageSection).toContain('IDIOMA');
  });
});
