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

Algunas validaciones:

```bash
[root@nodo1 ~]# ip addr show enp1s0 
2: enp1s0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000
    link/ether 52:54:00:f9:be:78 brd ff:ff:ff:ff:ff:ff
    inet 10.22.122.11/24 brd 10.22.122.255 scope global noprefixroute enp1s0
       valid_lft forever preferred_lft forever
    inet6 fe80::698a:e0e6:e8b0:d494/64 scope link noprefixroute 
       valid_lft forever preferred_lft forever
[root@nodo1 ~]# ip addr show enp7s0 
3: enp7s0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000
    link/ether 52:54:00:05:fd:ec brd ff:ff:ff:ff:ff:ff
    inet 192.168.140.116/24 brd 192.168.140.255 scope global dynamic noprefixroute enp7s0
       valid_lft 2937sec preferred_lft 2937sec
    inet6 fe80::81:d839:b5cd:6ff5/64 scope link noprefixroute 
       valid_lft forever preferred_lft forever
[root@nodo1 ~]# ping 8.8.8.8
PING 8.8.8.8 (8.8.8.8) 56(84) bytes of data.
64 bytes from 8.8.8.8: icmp_seq=1 ttl=114 time=34.0 ms
64 bytes from 8.8.8.8: icmp_seq=2 ttl=114 time=34.1 ms

--- 8.8.8.8 ping statistics ---
2 packets transmitted, 2 received, 0% packet loss, time 1002ms
rtt min/avg/max/mdev = 34.041/34.078/34.115/0.037 ms
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

Algunas validaciones:

```bash
[root@mvp1 ~]# hostname
nodo2.vpd.com
[root@mvp1 ~]# ip addr show enp1s0 
2: enp1s0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000
    link/ether 52:54:00:a3:82:83 brd ff:ff:ff:ff:ff:ff
    inet 10.22.122.12/24 brd 10.22.122.255 scope global noprefixroute enp1s0
       valid_lft forever preferred_lft forever
    inet6 fe80::4c9f:ac5d:73af:d24f/64 scope link noprefixroute 
       valid_lft forever preferred_lft forever
[root@mvp1 ~]# ip addr show enp7s0 
3: enp7s0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000
    link/ether 52:54:00:33:fd:52 brd ff:ff:ff:ff:ff:ff
    inet 192.168.140.120/24 brd 192.168.140.255 scope global dynamic noprefixroute enp7s0
       valid_lft 3120sec preferred_lft 3120sec
    inet6 fe80::da77:319b:6a4c:659/64 scope link noprefixroute 
       valid_lft forever preferred_lft forever
[root@mvp1 ~]# ping 8.8.8.8
PING 8.8.8.8 (8.8.8.8) 56(84) bytes of data.
64 bytes from 8.8.8.8: icmp_seq=1 ttl=114 time=33.9 ms
64 bytes from 8.8.8.8: icmp_seq=2 ttl=114 time=34.2 ms

--- 8.8.8.8 ping statistics ---
2 packets transmitted, 2 received, 0% packet loss, time 1002ms
rtt min/avg/max/mdev = 33.855/34.041/34.228/0.186 ms
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
[root@almacenamiento ~]# dnf install targetcli
Actualizando y cargando repositorios:
...
Installing:
 targetcli                 noarch 2.1.58-3.fc41           fedora       275.7 KiB
...
Installing:
 targetcli                 noarch 2.1.58-3.fc41           fedora       275.7 KiB
```

#### Paso 3: Inicio del servicio target

```bash
[root@almacenamiento ~]# systemctl start target
```

#### Paso 4: Configuración del arranque automático

```bash
[root@almacenamiento ~]# systemctl enable target
Created symlink '/etc/systemd/system/multi-user.target.wants/target.service' → '/usr/lib/systemd/system/target.service'.
```

#### Paso 5: Configuración del cortafuegos

```bash
[root@almacenamiento ~]# firewall-cmd --permanent --add-port=3260/tcp
success
[root@almacenamiento ~]# firewall-cmd --reload
success
```

#### Paso 6: Configuración del recurso de almacenamiento a exportar

```bash
[root@almacenamiento ~]# targetcli
targetcli shell version 2.1.58
Copyright 2011-2013 by Datera, Inc and others.
For help on commands, type 'help'.
/> ls
o- / ..................................................................... [...]
  o- backstores .......................................................... [...]
  | o- block .............................................. [Storage Objects: 0]
  | o- fileio ............................................. [Storage Objects: 0]
  | o- pscsi .............................................. [Storage Objects: 0]
  | o- ramdisk ............................................ [Storage Objects: 0]
  o- iscsi ........................................................ [Targets: 0]
  o- loopback ..................................................... [Targets: 0]
  o- vhost ........................................................ [Targets: 0]
```

```bash
/> cd /backstores/block 
/backstores/block>
```

```bash
/backstores/block> create name=discosda dev=/dev/sdb
```

```bash
/backstores/block> cd /iscsi 
/iscsi> create wwn=iqn.2025-04.com.vpd:discosda
Created target iqn.2025-04.com.vpd:discosda.
Created TPG 1.
Global pref auto_add_default_portal=true
Created default portal listening on all IPs (0.0.0.0), port 3260.
/iscsi> ls
o- iscsi .......................................................... [Targets: 1]
  o- iqn.2025-04.com.vpd:discosda .................................... [TPGs: 1]
    o- tpg1 ............................................. [no-gen-acls, no-auth]
      o- acls ........................................................ [ACLs: 0]
      o- luns ........................................................ [LUNs: 0]
      o- portals .................................................. [Portals: 1]
        o- 0.0.0.0:3260 ................................................... [OK]
```

```bash
/iscsi> cd iqn.2025-04.com.vpd:discosda/tpg1/portals
/iscsi/iqn.20.../tpg1/portals> delete 0.0.0.0 3260
Deleted network portal 0.0.0.0:3260
```

```bash
/iscsi/iqn.20.../tpg1/portals> create 10.22.122.10
Using default IP port 3260
Created network portal 10.22.122.10:3260.
```

```bash
/iscsi/iqn.20.../tpg1/portals> cd ../luns 
/iscsi/iqn.20...sda/tpg1/luns> create /backstores/block/discosda 
Created LUN 0.
```

```bash
/iscsi/iqn.20...sda/tpg1/luns> cd ../acls 
/iscsi/iqn.20...sda/tpg1/acls> create wwn=iqn.2025-04.com.vpd:nodo1
Created Node ACL for iqn.2025-04.com.vpd:nodo1
Created mapped LUN 0.
/iscsi/iqn.20...sda/tpg1/acls> create wwn=iqn.2025-04.com.vpd:nodo2
Created Node ACL for iqn.2025-04.com.vpd:nodo2
Created mapped LUN 0.
```

```
/iscsi/iqn.20...sda/tpg1/acls> cd /
/> saveconfig 
Configuration saved to /etc/target/saveconfig.json
/> exit
Global pref auto_save_on_exit=true
Last 10 configs saved in /etc/target/backup/.
Configuration saved to /etc/target/saveconfig.json
[root@almacenamiento ~]# 

```



### Tarea 3: Instalación del soporte iSCSI en los nodos initiator

#### Paso 1: Instalación del software del cliente iSCSI

```bash
[root@nodo1 ~]# dnf install iscsi-initiator-utils
Actualizando y cargando repositorios:
 Fedora 41 openh264 (From Cisco) - x86_ 100% |   3.1 KiB/s | 989.0   B |  00m00s
 Fedora 41 - x86_64 - Updates           100% |  40.7 KiB/s |  23.9 KiB |  00m01s
 Fedora 41 - x86_64                     100% |  84.9 KiB/s |  26.2 KiB |  00m00s
 Fedora 41 - x86_64 - Updates           100% |   3.2 MiB/s |   8.5 MiB |  00m03s
Repositorios cargados.
Package "iscsi-initiator-utils-6.2.1.10-0.gitd0f04ae.fc41.1.x86_64" is already installed.

Nothing to do.
```

#### Paso 2: Ejecución del servicio iscsid

```bash
[root@nodo1 ~]# systemctl restart iscsid
```

Como resultado de la ejecución del servicio se creará el archivo de configuración `/etc/iscsi/initiatorname.iscsi`.

```bash
[root@nodo1 ~]# cat /etc/iscsi/initiatorname.iscsi 
InitiatorName=iqn.1994-05.com.redhat:265ed95a5ff3
```

```bash
[root@nodo2 ~]# cat /etc/iscsi/initiatorname.iscsi 
InitiatorName=iqn.1994-05.com.redhat:a66dcccd74dc
```

#### Paso 3: Configuración del nombre del nodo

Configurar el nombre del nodo de cara al servicio iSCSI

Nodo 1:

```bash
[root@nodo1 ~]# cat /etc/iscsi/initiatorname.iscsi 
InitiatorName=iqn.2025-04.com.vpd:nodo1
```

Nodo 2:

```
[root@nodo2 ~]# cat /etc/iscsi/initiatorname.iscsi 
InitiatorName=iqn.2025-04.com.vpd:nodo2
```

#### Paso 4: Descubrimiento de LUNs exportados

```bash
[root@nodo1 ~]# iscsiadm --mode discovery --type sendtargets --portal 10.22.122.10 --discover
10.22.122.10:3260,1 iqn.2025-04.com.vpd:discosda
```

```bash
[root@nodo2 ~]# iscsiadm --mode discovery --type sendtargets --portal 10.22.122.10 --discover
10.22.122.10:3260,1 iqn.2025-04.com.vpd:discosda
```


#### Paso 5: Conexión de unidades LUNs


Ahora:

```bash
[root@nodo1 ~]# sudo iscsiadm --mode node --targetname iqn.2025-04.com.vpd:discosda --portal 10.22.122.10 --login
Logging in to [iface: default, target: iqn.2025-04.com.vpd:discosda, portal: 10.22.122.10,3260]
Login to [iface: default, target: iqn.2025-04.com.vpd:discosda, portal: 10.22.122.10,3260] successful.
```

```bash
[root@nodo2 ~]# sudo iscsiadm --mode node --targetname iqn.2025-04.com.vpd:discosda --portal 10.22.122.10 --login
Logging in to [iface: default, target: iqn.2025-04.com.vpd:discosda, portal: 10.22.122.10,3260]
Login to [iface: default, target: iqn.2025-04.com.vpd:discosda, portal: 10.22.122.10,3260] successful.
```

#### Paso 6: Comprobación de la conexión

```bash
[root@nodo1 ~]# sudo journalctl --since today | grep -i iscsi
abr 25 19:15:55 nodo1.vpd.com sudo[1323]:     root : TTY=ttyS0 ; PWD=/root ; USER=root ; COMMAND=/usr/sbin/iscsiadm --mode node --targetname iqn.2025-04.com.vpd:discosda --portal 10.22.122.10 --login
abr 25 19:15:55 nodo1.vpd.com kernel: scsi host6: iSCSI Initiator over TCP/IP
abr 25 19:15:55 nodo1.vpd.com iscsid[1286]: iscsid: Connection1:0 to [target: iqn.2025-04.com.vpd:discosda, portal: 10.22.122.10,3260] through [iface: default] is operational now
```

```bash
[root@nodo2 ~]# sudo journalctl --since today | grep -i iscsi
abr 25 19:16:00 nodo2.vpd.com sudo[1243]:     root : TTY=ttyS0 ; PWD=/root ; USER=root ; COMMAND=/usr/sbin/iscsiadm --mode node --targetname iqn.2025-04.com.vpd:discosda --portal 10.22.122.10 --login
abr 25 19:16:00 nodo2.vpd.com kernel: scsi host6: iSCSI Initiator over TCP/IP
abr 25 19:16:00 nodo2.vpd.com iscsid[1234]: iscsid: Connection1:0 to [target: iqn.2025-04.com.vpd:discosda, portal: 10.22.122.10,3260] through [iface: default] is operational now
```

Comprobación con `iscsiadm -m session`:

```bash
[root@nodo1 ~]#  iscsiadm -m session 
tcp: [1] 10.22.122.10:3260,1 iqn.2025-04.com.vpd:discosda (non-flash)
```

```
[root@nodo2 ~]# iscsiadm -m session 
tcp: [1] 10.22.122.10:3260,1 iqn.2025-04.com.vpd:discosda (non-flash)
```

Con lsblk

```
[root@nodo1 ~]# lsblk -o NAME,TRAN,SIZE,TYPE,MOUNTPOINT
NAME            TRAN    SIZE TYPE MOUNTPOINT
sda             iscsi     1G disk 
zram0                   1,9G disk [SWAP]
vda             virtio   10G disk 
├─vda1          virtio    1M part 
├─vda2          virtio    1G part /boot
└─vda3          virtio    9G part 
  └─fedora-root           9G lvm  /
```

```
[root@nodo2 ~]# lsblk -o NAME,TRAN,SIZE,TYPE,MOUNTPOINT
NAME            TRAN    SIZE TYPE MOUNTPOINT
sda             iscsi     1G disk 
zram0                   1,9G disk [SWAP]
vda             virtio   10G disk 
├─vda1          virtio    1M part 
├─vda2          virtio    1G part /boot
└─vda3          virtio    9G part 
  └─fedora-root           9G lvm  /
```

### Tarea 4: Creación de sistema de archivos tipo ext4 en la unidad iSCSI importada

```bash
[root@nodo1 ~]# mkfs.ext4 /dev/sda
mke2fs 1.47.1 (20-May-2024)
Se está creando un sistema de ficheros con 262144 bloques de 4k y 65536 nodos-i
UUID del sistema de ficheros: 733dd613-51be-4533-9245-f71c2afe9bb2
Respaldos del superbloque guardados en los bloques: 
	32768, 98304, 163840, 229376

Reservando las tablas de grupo: hecho                           
Escribiendo las tablas de nodos-i: hecho                           
Creando el fichero de transacciones (8192 bloques): hecho
Escribiendo superbloques y la información contable del sistema de ficheros: hecho
```

```bash
[root@nodo1 ~]# mount /dev/sda /mnt
```

### Tarea 5: Exportación del segundo disco iSCSI y creación de un volumen lógico

#### 1. Exportación del disco /dev/sdb desde el nodo target

Plan de trabajo:

```bash
# 1.1  Entrar en la shell de targetcli
targetcli

# 1.2  Declarar el nuevo objeto de bloque que apunta a /dev/sdb
/backstores/block> create discosdb /dev/sdb

# 1.3  Crear el nuevo target iSCSI con el IQN pedido
/iscsi> create wwn=iqn.2025-04.com.vpd:servidorapache   # ¡ojo a la ‘v’!

# 1.4  Limitar el portal al enlace de la red de almacenamiento
/iscsi/iqn.2025-04.com.vpd:servidorapache/tpg1/portals> delete 0.0.0.0 3260
/iscsi/iqn.../portals> create 10.22.122.10

# 1.5  Asociar el LUN 0 al disco recién creado
/iscsi/iqn.../tpg1/luns> create /backstores/block/discosdb

# 1.6  Dar acceso (ACL) a los dos initiators
/iscsi/iqn.../tpg1/acls> create wwn=iqn.2025-04.com.vpd:nodo1
/iscsi/iqn.../tpg1/acls> create wwn=iqn.2025-04.com.vpd:nodo2

# 1.7  Guardar la configuración y salir
/> saveconfig
/> exit
```

Ejecución:

```bash
[root@almacenamiento ~]# targetcli
targetcli shell version 2.1.58
Copyright 2011-2013 by Datera, Inc and others.
For help on commands, type 'help'.

/> cd backstores/block/
/backstores/block> 

/backstores/block> create name=discosdb dev=/dev/sdb
Created block storage object discosdb using /dev/sdb.

/backstores/block> cd /iscsi

/iscsi> create wwn=iqn.2025-04.com.vpd:servidorapache
Created target iqn.2025-04.com.vpd:servidorapache.
Created TPG 1.
Default portal not created, TPGs within a target cannot share ip:port.
```

```bash
/iscsi> cd iqn.2025-04.com.vpd:servidorapache/tpg1/portals

/iscsi/iqn.20.../tpg1/portals> delete 0.0.0.0 3260
No such NetworkPortal in configfs: /sys/kernel/config/target/iscsi/iqn.2025-04.com.vpd:servidorapache/tpgt_1/np/0.0.0.0:3260

/iscsi/iqn.20.../tpg1/portals> create 10.22.122.10
Using default IP port 3260
Created network portal 10.22.122.10:3260.
```

```bash
/iscsi/iqn.20.../tpg1/portals> cd ..
/iscsi/iqn.20...orapache/tpg1> cd luns 
/iscsi/iqn.20...che/tpg1/luns> create /backstores/block/discosdb
Created LUN 0.
```

```bash
/iscsi/iqn.20...che/tpg1/luns> cd ..
/iscsi/iqn.20...orapache/tpg1> cd acls 
/iscsi/iqn.20...che/tpg1/acls> create wwn=iqn.2025-04.com.vpd:nodo1
Created Node ACL for iqn.2025-04.com.vpd:nodo1
Created mapped LUN 0.
/iscsi/iqn.20...che/tpg1/acls> create wwn=iqn.2025-04.com.vpd:nodo2
Created Node ACL for iqn.2025-04.com.vpd:nodo2
Created mapped LUN 0.
```

```bash
/iscsi/iqn.20...che/tpg1/acls> cd /
/> saveconfig 
Configuration saved to /etc/target/saveconfig.json
/> exit
Global pref auto_save_on_exit=true
Last 10 configs saved in /etc/target/backup/.
Configuration saved to /etc/target/saveconfig.json
```

**Explicación del comando**:

- `comando`: Descripción general del comando
- `--opcion`: Explicación de este parámetro específico

#### 2. Comprobación de la exportación en los nodos initiator

Plan de trabajo:

```bash
# 2.1  Descubrir el nuevo target
iscsiadm --mode discovery --type sendtargets --portal 10.22.122.10 --discover

# 2.2  Iniciar la sesión iSCSI
iscsiadm --mode node \
         --targetname iqn.2025-04.com.vpd:servidorapache \
         --portal 10.22.122.10 --login

# 2.3  Verificar que /dev/sdb aparece
lsblk -o NAME,TRAN,SIZE,TYPE
```

Ejecución:

```bash
[root@nodo1 ~]# iscsiadm --mode discovery --type sendtargets --portal 10.22.122.10 --discover
10.22.122.10:3260,1 iqn.2025-04.com.vpd:discosda
10.22.122.10:3260,1 iqn.2025-04.com.vpd:servidorapache
```

```bash
[root@nodo2 ~]# iscsiadm --mode discovery --type sendtargets --portal 10.22.122.10 --discover
10.22.122.10:3260,1 iqn.2025-04.com.vpd:discosda
10.22.122.10:3260,1 iqn.2025-04.com.vpd:servidorapache
```

```bash
[root@nodo1 ~]# iscsiadm --mode node \
         --targetname iqn.2025-04.com.vpd:servidorapache \
         --portal 10.22.122.10 --login
Logging in to [iface: default, target: iqn.2025-04.com.vpd:servidorapache, portal: 10.22.122.10,3260]
Login to [iface: default, target: iqn.2025-04.com.vpd:servidorapache, portal: 10.22.122.10,3260] successful.
```

```bash
[root@nodo2 ~]# iscsiadm --mode node \
         --targetname iqn.2025-04.com.vpd:servidorapache \
         --portal 10.22.122.10 --login
Logging in to [iface: default, target: iqn.2025-04.com.vpd:servidorapache, portal: 10.22.122.10,3260]
Login to [iface: default, target: iqn.2025-04.com.vpd:servidorapache, portal: 10.22.122.10,3260] successful.
```

Verificación:

```bash
[root@nodo1 ~]# lsblk -o NAME,TRAN,SIZE,TYPE
NAME            TRAN    SIZE TYPE
sda             iscsi     1G disk
sdb             iscsi     1G disk
zram0                   1,9G disk
vda             virtio   10G disk
├─vda1          virtio    1M part
├─vda2          virtio    1G part
└─vda3          virtio    9G part
  └─fedora-root           9G lvm
```

```
[root@nodo2 ~]# lsblk -o NAME,TRAN,SIZE,TYPE
NAME            TRAN    SIZE TYPE
sda             iscsi     1G disk
sdb             iscsi     1G disk
zram0                   1,9G disk
vda             virtio   10G disk
├─vda1          virtio    1M part
├─vda2          virtio    1G part
└─vda3          virtio    9G part
  └─fedora-root           9G lvm
```

#### 3. Creación del volumen lógico

Plan de trabajo:

```bash
# 3.1  Crear volumen físico sobre el nuevo disco
pvcreate /dev/sdb

# 3.2  Crear el grupo de volúmenes ApacheVG
#      –‐   --setautoactivation n  ➜ desactiva la auto-activación en el arranque  [oai_citation:0‡man.archlinux.org](https://man.archlinux.org/man/vgcreate.8.en)
#      –‐   --locktype none       ➜ sin bloqueo, puede activarse desde cualquier host  [oai_citation:1‡man7.org](https://man7.org/linux/man-pages/man8/vgcreate.8.html)
vgcreate --setautoactivation n --locktype none ApacheVG /dev/sdb

# 3.3  Crear el LV de 900 MiB
lvcreate -n ApacheLV -L 900M ApacheVG

# 3.4  Comprobar
lvs

# 3.5  Formatear XFS
mkfs.xfs /dev/ApacheVG/ApacheLV

# 3.6  Montaje de prueba
mount /dev/ApacheVG/ApacheLV /mnt
```

Ejecución:

##### I. Creación del volumen físico


```bash
[root@nodo1 ~]# pvcreate /dev/sdb
  Physical volume "/dev/sdb" successfully created.
```

##### II. Creación del grupo de volúmenes ApacheVG

```bash
[root@nodo1 ~]# vgcreate --setautoactivation n --locktype none ApacheVG /dev/sdb
  Volume group "ApacheVG" successfully created
```

##### III. Creación del volumen lógico ApacheLV

```
[root@nodo1 ~]# lvs
  LV       VG       Attr       LSize   Pool Origin Data%  Meta%  Move Log Cpy%Sync Convert
  ApacheLV ApacheVG -wi-a----- 900,00m                                                    
  root     fedora   -wi-ao----  <9,00g
```


##### IV. Comprobación del volumen lógico

```bash
# Comandos utilizados para comprobar el volumen lógico
```

##### V. Creación del sistema de archivos XFS

```bash
[root@nodo1 ~]# mkfs.xfs /dev/ApacheVG/ApacheLV
meta-data=/dev/ApacheVG/ApacheLV isize=512    agcount=4, agsize=57600 blks
         =                       sectsz=512   attr=2, projid32bit=1
         =                       crc=1        finobt=1, sparse=1, rmapbt=1
         =                       reflink=1    bigtime=1 inobtcount=1 nrext64=1
data     =                       bsize=4096   blocks=230400, imaxpct=25
         =                       sunit=0      swidth=0 blks
naming   =version 2              bsize=4096   ascii-ci=0, ftype=1
log      =internal log           bsize=4096   blocks=16384, version=2
         =                       sectsz=512   sunit=0 blks, lazy-count=1
realtime =none                   extsz=4096   blocks=0, rtextents=0
```

Montaje de prueba

```bash
[root@nodo1 ~]# mount /dev/ApacheVG/ApacheLV /mnt
```

validaciones:

```
[root@nodo1 ~]# pvs
  PV         VG       Fmt  Attr PSize   PFree 
  /dev/sdb   ApacheVG lvm2 a--  992,00m 92,00m
  /dev/vda3  fedora   lvm2 a--   <9,00g     0 
[root@nodo1 ~]# vgs
  VG       #PV #LV #SN Attr   VSize   VFree 
  ApacheVG   1   1   0 wz--n- 992,00m 92,00m
  fedora     1   1   0 wz--n-  <9,00g     0 
[root@nodo1 ~]# lvs
  LV       VG       Attr       LSize   Pool Origin Data%  Meta%  Move Log Cpy%Sync Convert
  ApacheLV ApacheVG -wi-ao---- 900,00m                                                    
  root     fedora   -wi-ao----  <9,00g
```

```bash
[root@nodo1 ~]# mount | grep ApacheVG
/dev/mapper/ApacheVG-ApacheLV on /mnt type xfs (rw,relatime,seclabel,attr2,inode64,logbufs=8,logbsize=32k,noquota)
```

#### 4. Configuración en el segundo nodo initiator

Plan de trabajo:

Registrar el disco en el otro nodo initiator:

```bash
# 4.1  Añadir el nuevo dispositivo al inventario de LVM
lvmdevices --adddev /dev/sdb
```

Ejecución:

```bash
[root@nodo2 ~]# lvmdevices --adddev /dev/sdb
```

#### 5. Comprobación de activación en ambos nodos

```bash
[root@nodo1 ~]# vgchange -ay ApacheVG 
  1 logical volume(s) in volume group "ApacheVG" now active
[root@nodo1 ~]# mount /dev/ApacheVG/ApacheLV /mnt
[root@nodo1 ~]# df -h /mnt
S.ficheros                    Tamaño Usados  Disp Uso% Montado en
/dev/mapper/ApacheVG-ApacheLV   836M    49M  788M   6% /mnt
```

```bash
[root@nodo2 ~]# vgchange -ay ApacheVG 
  1 logical volume(s) in volume group "ApacheVG" now active
[root@nodo2 ~]# mount /dev/ApacheVG/ApacheLV /mnt
[root@nodo2 ~]# df -h /mnt
S.ficheros                    Tamaño Usados  Disp Uso% Montado en
/dev/mapper/ApacheVG-ApacheLV   836M    49M  788M   6% /mnt
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
