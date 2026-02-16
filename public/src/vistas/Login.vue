<template>
  <div class="login-page">
    <header class="hero-full">
      <img class="vista" src="@/assets/img/fondo-index.jpeg" alt="Fondo login">
      <div class="hero-overlay"></div>

      <main class="login-main">
        <section class="login-card">
          <h2>Iniciar sesión</h2>

          <form id="formulario-entrada" @submit.prevent="manejarEntrada">
            <div class="form-group">
              <label for="usuario">Correo Electrónico</label>
              <input
                type="email"
                id="usuario"
                v-model="correo"
                class="form-input"
                placeholder="usuario@ejemplo.com"
                required
                autocomplete="email"
                autofocus
              >
            </div>

            <div class="form-group">
              <label for="contrasena">Contraseña</label>
              <input
                :type="mostrarClave ? 'text' : 'password'"
                id="contrasena"
                v-model="contrasena"
                class="form-input"
                autocomplete="current-password"
                required
                minlength="6"
              >
            </div>

            <div class="show-password-container">
              <input type="checkbox" id="mostrar-contrasena" v-model="mostrarClave" class="show-password-checkbox">
              <label for="mostrar-contrasena" class="show-password-label">Mostrar contraseña</label>
            </div>

            <button type="submit" id="btn-entrar" class="btn" :disabled="cargando">
              {{ cargando ? 'Iniciando sesión...' : 'Iniciar sesión' }}
            </button>
          </form>

          <div class="forgot-password">
            <router-link to="/recuperar">¿Olvidaste tu contraseña?</router-link>
          </div>
        </section>
      </main>
    </header>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/api/clienteApi';
import { estadoSesion } from '@/utilidades/sesion';

const router = useRouter();
const correo = ref('');
const contrasena = ref('');
const mostrarClave = ref(false);
const cargando = ref(false);

async function manejarEntrada() {
  if (!correo.value || !contrasena.value) return;

  cargando.value = true;
  try {
    const data = await api.enviar('/api/entrar', { usuario: correo.value, contrasena: contrasena.value });
    localStorage.setItem('token', data.token);
    localStorage.setItem('usuario', correo.value);
    estadoSesion.actualizar();
    router.push('/admin');
  } catch (err) {
    alert(err.mensaje || err.message || 'Error al iniciar sesión');
  } finally {
    cargando.value = false;
  }
}
</script>

<style scoped>
.login-page {
  position: relative;
}

.login-main {
    position: static;
    padding: 0;
}

.login-card {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 10;
    background-color: rgba(255, 255, 255, 0.95);
    padding: 2.5rem;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    width: 90%;
    max-width: 400px;
    text-align: center;
    backdrop-filter: blur(5px);
}

.login-card h2 {
    margin-bottom: 1.5rem;
    color: #003b88;
    font-size: 1.8rem;
    border-bottom: none;
}

.login-card form {
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
}

.login-card label {
    text-align: left;
    font-weight: 600;
    color: #333;
    font-size: 0.95rem;
}

/* Reusable class for inputs and selects */
.form-input {
    padding: 0.8rem 1rem;
    border: 2px solid #e0e0e0;
    border-radius: 6px;
    font-size: 1rem;
    transition: border-color 0.3s ease;
    width: 100%;
}

.form-input:focus {
    outline: none;
    border-color: #003b88;
}

/* Reusable class for buttons */
.btn {
    margin-top: 1rem;
    padding: 0.9rem;
    background-color: #003b88;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 1.1rem;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.2s;
    width: 100%;
}

.btn:hover {
    background-color: #002a60;
    transform: translateY(-2px);
}

.btn:active {
    transform: translateY(0);
}

.btn:disabled {
    background-color: #8a9ba8;
    cursor: not-allowed;
}

/* Link de recuperación de contraseña */
.forgot-password {
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid #e0e0e0;
}

.forgot-password a {
    color: #003b88;
    text-decoration: none;
    font-size: 0.95rem;
    font-weight: 600;
    transition: color 0.3s ease;
}

.forgot-password a:hover {
    color: #002a60;
    text-decoration: underline;
}

/* Checkbox para mostrar contraseña */
.show-password-container {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: -0.5rem;
}

.show-password-checkbox {
    width: 18px;
    height: 18px;
    cursor: pointer;
}

.show-password-label {
    font-size: 0.9rem;
    font-weight: 400;
    cursor: pointer;
    user-select: none;
}

/* Foco visible */
.form-input:focus,
.btn:focus-visible {
    outline: 3px solid var(--color-secundario);
    outline-offset: 2px;
}
</style>
