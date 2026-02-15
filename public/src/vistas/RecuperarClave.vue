<template>
  <div class="recover-page">
    <header class="hero-full">
      <img class="vista" src="@/assets/img/fondo-index.jpeg" alt="Fondo recuperación">
      <div class="hero-overlay"></div>

      <main class="recover-main">
        <section class="recover-card">
          <h2>Recuperar Contraseña</h2>

          <form v-if="!tokenEnviado" @submit.prevent="solicitarEnlace" class="recover-form">
            <div class="form-group">
                <label for="recover-user">Correo Electrónico</label>
                <input type="email" v-model="correo" class="form-input" placeholder="usuario@ejemplo.com" required autocomplete="email">
            </div>
            <button type="submit" class="btn" :disabled="cargando">Solicitar enlace</button>
            <p v-if="mensaje" :class="tipoMensaje">{{ mensaje }}</p>
          </form>

          <div v-else>
            <p class="success-msg">Correo enviado. Revisa tu bandeja e ingresa el código.</p>
            <form @submit.prevent="cambiarClave" class="recover-form">
              <div class="form-group">
                  <label>Código de verificación</label>
                  <input type="text" v-model="token" class="form-input" placeholder="123456" required>
              </div>
              <div class="form-group">
                  <label>Nueva contraseña</label>
                  <input :type="mostrarClave ? 'text' : 'password'" v-model="nuevaClave" class="form-input" required minlength="6">
              </div>
              <div class="show-password-container">
                <input type="checkbox" v-model="mostrarClave" class="show-password-checkbox">
                <label class="show-password-label">Mostrar contraseña</label>
              </div>
              <button type="submit" class="btn" :disabled="cargando">Establecer contraseña</button>
              <p v-if="mensaje" :class="tipoMensaje">{{ mensaje }}</p>
            </form>
          </div>

          <div class="back-to-login">
            <router-link to="/entrar">← Volver al inicio de sesión</router-link>
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

const router = useRouter();
const correo = ref('');
const tokenEnviado = ref(false);
const token = ref('');
const nuevaClave = ref('');
const cargando = ref(false);
const mensaje = ref('');
const tipoMensaje = ref('');
const mostrarClave = ref(false);

async function solicitarEnlace() {
  cargando.value = true;
  mensaje.value = '';
  try {
    await api.enviar('/api/recuperar', { correo: correo.value });
    tokenEnviado.value = true;
  } catch (e) {
    mensaje.value = e.mensaje || e.message;
    tipoMensaje.value = 'error-msg';
  } finally {
    cargando.value = false;
  }
}

async function cambiarClave() {
  cargando.value = true;
  mensaje.value = '';
  try {
    await api.enviar('/api/recuperar/cambiar', { tokenTemporal: token.value, nuevaClave: nuevaClave.value });
    mensaje.value = 'Contraseña actualizada. Redirigiendo...';
    tipoMensaje.value = 'success-msg';
    setTimeout(() => router.push('/entrar'), 2000);
  } catch (e) {
    mensaje.value = e.mensaje || e.message;
    tipoMensaje.value = 'error-msg';
  } finally {
    cargando.value = false;
  }
}
</script>

<style scoped>
.recover-page {
    position: relative;
}

.recover-main {
    position: static;
    padding: 0;
}

.recover-card {
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
    max-width: 450px;
    text-align: center;
    backdrop-filter: blur(5px);
}

.recover-card h2 {
    margin-bottom: 1.5rem;
    color: #003b88;
    font-size: 1.8rem;
    border-bottom: none;
}

.recover-form {
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    text-align: left;
}

.form-group label {
    font-weight: 600;
    color: #333;
    font-size: 0.95rem;
}

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
    transition: all 0.3s ease;
    width: 100%;
}

.btn:hover {
    background-color: #002a60;
    transform: translateY(-2px);
}

.btn:disabled {
    background-color: #8a9ba8;
    cursor: not-allowed;
}

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
    color: #333; /* Color oscuro para asegurar visibilidad en fondo blanco */
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

.back-to-login {
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid #e0e0e0;
}

.back-to-login a {
    color: #003b88;
    text-decoration: none;
    font-weight: 600;
}

.back-to-login a:hover {
    text-decoration: underline;
}
</style>
