# 🌿 Guía de Integración Spline 3D — Botanika Studio & Plantas

Esta guía documenta paso a paso cómo crear, configurar y vincular las escenas 3D interactivas de [Spline](https://spline.design) para el **Hero de la tienda** y el configurador **"Armá tu maceta"**.

---

## 📍 1. Ubicación de las Escenas en el Código

En el archivo [`Botanika/script.js`](file:///c:/Users/brian/OneDrive/Desktop/botanika/Botanika/script.js) se encuentran las dos constantes configurables con sus respectivos placeholders listos para que pegues los enlaces generados al exportar en Spline:

```javascript
// Constante para el Hero (Planta con parallax/rotación al mouse):
const SPLINE_HERO_URL = 'https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode';

// Constante para el Configurador "Armá tu maceta" (Cambio de acabados y materiales en tiempo real):
const SPLINE_CONFIGURATOR_URL = 'https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode';
```

---

## 🚀 2. Implementación 1: Escena Hero (Planta con Parallax)

El objetivo de esta escena es que la planta reaccione sutilmente al cursor del ratón (*mouse hover / look-at*), transmitiendo una sensación premium y viva al ingresar al sitio.

### Pasos en el Editor de Spline:
1. **Crear o importar el modelo:**
   - Creá un nuevo archivo en [Spline](https://spline.design).
   - Diseñá o importá tu modelo de planta (ej. *Monstera* o *Ficus*) en su maceta artesanal.
   - Agregá una iluminación cálida suave (Directional Light color `#FFF5EA` + Ambient Light suave).
2. **Interactividad con el Mouse (Parallax):**
   - Seleccioná el grupo raíz de la planta o la cámara principal.
   - En el panel derecho, hacé clic en **Events (+)**.
   - **Trigger:** Seleccioná `Mouse Move` (o `Look At`).
   - **Target:** Seleccioná el grupo de la planta o la cámara.
   - **Action:** `Rotate` o `Follow Cursor`.
   - Configurá una rotación suave (máximo 8° a 12° en los ejes X e Y) y un *damping / easing* elástico (`Ease Out` o `Smooth`) para que el movimiento sea elegante y sutil.
3. **Publicación y Exportación:**
   - Hacé clic en el botón superior derecho **Export**.
   - En la pestaña **Public URL / Web Content**, seleccioná el formato **Spline Viewer**.
   - Desactivá el logo de Spline (si tenés plan de creador) y desactivá el fondo (*Transparent Background*) para que se funda armoniosamente con el color crema de Botanika (`#FAF8F5`).
   - Copiá el enlace que termina en `.splinecode`.
   - Pegalo en la constante `SPLINE_HERO_URL` en `Botanika/script.js`.

---

## 🏺 3. Implementación 2: Configurador "Armá tu maceta"

En la sección **"Armá tu maceta"**, el usuario interactúa con tres acabados:
1. **Terracota Artesanal** (`#D07A58` - $12.500)
2. **Cerámica Blanca Esmaltada** (`#F7F6F2` - $14.900)
3. **Gris Cálido Mineral** (`#7A827B` - $15.200)

La aplicación envía en tiempo real las variables y eventos a la escena a través del Web Component:
```javascript
spline.setVariable('Finish', finishName);
spline.setVariable('Material', finishKey);
spline.emitEvent('changeFinish', finishKey);
```

### Pasos en el Editor de Spline:

### Paso 1: Configurar el Objeto y sus Estados (States)
1. Importá o modelá la maceta (por ejemplo, con nombre de capa `PotMesh` o `Maceta`).
2. En el panel de **Materials**, asegurate de que el objeto tenga su material base:
   - **State Base (`terracota`):** Color difuso `#D07A58`, rugosidad (*Roughness*) alta (0.85) para simular barro cocido sin brillo.
3. Creá un segundo estado (**State +**):
   - Nombralo `blanca`.
   - Cambiá el color a `#F7F6F2`, bajá la rugosidad a 0.25 y aumentá el especular para darle brillo cerámico esmaltado.
4. Creá un tercer estado (**State +**):
   - Nombralo `gris`.
   - Cambiá el color a `#7A827B`, rugosidad media (0.6) con textura satinada mineral.

### Paso 2: Crear las Variables en Spline
1. En el panel izquierdo de Spline, abrí la sección **Variables**.
2. Creá una variable de tipo **String**:
   - Nombre: `Finish`
   - Valor inicial: `Terracota Artesanal`
3. Creá una segunda variable de tipo **String**:
   - Nombre: `Material`
   - Valor inicial: `terracota`

### Paso 3: Configurar los Triggers / Eventos
Tenés dos opciones igualmente válidas en Spline:

* **Opción A (Por Variable Change):**
  - Seleccioná la maceta y agregá un evento **Event (+)**.
  - **Trigger:** `Variable Change`.
  - **Variable:** `Material`.
  - Agregá una condición:
    - Si `Material == "terracota"` → **Transition** a `Base State`.
    - Si `Material == "blanca"` → **Transition** a State `blanca`.
    - Si `Material == "gris"` → **Transition** a State `gris`.
* **Opción B (Por Custom Event):**
  - **Trigger:** `Custom Event` (llamado `changeFinish`).
  - Asigná la transición de estado al material correspondiente según el parámetro.

### Paso 4: Exportar y Pegar URL
1. Hacé clic en **Export** > **Public URL**.
2. Marcá **Play on Load**, fondo transparente (*Transparent Background*), y habilitá interacción táctil y de ratón (*Orbit Controls*).
3. Copiá la URL `.splinecode` y pegala en `SPLINE_CONFIGURATOR_URL` en `Botanika/script.js`.

---

## 🛡️ 4. Rendimiento y Accesibilidad Integrados

* **Lazy Loading:** El web component utiliza `loading="lazy"` para no competir por ancho de banda con las fuentes o el render inicial de la tienda.
* **Fallback a Imagen de Alta Calidad:** Si el usuario tiene una conexión lenta o el render 3D aún no cargó, se muestra una fotografía de vivero de alta resolución con aura difuminada.
* **Preferencia de Movimiento Reducido (`prefers-reduced-motion`):** Si el sistema operativo del usuario tiene configurada la accesibilidad de reducción de movimiento, la aplicación omite la carga del canvas WebGL y muestra directamente la imagen fija optimizada.
* **Integración con el Carrito:** Al presionar **"Agregar al Carrito Existente"**, la maceta configurada se suma automáticamente al arreglo `cart` global respetando precios, cantidades y el flujo oficial hacia Mercado Pago Checkout Pro.
