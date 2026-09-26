/**
 * Résout une clé de thème (wizard / événement) vers une palette du modèle.
 * Les modèles n’exposent pas les mêmes clés (Élégance vs Hiver).
 */

import type { TemplateDefinition, TemplateThemeDefinition } from './registry';

/** Alias wizard → clés Hiver. */
const HIVER_FROM_SETUP: Record<string, string> = {
  sauge: 'givre',
  champagne: 'navyGold',
  rose: 'grenat',
  marine: 'navyGold',
  bordeaux: 'grenat',
  noir: 'minuit',
};

/** Alias wizard → clés Élégance (identité). */
const ELEGANCE_FROM_SETUP: Record<string, string> = {
  sauge: 'sauge',
  champagne: 'champagne',
  rose: 'rose',
  marine: 'marine',
  bordeaux: 'bordeaux',
  noir: 'noir',
};

const BIRTHDAY_FROM_SETUP: Record<string, string> = {
  sauge: 'sauge',
  champagne: 'orCreme',
  rose: 'rose',
  marine: 'marine',
  bordeaux: 'bordeaux',
  noir: 'noir',
};

const EDITORIAL_FROM_SETUP: Record<string, string> = {
  sauge: 'sauge',
  champagne: 'avoine',
  rose: 'caramel',
  marine: 'encre',
  bordeaux: 'caramel',
  noir: 'encre',
};

const BOTANICAL_FROM_SETUP: Record<string, string> = {
  sauge: 'sauge',
  champagne: 'ivoire',
  rose: 'pivoine',
  marine: 'nuit',
  bordeaux: 'pivoine',
  noir: 'nuit',
};

const CONFERENCE_FROM_SETUP: Record<string, string> = {
  sauge: 'teal',
  champagne: 'slate',
  rose: 'slate',
  marine: 'navy',
  bordeaux: 'navy',
  noir: 'graphite',
};

export function resolveTemplateThemeKey(
  template: TemplateDefinition,
  eventThemeKey?: string | null,
): string {
  const raw = (eventThemeKey ?? '').trim();
  // Vide / « aucun » → palette d’origine du modèle.
  if (!raw || raw === 'aucun' || raw === 'none') return template.defaultThemeKey;
  if (template.themes.some((item) => item.key === raw)) return raw;

  const mapped =
    template.key === 'hiver'
      ? HIVER_FROM_SETUP[raw]
      : template.key === 'editorial'
        ? EDITORIAL_FROM_SETUP[raw]
        : template.key === 'herbier'
          ? BOTANICAL_FROM_SETUP[raw]
          : template.key === 'celebration'
        ? BIRTHDAY_FROM_SETUP[raw]
        : template.key === 'summit'
          ? CONFERENCE_FROM_SETUP[raw]
          : ELEGANCE_FROM_SETUP[raw];

  if (mapped && template.themes.some((item) => item.key === mapped)) return mapped;
  return template.defaultThemeKey;
}

export function resolveTemplateTheme(
  template: TemplateDefinition,
  eventThemeKey?: string | null,
): TemplateThemeDefinition {
  const key = resolveTemplateThemeKey(template, eventThemeKey);
  return template.themes.find((item) => item.key === key) ?? template.themes[0];
}
