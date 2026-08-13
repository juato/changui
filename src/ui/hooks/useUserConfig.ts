import { useState, useMemo, useCallback } from 'react';
import { UserConfigManager, EditorInfo, UserConfig } from '../../core/config/userConfig.js';
import { Language, translations } from '../../core/i18n/translations.js';
import { SettingItem } from '../SettingsModal.js';

export function useUserConfig() {
  const configManager = useMemo(() => new UserConfigManager(), []);
  const [userConfig, setUserConfig] = useState<UserConfig>(() => configManager.loadConfig());
  const [detectedEditors] = useState<EditorInfo[]>(() =>
    configManager.detectInstalledEditors()
  );

  const lang: Language = userConfig.language || 'en';
  const t = translations[lang];

  const settingItems: SettingItem[] = useMemo(() => {
    const list: SettingItem[] = [
      {
        type: 'editor',
        id: 'header_editor',
        label: t.settings.editorSection,
      },
    ];

    for (const ed of detectedEditors) {
      list.push({
        type: 'editor',
        id: ed.id,
        label: `${ed.name} (${ed.command})`,
        installed: ed.installed,
      });
    }

    list.push({
      type: 'language',
      id: 'header_lang',
      label: t.settings.languageSection,
    });

    list.push({
      type: 'language',
      id: 'en',
      label: 'English (en)',
    });

    list.push({
      type: 'language',
      id: 'es-AR',
      label: 'Español (Argentino) (es-AR)',
    });

    return list;
  }, [detectedEditors, t]);

  const updateConfig = useCallback(
    (newConfig: UserConfig) => {
      configManager.saveConfig(newConfig);
      setUserConfig(newConfig);
    },
    [configManager]
  );

  const getEditorCommand = useCallback(
    (editorId: string) => {
      return detectedEditors.find((e) => e.id === editorId)?.command || 'code';
    },
    [detectedEditors]
  );

  return {
    userConfig,
    detectedEditors,
    lang,
    t,
    settingItems,
    updateConfig,
    getEditorCommand,
  };
}
