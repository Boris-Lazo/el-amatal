<template>
  <div class="documentos-page">
    <main class="documentos-main">
      <section class="documentos-intro">
        <h2>Documentos de Rendición de Cuentas</h2>
        <p>En cumplimiento con la normativa de transparencia, compartimos con la comunidad los documentos de rendición de cuentas de nuestra institución.</p>
      </section>

      <div v-if="cargando" class="loading-message">Cargando documentos...</div>
      <div v-else-if="error" class="error-message">{{ error }}</div>
      <div v-else-if="años.length === 0" class="empty-message">No hay documentos disponibles aún.</div>

      <div v-else class="documentos-container">
        <div v-for="año in años" :key="año.año" class="year-section">
          <h3 class="year-header">📅 {{ año.año }}</h3>

          <div v-for="mes in año.meses" :key="mes.mes" class="month-section">
            <h4 class="month-header">{{ formatearMes(mes.mes) }}</h4>

            <div class="documentos-grid grid-uniforme">
              <a 
                v-for="doc in mes.docs" 
                :key="doc.id" 
                :href="`/api/documentos/archivo/${doc.filename}`" 
                target="_blank" 
                class="tarjeta-estandar tarjeta-documento"
                title="Clic para ver documento"
              >
                <div class="tarjeta-imagen-container documento-imagen">
                  <img v-if="doc.filename.match(/\.(jpg|jpeg|png|webp)$/i)" :src="`/api/documentos/archivo/${doc.filename}`" :alt="doc.titulo" loading="lazy">
                  <img v-else :src="`/api/documentos/thumbnail/${doc.filename}`" alt="Vista previa" loading="lazy">
                </div>
                <div class="tarjeta-titulo">{{ doc.titulo }}</div>
              </a>
            </div>
          </div>
        </div>
      </div>

      <section class="documentos-nota">
        <p><strong>Nota:</strong> Los documentos se encuentran en formato PDF. Para visualizarlos correctamente, asegúrese de tener instalado un lector de PDF en su dispositivo.</p>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import api from '@/api/clienteApi';

const docs = ref([]);
const cargando = ref(true);
const error = ref(null);

const nombresMeses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const años = computed(() => {
  const grupos = {};
  docs.value.forEach(doc => {
    const [año, mes] = doc.mes.split('-');
    if (!grupos[año]) grupos[año] = {};
    if (!grupos[año][mes]) grupos[año][mes] = [];
    grupos[año][mes].push(doc);
  });

  return Object.keys(grupos).sort((a, b) => b - a).map(año => ({
    año,
    meses: Object.keys(grupos[año]).sort((a, b) => b - a).map(mes => ({
      mes,
      docs: grupos[año][mes]
    }))
  }));
});

function formatearMes(mes) {
  return nombresMeses[parseInt(mes) - 1];
}

onMounted(async () => {
  try {
    docs.value = await api.obtener('/api/documentos');
  } catch (e) {
    error.value = 'Error al cargar los documentos.';
    console.error(e);
  } finally {
    cargando.value = false;
  }
});
</script>

<style scoped>
.documentos-page {
    padding-top: 100px; /* Espacio para navbar fija */
    flex: 1;
    display: flex;
    flex-direction: column;
}

.documentos-main {
    flex: 1;
    padding-top: 0;
}

.documentos-intro {
    text-align: center;
    margin-bottom: 3rem;
    margin-top: 0;
    padding: 2rem;
    background: linear-gradient(135deg, #003b88 0%, #0056b3 100%);
    color: white;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 59, 136, 0.2);
}

.documentos-intro h2 {
    font-size: 2rem;
    margin-bottom: 1rem;
    font-weight: 700;
    color: white;
    border-bottom: none; /* Reset main h2 */
}

.documentos-intro p {
    font-size: 1.1rem;
    line-height: 1.6;
    max-width: 800px;
    margin: 0 auto;
    opacity: 0.95;
}

.documentos-container {
    display: flex;
    flex-direction: column;
    gap: 3rem;
}

.year-header {
    font-size: 2rem;
    color: #003b88;
    margin-bottom: 2rem;
    padding-bottom: 0.75rem;
    border-bottom: 3px solid #003b88;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.month-section {
    margin-bottom: 2rem;
}

.month-header {
    font-size: 1.3rem;
    color: #555;
    margin-bottom: 1.5rem;
    padding-left: 1rem;
    border-left: 4px solid #003b88;
}

.documentos-grid {
    margin-top: 1rem;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
}

/* Estilos específicos para tarjeta de documento */
.tarjeta-documento {
    text-decoration: none; /* Quitar subrayado de enlace */
    color: inherit;
    display: flex;
    flex-direction: column;
    height: 100%;
    cursor: pointer;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.tarjeta-documento:hover {
    transform: translateY(-8px);
    box-shadow: 0 15px 30px rgba(0, 59, 136, 0.2);
}

.tarjeta-cuerpo {
    flex-grow: 0;
    margin-bottom: 0;
}

.badge-tipo {
    display: inline-block;
    background-color: #f0f0f0;
    color: #666;
    padding: 0.25rem 0.75rem;
    border-radius: 4px;
    font-size: 0.8rem;
    font-weight: 600;
}

/* Imagen en formato vertical (A4 aprox) */
.documento-imagen {
    aspect-ratio: 210/297; /* Proporción A4 */
    min-height: 400px;
    height: auto;
    background-color: #e9ecef;
    position: relative;
    overflow: hidden;
}

.documento-imagen img {
    width: 100%;
    height: 100%;
    object-fit: cover; /* Cambiar a cover para que llene todo el rectángulo */
    object-position: top center; /* Mostrar la parte superior de la página */
    transition: transform 0.5s ease;
}

.tarjeta-documento:hover .documento-imagen img {
    transform: scale(1.05);
}

.tarjeta-titulo {
    font-size: 1.1rem;
    margin: 0.5rem 0;
    line-height: 1.4;
}

.documentos-nota {
    background: #f8f9fa;
    border-left: 4px solid #003b88;
    padding: 1.5rem;
    margin-top: 0;
    border-radius: 6px;
}

.documentos-nota p {
    margin: 0;
    color: #333;
    line-height: 1.6;
}

.documentos-nota strong {
    color: #003b88;
}

.loading-message,
.empty-message,
.error-message {
    text-align: center;
    padding: 4rem 2rem;
    font-size: 1.2rem;
    color: #666;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.error-message {
    color: #d32f2f;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media (max-width: 768px) {
    .documentos-main {
        padding: 1.5rem 1rem;
    }

    .documentos-page {
        padding-top: 60px;
    }

    .documentos-intro h2 {
        font-size: 1.5rem;
    }
    
    .documentos-grid {
        grid-template-columns: 1fr;
    }
    
    .tarjeta-estandar {
        padding: 1rem;
    }
    
    .tarjeta-titulo {
        font-size: 1rem;
    }
}
</style>
