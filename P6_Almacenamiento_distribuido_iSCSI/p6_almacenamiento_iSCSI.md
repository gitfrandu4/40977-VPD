# Práctica 6: Instalación de un servicio de almacenamiento iSCSI

## Tabla de Contenidos

- [1. Introducción](#1-introducción)
- [2. Requisitos previos](#2-requisitos-previos)
- [3. Plan de actividades y orientaciones](#3-plan-de-actividades-y-orientaciones)
  - [Tarea 1: Creación de la infraestructura básica iSCSI](#tarea-1-creación-de-la-infraestructura-básica-iscsi)
  - [Tarea 2: Instalación y configuración de servicio iSCSI en el nodo target](#tarea-2-instalación-y-configuración-de-servicio-iscsi-en-el-nodo-target)
  - [Tarea 3: Instalación del soporte iSCSI en los nodos initiator](#tarea-3-instalación-del-soporte-iscsi-en-los-nodos-initiator)
  - [Tarea 4: Creación de sistema de archivos tipo ext4 en la unidad iSCSI importada](#tarea-4-creación-de-sistema-de-archivos-tipo-ext4-en-la-unidad-iscsi-importada)
  - [Tarea 5: Exportación del segundo disco iSCSI y creación de un volumen lógico](#tarea-5-exportación-del-segundo-disco-iscsi-y-creación-de-un-volumen-lógico)
- [4. Pruebas y Validación](#4-pruebas-y-validación)
- [5. Conclusiones](#5-conclusiones)
- [6. Bibliografía](#6-bibliografía)

## 1. Introducción

## 2. Requisitos previos

## 3. Plan de actividades y orientaciones

### Tarea 1: Creación de la infraestructura básica iSCSI

```bash
root@lq-d25:~# virt-clone --original mvp1 --name Almacenamiento --file /var/lib/libvirt/images/Almacenamiento.qcow2 --mac 00:16:3e:76:57:a0
Allocating 'Almacenamiento.qcow2'                           | 1.6 GB  00:00 ... 

El clon 'Almacenamiento' ha sido creado exitosamente.
```

```bash
root@lq-d25:~# virt-clone --original mvp1 --name Nodo1 --file /var/lib/libvirt/images/Nodo1.qcow2 --mac 00:16:3e:2a:bc:c9
Allocating 'Nodo1.qcow2'                                    | 1.6 GB  00:00 ... 

El clon 'Nodo1' ha sido creado exitosamente.
```

```bash
root@lq-d25:~# virt-clone --original mvp1 --name Nodo2 --file /var/lib/libvirt/images/Nodo2.qcow2 --mac 00:16:3e:35:90:9c
Allocating 'Nodo2.qcow2'                                    | 1.5 GB  00:00 ... 

El clon 'Nodo2' ha sido creado exitosamente.
```

#### Configuración del nodo Almacenamiento (target)

```bash
# Eliminar el dispositivo lector de CD-ROM del bus ATA
virsh detach-disk Almacenamiento sda --persistent

# Eliminar la interfaz de red por defecto para reconfigurarla 
virsh detach-interface Almacenamiento --type network --mac <MAC_INTERFAZ_POR_DEFECTO> --persistent

# Crear los volúmenes de almacenamiento adicionales
virsh vol-create-as default vol1_p6.qcow2 1G --format qcow2
virsh vol-create-as default vol2_p6.img 1G --format raw

# Añadir los nuevos volúmenes a la máquina virtual
virsh attach-disk Almacenamiento /var/lib/libvirt/images/vol1_p6.qcow2 sda --driver qemu --type disk --subdriver qcow2 --persistent
virsh attach-disk Almacenamiento /var/lib/libvirt/images/vol2_p6.img sdb --driver qemu --type disk --subdriver raw --persistent

# Añadir las interfaces de red paravirtualizadas
virsh attach-interface Almacenamiento --type network --source Almacenamiento --model virtio --persistent
virsh attach-interface Almacenamiento --type network --source Cluster --model virtio --persistent
```

**Explicación del comando**:

- `comando`: Descripción general del comando
- `--opcion`: Explicación de este parámetro específico

#### Configuración de interfaces de red en el nodo Almacenamiento

```bash
# Iniciar la máquina Almacenamiento
virsh start Almacenamiento

# Configurar el nombre del host
virsh console Almacenamiento
# En la consola ejecutar:
hostnamectl set-hostname almacenamiento.vpd.com

# Configurar la primera interfaz (red Almacenamiento) con IP estática
nmcli con add type ethernet con-name ens7 ifname ens7 ipv4.method manual ipv4.addresses 10.22.122.10/24

# Activar la conexión de la primera interfaz
nmcli con up ens7

# Configurar la segunda interfaz (red Cluster) con DHCP
nmcli con add type ethernet con-name ens8 ifname ens8 ipv4.method auto

# Activar la conexión de la segunda interfaz
nmcli con up ens8
```

**Explicación del comando**:

- `comando`: Descripción general del comando
- `--opcion`: Explicación de este parámetro específico

#### Configuración de nodos initiator (Nodo1 y Nodo2)

```bash
# Configuración para Nodo1
# Eliminar el dispositivo lector de CD-ROM del bus SATA
virsh detach-disk Nodo1 sda --persistent

# Eliminar la interfaz de red por defecto
virsh detach-interface Nodo1 --type network --mac <MAC_INTERFAZ_POR_DEFECTO> --persistent

# Añadir interfaces de red paravirtualizadas
virsh attach-interface Nodo1 --type network --source Almacenamiento --model virtio --persistent
virsh attach-interface Nodo1 --type network --source Cluster --model virtio --persistent

# Configuración para Nodo2
# Eliminar el dispositivo lector de CD-ROM del bus SATA
virsh detach-disk Nodo2 sda --persistent

# Eliminar la interfaz de red por defecto
virsh detach-interface Nodo2 --type network --mac <MAC_INTERFAZ_POR_DEFECTO> --persistent

# Añadir interfaces de red paravirtualizadas
virsh attach-interface Nodo2 --type network --source Almacenamiento --model virtio --persistent
virsh attach-interface Nodo2 --type network --source Cluster --model virtio --persistent
```

#### Configuración de red en los nodos initiator

```bash
# Iniciar Nodo1
virsh start Nodo1
virsh console Nodo1

# En la consola de Nodo1 ejecutar:
hostnamectl set-hostname nodo1.vpd.com

# Configurar la primera interfaz (red Almacenamiento) con IP estática
nmcli con add type ethernet con-name ens7 ifname ens7 ipv4.method manual ipv4.addresses 10.22.122.11/24

# Activar la conexión de la primera interfaz
nmcli con up ens7

# Configurar la segunda interfaz (red Cluster) con DHCP
nmcli con add type ethernet con-name ens8 ifname ens8 ipv4.method auto

# Activar la conexión de la segunda interfaz
nmcli con up ens8

# Iniciar Nodo2
virsh start Nodo2
virsh console Nodo2

# En la consola de Nodo2 ejecutar:
hostnamectl set-hostname nodo2.vpd.com

# Configurar la primera interfaz (red Almacenamiento) con IP estática
nmcli con add type ethernet con-name ens7 ifname ens7 ipv4.method manual ipv4.addresses 10.22.122.12/24

# Activar la conexión de la primera interfaz
nmcli con up ens7

# Configurar la segunda interfaz (red Cluster) con DHCP
nmcli con add type ethernet con-name ens8 ifname ens8 ipv4.method auto

# Activar la conexión de la segunda interfaz
nmcli con up ens8
```

**Explicación del comando**:

- `comando`: Descripción general del comando
- `--opcion`: Explicación de este parámetro específico

### Tarea 2: Instalación y configuración de servicio iSCSI en el nodo target

#### Paso 1: Verificación de configuraciones

```bash
# Comandos utilizados para verificar configuraciones
```

#### Paso 2: Instalación del software iSCSI en el nodo target

```bash
# Comandos utilizados para instalar el software
```

#### Paso 3: Inicio del servicio target

```bash
# Comandos utilizados para iniciar el servicio
```

#### Paso 4: Configuración del arranque automático

```bash
# Comandos utilizados para configurar el arranque automático
```

#### Paso 5: Configuración del cortafuegos

```bash
# Comandos utilizados para configurar el cortafuegos
```

#### Paso 6: Configuración del recurso de almacenamiento a exportar

```bash
# Comandos utilizados para configurar el recurso de almacenamiento
```

### Tarea 3: Instalación del soporte iSCSI en los nodos initiator

#### Paso 1: Instalación del software del cliente iSCSI

```bash
# Comandos utilizados para instalar el software
```

#### Paso 2: Ejecución del servicio iscsid

```bash
# Comandos utilizados para ejecutar el servicio
```

#### Paso 3: Configuración del nombre del nodo

```bash
# Comandos utilizados para configurar el nombre del nodo
```

#### Paso 4: Descubrimiento de LUNs exportados

```bash
# Comandos utilizados para descubrir los LUNs
```

#### Paso 5: Conexión de unidades LUNs

```bash
# Comandos utilizados para conectar las unidades
```

#### Paso 6: Comprobación de la conexión

```bash
# Comandos utilizados para comprobar la conexión
```

### Tarea 4: Creación de sistema de archivos tipo ext4 en la unidad iSCSI importada

```bash
# Comandos utilizados para crear el sistema de archivos
```

### Tarea 5: Exportación del segundo disco iSCSI y creación de un volumen lógico

#### 1. Exportación del disco /dev/sdb desde el nodo target

```bash
# Comandos utilizados para exportar el disco
```

**Explicación del comando**:

- `comando`: Descripción general del comando
- `--opcion`: Explicación de este parámetro específico

#### 2. Comprobación de la exportación en los nodos initiator

```bash
# Comandos utilizados para comprobar la exportación
```

#### 3. Creación del volumen lógico

```bash
# Comandos utilizados para crear el volumen lógico
```

##### I. Creación del volumen físico

```bash
# Comandos utilizados para crear el volumen físico
```

##### II. Creación del grupo de volúmenes ApacheVG

```bash
# Comandos utilizados para crear el grupo de volúmenes
```

##### III. Creación del volumen lógico ApacheLV

```bash
# Comandos utilizados para crear el volumen lógico
```

##### IV. Comprobación del volumen lógico

```bash
# Comandos utilizados para comprobar el volumen lógico
```

##### V. Creación del sistema de archivos XFS

```bash
# Comandos utilizados para crear el sistema de archivos
```

#### 4. Configuración en el segundo nodo initiator

```bash
# Comandos utilizados para configurar el segundo nodo
```

#### 5. Comprobación de activación en ambos nodos

```bash
# Comandos utilizados para comprobar la activación
```

## 4. Pruebas y Validación

### Comprobación del nodo target (Almacenamiento)

```bash
# Comandos utilizados y resultados obtenidos
```

### Comprobación del nodo initiator (Nodo1)

```bash
# Comandos utilizados y resultados obtenidos
```

### Comprobación del nodo initiator (Nodo2)

```bash
# Comandos utilizados y resultados obtenidos
```

## 5. Conclusiones

## 6. Bibliografía

1. Storage Administration Guide. RED HAT ENTERPRISE LINUX 7. Deploying and configuring single-node storage in RHEL. Disponible en: https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/7/html/storage_administration_guide/index [accedido el 02/04/2025]
