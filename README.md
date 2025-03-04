# 40977-VPD: Virtualización y Procesamiento Distribuido

- [40977-VPD: Virtualización y Procesamiento Distribuido](#40977-vpd-virtualización-y-procesamiento-distribuido)
  - [Información de la Asignatura](#información-de-la-asignatura)
  - [Descripción](#descripción)
  - [Objetivos de Aprendizaje](#objetivos-de-aprendizaje)
  - [Contenido Teórico](#contenido-teórico)
    - [1. Fundamentos y tecnologías de virtualización](#1-fundamentos-y-tecnologías-de-virtualización)
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

### Práctica 3: Recursos de almacenamiento virtual

Próximamente...

### Práctica 4: Migración de máquinas virtuales

Próximamente...

### Práctica 5: Infraestructura de red virtual

Próximamente...

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
