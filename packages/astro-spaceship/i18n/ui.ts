import websiteConfig from "@/config";

export const languages = {
  en: 'English',
  es: 'Spanish',
};

export const defaultLang = websiteConfig.defaultLocale;

export const ui = {
  en: {
    'article.author.name': 'by {name}',
    'footer.readingTime': 'Reading Time: {readingTime}',
    'footer.charactersCount': '{characters} characters',
    'footer.wordsCount': '{words} words',
    'format.minute': '{minute} minute',
    'format.minutes': '{minutes} minutes',
    'format.seconds': '{seconds} seconds',
    'format.second': '{second} second',
    'format.milliseconds': '{milliseconds} milliseconds',
    'nav.graph': 'Graph View',
    'nav.links': 'Links',
    'nav.linkedMentions': 'Linked Mentions',
    'nav.tableOfContents': 'Table of Contents',
    '404.title': 'Document not found',
    '404.description': 'The document you are looking for does not exist.',
  },
  es: {
    'article.author.name': 'por {name}',
    'footer.readingTime': 'Tiempo de Lectura: {readingTime}',
    'footer.charactersCount': '{characters} caracteres',
    'footer.wordsCount': '{words} palabras',
    'format.minute': '{minute} minuto',
    'format.minutes': '{minutes} minutos',
    'format.seconds': '{seconds} segundos',
    'format.second': '{second} segundo',
    'format.milliseconds': '{milliseconds} milisegundos',
    'nav.graph': 'Vista de Grafo',
    'nav.links': 'Enlaces',
    'nav.linkedMentions': 'Menciones',
    'nav.tableOfContents': 'Tabla de Contenidos',
    '404.title': "Documento no encontrado",
    '404.description': 'El documento que buscas no existe.',
  },
} as const;