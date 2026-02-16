const {
  ErrorNoEncontrado,
  ErrorValidacion,
  ErrorApp,
} = require('../errores/indice');

/**
 * Servicio de álbumes
 */
class ServicioAlbum {
  /**
   * @param {RepositorioAlbum} repositorioAlbum
   * @param {ServicioAlmacenamiento} servicioAlmacenamiento
   */
  constructor(repositorioAlbum, servicioAlmacenamiento) {
    this.repositorioAlbum = repositorioAlbum;
    this.servicioAlmacenamiento = servicioAlmacenamiento;
  }

  /**
   * Crea un nuevo álbum con fotos
   */
  async crearAlbum(datos, archivos) {
    const { titulo, fecha, descripcion = '' } = datos;

    if (!titulo || !fecha) {
      this.servicioAlmacenamiento.limpiarArchivosTemporales(archivos);
      throw new ErrorValidacion('Faltan título o fecha');
    }

    const slug = titulo
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const nombreCarpeta = `${fecha} - ${slug}`;

    let carpetaDestino = null;

    try {
      carpetaDestino =
        this.servicioAlmacenamiento.crearCarpetaAlbum(nombreCarpeta);
      const archivosGuardados =
        await this.servicioAlmacenamiento.guardarArchivosAlbum(
          archivos,
          nombreCarpeta
        );

      const album = {
        id: nombreCarpeta,
        titulo,
        fecha,
        descripcion,
        fotos: archivosGuardados,
      };

      await this.repositorioAlbum.crear(album);
      return album;
    } catch (error) {
      this.servicioAlmacenamiento.limpiarArchivosTemporales(archivos);
      if (carpetaDestino) {
        this.servicioAlmacenamiento.eliminarCarpeta(carpetaDestino);
      }

      if (error.esOperacional) throw error;
      throw new ErrorApp('Error al crear el álbum', 500, false);
    }
  }

  /**
   * Lista todos los álbumes
   * @param {number|null} limite - Límite opcional
   */
  async listarAlbumes(limite = null) {
    return this.repositorioAlbum.obtenerTodos(limite);
  }

  /**
   * Elimina un álbum y sus archivos
   */
  async eliminarAlbum(id) {
    const album = await this.repositorioAlbum.obtenerPorId(id);
    if (!album) {
      throw new ErrorNoEncontrado('Álbum no encontrado');
    }

    this.servicioAlmacenamiento.eliminarAlbum(id);
    await this.repositorioAlbum.eliminarPorId(id);
  }

  /**
   * Actualiza un álbum existente
   * @param {string} id - ID del álbum
   * @param {Object} datos - Nuevos datos (titulo, fecha, descripcion)
   * @param {Array} archivos - Nuevas fotos (opcional)
   */
  async actualizarAlbum(id, datos, archivos = []) {
    const albumExistente = await this.repositorioAlbum.obtenerPorId(id);
    if (!albumExistente) {
      this.servicioAlmacenamiento.limpiarArchivosTemporales(archivos);
      throw new ErrorNoEncontrado('Álbum no encontrado');
    }

    const { titulo, fecha, descripcion = '', fotosExistentes } = datos;

    if (!titulo || !fecha) {
      this.servicioAlmacenamiento.limpiarArchivosTemporales(archivos);
      throw new ErrorValidacion('Faltan título o fecha');
    }

    try {
      // Usar las fotos existentes enviadas desde el frontend (ya filtradas por el usuario)
      let fotosActualizadas = [];

      if (fotosExistentes) {
        try {
          fotosActualizadas = JSON.parse(fotosExistentes);
        } catch (e) {
          fotosActualizadas = [];
        }
      }

      // Si hay nuevas fotos, agregarlas
      if (archivos && archivos.length > 0) {
        const nuevasFotos = await this.servicioAlmacenamiento.guardarArchivosAlbum(
          archivos,
          id // Usar el mismo ID/carpeta del álbum existente
        );
        fotosActualizadas = [...fotosActualizadas, ...nuevasFotos];
      }

      const albumActualizado = {
        id,
        titulo,
        fecha,
        descripcion,
        fotos: fotosActualizadas,
      };

      await this.repositorioAlbum.actualizar(id, albumActualizado);
      return albumActualizado;
    } catch (error) {
      this.servicioAlmacenamiento.limpiarArchivosTemporales(archivos);

      if (error.esOperacional) throw error;
      throw new ErrorApp('Error al actualizar el álbum', 500, false);
    }
  }
}

module.exports = ServicioAlbum;
