# Campo Activo

Quiero que construyas una aplicación CRM funcional, mobile-first y responsive para ventas técnicas B2B industriales, especialmente diseñada para prospección física en campo y seguimiento comercial.



No quiero un prototipo visual ni una landing page. Quiero una primera versión funcional (MVP) con base de datos, relaciones entre entidades, CRUD, dashboard, filtros, historial y automatizaciones básicas.



OBJETIVO PRINCIPAL



El CRM debe resolver dos problemas:



1. Registrar todo el trabajo comercial realizado, incluso cuando una visita de prospección todavía no genera contacto, oportunidad o cotización.

2. Evitar que empresas, oportunidades o cotizaciones activas queden olvidadas sin seguimiento.



Principio central:



«“Ningún esfuerzo comercial debe perderse y ninguna oportunidad activa debe quedarse sin una siguiente acción.”»



La aplicación será inicialmente para un solo usuario, por lo que NO necesito administración de equipos, roles complejos, permisos comerciales, territorios, comisiones ni funciones empresariales multiusuario.



Prioriza simplicidad, velocidad y excelente experiencia desde teléfono.



---



1. ARQUITECTURA



Utiliza:



- React + TypeScript.

- Supabase como backend.

- PostgreSQL de Supabase.

- Supabase Storage para archivos/fotografías cuando sea necesario.

- Autenticación simple mediante email.

- Diseño responsive y mobile-first.

- Configuración como PWA instalable en Android.

- Interfaz y textos completamente en español.

- Moneda predeterminada: MXN, permitiendo también USD.

- Fechas en formato DD/MM/YYYY.

- Zona horaria: America/Mexico_City.



No construyas funcionalidades innecesariamente complejas.



La aplicación debe poder ampliarse posteriormente sin rediseñar toda la base de datos.



---



2. MODELO COMERCIAL



NO mezcles estas entidades.



El flujo conceptual es:



Empresa → Contacto → Oportunidad → Cotización → Venta



pero una empresa puede existir sin contacto y debe poder registrarse desde el primer momento.



Ejemplos válidos:



Empresa descubierta → todavía no visitada.



Empresa visitada → sin contacto.



Empresa → varios contactos.



Empresa + contacto → sin oportunidad.



Empresa → varias oportunidades.



Oportunidad → varias cotizaciones.



Todas las interacciones deben conservarse en un historial.



---



3. MODELO DE DATOS



Crear las siguientes entidades principales.



EMPRESAS



Campos:



- id

- nombre

- nombre_comercial

- industria

- dirección

- ciudad

- estado

- parque_industrial

- latitud

- longitud

- sitio_web

- teléfono_general

- origen

- estado_comercial

- notas

- fecha_creación

- última_interacción

- próxima_acción

- fecha_próxima_acción



Origen:



- Google Maps

- Recorrido físico

- Recomendación

- Parque industrial

- Directorio

- Internet

- Otro



Estados comerciales:



- Pendiente de visitar

- Visitada sin contacto

- Contacto identificado

- Contactada

- Interesada

- Oportunidad activa

- Cotización activa

- Cliente

- Prospecto dormido

- Descartada



Una empresa debe poder existir SIN contacto.



---



CONTACTOS



Campos:



- id

- empresa_id

- nombre

- apellidos

- área

- puesto

- teléfono

- whatsapp

- correo

- linkedin

- extensión

- nivel_contacto

- notas



Áreas frecuentes:



- Mantenimiento

- Ingeniería

- Proyectos

- Compras

- Producción

- Calidad

- Servicios

- Seguridad

- Dirección

- Otra



Nivel:



- A — Tomador de decisión

- B — Influenciador técnico

- C — Usuario

- D — Compras

- E — Contacto inicial



Una empresa puede tener múltiples contactos.



---



VISITAS



Campos:



- id

- empresa_id

- contacto_id opcional

- fecha

- hora

- latitud

- longitud

- tipo_visita

- resultado

- información_obtenida

- material_entregado

- notas

- próxima_acción

- fecha_próxima_acción



Tipos:



- Primera visita

- Seguimiento presencial

- Obtener contacto

- Visita comercial

- Visita técnica

- Postventa



Resultados rápidos:



- Sin acceso

- Solo seguridad

- Carta de presentación entregada

- Tarjeta entregada

- Contacto no disponible

- Nombre de contacto obtenido

- Correo obtenido

- Teléfono obtenido

- Hablé con mantenimiento

- Hablé con ingeniería

- Hablé con compras

- Solicitaron regresar

- Solicitaron información

- Solicitaron cotización

- Solicitaron visita técnica

- Necesidad detectada

- Sin interés actual

- Empresa no relevante

- Otro



Nunca sobrescribir visitas anteriores.



---



OPORTUNIDADES



Crear una oportunidad solamente cuando exista una necesidad comercial real.



Campos:



- id

- empresa_id

- contacto_id opcional

- nombre_proyecto

- necesidad

- problema_detectado

- solución_propuesta

- valor_estimado

- moneda

- probabilidad

- fecha_estimada_cierre

- competencia

- etapa

- notas

- última_interacción

- próxima_acción

- fecha_próxima_acción



Etapas:



- Necesidad detectada

- Levantamiento pendiente

- Visita técnica

- Ingeniería

- Cotización

- En revisión

- Negociación

- Esperando OC

- Ganada

- Perdida

- Detenida



---



COTIZACIONES



Campos:



- id

- empresa_id

- contacto_id

- oportunidad_id opcional

- folio

- fecha

- descripción

- importe

- moneda

- archivo_pdf opcional

- vigencia

- tiempo_entrega

- estado

- fecha_último_seguimiento

- fecha_próximo_seguimiento

- notas



Estados:



- Preparación

- Enviada

- En revisión

- Modificación solicitada

- Negociación

- Esperando OC

- Ganada

- Perdida

- Detenida



---



ACTIVIDADES



Esta será la agenda central del CRM.



Campos:



- id

- empresa_id

- contacto_id opcional

- oportunidad_id opcional

- cotización_id opcional

- tipo

- fecha

- hora opcional

- prioridad

- objetivo

- estado

- resultado

- notas



Tipos:



- Prospectar

- Visitar empresa

- Llamar

- WhatsApp

- Correo

- Enviar presentación

- Seguimiento

- Visita técnica

- Levantamiento

- Preparar cotización

- Enviar cotización

- Seguimiento de cotización

- Reunión

- Negociación

- Postventa



Estados:



- Pendiente

- Completada

- Vencida

- Cancelada



Prioridad:



- Alta

- Media

- Baja



Al completar una actividad debe ser fácil crear inmediatamente la siguiente.



---



4. HISTORIAL COMERCIAL



Cada empresa debe tener una ficha individual con pestañas:



Resumen | Historial | Contactos | Oportunidades | Cotizaciones



El historial debe mostrar cronológicamente:



- visitas

- actividades completadas

- contactos creados

- oportunidades

- cotizaciones

- cambios comerciales relevantes



Ejemplo:



10/08 — Primera visita — Carta entregada en seguridad

18/08 — Segunda visita — Contacto de mantenimiento identificado

20/08 — Correo enviado

24/08 — Llamada sin respuesta

02/09 — Visita técnica

05/09 — Cotización enviada



Nunca borrar historial al cambiar el estado comercial.



---



5. REGLA CRÍTICA: SIGUIENTE ACCIÓN



Todo registro comercial ACTIVO debe tener una próxima acción o una decisión explícita.



Al terminar una interacción ofrecer:



¿Qué sigue?



- Crear siguiente actividad.

- Programar seguimiento.

- Mover a prospecto dormido.

- Descartar.



Mostrar claramente empresas activas sin próxima actividad.



No bloquear al usuario si temporalmente no captura una siguiente acción; generar una alerta visible en el dashboard.



---



6. AUTOMATIZACIONES BÁSICAS



Implementar solamente reglas sencillas y determinísticas, sin utilizar una API externa de IA.



Carta entregada / solo seguridad



Sugerir:



Volver a visitar para obtener contacto — 7 días.



Nombre de contacto obtenido



Sugerir:



Contactar responsable — 2 días.



Correo obtenido



Sugerir:



Enviar presentación — hoy.



Solicitaron regresar



Permitir seleccionar fecha y crear:



Visita de seguimiento.



Necesidad detectada



Ofrecer botón:



Crear oportunidad



prellenando empresa y contacto.



Cotización marcada como “Enviada”



Crear automáticamente:



Seguimiento de cotización — +3 días.



Si después del seguimiento continúa abierta, permitir crear el siguiente a +7 días.



No implementar workflows complejos en esta V1.



---



7. CAPTURA RÁPIDA EN CAMPO



Esta función es prioritaria.



Debe existir un botón flotante visible:



+ Registrar visita



La captura rápida debe pedir solamente:



1. Empresa

2. Resultado

3. Nota rápida opcional

4. Próxima acción / fecha



Capturar automáticamente:



- fecha

- hora



Agregar botón:



Obtener ubicación actual



usando la geolocalización del navegador con permiso del usuario.



El registro básico debe poder realizarse idealmente en menos de 30 segundos.



Después de guardar, permitir opcionalmente completar información adicional.



---



8. MODO CAMPO



Crear una vista móvil llamada:



Campo



Debe mostrar:



Pendientes de visitar



Empresas cuyo estado sea “Pendiente de visitar”.



Seguimientos presenciales de hoy



Visitas programadas para hoy.



Empresas sin contacto



Empresas visitadas donde todavía no existe contacto.



Para cada empresa mostrar:



- Nombre

- Estado

- Días desde última visita

- Próxima acción

- Botón Abrir Maps

- Botón Registrar visita



“Abrir Maps” debe abrir Google Maps utilizando las coordenadas o dirección almacenadas.



No implementar optimización automática de rutas en esta versión.



---



9. MAPA



Crear una vista sencilla utilizando una solución de mapas gratuita compatible con el proyecto.



Mostrar empresas que tengan coordenadas.



Al tocar un marcador mostrar:



- Nombre

- Estado

- Última interacción

- Próxima acción

- Abrir ficha

- Abrir Maps



No implementar algoritmos de optimización de rutas.



---



10. DASHBOARD



La pantalla inicial debe responder principalmente:



«¿Qué tengo que hacer hoy?»



Priorizar información accionable sobre gráficas decorativas.



Mostrar primero:



HOY



Actividades pendientes para hoy ordenadas por prioridad.



VENCIDAS



Actividades cuya fecha ya pasó.



REQUIEREN ATENCIÓN



- Empresas activas sin próxima acción.

- Empresas visitadas sin contacto.

- Cotizaciones abiertas con seguimiento vencido.

- Oportunidades activas sin actividad reciente.



PIPELINE



Mostrar:



- Número de oportunidades activas.

- Valor total abierto.

- Pipeline ponderado = Σ(valor × probabilidad).

- Cotizaciones abiertas.

- Importe total cotizado abierto.



ACTIVIDAD DEL MES



Mostrar:



- Empresas nuevas registradas.

- Empresas visitadas.

- Visitas realizadas.

- Contactos obtenidos.

- Oportunidades creadas.

- Cotizaciones enviadas.

- Ventas ganadas.

- Valor de pipeline generado.



Esta sección es importante porque permite demostrar trabajo comercial aunque todavía no se convierta en venta.



---



11. PIPELINE EN CONSTRUCCIÓN



Agregar una pequeña sección del dashboard llamada:



Pipeline en construcción



Mostrar:



- Empresas visitadas sin oportunidad.

- Empresas con contacto identificado.

- Empresas con seguimiento activo.

- Visitas realizadas este mes.

- Contactos obtenidos este mes.



El objetivo es visualizar el esfuerzo comercial previo a una venta.



---



12. OPORTUNIDADES



Crear vista Kanban sencilla por etapa.



Las tarjetas deben mostrar:



- Empresa

- Proyecto

- Valor

- Probabilidad

- Días desde última interacción

- Próxima acción



Permitir abrir y editar la oportunidad.



Si implementar drag-and-drop complica innecesariamente el MVP, utilizar cambio de etapa mediante selector.



Priorizar funcionamiento sobre efectos visuales.



---



13. COTIZACIONES



Crear tabla/lista responsive.



Mostrar:



- Folio

- Empresa

- Importe

- Moneda

- Estado

- Fecha

- Próximo seguimiento



Filtros:



- Abiertas

- Ganadas

- Perdidas

- Sin seguimiento

- Todas



Resaltar cotizaciones cuyo seguimiento esté vencido.



---



14. EMPRESAS



Crear buscador y filtros.



Cada tarjeta/fila debe mostrar:



- Nombre

- Industria

- Estado

- Contacto principal

- Última interacción

- Próxima acción

- Días sin interacción



Filtros:



- Pendientes de visitar

- Sin contacto

- Con contacto

- Oportunidad activa

- Cotización activa

- Clientes

- Dormidas

- Descartadas



---



15. DETECCIÓN BÁSICA DE DUPLICADOS



Antes de crear una empresa comprobar coincidencias simples por:



- nombre normalizado

- teléfono

- sitio web



Si existe posible coincidencia mostrar advertencia:



“Esta empresa podría estar registrada.”



Permitir revisar el registro existente o continuar.



No construir un algoritmo complejo de deduplicación.



---



16. SEMÁFORO VISUAL



Utilizar badges o indicadores consistentes:



- Verde: seguimiento programado correctamente.

- Amarillo: seguimiento próximo.

- Rojo: vencido/requiere atención.

- Azul: oportunidad activa.

- Morado: cotización activa.

- Gris: dormido/descartado.



No depender únicamente del color: acompañar siempre con texto o icono.



---



17. PRIORIZACIÓN



No utilizar IA externa.



Crear una priorización sencilla basada en reglas.



Prioridad alta si:



- actividad vencida;

- cotización requiere seguimiento;

- existe fecha prometida por cliente;

- oportunidad de alto valor lleva varios días sin interacción.



Prioridad media:



- seguimiento próximo;

- empresa visitada sin contacto;

- oportunidad activa con seguimiento futuro.



Mostrar las recomendaciones dentro del dashboard como:



Prioridad de hoy



No desarrollar un algoritmo complejo.



---



18. ANALÍTICA



Mantenerla sencilla.



Crear una vista Analítica con selector de periodo:



- Semana

- Mes

- Trimestre

- Año



Mostrar:



Actividad



- Empresas visitadas

- Visitas

- Contactos obtenidos

- Actividades completadas

- Oportunidades creadas

- Cotizaciones enviadas

- Ventas



Conversiones



- Visita → contacto

- Contacto → oportunidad

- Oportunidad → cotización

- Cotización → venta



Pipeline



- Valor total

- Pipeline ponderado

- Ganado

- Perdido



Utilizar pocas gráficas claras.



No crear dashboards redundantes.



---



19. NAVEGACIÓN



En escritorio utilizar sidebar.



En móvil utilizar navegación inferior con máximo 5 elementos:



Inicio | Campo | Empresas | Pipeline | Más



Dentro de Más:



- Contactos

- Cotizaciones

- Actividades

- Analítica

- Configuración



Agregar botón flotante + para acciones rápidas:



- Registrar visita

- Nueva empresa

- Nueva actividad

- Nueva oportunidad

- Nueva cotización



---



20. DISEÑO



Quiero apariencia profesional B2B industrial.



Características:



- Limpia

- Moderna

- Minimalista

- Técnica

- Alta legibilidad

- Mobile-first

- Pocos colores

- Buen uso del espacio

- Botones grandes en funciones de campo

- Formularios cortos

- Información importante visible inmediatamente



Evitar:



- gradientes excesivos

- animaciones innecesarias

- dashboards saturados

- tarjetas gigantes

- elementos puramente decorativos

- apariencia genérica de plantilla SaaS



Priorizar velocidad y usabilidad.



---



21. DATOS DE DEMOSTRACIÓN



Crear pocos datos ficticios coherentes para poder probar inmediatamente:



- 6 empresas

- 6 contactos

- 8 visitas

- 4 oportunidades

- 4 cotizaciones

- aproximadamente 10 actividades



Incluir ejemplos en distintas etapas:



- empresa pendiente de visitar

- visitada sin contacto

- contacto obtenido

- oportunidad activa

- cotización esperando seguimiento

- cliente



No llenar la aplicación con demasiados datos ficticios.



---



22. REQUISITOS FUNCIONALES



Implementar correctamente:



- Crear, editar y consultar empresas.

- Crear contactos asociados.

- Registrar múltiples visitas sin sobrescribir historial.

- Crear oportunidades.

- Crear cotizaciones.

- Crear/completar actividades.

- Relacionar correctamente las entidades.

- Buscar empresas.

- Filtrar registros.

- Dashboard calculado con datos reales de la base.

- Próximas acciones.

- Actividades vencidas.

- Historial comercial.

- GPS desde navegador.

- Abrir ubicaciones en Google Maps.

- PWA responsive.

- Persistencia real en Supabase.



Todos los contadores, métricas, estados y alertas deben derivarse de los datos almacenados; evitar valores hardcodeados.



---



23. NO IMPLEMENTAR TODAVÍA



Para mantener este MVP pequeño, estable y económico, NO implementar:



- IA generativa externa.

- Chatbot.

- OCR de tarjetas.

- Integración automática con Gmail/Outlook.

- Integración con WhatsApp.

- Integración con Google Calendar.

- Optimización automática de rutas.

- Google Places API.

- Geocodificación de pago.

- ERP.

- Inventarios.

- Facturación.

- Órdenes de compra.

- Administración de equipos comerciales.

- Comisiones.

- Roles complejos.

- Automatizaciones avanzadas.

- Notificaciones push.

- Integraciones con Odoo.

- Modo offline complejo con sincronización.

- Importaciones masivas.

- Exportaciones avanzadas.



Preparar la arquitectura para añadirlas posteriormente, pero NO construirlas ahora.



---



24. CRITERIOS DE TERMINACIÓN



Considera la V1 terminada cuando pueda realizar este flujo completo:



1. Registrar una empresa descubierta.

2. Guardarla como pendiente de visitar.

3. Abrir su ubicación.

4. Registrar una visita desde teléfono.

5. Indicar que solo dejé presentación.

6. Programar automáticamente/sugerir una segunda visita.

7. Posteriormente registrar un contacto.

8. Registrar una necesidad.

9. Crear una oportunidad.

10. Registrar una visita técnica.

11. Crear una cotización.

12. Marcarla enviada.

13. Generar seguimiento.

14. Mostrar ese seguimiento en el dashboard.

15. Marcar la oportunidad como ganada o perdida.

16. Conservar todo el historial de interacciones.



---



25. INSTRUCCIÓN FINAL



Construye directamente el MVP completo con la arquitectura anterior.



Antes de escribir código, analiza internamente las entidades, relaciones y dependencias para evitar duplicar lógica o componentes, pero no me pidas confirmación si puedes tomar una decisión razonable.

Prioridades, en este orden:

1. Integridad del modelo de datos.

2. Flujo Empresa → Visita → Contacto → Oportunidad → Cotización → Seguimiento.

3. Captura rápida desde móvil.

4. Regla de próxima acción.

5. Dashboard accionable.

6. Historial comercial.

7. Experiencia móvil.

8. Analítica.

9. Apariencia visual.



Prefiere siempre una implementación simple y funcional sobre una solución sofisticada.



No agregues funcionalidades que no hayan sido solicitadas. No construyas una landing page. No utilices datos hardcodeados para simular funcionalidades que deberían provenir de Supabase.



Si alguna característica secundaria amenaza con impedir que el flujo comercial principal funcione correctamente, omítela y prioriza que el flujo principal quede completamente funcional.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://campo-clave-tracker.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/f0f5f75f-b4c6-4f98-bf9d-f5248b0f0bd1).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
