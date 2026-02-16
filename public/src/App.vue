<template>
  <div class="app-container" :class="{ 'loaded': appListo }">
    <BarraNavegacion v-if="mostrarNav" />

    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in" @after-enter="onTransicionCompleta">
        <component :is="Component" />
      </transition>
    </router-view>

    <PiePagina v-if="mostrarNav" />
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import BarraNavegacion from '@/componentes/BarraNavegacion.vue';
import PiePagina from '@/componentes/PiePagina.vue';

const route = useRoute();
const appListo = ref(false);

const mostrarNav = computed(() => {
  return !route.meta.ocultarNav;
});

// Se dispara cuando la transición de entrada termina completamente (opacity: 1)
const onTransicionCompleta = () => {
  appListo.value = true;
};

// Al cambiar de ruta, ocultar las imágenes hasta que la nueva vista termine de entrar
watch(() => route.path, () => {
  appListo.value = false;
});
</script>

<style>
/* ===== VARIABLES ===== */
:root {
    --color-primario: white;
    --color-secundario: yellow;
    --color-texto-contraste: #ffffff;
    --color-texto-body: black;
    --color-fondo: #003b88;
    --color-menu-movil: rgba(0, 0, 0, 0.9);
}

/* ===== RESET BÁSICO ===== */
*,
*::before,
*::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

/* ===== TIPOGRAFÍA ===== */
html {
    scroll-behavior: smooth;
}

body {
    font-family: Arial, sans-serif;
    line-height: 1.6;
    color: var(--color-texto-body);
    background-color: #ffffff;
}

/* ===== HERO SECTION (USADO EN INICIO) ===== */
.hero-full {
    background: var(--color-fondo);
    color: var(--color-texto-contraste);
    min-height: 100vh;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.hero-full .vista {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    object-fit: cover;
    z-index: 1;
}

.hero-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 2;
}

.hero-content {
    position: absolute;
    top: 26%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 3;
    max-width: 90rem;   
    width: 90%;
    padding: 1.5rem;
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 15px;
    backdrop-filter: blur(8px);
    text-align: center;
    border: 1px solid rgba(255, 255, 255, 0.2);
}

.hero-content h2 {
    color: var(--color-secundario);
    font-size: clamp(1.5rem, 5vw, 2.5rem);
    margin-bottom: 0.5rem;
    border-bottom: none;
    padding-bottom: 0;
}

.hero-content p {
    font-size: clamp(1rem, 2.5vw, 1.25rem);
    line-height: 1.8;
    color: white;
}

/* ===== MAIN ===== */
main {
    max-width: 1200px;
    margin: 0 auto;
    padding: 3rem 3rem 0 3rem;
    position: relative;
    flex: 1;
}

main section {
    margin: 1rem 0rem 0rem 0rem;
    padding: 2rem;
    background-color: #f9f9f9;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

main iframe {
    width: 100%;
    height: 400px;
}

main h2 {
    color: var(--color-fondo);
    margin-bottom: 1rem;
    font-size: clamp(1.5rem, 3vw, 2rem);
    border-bottom: 3px solid var(--color-fondo);
    padding-bottom: 0.5rem;
}

/* ===== CLASES DE DISEÑO UNIFORME (TARJETAS Y GRIDS) ===== */
.grid-uniforme {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    margin: 1.5rem 0;
}

.tarjeta-estandar {
    background: white;
    border: 2px solid #e0e0e0;
    border-radius: 12px;
    padding: 1.5rem;
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    height: 100%;
}

.tarjeta-estandar:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 24px rgba(0, 59, 136, 0.15);
    border-color: var(--color-fondo);
}

.tarjeta-imagen-container {
    width: 100%;
    height: 200px;
    background-color: #f0f0f0;
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 1.2rem;
    border: 1px solid #eee;
}

.tarjeta-imagen-container img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}

.tarjeta-titulo {
    font-size: 1.4rem;
    color: var(--color-fondo);
    margin-bottom: 0.75rem;
    font-weight: 700;
}

.tarjeta-meta {
    font-size: 0.9rem;
    color: #666;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.tarjeta-meta::before {
    content: "📅";
}

.tarjeta-cuerpo {
    flex-grow: 1;
    color: #444;
    line-height: 1.6;
}

/* Ajustes específicos para previsualizaciones en el index */
.documento-preview-index {
    width: 100%;
    height: auto;
    background-color: #f0f0f0;
    border-radius: 4px;
    overflow: hidden;
    border: 1px solid #e0e0e0;
}

.documento-preview-index img {
    width: 100%;
    height: auto;
    object-fit: contain;
    display: block;
}

/* Botón CTA */
.btn-cta {
    display: inline-block;
    background: var(--color-fondo);
    color: white;
    padding: 0.85rem 2rem;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 600;
    font-size: 1rem;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(0, 59, 136, 0.2);
}

.btn-cta:hover {
    background: #002a60;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 59, 136, 0.3);
}

/* Estados de carga */
.loading-content,
.no-content,
.error-content {
    text-align: center;
    padding: 2rem;
    color: #666;
    font-style: italic;
}

/* Responsive para previews */
@media (max-width: 768px) {
    .btn-cta {
        width: 100%;
        text-align: center;
    }
}

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
    body {
        background-image: none;
    }

    .hero-content {
        top: 50%;
    }

    .escuela-info {
        padding: 1.5rem;
        width: 95%;
        top: 50%;
    }

    main {
        padding: 2rem 1rem;
    }

    main section {
        padding: 1.5rem;
    }
}

/* ===== ACCESIBILIDAD ===== */
.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
    border: 0;
}

@media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-container.loaded {
  background-image: url('@/assets/img/girl.png'), url('@/assets/img/boy.png');
  background-position: left, right;
  background-repeat: no-repeat;
  background-size: 250px auto;
  background-attachment: fixed;
}

@media (max-width: 768px) {
    .app-container.loaded {
        background-image: none !important;
    }
}
</style>
