<template>
  <div class="admin-body">
    <div class="admin-topbar">
      <div class="admin-topbar-content">
        <div class="admin-brand">
          <h1>Panel Administrativo</h1>
          <p class="admin-user-info">Sesión: <span id="admin-usuario">{{ usuario }}</span></p>
        </div>

        <button class="admin-menu-toggle" @click="menuAbierto = !menuAbierto">☰</button>

          <div class="admin-actions" :class="{ 'show': menuAbierto }">
            <router-link to="/" class="btn-secondary">Volver al Sitio</router-link>
            <button @click="abrirModalCerrarSesion" class="btn-danger">Cerrar Sesión</button>
          </div>
      </div>
    </div>

    <main class="admin-main">
      <section class="admin-dashboard">
        <h2>Dashboard</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">📸</div>
            <div class="stat-info">
              <h3 id="stat-albums">{{ estadisticas.albumes }}</h3>
              <p>Álbumes</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">📄</div>
            <div class="stat-info">
              <h3 id="stat-docs">{{ estadisticas.documentos }}</h3>
              <p>Documentos</p>
            </div>
          </div>
        </div>
      </section>

      <section class="admin-tabs-section">
        <div class="tabs-header desktop-only">
          <button class="tab-btn" :class="{ 'active': pestañaActiva === 'albumes' }" @click="pestañaActiva = 'albumes'">Gestión de Álbumes</button>
          <button class="tab-btn" :class="{ 'active': pestañaActiva === 'documentos' }" @click="pestañaActiva = 'documentos'">Gestión de Documentos</button>
        </div>

        <div class="tab-contenido">
          <!-- ÁLBUMES -->
          <button class="mobile-accordion-toggle" :class="{ 'active': pestañaActiva === 'albumes' }" @click="alternarSeccion('albumes')">
            <span>📸 Gestión de Álbumes</span>
            <span class="chevron">{{ pestañaActiva === 'albumes' ? '▲' : '▼' }}</span>
          </button>
          <div v-show="pestañaActiva === 'albumes'" class="tab-content active">
            <div class="admin-card">
              <h3>{{ modoEdicion ? '✏️ Editar Álbum' : '📸 Nuevo Álbum' }}</h3>
              <form @submit.prevent="crearAlbum" class="admin-form">
                <div class="form-row">
                  <div class="form-group">
                    <label>Título del Álbum</label>
                    <input type="text" v-model="formularioAlbum.titulo" placeholder="Ej: Intramuros 2024" required>
                  </div>
                  <div class="form-group">
                    <label>Fecha</label>
                    <input type="date" v-model="formularioAlbum.fecha" required>
                  </div>
                </div>
                <div class="form-group">
                  <label>Descripción</label>
                  <textarea v-model="formularioAlbum.descripcion" rows="3" placeholder="Descripción breve del evento..." maxlength="500"></textarea>
                  <div class="character-counter" :class="{ 'limit-warning': formularioAlbum.descripcion.length > 450 }">
                    {{ formularioAlbum.descripcion.length }}/500 caracteres
                  </div>
                </div>
                <div class="form-group">
                  <label>Fotos</label>
                  
                  <!-- Fotos existentes (solo en modo edición) -->
                  <div v-if="modoEdicion && fotosExistentes.length > 0" class="fotos-existentes">
                    <p style="font-size: 0.9rem; color: #666; margin-bottom: 0.5rem;">Fotos actuales del álbum:</p>
                    <div class="grid-fotos-existentes">
                      <div v-for="(foto, index) in fotosExistentes" :key="foto" class="foto-existente-item">
                        <img :src="`/api/subidas/${albumEditando.id}/${foto}`" :alt="`Foto ${index + 1}`">
                        <button type="button" @click="eliminarFotoExistente(index)" class="btn-eliminar-foto" title="Eliminar foto">
                          <span>✕</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Input para nuevas fotos -->
                  <div class="file-input-wrapper">
                    <input type="file" id="input-fotos" multiple accept="image/*" @change="manejarCambioFotos" :required="!modoEdicion">
                    <div class="file-input-label">{{ modoEdicion ? 'Agregar Más Fotos' : 'Seleccionar Imágenes' }}</div>
                  </div>
                  <div class="preview-grid" v-if="vistaPreviaFotos.length > 0">
                    <div v-for="(url, index) in vistaPreviaFotos" :key="index" class="previsualizacion-archivo foto-preview-item">
                      <img :src="url" alt="Vista previa">
                      <button type="button" @click="eliminarFotoNueva(index)" class="btn-eliminar-foto" title="Eliminar foto">
                        <span>✕</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div v-if="subiendoAlbum" class="progress-container">
                    <progress :value="progresoAlbum" max="100"></progress>
                    <span id="progress-text">{{ progresoAlbum }}%</span>
                </div>

                <button type="submit" class="btn-primary" :disabled="subiendoAlbum">{{ modoEdicion ? 'Actualizar Álbum' : 'Publicar Álbum' }}</button>
                <button v-if="modoEdicion" type="button" @click="cancelarEdicion" class="btn-secondary" style="margin-left: 1rem;">Cancelar</button>
                <p v-if="mensajeAlbum" :class="tipoMensajeAlbum">{{ mensajeAlbum }}</p>
              </form>

              <hr style="margin: 2rem 0;">

              <h3>Lista de Álbumes</h3>
              <div v-if="cargandoAlbumes" class="loading-content">Cargando álbumes...</div>
              <div v-else-if="albums.length === 0" class="empty-list">No hay álbumes publicados.</div>
              <div v-else class="content-list">
                <div v-for="a in albums" :key="a.id" class="content-item">
                   <div class="content-info">
                      <h4>{{ a.titulo }}</h4>
                      <div class="content-meta">
                        <span>📅 {{ a.fecha }}</span>
                        <span>📸 {{ a.fotos.length }} fotos</span>
                      </div>
                   </div>
                   <div class="content-actions">
                     <button @click="editarAlbum(a)" class="btn-edit">Editar</button>
                     <button @click="confirmarBorrado('album', a.id)" class="btn-delete">Eliminar</button>
                   </div>
                </div>
              </div>
            </div>
          </div>

          <!-- DOCUMENTOS -->
          <button class="mobile-accordion-toggle" :class="{ 'active': pestañaActiva === 'documentos' }" @click="alternarSeccion('documentos')">
            <span>📄 Gestión de Documentos</span>
            <span class="chevron">{{ pestañaActiva === 'documentos' ? '▲' : '▼' }}</span>
          </button>
          <div v-show="pestañaActiva === 'documentos'" class="tab-content active">
            <div class="admin-card">
              <h3>📄 Nuevo Documento</h3>
              <form @submit.prevent="crearDoc" class="admin-form">
                <div class="form-row">
                  <div class="form-group">
                    <label>Título del Documento</label>
                    <input type="text" v-model="formularioDoc.titulo" placeholder="Ej: Rendición de Cuentas - Junio" required>
                  </div>
                  <div class="form-group">
                    <label>Mes y Año</label>
                    <div class="date-selector-row">
                      <select v-model="mesSeleccionado" required>
                        <option value="" disabled>Seleccionar Mes</option>
                        <option value="01">Enero</option>
                        <option value="02">Febrero</option>
                        <option value="03">Marzo</option>
                        <option value="04">Abril</option>
                        <option value="05">Mayo</option>
                        <option value="06">Junio</option>
                        <option value="07">Julio</option>
                        <option value="08">Agosto</option>
                        <option value="09">Septiembre</option>
                        <option value="10">Octubre</option>
                        <option value="11">Noviembre</option>
                        <option value="12">Diciembre</option>
                      </select>
                      <input type="number" v-model="anioSeleccionado" placeholder="Año" min="2000" max="2100" required>
                    </div>
                  </div>
                </div>

                <div class="form-group">
                  <label>Archivo (Solo PDF)</label>
                  <div class="file-input-wrapper">
                    <input type="file" id="input-doc" accept=".pdf" @change="manejarCambioArchivoDoc" required>
                    <div class="file-input-label">Seleccionar Archivo</div>
                  </div>
                  <p v-if="formularioDoc.archivo" style="font-size: 0.9rem; margin-top: 0.5rem;">Seleccionado: {{ formularioDoc.archivo.name }}</p>

                  <!-- Vista previa de documento -->
                  <div v-if="vistaPreviaDoc" class="previsualizacion-archivo previsualizacion-documento">
                     <iframe v-if="esPdf" :src="vistaPreviaDoc" class="preview-pdf"></iframe>
                     <img v-else :src="vistaPreviaDoc" class="preview-img-doc" alt="Vista previa documento">
                  </div>
                </div>

                <div v-if="subiendoDoc" class="progress-container">
                    <progress :value="progresoDoc" max="100"></progress>
                    <span id="progress-text-doc">{{ progresoDoc }}%</span>
                </div>

                <button type="submit" class="btn-primary" :disabled="subiendoDoc">Subir Documento</button>
                <p v-if="mensajeDoc" :class="tipoMensajeDoc">{{ mensajeDoc }}</p>
              </form>

              <hr style="margin: 2rem 0;">

              <h3>Lista de Documentos</h3>
              <div v-if="cargandoDocs" class="loading-content">Cargando documentos...</div>
              <div v-else-if="docs.length === 0" class="empty-list">No hay documentos publicados.</div>
              <div v-else class="content-list">
                <div v-for="d in docs" :key="d.id" class="content-item">
                   <div class="content-info">
                      <h4>{{ d.titulo }}</h4>
                      <div class="content-meta">
                        <span>📅 {{ d.mes }}</span>
                        <span>Tipo: {{ d.filename.split('.').pop().toUpperCase() }}</span>
                      </div>
                   </div>
                   <button @click="confirmarBorrado('doc', d.id)" class="btn-delete">Eliminar</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- MODAL CONFIRMACION -->
    <div class="modal-overlay" :class="{ 'active': modalBorrado.activo }">
      <div class="modal-container">
        <div class="modal-header">
           <h3>Confirmar Eliminación</h3>
        </div>
        <div class="modal-body">
          <p>¿Estás seguro de que deseas eliminar este {{ modalBorrado.tipo === 'album' ? 'álbum' : 'documento' }}?</p>
          <p class="modal-hint">Esta acción no se puede deshacer y borrará los archivos asociados.</p>
        </div>
        <div class="modal-footer">
          <button @click="modalBorrado.activo = false" class="btn-modal btn-modal-cancel">Cancelar</button>
          <button @click="borrarContenido" class="btn-modal btn-modal-confirm">Eliminar Permanentemente</button>
        </div>
      </div>
    </div>

    <!-- MODAL CONFIRMACION ELIMINAR FOTO -->
    <div class="modal-overlay" :class="{ 'active': modalEliminarFoto.activo }">
      <div class="modal-container modal-small">
        <div class="modal-header">
           <h3>❌ Eliminar Foto</h3>
        </div>
        <div class="modal-body">
          <p>¿Estás seguro de eliminar esta foto del álbum?</p>
          <p class="modal-hint">La foto se eliminará al guardar los cambios.</p>
        </div>
        <div class="modal-footer">
          <button @click="modalEliminarFoto.activo = false" class="btn-modal btn-modal-cancel">Cancelar</button>
          <button @click="confirmarEliminarFoto" class="btn-modal btn-modal-confirm">Eliminar</button>
        </div>
      </div>
    </div>

    <!-- MODAL CONFIRMACION CERRAR SESION -->
    <div class="modal-overlay" :class="{ 'active': modalCerrarSesion.activo }">
      <div class="modal-container modal-small">
        <div class="modal-header">
           <h3>⚠️ Cerrar Sesión</h3>
        </div>
        <div class="modal-body">
          <p>¿Estás seguro de que quieres cerrar la sesión?</p>
          <p class="modal-hint">Cualquier cambio no guardado se perderá.</p>
        </div>
        <div class="modal-footer">
          <button @click="modalCerrarSesion.activo = false" class="btn-modal btn-modal-cancel">Cancelar</button>
          <button @click="cerrarSesion" class="btn-modal btn-modal-confirm">Cerrar Sesión</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/api/clienteApi';
import { estadoSesion } from '@/utilidades/sesion';

const router = useRouter();
const usuario = ref(localStorage.getItem('usuario') || 'Administrador');
const menuAbierto = ref(false);
const pestañaActiva = ref('');
const estadisticas = reactive({ albumes: 0, documentos: 0 });

// Álbumes
const albums = ref([]);
const cargandoAlbumes = ref(true);
const formularioAlbum = reactive({ titulo: '', fecha: '', descripcion: '', fotos: [] });
const vistaPreviaFotos = ref([]);
const subiendoAlbum = ref(false);
const progresoAlbum = ref(0);
const mensajeAlbum = ref('');
const tipoMensajeAlbum = ref('');
const modoEdicion = ref(false);
const albumEditando = ref(null);
const fotosExistentes = ref([]);
const modalEliminarFoto = reactive({ activo: false, indice: null, esNueva: false });

// Documentos
const docs = ref([]);
const cargandoDocs = ref(true);
const formularioDoc = reactive({ titulo: '', mes: '', archivo: null });
const vistaPreviaDoc = ref(null);
const subiendoDoc = ref(false);
const progresoDoc = ref(0);
const mensajeDoc = ref('');
const tipoMensajeDoc = ref('');
const mesSeleccionado = ref('');
const anioSeleccionado = ref(new Date().getFullYear());

const esPdf = computed(() => {
  return formularioDoc.archivo && formularioDoc.archivo.type === 'application/pdf';
});

// Modal
const modalBorrado = reactive({ activo: false, tipo: '', id: null });
const modalCerrarSesion = reactive({ activo: false });

async function cargarDatos() {
  try {
    albums.value = await api.obtener('/api/albumes');
    estadisticas.albumes = albums.value.length;
    cargandoAlbumes.value = false;
  } catch (e) { console.error(e); }

  try {
    docs.value = await api.obtener('/api/documentos');
    estadisticas.documentos = docs.value.length;
    cargandoDocs.value = false;
  } catch (e) { console.error(e); }
}

onMounted(() => {
  if (!localStorage.getItem('token')) {
    router.push('/entrar');
    return;
  }
  
  // En escritorio mostramos la primera pestaña por defecto
  // En móvil, ambas cerradas (acordeón colapsado)
  if (window.innerWidth > 768) {
    pestañaActiva.value = 'albumes';
  }

  cargarDatos();
});

function abrirModalCerrarSesion() {
  modalCerrarSesion.activo = true;
}

function cerrarSesion() {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  estadoSesion.actualizar();
  router.push('/entrar');
}

function alternarSeccion(seccion) {
  if (pestañaActiva.value === seccion) {
    pestañaActiva.value = '';
  } else {
    pestañaActiva.value = seccion;
  }
}

function manejarCambioFotos(e) {
  const archivos = Array.from(e.target.files);
  formularioAlbum.fotos = archivos;

  // Limpiar antiguas URLs
  vistaPreviaFotos.value.forEach(url => URL.revokeObjectURL(url));
  vistaPreviaFotos.value = archivos.map(f => URL.createObjectURL(f));
}

function eliminarFotoNueva(index) {
  modalEliminarFoto.activo = true;
  modalEliminarFoto.indice = index;
  modalEliminarFoto.esNueva = true; // Flag para distinguir entre foto nueva y existente
}


function editarAlbum(album) {
  modoEdicion.value = true;
  albumEditando.value = album;
  
  // Poblar formulario con datos existentes
  formularioAlbum.titulo = album.titulo;
  formularioAlbum.fecha = album.fecha;
  formularioAlbum.descripcion = album.descripcion || '';
  formularioAlbum.fotos = []; // Las fotos nuevas se agregarán aquí
  vistaPreviaFotos.value = [];
  
  // Cargar fotos existentes
  fotosExistentes.value = [...album.fotos];
  
  // Scroll al formulario
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function eliminarFotoExistente(index) {
  modalEliminarFoto.activo = true;
  modalEliminarFoto.indice = index;
  modalEliminarFoto.esNueva = false;
}

function confirmarEliminarFoto() {
  if (modalEliminarFoto.indice !== null) {
    if (modalEliminarFoto.esNueva) {
      // Eliminar foto nueva de la vista previa
      URL.revokeObjectURL(vistaPreviaFotos.value[modalEliminarFoto.indice]);
      vistaPreviaFotos.value.splice(modalEliminarFoto.indice, 1);
      formularioAlbum.fotos.splice(modalEliminarFoto.indice, 1);
    } else {
      // Eliminar foto existente
      fotosExistentes.value.splice(modalEliminarFoto.indice, 1);
    }
  }
  modalEliminarFoto.activo = false;
  modalEliminarFoto.indice = null;
  modalEliminarFoto.esNueva = false;
}

function cancelarEdicion() {
  modoEdicion.value = false;
  albumEditando.value = null;
  formularioAlbum.titulo = '';
  formularioAlbum.fecha = '';
  formularioAlbum.descripcion = '';
  formularioAlbum.fotos = [];
  vistaPreviaFotos.value = [];
  fotosExistentes.value = [];
  mensajeAlbum.value = '';
}

async function crearAlbum() {
  subiendoAlbum.value = true;
  progresoAlbum.value = 0;
  mensajeAlbum.value = '';

  try {
    const datosFormulario = new FormData();
    datosFormulario.append('titulo', formularioAlbum.titulo);
    datosFormulario.append('fecha', formularioAlbum.fecha);
    datosFormulario.append('descripcion', formularioAlbum.descripcion);
    formularioAlbum.fotos.forEach(f => datosFormulario.append('fotos', f));

    if (modoEdicion.value) {
      // Enviar lista de fotos existentes que se deben mantener
      datosFormulario.append('fotosExistentes', JSON.stringify(fotosExistentes.value));
      
      // Actualizar álbum existente
      await api.subir(`/api/albumes/${albumEditando.value.id}`, datosFormulario, (p) => {
        progresoAlbum.value = p;
      }, 'PUT');

      mensajeAlbum.value = 'Álbum actualizado con éxito.';
    } else {
      // Crear nuevo álbum
      await api.subir('/api/albumes', datosFormulario, (p) => {
        progresoAlbum.value = p;
      });

      mensajeAlbum.value = 'Álbum creado con éxito.';
    }

    tipoMensajeAlbum.value = 'success-msg';
    
    // Reiniciar formulario
    cancelarEdicion();
    cargarDatos();
  } catch (e) {
    mensajeAlbum.value = e.mensaje || e.message;
    tipoMensajeAlbum.value = 'error-msg';
  } finally {
    subiendoAlbum.value = false;
  }
}

function manejarCambioArchivoDoc(e) {
  const archivo = e.target.files[0];
  formularioDoc.archivo = archivo;

  if (vistaPreviaDoc.value) {
    URL.revokeObjectURL(vistaPreviaDoc.value);
  }

  if (archivo) {
    vistaPreviaDoc.value = URL.createObjectURL(archivo);
  } else {
    vistaPreviaDoc.value = null;
  }
}

async function crearDoc() {
  subiendoDoc.value = true;
  progresoDoc.value = 0;
  mensajeDoc.value = '';

  try {
    const datosFormulario = new FormData();
    datosFormulario.append('titulo', formularioDoc.titulo);
    // Construir formato YYYY-MM
    formularioDoc.mes = `${anioSeleccionado.value}-${mesSeleccionado.value}`;
    datosFormulario.append('mes', formularioDoc.mes);

    datosFormulario.append('documento', formularioDoc.archivo);

    await api.subir('/api/documentos', datosFormulario, (p) => {
      progresoDoc.value = p;
    });

    mensajeDoc.value = 'Documento subido con éxito.';
    tipoMensajeDoc.value = 'success-msg';
    formularioDoc.titulo = ''; 
    formularioDoc.mes = ''; 
    formularioDoc.archivo = null;
    mesSeleccionado.value = '';
    anioSeleccionado.value = new Date().getFullYear();
    if (vistaPreviaDoc.value) {
      URL.revokeObjectURL(vistaPreviaDoc.value);
      vistaPreviaDoc.value = null;
    }
    cargarDatos();
  } catch (e) {
    mensajeDoc.value = e.mensaje || e.message;
    tipoMensajeDoc.value = 'error-msg';
  } finally {
    subiendoDoc.value = false;
  }
}

function confirmarBorrado(tipo, id) {
  modalBorrado.tipo = tipo;
  modalBorrado.id = id;
  modalBorrado.activo = true;
}

async function borrarContenido() {
  const { tipo, id } = modalBorrado;
  try {
    const puntoEntrada = tipo === 'album' ? `/api/albumes/${id}` : `/api/documentos/${id}`;
    await api.eliminar(puntoEntrada);
    cargarDatos();
    modalBorrado.activo = false;
  } catch (e) {
    alert('Error al eliminar: ' + (e.mensaje || e.message));
  }
}
</script>

<style scoped>
.admin-body {
    background: #f5f7fa;
    min-height: 100vh;
}

.admin-topbar {
    background: linear-gradient(135deg, #003b88 0%, #0056b3 100%);
    color: white;
    padding: 1.5rem 2rem;
    position: sticky;
    top: 0;
    z-index: 100;
}

.admin-topbar-content {
    max-width: 1400px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 2rem;
}

.admin-brand h1 {
    font-size: 1.5rem;
    margin: 0 0 0.25rem 0;
    font-weight: 700;
}

.admin-user-info {
    font-size: 0.9rem;
    opacity: 0.9;
    margin: 0;
}

.admin-user-info span {
    font-weight: 600;
    color: #ffd700;
}

.admin-menu-toggle {
    display: none;
    background: none;
    border: 2px solid white;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0.3rem 0.6rem;
    border-radius: 4px;
}

.admin-actions {
    display: flex;
    gap: 1rem;
}

.btn-primary,
.btn-secondary,
.btn-danger {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 0.95rem;
    text-decoration: none;
    display: inline-block;
}

.btn-primary {
    background: #003b88;
    color: white;
    width: 100%;
    margin-top: 1rem;
}

.btn-primary:hover {
    background: #002a60;
    transform: translateY(-2px);
}

.btn-secondary {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border: 2px solid rgba(255, 255, 255, 0.3);
}

.btn-danger {
    background: #dc3545;
    color: white;
}

.admin-main {
    padding: 0rem 1rem 0rem 1rem;
    max-width: 1400px;
    margin: 0 auto;
}

.admin-dashboard h2 {
    color: #003b88;

    font-size: 1.8rem;
    border-bottom: none;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
}

.stat-card {
    background: white;
    padding: 1.5rem;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    display: flex;
    align-items: center;
    gap: 1.5rem;
}

.stat-icon {
    font-size: 3rem;
}

.stat-info h3 {
    font-size: 2rem;
    color: #003b88;
    margin: 0 0 0.25rem 0;
    font-weight: 700;
}

.stat-info p {
    margin: 0;
    color: #666;
    font-size: 0.95rem;
}

.admin-tabs-section {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    overflow: hidden;
}

.tabs-header {
    display: flex;
    background: #f8f9fa;
    border-bottom: 2px solid #e0e0e0;
}

.tab-btn {
    flex: 1;
    padding: 1.25rem 2rem;
    background: transparent;
    border: none;
    font-size: 1rem;
    font-weight: 600;
    color: #666;
    cursor: pointer;
    transition: all 0.3s ease;
    border-bottom: 3px solid transparent;
}

.tab-btn.active {
    color: #003b88;
    background: white;
    border-bottom-color: #003b88;
}

.mobile-accordion-toggle {
    display: none;
}

.tab-content {
    padding: 2rem;
}

.admin-card h3 {
    color: #003b88;
    margin-bottom: 1.5rem;
    font-size: 1.3rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.admin-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.form-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.form-group label {
    font-weight: 600;
    color: #333;
    font-size: 0.95rem;
}

.form-group input,
.form-group textarea,
.form-group select {
    padding: 0.85rem 1rem;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    font-size: 1rem;
}

.character-counter {
    font-size: 0.85rem;
    color: #666;
    text-align: right;
    margin-top: 0.25rem;
}

.character-counter.limit-warning {
    color: #dc3545;
    font-weight: 600;
}


.date-selector-row {
  display: flex;
  gap: 1rem;
}

.date-selector-row select,
.date-selector-row input {
  flex: 1;
}

.file-input-wrapper {
    position: relative;
}

.file-input-wrapper input[type="file"] {
    position: absolute;
    opacity: 0;
    width: 100%;
    height: 100%;
    cursor: pointer;
}

.file-input-label {
    display: block;
    padding: 0.85rem 1rem;
    border: 2px dashed #003b88;
    border-radius: 8px;
    text-align: center;
    color: #003b88;
    font-weight: 600;
    background: rgba(0, 59, 136, 0.05);
}

.preview-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
}

.previsualizacion-archivo img {
    width: 100%;
    height: 120px;
    object-fit: cover;
    border-radius: 8px;
    border: 1px solid #ddd;
}

.foto-preview-item {
    position: relative;
}

.foto-preview-item:hover .btn-eliminar-foto {
    opacity: 1;
}

.previsualizacion-documento {
    margin-top: 1rem;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    overflow: hidden;
    max-width: 500px;
}

.preview-pdf {
    width: 100%;
    height: 300px;
    border: none;
}

.preview-img-doc {
    width: 100%;
    height: auto;
    max-height: 400px;
    object-fit: contain;
}

.progress-container {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-top: 1rem;
}

progress {
    flex: 1;
    height: 12px;
}

.error-msg,
.success-msg {
    padding: 1rem;
    border-radius: 8px;
    font-size: 0.95rem;
    margin-top: 1rem;
}

.error-msg {
    color: #721c24;
    background: #f8d7da;
    border: 1px solid #f5c6cb;
}

.success-msg {
    color: #155724;
    background: #d4edda;
    border: 1px solid #c3e6cb;
}

.content-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-top: 1rem;
}

.content-item {
    background: #f8f9fa;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    padding: 1.25rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.content-info h4 {
    color: #003b88;
    margin: 0 0 0.5rem 0;
    font-size: 1.1rem;
}

.content-meta {
    color: #666;
    font-size: 0.9rem;
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
}

.content-actions {
    display: flex;
    gap: 0.5rem;
}

.btn-edit {
    padding: 0.5rem 1rem;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: background-color 0.3s ease;
}

.btn-edit:hover {
    background-color: #0056b3;
}

.btn-delete {
    background: #dc3545;
    color: white;
    border: none;
    padding: 0.6rem 1.25rem;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
}

.btn-secondary {
    padding: 0.75rem 1.5rem;
    background-color: #6c757d;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1rem;
    transition: background-color 0.3s ease;
}

.btn-secondary:hover {
    background-color: #5a6268;
}

.fotos-existentes {
    margin-bottom: 1rem;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;
}

.grid-fotos-existentes {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 0.75rem;
}

.foto-existente-item {
    position: relative;
    aspect-ratio: 1;
    border-radius: 8px;
    overflow: hidden;
    border: 2px solid #e0e0e0;
}

.foto-existente-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.btn-eliminar-foto {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 28px;
    height: 28px;
    background: rgba(220, 53, 69, 0.9);
    color: white;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s ease, background-color 0.2s ease;
    font-size: 16px;
    padding: 0;
}

.foto-existente-item:hover .btn-eliminar-foto {
    opacity: 1;
}

.btn-eliminar-foto:hover {
    background: rgba(220, 53, 69, 1);
}


.modal-overlay {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.6);
    z-index: 10000;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(4px);
}

.modal-overlay.active {
    display: flex;
}

.modal-container {
    background: white;
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    max-width: 450px;
    width: 90%;
    overflow: hidden;
}

.modal-header {
    background: linear-gradient(135deg, #003b88 0%, #0056b3 100%);
    color: white;
    padding: 1.5rem 2rem;
}

.modal-header h3 {
    margin: 0;
    font-size: 1.3rem;
}

.modal-body {
    padding: 2rem;
}

.modal-footer {
    padding: 1.5rem 2rem;
    background: #f8f9fa;
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
}

.btn-modal {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
}

.btn-modal-cancel {
    background: #e0e0e0;
    color: #333;
}

.btn-modal-confirm {
    background: #dc3545;
    color: white;
}

@media (max-width: 768px) {
    .admin-menu-toggle {
        display: block;
    }

    .admin-actions {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: #002a60;
        flex-direction: column;
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.3s ease;
    }

    .desktop-only {
        display: none !important;
    }

    .mobile-accordion-toggle {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        background: #f8f9fa;
        color: #333;
        border: none;
        border-bottom: 1px solid #e0e0e0;
        padding: 1.25rem;
        font-size: 1.1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .mobile-accordion-toggle.active {
        background: #e9ecef;
        color: #003b88;
        border-bottom-color: #003b88;
    }

    .mobile-accordion-toggle .chevron {
        font-size: 0.8rem;
        transition: transform 0.3s ease;
    }

    /* Ajustar relleno cuando está en acordeón */
    .tab-content {
        padding: 1rem;
    }

    .admin-actions.show {
        max-height: 200px;
        padding: 1rem;
    }

    .admin-main {
        padding: 0rem 1rem 0rem 1rem;
    }

    .tabs-header {
        flex-direction: column;
    }

    .tab-btn {
        border-bottom: none;
    }

    .tab-content {
        padding: 1.5rem 1rem;
    }

    .form-row {
        grid-template-columns: 1fr;
    }

    .content-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
    }

    .btn-delete {
        width: 100%;
    }
}
</style>
