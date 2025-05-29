# 2. Almacenamiento en KVM

## Tabla de Contenidos

- [2. Almacenamiento en KVM](#2-almacenamiento-en-kvm)
  - [Tabla de Contenidos](#tabla-de-contenidos)
  - [2.1. Objetivos](#21-objetivos)
  - [2.2. Ciclo de vida de un contenedor de volúmenes (_storage pool_)](#22-ciclo-de-vida-de-un-contenedor-de-volúmenes-storage-pool)
    - [2.2.1. Definición del contenedor de almacenamiento](#221-definición-del-contenedor-de-almacenamiento)
      - [Contenedor asociado a un directorio del sistema](#contenedor-asociado-a-un-directorio-del-sistema)
      - [Contenedor asociado a un sistema de archivos](#contenedor-asociado-a-un-sistema-de-archivos)
      - [Contenedor asociado a un grupo de volúmenes lógicos](#contenedor-asociado-a-un-grupo-de-volúmenes-lógicos)
      - [Contenedor asociado a un sistema de archivos de red (NFS)](#contenedor-asociado-a-un-sistema-de-archivos-de-red-nfs)
      - [Contenedor asociado a un disco](#contenedor-asociado-a-un-disco)
      - [Contenedor asociado a una unidad iSCSI](#contenedor-asociado-a-una-unidad-iscsi)
      - [Contenedor asociado a una unidad SCSI](#contenedor-asociado-a-una-unidad-scsi)
    - [2.2.2. Creación del contenedor de almacenamiento](#222-creación-del-contenedor-de-almacenamiento)
    - [2.2.3. Puesta en marcha del contenedor de almacenamiento](#223-puesta-en-marcha-del-contenedor-de-almacenamiento)
    - [2.2.4. Eliminación del contenedor de almacenamiento](#224-eliminación-del-contenedor-de-almacenamiento)
    - [2.2.5. Monitorización del contenedor de almacenamiento](#225-monitorización-del-contenedor-de-almacenamiento)
  - [2.3. Manejo de volúmenes](#23-manejo-de-volúmenes)

## 2.1. Objetivos

Capacidad para realizar todas las tareas de gestión del almacenamiento en un sistema anfitrión.

- Capacidad de administración de los recursos a utilizar por los sistemas invitados (gestión de la infraestructura de almacenamiento).
- Capacidad de integrar estos recursos en los sistemas invitados (manejo de las configuraciones de los sistemas invitados).

## 2.2. Ciclo de vida de un contenedor de volúmenes (_storage pool_)

Contenedor de almacenamiento (_storage pool_). Abstracción de un espacio de almacenamiento en el que se crearán los volúmenes virtuales de almacenamiento utilizados por las MV.

Se puede crear sobre:

- NFS
- iSCSI
- RBD
- _Sheepdog cluster_
- SCSI
- Volúmenes LVM
- Discos
- Particiones
- Directorios

Su uso no es obligado, pero se justifica por razones de seguridad.

- Aislamiento del espacio utilizado por las MVs.
- Uso de mecanismos específicos de seguridad.

**Ciclo de vida**

1. Definición del contenedor de almacenamiento.
2. Creación del contenedor de almacenamiento.
3. Puesta en marcha/parada del contenedor de almacenamiento.
4. Eliminación del contenedor de almacenamiento.

### 2.2.1. Definición del contenedor de almacenamiento

```bash
virsh pool-define archivo_definicion_contenedor.xml
```

- **Formato XML**:

  - Metadatos generales
  - Elementos del origen
  - Elementos del destino
  - Extensiones

  | Metadatos generales | Elementos del origen | Elementos del destino |
  | ------------------- | -------------------- | --------------------- |
  | name                | device               | path                  |
  | uuid                | dir                  | permissions           |
  | allocation          | adapter              | timestamp             |
  | capacity            | host                 | encryption            |
  | available           | auth                 |                       |
  | source              | name                 |                       |
  | target              | vendor               |                       |
  | permissions         | product              |                       |
  | source_host         |                      |                       |
  | source_host_uuid    |                      |                       |
  | source_host_uuid    |                      |                       |

#### Contenedor asociado a un directorio del sistema

- **Formato XML: Directorio (dir)**:

```bash
# Usando poo-define (requiere formato XML)
virsh pool-define archivo_definicion_contenedor.xml
```

```xml
<pool type='dir'>
  <name>virtimages</name>
  <target>
    <path>/var/lib/libvirt/images</path>
  </target>
</pool>
```

Podemos definir de la misma forma el contenedor de almacenamiento con el comando `virsh pool-define-as` con parámetros:

```bash
# Usando pool-define-as (definición directa con parámetros)
virsh pool-define-as virtimages dir \
    --target /var/lib/libvirt/images
```

Ambos comandos logran lo mismo (definir un pool de almacenamiento de tipo directorio llamado `virtimages` en el directorio `/var/lib/libvirt/images`), pero:

- El primero lee la configuración del contenedor de almacenamiento desde un archivo XML.
- El segundo permite especificar todos los parámetros directamente en la línea de comandos sin necesidad de crear un archivo XML.

El comando `pool-define-as` es más flexible y fácil de usar, especialmente para configuraciones más simples.

- **Formato de definición de un contenedor de almacenamiento con flags**:

```bash
virsh pool-define-as name type \
    [--source-host hostname] \
    [--source-path path] \
    [--source-dev path] \
    [--source-name name] \
    [--target path] \
    [*--source-format format*] \
    [--source-initiator initiator-iqn] \
    [*--auth-type authtype* *--auth-username username* \
    [*--secret-usage usage* | *--secret-uuid uuid*]] \
    [*--source-protocol-ver ver*] \
    [[*--adapter-name name*] | [*--adapter-wwnn* *--adapter-wwpn*] \
    [*--adapter-parent parent*]] \
    [*--print-xml*]
```

#### Contenedor asociado a un sistema de archivos

- **Formato XML: Sistema de ficheros (fs)**: `ext2`, `ext3`, `ext4`, `ufs`, `iso9660`, `udf`, `xfs`, `btrfs`, `reiserfs`, `jfs`, `hfs`, `hfsplus`, `ntfs`, `fat`, `vfat`, ...

```xml
<pool type="fs">
  <name>virtimages</name>
  <source>
    <device path="/dev/VolGroup00/VirtImages"/>
  </source>
  <target>
    <path>/var/lib/libvirt/images</path>
  </target>
</pool>
```

- **Formato de definición de un contenedor de almacenamiento con flags**:

```bash
virsh pool-define-as virtimages fs \
    --source-dev /dev/VolGroup00/VirtImages \
    --target /var/lib/libvirt/images
```

Dónde:

- `virtimages`: Nombre del contenedor de almacenamiento.
- `fs`: Tipo de contenedor de almacenamiento.
- `--source-dev`: Dispositivo de origen.
- `--target`: Directorio de destino.

#### Contenedor asociado a un grupo de volúmenes lógicos

- **Formato XML: Grupo de volúmenes lógicos (lvm)**: `lvm2`.

```bash
virsh pool-define archivo_definicion_contenedor.xml
```

```xml
<pool type="logical">
  <name>HostVG</name>
  <source>
    <device path="/dev/sda1"/>
    <device path="/dev/sdb1"/>
    <device path="/dev/sdc1"/>
  </source>
  <target>
    <path>/dev/HostVG/</path>
  </target>
</pool>
```

#### Contenedor asociado a un sistema de archivos de red (NFS)

```bash
virsh pool-define archivo_definicion_contenedor.xml
```

```xml
<pool type="netfs">
  <name>virtimages</name>
  <source>
    <host name="nfs.example.com"/>
    <dir path="/var/lib/libvirt/images"/>
  </source>
  <target>
    <path>/var/lib/libvirt/images</path>
  </target>
</pool>
```

- **Formato de definición de un contenedor de almacenamiento con flags**:

```bash
virsh pool-define-as virtimages netfs \
    --source-host nfs.example.com \
    --source-path /var/lib/libvirt/images \
    --target /var/lib/libvirt/images
```

#### Contenedor asociado a un disco 

```bash
virsh pool-define archivo_definicion_contenedor.xml
```

```xml
<pool type="disk">
  <name>virtimages</name>
  <source>
    <device path="/dev/sdb"/>
  </source>
  <target>
    <path>/dev/sdb</path>
  </target>
</pool>
```

- **Formato de definición de un contenedor de almacenamiento con flags**:

```bash
virsh pool-define-as virtimages disk \
    --source-dev /dev/sdb \
    --target /dev/sdb
```


Dónde:

- `virtimages`: Nombre del contenedor de almacenamiento.
- `disk`: Tipo de contenedor de almacenamiento.
- `--source-dev`: Dispositivo de origen.
- `--target`: Directorio de destino.

#### Contenedor asociado a una unidad iSCSI

```bash
virsh pool-define archivo_definicion_contenedor.xml
```

```xml  
<pool type="iscsi">
  <name>virtimages</name>
  <source>
    <host name="iscsi.example.com"/>
    <device path="demo-target"/>
  </source>
  <target>
    <path>/dev/disk/by-path</path>
  </target>
</pool>
```

- **Formato de definición de un contenedor de almacenamiento con flags**:

```bash
virsh pool-define-as virtimages iscsi \
    --source-host iscsi.example.com \
    --source-path demo-target \
    --target /dev/disk/by-path
```

#### Contenedor asociado a una unidad SCSI

```bash
virsh pool-define archivo_definicion_contenedor.xml
```

```xml
<pool type="scsi">
  <name>virtimages</name>
  <source>
    <adapter name="host0"/>
  </source>
  <target>
    <path>/dev/disk/by-path</path>
  </target>
</pool>
```

- **Formato de definición de un contenedor de almacenamiento con flags**:

```bash
virsh pool-define-as virtimages scsi \
    --source-adapter host0 \
    --target /dev/disk/by-path
```

### 2.2.2. Creación del contenedor de almacenamiento

Formato de la orden

```bash
virsh pool-build container_name
```

Dónde:

- `container_name`: Nombre del contenedor de almacenamiento.

Por ejemplo:

```bash
virsh pool-build virtimages
```

### 2.2.3. Puesta en marcha del contenedor de almacenamiento

Formato de la orden:

```bash
virsh pool-start container_name
virsh pool-autostart container_name
```

Dónde:

- `container_name`: Nombre del contenedor de almacenamiento.

Por ejemplo:

```bash
virsh pool-start virtimages
virsh pool-autostart virtimages
```

### 2.2.4. Eliminación del contenedor de almacenamiento

Se realiza en dos o tres pasos, dependiendo del tipo de contenedor:

- Paso 1: evitar que el contenedor y los volúmenes que contengan sean utilizados por un sistema invitado.
- Paso 2 (opcional): eliminar el directorio asociado al contenedor.
- Paso 3: eliminar la definición del contenedor.

Dos ejemplos:

```bash
virsh pool-destroy virtimages   # Pasa el contenedor a estado inactivado
virsh pool-delete virtimages    # Elimina el contenedor
virsh pool-undefine virtimages  # Elimina la definición del contenedor
```


### 2.2.5. Monitorización del contenedor de almacenamiento

```bash
virsh pool-list                   # Lista los contenedores de almacenamiento  
virsh pool-list --details | -all  # Lista los contenedores de almacenamiento con más detalles
```

Obtener la información de un contenedor específico:

```bash
virsh pool-info container_name    # Muestra información sobre un contenedor de almacenamiento
virsh pool-dumpxml container_name # Muestra la configuración de un contenedor de almacenamiento
```

Obtener la configuración de un contenedor específico:

## 2.3. Manejo de volúmenes
