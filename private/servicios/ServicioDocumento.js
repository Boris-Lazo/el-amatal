const { ErrorNoEncontrado, ErrorValidacion } = require('../errores/indice');
const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');

/**
 * Servicio de documentos
 */
class ServicioDocumento {
  /**
   * @param {RepositorioDocumento} repositorioDocumento
   * @param {ServicioAlmacenamiento} servicioAlmacenamiento
   * @param {Object} configuracion - configuracionApp
   */
  constructor(repositorioDocumento, servicioAlmacenamiento, configuracion) {
    this.repositorioDocumento = repositorioDocumento;
    this.servicioAlmacenamiento = servicioAlmacenamiento;
    this.configuracion = configuracion;
  }

  /**
   * Crea un nuevo documento
   */
  async crearDocumento(datos, archivo) {
    const { titulo, mes } = datos;

    if (!titulo || !mes) {
      if (archivo)
        this.servicioAlmacenamiento.limpiarArchivosTemporales([archivo]);
      throw new ErrorValidacion('Faltan título o mes');
    }

    if (!archivo) {
      throw new ErrorValidacion('No se envió archivo');
    }

    const doc = { titulo, mes, filename: archivo.filename };
    await this.repositorioDocumento.crear(doc);

    // Generar miniatura en segundo plano
    this.generarMiniatura(archivo.filename).catch((err) => {
      console.error(`Error generando miniatura para ${archivo.filename}:`, err);
    });

    return { nombreArchivo: archivo.filename };
  }

  /**
   * Lista todos los documentos
   * @param {number|null} limite - Límite opcional
   */
  async listarDocumentos(limite = null) {
    return this.repositorioDocumento.obtenerTodos(limite);
  }

  /**
   * Elimina un documento y su archivo
   */
  async eliminarDocumento(id) {
    const doc = await this.repositorioDocumento.obtenerPorId(id);
    if (!doc) throw new ErrorNoEncontrado('Documento no encontrado');

    this.servicioAlmacenamiento.eliminarDocumento(doc.filename);

    try {
      const rutaMiniatura = path.join(
        this.configuracion.rutas.miniaturas,
        `${doc.filename}.png`
      );
      await fs.unlink(rutaMiniatura);
    } catch (err) {
      // Si el archivo no existe o no se puede borrar, ignoramos el error
    }

    await this.repositorioDocumento.eliminarPorId(id);
  }

  /**
   * Generar miniatura de un documento (PDF o Imagen)
   */
  async generarMiniatura(nombreArchivo) {
    const rutaArchivo = path.join(
      this.configuracion.rutas.documentos,
      nombreArchivo
    );
    const rutaMiniatura = path.join(
      this.configuracion.rutas.miniaturas,
      `${nombreArchivo}.png`
    );

    const esPdf = nombreArchivo.toLowerCase().endsWith('.pdf');

    try {
      if (esPdf) {
        const { pdf } = await import('pdf-to-img');
        const documento = await pdf(rutaArchivo, { scale: 1.5 });
        const primeraPagina = await documento.getPage(1);
        await fs.writeFile(rutaMiniatura, primeraPagina);
      } else {
        // Es una imagen
        await sharp(rutaArchivo)
          .resize(400, 500, { fit: 'inside' })
          .png()
          .toFile(rutaMiniatura);
      }
    } catch (err) {
      console.error(`Error generando miniatura para ${nombreArchivo}:`, err);
      // No lanzamos error para no interrumpir el flujo principal,
      // pero el log quedará registrado
    }
  }

  /**
   * Obtiene la ruta de la miniatura de un documento
   */
  async obtenerMiniatura(nombreArchivo) {
    const rutaMiniatura = path.join(
      this.configuracion.rutas.miniaturas,
      `${nombreArchivo}.png`
    );

    try {
      await fs.access(rutaMiniatura);
      return rutaMiniatura;
    } catch (err) {
      // Si no existe, intentar generarla
      await this.generarMiniatura(nombreArchivo);
      return rutaMiniatura;
    }
  }
}

module.exports = ServicioDocumento;
