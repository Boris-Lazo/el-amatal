<template>
  <div v-if="abierto" id="lightbox" class="lightbox active" @click.self="cerrar">
    <button id="lightbox-close" class="lightbox-close" aria-label="Cerrar" @click="cerrar">&times;</button>

    <div class="lightbox-main-area">
      <button
        v-if="album.fotos.length > 1"
        id="lightbox-prev"
        class="lightbox-nav lightbox-prev"
        aria-label="Anterior"
        @click="anterior"
      >&#10094;</button>

      <img id="lightbox-image" class="lightbox-image" :src="urlFotoActual" :alt="album.titulo">

      <button
        v-if="album.fotos.length > 1"
        id="lightbox-next"
        class="lightbox-nav lightbox-next"
        aria-label="Siguiente"
        @click="siguiente"
      >&#10095;</button>

      <div id="lightbox-info" class="lightbox-info">
        <h3>{{ album.titulo }}</h3>
        <p v-if="album.descripcion">{{ album.descripcion }}</p>
      </div>
      <div id="lightbox-counter" class="lightbox-counter">
        {{ indiceActual + 1 }} / {{ album.fotos.length }}
      </div>
    </div>

    <!-- Sidebar de Miniaturas (Escritorio) -->
    <div class="lightbox-sidebar">
      <div
        v-for="(foto, index) in album.fotos"
        :key="index"
        class="lightbox-thumb"
        :class="{ 'active': index === indiceActual }"
        @click="indiceActual = index"
      >
        <img :src="obtenerUrlMiniatura(foto)" alt="Miniatura">
      </div>
    </div>

    <!-- Contenedor Scroll Móvil -->
    <div id="lightbox-mobile-scroll" class="lightbox-mobile-scroll">
      <div class="lightbox-mobile-header">
          <h3>{{ album.titulo }}</h3>
          <p class="desc">{{ album.descripcion }}</p>
      </div>
      <div v-for="(foto, index) in album.fotos" :key="index" class="lightbox-mobile-item">
          <img :src="obtenerUrlMiniatura(foto)" alt="Foto del álbum">
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  album: Object,
  indiceInicial: Number
});

const emit = defineEmits(['close']);

const abierto = ref(false);
const indiceActual = ref(0);

const urlFotoActual = computed(() => {
  if (!props.album) return '';
  return `/api/subidas/${props.album.id}/${props.album.fotos[indiceActual.value]}`;
});

function obtenerUrlMiniatura(nombreArchivo) {
  return `/api/subidas/${props.album.id}/${nombreArchivo}`;
}

function abrir(indice = 0) {
  indiceActual.value = indice;
  abierto.value = true;
  document.body.style.overflow = 'hidden';
}

function cerrar() {
  abierto.value = false;
  document.body.style.overflow = '';
  emit('close');
}

function siguiente() {
  indiceActual.value = (indiceActual.value + 1) % props.album.fotos.length;
}

watch(indiceActual, (nuevoIndice) => {
  if (!props.album) return;
  const proximoIndice = (nuevoIndice + 1) % props.album.fotos.length;
  const img = new Image();
  img.src = `/api/subidas/${props.album.id}/${props.album.fotos[proximoIndice]}`;
});

function anterior() {
  indiceActual.value = (indiceActual.value - 1 + props.album.fotos.length) % props.album.fotos.length;
}

const manejarTecla = (e) => {
  if (!abierto.value) return;
  if (e.key === 'ArrowRight') siguiente();
  if (e.key === 'ArrowLeft') anterior();
  if (e.key === 'Escape') cerrar();
};

watch(() => props.album, (nuevoAlbum) => {
  if (nuevoAlbum) {
    indiceActual.value = props.indiceInicial || 0;
    abierto.value = true;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', manejarTecla);
  } else {
    abierto.value = false;
    document.body.style.overflow = '';
    window.removeEventListener('keydown', manejarTecla);
  }
});

defineExpose({ abrir, cerrar });
</script>

<style scoped>
.lightbox {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.98);
    z-index: 9999;
    flex-direction: row;
    overflow: hidden;
    animation: fadeIn 0.3s ease;
}

.lightbox.active {
    display: flex;
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

.lightbox-main-area {
    flex: 1;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    padding: 20px;
    box-sizing: border-box;
}

.lightbox-image {
    max-width: 100%;
    max-height: 95vh;
    object-fit: contain;
    box-shadow: 0 0 50px rgba(0, 0, 0, 0.8);
    animation: zoomIn 0.3s ease;
}

@keyframes zoomIn {
    from { transform: scale(0.95); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
}

.lightbox-sidebar {
    width: 140px;
    height: 100%;
    background: rgba(20, 20, 20, 0.95);
    border-left: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    flex-direction: column;
    padding: 10px;
    overflow-y: auto;
    gap: 10px;
    margin-right: 60px;
}

.lightbox-sidebar::-webkit-scrollbar { width: 6px; }
.lightbox-sidebar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 3px; }

.lightbox-thumb {
    width: 100%;
    aspect-ratio: 1;
    cursor: pointer;
    border-radius: 4px;
    border: 2px solid transparent;
    opacity: 0.5;
    transition: all 0.2s ease;
    flex-shrink: 0;
}

.lightbox-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 2px;
}

.lightbox-thumb.active {
    opacity: 1;
    border-color: var(--color-secundario);
    transform: scale(0.95);
}

.lightbox-close {
    position: absolute;
    top: 20px;
    right: 20px;
    background: transparent;
    color: white;
    font-size: 2.5rem;
    border: none;
    cursor: pointer;
    z-index: 20;
    line-height: 1;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
    transition: transform 0.2s ease;
}

.lightbox-nav {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(0, 0, 0, 0.3);
    color: white;
    font-size: 3rem;
    width: 60px;
    height: 80px;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    z-index: 10;
}

.lightbox-nav:hover {
    background: rgba(0, 0, 0, 0.6);
    color: var(--color-secundario);
}

.lightbox-prev { left: 0; }
.lightbox-next { right: 0; }

.lightbox-info {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.9), transparent);
    color: white;
    padding: 3rem 1.5rem 1.5rem 1.5rem;
    pointer-events: none;
}

.lightbox-info h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1.5rem;
}

.lightbox-counter {
    position: absolute;
    top: 20px;
    left: 20px;
    background: rgba(0, 0, 0, 0.6);
    color: white;
    padding: 0.4rem 1rem;
    border-radius: 20px;
    font-size: 0.9rem;
    backdrop-filter: blur(4px);
    pointer-events: none;
    z-index: 15;
}

.lightbox-mobile-scroll { display: none; }

@media (max-width: 900px) {
    .lightbox { flex-direction: column; }
    .lightbox-main-area { height: 70%; padding-bottom: 0; }
    .lightbox-sidebar {
        width: 100%; height: 30%; flex-direction: row;
        border-left: none; border-top: 1px solid rgba(255, 255, 255, 0.1);
        overflow-x: auto; overflow-y: hidden; margin-right: 0;
    }
    .lightbox-thumb { height: 100%; width: auto; }
}

@media (max-width: 768px) {
    .lightbox-main-area, .lightbox-sidebar { display: none !important; }
    .lightbox-mobile-scroll {
        display: block; width: 100%; height: 100%;
        overflow-y: auto; padding: 50px 15px 20px 15px;
        box-sizing: border-box;
    }
    .lightbox-mobile-header { color: white; margin-bottom: 2rem; text-align: center; }
    .lightbox-mobile-header h3 { font-size: 1.5rem; color: var(--color-secundario); }
    .lightbox-mobile-item { margin-bottom: 1.5rem; border-radius: 8px; overflow: hidden; }
    .lightbox-mobile-item img { width: 100%; height: auto; display: block; }
    .lightbox-close {
        position: fixed; top: 15px; right: 15px; width: 40px; height: 40px;
        background: rgba(0, 0, 0, 0.5); border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        font-size: 1.8rem; z-index: 9999;
    }
}
</style>
