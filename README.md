# 📦 Sistema de Inventario Fab Lab INACAP

Este es un sistema de gestión de inventario profesional diseñado específicamente para el **Fab Lab de INACAP**. La aplicación es una **PWA (Progressive Web App)** de alto rendimiento que permite el control de activos mediante hardware **NFC**, generación de reportes detallados y opciones avanzadas de accesibilidad.

---

## 🚀 Características Principales

*   **🔍 Escaneo NFC**: Integración directa con la Web NFC API para identificar activos rápidamente acercando el celular. Incluye modo de simulación para dispositivos no compatibles.
*   **📱 PWA Ready**: Instalable en dispositivos Android e iOS como una aplicación nativa, con icono institucional de INACAP y funcionamiento offline básico.
*   **🔐 Seguridad por Roles**:
    *   **Administrador**: Acceso total, gestión de activos y descarga de reportes.
    *   **Operador**: Lectura de tags, búsqueda y visualización de estados.
*   **📄 Reportes Profesionales**: Exportación de datos en formatos **Excel (.xlsx)** y **PDF** con branding institucional.
*   **♿ Accesibilidad (A11y)**: Modos configurables de **Alto Contraste** y **Texto Grande**, accesibles incluso desde la pantalla de login.
*   **🎨 Diseño Institutional**: Interfaz moderna (Glassmorphism) basada en la paleta de colores oficial de INACAP (Rojo, Azul, Blanco).

---

## 🛠️ Stack Tecnológico

*   **Core**: HTML5 Semántico, Vanilla JavaScript (ES6+).
*   **Estilos**: CSS3 con Variables (Custom Properties) y diseño responsivo.
*   **Build Tool**: [Vite](https://vitejs.dev/).
*   **Librerías**:
    *   `xlsx`: Para la generación de reportes en Excel.
    *   `jspdf` & `jspdf-autotable`: Para la generación de documentos PDF.
    *   `FontAwesome`: Para la iconografía del sistema.

---

## 🔑 Credenciales de Prueba

Para probar el sistema sin configuración previa, utilice las siguientes credenciales:

*   **Correo**: `admin@inacap.cl`
*   **Contraseña**: `fablab2024`

> **Nota**: El sistema bloquea toda la información sensible hasta que se realice un inicio de sesión exitoso.

---

## 📦 Instalación y Desarrollo Local

1.  **Clonar el repositorio**:
    ```bash
    git clone https://github.com/Macaperalta35/inventariofablab.git
    cd inventariofablab
    ```

2.  **Instalar dependencias**:
    ```bash
    npm install
    ```

3.  **Ejecutar en modo desarrollo**:
    ```bash
    npm run dev
    ```

4.  **Construir para producción**:
    ```bash
    npm run build
    ```

---

## 🌐 Despliegue

El proyecto está configurado para desplegarse automáticamente en **GitHub Pages** mediante GitHub Actions. Cada vez que se realiza un `push` a la rama `main`, el sitio se actualiza en:

👉 **[https://macaperalta35.github.io/inventariofablab/](https://macaperalta35.github.io/inventariofablab/)**

---

## 📱 Configuración de la App en Móvil

Para usar el sistema como una aplicación en tu celular:
1. Abre la URL en Chrome (Android) o Safari (iOS).
2. Selecciona **"Agregar a la pantalla de inicio"**.
3. El sistema se instalará con el logo de INACAP y funcionará como una App independiente.

---

## 👨‍💻 Contribución

Este sistema fue desarrollado por **Macaperalta35** con el apoyo de la asistencia técnica de IA para el Fab Lab INACAP.

---
© 2024 INACAP - Sede Fab Lab. Todos los derechos reservados.
