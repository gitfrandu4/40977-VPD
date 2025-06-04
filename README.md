# 40977-VPD: Virtualización y Procesamiento Distribuido

- [40977-VPD: Virtualización y Procesamiento Distribuido](#40977-vpd-virtualización-y-procesamiento-distribuido)
  - [Información de la Asignatura](#información-de-la-asignatura)
  - [Descripción](#descripción)
  - [Objetivos de Aprendizaje](#objetivos-de-aprendizaje)
  - [Contenido Teórico](#contenido-teórico)
    - [1. Fundamentos y tecnologías de virtualización](#1-fundamentos-y-tecnologías-de-virtualización)
      - [Tema 1.1: Fundamentos y tecnologías de virtualización](#tema-11-fundamentos-y-tecnologías-de-virtualización)
      - [Tema 1.2: El sistema anfitrión y anatomía de la máquina virtual en KVM](#tema-12-el-sistema-anfitrión-y-anatomía-de-la-máquina-virtual-en-kvm)
    - [2. Recursos Almacenamiento Virtual KVM](#2-recursos-almacenamiento-virtual-kvm)
    - [3. Recursos de red en KVM](#3-recursos-de-red-en-kvm)
    - [4. Almacenamiento Distribuido](#4-almacenamiento-distribuido)
    - [5. Computación en Clúster](#5-computación-en-clúster)
    - [6. Introducción a la computación en la nube](#6-introducción-a-la-computación-en-la-nube)
  - [Prácticas](#prácticas)
    - [Práctica 1: Instalación y Configuración de KVM y Máquinas Virtuales](#práctica-1-instalación-y-configuración-de-kvm-y-máquinas-virtuales)
    - [Práctica 2: Operaciones con máquinas virtuales](#práctica-2-operaciones-con-máquinas-virtuales)
    - [Práctica 3: Recursos de almacenamiento virtual](#práctica-3-recursos-de-almacenamiento-virtual)
    - [Práctica 4: Migración de máquinas virtuales](#práctica-4-migración-de-máquinas-virtuales)
    - [Práctica 5: Infraestructura de red virtual](#práctica-5-infraestructura-de-red-virtual)
    - [Práctica 6: Almacenamiento distribuido (almacenamiento iSCSI)](#práctica-6-almacenamiento-distribuido-almacenamiento-iscsi)
    - [Práctica 7: Diseño y despliegue de un clúster básico](#práctica-7-diseño-y-despliegue-de-un-clúster-básico)
    - [Práctica 8 : Trabajo optativo](#práctica-8--trabajo-optativo)
      - [Trabajo 8.1: Implementación de Agregación de Enlaces (Network Bonding)](#trabajo-81-implementación-de-agregación-de-enlaces-network-bonding)
  - [Seguridad en Sistemas Anfitriones KVM](#seguridad-en-sistemas-anfitriones-kvm)
  - [Herramientas y Tecnologías](#herramientas-y-tecnologías)
  - [Recursos Adicionales](#recursos-adicionales)
  - [Documentación de Firewalld](#documentación-de-firewalld)
  - [Normas de Entrega](#normas-de-entrega)
  - [Bibliografía](#bibliografía)

## Información de la Asignatura

- **Código:** 40977
- **Nombre:** Virtualización y Procesamiento Distribuido
- **Titulación:** Grado en Ingeniería Informática
- **Curso Académico:** 2024-2025
- **Semestre:** Segundo semestre
- **Créditos ECTS:** 6
- **Universidad:** Universidad de Las Palmas de Gran Canaria

## Descripción

Este repositorio contiene los materiales, prácticas y proyectos desarrollados para la asignatura de Virtualización y Procesamiento Distribuido. La asignatura aborda los fundamentos y técnicas avanzadas de virtualización de sistemas, así como paradigmas de procesamiento distribuido, con un enfoque práctico orientado a la implementación y gestión de entornos virtualizados.

## Objetivos de Aprendizaje

- Comprender los conceptos fundamentales de la virtualización de sistemas
- Implementar y gestionar entornos virtualizados utilizando diferentes tecnologías
- Analizar las arquitecturas de procesamiento distribuido
- Diseñar soluciones basadas en virtualización para problemas complejos
- Aplicar buenas prácticas de seguridad y optimización en entornos virtualizados

## Contenido Teórico

En esta asignatura se desarrollan competencias específicas relacionadas con infraestructuras de los sistemas de información, centrándose en la capacidad para seleccionar, diseñar, desplegar, integrar y gestionar infraestructuras de comunicaciones, de cómputo y almacenamiento en una organización.

**Objetivos**

Adquirir los conocimientos básicos para:

- Analizar, comparar y seleccionar distintas **infraestructuras de comunicaciones** atendiendo a criterios tecnológicos y económicos.

- Analizar, comparar y seleccionar **productos tecnológicos para la virtualización**, atendiendo a criterios tecnológicos y económicos.

- Instalar y configurar **plataformas de virtualización**.

- Analizar, comparar y seleccionar **productos tecnológicos que proporcionen alta disponibilidad de cómputo** al sistema de información, atendiendo a criterios tecnológicos y económicos.

- Instalar y configurar plataformas de **alta disponibilidad de cómputo**.

- Analizar, comparar y seleccionar **productos tecnológicos que proporcionen alta disponibilidad de datos** al sistema de información, atendiendo a criterios tecnológicos y económicos.

_Esta sección se completará a medida que avance el curso con resúmenes de los temas teóricos abordados._

### 1. Fundamentos y tecnologías de virtualización

En este módulo se abordan los conceptos fundamentales de la virtualización y se profundiza en el funcionamiento del sistema KVM. Se divide en dos temas principales:

#### [Tema 1.1: Fundamentos y tecnologías de virtualización](Tema_1_1_fundamentos_y_tecnologias_de_virtualizacion.md)

Este tema introduce los conceptos esenciales de la virtualización, incluyendo:

- Definición, utilidad e inconvenientes de la virtualización
- Conceptos básicos: anfitrión, huésped, hipervisor
- Evolución histórica de la virtualización
- Tipos de virtualización (recursos, plataforma)
- Clasificación de hipervisores (Tipo I y Tipo II)
- Comparativa entre diferentes enfoques de virtualización

El estudio de este contenido permite comprender los fundamentos teóricos necesarios para abordar las implementaciones prácticas de entornos virtualizados.

#### [Tema 1.2: El sistema anfitrión y anatomía de la máquina virtual en KVM](Tema_1_2_el_sistema_anfitrion_y_anatomia_de_la_mv_en_kvm.md)

Este tema se centra en la arquitectura y funcionamiento de KVM, cubriendo:

- Componentes principales de KVM (módulos del kernel, QEMU, libvirt)
- Funcionalidades y limitaciones del sistema
- Interfaz de virtualización y archivos de configuración XML
- Recursos de las máquinas virtuales (CPU, memoria, dispositivos)
- Gestión del almacenamiento virtualizado
- Infraestructura de red virtual (switch virtual, NAT, puentes)

El dominio de estos conceptos resulta fundamental para la correcta implementación y administración de las prácticas basadas en KVM que se desarrollan en la asignatura.

### 2. Recursos Almacenamiento Virtual KVM

Este módulo aborda la gestión de almacenamiento virtual en entornos KVM, fundamentado en dos conceptos principales:

- **Contenedores de almacenamiento (storage pools)**: Abstracción de un espacio de almacenamiento en el que se crean volúmenes virtuales. Pueden implementarse sobre diferentes tecnologías:

  - Directorios del sistema de archivos (`dir`)
  - Sistemas de archivos (`fs`): ext4, xfs, btrfs, etc.
  - Volúmenes lógicos LVM (`logical`)
  - Sistemas de archivos de red NFS (`netfs`)
  - Discos físicos (`disk`)
  - Unidades iSCSI (`iscsi`)
  - Dispositivos SCSI (`scsi`)

- **Volúmenes**: Unidades de almacenamiento creadas dentro de un contenedor que se asignan a las máquinas virtuales como discos virtuales.

**Ciclo de vida de un contenedor de almacenamiento**:

1. Definición (mediante XML o parámetros)
2. Creación de la estructura física
3. Puesta en marcha (activación)
4. Monitorización y uso
5. Eliminación cuando ya no se necesita

**Cheatsheet de comandos de almacenamiento KVM**:

```bash
# === GESTIÓN DE CONTENEDORES (STORAGE POOLS) ===

# Definir un contenedor
virsh pool-define-as nombre_pool tipo [opciones]
virsh pool-define-as virtimages dir --target /var/lib/libvirt/images
virsh pool-define-as datadisk fs --source-dev /dev/sdb1 --target /mnt/data
virsh pool-define-as nfsstorage netfs --source-host nfs.server --source-path /exports --target /mnt/nfs

# Construir la estructura física del contenedor
virsh pool-build nombre_pool

# Iniciar y configurar autoarranque
virsh pool-start nombre_pool
virsh pool-autostart nombre_pool

# Listar contenedores y ver información
virsh pool-list --all --details
virsh pool-info nombre_pool
virsh pool-dumpxml nombre_pool

# Detener y eliminar contenedor
virsh pool-destroy nombre_pool    # Desactiva el pool
virsh pool-delete nombre_pool     # Elimina la estructura física
virsh pool-undefine nombre_pool   # Elimina la definición

# === GESTIÓN DE VOLÚMENES ===

# Crear volúmenes
virsh vol-create-as nombre_pool nombre_vol 10G --format qcow2
dd if=/dev/zero of=/ruta/al/volumen.img bs=1M count=4096

# Listar y ver información de volúmenes
virsh vol-list nombre_pool
virsh vol-info nombre_vol --pool nombre_pool
virsh vol-dumpxml nombre_vol --pool nombre_pool

# Clonar volúmenes
virsh vol-clone --pool nombre_pool vol_origen vol_destino

# Eliminar volúmenes
virsh vol-delete nombre_vol --pool nombre_pool

# === CONECTAR ALMACENAMIENTO A MÁQUINAS VIRTUALES ===

# Conectar volumen/disco a VM (método directo)
virsh attach-disk nombre_vm /ruta/archivo.img vdb --config
virsh attach-disk nombre_vm /dev/sdc vdc --config

# Conectar volumen/disco a VM (mediante XML)
virsh attach-device --config nombre_vm archivo_definicion.xml

# Listar discos de una VM
virsh domblklist nombre_vm --details
```

Los aspectos fundamentales de este módulo incluyen la comprensión de los diferentes tipos de almacenamiento disponibles, el ciclo de vida completo de los recursos de almacenamiento, y cómo estos recursos pueden ser integrados en las máquinas virtuales para proporcionar diferentes funcionalidades como discos adicionales, acceso a medios extraíbles o almacenamiento compartido.

### 3. Recursos de red en KVM

La virtualización en KVM proporciona mecanismos robustos para la gestión de redes virtuales, permitiendo conectar las máquinas virtuales entre sí y con redes externas. Los conceptos clave incluyen:

- **Componentes de Red Virtualizables**: KVM, a través de libvirt, permite virtualizar controladores de interfaz de red (NICs), switches virtuales y bridges. Soporta protocolos estándar como DHCP, TCP/IP y NAT.

- **Switch Virtual (Red Virtual)**:

  - Representa una red virtual a la que se conectan las máquinas virtuales y el anfitrión.
  - El sistema anfitrión gestiona la comunicación entre redes virtuales y con el exterior, actuando como enrutador.
  - En Linux, cada switch virtual se manifiesta como una interfaz de red (por ejemplo, `virbr0` es la interfaz para la red NAT por defecto llamada "default").
  - **Ciclo de Vida**: Se gestionan con comandos `virsh` como `net-define` (crear desde XML), `net-start` (activar), `net-autostart` (activar al inicio), `net-destroy` (desactivar) y `net-undefine` (eliminar definición).

- **Modos de Operación del Switch Virtual**:

  - **Red NAT (Network Address Translation)**:
    - Las MVs obtienen direcciones IP privadas.
    - El anfitrión realiza NAT para permitir que las MVs accedan a redes externas.
    - Para conexiones entrantes desde el exterior hacia una MV, se requiere configurar el desvío de puertos explícitamente (DNAT) en el anfitrión.
    - Ejemplo de configuración XML para una red NAT:
      ```xml
      <network>
        <name>mi_red_nat</name>
        <forward mode='nat'>
          <nat>
            <port start='1024' end='65535'/>
          </nat>
        </forward>
        <bridge name='virbr1' stp='on' delay='0'/>
        <ip address='192.168.150.1' netmask='255.255.255.0'>
          <dhcp>
            <range start='192.168.150.100' end='192.168.150.200'/>
          </dhcp>
        </ip>
      </network>
      ```
  - **Red Enrutada (Routed Network)**:
    - Las MVs utilizan direcciones IP "reales" o enrutables en la red externa.
    - El anfitrión actúa como un enrutador, permitiendo el tráfico bidireccional entre las MVs y la red externa sin NAT.
    - Requiere configuración de enrutamiento adecuada y reglas de cortafuegos para permitir el flujo de paquetes.
  - **Red Aislada (Isolated Network)**:
    - Las MVs pueden comunicarse entre sí y con el anfitrión dentro de esta red.
    - No hay conectividad con redes externas al switch virtual aislado.
    - Útil para entornos de prueba o para segmentos de red que deben estar completamente separados.
    - Ejemplo de configuración XML para una red aislada:
      ```xml
      <network>
        <name>mi_red_aislada</name>
        <bridge name='virbr2' stp='on' delay='0'/>
        <ip address='10.0.0.1' netmask='255.255.255.0'>
          <dhcp>
            <range start='10.0.0.10' end='10.0.0.20'/>
          </dhcp>
        </ip>
      </network>
      ```

- **Interfaz en Modo Bridge (Puente de Red)**:
  - Permite conectar las máquinas virtuales directamente a la misma red local (LAN) que el sistema anfitrión.
  - Se crea un dispositivo de puente (bridge) en el anfitrión (ej. `br0`).
  - La interfaz de red física del anfitrión (ej. `eth0`) se asocia a este bridge, perdiendo su configuración IP directa.
  - Las interfaces virtuales de las MVs se conectan al bridge.
  - Como resultado, las MVs obtienen direcciones IP de la misma subred que el anfitrión y otros dispositivos en la LAN, apareciendo como nodos independientes en la red física.
  - La configuración se realiza a nivel del sistema operativo anfitrión, modificando los scripts de configuración de red.

La correcta elección y configuración de estos recursos de red es fundamental para la funcionalidad, seguridad y rendimiento de los entornos virtualizados con KVM.

### 4. Almacenamiento Distribuido

Los sistemas de almacenamiento distribuido constituyen una infraestructura fundamental que permite el acceso compartido de múltiples sistemas al recurso de almacenamiento de un sistema de información. Este módulo explora:

- **Conceptos fundamentales**: Definición, características y taxonomía de sistemas DSN (Distributed Storage Network).
- **Evolución histórica**: Desde los mainframes de los 60s hasta las soluciones modernas de almacenamiento en la nube y sistemas definidos por software (SDS).

- **Redes de almacenamiento**: Arquitecturas SAN (Storage Area Network) y NAS (Network Attached Storage), con sus topologías características:

  - Topologías punto a punto
  - Bucle arbitrado (Fibre Channel Arbitrated Loop)
  - Fabric (basada en switches)

- **Protocolos y tecnologías de acceso**:

  - Consideraciones de niveles OSI para comunicación en sistemas distribuidos
  - Técnicas de redundancia y optimización: RAID (niveles 0-6 y combinaciones) y mirroring

- **Almacenamiento iSCSI**: Protocolo que encapsula comandos SCSI sobre TCP/IP, permitiendo construir SANs sobre infraestructura Ethernet estándar:
  - Arquitectura de nodos target (servidores) e initiator (clientes)
  - Proceso de login, autenticación y establecimiento de sesiones
  - Estructura de PDUs (Protocol Data Units) para comandos y datos
  - Mecanismos de seguridad: autenticación in-band e IPSec

La implementación de sistemas de almacenamiento distribuido ofrece beneficios críticos como mayor disponibilidad de datos, acceso compartido eficiente, independencia de tecnologías específicas, y en implementaciones modernas, características avanzadas como replicación geográfica, autoescalado y reparación automática de fallos.

### 5. Computación en Clúster

La computación en clúster constituye un enfoque fundamental para el procesamiento distribuido, proporcionando escalabilidad, disponibilidad y flexibilidad en entornos de TI modernos. Este módulo explora:

- **Conceptos fundamentales**: Definición de clúster como un conjunto de nodos independientes que trabajan coordinadamente para proporcionar una Imagen Única del Sistema (SSI), aumentando la capacidad de procesamiento y la tolerancia a fallos.

- **Tipos de clústeres según su objetivo**:

  - **Alto rendimiento (HPC)**: Orientados a maximizar la capacidad computacional para cálculos intensivos.
  - **Alta disponibilidad (HA)**: Diseñados para garantizar la continuidad operativa de servicios críticos.
  - **Almacenamiento distribuido**: Enfocados en proporcionar acceso compartido a datos.
  - **Balanceo de carga**: Distribuyen solicitudes entre múltiples nodos para optimizar rendimiento.

- **Arquitectura y componentes**:

  - **Nodos**: Servidores físicos o virtuales que conforman el clúster.
  - **Interconexión de red**: Tecnologías como Ethernet, Infiniband o Myrinet que proporcionan la comunicación entre nodos.
  - **Middleware**: Software que coordina los recursos distribuidos y proporciona la imagen única del sistema.
  - **Sistema de planificación de recursos (RMS)**: Componentes encargados de la distribución eficiente de tareas.

- **Red Hat Enterprise High Availability Add-On**:

  - **Pacemaker**: Gestor de recursos del clúster que controla los servicios y garantiza su disponibilidad.
  - **Corosync**: Proporciona la infraestructura de comunicación entre nodos y gestiona la membresía del clúster.
  - **STONITH (Shoot The Other Node In The Head)**: Mecanismo de aislamiento (fencing) que previene la corrupción de datos al desconectar nodos problemáticos.
  - **Recursos y restricciones**: Abstracción de servicios gestionados por el clúster con reglas sobre su localización, orden y colocación.

- **Algoritmos de sincronización distribuida**:
  - **Basados en testigo (token)**: Enfoques como Martin, Naimi-Tréhel y Suzuki-Kasami que coordinan el acceso a secciones críticas mediante el paso de un token único.
  - **Basados en permisos**: Requieren la aprobación explícita de otros nodos para acceder a recursos compartidos.
  - **Técnicas para grandes configuraciones**: Estrategias jerárquicas y basadas en prioridad para clusters con miles de nodos o geográficamente dispersos.

La implementación de entornos clusterizados permite no solo aumentar el rendimiento de aplicaciones exigentes, sino también proporcionar continuidad de negocio mediante la eliminación de puntos únicos de fallo, capacidades fundamentales para infraestructuras críticas modernas.

### 6. Introducción a la computación en la nube

La computación en la nube representa un paradigma de procesamiento distribuido fundamentado en la abstracción, virtualización e Internet, diseñado para proporcionar recursos computacionales de forma flexible, ágil y medible. Este módulo examina:

- **Definición y objetivos fundamentales**:

  - Provisión de recursos bajo demanda con costes optimizados
  - Escalabilidad y elasticidad dinámica
  - Gestión simplificada y accesible
  - Medición y facturación precisa del consumo
  - Alta fiabilidad y calidad de servicio garantizada

- **Modelos de implementación (NIST)**:

  - **Nube pública**: Recursos proporcionados por proveedores externos a través de Internet (AWS, Azure, GCP)
  - **Nube privada**: Infraestructura exclusiva para una organización, ya sea en sus instalaciones o externamente gestionada
  - **Nube híbrida**: Combinación integrada de nubes públicas y privadas
  - **Nube comunitaria**: Compartida entre organizaciones con intereses comunes
  - **Multicloud**: Utilización de múltiples proveedores de nube del mismo tipo

- **Modelos de servicio (SPI)**:

  - **IaaS (Infrastructure as a Service)**: Proporciona recursos virtualizados (computación, almacenamiento, redes)
    - Usuario típico: administrador de sistemas
    - Ejemplos: Amazon EC2, Google Compute Engine, Azure VMs
  - **PaaS (Platform as a Service)**: Ofrece plataformas de desarrollo y despliegue de aplicaciones
    - Usuario típico: desarrollador
    - Ejemplos: AWS Elastic Beanstalk, Google App Engine, Azure App Service
  - **SaaS (Software as a Service)**: Aplicaciones completas accesibles a través de Internet
    - Usuario típico: usuario final
    - Ejemplos: Microsoft 365, Google Workspace, Salesforce

- **Modelo de nube cúbica (Jericho Forum)**:
  - Proporciona un marco tridimensional para evaluar riesgos y seguridad
  - Dimensiones: Interna/Externa, Propietaria/Subcontratada, Con/Sin perímetro
  - Permite mapear estrategias de implementación en función de los requisitos de control y seguridad

La adopción de la computación en la nube ha transformado radicalmente la forma en que las organizaciones gestionan sus recursos de TI, permitiendo mayor agilidad, reducción de costes operativos y enfoque en la innovación en lugar del mantenimiento de infraestructuras. El entendimiento de estos modelos fundamentales permite seleccionar las arquitecturas óptimas para cada caso de uso específico.

## Prácticas

### Práctica 1: Instalación y Configuración de KVM y Máquinas Virtuales

**Descripción:** Implementación de un entorno de virtualización basado en KVM (Kernel-based Virtual Machine) en Fedora Linux, incluyendo la configuración del sistema anfitrión, verificación de requisitos hardware, instalación de paquetes de virtualización y creación de máquinas virtuales.

**Logros principales:**

- Configuración del sistema anfitrión con SELinux en modo enforcing
- Verificación de extensiones de virtualización en el procesador (AMD-V)
- Instalación de paquetes KVM con interfaz gráfica y en modo headless
- Creación y configuración de una máquina virtual con Fedora Server 41
- Implementación de acceso SSH con autenticación por clave pública

**Recursos:**

- [Documentación completa](P1_Instalacion_KVM_MV/p1.md)
- [Cheatsheet de comandos KVM](P1_Instalacion_KVM_MV/comandos_kvm_cheatsheet.md)

### Práctica 2: Operaciones con máquinas virtuales

**Descripción:** Exploración de diferentes métodos para la gestión de máquinas virtuales en un entorno KVM/QEMU, incluyendo copias de seguridad, clonación mediante distintas herramientas y creación de nuevas máquinas virtuales.

**Logros principales:**

- Creación de copias de seguridad manuales de máquinas virtuales identificando los archivos de configuración XML y las imágenes de disco
- Restauración y creación de nuevas máquinas virtuales a partir de copias de seguridad con ajustes manuales de configuración
- Comparación de diferentes métodos de clonación utilizando herramientas gráficas (virt-manager) y de línea de comandos (virt-clone)
- Creación de máquinas virtuales desde cero mediante virt-install con configuraciones personalizadas
- Validación de la conectividad de red y acceso SSH para todas las máquinas virtuales creadas

**Técnicas aprendidas:**

- Manipulación de archivos XML de definición de máquinas virtuales
- Generación de UUIDs y direcciones MAC únicas para evitar conflictos
- Gestión de permisos y propiedad de archivos para libvirt
- Optimización de la integración host-invitado mediante el agente QEMU
- Configuración de acceso remoto seguro en las máquinas virtuales

**Recursos:**

- [Documentación completa](P2_Operaciones_con_MV_KVM/p2.md)
- [Cheatsheet de comandos KVM](P2_Operaciones_con_MV_KVM/comandos_kvm_operaciones_cheatsheet.md)

### Práctica 3: Recursos de almacenamiento virtual

**Descripción:** Configuración y gestión de diversos tipos de recursos de almacenamiento para máquinas virtuales KVM/QEMU utilizando libvirt. Se explora la creación de volúmenes en pools por defecto, la integración de particiones físicas del host y la configuración de pools de almacenamiento basados en NFS.

**Logros principales:**

- Creación de volúmenes virtuales (`.img`, `.qcow2`) en el pool por defecto y en pools basados en particiones (`fs`).
- Asociación de volúmenes virtuales y particiones físicas a máquinas virtuales como discos (`sda`, `sdb`, `vdb`, `vdc`).
- Configuración de sistemas de archivos (XFS, ext4) y montaje persistente (`/etc/fstab`) dentro de la máquina virtual.
- Creación y gestión de pools de almacenamiento NFS (`netfs`) para imágenes ISO y volúmenes de disco.
- Verificación de la persistencia de las configuraciones y del funcionamiento de los distintos tipos de almacenamiento.

**Cheatsheet:**

```bash
# Crear volumen en pool
virsh vol-create-as [pool_name] [vol_name] [size]G --format [raw|qcow2]

# Listar volúmenes en pool
virsh vol-list [pool_name]

# Asociar disco a VM
virsh attach-disk [vm_name] [source_path] [target_device] --config [--driver qemu --subdriver raw|qcow2] [--targetbus virtio]

# Desasociar disco de VM
virsh detach-disk [vm_name] [target_device] --config

# Listar discos de VM
virsh domblklist [vm_name] --details

# Definir pool desde archivo XML o parámetros
virsh pool-define [xml_file]
virsh pool-define-as [pool_name] [type] --source-host [host] --source-path [path] --target [local_path] # para netfs
virsh pool-define-as [pool_name] fs --source-dev [device] --target [local_path] # para fs

# Construir pool
virsh pool-build [pool_name]

# Iniciar/Parar pool
virsh pool-start [pool_name]
virsh pool-destroy [pool_name]

# Configurar autostart de pool
virsh pool-autostart [pool_name] [--disable]

# Listar pools
virsh pool-list --all --details

# Ver info de pool/volumen
virsh pool-info [pool_name]
virsh vol-info [vol_name] --pool [pool_name]

# Ver XML de pool/volumen
virsh pool-dumpxml [pool_name]
virsh vol-dumpxml [vol_name] --pool [pool_name]
```

**Recursos:**

- [Documentación completa](P3_Recursos_almacenamiento_virtual/p3.md)
- [Cheatsheet de comandos Storage](P3_Recursos_almacenamiento_virtual/p3_cheatsheet.md)

### Práctica 4: Migración de máquinas virtuales

**Descripción:** Realización de migraciones en vivo (_live migration_) de máquinas virtuales KVM entre diferentes hosts físicos. Esta práctica aborda la configuración de requisitos esenciales como el almacenamiento compartido mediante NFS, la configuración adecuada de nombres de host (FQDN) y las reglas de cortafuegos (_firewalld_) necesarias para permitir la comunicación entre anfitriones.

**Logros principales:**

- Creación de una máquina virtual cuyo disco reside en un pool de almacenamiento compartido NFS (`CONT_VOL_COMP`).
- Configuración de nombres de host FQDN en los hosts origen y destino.
- Ajuste de las reglas de `firewalld` para permitir el tráfico necesario para la migración (`libvirt`, `ssh` y el rango de puertos 49152-49216).
- Generación y distribución de claves SSH para permitir la autenticación sin contraseña entre hosts.
- Ejecución de migraciones en vivo utilizando `virsh migrate` con diferentes opciones (`--live`, `--persistent`, `--undefinesource`).
- Validación del éxito de la migración y verificación del estado de la máquina virtual en el host destino.
- Revocación de los accesos temporales por SSH como buena práctica de seguridad.

**Conceptos clave:**

- **Migración en vivo**: Proceso de mover una VM en ejecución entre hosts sin interrupción perceptible.
- **Almacenamiento compartido**: Requisito fundamental para la migración, permitiendo a ambos hosts acceder al disco de la VM.
- **Configuración de red para migración**: Necesidad de FQDN, resolución DNS/hosts y reglas de cortafuegos específicas.
- **Autenticación SSH sin contraseña**: Facilita la automatización y mejora la seguridad del proceso de migración.
- **Parámetros de `virsh migrate`**: Comprensión de las diferentes opciones para controlar el comportamiento de la migración.

**Comandos principales:**

```bash
# Verificar pool NFS
virsh pool-info CONT_VOL_COMP

# Clonar VM a pool compartido
virt-clone --original [vm_origen] --name [vm_destino] --file [ruta_nfs_qcow2] --mac [nueva_mac]

# Configurar hostname FQDN
hostnamectl set-hostname [nombre.fqdn.com]

# Configurar firewalld
firewall-cmd --add-service=libvirt --permanent
firewall-cmd --add-port=49152-49216/tcp --permanent
firewall-cmd --add-service=ssh --permanent
firewall-cmd --reload
firewall-cmd --list-all

# Generar y copiar claves SSH
ssh-keygen -t rsa -b 4096
ssh-copy-id root@[host_destino.fqdn.com]

# Realizar migración en vivo
virsh migrate --live [vm_name] qemu+ssh://[host_destino.fqdn.com]/system --verbose [--persistent] [--undefinesource]

# Validar migración
virsh list --all # (en host destino)
virsh dominfo [vm_name] # (en host destino)

# Revocar clave SSH
ssh root@[host_destino.fqdn.com] "sed -i '/$(cat ~/.ssh/id_rsa.pub | cut -d' ' -f2)/d' ~/.ssh/authorized_keys"
```

**Recursos:**

- [Documentación completa](P4_Migracion/p4.md)

### Práctica 5: Infraestructura de red virtual

**Descripción:** Configuración de diferentes tipos de redes virtuales en un entorno KVM/libvirt, incluyendo redes NAT, redes aisladas y conexiones puente (bridge) a la red física del anfitrión. Se prepara una máquina virtual (`mvp5`) sin interfaz de red inicial y se configura el acceso mediante consola serie para realizar las configuraciones de red posteriores.

**Logros principales:**

- Clonación de una VM y eliminación de su interfaz de red inicial.
- Configuración del acceso a la VM mediante consola serie (`virsh console`) modificando la configuración de GRUB.
- Creación de una red virtual de tipo NAT (`Cluster`) con DHCP usando `virsh net-define` y un archivo XML.
- Creación de una red virtual aislada (`Almacenamiento`) sin DHCP usando `virsh net-define` y un archivo XML.
- Adición de interfaces de red (`virtio`) a la VM conectadas a las redes NAT y aislada (`virsh attach-interface`).
- Configuración de las interfaces dentro de la VM usando `nmcli`: una con DHCP (para la red NAT) y otra con IP estática (para la red aislada).
- Creación de una interfaz bridge (`bridge0`) en el host anfitrión y vinculación de la interfaz física (`enp6s0`) a ella usando `nmcli`.
- Adición de una tercera interfaz a la VM conectada directamente al bridge del host, obteniendo una IP de la red física del laboratorio.
- Verificación exhaustiva de la conectividad entre la VM, el host y redes externas a través de las diferentes interfaces.
- Análisis de las configuraciones de red resultantes (bridges `virbrX`, `bridge0`), tablas de enrutamiento y reglas de `iptables`.

**Conceptos clave:**

- **Consola Serie**: Acceso a la VM sin interfaz de red.
- **Redes Virtuales libvirt**: Tipos NAT, Aislada y Puente (Bridge).
- **Switch Virtual**: `virbrX` creados por libvirt.
- **Configuración de Red XML**: Definición declarativa de redes virtuales.
- **Interfaz Bridge en Host**: Conexión directa de VMs a la red física.
- **`nmcli`**: Gestión de la configuración de red en el host y en la VM.
- **`virtio`**: Controladores paravirtualizados para mejor rendimiento de red.

**Comandos principales:**

```bash
# Clonar VM sin red inicial
virt-clone --original mvp1 --name mvp5 --file /var/lib/libvirt/images/mvp5.qcow2
virsh detach-interface mvp5 network --mac [MAC] --config

# Configurar consola serie (dentro de VM)
vi /etc/default/grub # Añadir console=ttyS0 a GRUB_CMDLINE_LINUX
grub2-editenv - unset kernelopts
grub2-mkconfig -o /boot/grub2/grub.cfg
reboot

# Acceder por consola
virsh console mvp5

# Definir/Iniciar/Autostart red virtual
virsh net-define [network.xml]
virsh net-start [network_name]
virsh net-autostart [network_name]

# Añadir interfaz a VM
virsh attach-interface mvp5 [network|bridge] [source_name] --model virtio --config [--mac [MAC]]

# Configurar IP en VM (nmcli)
nmcli connection add type ethernet con-name [ConName] ifname [iface] ipv4.method [auto|manual] [ipv4.addresses IP/Mask]
nmcli connection up [ConName]

# Crear bridge en Host (nmcli)
nmcli con add type bridge con-name bridge0 ifname bridge0
nmcli con mod [physical_iface] master bridge0
nmcli con mod bridge0 ipv4.method [auto|manual] [ipv4.addresses IP/Mask] [ipv4.gateway GW] [ipv4.dns DNS]
nmcli con down [physical_iface] && nmcli con up bridge0

# Verificar redes y interfaces
virsh net-list --all
virsh domiflist mvp5
ip addr show [bridge_name]
ip route
```

**Recursos:**

- [Documentación completa](P5_Intraestructura_red_virtual/p5_temp.md) # Aún en desarrollo

### Práctica 6: Almacenamiento distribuido (almacenamiento iSCSI)

**Descripción:** Implementación de un servicio de almacenamiento distribuido utilizando el protocolo iSCSI (Internet Small Computer System Interface), configurando un nodo exportador (target) y dos nodos importadores (initiators) en un entorno virtualizado KVM/QEMU.

**Logros principales:**

- Creación de una infraestructura de tres máquinas virtuales interconectadas mediante dos redes virtuales: una red dedicada al tráfico iSCSI (10.22.122.0/24) y otra para comunicación general (192.168.140.0/24).
- Instalación y configuración del software target iSCSI (`targetcli`) en el nodo exportador, incluyendo la apertura del puerto 3260/TCP en el cortafuegos.
- Exportación de dispositivos de almacenamiento de bloque a través de la red utilizando nombres IQN personalizados y control de acceso basado en ACLs.
- Configuración del software initiator iSCSI en los nodos clientes, permitiendo la conexión y uso de dispositivos de almacenamiento remoto.
- Creación de diferentes sistemas de archivos (ext4, XFS) en los dispositivos iSCSI importados.
- Implementación de un volumen lógico (LVM) sobre un dispositivo iSCSI y configuración para su acceso desde múltiples nodos.

**Conceptos clave:**

- **Protocolo iSCSI**: Método para acceder a dispositivos de bloques a través de redes TCP/IP estándar.
- **Target e Initiator**: Roles fundamentales en una implementación iSCSI, donde el target exporta almacenamiento y el initiator lo consume.
- **IQN (iSCSI Qualified Name)**: Identificadores únicos para targets e initiators en formato estándar.
- **ACLs**: Control de acceso para definir qué initiators pueden conectarse a un target específico.
- **LUNs (Logical Unit Numbers)**: Identificadores numéricos para distinguir múltiples dispositivos lógicos exportados.
- **LVM sobre iSCSI**: Implementación de gestión lógica de volúmenes sobre dispositivos de red para mayor flexibilidad.

**Comandos principales:**

```bash
# Configuración del target
targetcli                                # Interfaz interactiva para configurar target iSCSI
systemctl start/enable target            # Control del servicio target
firewall-cmd --add-port=3260/tcp         # Configuración del cortafuegos

# Dentro de targetcli
backstores/block> create name=X dev=/dev/sdX  # Crear objeto de almacenamiento
/iscsi> create wwn=iqn.YYYY-MM.domain:name    # Crear target iSCSI
../portals> create IP_ADDRESS                  # Configurar portal de red
../luns> create /backstores/block/X            # Asociar almacenamiento a LUN
../acls> create wwn=iqn.YYYY-MM.domain:initX   # Crear ACL para initiator

# Configuración del initiator
iscsiadm --mode discovery --type sendtargets --portal TARGET_IP --discover  # Descubrir targets
iscsiadm --mode node --targetname IQN --portal TARGET_IP --login            # Conectar a target
lsblk -o NAME,TRAN,SIZE,TYPE,MOUNTPOINT                                      # Verificar dispositivos
mkfs.ext4 /dev/sdX                                                          # Formatear dispositivo
mount /dev/sdX /mnt                                                         # Montar dispositivo

# Configuración de LVM sobre iSCSI
pvcreate /dev/sdX                        # Crear volumen físico
vgcreate --setautoactivation n ApacheVG /dev/sdX  # Crear grupo de volúmenes
lvcreate -n ApacheLV -L SIZE ApacheVG    # Crear volumen lógico
mkfs.xfs /dev/ApacheVG/ApacheLV          # Formatear con sistema de archivos
```

**Recursos:**

- [Documentación completa](P6_Almacenamiento_distribuido_iSCSI/p6_almacenamiento_iSCSI.md)

### Práctica 7: Diseño y despliegue de un clúster básico

Próximamente...

### Práctica 8 : Trabajo optativo

La práctica 8 constituye un espacio para el desarrollo de trabajos optativos que profundizan en tecnologías específicas relacionadas con la virtualización y el procesamiento distribuido. Estos trabajos permiten aplicar los conocimientos adquiridos en un contexto más especializado y autónomo.

#### Trabajo 8.1: Implementación de Agregación de Enlaces (Network Bonding)

**Descripción:** Implementación y validación de la tecnología de agregación de enlaces de red (Network Bonding) en entornos virtualizados KVM, evaluando diferentes modos de operación y analizando su comportamiento en términos de disponibilidad y rendimiento.

**Logros principales:**

- Creación de una infraestructura virtualizada con múltiples interfaces de red para pruebas de agregación
- Configuración y validación del modo active-backup para escenarios de alta disponibilidad
- Implementación del modo balance-rr para distribución de carga entre múltiples interfaces
- Evaluación comparativa del rendimiento utilizando iperf3 y análisis de los resultados obtenidos
- Documentación de soluciones a problemas comunes en la implementación de bonding en entornos virtuales

**Aspectos técnicos:**

- **Módulo del kernel**: La implementación utiliza el módulo `bonding` nativo de Linux, responsable de la gestión de interfaces agregadas
- **Modos implementados**:
  - **Mode 1 (active-backup)**: Una interfaz permanece activa mientras las demás están en espera. Proporciona redundancia con tiempo de conmutación inferior a 100ms
  - **Mode 0 (balance-rr)**: Distribución Round-Robin de paquetes entre todas las interfaces. Teóricamente incrementa el ancho de banda agregado
- **Monitorización de enlaces**: Uso del parámetro `miimon=100` para detectar fallos en interfaces cada 100ms
- **Resultados de rendimiento**: Análisis comparativo muestra un rendimiento de 23.7 Gbits/sec en modo active-backup vs 20.6 Gbits/sec en modo balance-rr en el entorno virtualizado

**Comandos principales:**

```bash
# Crear máquina virtual con tres interfaces
virt-install --name Bond --vcpus 1 --memory 2048 --disk size=10 \
  --network network=default,model=virtio \
  --network network=default,model=virtio \
  --network network=default,model=virtio

# Carga del módulo bonding
modprobe bonding
echo "bonding" > /etc/modules-load.d/bonding.conf

# Crear interfaz bond con NetworkManager
nmcli connection add type bond con-name bond0 ifname bond0 \
  bond.options "mode=active-backup,miimon=100"

# Agregar interfaces al bond
nmcli connection add type ethernet port-type bond controller bond0 \
  con-name enp1s0-port ifname enp1s0

# Cambiar modo de operación
nmcli connection modify bond0 bond.options "mode=balance-rr,miimon=100"
nmcli connection down bond0 && nmcli connection up bond0

# Verificar configuración
cat /proc/net/bonding/bond0

# Simular fallo para prueba de alta disponibilidad
ip link set enp1s0 down

# Pruebas de rendimiento
iperf3 -c 192.168.122.1 -P 3 -t 30
```

**Conceptos clave:**

- Redundancia y tolerancia a fallos en infraestructuras de red virtualizadas
- Algoritmos de distribución de carga en múltiples interfaces
- Monitorización y recuperación automática ante fallos de enlace
- Consideraciones específicas para implementaciones de bonding en entornos KVM

**Recursos:**

- [Documentación completa](P8_Trabajo_optativo/p8_1.md)

## Seguridad en Sistemas Anfitriones KVM

El documento [Principios básicos de seguridad en sistemas anfitriones KVM Red Hat](Tema_0_1_Principios_basicos_de_seguridad%20en_sistemas_anfitriones_KVM_Red_Hat.md) proporciona las directrices fundamentales para garantizar entornos virtualizados seguros, abordando:

- **Recomendaciones generales de seguridad**: Configuración adecuada de SELinux, activación de cortafuegos, gestión de usuarios y políticas de almacenamiento seguro de imágenes.

- **SELinux y virtualización**: Implementación del mecanismo sVirt para aislar las máquinas virtuales entre sí y del sistema anfitrión:

  - Control de acceso basado en tipo (Type Enforcement - TE)
  - Seguridad Multinivel (Multi-Level Security - MLS)
  - Etiquetas sVirt asignadas dinámicamente (contextos como `svirt_t`, `svirt_image_t`)
  - Variables booleanas clave (`virt_use_nfs`, `virt_use_samba`, etc.)

- **Configuración de cortafuegos**: Puertos y servicios esenciales para el funcionamiento de entornos KVM:
  - Puerto 22 (SSH) para administración remota
  - Puertos 5634-6166 para consolas SPICE
  - Puertos 49152-49216 para migraciones de máquinas virtuales
  - Habilitación de IP forwarding para bridges virtuales

Este modelo de seguridad en capas (SELinux + cortafuegos) mitiga los riesgos específicos de la virtualización, como el escape de máquinas virtuales o los ataques entre VMs, manteniendo la flexibilidad necesaria para entornos de producción.

## Herramientas y Tecnologías

- **Sistemas Operativos:** Fedora Linux
- **Virtualización:** KVM, QEMU, libvirt
- **Herramientas de Gestión:** virt-manager, virsh
- **Redes:** Configuración de redes virtuales, NAT, SSH
- **Seguridad:** SELinux, autenticación por clave pública

## Recursos Adicionales

- [Documentación oficial de KVM](https://www.linux-kvm.org/page/Documents)
- [Documentación de Fedora sobre virtualización](https://docs.fedoraproject.org/en-US/quick-docs/virtualization-getting-started/)
- [Libvirt Wiki](https://wiki.libvirt.org/)
- [SELinux Project Wiki](https://selinuxproject.org/page/Main_Page)

## Documentación de Firewalld

El documento **Tema_Firewalld.md** proporciona una visión general de **firewalld**, la herramienta predeterminada de gestión de cortafuegos en CentOS 7 y Fedora 20+. Cubre aspectos clave como:

- **Introducción**: Pasos de instalación, verificación de estado y una explicación de firewalld como interfaz dinámica para iptables.
- **Zonas**: Descripciones detalladas de zonas predeterminadas y personalizadas (por ejemplo, `drop`, `block`, `public`, `external`, `internal`, `work`, `home`, `dmz` y `trusted`), y su papel en la gestión del tráfico de red.
- **Gestión de Servicios**: Cómo firewalld utiliza servicios para aplicar reglas predefinidas para operaciones de red.
- **Gestión de Puertos**: Comandos para abrir, cerrar y redirigir puertos, incluyendo la configuración de rangos de puertos y reglas de reenvío.
- **Configuración**: Diferenciación entre configuraciones en tiempo de ejecución y permanentes, y el uso de archivos XML para configuraciones persistentes.
- **Comandos Adicionales**: Otras operaciones útiles como habilitar el modo pánico y recargar configuraciones.

Para instrucciones y ejemplos más detallados, consulte la [documentación de Firewalld](Tema_Firewalld.md).

## Normas de Entrega

- Toda la documentación debe seguir las [reglas de documentación académica](academic-documentation-rules.md)
- Las prácticas deben entregarse antes de la fecha límite especificada
- Se valorará la claridad, precisión técnica y reproducibilidad de las implementaciones

## Bibliografía

**Básica**

1. Wolf, Chris & Halter, Erick M. (2005). _Virtualization: From the Desktop to the Enterprise_. Apress. ISBN: 13-978-159059-495-7

2. Portnoy, Matthew (2012). _Virtualization Essentials_. John Wiley & Sons. ISBN: 978-1-118-17671-9

3. Jepsen, Thomas C. (2003). _Distributed Storage Networks: Architecture, Protocols and Management_. John Wiley & Sons, Ltd. ISBN: 0-470-85020-5

**Recomendada** 4. Sosinsky, Barrie (2011). _Cloud Computing Bible_. Wiley. ISBN: 978-0-470-90356-8

5. Sosinsky, Barrie (2011). _¿Qué es la nube? El futuro de los sistemas de información_. Anaya. ISBN: 978-8-441-53024-9

6. Magoulès, Frederic (2010). _Fundamentals of Grid Computing: Theory, Algorithms and Technologies_. CRC Press. ISBN: 978-1-4398-0367-7

7. Buyya, Rajkumar (1999). _High Performance Cluster Computing_. Prentice Hall. ISBN: 10: 0130137855

8. Magoules, Frédéric et al. (2009). _Introduction to Grid Computing_. CRC Press. ISBN: 978-1-4200-7406-2

9. Red Hat Enterprise Linux 7. _RedHatEnterpriseLinux7.VirtualizationSecurityGuide_. Red Hat, 2019.

10. Red Hat Enterprise Linux 7. _Virtualization Getting Started Guide_. Red Hat, 2020.

11. Red Hat Enterprise Linux 7. _VirtualizationDeploymentandAdministrationGuide_. Red Hat, 2020.

12. Red Hat Enterprise Linux 7. _NetworkingGuide_. Red Hat, 2020.

13. Red Hat Enterprise Linux 7. _Storage Administration Guide_. Red Hat, 2020.

14. Red Hat Enterprise Linux 7. _Security Guide_. Red Hat, 2020.

15. Red Hat Enterprise Linux 7. _SystemAdministrationGuide_. Red Hat, 2019.

16. Red Hat Enterprise Linux 7. _Configuring and managing virtualization_. Red Hat, 2020.

17. Red Hat Enterprise Linux 7. _Global File System 2_. Red Hat, 2020.

18. Red Hat Enterprise Linux 7. _High Availability Add-On Overview_. Red Hat, 2020.

19. Red Hat Enterprise Linux 7. _High Availability Add-On Administration_. Red Hat, 2020.

---

_Última actualización: [Domingo 2 de Marzo de 2025]_
