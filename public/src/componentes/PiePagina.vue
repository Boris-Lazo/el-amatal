<template>
  <footer id="pie-pagina">
    <div class="footer-bottom">
      <p>Todos los derechos reservados &copy;
        <span>{{ currentYear }}</span>
        Centro Escolar "Cantón El Amatal"
      </p>
    </div>
  </footer>
</template>

<script setup>
const currentYear = new Date().getFullYear();
</script>

<style scoped>
footer {
    background-color: var(--color-fondo);
    color: var(--color-texto-contraste);
    padding: 1.5rem 1rem;
}

.footer-bottom {
    text-align: center;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    font-size: 0.9rem;
}
</style>
