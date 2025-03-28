# Práctica 4: Migración de máquinas virtuales

## Índice

- [Práctica 4: Migración de máquinas virtuales](#práctica-4-migración-de-máquinas-virtuales)
  - [Índice](#índice)
  - [1. Introducción](#1-introducción)
  - [2. Requisitos Previos](#2-requisitos-previos)
    - [Tarea 2: Uso de un contenedor de almacenamiento compartido](#tarea-2-uso-de-un-contenedor-de-almacenamiento-compartido)
  - [3. Desarrollo de la Práctica](#3-desarrollo-de-la-práctica)
    - [3.1. Tarea 1: Configuración del Nombre de Host](#31-tarea-1-configuración-del-nombre-de-host)
    - [3.2. Tarea 2: Configuración del Cortafuegos](#32-tarea-2-configuración-del-cortafuegos)
    - [3.3. Tarea 3: Migración](#33-tarea-3-migración)
      - [3.3.1. Generación y Configuración de Claves SSH](#331-generación-y-configuración-de-claves-ssh)
      - [3.3.2. Migración con virsh](#332-migración-con-virsh)
      - [3.3.4. Revocación de Accesos Temporales](#334-revocación-de-accesos-temporales)
  - [4. Pruebas y Validación](#4-pruebas-y-validación)
  - [5. Conclusiones](#5-conclusiones)
  - [6. Bibliografía](#6-bibliografía)
  - [7. Apéndices](#7-apéndices)
    - [7.1. Método alternativo: Clonación mediante manipulación de archivos XML](#71-método-alternativo-clonación-mediante-manipulación-de-archivos-xml)
      - [Paso 1: Crear el volumen destino en el contenedor compartido](#paso-1-crear-el-volumen-destino-en-el-contenedor-compartido)
      - [Paso 2: Extraer la definición XML de la máquina virtual original](#paso-2-extraer-la-definición-xml-de-la-máquina-virtual-original)
      - [Paso 3: Crear y editar una copia del archivo XML para la nueva máquina virtual](#paso-3-crear-y-editar-una-copia-del-archivo-xml-para-la-nueva-máquina-virtual)
      - [Paso 4: Definir la nueva máquina virtual a partir del archivo XML modificado](#paso-4-definir-la-nueva-máquina-virtual-a-partir-del-archivo-xml-modificado)
      - [Paso 5: Copiar los datos del disco original al nuevo volumen](#paso-5-copiar-los-datos-del-disco-original-al-nuevo-volumen)
      - [Paso 6: Iniciar y verificar la nueva máquina virtual](#paso-6-iniciar-y-verificar-la-nueva-máquina-virtual)

## 1. Introducción

El objetivo fundamental de esta práctica es realizar migraciones de máquinas virtuales entre diferentes anfitriones. La migración de máquinas virtuales requiere un almacenamiento compartido del disco, por lo que se utilizará el contenedor CONT_VOL_COMP creado en la práctica 3, que proporciona un espacio de almacenamiento compartido soportado mediante NFS.

Tanto el almacenamiento compartido como la propia migración requieren comunicación entre los anfitriones, por lo que será necesario configurar el cortafuegos para permitir dichas comunicaciones.

## 2. Requisitos Previos

Para abordar esta práctica se debe haber completado la práctica 3 (Recursos de almacenamiento virtual), teniendo disponible el contenedor CONT_VOL_COMP funcionando correctamente. Se verifica el correcto funcionamiento del contenedor:

```bash
# Verificar el estado del contenedor CONT_VOL_COMP
root@lq-d25:~# virsh pool-info CONT_VOL_COMP
Nombre:         CONT_VOL_COMP
UUID:           d131e98a-c98b-4bd5-ae8b-453912a010c8
Estado:         ejecutando
Persistente:    si
Autoinicio:     no
Capacidad:      395,85 GiB
Ubicación:     351,47 GiB
Disponible:     44,37 GiB
```

### Tarea 2: Uso de un contenedor de almacenamiento compartido

Tal y como ya se ha indicado, el espacio compartido de almacenamiento requerido para realizar esta práctica lo proporciona el contenedor CONT_VOL_COMP creado en la práctica 3.

Deberá crear una nueva máquina virtual llamada mvp4_etiqueta_de_equipo, que en nuestro caso será mvp4_lqd25. Esta nueva máquina virtual deberá ser el resultado de clonar la máquina virtual mvp1 creada en la práctica 1 pero con una diferencia importante: la imagen de disco de la nueva máquina mvp4_lqd25 debe almacenarse en el espacio de almacenamiento compartido proporcionado por el contenedor CONT_VOL_COMP.

1. Verificar que el contenedor CONT_VOL_COMP está activo:

```bash
root@lq-d25:~# virsh pool-list --all
Nombre                 Estado   Inicio automático
----------------------------------------------------
CONT_ISOS_COMP         activo   no
CONT_VOL_COMP          activo   no
Contenedor_Particion   activo   si
default                activo   si
ISO                    activo   si
```

2. Verificar los volúmenes existentes en el contenedor CONT_VOL_COMP:

```bash
root@lq-d25:~# virsh vol-list CONT_VOL_COMP
 Nombre                                 Ruta
---------------------------------------------------------------------------------------------------------
 pc25_LQD_ANFITRION1_Vol3_p3           /var/lib/libvirt/images/COMPARTIDO/pc25_LQD_ANFITRION1_Vol3_p3
```

3. Clonar directamente la máquina virtual mvp1 a mvp4_lqd25 utilizando la sintaxis URI correcta para el volumen compartido:

```bash
root@lq-d25:~# virsh vol-delete --pool CONT_VOL_COMP pc25_LQD_ANFITRION1_p4.qcow2
```

```bash
root@lq-d25:~# virt-clone --original mvp1 --name mvp4_lqd25 --file /var/lib/libvirt/images/COMPARTIDO/pc25_LQD_ANFITRION1_p4.qcow2 --mac=00:16:3e:31:13:b3
Allocating 'pc25_LQD_ANFITRION1_p4.qcow2'                                                       | 1.4 GB  00:00:00 ...


El clon 'mvp4_lqd25' ha sido creado exitosamente.
```

**Explicación del comando**:

- Primero intentamos eliminar el volumen si ya existe para evitar errores
- `virt-clone`: Herramienta para clonar máquinas virtuales existentes
- `--original mvp1`: Especifica la máquina virtual de origen
- `--name mvp4_lqd25`: Define el nombre de la nueva máquina virtual
- `--file /var/lib/libvirt/images/COMPARTIDO/pc25_LQD_ANFITRION1_p4.qcow2`: Especifica la ruta completa al archivo de disco en el almacenamiento compartido
- `--mac=00:16:3e:5d:31:ff`: Establece una dirección MAC diferente para la interfaz de red

> **Nota**: Al utilizar la ruta completa del archivo, nos aseguramos de que virt-clone pueda crear correctamente el volumen en el espacio de almacenamiento compartido sin problemas de interpretación de sintaxis. Es importante verificar previamente que la ruta al directorio compartido es correcta.

4. Verificar que el volumen se ha creado correctamente:

```bash
root@lq-d25:~# virsh vol-list CONT_VOL_COMP | grep pc25_LQD
pc25_LQD_ANFITRION1_p4.qcow2               /var/lib/libvirt/images/COMPARTIDO/pc25_LQD_ANFITRION1_p4.qcow2
pc25_LQD_ANFITRION1_Vol3_p3                /var/lib/libvirt/images/COMPARTIDO/pc25_LQD_ANFITRION1_Vol3_p3
pc25_LQD_ANFITRION1_Vol3_p3.qcow2          /var/lib/libvirt/images/COMPARTIDO/pc25_LQD_ANFITRION1_Vol3_p3.qcow2
```

5. Iniciar la máquina virtual clonada:

```bash
root@lq-d25:~# virsh start mvp4_lqd25
Se ha iniciado el dominio mvp4_lqd25
```

6. Verificar que la máquina está operativa:

```bash
root@lq-d25:~# virsh list --all
Id   Nombre                   Estado
-------------------------------------------
1    mvp4_lqd25               ejecutando
-    clon_copiando_ficheros   apagado
-    clon_virt_clone          apagado
-    clon_virt_manager        apagado
-    Creacion_virt_install    apagado
-    mvp1                     apagado
-    mvp3                     apagado
```

7. Obtener la dirección IP de la máquina virtual:

```bash
root@lq-d25:~# virsh domifaddr mvp4_lqd25 
Nombre     dirección MAC       Protocol     Address
-------------------------------------------------------------------------------
vnet0      00:16:3e:31:13:b3    ipv4         192.168.122.124/24
```

8. Conectarse a la máquina virtual para verificar que está completamente operativa:

```bash
root@lq-d25:~# ssh root@192.168.122.124
Web console: https://mvp1.vpd.com:9090/ or https://192.168.122.124:9090/


Last login: Thu Mar 20 19:28:58 2025
root@mvp1:~#
```

> **Nota**: Es normal que el arranque de la máquina demore más tiempo al tener su disco en un espacio de almacenamiento externo, a diferencia de cuando la máquina huésped tiene el disco en el host anfitrión.

## 3. Desarrollo de la Práctica

### 3.1. Tarea 1: Configuración del Nombre de Host

Es necesario configurar cada equipo anfitrión con un nombre de host único y completamente cualificado (FQDN) para poder identificarlo en la red y permitir la comunicación entre anfitriones.

```bash
# Verificar el nombre actual del host
root@lq-d25:~# hostname
lq-d25.vpc.com
```

**Explicación del comando**:

- `hostname`: Muestra el nombre de host actual.
- `hostname -f`: Muestra el nombre de host completamente cualificado (FQDN).

### 3.2. Tarea 2: Configuración del Cortafuegos

La migración de máquinas virtuales requiere que ciertos puertos estén abiertos en el cortafuegos para permitir la comunicación entre los anfitriones. En Fedora 39, el servicio de cortafuegos por defecto es Firewalld.

Primero, verificamos el estado del cortafuegos:

```bash
# Verificar el estado del servicio Firewalld
root@lq-d25:~# systemctl status firewalld
● firewalld.service - firewalld - dynamic firewall daemon
     Loaded: loaded (/usr/lib/systemd/system/firewalld.service; enabled; preset: enabled)
    Drop-In: /usr/lib/systemd/system/service.d
             └─10-timeout-abort.conf
     Active: active (running) since Fri 2025-03-28 18:20:54 WET; 26min ago
       Docs: man:firewalld(1)
   Main PID: 1046 (firewalld)
      Tasks: 2 (limit: 76221)
     Memory: 50.5M
        CPU: 322ms
     CGroup: /system.slice/firewalld.service
             └─1046 /usr/bin/python3 -sP /usr/sbin/firewalld --nofork --nopid



mar 28 18:20:53 lq-d25.vpc.com systemd[1]: Starting firewalld.service - firewalld - dynamic firewall daemon...
mar 28 18:20:54 lq-d25.vpc.com systemd[1]: Started firewalld.service - firewalld - dynamic firewall daemon.
```

**Explicación del comando**:

- `systemctl status firewalld`: Muestra el estado del servicio Firewalld, incluyendo si está activo y en ejecución.

A continuación, identificamos la zona activa para la interfaz de red que utilizaremos:

```bash
# Identificar las zonas activas
root@lq-d25:~# firewall-cmd --get-active-zones
FedoraServer (default)
  interfaces: enp6s0
libvirt
  interfaces: virbr0
```

**Explicación del comando**:

- `firewall-cmd --get-active-zones`: Muestra las zonas activas y las interfaces asociadas a cada una.

Ahora, configuramos el cortafuegos para permitir la migración de máquinas virtuales. Para ello, habilitaremos los puertos necesarios:

```bash
# Añadir el servicio libvirt a la zona activa
sudo firewall-cmd --add-service=libvirt --permanent

# Habilitar el rango de puertos para la migración (49152-49216)
sudo firewall-cmd --add-port=49152-49216/tcp --permanent

# Habilitar puerto para tráfico SSH
sudo firewall-cmd --add-service=ssh --permanent

# Recargar la configuración del cortafuegos
sudo firewall-cmd --reload

# Verificar la configuración
sudo firewall-cmd --list-all
```

```bash
root@lq-d25:~# firewall-cmd --add-service=libvirt --permanent
success
root@lq-d25:~# firewall-cmd --add-port=49152-49216/tcp --permanent
success
root@lq-d25:~# firewall-cmd --add-service=ssh --permanent
Warning: ALREADY_ENABLED: ssh
success
root@lq-d25:~# firewall-cmd --reload
success
root@lq-d25:~# firewall-cmd --list-all
FedoraServer (default, active)
  target: default
  ingress-priority: 0
  egress-priority: 0
  icmp-block-inversion: no
  interfaces: enp6s0
  sources:
  services: cockpit dhcpv6-client libvirt ssh
  ports: 49152-49216/tcp
  protocols:
  forward: yes
  masquerade: no
  forward-ports:
  source-ports:
  icmp-blocks:
  rich rules:
```

**Explicación de los comandos**:

- `firewall-cmd --add-service=libvirt --permanent`: Añade el servicio predefinido libvirt a la configuración permanente del cortafuegos.
- `firewall-cmd --add-port=49152-49216/tcp --permanent`: Habilita el rango de puertos (49152-49216) que utiliza libvirt para la migración.
- `firewall-cmd --add-service=ssh --permanent`: Habilita el servicio SSH en el cortafuegos.
- `firewall-cmd --reload`: Recarga la configuración del cortafuegos, aplicando los cambios permanentes.
- `firewall-cmd --list-all`: Muestra la configuración actual del cortafuegos para verificar que los cambios se han aplicado correctamente.

> **Nota**: Es importante habilitar estos puertos en ambos anfitriones (origen y destino) para que la migración pueda realizarse correctamente.

### 3.3. Tarea 3: Migración

#### 3.3.1. Generación y Configuración de Claves SSH

Para realizar la migración sin necesidad de introducir contraseñas, se utilizará la autenticación mediante clave pública/privada SSH.

```bash
# Generar par de claves SSH para el usuario root
sudo ssh-keygen -t rsa -b 4096
```

**Explicación del comando**:

- `ssh-keygen -t rsa -b 4096`: Genera un par de claves RSA de 4096 bits.
  - `-t rsa`: Especifica el tipo de clave (RSA).
  - `-b 4096`: Establece el tamaño de la clave (4096 bits, recomendado para mayor seguridad).

Durante el proceso de generación, se puede aceptar la ubicación predeterminada (`/root/.ssh/id_rsa`) y opcionalmente establecer una frase de contraseña (aunque para automatizar el proceso se suele dejar en blanco).

A continuación, se debe compartir la clave pública con el anfitrión de destino:

```bash
# Compartir la clave pública con el anfitrión de destino
root@lq-d25:~# ssh-copy-id root@lq-d26.vpd.com
/usr/bin/ssh-copy-id: INFO: attempting to log in with the new key(s), to filter out any that are already installed
/usr/bin/ssh-copy-id: INFO: 1 key(s) remain to be installed -- if you are prompted now it is to install the new keys
root@lq-d26.vpd.com's password:
 
Number of key(s) added: 1
 
Now try logging into the machine, with:   "ssh 'root@lq-d26.vpd.com'"
and check to make sure that only the key(s) you wanted were added.
```

**Explicación del comando**:

- `ssh-copy-id root@dlq-d26.vpd.com`: Copia la clave pública al archivo `authorized_keys` del usuario root en el anfitrión de destino.
  - `root@dlq-d26.vpd.com`: Especifica el usuario y el anfitrión de destino (cambiar por el FQDN del anfitrión de destino).

Se solicitará la contraseña de root en el anfitrión de destino una única vez para realizar la operación.

Para verificar que la autenticación con clave funciona correctamente:

```bash
# Verificar la conexión SSH
root@lq-d25:~# ssh root@lq-d26.vpd.com
Last login: Fri Mar 28 20:01:11 2025 from 10.140.92.125
```

Si todo está configurado correctamente, se establecerá la conexión sin solicitar contraseña.

#### 3.3.2. Migración con virsh

La migración también puede realizarse mediante la línea de comandos usando virsh:

```bash
# Listar las máquinas virtuales disponibles
sudo virsh list --all

# Realizar la migración en vivo
root@lq-d25:~# virsh migrate --live mvp4_lqd25 qemu+ssh://lq-d26.vpd.com/system --verbose
root@lq-d26.vpd.com's password: 
Migración: [100,00 %]
```

**Explicación del comando**:

- `virsh migrate`: Comando para iniciar la migración de una máquina virtual.
  - `--live`: Realiza una migración en vivo, donde la máquina continúa funcionando durante el proceso.
  - `mvp4_etiqueta_de_equipo`: Nombre de la máquina virtual a migrar.
  - `qemu+ssh://dlq-d26.vpd.com/system`: URI del destino, especificando el protocolo (qemu+ssh), el anfitrión de destino y el tipo de conexión (/system).
  - `--verbose`: Muestra información detallada durante el proceso de migración.

Para una migración más avanzada con opciones adicionales:

```bash
sudo virsh migrate --live --persistent --undefinesource mvp4_etiqueta_de_equipo qemu+ssh://dlq-d26.vpd.com/system
```

**Explicación de parámetros adicionales**:

- `--persistent`: Hace que la máquina virtual persista en el host de destino después de reiniciarlo.
- `--undefinesource`: Elimina la definición de la máquina virtual en el host de origen después de la migración.

#### 3.3.4. Revocación de Accesos Temporales

Una vez completada la migración, es importante revocar los accesos temporales otorgados durante el proceso para mantener la seguridad del sistema:

```bash
# Eliminar la clave pública del anfitrión remoto
sudo ssh root@dlq-d26.vpd.com "sed -i '/$(cat ~/.ssh/id_rsa.pub | cut -d' ' -f2)/d' ~/.ssh/authorized_keys"
```

**Explicación del comando**:

- Este comando se conecta al anfitrión remoto y elimina la entrada correspondiente a nuestra clave pública del archivo `authorized_keys`.

Alternativamente, se puede acceder al anfitrión remoto y editar manualmente el archivo:

```bash
# Acceder al anfitrión remoto
sudo ssh root@dlq-d26.vpd.com

# Editar el archivo authorized_keys
nano ~/.ssh/authorized_keys
```

Y eliminar la línea correspondiente a la clave pública del anfitrión de origen.

## 4. Pruebas y Validación

Para verificar que la migración se ha realizado correctamente, se deben realizar las siguientes pruebas:

```bash
# En el anfitrión de destino, verificar que la máquina virtual está en ejecución
root@lq-d26:~# virsh list --all
Id   Nombre                   Estado
-------------------------------------------
4    mvp4_lqd25               ejecutando
-    clon_copiando_ficheros   apagado
-    clon_virt_clone          apagado
-    clon_virt_manager        apagado
-    Creacion_virt_install    apagado
-    mvp1                     apagado
-    mvp3                     apagado
-    mvp5                     apagado
```

**Resultado esperado**:

- La máquina virtual mvp4_etiqueta_de_equipo debe aparecer en la lista y estar en estado "running".

```bash
# Verificar la información detallada de la máquina virtual
root@lq-d26:~# virsh dominfo mvp4_lqd25 
Id:             4
Nombre:         mvp4_lqd25
UUID:           4b35bb33-6531-4fdf-8eaf-6b749ae432f1
Tipo de sistema operatuvo: hvm
Estado:         ejecutando
CPU(s):         1
Hora de la CPU: 36,6s
Memoria máxima: 2097152 KiB
Memoria utilizada: 2097152 KiB
Persistente:    si
Autoinicio:     desactivar
Guardar administrado: no
Modelo de seguridad: selinux
DOI de seguridad: 0
Etiqueta de seguridad: system_u:system_r:svirt_t:s0:c661,c935 (enforcing)
Messages:       tainted: potentially unsafe use of host CPU passthrough
```

**Explicación del comando**:

- `virsh dominfo`: Muestra información detallada sobre la máquina virtual, incluyendo su estado, memoria asignada, y número de CPU virtuales.

```bash
# Verificar que se puede acceder a la máquina virtual migrada
root@lq-d26:~# virsh console mvp4_lqd25 
Connected to domain 'mvp4_lqd25'
Escape character is ^] (Ctrl + ])
```

**Explicación del comando**:

- `virsh console`: Conecta a la consola de la máquina virtual, permitiendo interactuar con ella.
- Para salir de la consola, se usa la combinación de teclas `Ctrl+]`.

También se debe verificar que la máquina virtual sigue teniendo acceso al almacenamiento compartido:

```bash
# Acceder a la máquina virtual y verificar el acceso al almacenamiento
# (Desde dentro de la máquina virtual migrada)
df -h
```

## 5. Conclusiones

La migración de máquinas virtuales entre anfitriones es una funcionalidad fundamental en entornos virtualizados, ya que permite:

- **Alta disponibilidad**: La capacidad de mover máquinas virtuales entre anfitriones sin interrupciones significativas mejora la disponibilidad del servicio.
- **Mantenimiento sin tiempo de inactividad**: Permite realizar mantenimiento en los anfitriones físicos sin necesidad de apagar las máquinas virtuales.
- **Balanceo de carga**: Facilita la distribución de la carga entre distintos anfitriones físicos.

Durante el desarrollo de esta práctica, se han aplicado varios conceptos importantes:

- Configuración adecuada de nombres de host completamente cualificados (FQDN).
- Gestión del cortafuegos mediante Firewalld para permitir la comunicación necesaria entre anfitriones.
- Configuración de autenticación SSH mediante claves para automatizar procesos sin comprometer la seguridad.
- Uso de almacenamiento compartido (NFS) como requisito para la migración en vivo.

Las principales dificultades encontradas durante el proceso incluyen:

- La correcta configuración del cortafuegos para permitir el tráfico necesario sin exponer innecesariamente el sistema.
- La gestión adecuada de las claves SSH para mantener la seguridad del sistema.

La implementación de migraciones en vivo representa una habilidad esencial para administradores de sistemas en entornos virtualizados, especialmente en infraestructuras que requieren alta disponibilidad.

## 6. Bibliografía

1. Herrmann J, Zimmerman Y, Novich L, Parker D, Radvan S, Richardson T. (2019). "Red Hat Enterprise Linux 7. Virtualization Deployment and Administration Guide". Red Hat. [https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/7/html/virtualization_deployment_and_administration_guide/index](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/7/html/virtualization_deployment_and_administration_guide/index)

2. Muehlfeld M, Gkioka I, Jahoda M, Heves J, Wadeley S, Huffman C. (2019). "Red Hat Enterprise Linux 7 Networking Guide". Red Hat. [https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/7/html/networking_guide/index](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/7/html/networking_guide/index)

3. Jahoda M, Fiala J, Wadeley S, Krátky R, Prpic M, Gkiova I, Capek T, Ruseva Y, Svoboda M. (2019). "Red Hat Enterprise Linux 7. Red Hat Enterprise Linux 7 Security Guide". Red Hat. [https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/7/html/security_guide/index](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/7/html/security_guide/index)

## 7. Apéndices

### 7.1. Método alternativo: Clonación mediante manipulación de archivos XML

Esta sección describe un método alternativo para clonar una máquina virtual utilizando un volumen pre-creado en un contenedor de almacenamiento compartido mediante la edición manual del archivo XML de definición de la máquina virtual.

Este enfoque es útil cuando:

- Se necesita un control preciso sobre la configuración de la máquina virtual
- Se han creado previamente volúmenes específicos que deben ser utilizados
- El método estándar de clonación presenta problemas con volúmenes pre-creados

#### Paso 1: Crear el volumen destino en el contenedor compartido

Primero, creamos el volumen en el contenedor CONT_VOL_COMP:

```bash
root@lq-d25:~# virsh vol-create-as CONT_VOL_COMP pc25_LQD_ANFITRION1_p4.qcow2 10G --format qcow2 --prealloc-metadata
Se ha creado el volumen pc25_LQD_ANFITRION1_p4.qcow2
```

#### Paso 2: Extraer la definición XML de la máquina virtual original

Obtenemos la definición XML completa de la máquina virtual que queremos clonar:

```bash
root@lq-d25:~# virsh dumpxml mvp1 > mvp1.xml
```

**Explicación del comando**:

- `virsh dumpxml`: Obtiene la configuración XML completa de una máquina virtual
- `mvp1`: Nombre de la máquina virtual de origen
- `> mvp1.xml`: Redirige la salida a un archivo llamado mvp1.xml

#### Paso 3: Crear y editar una copia del archivo XML para la nueva máquina virtual

Copiamos el archivo XML y lo editamos para adaptarlo a la nueva máquina virtual:

```bash
root@lq-d25:~# cp mvp1.xml mvp4_lqd25.xml
root@lq-d25:~# vi mvp4_lqd25.xml
```

Los cambios necesarios en el archivo XML son:

1. **Cambiar el nombre de la máquina virtual**:

```xml
<name>mvp4_lqd25</name>
```

2. **Generar y establecer un nuevo UUID** (utilizando el comando `uuidgen`):

```bash
root@lq-d25:~# uuidgen
550e8400-e29b-41d4-a716-446655440000
```

```xml
<uuid>550e8400-e29b-41d4-a716-446655440000</uuid>
```

3. **Modificar la dirección MAC de la interfaz de red**:

```xml
<mac address='00:16:3e:32:2a:f5'/>
```

4. **Cambiar la configuración del disco para usar el volumen pre-creado**:

```xml
<disk type='volume' device='disk'>
  <driver name='qemu' type='qcow2'/>
  <source pool='CONT_VOL_COMP' volume='pc25_LQD_ANFITRION1_p4.qcow2'/>
  <target dev='vda' bus='virtio'/>
  <address type='pci' domain='0x0000' bus='0x04' slot='0x00' function='0x0'/>
</disk>
```

#### Paso 4: Definir la nueva máquina virtual a partir del archivo XML modificado

```bash
root@lq-d25:~# virsh define mvp4_lqd25.xml
Se ha definido el dominio mvp4_lqd25 desde mvp4_lqd25.xml
```

**Explicación del comando**:

- `virsh define`: Registra una máquina virtual en libvirt a partir de un archivo XML
- `mvp4_lqd25.xml`: Archivo XML con la definición de la nueva máquina virtual

#### Paso 5: Copiar los datos del disco original al nuevo volumen

Localizamos la ruta del disco original:

```bash
root@lq-d25:~# virsh domblklist mvp1
 Target   Source
--------------------------------
 vda      /var/lib/libvirt/images/mvp1.qcow2
```

Copiamos el contenido del disco original al nuevo volumen:

```bash
root@lq-d25:~# qemu-img convert -f qcow2 -O qcow2 /var/lib/libvirt/images/mvp1.qcow2 /var/lib/libvirt/images/COMPARTIDO/pc25_LQD_ANFITRION1_p4.qcow2
```

**Explicación del comando**:

- `qemu-img convert`: Herramienta para convertir imágenes de disco entre diferentes formatos
- `-f qcow2`: Especifica el formato de origen (qcow2)
- `-O qcow2`: Especifica el formato de destino (qcow2)
- Seguido de las rutas de origen y destino

#### Paso 6: Iniciar y verificar la nueva máquina virtual

```bash
root@lq-d25:~# virsh start mvp4_lqd25
Se ha iniciado el dominio mvp4_lqd25

root@lq-d25:~# virsh list --all
 Id   Nombre               Estado
----------------------------------
 1    mvp4_lqd25           ejecutando
 -    mvp1                 apagado
 -    mvp3                 apagado
```

Esta metodología proporciona un control más granular sobre el proceso de clonación, permitiendo personalizar aspectos específicos de la configuración de la máquina virtual. Aunque es más compleja que el método estándar, resulta útil en escenarios donde se requiere una mayor flexibilidad o cuando se trabaja con configuraciones específicas de almacenamiento.
