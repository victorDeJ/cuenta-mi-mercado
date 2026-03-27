# Cuenta Mi Mercado

Una aplicación móvil desarrollada con Angular y Capacitor para gestionar listas de compras y realizar seguimiento de precios en diferentes monedas. Pensado para las condiciones de Venezuela

## 📋 Descripción del Proyecto

**Cuenta Mi Mercado** es una aplicación móvil híbrida que permite a los usuarios:

- 📝 **Gestionar listas de compras**: Crear y administrar listas de productos para el mercado
- 💱 **Conversión de divisas**: Consultar y utilizar tasas de cambio actualizadas
- 📊 **Historial de compras**: Revisar el historial de listas de compras anteriores
- 🔍 **Detalle de listas**: Ver información detallada de cada lista de compras
- 💾 **Almacenamiento local**: Utiliza RxDB y Dexie para persistencia de datos offline

## 🛠️ Tecnologías Utilizadas

- **Framework**: Angular 21.1.0
- **Mobile Framework**: Capacitor 6.2.1
- **UI Framework**: Bootstrap 5.3.8
- **Base de datos**: RxDB 16.21.1 + Dexie 4.2.1
- **Internacionalización**: ngx-translate 17.0.0
- **Lenguaje**: TypeScript 5.9.2
- **Estilos**: SCSS

## 📱 Características de la App

### Páginas principales:

- **Home**: Página principal de la aplicación
- **Exchange Rate**: Gestión de tasas de cambio
- **Groceries List**: Crear y editar listas de compras
- **Groceries List Historical**: Historial de listas anteriores
- **Groceries List Detail**: Detalle de una lista específica

### Plugins de Capacitor:

- **Status Bar**: Personalización de la barra de estado
- **Splash Screen**: Pantalla de inicio personalizada

## 📋 Requisitos Previos

Antes de compilar la aplicación para Android, asegúrate de tener instalado:

1. **Node.js** (versión 18 o superior)

   - Descarga desde: https://nodejs.org/

2. **npm** (versión 11.7.0 o superior)

   - Se instala automáticamente con Node.js

3. **Android Studio**

   - Descarga desde: https://developer.android.com/studio
   - Instala los siguientes componentes:
     - Android SDK
     - Android SDK Platform
     - Android Virtual Device (para emulador)

4. **Java Development Kit (JDK)** (versión 17 o superior)

   - Descarga desde: https://www.oracle.com/java/technologies/downloads/

5. **Variables de entorno** (Windows):
   ```
   ANDROID_HOME = C:\Users\TuUsuario\AppData\Local\Android\Sdk
   JAVA_HOME = C:\Program Files\Java\jdk-17
   ```
   - Agregar a PATH:
     - `%ANDROID_HOME%\platform-tools`
     - `%ANDROID_HOME%\tools`
     - `%JAVA_HOME%\bin`

## 🚀 Instalación

1. **Clonar el repositorio** (si aún no lo has hecho):

   ```bash
   git clone <url-del-repositorio>
   cd cuenta-mi-mercado-frontend
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

## 📦 Compilación para Android

### Opción 1: Usando el script personalizado (Recomendado)

Este comando realiza todo el proceso automáticamente:

```bash
npm run build-android
```

Este script ejecuta:

1. Compilación de la aplicación Angular
2. Sincronización con Capacitor
3. Apertura de Android Studio

### Opción 2: Paso a paso manual

#### 1. Compilar la aplicación Angular:

```bash
npm run build
```

#### 2. Sincronizar con Capacitor:

```bash
npx cap sync android
```

#### 3. Abrir el proyecto en Android Studio:

```bash
npx cap open android
```

### 📱 Generar APK desde Android Studio

Una vez que Android Studio esté abierto:

1. **Espera** a que Gradle termine de sincronizar el proyecto

2. **Para generar un APK de desarrollo**:

   - Ve a: `Build` → `Build Bundle(s) / APK(s)` → `Build APK(s)`
   - El APK se generará en: `android/app/build/outputs/apk/debug/`

3. **Para generar un APK de producción (firmado)**:
   - Ve a: `Build` → `Generate Signed Bundle / APK`
   - Selecciona `APK`
   - Configura o crea un keystore para firmar la aplicación
   - Selecciona la variante `release`
   - El APK se generará en: `android/app/build/outputs/apk/release/`

### 📲 Instalar en un dispositivo físico

1. **Habilita la depuración USB** en tu dispositivo Android:

   - Ve a `Ajustes` → `Acerca del teléfono`
   - Toca 7 veces en `Número de compilación`
   - Ve a `Ajustes` → `Opciones de desarrollador`
   - Activa `Depuración USB`

2. **Conecta tu dispositivo** al PC mediante USB

3. **Ejecuta desde Android Studio**:
   - Haz clic en el botón `Run` (▶️)
   - Selecciona tu dispositivo de la lista

### 🧪 Probar en emulador

1. **Crear un emulador** (si no tienes uno):

   - En Android Studio: `Tools` → `Device Manager`
   - Haz clic en `Create Device`
   - Selecciona un dispositivo (ej: Pixel 6)
   - Descarga e instala una imagen del sistema (ej: Android 13)

2. **Ejecutar en el emulador**:
   - Inicia el emulador desde Device Manager
   - Haz clic en `Run` (▶️) en Android Studio
   - Selecciona el emulador

## 🔧 Desarrollo

### Ejecutar en modo desarrollo (navegador):

```bash
npm start
```

La aplicación estará disponible en: `http://localhost:4200`

### Ejecutar tests:

```bash
npm test
```

### Compilar para producción:

```bash
npm run build
```

## 📂 Estructura del Proyecto

```
cuenta-mi-mercado-frontend/
├── android/                 # Proyecto nativo de Android (generado por Capacitor)
├── public/                  # Archivos públicos estáticos
├── resources/              # Recursos de la app (iconos, splash screens)
├── src/
│   ├── app/
│   │   ├── core/          # Servicios y funcionalidades core
│   │   ├── pages/         # Páginas de la aplicación
│   │   │   ├── home-page/
│   │   │   ├── exchange-rate-page/
│   │   │   ├── groceries-list-page/
│   │   │   ├── groceries-list-historical-page/
│   │   │   └── groceries-list-detail-page/
│   │   └── theme/         # Estilos y temas
│   ├── index.html
│   ├── main.ts
│   └── styles.scss
├── capacitor.config.ts     # Configuración de Capacitor
├── angular.json            # Configuración de Angular
├── package.json
└── README.md
```

## ⚙️ Configuración de Capacitor

La aplicación está configurada con los siguientes parámetros:

- **App ID**: `com.cuentamimercado.app`
- **App Name**: `cuenta-mi-mercado`
- **Web Directory**: `dist/cuenta-mi-mercado/browser`

### Plugins configurados:

- **Status Bar**: Sin overlay
- **Splash Screen**:
  - Duración: 2000ms
  - Color de fondo: #CAD1C5
  - Sin spinner
  - Pantalla completa e inmersiva

## 🐛 Solución de Problemas

### Error: "ANDROID_HOME no está definido"

- Asegúrate de haber configurado correctamente las variables de entorno
- Reinicia tu terminal o IDE después de configurarlas

### Error: "SDK location not found"

- Crea un archivo `local.properties` en la carpeta `android/` con:
  ```
  sdk.dir=C:\\Users\\TuUsuario\\AppData\\Local\\Android\\Sdk
  ```

### Error al sincronizar Gradle

- Asegúrate de tener conexión a internet
- Verifica que Java JDK esté correctamente instalado
- Intenta: `File` → `Invalidate Caches / Restart` en Android Studio

### La app no se actualiza después de cambios

- Ejecuta nuevamente `npm run build-android`
- O manualmente: `npm run build && npx cap sync`

## 📄 Licencia

[Especifica la licencia de tu proyecto aquí]

## 👥 Contribuidores

[Lista de contribuidores o información de contacto]

---

**Desarrollado con ❤️ usando Angular y Capacitor**
