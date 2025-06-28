import { getDocumentFromLink } from "./obsidianId";

const DOCUMENT_IDS = [
  "Bienvenido.md",
  "es/Bienvenido.md",
  "es/Carpeta 2/Página 1.md",
  "es/Carpeta 2/Ejemplos/Enlaces.md",
  "es/Carpeta 2/Ejemplos/Documentos.md",
];

describe("getFileFromLink", () => {
  it.each([
    ["Página 1", "es/Carpeta 2/Página 1.md"],
    ["Enlaces", "es/Carpeta 2/Ejemplos/Enlaces.md"],
    ["es/Carpeta 2/Ejemplos/Documentos", "es/Carpeta 2/Ejemplos/Documentos.md"],
    ["es/Carpeta 2/Ejemplos/Enlaces.md", "es/Carpeta 2/Ejemplos/Enlaces.md"],
    ["Bienvenido", "Bienvenido.md"],
    ["es/Bienvenido", "es/Bienvenido.md"],
  ])(
    'Given a link with "%s", it should return "%s"',
    (link, expectedDocumentId) => {
      const resolved = getDocumentFromLink(link, DOCUMENT_IDS);

      expect(resolved).toBe(expectedDocumentId);
    }
  );
});
