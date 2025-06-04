# Tema 5. Computación en Clúster

- [Tema 5. Computación en Clúster](#tema-5-computación-en-clúster)
  - [Computación en Clúster](#computación-en-clúster)
    - [1. Introducción.](#1-introducción)
    - [2. Arquitectura.](#2-arquitectura)
    - [3. Tipos de clúster.](#3-tipos-de-clúster)
    - [4. Componentes.](#4-componentes)
    - [5. Middleware.](#5-middleware)
    - [6. Manejo y planificación de recursos.](#6-manejo-y-planificación-de-recursos)
    - [7. Recursos básicos de programación.](#7-recursos-básicos-de-programación)
  - [Red Hat Enterprise High Availability Add-On](#red-hat-enterprise-high-availability-add-on)
  - [Algoritmos de Sincronización Distribuidos](#algoritmos-de-sincronización-distribuidos)

## Computación en Clúster

**Objetivos**: proporcionar una visión general de la arquitectura, los elementos hardware y software de un sistema clúster.

### 1. Introducción.

> Hay tres maneras de mejorar el rendimiento:
> _Trabajar duro_ > _Trabajar más inteligentemente_, y
> _Conseguir ayuda_.
> G. Pfister, "In Search of Clusters", 1998

Un **clúster** es un tipo de arquitectura escalable para el procesamiento distribuido.

**Características**:

- **Escalabilidad**: capacidad de aumentar el rendimiento agregando más recursos.
- **Disponibilidad**: capacidad de mantener el servicio incluso si algunos de los componentes fallan.
- **Flexibilidad**: capacidad de adaptar el sistema a diferentes cargas de trabajo.

**Arquitecturas para el procesamiento paralelo**:

- Procesadores para el cómputo masivo (MPP)
- Multiprocesadores simétricos (SMP)
- Sistemas de acceso no uniforme a memoria de caché coherente (CCNUMA)
- Sistemas distribuidos: sistemas clúster

**Sinónimos del término clúster**:

- Red de estaciones de trabajo
- Clúster de estaciones de trabajo

**Principal motivación**: supercomputación de bajo coste

- Basado en tecnología de uso popular, y por tanto atractiva desde el punto de vista de su coste.
- Escalabilidad.

### 2. Arquitectura.

Elementos de un entorno clúster:

- **Nodos** (computadores): máquinas físicas o virtuales que forman parte del clúster.
- **Sistemas Operativos**
- **Infraestructura de red**: permite la comunicación entre los nodos.
- **Protocolos de comunicación y Servicios**
- **Middlewares**
- **Entorno de desarrollo de aplicaciones**
- **Aplicaciones**

<img src="assets/2025-06-04-18-04-26.png" alt="Arquitectura de un clúster" width="500">

La imagen muestra la arquitectura lógica de un clúster de computación. Es un sistema distribuido compuesto por:

- Nodos (PC/Workstation): Equipos conectados por una red de alta velocidad. Cada uno tiene:
- Net Interface HW: hardware de red.
- Comm. S/W: software de comunicación.
- Cluster Middleware: capa que abstrae los nodos como si fueran un único sistema (Single System Image). Gestiona disponibilidad y coordinación.
- Aplicaciones:
- Secuenciales: funcionan sin cambios sobre el clúster.
- Paralelas: diseñadas para aprovechar múltiples nodos.
- Entornos de programación paralela: ayudan a desarrollar estas aplicaciones.

Resumiendo: es un sistema cooperativo de PCs que actúan como un superordenador, coordinados por middleware y conectados en red.

### 3. Tipos de clúster.

En función del **objetivo perseguido**:

- Alto rendimiento
- Alta disponibilidad
- Almacenamiento distribuido
- De balanceo de carga

En función de la **configuración del nodo**:

- Homogéneo: todos los nodos son iguales.
- Heterogéneo: los nodos son diferentes.

En función del **número de nodos**:

- Grupo: 2-29.
- Departamentales: 10-100.
- Corporativos: más de 100.
- Nacionales: (agrupaciones de clúster de alguno de los tipos anteriores vía WAN/Internet).
- Internacionales: (agrupaciones de clúster de alguno de los tipos anteriores, vía WAN/Internet, de más de 1000 nodos).

### 4. Componentes.

**Nodos**:

- CPU.
- Memoria.
- Bus del sistema.
- Subsistema de E/S.

**Interconexión**:

- Ethernet, Fast Ethernet y Gigabit Ethernet.
- Asynchronous Transfer Mode (ATM).
- Scalable Coherent Interface (SCI).
- Myrinet
  Bus del sistema.
- Subsistema de E/S.

**Sistema operativo**:

- Linux.
- Microsoft Windows.

### 5. Middleware.

**Objetivo**: Cumplir con el requerimiento de Imagen Única del sistema: "_a partir de un conjunto de nodos interconectados, proporcionar una imagen unificada de los recursos del sistema (SSI)_".

- Transparencia: el usuario no necesita conocer la existencia de los nodos.
- Mejora de la disponibilidad: el sistema sigue funcionando aunque fallen algunos nodos.
- Rendimiento escalable: el sistema puede aumentar su rendimiento agregando más nodos.

Middleware es un módulo software estructurado en dos capas:

- **Infraestructura SSI**:

  - Un único punto de entrada.
  - Jerarquía única de archivos.
  - Un único punto de control y gestión del clúster.
  - Una única red virtual.
  - Un único espacio de memoria.
  - Un único sistema de gestión de tareas.
  - Una única interfaz de usuario.

- **Infraestructura de disponibilidad del sistema**:
  - Espacio de E/S único.
  - Un único espacio de procesos.
  - Mecanismo de salvaguardado de contexto.
  - Mecanismo de migración de procesos.

### 6. Manejo y planificación de recursos.

En un entorno clúster el **manejo y la planificación de recursos (RMS)** tiene por objeto hacer un uso eficiente de los recursos disponibles con el fin de cumplir los objetivos del clúster (alto rendimiento, alta disponibilidad, balanceo de carga, almacenamiento distribuido)

**¿Cómo?** Gestionando los procesos entre los nodos del clúster, con un mínimo impacto de cara a los usuarios. Dependiendo del objetivo perseguido, se requerirán alguna(s) de las siguientes funcionalidades:

- Migración de procesos.
- Monitorización de contextos.
- Aprovechamiento de los ciclos ociosos.
- Tolerancia a fallos.
- Balanceado de carga.
- Planificación mediante múltiples colas de proceso

### 7. Recursos básicos de programación.

**Entornos de programación estándares para entornos distribuidos**:

- **Uso de hilos**.

  - _IEEE POSIX threads interface (pthreads)_.

- **Sistemas de mensajes**.

  - _Parallel Virtual Machine (PVM)_.
  - _Message Passing Interface (MPI)_.

- **Sistemas de memoria compartida y distribuida**.
  - Sistemas software de memoria compartida.
    - TreadMarks.
    - Linda.
  - Sistemas hardware de memoria compartida.
    - DASH.
    - Merlin.
- **Depuradores**:
  - _High Performance Debugging Forum (HPDF)_.
  - _TotalView_
    - C, C++,F77,F99,HPF.
    - MPI, PVM.
    - IBM AIX, SGI IRIX, SunOS, etc.
- **Herramientas de análisis de rendimiento**:
  - Funciones para monitorizar el rendimiento.
  - Librería “run-time” .
  - Herramientas para procesar y visualizar los datos de rendimiento.

- **Administración**:
  - NOW.
  - _SMILE ( K-CAP )_.
  - _PARMON_ (Grandes configuraciones).
  - **_Orden pcs_ (Red Hat Enterprise High Availability Add-On)**.
  - _Servicio pcsd Web UI_ (Red Hat Enterprise High Availability Add-On).

## Red Hat Enterprise High Availability Add-On

## Algoritmos de Sincronización Distribuidos
