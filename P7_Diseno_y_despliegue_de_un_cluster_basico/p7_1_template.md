# Práctica 7.1: Diseño y despliegue de la infraestructura de un clúster básico para proporcionar un servicio en alta disponibilidad

## Índice de contenidos

- [Práctica 7.1: Diseño y despliegue de la infraestructura de un clúster básico para proporcionar un servicio en alta disponibilidad](#práctica-71-diseño-y-despliegue-de-la-infraestructura-de-un-clúster-básico-para-proporcionar-un-servicio-en-alta-disponibilidad)
  - [Índice de contenidos](#índice-de-contenidos)
  - [1. Introducción](#1-introducción)
  - [2. Requisitos previos](#2-requisitos-previos)
  - [3. Desarrollo de la práctica](#3-desarrollo-de-la-práctica)
    - [Fase 1. Creación de la infraestructura básica del clúster](#fase-1-creación-de-la-infraestructura-básica-del-clúster)
      - [Tarea 1.1. Preparación de la infraestructura](#tarea-11-preparación-de-la-infraestructura)
    - [Comandos detallados por pasos](#comandos-detallados-por-pasos)
    - [Fase 2. Instalación del servidor Apache](#fase-2-instalación-del-servidor-apache)
      - [Tarea 2.1. Instalación y configuración del servidor Apache](#tarea-21-instalación-y-configuración-del-servidor-apache)
      - [Tarea 2.2. Configuración del almacenamiento compartido para Apache](#tarea-22-configuración-del-almacenamiento-compartido-para-apache)
    - [Comandos detallados para Fase 2](#comandos-detallados-para-fase-2)
  - [4. Pruebas y validación](#4-pruebas-y-validación)
    - [Pruebas de conectividad](#pruebas-de-conectividad)
    - [Verificación de Apache](#verificación-de-apache)
    - [Verificación de almacenamiento compartido](#verificación-de-almacenamiento-compartido)
    - [Recomendación](#recomendación)
  - [5. Conclusiones](#5-conclusiones)
  - [6. Bibliografía](#6-bibliografía)

## 1. Introducción

El objetivo fundamental de esta actividad es diseñar y desplegar un clúster en el que se ejecute un servidor web Apache en alta disponibilidad.

Para ello, en la primera parte de la actividad se deberá diseñar la infraestructura básica del clúster para dar soporte a dicho servicio: número de nodos, rol de cada nodo, infraestructura de red necesaria, etc. En segundo lugar, una vez definido el diseño del clúster, se deberá desplegar toda la infraestructura básica: creación de las máquinas, instalación del SO en los nodos, creación de la infraestructura de red, etc.

Una vez diseñada y desplegada la infraestructura básica del clúster, se debe proceder a la instalación de los módulos software para el soporte de computación en clúster, poner en marcha dichos módulos software y finalmente crear un clúster que proporcione el servicio indicado en alta disponibilidad (esto último se realizará en la Práctica 7.2).

Información más detallada se encuentra en las siguientes fuentes bibliográficas:

- "High Availability Add-On Overview". En este manual de Red Hat se introduce el conjunto de herramientas y componentes de Red Hat 7 que dan soporte a la computación en Clúster (denominado High Avalilability Add-On). Su lectura proporciona una visión general de los diferentes componentes del conjunto de herramientas y sus funciones.

- "High Availability Add-On Administration". En el capítulo 1 de este manual de administración de Red Hat se explica el proceso de despliegue e instalación del conjunto de herramientas y componentes de Red Hat 7 que dan soporte a la computación en Clúster (denominado High Avalilability Add-On). Además, en el capítulo 2 se explica, como ejemplo, cómo realizar el despliegue de un servidor apache en alta disponibilidad con Red Hat High Avalilability Add-On.

- "Configuring and managing high availability clusters". Esta fuente bibliográfica contiene contenidos de las dos fuentes anteriores pero actualizados a la versión Red Hat Enterprise Linux 9.

## 2. Requisitos previos

Para abordar esta práctica es muy recomendable haber ejecutado todo el plan de prácticas previo propuesto en la asignatura, pues se trata de un conjunto de prácticas que pretende proporcionar los conocimientos necesarios para poder afrontar con garantía el desarrollo de la actividad que se plantea: la puesta en funcionamiento de un servicio en alta disponibilidad con el conjunto de herramientas proporcionado por Red Hat, High Avalability Add-On, a través de una infraestructura virtual soportada por KVM.

Para acometer esta actividad, debe partir de los resultados obtenidos en la práctica sobre almacenamiento iSCSI. Concretamente debe reutilizar la red aislada y las tres máquinas virtuales desplegadas en esta actividad práctica. **Si aún no ha culminado correctamente dicha actividad, realícela y entonces acometa esta actividad**.

## 3. Desarrollo de la práctica

### Fase 1. Creación de la infraestructura básica del clúster

Se deberá diseñar un servicio en alta disponibilidad en el que intervendrán tres máquinas, de las cuales dos de ellas formarán un clúster. Se tendrá como requerimiento que el tráfico de control del clúster, el de acceso al almacenamiento compartido y el generado por el servicio ofrecido al exterior, no deberán emplear la misma infraestructura de red. Además, cada nodo deberá tener acceso a los repositorios de software externos a través de una infraestructura independiente de las anteriores.

El rol de cada nodo es el siguiente:

- Un nodo dará servicio de almacenamiento compartido al clúster mediante la tecnología iSCSI. Este nodo no formará parte del clúster. Este nodo será una máquina virtual cuyo nombre debe ser Almacenamiento y el nombre de dominio completamente cualificado será `almacenamiento.vpd.com`. Debe utilizar el nodo target (máquina Almacenamiento) desplegado en la práctica iSCSI.

- Dos nodos darán el servicio. El servicio proporcionado será un servidor web Apache. Estos nodos serán dos máquinas virtuales cuyos nombres deben ser Nodo1 y Nodo2 y los nombres de dominio completamente cualificados serán `nodo1.vpd.com` y `nodo2.vpd.com` respectivamente. Debe utilizar los dos nodos initiators (máquinas Nodo1 y Nodo2) que desplegó en la práctica sobre almacenamiento iSCSI.

Las características de la infraestructura que se utilizará en esta actividad se resumen a continuación:

- Los tres nodos (máquinas virtuales) deben tener los siguientes recursos: 1 CPU, 2GB RAM, 1 disco de 10GB de tipo virtio y una instalación mínima de Fedora Server 41 actualizada.

- Tres redes con las siguientes características:

  - La red de tipo NAT de nombre Cluster utilizada en la práctica sobre almacenamiento iSCSI.
  - La red aislada de nombre Almacenamiento utilizada en la práctica anterior.
  - Otra red aislada de nombre Control con dirección de red 10.22.132.0/24 y sin servicio DHCP activo.

- El nodo `almacenamiento.vpd.com` tendrá dos interfaces de red. La primera interfaz estará conectada a la red Almacenamiento con la dirección 10.22.122.10. La segunda interfaz estará conectada a la red NAT Cluster que permitirá la conexión con el exterior. Como ya se ha comentado, debe utilizar la máquina Almacenamiento desplegada en la práctica sobre almacenamiento iSCSI para este nodo.

- El nodo `nodo1.vpd.com` tendrá tres interfaces de red. La primera interfaz estará conectada a la red aislada Almacenamiento con la dirección 10.22.122.11. La segunda interfaz estará conectada a la red NAT Cluster, posibilitando la conexión con el exterior. Por último, la tercera interfaz estará conectada a la red aislada Control con la dirección 10.22.132.11. Como ya se ha comentado, debe utilizar la máquina Nodo1 desplegada en la práctica sobre almacenamiento iSCSI para este nodo. Sin embargo, tenga en cuenta que debe variar su configuración para que se cumplan las especificaciones relativas a las interfaces de red.

- El nodo `nodo2.vpd.com` tendrá tres interfaces de red. La primera interfaz estará conectada a la red Almacenamiento con la dirección 10.22.122.12. La segunda interfaz estará conectada a la red NAT Cluster, posibilitando la conexión con el exterior. Por último, la tercera interfaz estará conectada a la red aislada Control, con la dirección 10.22.132.12. Como ya se ha comentado, debe utilizar la máquina Nodo2 desplegada en la práctica sobre almacenamiento iSCSI para este nodo. Sin embargo, tenga en cuenta que debe variar su configuración para que se cumplan las especificaciones relativas a las interfaces de red.

#### Tarea 1.1. Preparación de la infraestructura

Plan de trabajo para esta fase (asumiendo que se parte de los resultados de la práctica sobre iSCSI):

1. Crear la red privada Control.

```control.xml
root@lq-d25:~# cat control.xml 
<network>
	<name>Control</name>
	<bridge name='virbr3' stp='on' delay='0'/>
	<ip address='10.22.132.1' netmask='255.255.255.0'>
	</ip>
</network>
```

```bash
root@lq-d25:~# virsh net-define control.xml 
La red Control se encuentra definida desde control.xml

root@lq-d25:~# virsh net-start Control 
La red Control se ha iniciado

root@lq-d25:~# virsh net-autostart Control 
La red Control ha sido marcada para iniciarse automáticamente
```

```bash
root@lq-d25:~# virsh net-list --all
 Nombre           Estado   Inicio automático   Persistente
------------------------------------------------------------
 Almacenamiento   activo   si                  si
 Cluster          activo   si                  si
 Control          activo   si                  si
 default          activo   si                  si
```

```bash
root@lq-d25:~# virsh net-info Control 
Nombre:         Control
UUID:           710208f0-b476-41f4-9a2d-20596c791dbf
Activar:        si
Persistente:    si
Autoinicio:     si
Puente:         virbr3
```

```bash
root@lq-d25:~# ip addr show virbr3
7: virbr3: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1500 qdisc noqueue state DOWN group default qlen 1000
    link/ether 52:54:00:7c:d5:29 brd ff:ff:ff:ff:ff:ff
    inet 10.22.132.1/24 brd 10.22.132.255 scope global virbr3
       valid_lft forever preferred_lft forever
```


2. En Nodo1 y Nodo2 añadir una nueva interfaz de red.

**En nodo 1**:

```bash
root@lq-d25:~# sudo virsh attach-interface --domain Nodo1 --type network --source Control --model virtio --config
La interfaz ha sido asociada exitosamente
```

```bash
[root@nodo1 ~]# nmcli connection add type ethernet con-name Control ifname enp8s0 ipv4.m
ipv4.may-fail  ipv4.method
```

```bash
[root@nodo1 ~]# nmcli connection add type ethernet con-name Control ifname enp8s0 ipv4.method manual ipv4.addresses 10.122.132.11/24
Conexión «Control» (5bd4dd51-3ae1-4952-96b0-f1b552750a84) añadida con éxito.
```

```bash
[root@nodo1 ~]# nmcli connection up Control
Conexión activada con éxito (ruta activa D-Bus: /org/freedesktop/NetworkManager/ActiveConnection/9)
```

```bash
[root@nodo1 ~]# ip addr show enp8s0 
4: enp8s0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000
    link/ether 52:54:00:af:20:ef brd ff:ff:ff:ff:ff:ff
    inet 10.122.132.11/24 brd 10.122.132.255 scope global noprefixroute enp8s0
       valid_lft forever preferred_lft forever
    inet6 fe80::20a0:8206:7964:ea87/64 scope link noprefixroute 
       valid_lft forever preferred_lft forever
```


**En nodo 2**:

```bash
root@lq-d25:~# sudo virsh attach-interface --domain Nodo2 --type network --source Control --model virtio --config
La interfaz ha sido asociada exitosamente
```

```bash
[root@nodo2 ~]# nmcli connection add type ethernet con-name Control ifname enp8s0 ipv4.method manual ipv4.addresses 10.122.132.12/24
Conexión «Control» (44c1efa5-be2c-4565-9baf-655865d579fe) añadida con éxito.
```

```bash
[root@nodo2 ~]# nmcli connection up Control 
Conexión activada con éxito (ruta activa D-Bus: /org/freedesktop/NetworkManager/ActiveConnection/9)
```

```bash
[root@nodo2 ~]# ip addr show enp8s0
4: enp8s0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000
    link/ether 52:54:00:6b:ad:d9 brd ff:ff:ff:ff:ff:ff
    inet 10.122.132.12/24 brd 10.122.132.255 scope global noprefixroute enp8s0
       valid_lft forever preferred_lft forever
    inet6 fe80::e87a:1d40:fc79:1f7f/64 scope link noprefixroute 
       valid_lft forever preferred_lft forever
```

3. En Nodo1 y Nodo2 reconfigurar las interfaces de red para que cumplan las especificaciones. Esto es que la primera interfaz esté conectada a la red Almacenamiento, la segunda interfaz a la red Cluster y, por último, la tercera interface a la red Control. Recuerde que la configuración de las interfaces de las redes Almacenamiento y Control se debe establecer de forma manual.

Nodo 1:

```bash
[root@nodo1 ~]# ip addr
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
    inet6 ::1/128 scope host noprefixroute 
       valid_lft forever preferred_lft forever
2: enp1s0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000
    link/ether 52:54:00:f9:be:78 brd ff:ff:ff:ff:ff:ff
    inet 10.22.122.11/24 brd 10.22.122.255 scope global noprefixroute enp1s0
       valid_lft forever preferred_lft forever
    inet6 fe80::698a:e0e6:e8b0:d494/64 scope link noprefixroute 
       valid_lft forever preferred_lft forever
3: enp7s0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000
    link/ether 52:54:00:05:fd:ec brd ff:ff:ff:ff:ff:ff
    inet 192.168.140.116/24 brd 192.168.140.255 scope global dynamic noprefixroute enp7s0
       valid_lft 3425sec preferred_lft 3425sec
    inet6 fe80::81:d839:b5cd:6ff5/64 scope link noprefixroute 
       valid_lft forever preferred_lft forever
4: enp8s0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000
    link/ether 52:54:00:af:20:ef brd ff:ff:ff:ff:ff:ff
    inet6 fe80::a2ce:e9b9:8b05:7f3e/64 scope link noprefixroute 
       valid_lft forever preferred_lft forever

```

Nodo 2:

```bash
[root@nodo2 ~]# ip addr
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
    inet6 ::1/128 scope host noprefixroute 
       valid_lft forever preferred_lft forever
2: enp1s0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000
    link/ether 52:54:00:a3:82:83 brd ff:ff:ff:ff:ff:ff
    inet 10.22.122.12/24 brd 10.22.122.255 scope global noprefixroute enp1s0
       valid_lft forever preferred_lft forever
    inet6 fe80::4c9f:ac5d:73af:d24f/64 scope link noprefixroute 
       valid_lft forever preferred_lft forever
3: enp7s0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000
    link/ether 52:54:00:33:fd:52 brd ff:ff:ff:ff:ff:ff
    inet 192.168.140.120/24 brd 192.168.140.255 scope global dynamic noprefixroute enp7s0
       valid_lft 3471sec preferred_lft 3471sec
    inet6 fe80::da77:319b:6a4c:659/64 scope link noprefixroute 
       valid_lft forever preferred_lft forever
4: enp8s0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000
    link/ether 52:54:00:6b:ad:d9 brd ff:ff:ff:ff:ff:ff
    inet6 fe80::4bdb:ca2c:5f39:ac48/64 scope link noprefixroute 
       valid_lft forever preferred_lft forever
```

4. Hacer un "update" de la instalación existente en cada uno de los nodos, esto es en las máquinas Nodo1 y Nodo2. **Importante, no debe hacer la operación "update" en el sistema anfitrión**.

5. Establecer el nombre de dominio completamente cualificado en cada máquina (orden hostnamectl). En el caso del nodo Almacenamiento `almacenamiento.vpd.com`, en el caso de Nodo1 `nodo1.vpd.com` y en el caso de Nodo2 `nodo2.vpd.com`.

6. Añadir los nombres e IPs de todas las máquinas que intervienen en la práctica en el fichero `/etc/hosts`:

Contenido del fichero `/etc/hosts` en Nodo1 y Nodo2:

```bash
127.0.0.1   localhost localhost.localdomain localhost4 localhost4.localdomain4
::1         localhost localhost.localdomain localhost6 localhost6.localdomain6
10.22.122.10 almacenamiento.vpd.com
10.22.132.11 nodo1.vpd.com
10.22.132.12 nodo2.vpd.com
```

Contenido del fichero `/etc/hosts` en el nodo Almacenamiento:

```bash
127.0.0.1   localhost localhost.localdomain localhost4 localhost4.localdomain4
::1         localhost localhost.localdomain localhost6 localhost6.localdomain6
10.22.122.10 almacenamiento.vpd.com
10.22.122.11 nodo1.vpd.com
10.22.122.12 nodo2.vpd.com
```

**IMPORTANTE**: Al concluir esta fase deberá comprobar que todas las máquinas tienen conectividad al exterior y entre ellas utilizando las distintas interfaces de red. Para ello es fundamental que desde cada máquina realice pruebas de conexión con el resto de las máquinas para cada interfaz, empleando para ello tanto las direcciones IP asignadas a cada interfaz como los nombres de dominio completamente cualificados de las máquinas. Compruebe también la conectividad con la puerta de enlace del host anfitrión para cada red (10.22.122.1 y 10.22.132.1). Estas pruebas de conexión las puede realizar empleando, por ejemplo, la orden ping. Al concluir esta fase se recomienda hacer copias de seguridad de los tres nodos (estado_1).

> **Nota**: Antes de continuar con la siguiente fase debe validar el trabajo realizado con los profesores de la asignatura.

### Comandos detallados por pasos

```bash
# Paso 1: Crear la red privada Control
sudo virsh net-define control.xml  # o usar virt-manager para crear una red aislada 10.22.132.0/24
sudo virsh net-start Control
sudo virsh net-autostart Control

# Paso 2: Añadir una nueva interfaz de red (para Control) a Nodo1 y Nodo2
sudo virsh attach-interface --domain Nodo1 --type network --source Control --model virtio --config --live
sudo virsh attach-interface --domain Nodo2 --type network --source Control --model virtio --config --live

# Paso 3: Reconfigurar interfaces de red en Nodo1 y Nodo2
# Nodo1
sudo virsh start Nodo1
sudo virsh console Nodo1
hostnamectl set-hostname nodo1.vpd.com
nmcli con add type ethernet con-name enp1s0 ifname enp1s0 ipv4.method manual ipv4.addresses 10.22.122.11/24
nmcli con add type ethernet con-name enp7s0 ifname enp7s0 ipv4.method auto
nmcli con add type ethernet con-name enp8s0 ifname enp8s0 ipv4.method manual ipv4.addresses 10.22.132.11/24
nmcli con up enp1s0
nmcli con up enp7s0
nmcli con up enp8s0

# Nodo2
sudo virsh start Nodo2
sudo virsh console Nodo2
hostnamectl set-hostname nodo2.vpd.com
nmcli con add type ethernet con-name enp1s0 ifname enp1s0 ipv4.method manual ipv4.addresses 10.22.122.12/24
nmcli con add type ethernet con-name enp7s0 ifname enp7s0 ipv4.method auto
nmcli con add type ethernet con-name enp8s0 ifname enp8s0 ipv4.method manual ipv4.addresses 10.22.132.12/24
nmcli con up enp1s0
nmcli con up enp7s0
nmcli con up enp8s0

# Paso 4: Actualizar los nodos
sudo dnf update -y  # Ejecutar solo dentro de Nodo1 y Nodo2

# Paso 5: Establecer hostname (ya hecho en paso 3 con hostnamectl)

# Paso 6: Editar /etc/hosts en todos los nodos
# Nodo1 y Nodo2:
echo -e "127.0.0.1 localhost\n::1 localhost\n10.22.122.10 almacenamiento.vpd.com\n10.22.132.11 nodo1.vpd.com\n10.22.132.12 nodo2.vpd.com" > /etc/hosts

# Nodo almacenamiento:
echo -e "127.0.0.1 localhost\n::1 localhost\n10.22.122.10 almacenamiento.vpd.com\n10.22.122.11 nodo1.vpd.com\n10.22.122.12 nodo2.vpd.com" > /etc/hosts

# Paso final: Validar conectividad
ping -c 3 10.22.122.10  # desde nodo1/nodo2 a almacenamiento
ping -c 3 10.22.132.11  # desde nodo2 a nodo1 y viceversa
ping -c 3 8.8.8.8       # verificar acceso a Internet
```

### Fase 2. Instalación del servidor Apache

En esta etapa realizaremos la instalación y configuración de un servidor web Apache en Nodo1 y Nodo2 utilizando el espacio de almacenamiento compartido iSCSI que nos proporciona el nodo de almacenamiento.

Se deberá instalar y configurar el servidor Apache en Nodo1 y Nodo2 de manera que el directorio de contenidos del servicio (`/var/www`) se encuentre en el volumen lógico apacheLV ubicado en el espacio compartido de almacenamiento desplegado en la práctica sobre iSCSI.

#### Tarea 2.1. Instalación y configuración del servidor Apache

Plan de trabajo para esta fase:

1. En Nodo1 instalar y configurar el servidor Apache. **No configurar el servicio para que se inicie automáticamente con el arranque del sistema**.

2. Arrancando manualmente el servicio, verificar que funciona correctamente accediendo desde el anfitrión mediante un navegador o utilizando la orden curl. Si todo está correcto, entonces se deberá mostrar la página de test del servicio Apache. Una vez verificado, parar el servicio Apache. Para ello, podría utilizar las direcciones IP que tienen configuradas las interfaces de red del nodo. Se recomienda probar con la IP de la interfaz conectada a la red NAT Cluster.

3. En Nodo2 instalar y configurar el servidor Apache. **No configurar el servicio para que se inicie automáticamente con el arranque del sistema**.

4. Arrancando manualmente el servicio, verificar que funciona correctamente accediendo desde el anfitrión mediante un navegador o utilizando la orden curl. Si todo está correcto, entonces se deberá mostrar la página de test del servicio Apache. Una vez verificado, parar el servicio Apache. Para ello, podría utilizar las direcciones IP que tienen configuradas las interfaces de red del nodo. Se recomienda probar con la IP de la interfaz conectada a la red NAT Cluster.


#### Tarea 2.2. Configuración del almacenamiento compartido para Apache

### Comandos detallados para Fase 2

```bash
# Paso 5: Montar el volumen lógico apacheLV
lvscan  # verificar que el volumen apacheLV está visible
mkdir -p /var/www
mount /dev/mapper/vgX-apacheLV /var/www  # Reemplaza vgX con el nombre correcto del grupo de volúmenes

# Paso 6: Preparar estructura de directorios
chcon --user=system_u /var/www
mkdir -p /var/www/html
mkdir -p /var/www/cgi-bin

# Paso 7: Crear archivo index.html
echo "<html><body>Enhorabuena: configuración correcta</body></html>" > /var/www/html/index.html

# Paso 8: Restaurar contextos SELinux
restorecon -Rv /var/www

# Paso 9: Verificar Apache
sudo systemctl start httpd
curl http://localhost         # o curl http://<ip_nodo>
sudo systemctl stop httpd

# Paso 10: Desmontar el volumen
umount /var/www

# Paso 11: Repetir en el segundo nodo
# Montar volumen, iniciar servicio y verificar
mount /dev/mapper/vgX-apacheLV /var/www
sudo systemctl start httpd
curl http://localhost         # verificar contenido
```

5. En uno de los nodos que formarán parte del cluster (Nodo1 o Nodo2), montar el volumen lógico compartido apacheLV en el directorio `/var/www`.

6. En el mismo nodo, una vez montado el volumen lógico apacheLV en `/var/www`, construir en este directorio la estructura de directorios que el servicio httpd espera encontrar. Para ello, en primer lugar deberá hacer que el usuario SElinux system_u sea el usuario de contexto SElinux, de forma que los directorios se creen con las etiquetas de usuario SELinux adecuadas. A continuación, deberá crear los directorios html y cgi-bin en el directorio `/var/www`.

7. En el mismo nodo, una vez realizado el paso anterior, en el directorio `/var/www/html` cree el archivo index.html y almacene en él el siguiente contenido html:

```html
<html>
  <body>
    Enhorabuena: configuración correcta
  </body>
</html>
```

8. Una vez realizado el paso anterior, en el mismo nodo, establecer al directorio `/var/www` y sus descendientes los atributos de contexto SElinux correctos para que cuando el servicio httpd intente acceder a los archivos de contenidos no se produzca un error de seguridad.

9. Una vez realizado el paso anterior, en el mismo nodo, verificar que el servidor web Apache funciona correctamente. Para ello debe arrancar manualmente el servicio y acceder desde el anfitrión mediante un navegador o usando la orden curl. Si se muestra el contenido del archivo `/var/www/html/index.html`, entonces es que la configuración realizada es correcta. **Si no se muestra el contenido del fichero mencionado, entonces es que la configuración realizada no es correcta y debe repasarla**.

10. Una vez superada la prueba realizada en el paso anterior, pare el servicio httpd y desmonte el volumen compartido apacheLV.

11. En el otro nodo, verificar que el servidor web Apache funciona correctamente. Para ello debe, en primer lugar, montar el volumen compartido apacheLV en el directorio `/var/www` y, en segundo lugar, arrancar manualmente el servicio y acceder desde el anfitrión mediante un navegador o usando la orden curl. Si se muestra el contenido del archivo `/var/www/html/index.html`, entonces es que la configuración realizada es correcta. Si no se muestra el contenido del fichero mencionado, entonces es que la configuración realizada no es correcta y debe repasarla.

## 4. Pruebas y validación

### Pruebas de conectividad

- Verificar conectividad entre todos los nodos por todas las interfaces (`ping` entre IPs y FQDNs).
- Verificar conectividad a Internet desde Nodo1 y Nodo2: `ping -c 3 8.8.8.8`.
- Verificar rutas correctas: `ip route`.

### Verificación de Apache

- En Nodo1:
  - Montar `/var/www` con el volumen apacheLV.
  - Iniciar manualmente `httpd`: `sudo systemctl start httpd`.
  - Verificar con `curl http://<IP_Cluster_Nodo1>` que devuelve el mensaje de "Enhorabuena".
  - Parar el servicio: `sudo systemctl stop httpd`.

- En Nodo2:
  - Montar `/var/www` con el volumen apacheLV.
  - Iniciar manualmente `httpd`: `sudo systemctl start httpd`.
  - Verificar con `curl http://<IP_Cluster_Nodo2>` que devuelve el mismo contenido.
  - Parar el servicio: `sudo systemctl stop httpd`.

### Verificación de almacenamiento compartido

- Confirmar que el contenido creado en `/var/www` en un nodo aparece correctamente en el otro tras montar el volumen.

### Recomendación

- Realizar capturas de pantalla de cada verificación y adjuntarlas como evidencia.

## 5. Conclusiones

En esta sección debe incluir:

- Resumen del trabajo realizado
- Dificultades encontradas y soluciones aplicadas
- Conocimientos adquiridos
- Posibles mejoras o ampliaciones futuras

## 6. Bibliografía

1. Red Hat. (2023). "High Availability Add-On Overview". [Enlace](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/7/html/high_availability_add-on_overview/index)

2. Red Hat. (2023). "High Availability Add-On Administration". [Enlace](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/7/html/high_availability_add-on_administration/index)

3. Red Hat. (2023). "Configuring and managing high availability clusters". [Enlace](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/9/html/configuring_and_managing_high_availability_clusters/index)
