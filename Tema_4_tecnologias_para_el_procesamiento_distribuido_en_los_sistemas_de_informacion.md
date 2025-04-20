# 4. Tecnologías para el procesamiento distribuido en los sistemas de información

**Objetivos**

- Proporcionar una visión global de los sistemas de almacenamiento distribuidos.
- Definir un glosario de términos relacionados con las redes de almacenamiento distribuido.

## Tabla de Contenidos
- [4. Tecnologías para el procesamiento distribuido en los sistemas de información](#4-tecnologías-para-el-procesamiento-distribuido-en-los-sistemas-de-información)
  - [Tabla de Contenidos](#tabla-de-contenidos)
  - [4.1 Red de almacenamiento distribuido](#41-red-de-almacenamiento-distribuido)
  - [4.2 Objetivos de una DSN](#42-objetivos-de-una-dsn)
  - [4.3 Definición de red de almacenamiento](#43-definición-de-red-de-almacenamiento)
  - [4.4 Evolución histórica](#44-evolución-histórica)
  - [4.5 Terminología relacionada](#45-terminología-relacionada)
- [Resumen](#resumen)

## 4.1 Red de almacenamiento distribuido

Una red de almacenamiento distribuido (_Distributed Storage Network_, DSN): es una infraestructura que permite el acceso compartido de múltiples sistemas (ordenadores de sobremesa, servidores, dispositivos móviles de usuarios, etc.) al recurso de almacenamiento de un sistema de información (SI).

**Características**

- Infraestructura que da acceso compartido a recursos de almacenamiento para múltiples sistemas heterogéneos.
- Separa servidores/usuarios de los dispositivos físicos, creando un pool común de datos.
- Facilita la escalabilidad y la administración centralizada de la información.
- Abarca desde sobremesas y móviles hasta centros de datos.
- Constituye la base para servicios modernos de datos.

## 4.2 Objetivos de una DSN

- Incrementar la **disponibilidad** mediante redundancia y rutas múltiples.
- Habilitar el **acceso compartido** y la colaboración sobre los mismos datos (_datasets_).
- Mejorar la **eficiencia**: rendimiento, balanceo de carga y uso de capacidad.
- Garantizar **independencia** frente a fabricantes y tecnologías subyacentes.
- Simplificar políticas de backup, recuperación y migración.

## 4.3 Definición de red de almacenamiento

**Red de almacenamiento** (_Storage Network_). Red especializada en el transporte de datos entre distintos tipos de dispositivos.

- Transporte de bloques de datos reconocibles por distintos sistemas operativos y dispositivos de almacenamiento.
- Utiliza protocolos especializados para el transporte de datos, como **SCSI, ESCON o Fibre Channel (FC)**.
- Transparente a los sistemas operativos que ven los bloques como discos locales.
- Optimiza ancho de banda y latencia frente a redes LAN convencionales.
- Sienta la base para las arquitecturas **SAN**.

## 4.4 Evolución histórica

- **Mainframe (1960s)**: buses paralelos, ancho de banda y distancia limitados.

- **Almacenamiento para miniordenadores (1970s) y ordenadores personales (1980s)**

  - Necesidad de aumentar el grado de integración de los dispositivos de almacenamiento:
    - Capacidad
    - Densidad de almacenamiento
  - Tecnologías
    - _Integrates Drive Electronics_/_AT Attachment_ (IDE/ATA)
    - _Small Computer System Interface_ (SCSI)
  - Limitaciones
    - Dificultad para el manejo de grandes cantidades de datos
    - Distancia

- El problema de las **islas de almacenamiento**: sistemas de almacenamiento independientes, sin conexión entre ellos, lo que dificulta la gestión y el acceso a los datos.
  - Accesibilidad a los datos
  - Eficiencia del almacenamiento
  - Dificulta el manejo de los datos
  - Dificulta la compartición de datos
  - Productividad

<img src="2025-04-20-22-29-20.png" alt="islas de almacenamiento" width="600"/>

## 4.5 Terminología relacionada

**LAN & WAN:** redes de datos locales y de larga distancia con protocolos Ethernet, ATM, DWDM…  
**SAN:** red de almacenamiento con acceso de bloque, alta concurrencia y fiabilidad.  
**Topologías SAN:**

- Punto‑a‑punto
- Bucle arbitrado FC‑AL
- Switch Fabric
  **NAS:** gestor de archivos conectado a la LAN
  **Conceptos de capacidad:** almacenamiento compartido, virtualización, RAID, JBOD, replicación

---

# Resumen

**Conceptos clave**

- **DSN (Distributed Storage Network):** infraestructura que conecta hosts y cabinas de almacenamiento distribuidas para acceso de datos uniforme.
- **Disponibilidad:** probabilidad de que los datos estén accesibles cuando se requieran.
- **Storage Area Network (SAN):** red dedicada de alta velocidad que suministra almacenamiento a nivel de bloque a múltiples servidores.
- **Network Attached Storage (NAS):** dispositivo especializado que ofrece almacenamiento a nivel de archivo mediante protocolos LAN (NFS, SMB).
- **Fibre Channel (FC):** protocolo de red de alta velocidad orientado a bloques, común en SAN.
- **Arbitrated Loop (FC‑AL):** topología en bucle FC con hasta 127 nodos y lógica de arbitraje.
- **Switch Fabric:** conjunto de switches FC que permite múltiples rutas concurrentes y escalabilidad.
- **Virtualización de almacenamiento:** abstracción lógica que presenta volúmenes virtuales independientemente de la ubicación física.
- **RAID:** conjunto redundante de discos que usa striping, mirroring y/o paridad para mejorar rendimiento y fiabilidad.
- **JBOD:** agrupación simple de discos para ampliar capacidad sin redundancia.
- **Replicación síncrona/asíncrona:** duplicación de datos en tiempo real o diferido para resiliencia.

---

**Fórmulas / algoritmos relevantes**

\[
\text{Capacidad útil RAID 5} = (n - 1) \times C\_{\text{disco}}
\]

\[
\text{Disponibilidad} = \frac{\text{MTBF}}{\text{MTBF} + \text{MTTR}}
\]

\[
\text{Overhead de paridad RAID 5} = \frac{1}{n}
\]

Donde \(n\) es el número de discos y \(C\_{\text{disco}}\) su capacidad individual.

---

**Preguntas de repaso estilo examen**

**Sección 1 – Definición DSN**

1. Defina **red de almacenamiento distribuido** y mencione dos ventajas clave.
2. ¿Qué tipos de dispositivos pueden conectarse a una DSN?
3. Explique brevemente cómo una DSN difiere de una red LAN tradicional.

**Sección 2 – Objetivos**

1. Enumere los cuatro objetivos principales de una DSN.
2. Proponga un escenario donde la **independencia de fabricante** sea crítica.
3. ¿Por qué la disponibilidad es más importante que la capacidad en entornos críticos?

**Sección 3 – Storage Network**

1. Cite dos protocolos usados en redes de almacenamiento y su función.
2. Compare las redes de almacenamiento con las LAN en términos de latencia y ancho de banda.
3. ¿Qué implicaciones tiene transportar **bloques de datos** frente a **archivos**?

**Sección 4 – Evolución histórica**

1. Describa la principal limitación de los buses paralelos en los años 60‑70.
2. ¿Qué son las “islas de almacenamiento” y por qué son problemáticas?
3. Explique la transición de SCSI a Fibre Channel.
4. Interprete el diagrama de la página 11 y resuma su mensaje.

**Sección 5 – Terminología y tecnologías**

1. Distinga entre **SAN** y **NAS** en cuanto al nivel de acceso (bloque vs archivo).
2. ¿Cuál es la diferencia entre topología punto‑a‑punto y fabric?
3. Complete la tabla: para un RAID 5 con 6 discos de 2 TB, ¿cuál es la capacidad útil y el overhead de paridad?
4. Nombre dos ventajas de la virtualización de almacenamiento.
5. Explique replicación **síncrona** vs **asíncrona** y cite un caso de uso adecuado para cada una.
