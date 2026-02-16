/**
 * Cliente de API centralizado para el frontend (Versión Vue/ESM).
 * Gestiona la autenticación, los encabezados y los errores de forma consistente.
 */
const clienteApi = {
    /**
     * Realiza una petición fetch con gestión automática de token y errores.
     * @param {string} puntoEntrada - URL del endpoint.
     * @param {Object} opciones - Opciones de la petición fetch.
     * @param {number} intentos - Número de reintentos en caso de error de conexión.
     */
    async peticion(puntoEntrada, opciones = {}, intentos = 3) {
        const token = localStorage.getItem('token');

        const encabezados = {
            ...opciones.headers,
        };

        if (token) {
            encabezados['Authorization'] = `Bearer ${token}`;
        }

        // Si el cuerpo no es FormData, asumimos que es JSON.
        if (opciones.body && !(opciones.body instanceof FormData)) {
            encabezados['Content-Type'] = 'application/json';
        }

        try {
            const respuesta = await fetch(puntoEntrada, {
                ...opciones,
                headers: encabezados
            });

            // Gestionar sesiones expiradas o no autorizadas.
            if (respuesta.status === 401 && !puntoEntrada.includes('/entrar')) {
                localStorage.removeItem('token');
                localStorage.removeItem('usuario');
                // Redirigir al login si no estamos en una página pública que no requiera auth
                // En Vue lo manejaremos mejor en el router, pero esto es un fallback.
                if (!window.location.hash.includes('/login')) {
                    window.location.href = '/login';
                }
                return;
            }

            const datos = await respuesta.json();

            if (!respuesta.ok) {
                const error = new Error(datos.error || datos.mensaje || 'Error en la petición');
                error.codigoEstado = respuesta.status;
                throw error;
            }

            return datos;
        } catch (error) {
            // Si es un error de conexión y aún tenemos reintentos, esperar y reintentar
            if (intentos > 0 && (error.message.includes('fetch') || error.message.includes('NetworkError'))) {
                const delay = (4 - intentos) * 1000; // 1s, 2s, 3s
                await new Promise(resolve => setTimeout(resolve, delay));
                return this.peticion(puntoEntrada, opciones, intentos - 1);
            }
            throw error;
        }
    },

    /**
     * Realiza una petición GET.
     */
    obtener(puntoEntrada) {
        return this.peticion(puntoEntrada, { method: 'GET' });
    },

    /**
     * Realiza una petición POST.
     */
    enviar(puntoEntrada, cuerpo) {
        const esFormData = cuerpo instanceof FormData;
        return this.peticion(puntoEntrada, {
            method: 'POST',
            body: esFormData ? cuerpo : JSON.stringify(cuerpo)
        });
    },

    /**
     * Realiza una petición DELETE.
     */
    eliminar(puntoEntrada) {
        return this.peticion(puntoEntrada, { method: 'DELETE' });
    },

    /**
     * Realiza una petición PUT para actualizar recursos.
     */
    actualizar(puntoEntrada, cuerpo) {
        const esFormData = cuerpo instanceof FormData;
        return this.peticion(puntoEntrada, {
            method: 'PUT',
            body: esFormData ? cuerpo : JSON.stringify(cuerpo)
        });
    },

    /**
     * Gestiona la subida de archivos pesados con seguimiento del progreso.
     * @param {string} puntoEntrada - URL del endpoint
     * @param {FormData} datosFormulario - Datos del formulario
     * @param {Function} alProgresar - Callback para progreso
     * @param {string} metodo - Método HTTP (POST o PUT), por defecto POST
     */
    subir(puntoEntrada, datosFormulario, alProgresar, metodo = 'POST') {
        return new Promise((resolver, rechazar) => {
            const token = localStorage.getItem('token');
            const xhr = new XMLHttpRequest();

            xhr.open(metodo, puntoEntrada);

            if (token) {
                xhr.setRequestHeader('Authorization', `Bearer ${token}`);
            }

            xhr.upload.onprogress = (e) => {
                if (e.lengthComputable && alProgresar) {
                    const porcentaje = Math.round((e.loaded / e.total) * 100);
                    alProgresar(porcentaje);
                }
            };

            xhr.onload = () => {
                try {
                    const datos = JSON.parse(xhr.responseText);
                    if (xhr.status >= 200 && xhr.status < 300) {
                        resolver(datos);
                    } else {
                        rechazar(new Error(datos.error || 'Error al subir archivo'));
                    }
                } catch (e) {
                    rechazar(new Error('Error al procesar la respuesta del servidor'));
                }
            };

            xhr.onerror = () => rechazar(new Error('Error de conexión con el servidor'));
            xhr.send(datosFormulario);
        });
    }
};

export default clienteApi;
