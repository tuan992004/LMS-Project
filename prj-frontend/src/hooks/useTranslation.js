import useLanguageStore from '../stores/useLanguageStore';
import { translations } from '../translations/translations';

export const useTranslation = () => {
    const { language } = useLanguageStore();

    const t = (key, variables = {}) => {
        const langData = translations[language] || translations['en'];
        let translation = langData[key] || key;
        
        // Simple variable interpolation: {name} -> variables.name
        Object.keys(variables).forEach(varKey => {
            const regex = new RegExp(`{${varKey}}`, 'g');
            translation = translation.replace(regex, variables[varKey]);
        });
        
        return translation;
    };

    return { t, language };
};
