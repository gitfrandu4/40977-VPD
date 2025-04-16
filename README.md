# 40977-VPD: Virtualización y Procesamiento Distribuido

- [40977-VPD: Virtualización y Procesamiento Distribuido](#40977-vpd-virtualización-y-procesamiento-distribuido)
  - [Información de la Asignatura](#información-de-la-asignatura)
  - [Descripción](#descripción)
  - [Objetivos de Aprendizaje](#objetivos-de-aprendizaje)
  - [Contenido Teórico](#contenido-teórico)
    - [1. Fundamentos y tecnologías de virtualización](#1-fundamentos-y-tecnologías-de-virtualización)
      - [Tema 1.1: Fundamentos y tecnologías de virtualización](#tema-11-fundamentos-y-tecnologías-de-virtualización)
      - [Tema 1.2: El sistema anfitrión y anatomía de la máquina virtual en KVM](#tema-12-el-sistema-anfitrión-y-anatomía-de-la-máquina-virtual-en-kvm)
    - [2. Infraestructuras y protocolos de comunicación para procesamiento distribuido](#2-infraestructuras-y-protocolos-de-comunicación-para-procesamiento-distribuido)
    - [3. Tecnologías para el almacenamiento distribuido en los sistemas de información](#3-tecnologías-para-el-almacenamiento-distribuido-en-los-sistemas-de-información)
    - [4. Tecnologías para el procesamiento distribuido en los sistemas de información](#4-tecnologías-para-el-procesamiento-distribuido-en-los-sistemas-de-información)
  - [Prácticas](#prácticas)
    - [Práctica 1: Instalación y Configuración de KVM y Máquinas Virtuales](#práctica-1-instalación-y-configuración-de-kvm-y-máquinas-virtuales)
    - [Práctica 2: Operaciones con máquinas virtuales](#práctica-2-operaciones-con-máquinas-virtuales)
    - [Práctica 3: Recursos de almacenamiento virtual](#práctica-3-recursos-de-almacenamiento-virtual)
    - [Práctica 4: Migración de máquinas virtuales](#práctica-4-migración-de-máquinas-virtuales)
    - [Práctica 5: Infraestructura de red virtual](#práctica-5-infraestructura-de-red-virtual)
    - [Práctica 6: Almacenamiento distribuido (almacenamiento iSCSI)](#práctica-6-almacenamiento-distribuido-almacenamiento-iscsi)
    - [Práctica 7: Diseño y despliegue de un clúster básico](#práctica-7-diseño-y-despliegue-de-un-clúster-básico)
    - [Práctica 8 : Trabajo optativo](#práctica-8--trabajo-optativo)
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

### 2. Infraestructuras y protocolos de comunicación para procesamiento distribuido

### 3. Tecnologías para el almacenamiento distribuido en los sistemas de información

### 4. Tecnologías para el procesamiento distribuido en los sistemas de información

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

Próximamente...

### Práctica 7: Diseño y despliegue de un clúster básico

Próximamente...

### Práctica 8 : Trabajo optativo

Próximamente...

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
