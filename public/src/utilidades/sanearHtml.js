/**
 * utilidades/sanearHtml.js
 * Funciones para prevenir ataques XSS
 */

/**
 * Sanitiza una cadena de texto para evitar la inyección de HTML.
 * Reemplaza los caracteres especiales de HTML con sus entidades correspondientes.
 *
 * @param {string} cadenaNoSegura - La cadena de texto a sanitizar.
 * @returns {string} - La cadena de texto sanitizada.
 */
export function sanearHTML(cadenaNoSegura) {
  if (typeof cadenaNoSegura !== 'string') {
    return '';
  }

  const mapaEntidades = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  };

  return cadenaNoSegura.replace(/[&<>"'`=\/]/g, (caracter) => mapaEntidades[caracter]);
}
