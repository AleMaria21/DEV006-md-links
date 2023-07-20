const { isAbsolute, relativeToAbsolute, isValidPath, isFileOrDic, getMdFilesInDirectory, getLinksMd, readMdFile } = require('./pura.js');
const { mdLinks } = require('./index.js');
const pathModule = require('path');
const MarkdownIt = require('markdown-it');
const fs = require('fs');
const { JSDOM } = require('jsdom');
const path = 'README.md'
//const path = '/Users/alejo/Documents/GitHub/DEV006-md-links/node_modules/acorn';

const linksValidados =  [
  {
    href: 'https://es.wikipedia.org/wiki/Markdown',
    text: 'Markdown',
    file: '/Users/alejo/Documents/GitHub/DEV006-md-links/README.md',
    status: 200,
    ok: 'ok'
  },
  {
    href: 'https://nodejs.org/',
    text: 'Node.js',
    file: '/Users/alejo/Documents/GitHub/DEV006-md-links/README.md',
    status: 200,
    ok: 'ok'
  }
]

const linksSinValidar = [
  {
    href: 'https://es.wikipedia.org/wiki/Markdown',
    text: 'Markdown',
    file: '/Users/alejo/Documents/GitHub/DEV006-md-links/README.md'
  },
  {
    href: 'https://nodejs.org/',
    text: 'Node.js',
    file: '/Users/alejo/Documents/GitHub/DEV006-md-links/README.md'
  }
]


describe('isAbsolute', () => {
  test('devuelve true para rutas absolutas', () => {
    const rutaAbsoluta = '/ruta/absoluta/al/archivo';

    const resultado = isAbsolute(rutaAbsoluta);

    expect(resultado).toBe(true);
  });

  test('devuelve false para rutas relativas', () => {
    const rutaRelativa = './ruta/relativa/al/archivo';

    const resultado = isAbsolute(rutaRelativa);

    expect(resultado).toBe(false);
  });
});


describe('relativeToAbsolute', () => {
  test('debería convertir una ruta relativa a absoluta', () => {
    const rutaRelativa = './ruta/relativa';
    const rutaAbsolutaEsperada = pathModule.resolve(rutaRelativa);
    expect(relativeToAbsolute(rutaRelativa)).toBe(rutaAbsolutaEsperada);
  });
});

/*describe('isValidPath', () => {
  test('debería validar si una ruta es válida', () => {
    expect.assertions(1);
    const ruta = '/ruta/absoluta';
    return isValidPath(ruta).then((isValid) => {
      expect(isValid).toBe(true);
    });
  });
});*/

describe("IsValidPath", () => {
  it('is function', () => {
    expect(typeof isValidPath).toBe('function');
  })
});

describe("isFileOrDic", () => {
  it('Debe de retornar "es archivo:true"', () => {
    const resultIsFile = isFileOrDic(path);
    expect(resultIsFile).resolves.toEqual(true);
  })
});

test('should reject with an error for directory without .md files', () => {
  const directoryPath = 'emptyDirectory';

  fs.readdir = jest.fn((path, callback) => {
    callback(null, []);
  });

  return getMdFilesInDirectory(directoryPath).catch(error => {
    expect(error).toBe('El directorio no contiene archivos MD');
  });
});

/*describe('readMdFile', () => {
  test('debe resolver con el contenido del archivo cuando se lee correctamente', () => {
    const mockFileContent = 'Contenido del archivo .md';
    fs.readFile.mockImplementation((route, encoding, callback) => {
      callback(null, mockFileContent);
    });

    const route = 'ruta/almacenamiento/archivo.md';

    return readMdFile(route).then((result) => {
      expect(result).toBe(mockFileContent);
    });
  });

  test('debe rechazar con un error cuando ocurre un error de lectura', () => {
    const mockError = new Error('Error de lectura del archivo');
    fs.readFile.mockImplementation((route, encoding, callback) => {
      callback(mockError, null);
    });

    const route = 'ruta/almacenamiento/archivo.md';

    return readMdFile(route).catch((error) => {
      expect(error).toBe(mockError);
    });
  });
});*/

describe('getMdFilesInDirectory', () => {
  const fs = require('fs').promises;
  const testDirectory = './testFiles'; // Ajusta la ruta a un directorio de prueba con archivos .md

  // Antes de cada test, creamos algunos archivos .md en el directorio de prueba
  beforeEach(() => {
    return fs.mkdir(testDirectory, { recursive: true })
      .then(() => fs.writeFile(pathModule.join(testDirectory, 'file1.md'), 'Contenido del archivo 1'))
      .then(() => fs.writeFile(pathModule.join(testDirectory, 'file2.txt'), 'Este archivo no es .md'));
  });

  // Después de cada test, limpiamos el directorio de prueba
  afterEach(() => {
    return fs.rmdir(testDirectory, { recursive: true });
  });

  it('debería devolver un array de rutas de archivos .md en el directorio', () => {
    return getMdFilesInDirectory(testDirectory)
      .then((result) => {
        expect(result).toEqual([
          pathModule.join(testDirectory, 'file1.md')
        ]);
      })
      .catch((error) => {
        // Si ocurre un error, el test debería fallar
        expect(error).toBe('El directorio no contiene archivos MD');
      });
  });

  it('debería rechazar la promesa si el directorio no contiene archivos .md', () => {
    return getMdFilesInDirectory('/Users/alejo/Documents/GitHub/DEV006-md-links/node_modules/.bin')
      .then((result) => {
        // Si la función no rechaza la promesa, el test debería fallar
        expect(true).toBe(false);
      })
      .catch((error) => {
        expect(error).toBe('El directorio no contiene archivos MD');
      });
  });

  it('debería rechazar la promesa si ocurre un error al leer el directorio', () => {
    return getMdFilesInDirectory('/Users/alejo/Documents/GitHub/DEV006-md-links/node_modules/.bin')
      .catch((error) => {
        // Si la función no rechaza la promesa, el test debería fallar
        expect(error).toBeDefined();
        // Comprobamos que el error sea el esperado (puedes ajustar el mensaje de error según sea necesario)
        expect(error.message).toContain('Error al leer el directorio');
      });
  });
});


describe('mdLinks', () => {
  test('Debería devolver los links de un archivo .md sin validar', () => {
    const path = 'README.md'
    const options = { validate: false };
    return mdLinks(path, options).then((result) => {
      // Verificar el resultado esperado
      expect(result).toEqual(linksSinValidar);
    });
  });

  test('Debería devolver los links de un archivo .md y validarlos', () => {
    const path = 'README.md'
    const options = { validate: true };
    return mdLinks(path, options).then((result) => {
      // Verificar el resultado esperado
      expect(result).toEqual(linksValidados);
    });
  });
  test('Debería devolver los links de un archivo .md sin opciones adicionales', () => {
    const path = 'README.md'
    return mdLinks(path).then((result) => {
      // Verificar el resultado esperado
      expect(result).toEqual(linksSinValidar);
    });
  });

});

