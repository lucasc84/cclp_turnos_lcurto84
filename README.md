# CODERHOUSE

Curso de JavaScript  
Comisión 73445  
Alumno: Lucas Curto

Proyecto:  
Entrega Final

---

## Simulador elegido: Turnero para Casa de Préstamos - Entrega Final

Este proyecto representa la evolución final del simulador de turnos para la casa de préstamos ficticia **"Préstamos Express S.A."**, integrando de forma funcional y coherente los contenidos vistos en el **del curso de JavaScript**.

La aplicación permite a los usuarios solicitar un turno ingresando sus datos personales, seleccionando la sucursal, la fecha y el horario deseado. El sistema genera una constancia visual del turno confirmado en un nuevo HTML y ofrece al usuario la posibilidad de imprimirla.

A diferencia de entregas anteriores, esta versión incorpora asincronismo, carga de datos desde un archivo JSON (horarios disponibles), y el uso de librerías externas para mejorar la experiencia del usuario.

## Funcionalidades

- Se captura la información del usuario desde un formulario HTML con validación de campos.
- Los horarios disponibles para turnos se cargan asincrónicamente desde un archivo externo `JSON` mediante `fetch`.
- Se reemplaza el uso de `alert`, `prompt` y `confirm` por componentes visuales modernos utilizando **SweetAlert2** y **Toastify**.
- La fecha del turno se presenta con formato amigable gracias a la librería **Luxon**.
- Se utiliza `localStorage` para guardar los datos del turno y mostrarlos luego en una constancia.
- La constancia de turno se presenta en un HTML separado con opción para imprimir.
- La lógica está organizada en funciones claras, reutilizables y separadas por archivos.

## Estructura

- La lógica del simulador responde al flujo **entrada → procesamiento → salida**.
- Se capturan los datos desde un formulario (`submit`) y se validan antes de confirmar el turno.
- Se utiliza `fetch` para cargar dinámicamente los horarios disponibles desde un archivo `turnos.json`.
- Los horarios y sucursales se cargan dinámicamente desde la API de JSON Server usando el archivo `db.json`.
- Una vez confirmados los datos, se utiliza **SweetAlert2** para confirmar la acción del usuario.
- Se guarda la información del turno en `localStorage` y se redirige a una nueva página (`constancia.html`) donde se presenta una constancia personalizada.
- Se aplica Luxon para formatear correctamente la fecha del turno.
- El botón "Imprimir constancia" utiliza `window.print()` para generar un PDF o copia impresa si se desea.
- Toda la estructura del proyecto se encuentra dividida en carpetas: `/css`, `/js`, `/assets`.

## Nota

Esta entrega final sintetiza los conocimientos adquiridos a lo largo del curso, con foco en la interactividad, asincronismo, modularización y experiencia de usuario.

El proyecto está preparado para ser escalado fácilmente en versiones futuras (por ejemplo, integrando API reales o validación de disponibilidad de turnos), respetando una estructura ordenada y coherente.
