# NoEstásSol@ · OptimeFlow(s)

Progressive Web App (PWA) designed to **organize workplace facts, structure evidence, and generate a PDF-exportable draft** directly in the browser.  
It is intended to run **100% on the user’s device**, including **offline**, through a guided step-by-step experience.

## What it is

**NoEstásSol@** is a tool designed to help workers **organize relevant information about a workplace situation**, document the facts, and generate a **clear, structured, exportable draft** for review or possible submission to the competent labor authority in the selected country.

The app avoids depending on a backend for its main workflow and prioritizes:

- privacy
- clarity
- portability
- ease of use on mobile and desktop
- static deployment

## What it does

The application allows users to:

- follow a **4-step wizard**
- enter personal, company, and employment relationship data
- document facts in a structured way
- record evidence, witnesses, and additional requests
- build a **preview of the draft**
- export the result to **PDF**
- save, load, export, and import **JSON sessions**
- change the **visual theme** and **interface language**
- install the app as a **PWA**
- keep using it **offline**

## Project principles

### Privacy by design
Information is processed in the browser. No user account or server is required for the main workflow.

### No mandatory backend
The project can be deployed as a static web app.

### Accessibility and clarity
The structure uses labels, real buttons, step-based navigation, and a responsive UI designed to make the experience straightforward.

### Internationalization
The interface supports multiple languages, and the draft text adapts certain references according to the selected country of the employment relationship.

## Main features

### 1. Guided 4-step wizard

The application splits the workflow into four sections:

1. **Your details**
2. **Company and employment relationship**
3. **Facts you want to report**
4. **Review and export your draft**

Each step updates navigation, the progress bar, basic validation, and the preview.

### 2. Structured information capture

Instead of relying on a single text field, the app organizes the information into specific blocks:

- personal details
- company details
- key dates
- type of issue
- specific facts
- documentary evidence
- witnesses
- additional requests

This improves the readability of the final draft and helps avoid leaving out relevant information.

### 3. Draft preview

The application builds a draft from the data entered by the user and displays it in a preview area before export.

### 4. PDF export

Export is performed client-side using **jsPDF**, applying paragraph formatting, indentation, lists, and page breaks.

### 5. Saved sessions

The app allows users to:

- save a session in `localStorage`
- load a saved session
- export a session to JSON
- import a session from JSON

This makes it easier to continue later without filling out the form again.

### 6. Languages and countries

The interface uses a simple i18n system based on JSON language files.  
In addition, the draft adapts the heading and certain text references according to the selected country.

Countries currently covered by the logic:

- Spain
- Italy
- France
- Germany
- Portugal
- Brazil

### 7. Visual themes

The application includes several locally persisted themes:

- `system`
- `dark`
- `midnight`
- `nebula`
- `ocean`
- `forest`
- `amber`
- `violet`
- `mono`

### 8. PWA installation

The app supports installation on compatible devices and registers a **Service Worker** to improve the offline experience.

## Technical stack

- **HTML5**
- **CSS3**
- **Vanilla JavaScript**
- **jsPDF** for PDF export
- **Service Worker** for offline support
- **localStorage** for preferences and sessions

## Expected project structure

```text
/
├── index.html
├── styles.css
├── app.js
├── export.js
├── i18n.js
├── manifest.json
├── sw.js
├── lang/
│   ├── es.json
│   ├── en.json
│   ├── it.json
│   ├── de.json
│   ├── ru.json
│   ├── pt-br.json
│   ├── ko.json
│   ├── ja.json
│   ├── zh.json
│   └── fr.json
└── assets/
    └── img/
        ├── logo.png
        ├── noestassolo192.png
        ├── noestassolo512.png
        └── noestassolo-apple-180.png

```



# NoEstásSol@ · OptimeFlow(s)

Aplicación web progresiva (PWA) para **ordenar hechos laborales, estructurar pruebas y generar un borrador exportable en PDF** directamente desde el navegador.  
Está pensada para funcionar **100% en el dispositivo del usuario**, también **sin conexión**, con una experiencia guiada por pasos.

## Qué es

**NoEstásSol@** es una herramienta orientada a ayudar a una persona trabajadora a **organizar información relevante sobre una situación laboral**, dejar constancia de los hechos y generar un **borrador claro, estructurado y exportable** para su revisión o eventual presentación ante la autoridad laboral competente del país seleccionado.

La app evita depender de un backend para el flujo principal y prioriza:

- privacidad
- claridad
- portabilidad
- uso sencillo desde móvil o escritorio
- despliegue estático

## Qué hace

La aplicación permite:

- guiar a la persona usuaria con un **wizard de 4 pasos**
- recoger datos personales, de empresa y de relación laboral
- documentar hechos de forma estructurada
- registrar pruebas, testigos y solicitudes adicionales
- construir una **vista previa del escrito**
- exportar el resultado a **PDF**
- guardar, cargar, exportar e importar **sesiones en JSON**
- cambiar **tema visual** e **idioma de interfaz**
- instalarse como **PWA**
- seguir funcionando **offline**

## Principios del proyecto

### Privacidad por diseño
La información se procesa en el navegador. No se requiere cuenta de usuario ni servidor para el flujo principal.

### Sin backend obligatorio
El proyecto puede desplegarse como una web estática.

### Accesibilidad y claridad
La estructura usa labels, botones reales, navegación por pasos y una UI responsive pensada para facilitar el uso.

### Internacionalización
La interfaz soporta varios idiomas y el texto del borrador adapta referencias según el país de la relación laboral.

## Funcionalidades principales

### 1. Asistente guiado de 4 pasos

La aplicación divide el flujo en cuatro bloques:

1. **Tus datos**
2. **Empresa y relación laboral**
3. **Hechos que denuncias**
4. **Revisa y exporta tu escrito**

Cada paso actualiza navegación, barra de progreso, validaciones mínimas y vista previa.

### 2. Recogida estructurada de información

En lugar de un único campo de texto, la app organiza la información en bloques concretos:

- datos personales
- datos de la empresa
- fechas clave
- tipo de irregularidad
- hechos concretos
- pruebas documentales
- personas testigo
- peticiones adicionales

Esto mejora la legibilidad del borrador final y ayuda a no dejar información importante fuera.

### 3. Vista previa del escrito

La aplicación compone un borrador a partir de los datos introducidos y lo muestra en una zona de previsualización antes de la exportación.

### 4. Exportación a PDF

La exportación se realiza en cliente mediante **jsPDF**, aplicando formato de párrafos, sangrías, listas y saltos de página.

### 5. Sesiones guardadas

La app permite:

- guardar una sesión en `localStorage`
- cargar una sesión guardada
- exportar una sesión a JSON
- importar una sesión desde JSON

Esto facilita retomar el trabajo más tarde sin rehacer el formulario.

### 6. Idiomas y países

La interfaz usa un sistema sencillo de i18n basado en archivos JSON de idioma.  
Además, el borrador adapta el encabezado y determinadas referencias textuales según el país seleccionado.

Países contemplados en la lógica actual:

- España
- Italia
- Francia
- Alemania
- Portugal
- Brasil

### 7. Temas visuales

La aplicación incluye varios temas persistidos localmente:

- `system`
- `dark`
- `midnight`
- `nebula`
- `ocean`
- `forest`
- `amber`
- `violet`
- `mono`

### 8. Instalación como PWA

La app soporta instalación en dispositivos compatibles y registro de **Service Worker** para mejorar la experiencia offline.

## Stack técnico

- **HTML5**
- **CSS3**
- **JavaScript vanilla**
- **jsPDF** para exportación a PDF
- **Service Worker** para soporte offline
- **localStorage** para preferencias y sesiones

## Estructura esperada del proyecto

```text
/
├── index.html
├── styles.css
├── app.js
├── export.js
├── i18n.js
├── manifest.json
├── sw.js
├── lang/
│   ├── es.json
│   ├── en.json
│   ├── it.json
│   ├── de.json
│   ├── ru.json
│   ├── pt-br.json
│   ├── ko.json
│   ├── ja.json
│   ├── zh.json
│   └── fr.json
│   
└── assets/
    └── img/
        ├── logo.png
        ├── noestassolo192.png
        ├── noestassolo512.png
        └── noestassolo-apple-180.png

```
Usage flow

Open the app.

Choose language, country, and theme if needed.

Complete the wizard step by step.

Review the generated preview.

Confirm the accuracy of the information.

Export the draft as a PDF.

Save or export the session if you want to continue later.

Local persistence

The application uses localStorage to store:

visual theme

language

selected country

saved sessions

Keys currently used by the app:

nes_theme

nes_lang

nes_country

nes_sessions

Privacy

The project philosophy is clear:

data entered by the user stays on the device

there is no account system or login

information is not sent to a server in the main workflow

preferences are stored locally for convenience

Important notice

This tool is informational and supportive in nature and does not replace professional legal advice.
Before submitting any document, it is advisable to review the final content carefully and, if needed, consult a union, labor relations professional, or employment lawyer.

Accessibility and UX

The project already includes several solid decisions:

labels associated with inputs

real buttons for actions

tab and step navigation

visible focus states

responsive design

comfortable use on mobile portrait mode

helper text for completing the form

How to run locally

Since this is a static web app, you only need to serve the files with a local server.

Option 1: VS Code + Live Server

Open the project folder and launch Live Server on index.html.

Option 2: Python
python -m http.server 8080

Then open in your browser:

http://localhost:8080
Deployment

It can be published without issues on static hosting platforms such as:

GitHub Pages

Netlify

Vercel

Cloudflare Pages

Production recommendations

serve everything over HTTPS

verify that manifest.json and sw.js load correctly

review assets/ and lang/ paths

test PWA installation on mobile and desktop

validate offline behavior after the first visit

review the exported PDF in multiple browsers

Project status

Functional project focused on:

structured documentation of workplace incidents

local draft generation

fast use on mobile or desktop

simple static deployment

License

MIT

Author

Developed by Andrés Calvo Espinosa.
Project linked to OptimeFlow(s).

Website: https://optimeflow.com/

ORCID: https://orcid.org/0009-0005-4079-7418

Suggested roadmap

add basic draft generation tests

include richer country-specific validations

allow export to .txt or .docx

add temporary autosave

add confirmation before overwriting sessions

improve documentation for sw.js and manifest.json

publish screenshots in the README

add a limitations and legal notice section
