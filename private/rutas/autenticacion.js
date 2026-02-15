const express = require('express');
const { controladorAutenticacion } = require('../contenedor');
const autenticacion = require('../intermediarios/autenticacion');
const validador = require('../intermediarios/validador');
const { limitadorSesion } = require('../intermediarios/limitePeticiones');

const {
  esquemaSesion,
  esquemaCambioClave,
  esquemaRecuperacion,
  esquemaRestablecimiento,
} = require('../validaciones/esquemas');

const router = express.Router();

// Rutas vinculadas a la instancia del controlador
router.post(
  '/entrar',
  limitadorSesion,
  validador(esquemaSesion),
  (req, res, next) => controladorAutenticacion.iniciarSesion(req, res, next)
);

router.post(
  '/cambiar-clave',
  autenticacion,
  validador(esquemaCambioClave),
  (req, res, next) => controladorAutenticacion.cambiarContrasena(req, res, next)
);

router.post(
  '/recuperar',
  validador(esquemaRecuperacion),
  (req, res, next) => controladorAutenticacion.recuperar(req, res, next)
);

router.post(
  '/recuperar/cambiar',
  validador(esquemaRestablecimiento),
  (req, res, next) =>
    controladorAutenticacion.restablecerContrasena(req, res, next)
);

module.exports = router;
