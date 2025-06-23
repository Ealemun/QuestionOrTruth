import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <div style={{ marginBottom: '1rem' }}>
      <label>{t('language')} : </label>
      <select
        onChange={(e) => changeLanguage(e.target.value)}
        value={i18n.language}
      >
        <option value="fr">{t('french')}</option>
        <option value="en">{t('english')}</option>
      </select>
    </div>
  );
}
