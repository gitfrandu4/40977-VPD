# Práctica 7.2: Configuración y puesta en marcha del servicio de alta disponibilidad en un clúster básico

## Índice de contenidos

- [1. Introducción](#1-introducción)
- [2. Requisitos previos](#2-requisitos-previos)
- [3. Desarrollo de la práctica](#3-desarrollo-de-la-práctica)
  - [Fase 1. Configuración de los nodos del clúster](#fase-1-configuración-de-los-nodos-del-clúster)
  - [Fase 2. Configuración del servicio httpd](#fase-2-configuración-del-servicio-httpd)
  - [Fase 3. Configuración del almacenamiento compartido](#fase-3-configuración-del-almacenamiento-compartido)
  - [Fase 4. Creación de recursos y grupos de recursos](#fase-4-creación-de-recursos-y-grupos-de-recursos)
- [4. Pruebas y validación](#4-pruebas-y-validación)
- [5. Conclusiones](#5-conclusiones)
- [6. Bibliografía](#6-bibliografía)

## 1. Introducción

El objetivo fundamental de esta actividad es configurar y poner en marcha un clúster que proporcione un servicio web Apache en alta disponibilidad, continuando con el trabajo realizado en la Práctica 7.1 donde se desplegó la infraestructura básica.

En esta segunda parte, se procederá a la instalación y configuración de los módulos software necesarios para soportar la computación en clúster, poner en marcha dichos módulos y finalmente crear un clúster que proporcione el servicio web Apache en alta disponibilidad.

## 2. Requisitos previos

Para abordar esta práctica es imprescindible haber completado correctamente la Práctica 7.1 sobre el despliegue de la infraestructura básica del clúster. Es necesario disponer de:

- Las tres máquinas virtuales configuradas: nodo de almacenamiento y los dos nodos del clúster
- El acceso al almacenamiento compartido vía iSCSI correctamente configurado
- La infraestructura de red funcionando según las especificaciones
- El servidor Apache instalado en ambos nodos del clúster

## 3. Desarrollo de la práctica

### Fase 1. Configuración de los nodos del clúster

En esta fase se realizará la configuración necesaria para que los nodos puedan formar parte del clúster, incluyendo la instalación de paquetes necesarios y la configuración del mecanismo de aislamiento (fencing).

#### Tarea 1.1. Instalación de los paquetes de aislamiento o fencing

Estos pasos deben realizarse en ambos nodos del clúster (Nodo1 y Nodo2):

1. Instalar los paquetes necesarios para el mecanismo de aislamiento:

```bash
dnf install fence-virt fence-virtd
```

**Explicación del comando**:

- `dnf install`: Herramienta de gestión de paquetes que permite instalar software
- `fence-virt fence-virtd`: Paquetes necesarios para implementar el mecanismo de aislamiento en entornos virtualizados

#### Tarea 1.2. Configuración del cortafuegos

2. Configurar el cortafuegos en ambos nodos para permitir el tráfico de comunicación con el host anfitrión a través de la red de control (10.22.132.1) y del puerto 1229:

```bash
firewall-cmd --permanent --add-rich-rule='rule family="ipv4" source address="10.22.132.1" port port="1229" protocol="tcp" accept'
firewall-cmd --reload
```

**Explicación del comando**:

- `firewall-cmd`: Herramienta para configurar el cortafuegos
- `--permanent`: Indica que la regla se aplica de forma permanente y persistirá tras el reinicio
- `--add-rich-rule`: Permite añadir una regla compleja con múltiples parámetros
- `rule family="ipv4"`: Especifica que la regla se aplica al protocolo IPv4
- `source address="10.22.132.1"`: Indica la dirección IP de origen a la que se aplica la regla
- `port port="1229" protocol="tcp"`: Especifica el puerto y protocolo de comunicación
- `accept`: Acción que permite el tráfico que cumple los criterios especificados
- `--reload`: Recarga la configuración del cortafuegos para aplicar los cambios

#### Tarea 1.3. Preparación del mecanismo de fencing

3. Crear el directorio administrativo `/etc/cluster` y copiar el fichero que contiene la clave compartida que emplean los nodos para realizar las peticiones de fencing:

```bash
mkdir -p /etc/cluster
scp root@10.22.132.1:/etc/cluster/fence_xvm.key /etc/cluster
```

**Explicación del comando**:

- `mkdir -p`: Crea el directorio y todos los directorios padre necesarios si no existen
- `scp`: Copia segura de archivos a través de SSH
- `root@10.22.132.1:/etc/cluster/fence_xvm.key`: Especifica el usuario, host y ruta del archivo a copiar
- `/etc/cluster`: Directorio de destino donde se copiará el archivo

4. Comprobar la conectividad multicast a través de la siguiente orden:

```bash
fence_xvm -o list
```

> **Nota**: En caso de que la orden no responda, reiniciar los nodos.

#### Tarea 1.4. Creación del mecanismo de fencing

5. Crear el mecanismo de fencing de tipo fence_xvm que se ha configurado en el clúster:

```bash
pcs stonith create xvmfence fence_xvm key_file=/etc/cluster/fence_xvm.key
```

**Explicación del comando**:

- `pcs stonith create`: Crea un recurso de tipo STONITH (Shoot The Other Node In The Head), que es el mecanismo de fencing
- `xvmfence`: Identificador o nombre que se da al recurso
- `fence_xvm`: Tipo de recurso de fencing que se está creando
- `key_file=/etc/cluster/fence_xvm.key`: Ruta al archivo de clave compartida para el mecanismo de fencing

6. Reiniciar ambos nodos y comprobar el estado del mecanismo de fencing y el estado global del clúster:

```bash
pcs stonith
pcs status
```

### Fase 2. Configuración del servicio httpd

En esta fase, se realizará la configuración necesaria para que el servicio httpd (Apache) pueda ejecutarse en el contexto de un clúster de alta disponibilidad.

#### Tarea 2.1. Configuración del estado del servicio

Este paso se realiza en los dos nodos del clúster y se lleva a cabo para que el agente del clúster responsable de controlar el servicio httpd pueda obtener la información de estado (registros de "log") de este servicio.

1. Añadir al archivo `/etc/httpd/conf.d/status.conf` las siguientes líneas:

```bash
echo '<Location /server-status>
    SetHandler server-status
    Require local
</Location>' > /etc/httpd/conf.d/status.conf
```

#### Tarea 2.2. Configuración para control desde el clúster

Este paso se realiza en todos los nodos del clúster que pueden ejecutar el servicio httpd, que en nuestro caso son Nodo1 y Nodo2. El propósito es configurar cada uno de estos nodos para que el control de este servicio lo realice el agente del clúster responsable de la ejecución de este servicio y no lo realice el servicio systemd.

1. En el archivo de configuración `/etc/logrotate.d/httpd` eliminar la siguiente línea:

```
/bin/systemctl reload httpd.service > /dev/null 2>/dev/null || true
```

2. Reemplazar la línea eliminada por las siguientes líneas:

```
/usr/bin/test -f /var/run/httpd-Website.pid >/dev/null 2>/dev/null && /usr/bin/ps -q $(/usr/bin/cat /var/run/httpd-Website.pid) >/dev/null 2>/dev/null && /usr/sbin/httpd -f /etc/httpd/conf/httpd.conf -c "PidFile /var/run/httpd-Website.pid" -k graceful > /dev/null 2>/dev/null || true
```

### Fase 3. Configuración del almacenamiento compartido

La finalidad de esta fase es configurar el sistema para que el grupo de volúmenes de almacenamiento que alberga el volumen lógico en el que se despliega el espacio compartido sea controlado solo por el clúster y no localmente por el servicio lvm de cada nodo.

#### Tarea 3.1. Configuración de LVM

Los siguientes pasos se deben realizar en ambos nodos del clúster (Nodo1 y Nodo2):

1. Obtener los grupos de volúmenes que están configurados para que sean controlados localmente por el servicio lvm:

```bash
vgs --noheadings -o vg_name
```

2. A partir del resultado de la orden anterior, especificar en la variable de configuración `volume_list` del archivo `/etc/lvm/lvm.conf` la relación de grupos de volúmenes exceptuando el grupo de volumen en el que se ha creado el volumen lógico que alberga el espacio compartido para el servicio Apache:

```bash
# Ejemplo de edición del archivo /etc/lvm/lvm.conf
# volume_list = [ "fedora_localhost-live", "rhel" ]  # Sin incluir ApacheVG
```

> **Nota**: Si no existieran grupo de volúmenes a especificar, entonces esta variable debería definirse conteniendo una lista vacía.

3. Una vez ejecutado el paso anterior en ambos nodos, reiniciar ambos nodos.

#### Tarea 3.2. Verificación del clúster

4. Una vez reiniciados los nodos, verificar que los servicios de control del clúster se están ejecutando correctamente:

```bash
pcs cluster status
```

5. Si la orden anterior produjera un error consistente en que el clúster no se está ejecutando, entonces ejecutar la siguiente orden para iniciar la ejecución del clúster:

```bash
pcs cluster start
```

Alternativamente, se podrían reiniciar todos los nodos del clúster y, una vez todos los nodos estuvieran arrancados, entonces ejecutar en uno de los nodos la orden:

```bash
pcs cluster start --all
```

### Fase 4. Creación de recursos y grupos de recursos

Para poder ofrecer el servicio Apache en alta disponibilidad, el clúster deberá disponer de cuatro recursos que conformarán un grupo de recursos.

#### Tarea 4.1. Creación de los recursos necesarios

1. Crear un recurso de tipo LVM que se llamará Apache_LVM:

```bash
pcs resource create Apache_LVM LVM volgrpname=ApacheVG exclusive=true --group apachegroup
```

**Explicación del comando**:

- `pcs resource create`: Crea un recurso en el clúster
- `Apache_LVM`: Nombre del recurso
- `LVM`: Tipo de recurso
- `volgrpname=ApacheVG`: Nombre del grupo de volúmenes LVM a gestionar
- `exclusive=true`: Indica que el grupo de volúmenes será gestionado exclusivamente por el clúster
- `--group apachegroup`: Asigna el recurso al grupo "apachegroup"

2. Crear un recurso de tipo Filesystem que se llamará Apache_FS:

```bash
pcs resource create Apache_FS Filesystem device="/dev/ApacheVG/ApacheLV" directory="/var/www" fstype="xfs" --group apachegroup
```

**Explicación del comando**:

- `Apache_FS`: Nombre del recurso
- `Filesystem`: Tipo de recurso
- `device="/dev/ApacheVG/ApacheLV"`: Dispositivo de bloques a montar
- `directory="/var/www"`: Punto de montaje del sistema de archivos
- `fstype="xfs"`: Tipo de sistema de archivos

3. Crear un recurso de tipo IPaddr2 que se llamará Apache_IP:

```bash
pcs resource create Apache_IP IPaddr2 ip=192.168.140.253 cidr_netmask=24 --group apachegroup
```

**Explicación del comando**:

- `Apache_IP`: Nombre del recurso
- `IPaddr2`: Tipo de recurso para gestionar direcciones IP flotantes
- `ip=192.168.140.253`: Dirección IP flotante que se utilizará para acceder al servicio
- `cidr_netmask=24`: Máscara de red en notación CIDR (equivalente a 255.255.255.0)

4. Crear un recurso de tipo apache que se llamará Apache_Script:

```bash
pcs resource create Apache_Script apache configfile="/etc/httpd/conf/httpd.conf" statusurl="http://localhost/server-status" --group apachegroup
```

**Explicación del comando**:

- `Apache_Script`: Nombre del recurso
- `apache`: Tipo de recurso
- `configfile="/etc/httpd/conf/httpd.conf"`: Ruta al archivo de configuración de Apache
- `statusurl="http://localhost/server-status"`: URL para verificar el estado del servicio Apache

## 4. Pruebas y validación

En esta sección debe documentar todos los pasos realizados para probar el correcto funcionamiento del clúster y el servicio en alta disponibilidad, incluyendo:

- Verificación del estado del clúster
- Pruebas de conmutación por error (failover)
- Comprobación del acceso al servicio web a través de la IP flotante
- Pruebas de recuperación ante fallos

Incluya capturas de pantalla relevantes que demuestren el funcionamiento correcto del clúster y el servicio en alta disponibilidad.

## 5. Conclusiones

En esta sección debe incluir:

- Resumen del trabajo realizado
- Dificultades encontradas y soluciones aplicadas
- Conocimientos adquiridos
- Posibles mejoras o ampliaciones futuras
- Valoración de la tecnología de clustering utilizada

## 6. Bibliografía

1. Red Hat. (2023). "High Availability Add-On Overview". [Enlace](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/7/html/high_availability_add-on_overview/index)

2. Red Hat. (2023). "High Availability Add-On Administration". [Enlace](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/7/html/high_availability_add-on_administration/index)

3. Red Hat. (2023). "Configuring and managing high availability clusters". [Enlace](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/9/html/configuring_and_managing_high_availability_clusters/index)
