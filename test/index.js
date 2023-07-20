const { isAbsolute, relativeToAbsolute, isValidPath, isFileOrDic, getMdFilesInDirectory, readMdFile, getLinksMd, validateLinks } = require('./pura.js');
const filePath = process.argv[2];

function mdLinks(path, options) {
    return new Promise((resolve, reject) => {
        let absolutePath;
        const validatePath = isAbsolute(path)
        if (validatePath) {
            console.log('ruta absoluta desde siempre', path)
            absolutePath = path;
        } else {
            console.log('ruta absolutizada', path)
            absolutePath = relativeToAbsolute(path);
        }

        isValidPath(absolutePath)
            .then((isValid) => {
                if (!isValid) {
                    reject('El archivo no existe');
                    return;
                }

                isFileOrDic(absolutePath)
                    .then((isFile) => {
                        if (isFile) {
                            readMdFile(absolutePath)
                                .then(() => {
                                    getLinksMd(absolutePath)
                                        .then((links) => {
                                            if (options && options.validate) {
                                                validateLinks(links)
                                                    .then((result) => {
                                                        console.log('si funciono para archivo');
                                                        resolve(result);
                                                    })
                                                    .catch((error) => {
                                                        console.error('error al verificar los links', error);
                                                        reject('error al verificar los links', error);
                                                    });
                                            } else {
                                                console.log('muestras los links sin verificar');
                                                resolve(links);
                                            }
                                        })
                                        .catch((error) => {
                                            console.error('error obtener los links del archivo', error);
                                            reject('error al obtener los links del archivo', error);
                                        });
                                })
                                .catch((error) => {
                                    console.error('error al leer el archivo', error);
                                    reject('error al leer el archivo', error);
                                });
                        } else {
                            getMdFilesInDirectory(absolutePath)
                                .then((mdFilePaths) => {
                                    if (mdFilePaths.length === 0) {
                                        console.log('El directorio no contiene archivos MD');
                                        reject('El directorio no contiene archivos MD')
                                        return;
                                    } else {
                                        const mdFilesPromises = mdFilePaths.map((mdFilePath) => {
                                            return readMdFile(mdFilePath)
                                                .then(() => getLinksMd(mdFilePath))
                                                .catch((error) => {
                                                    reject('Error al leer archivo .md', error);
                                                });
                                        });

                                        Promise.all(mdFilesPromises)
                                            .then((links) => {
                                                if (options && options.validate) {
                                                    validateLinks(links.flat())
                                                        .then((result) => {
                                                            console.log('links de dic validados');
                                                            resolve(result);
                                                        })
                                                        .catch((error) => {
                                                            console.error('error al verificar los links del archivo', error);
                                                            reject('error al verificar los links', error);
                                                        });
                                                } else {
                                                    console.log('no validas links de dic');
                                                    resolve(links);
                                                }
                                            })
                                            .catch((error) => {
                                                console.error('Error al obtener archivos .md', error);
                                                reject('Error al obtener archivos .md', error);
                                            });
                                    }
                                })
                                .catch((error) => {
                                    console.error('Error al leer el directorio', error);
                                    reject('Error al leer el directorio', error);
                                });
                        }
                    })
                    .catch((error) => {
                        console.error('Error al verificar si es archivo o directorio', error);
                        reject('Error al verificar si es archivo o directorio', error);
                    });
            })
            .catch((err) => {
                reject('Error al validar la ruta', err);
            });
    })
}


//README.md, '/Users/alejo/Documents/GitHub/DEV006-md-links/node_modules/acorn'
mdLinks('/Users/alejo/Documents/GitHub/DEV006-md-links/node_modules/acorn', { validate: true }).then((result) => {
    console.log('aqui', result);
    return result;
})
    .catch((err) => {
        console.log(err);
    });

module.exports = { mdLinks };

