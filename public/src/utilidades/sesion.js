import { reactive } from 'vue';

export const estadoSesion = reactive({
  token: localStorage.getItem('token'),
  usuario: localStorage.getItem('usuario'),
  actualizar() {
    this.token = localStorage.getItem('token');
    this.usuario = localStorage.getItem('usuario');
  }
});
