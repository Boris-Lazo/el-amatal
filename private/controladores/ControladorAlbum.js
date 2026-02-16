/**
 * Controlador de álbumes
 */
class ControladorAlbum {
  /**
   * @param {ServicioAlbum} servicioAlbum
   */
  constructor(servicioAlbum) {
    this.servicioAlbum = servicioAlbum;
  }

  /**
   * Crear un nuevo álbum
   */
  async crearAlbum(req, res, next) {
    try {
      const { titulo, fecha, descripcion } = req.body;
      const archivos = req.files;
      const album = await this.servicioAlbum.crearAlbum(
        { titulo, fecha, descripcion },
        archivos
      );
      res.status(201).json({ ok: true, album });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Listar todos los álbumes
   */
  async listarAlbumes(req, res, next) {
    try {
      const limite = req.query.limite ? parseInt(req.query.limite, 10) : null;
      const albumes = await this.servicioAlbum.listarAlbumes(limite);
      res.json(albumes);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Eliminar un álbum
   */
  async eliminarAlbum(req, res, next) {
    try {
      const { id } = req.params;
      await this.servicioAlbum.eliminarAlbum(id);
      res.json({ ok: true, mensaje: 'Álbum eliminado' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Actualizar un álbum existente
   */
  async actualizarAlbum(req, res, next) {
    try {
      const { id } = req.params;
      const { titulo, fecha, descripcion, fotosExistentes } = req.body;
      const archivos = req.files || [];

      const album = await this.servicioAlbum.actualizarAlbum(
        id,
        { titulo, fecha, descripcion, fotosExistentes },
        archivos
      );

      res.json({ ok: true, album });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ControladorAlbum;
