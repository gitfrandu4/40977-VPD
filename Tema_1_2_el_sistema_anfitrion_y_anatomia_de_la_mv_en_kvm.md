# 1. El sistema anfitrión y anatomía de la máquina virtual en KVM

## Índice

- [1. El sistema anfitrión y anatomía de la máquina virtual en KVM](#1-el-sistema-anfitrión-y-anatomía-de-la-máquina-virtual-en-kvm)
  - [Índice](#índice)
  - [Objetivos](#objetivos)
  - [1.1. Principales componentes](#11-principales-componentes)
  - [1.2. Funcionalidades principales](#12-funcionalidades-principales)
  - [1.3. Limitaciones](#13-limitaciones)
  - [1.4. La interfaz de virtualización](#14-la-interfaz-de-virtualización)
  - [1.5. Archivos de configuración XML](#15-archivos-de-configuración-xml)
  - [1.6. Recursos de la máquina virtual (MV)](#16-recursos-de-la-máquina-virtual-mv)
  - [1.7. Almacenamiento](#17-almacenamiento)
  - [1.8. Recursos virtuales de red](#18-recursos-virtuales-de-red)
  - [1.9. Bibliografía](#19-bibliografía)

## Objetivos

- Dar una visión general de KVM
  - Sus principales componentes.
  - Sus principales características y funcionalidades.

## 1.1. Principales componentes

- **_Kernel-based Virtual Machine_ (KVM)** es una tecnología de virtualización completa para sistemas anfitriones Linux.
- Su implementación tiene como principales componentes:
  - **Módulos (kVM\*)** que se integran en el núcleo. Estos módulos hacen más eficiente la virtualización. Módulos `kVM` y `kVM-Intel`.
  - **“_Quick Emulator_” (QEMU)** que emula los sistemas invitados. Cada sistema invitado en ejecución da lugar a un proceso en el sistema anfitrión. Procesos con nombre “`qemu-system-x86`”
  - Librería **libvirt** para el manejo del hypervisor:
    - API libvirt.
    - Aplicaciones. Como por ejemplo `virsh`, `virt-manager`, `virt-install`, etc.

**Arquitectura KMV**

<img src="/assets/2025-03-04-22-10-40.png" alt="KVM Architecture" width="600"/>

## 1.2. Funcionalidades principales

- **_CPU and memory Overcommitting_**. Sobrecarga de CPU y memoria.
- **_Kernel Same-page Merging (KSM)_**.Las MVs pueden compartir páginas de memoria.
- En cada sistema operativo invitado se ejecuta un agente (**`qemu-guest-agent`**) que permite al sistema anfitrión controlar a los sistemas operativos invitados.
- Posibilidad de limitar las operaciones E/S de disco (_**Disk I/O throttling**_) en los sistemas huéspedes (orden blkdeviotune de virsh)
- **_Automatic NUMA balancing_**. En sistemas anfitriones con arquitectura NUMA, la asignación de CPUs a tareas se tiene en cuenta las áreas de memoria utilizadas por las tareas.
- **_Virtual CPU_ (VCPU) hot add**. Se puede aumentar el número de CPUs virtuales de una MV, estando ésta en ejecución.
- **Virtualización anidada (_Nested virtualization_)**. En una MV se puede ejecutar KMV para funcionar como un sistema anfitrión.

## 1.3. Limitaciones

## 1.4. La interfaz de virtualización

## 1.5. Archivos de configuración XML

## 1.6. Recursos de la máquina virtual (MV)

## 1.7. Almacenamiento

## 1.8. Recursos virtuales de red

## 1.9. Bibliografía
