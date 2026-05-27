# 📦 Sistema de Inventario Fab Lab INACAP

Este es un sistema de gestión de inventario profesional diseñado específicamente para el **Fab Lab de INACAP**. La aplicación es una **PWA (Progressive Web App)** de alto rendimiento que permite el control de activos mediante hardware **NFC**, generación de reportes detallados y opciones avanzadas de accesibilidad.

---

## 🚀 Características Principales

*   **🔍 Escaneo NFC**: Integración directa con la Web NFC API para identificar activos rápidamente acercando el celular. Incluye modo de simulación para dispositivos no compatibles.
*   **📱 PWA Ready**: Instalable en dispositivos Android e iOS como una aplicación nativa, con icono institucional de INACAP y funcionamiento offline básico.
*   **🔐 Seguridad por Roles**:
    *   **Administrador**: Acceso total, gestión de activos y descarga de reportes.
    *   **Operador**: Lectura de tags, búsqueda y visualización de estados.
*   **🤝 Préstamos y Devoluciones**: Sistema integrado para llevar el control de stock prestado y registrar su estado al recibirlo (Bueno, Dañado, Incompleto).
*   **🏢 Propiedad de Activos**: Identificación clara para distinguir entre herramientas propias del Laboratorio y las prestadas por externos.
*   **📄 Reportes Profesionales**: Exportación de datos en formatos **Excel (.xlsx)** y **PDF** con branding institucional.
*   **♿ Accesibilidad (A11y)**: Modos configurables de **Alto Contraste** y **Texto Grande**, accesibles incluso desde la pantalla de login.
*   **🎨 Diseño Institucional**: Interfaz moderna basada en la paleta de colores oficial y logos oficiales de INACAP.

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

## 🔒 Reporte de Pruebas de Calidad (QA) y Seguridad

Se ha llevado a cabo un ciclo completo de auditoría y pruebas automatizadas (QA) sobre el sistema para garantizar la robustez del control de acceso basado en roles (RBAC) y la integridad de la interfaz visual institucional:

### 📋 Pruebas Verificadas con Éxito
1. **Protección contra Credenciales Inválidas**: Intentos con correos o contraseñas incorrectas son detectados y rechazados en la interfaz de Login.
2. **Branding e Interfaz Limpia**: Validación visual del nuevo tema institucional en fondos claros (blanco puro y gris claro) con acentos de color **Rojo INACAP** e iconografía de alto contraste.
3. **Gestión Completa de Usuarios**:
   - Creación exitosa de usuarios operadores (ej. `Pedro QA` -> `pedro@inacap.cl`).
   - Almacenamiento seguro en la memoria local (`localStorage`).
   - Cierre de sesión seguro invalidando los tokens y estados activos.
4. **Validación de Flujos de Préstamo y Devolución**:
   - Comprobación de integridad numérica: No es posible prestar cantidades que excedan el stock `disponible` ni devolver cantidades mayores al stock `prestado`. Inconsistencias numéricas gatillan bloqueo y alerta.
   - Cambio de estado automático: Al registrar una devolución con condición `Dañado` o `Incompleto`, el activo transita automáticamente al estado de `Mantenimiento` (bloqueando préstamos futuros de esa unidad).
   - Registro en Dashboard inmediato.
5. **Auditoría de Build**: Compilación verificada con `Vite build`, garantizando que todos los assets y nuevos flujos JS (`main.js`) no presentan errores de sintaxis y el árbol virtual carga eficientemente en producción.

### 🛡️ Corrección de Vulnerabilidad Crítica Detectada
Durante el proceso de pruebas de calidad (QA), se identificó que el rol de **Operador** tenía acceso de escritura no autorizado sobre el inventario debido a que las columnas de edición y eliminación sobrescribían sus reglas de visibilidad CSS por un estilo `display:flex` embebido directamente en la etiqueta HTML (`style="display:flex"`).

**Acciones Tomadas para Asegurar el Sistema**:
- **Corrección de CSS**: Se trasladó el diseño flex del botón de acciones directamente a la regla condicional del Administrador en `style.css` (`body.role-admin td.admin-only`), permitiendo que el navegador oculte completamente la columna para los operadores.
- **Seguridad en JavaScript (Front-End Hardening)**: Se implementó una verificación de rol estricta en las funciones `window.editAsset` y `window.deleteAsset`. Si un operador intenta gatillar estas funciones de forma manual a través de la consola del navegador, la ejecución es bloqueada inmediatamente.

---

## 👨‍💻 Contribución

Este sistema fue desarrollado por **Macaperalta35** con el apoyo de la asistencia técnica de IA para el Fab Lab INACAP.

---
© 2024 INACAP - Sede Fab Lab. Todos los derechos reservados.
