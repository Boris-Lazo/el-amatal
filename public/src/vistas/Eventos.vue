<template>
  <div class="eventos-page">
    <main class="eventos-main">
      <section class="eventos-intro">
        <h2>Galería de Eventos</h2>
        <p>Revive los momentos más especiales de nuestra comunidad educativa a través de nuestras galerías fotográficas.</p>
      </section>

      <div v-if="cargando" class="loading-message">Cargando eventos...</div>
      <div v-else-if="error" class="error-message">{{ error }}</div>
      <div v-else-if="albums.length === 0" class="empty-message">No hay eventos publicados aún.</div>

      <div v-else id="albums-container" class="grid-uniforme">
        <div v-for="album in albums" :key="album.id" class="tarjeta-estandar tarjeta-album" @click="abrirVisor(album)">
          <div class="album-collage">
            <div class="collage-item main">
              <img :src="`/api/subidas/${album.id}/${album.fotos[0]}`" alt="Foto principal" loading="lazy">
            </div>
            <div v-if="album.fotos[1]" class="collage-item sub">
              <img :src="`/api/subidas/${album.id}/${album.fotos[1]}`" alt="Foto secundaria" loading="lazy">
            </div>
            <div v-if="album.fotos[2]" class="collage-item sub">
              <img :src="`/api/subidas/${album.id}/${album.fotos[2]}`" alt="Foto terciaria" loading="lazy">
              <div v-if="album.fotos.length > 3" class="more-photos-overlay">
                +{{ album.fotos.length - 3 }}
              </div>
            </div>
          </div>
          <div class="tarjeta-header">
            <div class="tarjeta-titulo">{{ album.titulo }}</div>
            <div class="tarjeta-meta">{{ formatearFecha(album.fecha) }}</div>
          </div>
          <div class="tarjeta-cuerpo">
            <p v-if="album.descripcion" class="album-description">{{ album.descripcion }}</p>
            <p v-else>Galería de fotos del evento {{ album.titulo }}.</p>
          </div>
        </div>
      </div>
    </main>

    <VisorImagenes ref="visor" :album="albumSeleccionado" @close="albumSeleccionado = null" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '@/api/clienteApi';
import VisorImagenes from '@/componentes/VisorImagenes.vue';

const albums = ref([]);
const cargando = ref(true);
const error = ref(null);
const visor = ref(null);
const albumSeleccionado = ref(null);

function formatearFecha(fechaStr) {
  return new Date(fechaStr).toLocaleDateString('es-SV', { year: 'numeric', month: 'long', day: 'numeric' });
}

function abrirVisor(album) {
  albumSeleccionado.value = album;
  // El visor se abrirá automáticamente por el watch en su interior al cambiar albumSeleccionado
}

onMounted(async () => {
  try {
    albums.value = await api.obtener('/api/albumes');
  } catch (e) {
    error.value = 'Error al cargar los eventos.';
    console.error(e);
  } finally {
    cargando.value = false;
  }
});
</script>

<style scoped>
.eventos-page {
    padding-top: 100px;
    flex: 1;
    display: flex;
    flex-direction: column;
}

.eventos-main {
    /* Estilos base heredados de App.vue main */
    padding-top: 0;
}

.eventos-intro {
    text-align: center;
    margin-bottom: 3rem;
    padding: 2rem;
    background: linear-gradient(135deg, #003b88 0%, #0056b3 100%);
    color: white;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 59, 136, 0.2);
}

.eventos-intro h2 {
    color: white;
    margin-bottom: 1rem;
    font-size: clamp(1.8rem, 4vw, 2.5rem);
    border-bottom: none; /* Reset main h2 */
}

.eventos-intro p {
    font-size: clamp(1rem, 2vw, 1.2rem);
    opacity: 0.95;
    max-width: 800px;
    margin: 0 auto;
}

#albums-container {
    margin-bottom: 3rem;
}

.tarjeta-album {
    cursor: pointer;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.tarjeta-album:hover {
    transform: translateY(-8px);
    box-shadow: 0 15px 30px rgba(0, 59, 136, 0.2);
}

.tarjeta-album .tarjeta-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
    margin-top: 1rem;
    margin-bottom: 0.75rem;
}

.tarjeta-album .tarjeta-titulo {
    margin: 0;
    flex: 1;
}

.tarjeta-album .tarjeta-meta {
    margin: 0;
    white-space: nowrap;
    font-size: 0.85rem;
}

.album-collage {
    display: grid;
    grid-template-columns: 2fr 1fr;
    grid-template-rows: 1fr 1fr;
    gap: 2px;
    background: #eee;
    height: 500px;
    cursor: pointer;
}

.collage-item { position: relative; overflow: hidden; }
.collage-item.main { grid-column: 1; grid-row: 1 / span 2; }
.collage-item.sub { grid-column: 2; }

.collage-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.4s ease;
}

.tarjeta-album:hover .collage-item img { 
    transform: scale(1.05); 
}

.more-photos-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.6);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    font-weight: bold;
    backdrop-filter: blur(2px);
}

.album-description {
    color: #555;
    font-size: 0.95rem;
    line-height: 1.6;
    display: -webkit-box;
    line-clamp: 3;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.loading-message, .error-message, .empty-message {
    text-align: center;
    padding: 4rem 2rem;
    font-size: 1.2rem;
    color: #666;
}

@media (max-width: 768px) {
    .eventos-page { padding-top: 60px; }
    #albums-container { grid-template-columns: 1fr; }
    .album-collage {
        height: auto;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: 250px 120px;
    }
    .collage-item.main { grid-column: 1 / -1; grid-row: 1; height: auto; }
    .collage-item.sub { grid-row: 2; grid-column: auto; }
}
</style>
