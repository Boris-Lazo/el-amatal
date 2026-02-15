#!/bin/bash

# Script para iniciar el proyecto El Amatal (Backend + Frontend)

# Colores para mejor UX (opcional, funciona en la mayoría de terminales)
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Función para verificar errores
check_error() {
  if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error: $1${NC}"
    exit 1
  fi
}

# Función para generar JWT_SECRET aleatorio y seguro
generate_jwt_secret() {
  # Intentar usar openssl primero (más seguro)
  if command -v openssl &> /dev/null; then
    openssl rand -base64 32 | tr -d '\n'
  else
    # Fallback a /dev/urandom
    head -c 32 /dev/urandom | base64 | tr -d '\n'
  fi
}

# Función para validar puerto
validate_port() {
  local port=$1
  if ! [[ "$port" =~ ^[0-9]+$ ]] || [ "$port" -lt 1 ] || [ "$port" -gt 65535 ]; then
    return 1
  fi
  return 0
}

# Función para validar email básico
validate_email() {
  local email=$1
  if [[ "$email" =~ ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]; then
    return 0
  fi
  return 1
}

# Función del asistente interactivo para crear .env
create_env_file() {
  echo ""
  echo -e "${CYAN}========================================${NC}"
  echo -e "${CYAN}   Configuración Inicial - El Amatal${NC}"
  echo -e "${CYAN}========================================${NC}"
  echo ""
  echo -e "${YELLOW}⚠️  No se encontró el archivo .env${NC}"
  echo "Este archivo contiene configuraciones importantes para el servidor."
  echo ""
  echo "Vamos a crear uno juntos. Presiona ${GREEN}Enter${NC} para usar el valor por defecto ${BLUE}[entre corchetes]${NC}."
  echo "Puedes cancelar en cualquier momento con Ctrl+C."
  echo ""
  
  # Variables a configurar
  local port
  local jwt_secret
  local user_directora_pass
  local user_subdirectora_pass
  local user_dev_pass
  local user_directora_email
  local user_subdirectora_email
  local user_dev_email
  local smtp_host
  local smtp_port
  local smtp_user
  local smtp_pass
  local smtp_from
  
  # 1. Puerto del servidor
  while true; do
    read -p "$(echo -e ${CYAN}Puerto del servidor ${BLUE}[4000]${NC}: )" port
    port=${port:-4000}
    if validate_port "$port"; then
      break
    else
      echo -e "${RED}❌ Puerto inválido. Debe ser un número entre 1 y 65535.${NC}"
    fi
  done
  
  # 2. JWT Secret (generado automáticamente)
  echo ""
  echo -e "${GREEN}🔐 Generando secreto JWT seguro...${NC}"
  jwt_secret=$(generate_jwt_secret)
  echo -e "   Secreto generado: ${BLUE}${jwt_secret:0:20}...${NC} (${#jwt_secret} caracteres)"
  read -p "$(echo -e ${CYAN}¿Deseas usar este secreto? ${BLUE}[s/n, default: s]${NC}: )" use_generated
  use_generated=${use_generated:-s}
  if [[ ! "$use_generated" =~ ^[sS]$ ]]; then
    read -p "$(echo -e ${CYAN}Ingresa tu propio JWT_SECRET${NC}: )" jwt_secret
    while [ -z "$jwt_secret" ]; do
      echo -e "${RED}❌ El JWT_SECRET no puede estar vacío.${NC}"
      read -p "$(echo -e ${CYAN}Ingresa tu propio JWT_SECRET${NC}: )" jwt_secret
    done
  fi
  
  # 3. Contraseñas de usuarios
  echo ""
  echo -e "${YELLOW}👥 Configuración de contraseñas de usuarios${NC}"
  echo "   (La entrada estará oculta por seguridad)"
  
  # Directora
  while true; do
    read -s -p "$(echo -e ${CYAN}Contraseña para DIRECTORA${NC}: )" user_directora_pass
    echo ""
    if [ -z "$user_directora_pass" ]; then
      echo -e "${RED}❌ La contraseña no puede estar vacía.${NC}"
      continue
    fi
    read -s -p "$(echo -e ${CYAN}Confirma la contraseña${NC}: )" confirm_pass
    echo ""
    if [ "$user_directora_pass" = "$confirm_pass" ]; then
      break
    else
      echo -e "${RED}❌ Las contraseñas no coinciden. Intenta de nuevo.${NC}"
    fi
  done
  
  # Subdirectora
  while true; do
    read -s -p "$(echo -e ${CYAN}Contraseña para SUBDIRECTORA${NC}: )" user_subdirectora_pass
    echo ""
    if [ -z "$user_subdirectora_pass" ]; then
      echo -e "${RED}❌ La contraseña no puede estar vacía.${NC}"
      continue
    fi
    read -s -p "$(echo -e ${CYAN}Confirma la contraseña${NC}: )" confirm_pass
    echo ""
    if [ "$user_subdirectora_pass" = "$confirm_pass" ]; then
      break
    else
      echo -e "${RED}❌ Las contraseñas no coinciden. Intenta de nuevo.${NC}"
    fi
  done
  
  # Desarrollador
  while true; do
    read -s -p "$(echo -e ${CYAN}Contraseña para DESARROLLADOR${NC}: )" user_dev_pass
    echo ""
    if [ -z "$user_dev_pass" ]; then
      echo -e "${RED}❌ La contraseña no puede estar vacía.${NC}"
      continue
    fi
    read -s -p "$(echo -e ${CYAN}Confirma la contraseña${NC}: )" confirm_pass
    echo ""
    if [ "$user_dev_pass" = "$confirm_pass" ]; then
      break
    else
      echo -e "${RED}❌ Las contraseñas no coinciden. Intenta de nuevo.${NC}"
    fi
  done
  
  # 3a. Correos de usuarios (Opcional, se usan por defecto si se dejan vacíos)
  echo ""
  echo -e "${YELLOW}📧 Configuración de correos de usuarios${NC}"
  
  # Directora Email
  while true; do
    read -p "$(echo -e ${CYAN}Email DIRECTORA${NC}: )" user_directora_email
    if validate_email "$user_directora_email"; then
      break
    else
      echo -e "${RED}❌ Email inválido. Por favor ingrese un correo válido.${NC}"
    fi
  done
  
  # Subdirectora Email
  while true; do
    read -p "$(echo -e ${CYAN}Email SUBDIRECTORA${NC}: )" user_subdirectora_email
    if validate_email "$user_subdirectora_email"; then
      break
    else
      echo -e "${RED}❌ Email inválido. Por favor ingrese un correo válido.${NC}"
    fi
  done

  # Desarrollador Email
  while true; do
    read -p "$(echo -e ${CYAN}Email DESARROLLADOR${NC}: )" user_dev_email
    if validate_email "$user_dev_email"; then
      break
    else
      echo -e "${RED}❌ Email inválido. Por favor ingrese un correo válido.${NC}"
    fi
  done

  # 4. Configuración SMTP
  echo ""
  echo -e "${YELLOW}📧 Configuración del servidor de correo SMTP${NC}"
  echo "   (Puedes usar valores de prueba por ahora y cambiarlos después)"
  
  read -p "$(echo -e ${CYAN}Host SMTP ${BLUE}[smtp.ethereal.email]${NC}: )" smtp_host
  smtp_host=${smtp_host:-smtp.ethereal.email}
  
  while true; do
    read -p "$(echo -e ${CYAN}Puerto SMTP ${BLUE}[587]${NC}: )" smtp_port
    smtp_port=${smtp_port:-587}
    if validate_port "$smtp_port"; then
      break
    else
      echo -e "${RED}❌ Puerto inválido.${NC}"
    fi
  done
  
  read -p "$(echo -e ${CYAN}Usuario SMTP ${BLUE}[usuario_ethereal_aqui]${NC}: )" smtp_user
  smtp_user=${smtp_user:-usuario_ethereal_aqui}
  
  read -s -p "$(echo -e ${CYAN}Contraseña SMTP ${BLUE}[contraseña_ethereal_aqui]${NC}: )" smtp_pass
  echo ""
  smtp_pass=${smtp_pass:-contraseña_ethereal_aqui}
  
  read -p "$(echo -e ${CYAN}Email remitente ${BLUE}[Centro Escolar <noreply@amatal.edu.sv>]${NC}: )" smtp_from
  smtp_from=${smtp_from:-"Centro Escolar <noreply@amatal.edu.sv>"}
  
  # Validar email en smtp_from
  if [[ "$smtp_from" =~ \<([^>]+)\> ]]; then
    email_part="${BASH_REMATCH[1]}"
    if ! validate_email "$email_part"; then
      echo -e "${YELLOW}⚠️  Advertencia: El formato del email podría no ser válido.${NC}"
    fi
  fi
  
  # Mostrar resumen
  echo ""
  echo -e "${CYAN}========================================${NC}"
  echo -e "${CYAN}      Resumen de Configuración${NC}"
  echo -e "${CYAN}========================================${NC}"
  echo -e "Puerto del servidor:    ${GREEN}$port${NC}"
  echo -e "JWT Secret:             ${GREEN}${jwt_secret:0:20}...${NC} (${#jwt_secret} caracteres)"
  echo -e "Contraseña Directora:   ${GREEN}********${NC}"
  echo -e "Contraseña Subdirectora: ${GREEN}********${NC}"
  echo -e "Contraseña Desarrollador: ${GREEN}********${NC}"
  echo -e "Email Directora:        ${GREEN}$user_directora_email${NC}"
  echo -e "Email Subdirectora:     ${GREEN}$user_subdirectora_email${NC}"
  echo -e "Email Desarrollador:    ${GREEN}$user_dev_email${NC}"
  echo -e "SMTP Host:              ${GREEN}$smtp_host${NC}"
  echo -e "SMTP Port:              ${GREEN}$smtp_port${NC}"
  echo -e "SMTP User:              ${GREEN}$smtp_user${NC}"
  echo -e "SMTP Pass:              ${GREEN}********${NC}"
  echo -e "SMTP From:              ${GREEN}$smtp_from${NC}"
  echo -e "${CYAN}========================================${NC}"
  echo ""
  
  # Confirmar
  read -p "$(echo -e ${YELLOW}¿Confirmas esta configuración? ${BLUE}[s/n]${NC}: )" confirm
  if [[ ! "$confirm" =~ ^[sS]$ ]]; then
    echo -e "${RED}❌ Configuración cancelada. Ejecuta el script nuevamente cuando estés listo.${NC}"
    exit 1
  fi
  
  # Crear el archivo .env
  echo ""
  echo -e "${GREEN}📝 Creando archivo .env...${NC}"
  
  cat > .env << EOF
# Variables de entorno para el servidor
# ¡IMPORTANTE! NO compartas este archivo ni lo subas a repositorios públicos.

# Secreto para firmar los JSON Web Tokens. Usa un generador de contraseñas largo y aleatorio.
JWT_SECRET=$jwt_secret

# Contraseñas para los usuarios por defecto.
# Puedes cambiarlas por las que prefieras.
USER_DIRECTORA_PASS="$user_directora_pass"
USER_SUBDIRECTORA_PASS="$user_subdirectora_pass"
USER_DEV_PASS="$user_dev_pass"

# Correos electrónicos de los usuarios por defecto
USER_DIRECTORA_EMAIL="$user_directora_email"
USER_SUBDIRECTORA_EMAIL="$user_subdirectora_email"
USER_DEV_EMAIL="$user_dev_email"

# Configuración del servidor de correo (ejemplo para Ethereal, un servicio de prueba)
# En producción, deberás usar un servicio real como SendGrid, Mailgun, o tu propio SMTP.
SMTP_HOST=$smtp_host
SMTP_PORT=$smtp_port
SMTP_USER=$smtp_user
SMTP_PASS=$smtp_pass
SMTP_FROM="$smtp_from"

# Puerto en el que correrá el servidor
PORT=$port
EOF
  
  check_error "No se pudo crear el archivo .env"
  
  # Verificar que .env esté en .gitignore
  if [ -f ".gitignore" ]; then
    if ! grep -q "^\.env$" .gitignore; then
      echo -e "${YELLOW}⚠️  Agregando .env a .gitignore para mayor seguridad...${NC}"
      echo ".env" >> .gitignore
    fi
  fi
  
  echo -e "${GREEN}✅ Archivo .env creado exitosamente!${NC}"
  echo ""
}

# Banner de inicio
echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}   Iniciando Proyecto El Amatal${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""

# 0. Verificar si existe .env, si no, ejecutar asistente
if [ ! -f ".env" ]; then
  create_env_file
fi

# 1. Verificar e instalar dependencias raíz (donde está Vue y concurrently)
if [ ! -d "node_modules" ]; then
  echo -e "${BLUE}📦 Instalando dependencias del Frontend/Raíz...${NC}"
  npm install
  check_error "Falló la instalación de dependencias raíz."
fi

# 2. Verificar e instalar dependencias del Backend (carpeta private)
if [ ! -d "private/node_modules" ]; then
  echo -e "${BLUE}📦 Instalando dependencias del Backend...${NC}"
  cd private
  npm install
  check_error "Falló la instalación de dependencias del backend."
  cd ..
fi

# 3. Iniciar los servicios
echo ""
echo -e "${GREEN}🚀 Levantando servidores...${NC}"
echo -e "   ${CYAN}Backend:${NC}  http://localhost:$(grep '^PORT=' .env | cut -d'=' -f2)"
echo -e "   ${CYAN}Frontend:${NC} http://localhost:5173"
echo -e "${CYAN}========================================${NC}"
echo ""

npm run dev:all
