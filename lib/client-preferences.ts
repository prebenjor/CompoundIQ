import type { Lang } from '@/lib/i18n'

export type ExportLanguagePreference = 'app' | Lang

const EXPORT_LANGUAGE_KEY = 'ciq-export-lang'

export function getStoredExportLanguage(): ExportLanguagePreference {
  if (typeof window === 'undefined') {
    return 'app'
  }

  const stored = localStorage.getItem(EXPORT_LANGUAGE_KEY)
  return stored === 'no' || stored === 'en' || stored === 'app' ? stored : 'app'
}

export function setStoredExportLanguage(value: ExportLanguagePreference) {
  if (typeof window === 'undefined') {
    return
  }

  localStorage.setItem(EXPORT_LANGUAGE_KEY, value)
}

export function resolveExportLanguage(
  appLang: Lang,
  preference: ExportLanguagePreference
): Lang {
  return preference === 'app' ? appLang : preference
}
