const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

/**
 * Servicio de almacenamiento
 */
class ServicioAlmacenamiento {
  /**
   * @param {Object} rutas - Rutas de configuracionApp
   */
  constructor(rutas) {
    this.rutas = rutas;
  }

  /**
   * Crea una carpeta para un álbum
   */
  crearCarpetaAlbum(nombreCarpeta) {
    const rutaCarpeta = path.join(this.rutas.albumes, nombreCarpeta);
    fs.mkdirSync(rutaCarpeta, { recursive: true });
    return rutaCarpeta;
  }

  /**
   * Guarda archivos de álbum procesándolos
   */
  async guardarArchivosAlbum(archivos, nombreCarpeta) {
    if (!archivos || !Array.isArray(archivos) || archivos.length === 0) {
      throw new Error('No se proporcionaron archivos para el álbum');
    }

    const carpetaDestino = path.join(this.rutas.albumes, nombreCarpeta);
    const archivosGuardados = [];
    const archivosTemporales = [...archivos]; // Copia para limpieza garantizada

    try {
      for (const archivo of archivos) {
        const nombreBase = path.parse(archivo.originalname).name;
        // Limpiar nombre para evitar caracteres extraños
        const nombreLimpio = nombreBase.replace(/[^a-zA-Z0-9]/g, '_');
        const nombreNuevo = `${Date.now()}_${nombreLimpio}.webp`;
        const rutaDestino = path.join(carpetaDestino, nombreNuevo);

        try {
          await sharp(archivo.path)
            .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
            .webp({ quality: 80 })
            .toFile(rutaDestino);

          archivosGuardados.push(nombreNuevo);
        } catch (error) {
          console.error(
            `Error procesando imagen ${archivo.originalname}:`,
            error
          );
          // Continuar con las siguientes imágenes
        }
      }

      // Si no se procesó ninguna imagen exitosamente, lanzar error
      if (archivosGuardados.length === 0) {
        throw new Error('No se pudo procesar ninguna imagen');
      }

      return archivosGuardados;
    } finally {
      // CRÍTICO: Siempre limpiar archivos temporales, incluso si hay errores
      this.limpiarArchivosTemporales(archivosTemporales);
    }
  }

  /**
   * Elimina un álbum completo
   */
  eliminarAlbum(idAlbum) {
    const rutaAlbum = path.join(this.rutas.albumes, idAlbum);
    if (fs.existsSync(rutaAlbum)) {
      fs.rmSync(rutaAlbum, { recursive: true, force: true });
    }
  }

  /**
   * Elimina un archivo de documento
   */
  eliminarDocumento(nombreArchivo) {
    const rutaDoc = path.join(this.rutas.documentos, nombreArchivo);
    if (fs.existsSync(rutaDoc)) {
      fs.unlinkSync(rutaDoc);
    }
  }

  /**
   * Limpia archivos temporales
   */
  limpiarArchivosTemporales(archivos) {
    if (!archivos) return;

    archivos.forEach((archivo) => {
      if (fs.existsSync(archivo.path)) {
        fs.unlinkSync(archivo.path);
      }
    });
  }

  /**
   * Elimina una carpeta si existe
   */
  eliminarCarpeta(rutaCarpeta) {
    if (fs.existsSync(rutaCarpeta)) {
      fs.rmSync(rutaCarpeta, { recursive: true, force: true });
    }
  }

  /**
   * Verifica si un archivo existe
   */
  archivoExiste(rutaArchivo) {
    return fs.existsSync(rutaArchivo);
  }
}

module.exports = ServicioAlmacenamiento;
