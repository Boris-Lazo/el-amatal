<template>
  <nav class="navBar" :class="{ 'scrolled': desplazado || route.path !== '/' }" id="header-top" aria-label="Principal">
    <div class="container-limitado nav-content">
      <div class="escuela-titulo">
        <router-link to="/">
          <h1>CENTRO ESCOLAR "CANTÓN EL AMATAL"</h1>
        </router-link>
      </div>

      <button
        id="menu-toggle"
        class="menu-toggle"
        aria-controls="nav-menu"
        :aria-expanded="menuAbierto"
        @click="menuAbierto = !menuAbierto"
      >
        <span class="sr-only">Abrir menú</span>☰
      </button>

      <ul id="nav-menu" :class="{ 'show': menuAbierto }">
        <li><router-link to="/" @click="menuAbierto = false">INICIO</router-link></li>
        <li><router-link to="/eventos" title="Fotografías de los eventos de la escuela" @click="menuAbierto = false">EVENTOS</router-link></li>
        <li><router-link to="/documentos" title="Documentos de rendición de cuentas" @click="menuAbierto = false">DOCUMENTOS</router-link></li>
        <li v-if="!estaAutenticado"><router-link to="/entrar" title="Entrar" @click="menuAbierto = false">LOGIN</router-link></li>
        <li v-else><router-link to="/admin" @click="menuAbierto = false">ADMIN</router-link></li>
      </ul> 
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { estadoSesion } from '@/utilidades/sesion';

const route = useRoute();
const desplazado = ref(false);
const menuAbierto = ref(false);

const estaAutenticado = computed(() => !!estadoSesion.token);

const manejarDesplazamiento = () => {
  desplazado.value = window.scrollY > 50;
};

const sincronizarSesion = () => {
  estadoSesion.actualizar();
};

onMounted(() => {
  window.addEventListener('scroll', manejarDesplazamiento);
  window.addEventListener('storage', sincronizarSesion);
  manejarDesplazamiento();
});

onUnmounted(() => {
  window.removeEventListener('scroll', manejarDesplazamiento);
  window.removeEventListener('storage', sincronizarSesion);
});
</script>

<style scoped>
.escuela-titulo a {
  text-decoration: none;
  color: inherit;
}

.escuela-titulo a:hover,
.escuela-titulo a:focus {
  background-color: transparent;
  color: inherit;
  outline: none;
}

/* ===== NAVEGACIÓN ===== */
.navBar {
    width: 100%;
    position: fixed;
    z-index: 1000;
    background-color: rgba(0, 0, 0, 0.5);
    transition: background-color 0.3s ease, box-shadow 0.3s ease;
}

.nav-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 0;
    padding-bottom: 0;
    flex-wrap: nowrap;
    min-height: auto;
}

.navBar .container-limitado {
    max-width: none;
    margin: 0 1.5rem;
    width: auto;
}

.navBar.scrolled {
    background-color: var(--color-fondo);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.escuela-titulo h1 {
    font-size: clamp(1.2rem, 2.5vw, 1.8rem);
    color: var(--color-primario);
    margin: 0;
    line-height: 1.2;
}

#nav-menu {
    list-style: none;
    display: flex;
    gap: 0.5rem;
}

nav a {
    color: var(--color-texto-contraste);
    font-weight: bold;
    text-decoration: none;
    font-size: clamp(1rem, 2vw, 1.2rem);
    padding: 0.5rem 0.75rem;
    border-radius: 4px;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
}

nav a:hover,
nav a:focus {
    background-color: rgba(255, 255, 255, 0.2);
    color: var(--color-secundario);
    outline: 2px solid var(--color-secundario);
    outline-offset: 3px;
}

/* ===== BOTÓN HAMBURGUESA ===== */
.menu-toggle {
    display: none;
    background: none;
    border: 2px solid var(--color-texto-contraste);
    color: var(--color-texto-contraste);
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0.3rem 0.6rem;
    border-radius: 4px;
    transition: all 0.3s ease;
}

.menu-toggle:hover,
.menu-toggle:focus-visible {
    background-color: rgba(255, 255, 255, 0.2);
    outline: 2px solid var(--color-secundario);
    outline-offset: 2px;
}

@media (max-width: 768px) {
    .menu-toggle {
        display: block;
        flex-shrink: 0;
    }

    .navBar {
        padding: 0.5rem 1rem;
    }

    .escuela-titulo {
        max-width: 80%;
    }

    .escuela-titulo h1 {
        white-space: normal;
        font-size: 0.9rem;
    }

    #nav-menu {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        flex-direction: column;
        background-color: var(--color-menu-movil);
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.3s ease, background-color 0.3s ease;
        gap: 0;
    }

    #nav-menu.show {
        background-color: var(--color-fondo);
        max-height: 400px;
    }

    #nav-menu li {
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    #nav-menu a {
        display: block;
        padding: 1rem;
    }
}
</style>
