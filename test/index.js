const { isAbsolute, relativeToAbsolute, isValidPath, isFileOrDic, getMdFilesInDirectory, readMdFile, getLinksMd, validateLinks } = require('./pura');
const filePath = process.argv[2];

function mdLinks(path, options) {
    return new Promise((resolve, reject) => {
        let absolutePath;
        const validate = isAbsolute(path)
        if (validate) {
            console.log('ruta absoluta desde siempre', path)
            absolutePath = path;
        } else {
            console.log('ruta absolutizada', path)
            absolutePath = relativeToAbsolute(path);
        }

        isValidPath(absolutePath)
            .then((isValid) => {
                console.log('La ruta es válida', isValid);
                if (isValid) {
                    resolve(absolutePath);
                } else {
                    reject('el archivo no existe')
                }
            })
            .catch((err) => {
                console.log('Ocurrió un error:', err);
                reject('error al validar la ruta', err)
            });

            isFileOrDic(absolutePath)
            .then((isFile) => {
                if (isFile) {
                    console.log('Es un archivo:');
                    readMdFile(absolutePath)
                        .then(() => {
                            console.log('obteniendo links');
                            getLinksMd(absolutePath)
                                .then((links) => {
                                    console.log('linkis', links)
                                    resolve(links);
                                })
                                .catch((error) => {
                                    console.error('error al extraer links', error);
                                    reject('error al extraer los links del archivo', error);
                                });

                        })
                        .catch((error) => {
                            console.error('Error al leer el archivo', error);
                            reject('Error al leer el archivo', error);
                        });

                } else {
                    console.log('Es un directorio');
                    getMdFilesInDirectory(absolutePath)
                        .then((mdFilePathsExtraidos) => {
                            if (mdFilePathsExtraidos.length > 0) {
                                console.log('El directorio contiene archivos .md');
                                const mdFilesPromises = mdFilePathsExtraidos.map((mdFilePath) => {
                                    console.log('obtiene las rutas de los archivos .md indivuduales', mdFilePath)
                                    return readMdFile(mdFilePath)
                                    .then(() => getLinksMd(mdFilePath))
                                    .catch((error) => {
                                    console.error('Error al leer archivo .md', error);
                                    throw new Error('Error al leer archivo .md', error);
                                  });
                              });
                              
                                Promise.all(mdFilesPromises)
                                            .then((mdFilesLinks) => {
                                                const links = mdFilesLinks.flat();
                                                resolve(links);
                                            })
                                            .catch((error) => {
                                                console.error('error al extraer links', error);
                                                reject('error al extraer los links del archivo', error);

                                            });
                                    }else {
                                console.log('El directorio no contiene archivos .md')
                                reject('El directorio no contiene archivos .md', error);
                            }
                        })
                        .catch((error) => {
                            console.log('error al obtener archivos .md', error)
                            reject('error al obtener archivos  de md-links.md', error)
                        });
                }
            })

            .catch((error) => {
                console.error('Error al verificar si es archivo o directorio', error);
                reject('Error al verificar si es archivo o directorio', error);
            });

    })

}


mdLinks('/Users/alejo/Documents/GitHub/DEV006-md-links/node_modules/acorn').then((links) => console.log('aqui', links))
    .catch(err => console.log(err));

module.exports = mdLinks;
