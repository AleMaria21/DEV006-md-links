const path = require('path');
const fs = require('fs');
const MarkdownIt = require('markdown-it');
const { JSDOM } = require('jsdom');
const fetch = require('node-fetch').default;

function isAbsolute(route) {
    console.log('sies', path.isAbsolute(route));
    return path.isAbsolute(route);
}

function relativeToAbsolute(route) {
    //console.log('absoluta', path.resolve(route))
    return path.resolve(route);
}

function isValidPath(route) {
    return new Promise((resolve) => {
        console.log('Verificnado la existencia de la ruta', route);
        //f_ok verifica la existencia del archivo o dir.
        fs.access(route, fs.constants.F_OK, (err) => {
            if (err) {
                console.log('Error al verificar la existencia:', err)
                resolve(false);
            } else {
                console.log('Ruta válida:', route);
                resolve(true);
            }
        });
    });
}

/* RECTIFICA QUE isValidPath SE EJECUTE CORRECTAMENTE
isValidPath('/Users/alejo/Documents/GitHub/DEV006-md-links/README.md')
 .then((isValid) => {
    console.log('¿La ruta es válida?', isValid);
  })
  .catch((error) => {
    console.log('Ocurrió un error:', error);
  }); */

/*function extensionMdArchivos(route) {
    console.log('tipo de extension', path.extname(route))
    return path.extname(route)
}*/

function isFileOrDic(route) {
    return new Promise((resolve, reject) => {
        console.log('verificando si es archivo o dic')
        fs.stat(route, (error, stats) => {
            if (error) {
                reject(error);
            } else if (stats.isFile()) {
                //En caso de que sea archivo
                resolve(true);
            } else if (stats.isDirectory()) {
                //en caso de que sea dic
                resolve(false);
            }
        });
    });
}

function getMdFilesInDirectory(route) {
    return new Promise((resolve, reject) => {
        fs.readdir(route, (err, files) => {
            if (err) {
                reject(err); // Rechaza la promesa si hay un error al leer el directorio
            } else {
                const mdFilePathsExtraidos = files
                    .map((file) => path.join(route, file))
                    .filter((mdFile) => path.extname(mdFile) === ".md")// Filtra solo los archivos con extensión ".md"

                
                    if (mdFilePathsExtraidos.length === 0) {
                        reject("El directorio no contiene archivos MD");
                    } else {
                        //console.log('rutas de archivos del dic', mdFilePathsExtraidos)
                        resolve(mdFilePathsExtraidos);
                    }
                }
            });
        });
    }  



//Lee el archivo Markdown
function readMdFile(route) {
    return new Promise((resolve, reject) => {
        fs.readFile(route, 'utf8', (err, data) => {
            if (err) {
                console.log('.md no leído, error')
                reject(err);
            } else {
                console.log('.md leido')
                resolve(data)
            }

        })
    })
}

const getLinksMd = (route) => {
    return new Promise((resolve, reject) => {
        readMdFile(route)
            .then((mdContent) => {
                const allLinks = [];
                const mdRender = new MarkdownIt();
                const renderHtml = mdRender.render(mdContent);
                const dom = new JSDOM(renderHtml);
                const { document } = dom.window;
                const links = document.querySelectorAll('a');

                links.forEach((link) => {
                    const href = link.getAttribute('href');
                    const text = link.textContent.slice(0, 50);
                    const file = relativeToAbsolute(route);
                    if (href.startsWith('https://') || href.startsWith('http://')) {
                        allLinks.push({ href, text, file });
                    }
                });

                //console.log('links http', allLinks);
                resolve(allLinks);
            })
            .catch((error) => {
                console.log('error extración links', error)
                reject(error);
            });
    });
}

function validateLinks(allLinks) {
    //console.log('probando argumento', allLinks)
    return new Promise((resolve, reject) => {
  

        const promises = allLinks.map((link) => {
            return new Promise((resolve) => {
                fetch(link.href, { method: 'HEAD' })
                    .then((response) => {
                        const result = {
                            href: link.href,
                            text: link.text,
                            file: link.file,
                            status: response.status === 200 ? 200 : 404,
                            ok: response.status === 200 ? 'ok' : 'fail',
                        }
                        //console.log('validado')
                        resolve(result);

                    })
                    .catch((error) => {
                        const resultInvalido = {
                            href: link.href,
                            text: link.text,
                            file: link.file,
                            status: 'N/A',
                            ok: 'fail',
                        }
                        console.log('invalidado', resultInvalido)
                        resolve(resultInvalido);
                    });
            });

        });
        //console.log('son estas', promises)
        Promise.all(promises)
            .then((result) => {
                resolve(result);
            })
            .catch((error) => {
                reject(error);
            });
    });
}




const allLinks = [
    { href: 'https://es.wikipedia.org/wiki/Markdown', text: 'Markdown' },
    { href: 'https://nodejs.org/', text: 'Node.js' },
    { href: 'https://nodejs.org/es/', text: 'Node.js' },
    {
        href: 'https://developers.google.com/v8/',
        text: 'motor de JavaScript V8 de Chrome'
    },
    {
        href: 'https://curriculum.laboratoria.la/es/topics/javascript/04-arrays',
        text: 'Arreglos'
    },
    {
        href: 'https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Array/',
        text: 'Array - MDN'
    },
]


/*validateLinks(allLinks)
    .then((result) => {
        console.log('funciona', result);
    })
    .catch((error) => {
        console.error(error);
    });*/


//getMdFilesInDirectory('/Users/alejo/Documents/GitHub/DEV006-md-links/node_modules/acorn')
//getLinksMd('/Users/alejo/Documents/GitHub/DEV006-md-links/node_modules/acorn/README.md')

module.exports = {
    isAbsolute,
    relativeToAbsolute,
    isValidPath,
    isFileOrDic,
    getMdFilesInDirectory,
    readMdFile,
    getLinksMd,
    validateLinks,

}