# 🏫 Centro Escolar "Cantón El Amatal" - Portal y CMS

Sistema web completo para la gestión y publicación de contenido del Centro Escolar "Cantón El Amatal". Incluye un portal público moderno construido con Vue.js 3 y un sistema de administración (CMS) para gestionar álbumes fotográficos, documentos oficiales y eventos de la institución.

---

## ✨ Características Principales

- 📸 **Gestión de Álbumes**: Creación, edición y visualización de álbumes fotográficos con lightbox interactivo
- 📄 **Documentos Oficiales**: Almacenamiento y publicación de documentos PDF con generación automática de miniaturas
- 📅 **Eventos**: Organización de álbumes y documentos por eventos escolares
- 🔐 **Administración Segura**: Panel de administración protegido con autenticación JWT
- 📱 **Diseño Responsivo**: Interfaz adaptada para dispositivos móviles y escritorio
- ⚡ **Rendimiento Optimizado**: SPA con carga rápida y navegación fluida

---

## 🚀 Tecnologías Utilizadas

### Frontend
- **Vue.js 3** - Framework progresivo para construir interfaces de usuario reactivas
- **Vue Router** - Enrutador oficial para navegación SPA
- **Vite** - Herramienta de construcción ultrarrápida con HMR (Hot Module Replacement)

### Backend
- **Node.js & Express** - Entorno de ejecución y framework para el servidor API REST
- **SQLite3** - Base de datos ligera y eficiente para persistencia de datos
- **Zod** - Validación de esquemas y tipos de datos
- **JWT (jsonwebtoken)** - Autenticación segura basada en tokens
- **Multer** - Manejo de carga de archivos multiparte
- **Sharp** - Procesamiento de imágenes y generación de miniaturas
- **pdf-lib** - Generación de miniaturas de documentos PDF

### Herramientas de Desarrollo
- **Playwright** - Framework de testing end-to-end
- **Concurrently** - Ejecución simultánea de frontend y backend en desarrollo

---

## 🏗 Arquitectura

El sistema sigue una **Arquitectura de Capas** en el backend para garantizar la separación de responsabilidades y facilitar el mantenimiento:

### Backend (Arquitectura en Capas)
```
┌─────────────────────────────────────┐
│   Capa de Presentación              │
│   (Controladores + Rutas Express)   │
├─────────────────────────────────────┤
│   Capa de Lógica de Negocio         │
│   (Servicios)                       │
├─────────────────────────────────────┤
│   Capa de Acceso a Datos            │
│   (Repositorios)                    │
├─────────────────────────────────────┤
│   Persistencia                      │
│   (SQLite + Sistema de Archivos)    │
└─────────────────────────────────────┘
```

- **Controladores**: Manejo de peticiones HTTP y respuestas
- **Servicios**: Lógica de negocio, validaciones y orquestación
- **Repositorios**: Acceso a datos y consultas SQL con protección contra inyección SQL

### Frontend (SPA con Vue.js 3)
- **Vistas**: Páginas completas (Inicio, Eventos, Documentos, Admin)
- **Componentes**: Elementos reutilizables de UI (Navegación, Footer, Lightbox)
- **Router**: Gestión de navegación del lado del cliente
- **API Client**: Comunicación con el backend mediante Fetch API y XHR

Para más detalles sobre la arquitectura, consulta [`docs/ARQUITECTURA.md`](docs/ARQUITECTURA.md).

---

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** (versión 16 o superior)
- **npm** (incluido con Node.js)
- **Git** (opcional, para clonar el repositorio)

---

## 🔧 Instalación

### Opción 1: Instalación Automática (Recomendada)

Usa el script de inicio que instala todas las dependencias y levanta los servidores:

```bash
chmod +x iniciar_proyecto.sh
./iniciar_proyecto.sh
```

**🎯 Asistente de Configuración Interactivo**

Si es la primera vez que ejecutas el proyecto, el script detectará que no existe el archivo `.env` y lanzará un **asistente interactivo** que te guiará paso a paso para configurar:

- **Puerto del servidor** (default: 4000)
- **JWT Secret** (generado automáticamente de forma segura)
- **Contraseñas de usuarios** (Directora, Subdirectora, Desarrollador)
- **Configuración SMTP** para envío de correos

El asistente:
- ✅ Genera automáticamente valores seguros (como JWT_SECRET)
- ✅ Valida las entradas (puertos, emails)
- ✅ Oculta contraseñas durante la entrada
- ✅ Solicita confirmación antes de crear el archivo
- ✅ Agrega `.env` a `.gitignore` automáticamente

Si el archivo `.env` ya existe, el script continuará normalmente sin mostrar el asistente.

### Opción 2: Instalación Manual

1. **Clonar el repositorio** (si aplica):
   ```bash
   git clone <url-del-repositorio>
   cd el-amatal
   ```

2. **Instalar dependencias del frontend y backend**:
   ```bash
   npm run instalar-todo
   ```

   O manualmente:
   ```bash
   # Dependencias del frontend (raíz del proyecto)
   npm install

   # Dependencias del backend
   cd private
   npm install
   cd ..
   ```

3. **Configurar variables de entorno**:
   
   Crea un archivo `.env` en la **raíz del proyecto** con la siguiente estructura:
   ```env
   # Secreto para firmar los JSON Web Tokens
   JWT_SECRET=tu_clave_secreta_muy_larga_y_aleatoria_aqui
   
   # Contraseñas para los usuarios por defecto
   USER_DIRECTORA_PASS="Directora.2024!"
   USER_SUBDIRECTORA_PASS="Subdirectora.2024!"
   USER_DEV_PASS="dev2024!"
   
   # Configuración del servidor de correo
   SMTP_HOST=smtp.ethereal.email
   SMTP_PORT=587
   SMTP_USER=usuario_ethereal_aqui
   SMTP_PASS=contraseña_ethereal_aqui
   SMTP_FROM="Centro Escolar <noreply@amatal.edu.sv>"
   
   # Puerto en el que correrá el servidor
   PORT=4000
   ```

   > **💡 Tip:** Usa el script automático (Opción 1) para que el asistente genere este archivo por ti con valores seguros.


---

## 🚀 Uso

### Modo Desarrollo

Inicia el frontend y backend simultáneamente:

```bash
npm run dev:all
```

Esto levantará:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:4000

### Comandos Individuales

```bash
# Solo frontend (Vite)
npm run dev

# Solo backend (Express)
npm run start

# Construir para producción
npm run build

# Vista previa de la build de producción
npm run preview

# Ejecutar tests E2E
npm test
```

---

## 📁 Estructura del Proyecto

```
el-amatal/
├── public/                    # Archivos estáticos del frontend
│   ├── index.html            # Punto de entrada HTML
│   └── src/                  # Código fuente Vue.js
│       ├── vistas/           # Componentes de página
│       ├── componentes/      # Componentes reutilizables
│       ├── router/           # Configuración de rutas
│       ├── api/              # Cliente API
│       └── App.vue           # Componente raíz
├── private/                   # Backend (Node.js/Express)
│   ├── controladores/        # Capa de presentación
│   ├── servicios/            # Lógica de negocio
│   ├── repositorios/         # Acceso a datos
│   ├── intermediarios/       # Middlewares Express
│   ├── utilidades/           # Funciones auxiliares
│   ├── upload/               # Archivos subidos
│   │   ├── albums/           # Imágenes de álbumes
│   │   ├── docs/             # Documentos PDF
│   │   └── thumbnails/       # Miniaturas generadas
│   ├── servidor.js           # Punto de entrada del servidor
│   └── contenedor.js         # Inyección de dependencias
├── docs/                      # Documentación técnica
│   ├── ARQUITECTURA.md       # Detalles de arquitectura
│   ├── COMPONENTES_BACKEND.md
│   ├── COMPONENTES_FRONTEND.md
│   ├── ESTANDARES_CALIDAD.md
│   └── MANUAL_QA.md
├── vite.config.js            # Configuración de Vite
├── package.json              # Dependencias del frontend
├── iniciar_proyecto.sh       # Script de inicio automático
└── README.md                 # Este archivo
```

---

## 🔐 Autenticación

El sistema utiliza **JWT (JSON Web Tokens)** para la autenticación:

1. El administrador inicia sesión con sus credenciales
2. El servidor genera un token JWT firmado
3. El token se almacena en `localStorage` del navegador
4. Cada petición al backend incluye el token en el header `Authorization`
5. El servidor valida el token antes de procesar peticiones protegidas

---

## 📚 Documentación Adicional

- **[Arquitectura del Sistema](docs/ARQUITECTURA.md)** - Detalles técnicos de la arquitectura en capas
- **[Componentes Backend](docs/COMPONENTES_BACKEND.md)** - Descripción de módulos del servidor
- **[Componentes Frontend](docs/COMPONENTES_FRONTEND.md)** - Descripción de componentes Vue
- **[Estándares de Calidad](docs/ESTANDARES_CALIDAD.md)** - Guías de código y buenas prácticas
- **[Manual de QA](docs/MANUAL_QA.md)** - Procedimientos de pruebas y control de calidad

---

## 🧪 Testing

El proyecto incluye pruebas end-to-end con Playwright:

```bash
npm test
```

---

## 🛡️ Seguridad

- ✅ Protección contra inyección SQL mediante consultas parametrizadas
- ✅ Autenticación JWT con tokens firmados
- ✅ Validación de entrada con Zod
- ✅ Manejo centralizado de errores sin exposición de información sensible
- ✅ Sanitización de archivos subidos

---

## 🤝 Contribución

Este proyecto está diseñado para el Centro Escolar "Cantón El Amatal". Para contribuir:

1. Revisa la documentación en la carpeta `docs/`
2. Sigue los estándares de código establecidos
3. Asegúrate de que las pruebas pasen antes de hacer commits

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo [`LICENSE`](LICENSE) para más detalles.

---

## 👨‍💻 Soporte

Para reportar problemas o solicitar nuevas funcionalidades, por favor contacta al equipo de desarrollo del proyecto.

---

**Desarrollado con ❤️ para el Centro Escolar "Cantón El Amatal"**
