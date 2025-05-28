# 2. Almacenamiento en KVM

## Tabla de Contenidos

- [2. Almacenamiento en KVM](#2-almacenamiento-en-kvm)
  - [Tabla de Contenidos](#tabla-de-contenidos)
  - [2.1. Objetivos](#21-objetivos)
  - [2.2. Ciclo de vida de un contenedor de volúmenes (_storage pool_)](#22-ciclo-de-vida-de-un-contenedor-de-volúmenes-storage-pool)
    - [2.2.1. Definición del contenedor de almacenamiento](#221-definición-del-contenedor-de-almacenamiento)
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

## 2.3. Manejo de volúmenes
