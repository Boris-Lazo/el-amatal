<template>
  <div>
    <header class="hero-full">
      <img
        class="vista"
        src="@/assets/img/fondo-index.jpeg"
        alt="Niños en el evento de la escuela"
        fetchpriority="high"
        loading="eager"
      />
      <div class="hero-overlay"></div>
      <section class="hero-content">
        <h2>BIENVENIDOS</h2>
        <p>
          El Centro Escolar Cantón El Amatal es una
          institución educativa de El Salvador que se encuentra ubicada en la
          comunidad rural del mismo nombre. La escuela fue creada con el
          objetivo de brindar una educación de calidad a los niños y jóvenes de
          la zona.
        </p>
      </section>
    </header>

    <main>
      <div class="secciones-verticales">
        <section>
          <h2>📸 Eventos</h2>
          <p>
            Descubre los momentos más especiales de nuestra comunidad educativa.
          </p>
          <div id="latest-album-container">
            <div v-if="cargandoAlbum" class="loading-content">
              Cargando último evento...
            </div>
            <div v-else-if="ultimoAlbum" class="tarjeta-estandar tarjeta-album-index" @click="verAlbum">
              <div class="album-collage-index">
                <div class="collage-item main">
                  <img
                    :src="`/api/subidas/${ultimoAlbum.id}/${ultimoAlbum.fotos[0]}`"
                    alt="Foto principal"
                    loading="lazy"
                  >
                </div>
                <div v-if="ultimoAlbum.fotos[1]" class="collage-item sub">
                  <img
                    :src="`/api/subidas/${ultimoAlbum.id}/${ultimoAlbum.fotos[1]}`"
                    alt="Foto secundaria"
                    loading="lazy"
                  >
                </div>
                <div v-if="ultimoAlbum.fotos[2]" class="collage-item sub">
                  <img
                    :src="`/api/subidas/${ultimoAlbum.id}/${ultimoAlbum.fotos[2]}`"
                    alt="Foto terciaria"
                    loading="lazy"
                  >
                  <div v-if="ultimoAlbum.fotos.length > 3" class="more-photos-overlay">
                    +{{ ultimoAlbum.fotos.length - 3 }}
                  </div>
                </div>
              </div>
              <div class="tarjeta-header">
                <div class="tarjeta-titulo">{{ ultimoAlbum.titulo }}</div>
                <div class="tarjeta-meta">{{ formatearFecha(ultimoAlbum.fecha) }}</div>
              </div>
              <div class="tarjeta-cuerpo">
                <p v-if="ultimoAlbum.descripcion">{{ ultimoAlbum.descripcion }}</p>
                <p v-else>Galería de fotos del evento {{ ultimoAlbum.titulo }}.</p>
              </div>
            </div>
            <div v-else class="empty-content">No hay eventos recientes.</div>
            <router-link v-if="ultimoAlbum" to="/eventos" class="link-ver-todos"
              >Ver todos los eventos →</router-link
            >
          </div>
        </section>

        <section>
          <h2>📄 Documentos</h2>
          <p>
            Accede a los documentos de rendición de cuentas de nuestra institución.
          </p>
          <div id="latest-doc-container">
            <div v-if="cargandoDoc" class="loading-content">
              Cargando últimos documentos...
            </div>
            <a 
              v-else-if="ultimosDocs.length > 0" 
              v-for="(doc, index) in ultimosDocs"
              :key="doc.id"
              :href="`/api/documentos/archivo/${doc.filename}`" 
              target="_blank"
              class="tarjeta-estandar tarjeta-documento-index"
              :class="{ 'oculto-movil': index > 0 }"
              title="Clic para ver documento"
            >
              <div class="tarjeta-imagen-container documento-imagen-index">
                <img
                  :src="`/api/documentos/thumbnail/${doc.filename}`"
                  alt="Vista previa"
                />
              </div>
              <div class="tarjeta-header">
                <div class="tarjeta-titulo">{{ doc.titulo }}</div>
                <div class="tarjeta-meta">{{ formatearMesDoc(doc.mes) }}</div>
              </div>
            </a>
            <div v-else class="empty-content">No hay documentos recientes.</div>
            <router-link v-if="ultimosDocs.length > 0" to="/documentos" class="link-ver-todos"
              >Ver todos los documentos →</router-link
            >
          </div>
        </section>
      </div>

      <section id="ubicacion">
        <h2>📍 Ubicación</h2>
        <p>Visítanos en nuestra sede institucional en el Cantón El Amatal.</p>
        <div class="map-container">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1668.6272057614071!2d-89.8954317614071!3d13.651859335790586!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8f62af0024634021%3A0xde9494161729e7ab!2sCENTRO%20ESCOLAR%20%22CANT%C3%93N%20EL%20AMATAL%22.%2010560!5e0!3m2!1ses-419!2ssv!4v1764794971231!5m2!1ses-419!2ssv"
              style="border: 0"
              allowfullscreen=""
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
            ></iframe>
        </div>
      </section>
    </main>

    <VisorImagenes ref="visor" :album="albumSeleccionado" @close="albumSeleccionado = null" />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import api from "@/api/clienteApi";
import VisorImagenes from '@/componentes/VisorImagenes.vue';

const router = useRouter();
const ultimoAlbum = ref(null);
const ultimosDocs = ref([]);
const cargandoAlbum = ref(true);
const cargandoDoc = ref(true);
const albumSeleccionado = ref(null);

function formatearFecha(fechaStr) {
  return new Date(fechaStr).toLocaleDateString("es-SV", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatearMesDoc(mesStr) {
  const [año, mes] = mesStr.split("-");
  const meses = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];
  return `${meses[parseInt(mes) - 1]} ${año}`;
}

function verAlbum() {
  if (ultimoAlbum.value) {
    albumSeleccionado.value = ultimoAlbum.value;
  }
}

onMounted(async () => {
  try {
    const albums = await api.obtener("/api/albumes?limite=1");
    if (albums.length > 0) ultimoAlbum.value = albums[0];
  } catch (e) {
    console.error(e);
  }
  cargandoAlbum.value = false;

  try {
    const docs = await api.obtener("/api/documentos?limite=3");
    if (docs.length > 0) ultimosDocs.value = docs;
  } catch (e) {
    console.error(e);
  }
  cargandoDoc.value = false;
});
</script>

<style scoped>
.secciones-verticales {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    margin: 1.5rem 0;
}

.secciones-verticales section {
    margin: 0; /* Anular márgenes externos para controlarlos con el gap del contenedor */
}

.secciones-verticales .tarjeta-estandar {
    padding: 1rem;
}

/* Estilo específico para álbum en index */
.tarjeta-album-index {
    cursor: pointer;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.tarjeta-album-index:hover {
    transform: translateY(-8px);
    box-shadow: 0 15px 30px rgba(0, 59, 136, 0.2);
}

.album-collage-index {
    display: grid;
    grid-template-columns: 2fr 1fr;
    grid-template-rows: 1fr 1fr;
    gap: 2px;
    background: #eee;
    height: 500px;
}

.album-collage-index .collage-item { 
    position: relative; 
    overflow: hidden; 
}

.album-collage-index .collage-item.main { 
    grid-column: 1; 
    grid-row: 1 / span 2; 
}

.album-collage-index .collage-item.sub { 
    grid-column: 2; 
}

.album-collage-index .collage-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.4s ease;
}

.tarjeta-album-index:hover .collage-item img { 
    transform: scale(1.05); 
}

.tarjeta-album-index .tarjeta-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
    margin-top: 0.5rem;
    margin-bottom: 0.4rem;
}

.tarjeta-album-index .tarjeta-titulo {
    font-size: 1.1rem;
    margin: 0;
    flex: 1;
}

.tarjeta-album-index .tarjeta-meta {
    margin: 0;
    white-space: nowrap;
    font-size: 0.85rem;
}

.tarjeta-album-index .tarjeta-cuerpo {
    margin-bottom: 0.5rem;
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

.link-ver-todos {
    display: inline-block;
    color: #003b88;
    text-decoration: none;
    font-weight: 600;
    font-size: 1rem;
    padding: 0.75rem 1.5rem;
    border: 2px solid #003b88;
    border-radius: 8px;
    transition: all 0.3s ease;
    margin-top: 1rem;
}

.link-ver-todos:hover {
    background-color: #003b88;
    color: white;
    transform: translateY(-2px);
}

/* Estilo específico para tarjeta de documento en index */
#latest-doc-container {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
    width: 100%;
}

.tarjeta-documento-index {
    text-decoration: none;
    color: inherit;
    display: flex;
    flex-direction: column;
    width: 100%;
    cursor: pointer;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    height: 100%; /* Asegurar altura completa en grid */
}

.tarjeta-documento-index:hover {
    transform: translateY(-8px);
    box-shadow: 0 15px 30px rgba(0, 59, 136, 0.2);
}

.documento-imagen-index {
    aspect-ratio: 210/297; /* Proporción A4 */
    /* max-height removido para que ocupe el espacio disponible */
    min-height: 400px;
    background-color: #e9ecef;
    position: relative;
    overflow: hidden;
}

.documento-imagen-index img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: top center;
    transition: transform 0.5s ease;
}

.tarjeta-documento-index:hover .documento-imagen-index img {
    transform: scale(1.05);
}

.tarjeta-documento-index .tarjeta-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
    margin-top: 0.5rem;
    margin-bottom: 0.4rem;
}

.tarjeta-documento-index .tarjeta-titulo {
    font-size: 1.05rem;
    margin: 0;
    flex: 1;
}

.tarjeta-documento-index .tarjeta-meta {
    margin: 0;
    white-space: nowrap;
    font-size: 0.85rem;
}

.tarjeta-documento-index .tarjeta-cuerpo {
    display: none; /* Asegurar que no se muestre si quedara algún residuo */
}

/* El enlace debe ocupar todo el ancho en la parte inferior */
.link-ver-todos {
    grid-column: 1 / -1;
    justify-self: center;
    display: inline-block;
    color: #003b88;
    text-decoration: none;
    font-weight: 600;
    font-size: 1rem;
    padding: 0.75rem 1.5rem;
    border: 2px solid #003b88;
    border-radius: 8px;
    transition: all 0.3s ease;
    margin-top: 1rem;
}

.link-ver-todos {
    display: inline-block;
    color: #003b88;
    text-decoration: none;
    font-weight: 600;
    font-size: 1rem;
    padding: 0.75rem 1.5rem;
    border: 2px solid #003b88;
    border-radius: 8px;
    transition: all 0.3s ease;
    margin-top: 1rem;
}

.link-ver-todos:hover {
    background-color: #003b88;
    color: white;
    transform: translateY(-2px);
}

#ubicacion {
    margin: 3rem 0;
    padding: 2rem;
    background-color: #f9f9f9;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.map-container {
    position: relative;
    width: 100%;
    height: 0;
    padding-bottom: 50%; /* Aspect ratio */
    overflow: hidden;
    border-radius: 8px;
    border: 1px solid #ddd;
}

.map-container iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

@media (max-width: 768px) {
    .map-container {
        padding-bottom: 75%;
    }
    
    .tarjeta-documento-index {
        max-width: 350px; /* Volver a limitar ancho en móvil */
        margin: 0 auto; /* Centrar */
    }

    #latest-doc-container {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .oculto-movil {
        display: none;
    }
    
    .tarjeta-album-index {
        max-width: 100%;
    }
    
    .album-collage-index {
        height: auto;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: 250px 120px;
    }
    
    .album-collage-index .collage-item.main { 
        grid-column: 1 / -1; 
        grid-row: 1; 
    }
    
    .album-collage-index .collage-item.sub { 
        grid-row: 2; 
        grid-column: auto; 
    }
}
</style>
