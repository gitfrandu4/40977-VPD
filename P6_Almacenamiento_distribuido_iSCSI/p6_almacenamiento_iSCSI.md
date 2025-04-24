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

Ejecución de los comandos: 

```bash
root@lq-d25:~# virsh detach-disk Almacenamiento sda --persistent
El disco ha sido desmontado exitosamente

root@lq-d25:~# virsh domiflist Almacenamiento
 Interfaz   Tipo      Fuente    Modelo   MAC
------------------------------------------------------------
 -          network   default   virtio   00:16:3e:76:57:a0

root@lq-d25:~# virsh detach-interface Almacenamiento --type network --mac 00:16:3e:76:57:a0 --persistent
La interfaz ha sido desmontada exitosamente

root@lq-d25:~# virsh vol-create-as default vol1_p6.qcow2 1G --format qcow2
Se ha creado el volumen vol1_p6.qcow2

root@lq-d25:~# virsh vol-create-as default vol2_p6.img 1G --format raw
Se ha creado el volumen vol2_p6.img

root@lq-d25:~# virsh attach-disk Almacenamiento /var/lib/libvirt/images/vol1_p6.qcow2 sda --driver qemu --type disk --subdriver qcow2 --persistent
El disco ha sido asociado exitosamente

root@lq-d25:~# virsh attach-disk Almacenamiento /var/lib/libvirt/images/vol2_p6.img sdb --driver qemu --type disk --subdriver raw --persistent
El disco ha sido asociado exitosamente

root@lq-d25:~# virsh attach-interface Almacenamiento --type network --source Almacenamiento --model virtio --persistent
La interfaz ha sido asociada exitosamente

root@lq-d25:~# virsh attach-interface Almacenamiento --type network --source Cluster --model virtio --persistent
La interfaz ha sido asociada exitosamente
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

Ejecución de los comandos:

```bash
root@lq-d25:~# virsh console Almacenamiento
Connected to domain 'Almacenamiento'
Escape character is ^] (Ctrl + ])

mvp1 login: 
mvp1 login: root
Contraseña: 
Last login: Thu Apr 24 19:40:12 on tty1
```


```bash
[root@mvp1 ~]# ip link show
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN mode DEFAULT group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
2: enp8s0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP mode DEFAULT group default qlen 1000
    link/ether 52:54:00:48:9c:c6 brd ff:ff:ff:ff:ff:ff
3: enp9s0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP mode DEFAULT group default qlen 1000
    link/ether 52:54:00:52:44:62 brd ff:ff:ff:ff:ff:ff
[root@mvp1 ~]# hostnamectl set-hostname almacenamiento.vpd.com
```

```bash
[root@mvp1 ~]# nmcli con add type ethernet con-name enp8s0 ifname enp8s0 ipv4.method manual ipv4.addresses 10.22.122.10/24
Conexión «enp8s0» (5dbc051d-b4f5-4990-905f-472a9ef38463) añadida con éxito.
[root@mvp1 ~]# nmcli con up enp8s0
Conexión activada con éxito (ruta activa D-Bus: /org/freedesktop/NetworkManager/ActiveConnection/8)
```

```bash
[root@mvp1 ~]# nmcli con add type ethernet con-name enp9s0 ifname enp9s0 ipv4.method  auto
Conexión «enp9s0» (d39257b3-3a45-4262-91ff-9401751d0e90) añadida con éxito.
[root@mvp1 ~]# nmcli con up enp9s0
Conexión activada con éxito (ruta activa D-Bus: /org/freedesktop/NetworkManager/ActiveConnection/9)
```

##### Validaciones:

```bash
[root@mvp1 ~]# hostnamectl
     Static hostname: almacenamiento.vpd.com
           Icon name: computer-vm
             Chassis: vm 🖴
          Machine ID: 6d2630bf3d2046a589c37eaa7313994b
             Boot ID: 3392fb66d8a846e28e308c314b46b009
        Product UUID: 9ac8572e-eda5-44f9-8282-5acbbb68449e
      Virtualization: kvm
    Operating System: Fedora Linux 41 (Server Edition)    
         CPE OS Name: cpe:/o:fedoraproject:fedora:41
      OS Support End: Mon 2025-12-15
OS Support Remaining: 7month 3w
              Kernel: Linux 6.12.11-200.fc41.x86_64
        Architecture: x86-64
     Hardware Vendor: QEMU
      Hardware Model: Standard PC _Q35 + ICH9, 2009_
    Firmware Version: 1.16.3-1.fc39
       Firmware Date: Tue 2014-04-01
        Firmware Age: 11y 3w 3d                           
[root@mvp1 ~]# nmcli device status
DEVICE  TYPE      STATE                   CONNECTION 
enp9s0  ethernet  conectado               enp9s0     
enp8s0  ethernet  conectado               enp8s0     
lo      loopback  connected (externally)  lo         
[root@mvp1 ~]# ip a
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
    inet6 ::1/128 scope host noprefixroute 
       valid_lft forever preferred_lft forever
2: enp8s0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000
    link/ether 52:54:00:48:9c:c6 brd ff:ff:ff:ff:ff:ff
    inet 10.22.122.10/24 brd 10.22.122.255 scope global noprefixroute enp8s0
       valid_lft forever preferred_lft forever
    inet6 fe80::37b9:2f10:35ed:596c/64 scope link noprefixroute 
       valid_lft forever preferred_lft forever
3: enp9s0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000
    link/ether 52:54:00:52:44:62 brd ff:ff:ff:ff:ff:ff
    inet 192.168.140.80/24 brd 192.168.140.255 scope global dynamic noprefixroute enp9s0
       valid_lft 2218sec preferred_lft 2218sec
    inet6 fe80::3f3d:da7f:2578:6085/64 scope link noprefixroute 
       valid_lft forever preferred_lft forever
[root@mvp1 ~]# ping -c 3 8.8.8.8
PING 8.8.8.8 (8.8.8.8) 56(84) bytes of data.
64 bytes from 8.8.8.8: icmp_seq=1 ttl=114 time=33.8 ms
64 bytes from 8.8.8.8: icmp_seq=2 ttl=114 time=34.3 ms

--- 8.8.8.8 ping statistics ---
2 packets transmitted, 2 received, 0% packet loss, time 1002ms
rtt min/avg/max/mdev = 33.839/34.090/34.341/0.251 ms
[root@mvp1 ~]# nmcli con show --active
NAME    UUID                                  TYPE      DEVICE 
enp9s0  d39257b3-3a45-4262-91ff-9401751d0e90  ethernet  enp9s0 
enp8s0  5dbc051d-b4f5-4990-905f-472a9ef38463  ethernet  enp8s0 
lo      4ccd3034-48b7-4ca9-af3e-6c44e0aa7acb  loopback  lo     
[root@mvp1 ~]# ip route
default via 192.168.140.1 dev enp9s0 proto dhcp src 192.168.140.80 metric 103 
10.22.122.0/24 dev enp8s0 proto kernel scope link src 10.22.122.10 metric 102 
192.168.140.0/24 dev enp9s0 proto kernel scope link src 192.168.140.80 metric 103 

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
```

Ejecución de los comandos:

```bash
root@lq-d25:~# virsh detach-disk Nodo1 sda --persistent
El disco ha sido desmontado exitosamente

root@lq-d25:~# virsh dom
domblkerror           domdisplay            domifaddr             domjobinfo            domstate
domblkinfo            dom-fd-associate      domif-getlink         domlaunchsecinfo      domstats
domblklist            domfsfreeze           domiflist             dommemstat            domtime
domblkstat            domfsinfo             domif-setlink         domname               domuuid
domblkthreshold       domfsthaw             domifstat             dompmsuspend          domxml-from-native
domcapabilities       domfstrim             domiftune             dompmwakeup           domxml-to-native
domcontrol            domhostname           dominfo               domrename             
domdirtyrate-calc     domid                 domjobabort           domsetlaunchsecstate  
root@lq-d25:~# virsh domblklist Nodo1
 Destino   Fuente
------------------------------------------------
 vda       /var/lib/libvirt/images/Nodo1.qcow2

root@lq-d25:~# virsh domiflist Nodo1
 Interfaz   Tipo      Fuente    Modelo   MAC
------------------------------------------------------------
 -          network   default   virtio   00:16:3e:2a:bc:c9

root@lq-d25:~# 
root@lq-d25:~# virsh detach-interface Nodo1 --type network --mac 00:16:3e:2a:bc:c9 --persistent
La interfaz ha sido desmontada exitosamente

root@lq-d25:~# virsh attach-interface Nodo1 --type network --source Almacenamiento --model virtio --persistent
La interfaz ha sido asociada exitosamente

root@lq-d25:~# virsh attach-interface Nodo1 --type network --source Cluster --model virtio --persistent
La interfaz ha sido asociada exitosamente

root@lq-d25:~# virsh domiflist Nodo1
 Interfaz   Tipo      Fuente           Modelo   MAC
-------------------------------------------------------------------
 -          network   Almacenamiento   virtio   52:54:00:f9:be:78
 -          network   Cluster          virtio   52:54:00:05:fd:ec
```

```bash
# Configuración para Nodo2
# Eliminar el dispositivo lector de CD-ROM del bus SATA
virsh detach-disk Nodo2 sda --persistent

# Eliminar la interfaz de red por defecto
virsh detach-interface Nodo2 --type network --mac <MAC_INTERFAZ_POR_DEFECTO> --persistent

# Añadir interfaces de red paravirtualizadas
virsh attach-interface Nodo2 --type network --source Almacenamiento --model virtio --persistent
virsh attach-interface Nodo2 --type network --source Cluster --model virtio --persistent
```

Ejecución de los comandos:

```bash
root@lq-d25:~# virsh detach-disk Nodo2 sda --persistent
El disco ha sido desmontado exitosamente

root@lq-d25:~# virsh domiflist Nodo2
 Interfaz   Tipo      Fuente    Modelo   MAC
------------------------------------------------------------
 -          network   default   virtio   00:16:3e:35:90:9c

root@lq-d25:~# virsh detach-interface Nodo2 --type network --mac 00:16:3e:35:90:9c --persistent
La interfaz ha sido desmontada exitosamente

root@lq-d25:~# virsh attach-interface Nodo2 --type network --source Almacenamiento --model virtio --persistent
La interfaz ha sido asociada exitosamente

root@lq-d25:~# virsh attach-interface Nodo2 --type network --source Cluster --model virtio --persistent
La interfaz ha sido asociada exitosamente

root@lq-d25:~# virsh domiflist Nodo2
 Interfaz   Tipo      Fuente           Modelo   MAC
-------------------------------------------------------------------
 -          network   Almacenamiento   virtio   52:54:00:a3:82:83
 -          network   Cluster          virtio   52:54:00:33:fd:52
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

Ejecución de los comandos para Nodo1

```bash
root@lq-d25:~# virsh console Nodo1
Connected to domain 'Nodo1'
Escape character is ^] (Ctrl + ])
Web console: https://localhost:9090/

mvp1 login: root
Contraseña: 
Last login: Thu Apr 24 19:58:47 on ttyS0
[root@mvp1 ~]# hostnamectl set-hostname nodo1.vpd.com
[root@mvp1 ~]# ip link show
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN mode DEFAULT group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
2: enp1s0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP mode DEFAULT group default qlen 1000
    link/ether 52:54:00:f9:be:78 brd ff:ff:ff:ff:ff:ff
3: enp7s0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP mode DEFAULT group default qlen 1000
    link/ether 52:54:00:05:fd:ec brd ff:ff:ff:ff:ff:ff

[root@mvp1 ~]# nmcli con add type ethernet con-name enp1s0 ifname enp1s0 ipv4.method manual ipv4.addresses 10.22.122.11/24
Aviso: hay otra conexión con el nombre «enp1s0». Haga referencia a la conexión por su uuid «a8ab3908-5526-4f91-8171-762e42ac49ea»
Conexión «enp1s0» (a8ab3908-5526-4f91-8171-762e42ac49ea) añadida con éxito.

[root@nodo1 ~]# nmcli con add type ethernet con-name enp7s0 ifname enp7s0 ipv4.method auto
[root@nodo1 ~]# nmcli con up enp7s0
Conexión activada con éxito (ruta activa D-Bus: /org/freedesktop/NetworkManager/ActiveConnection/9)

[root@nodo1 ~]# ip a show
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
       valid_lft 3154sec preferred_lft 3154sec
    inet6 fe80::81:d839:b5cd:6ff5/64 scope link noprefixroute 
       valid_lft forever preferred_lft forever

```

Ahora ejecución de los comandos para Nodo2

```bash
[root@mvp1 ~]# nmcli con add type ethernet con-name enp1s0 ifname enp1s0 ipv4.method manual ipv4.addresses 10.22.122.12/24
Conexión «enp1s0» (e695cda7-3af3-4246-b5fb-88d7f0ecfbcd) añadida con éxito.
[root@mvp1 ~]# nmcli con add type ethernet con-name enp7s0 ifname enp7s0 ipv4.method auto
[root@mvp1 ~]# nmcli con up enp7s0
Conexión activada con éxito (ruta activa D-Bus: /org/freedesktop/NetworkManager/ActiveConnection/6)

[root@mvp1 ~]# ip a show
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
       valid_lft 3429sec preferred_lft 3429sec
    inet6 fe80::da77:319b:6a4c:659/64 scope link noprefixroute 
       valid_lft forever preferred_lft forever
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
