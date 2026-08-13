export type Language = 'en' | 'es-AR';

export interface Translations {
  header: {
    title: string;
    editor: string;
    focus: string;
    status: string;
  };
  leftTree: {
    title: string;
    noChanges: string;
  };
  rightImpact: {
    impactTitle: string;
    diffTitle: string;
    target: string;
    risk: string;
    tech: string;
    breakingRisk: string;
    staged: string;
    unstaged: string;
    untracked: string;
    affected: string;
    summary: string;
    selectItem: string;
    noDiff: string;
  };
  statusBar: {
    stats: string;
    staged: string;
    unstaged: string;
    untracked: string;
    total: string;
    nav: string;
    search: string;
    settings: string;
    open: string;
    quit: string;
  };
  search: {
    prompt: string;
    matches: string;
    noResults: string;
    escToExit: string;
  };
  settings: {
    title: string;
    editorSection: string;
    languageSection: string;
    detected: string;
    notFound: string;
    saved: string;
    instructions: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    header: {
      title: 'CHANGUI v0.1.0',
      editor: 'Editor',
      focus: 'Focus',
      status: 'ONLINE',
    },
    leftTree: {
      title: 'ARCHITECTURAL TREE',
      noChanges: 'No git changes detected.',
    },
    rightImpact: {
      impactTitle: 'IMPACT & RISK HUD',
      diffTitle: 'GIT DIFF',
      target: 'Target',
      risk: 'Risk',
      tech: 'Tech',
      breakingRisk: '[!] BREAKING RISK DETECTED',
      staged: 'Staged',
      unstaged: 'Unstaged',
      untracked: 'Untracked',
      affected: 'Affected',
      summary: 'Summary',
      selectItem: 'Select item from tree.',
      noDiff: 'No diff changes detected in file.',
    },
    statusBar: {
      stats: 'STATS:',
      staged: 'Staged',
      unstaged: 'Unstaged',
      untracked: 'Untracked',
      total: 'Total',
      nav: '[Up/Down] Nav',
      search: '[f] Search',
      settings: '[s] Settings',
      open: '[Enter] Open',
      quit: '[q] Quit',
    },
    search: {
      prompt: 'SEARCH:',
      matches: 'Matches',
      noResults: 'No matching files found.',
      escToExit: '[Esc to exit]',
    },
    settings: {
      title: 'SETTINGS & PREFERENCES',
      editorSection: 'DEFAULT CODE EDITOR',
      languageSection: 'INTERFACE LANGUAGE',
      detected: '[Detected]',
      notFound: '[Not Found]',
      saved: 'Saved preference',
      instructions: '[Up/Down] Navigate  [Enter] Select & Save  [Esc] Close',
    },
  },
  'es-AR': {
    header: {
      title: 'CHANGUI v0.1.0',
      editor: 'Editor',
      focus: 'Foco',
      status: 'EN LINEA',
    },
    leftTree: {
      title: 'ARBOL DE ARQUITECTURA',
      noChanges: 'No se detectaron cambios en Git.',
    },
    rightImpact: {
      impactTitle: 'HUD DE IMPACTO Y RIESGO',
      diffTitle: 'GIT DIFF',
      target: 'Objetivo',
      risk: 'Riesgo',
      tech: 'Tecnología',
      breakingRisk: '[!] RIESGO DE CAMBIO CRITICO',
      staged: 'En commit (Staged)',
      unstaged: 'Modificados',
      untracked: 'Sin rastrear',
      affected: 'Afectados',
      summary: 'Resumen',
      selectItem: 'Seleccioná un elemento del árbol.',
      noDiff: 'No se detectaron cambios de diff en el archivo.',
    },
    statusBar: {
      stats: 'ESTADISTICAS:',
      staged: 'Staged',
      unstaged: 'Unstaged',
      untracked: 'Untracked',
      total: 'Total',
      nav: '[Arriba/Abajo] Nav',
      search: '[f] Buscar',
      settings: '[s] Opciones',
      open: '[Enter] Abrir',
      quit: '[q] Salir',
    },
    search: {
      prompt: 'BUSCAR:',
      matches: 'Coincidencias',
      noResults: 'No se encontraron archivos coincidentes.',
      escToExit: '[Esc para salir]',
    },
    settings: {
      title: 'OPCIONES Y PREFERENCIAS',
      editorSection: 'EDITOR DE CODIGO POR DEFECTO',
      languageSection: 'IDIOMA DE LA INTERFAZ',
      detected: '[Detectado]',
      notFound: '[No Encontrado]',
      saved: 'Preferencia guardada',
      instructions: '[Arriba/Abajo] Navegar  [Enter] Seleccionar y Guardar  [Esc] Cerrar',
    },
  },
};
