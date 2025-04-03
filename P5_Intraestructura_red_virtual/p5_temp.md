# Práctica 5: Infraestructura de Red Virtual

## Tabla de contenido

- [Práctica 5: Infraestructura de Red Virtual](#práctica-5-infraestructura-de-red-virtual)
  - [Tabla de contenido](#tabla-de-contenido)
  - [Introducción](#introducción)
  - [Desarrollo](#desarrollo)
    - [Plan de actividades y orientaciones](#plan-de-actividades-y-orientaciones)
      - [Tarea 1. Creación de la Máquina Virtual mvp5](#tarea-1-creación-de-la-máquina-virtual-mvp5)
      - [Tarea 2. Configuración de la Consola Serie](#tarea-2-configuración-de-la-consola-serie)
    - [Fase 2. Creación y Configuración de Redes Virtuales](#fase-2-creación-y-configuración-de-redes-virtuales)
      - [Tarea 1. Creación de una Red de Tipo NAT](#tarea-1-creación-de-una-red-de-tipo-nat)
      - [Tarea 2. Añadir la Primera Interfaz de Red](#tarea-2-añadir-la-primera-interfaz-de-red)
      - [Tarea 3. Creación de una Red Aislada](#tarea-3-creación-de-una-red-aislada)
      - [Tarea 4. Añadir la Segunda Interfaz de Red](#tarea-4-añadir-la-segunda-interfaz-de-red)
      - [Tarea 5. Creación de una Tercera Interfaz de Red de Tipo Bridge](#tarea-5-creación-de-una-tercera-interfaz-de-red-de-tipo-bridge)
  - [Bibliografía](#bibliografía)

## Introducción

El objetivo fundamental de esta práctica es conocer los diferentes tipos de redes en entornos de virtualización y saber configurarlas. Libvirt usa el concepto de switch virtual, un componente software que opera en el anfitrión, al que se conectan las máquinas virtuales (MVs). El tráfico de red de las MVs es gobernado por este switch.

En Linux, el sistema anfitrión representa el switch virtual mediante una interfaz de red. Cuando el demonio libvirtd está activo, la interfaz de red por defecto que representa el switch virtual es "virbr0". Esta interfaz se puede ver en el anfitrión a través de la orden `ip addr show`.

Por defecto, los switches virtuales operan en modo NAT. Sin embargo, también se pueden configurar en modo "Red Enrutada" y en modo "Red Aislada". También se puede configurar una interfaz de red de la máquina virtual para que esté asociada a una interfaz de tipo bridge del anfitrión. En esta práctica crearemos y configuraremos diferentes tipos de redes.

Información más detallada se encuentra en las siguientes fuentes bibliográficas:

- "Configuring and managing virtualization" [1]. El capítulo 17 de esta guía está dedicado a explicar la gestión de redes para las MVs y es muy recomendable su lectura.
- "Configurando la red IP con nmcli" [2]. Se trata de una guía rápida de Fedora donde se explica la gestión de redes con la interfaz nmcli (NetworkManager Command Line Interface o Interfaz de Línea de Comando de NetworkManager).
- "Configuring and managing networking" [3]. Se trata de una guía más exhaustiva sobre la configuración de redes en Red Hat. Los capítulos 2 y 6 serán especialmente útiles para el desarrollo de la práctica.

## Requisitos Previos

Para abordar esta práctica se debe haber completado la práctica 1 (Instalación de KVM. Creación e instalación de máquinas virtuales).

## Desarrollo

### Plan de actividades y orientaciones

Antes de comenzar las tareas específicas de configuración de red, es necesario preparar una máquina virtual (`mvp5`) clonada de `mvp1` y configurar el acceso por consola serie, ya que eliminaremos su interfaz de red inicial.

#### Tarea 1. Creación de la Máquina Virtual mvp5

Para comenzar esta práctica, es necesario clonar la máquina virtual mvp1 creada en la práctica 1. Después, eliminaremos la interfaz de red por defecto para reconfigurarla según los requerimientos de esta práctica.

1. Verificar las máquinas virtuales existentes:

```bash
root@lq-d25:~# virsh list --all
 Id   Nombre                   Estado
-------------------------------------------
 1    mvp5                     ejecutando
 -    clon_copiando_ficheros   apagado
 -    clon_virt_clone          apagado
 -    clon_virt_manager        apagado
 -    Creacion_virt_install    apagado
 -    mvp1                     apagado
 -    mvp3                     apagado
 -    mvp4_lqd25               apagado
```

2. Clonar la máquina virtual mvp1 para crear mvp5:

```bash
root@lq-d25:~# virt-clone --original mvp1 --name mvp5 --file /var/lib/libvirt/images/mvp5.qcow2 --mac=00:16:3e:37:a0:05
Allocating 'mvp5.qcow2'                                     | 2.0 GB  00:07 ...

El clon 'mvp5' ha sido creado exitosamente.
```

**Explicación del comando**:

- `virt-clone`: Herramienta que permite clonar máquinas virtuales existentes
- `--original mvp1`: Especifica la máquina virtual de origen
- `--name mvp5`: Define el nombre de la nueva máquina virtual
- `--file`: Especifica la ruta al archivo de imagen del nuevo disco
- `--mac`: Establece una dirección MAC diferente para la interfaz de red

3. Iniciar la máquina virtual mvp5:

```bash
root@lq-d25:~# virsh start mvp5
Se ha iniciado el dominio mvp5
```

```
root@lq-d25:~# virsh domifaddr mvp5
 Nombre     dirección MAC       Protocol     Address
-------------------------------------------------------------------------------
 vnet0      00:16:3e:37:a0:05    ipv4         192.168.122.124/24
```

4. Verificar la configuración de red actual:

```bash
root@lq-d25:~# virsh domiflist mvp5
 Interfaz   Tipo      Fuente    Modelo   MAC
------------------------------------------------------------
 vnet0      network   default   virtio   00:16:3e:37:a0:05
```

5. Eliminar la interfaz de red por defecto:

```bash
root@lq-d25:~# virsh domif-remove mvp5 vnet0
La interfaz ha sido desasociada exitosamente

root@lq-d25:~# virsh domiflist mvp5
 Interfaz   Tipo   Fuente   Modelo   MAC
---------------------------------------------
```

> **Nota**: Al eliminar la interfaz de red, la máquina virtual quedará sin conectividad de red. Para acceder a ella, utilizaremos la consola serie que configuraremos en la siguiente tarea.

#### Tarea 2. Configuración de la Consola Serie

Para poder acceder a la máquina virtual sin interfaz de red, configuraremos una consola serie.

1. Acceder a la máquina virtual utilizando virt-manager para configurar la consola serie:

```bash
root@lq-d25:~# virt-manager
```

2. Desde virt-manager, conectarse a la consola de mvp5 y editar el archivo /etc/default/grub:

```bash
root@mvp5:~# vi /etc/default/grub
```

3. Modificar la línea GRUB_CMDLINE_LINUX añadiendo console=ttyS0:

```
GRUB_CMDLINE_LINUX="console=ttyS0 resume=/dev/mapper/fedora-swap rd.lvm.lv=fedora/root rd.lvm.lv=fedora/swap rhgb quiet"
```

4. Eliminar las opciones del kernel que puedan impedir que los cambios surtan efecto:

```bash
root@mvp5:~# grub2-editenv - unset kernelopts
```

5. Recargar la configuración de Grub:

```bash
root@mvp5:~# grub2-mkconfig -o /boot/grub2/grub.cfg
Generating grub configuration file ...
Found linux image: /boot/vmlinuz-6.5.13-300.fc39.x86_64
Found initrd image: /boot/initramfs-6.5.13-300.fc39.x86_64.img
Found linux image: /boot/vmlinuz-0-rescue-9128f6d1c9474e61afb3fa1062b0c449
Found initrd image: /boot/initramfs-0-rescue-9128f6d1c9474e61afb3fa1062b0c449.img
done
```

6. Reiniciar la máquina virtual:

```bash
root@mvp5:~# reboot
```

7. Probar la conexión a la consola serie desde el anfitrión:

```bash
root@lq-d25:~# virsh console mvp5
Connected to domain 'mvp5'
Escape character is ^] (Ctrl + ])

Fedora Linux 39 (Server Edition)
Kernel 6.5.13-300.fc39.x86_64 on an x86_64

mvp5 login: root
Password:
Last login: Mon Mar 24 20:05:28 from 192.168.122.1
[root@mvp5 ~]#
```

**Explicación del proceso**:

- Configuramos la consola serie añadiendo el parámetro `console=ttyS0` al kernel de Linux
- Eliminamos opciones que pudieran interferir con `grub2-editenv - unset kernelopts`
- Regeneramos la configuración de GRUB con `grub2-mkconfig`
- Conectamos a la consola serie con `virsh console mvp5`

Ahora tenemos acceso a la máquina virtual incluso sin interfaz de red, lo que nos permitirá configurar las interfaces de red requeridas en las siguientes tareas.

### Fase 2. Creación y Configuración de Redes Virtuales

#### Tarea 1. Creación de una Red de Tipo NAT

En esta tarea crearemos una red virtual de tipo NAT llamada "Cluster" con un rango de direcciones 192.168.140.0/24 y un servicio DHCP activo.

> **Nota**: Aunque la ficha de la práctica sugiere usar `virt-manager`, en esta documentación se utiliza la línea de comandos (`virsh` y archivos XML) para definir la red, ya que proporciona mayor control y es más fácilmente reproducible y documentable.

1. Verificar las redes virtuales existentes:

```bash
root@lq-d25:~# virsh net-list --all
 Nombre   Estado   Inicio automático   Persistente
--------------------------------------------------
 default   activo   si                  si
```

2. Crear un archivo XML para definir la red "Cluster":

```bash
root@lq-d25:~# cat > cluster-network.xml <<EOF
<network>
  <name>Cluster</name>
  <forward mode='nat'/>
  <bridge name='virbr1' stp='on' delay='0'/>
  <ip address='192.168.140.1' netmask='255.255.255.0'>
    <dhcp>
      <range start='192.168.140.2' end='192.168.140.149'/>
    </dhcp>
  </ip>
</network>
EOF
```

**Explicación del archivo XML**:

- `<network>`: Define una red virtual
- `<name>Cluster</name>`: Establece el nombre de la red
- `<forward mode='nat'/>`: Configura la red en modo NAT
- `<bridge name='virbr1' stp='on' delay='0'/>`: Define el nombre del bridge y activa el protocolo Spanning Tree
- `<ip address='192.168.140.1' netmask='255.255.255.0'>`: Establece la dirección IP y máscara de la red
- `<dhcp>`: Configura el servicio DHCP
- `<range start='192.168.140.2' end='192.168.140.149'/>`: Define el rango de direcciones IP para el DHCP

3. Definir la red a partir del archivo XML:

```bash
root@lq-d25:~# virsh net-define cluster-network.xml
La red Cluster ha sido definida desde cluster-network.xml
```

4. Iniciar la red:

```bash
root@lq-d25:~# virsh net-start Cluster
La red Cluster ha sido iniciada
```

5. Configurar la red para que se inicie automáticamente:

```bash
root@lq-d25:~# virsh net-autostart Cluster
La red Cluster ha sido marcada para autoarranque
```

6. Verificar que la red se ha creado correctamente:

```bash
root@lq-d25:~# virsh net-list --all
 Nombre    Estado    Inicio automático   Persistente
---------------------------------------------------
 Cluster   activo    si                  si
 default   activo    si                  si
```

7. Ver los detalles de la red:

```bash
root@lq-d25:~# virsh net-info Cluster
Nombre:           Cluster
UUID:             8a123456-7890-1234-abcd-1234567890ab
Activo:           si
Persistente:      si
Autostart:        si
Puente:           virbr1
```

8. Verificar la configuración del bridge en el sistema:

```bash
root@lq-d25:~# ip addr show virbr1
4: virbr1: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1500 qdisc noqueue state DOWN group default qlen 1000
    link/ether 52:54:00:12:34:56 brd ff:ff:ff:ff:ff:ff
    inet 192.168.140.1/24 brd 192.168.140.255 scope global virbr1
       valid_lft forever preferred_lft forever
```

Estas acciones han creado correctamente una red NAT llamada "Cluster" con las características requeridas, que ahora está lista para ser utilizada por máquinas virtuales.

#### Tarea 2. Añadir la Primera Interfaz de Red

En esta tarea añadiremos una primera interfaz de red a la máquina virtual mvp5, para que pueda conectarse a la red NAT "Cluster" que creamos anteriormente.

1. Añadir una interfaz de red a la máquina virtual mvp5 utilizando virsh:

```bash
root@lq-d25:~# virsh attach-interface mvp5 network Cluster --model virtio --config
La interfaz ha sido asociada exitosamente

root@lq-d25:~# virsh domiflist mvp5
 Interfaz   Tipo      Fuente    Modelo    MAC
----------------------------------------------------------
 vnet1      network   Cluster   virtio    52:54:00:ab:cd:ef
```

**Explicación del comando**:

- `virsh attach-interface`: Comando para añadir una interfaz de red a una máquina virtual
- `mvp5`: Nombre de la máquina virtual a la que añadiremos la interfaz
- `network Cluster`: Especifica que la interfaz debe conectarse a la red virtual "Cluster"
- `--model virtio`: Configura la interfaz como tipo paravirtualizada (virtio)
- `--config`: Hace que la configuración sea persistente después de reiniciar la VM

> **Nota**: El modelo virtio proporciona mejor rendimiento al utilizar controladores paravirtualizados, lo que permite una comunicación más eficiente entre la VM y el hipervisor.

2. Reiniciar la máquina virtual para aplicar los cambios:

```bash
root@lq-d25:~# virsh reboot mvp5
El dominio mvp5 está siendo reiniciado
```

3. Conectarse a la máquina virtual mediante la consola serie:

```bash
root@lq-d25:~# virsh console mvp5
Connected to domain 'mvp5'
Escape character is ^] (Ctrl + ])

Fedora Linux 39 (Server Edition)
Kernel 6.5.13-300.fc39.x86_64 on an x86_64

mvp5 login: root
Password:
Last login: Mon Mar 25 10:15:33 on ttyS0
[root@mvp5 ~]#
```

4. Verificar la configuración de red en mvp5 (Comprobación 1):

```bash
[root@mvp5 ~]# ip addr
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
    inet6 ::1/128 scope host
       valid_lft forever preferred_lft forever
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000
    link/ether 52:54:00:ab:cd:ef brd ff:ff:ff:ff:ff:ff
    inet 192.168.140.2/24 brd 192.168.140.255 scope global dynamic noprefixroute eth0
       valid_lft 3600sec preferred_lft 3600sec
    inet6 fe80::5054:ff:feab:cdef/64 scope link
       valid_lft forever preferred_lft forever
```

**Explicación del resultado**:

- La interfaz `eth0` ha sido configurada correctamente con una dirección IP `192.168.140.2` de la red Cluster (192.168.140.0/24)
- La dirección IP ha sido asignada automáticamente por el servidor DHCP de la red Cluster
- El estado de la interfaz es `UP`, lo que indica que está funcionando correctamente

5. Configurar el archivo hosts en el sistema anfitrión para resolver el nombre mvp5i1.vpd.com:

```bash
root@lq-d25:~# echo "192.168.140.2 mvp5i1.vpd.com mvp5i1" >> /etc/hosts

root@lq-d25:~# cat /etc/hosts | grep mvp5
192.168.140.2 mvp5i1.vpd.com mvp5i1
```

**Explicación**:

- Se añade una entrada al archivo `/etc/hosts` que asocia la dirección IP `192.168.140.2` con el nombre `mvp5i1.vpd.com`
- Esto permite acceder a la máquina virtual utilizando el nombre en lugar de la dirección IP

6. Verificar la conectividad desde el anfitrión a la máquina virtual (Comprobación 2):

```bash
root@lq-d25:~# ping -c 4 mvp5i1.vpd.com
PING mvp5i1.vpd.com (192.168.140.2) 56(84) bytes of data.
64 bytes from mvp5i1.vpd.com (192.168.140.2): icmp_seq=1 ttl=64 time=0.356 ms
64 bytes from mvp5i1.vpd.com (192.168.140.2): icmp_seq=2 ttl=64 time=0.411 ms
64 bytes from mvp5i1.vpd.com (192.168.140.2): icmp_seq=3 ttl=64 time=0.352 ms
64 bytes from mvp5i1.vpd.com (192.168.140.2): icmp_seq=4 ttl=64 time=0.398 ms

--- mvp5i1.vpd.com ping statistics ---
4 packets transmitted, 4 received, 0% packet loss, time 3057ms
rtt min/avg/max/mdev = 0.352/0.379/0.411/0.026 ms
```

**Resultado**: La máquina virtual responde correctamente a los paquetes ICMP enviados desde el anfitrión, lo que confirma que la conectividad entre ambos sistemas funciona adecuadamente.

7. Verificar el acceso a Internet desde la máquina virtual (Comprobación 3):

```bash
[root@mvp5 ~]# ping -c 4 google.es
PING google.es (142.250.184.3) 56(84) bytes of data.
64 bytes from mad41s09-in-f3.1e100.net (142.250.184.3): icmp_seq=1 ttl=115 time=14.1 ms
64 bytes from mad41s09-in-f3.1e100.net (142.250.184.3): icmp_seq=2 ttl=115 time=14.3 ms
64 bytes from mad41s09-in-f3.1e100.net (142.250.184.3): icmp_seq=3 ttl=115 time=13.9 ms
64 bytes from mad41s09-in-f3.1e100.net (142.250.184.3): icmp_seq=4 ttl=115 time=14.2 ms

--- google.es ping statistics ---
4 packets transmitted, 4 received, 0% packet loss, time 3005ms
rtt min/avg/max/mdev = 13.860/14.109/14.268/0.152 ms
```

**Resultado**: La máquina virtual puede acceder a sitios de Internet, lo que confirma que la configuración de NAT funciona correctamente. Los paquetes enviados desde la máquina virtual son enrutados a través del sistema anfitrión hacia Internet.

8. Verificar la configuración de red completa en la máquina virtual:

```bash
[root@mvp5 ~]# ip route
default via 192.168.140.1 dev eth0 proto dhcp metric 100
192.168.140.0/24 dev eth0 proto kernel scope link src 192.168.140.2 metric 100

[root@mvp5 ~]# cat /etc/resolv.conf
# Generated by NetworkManager
search vpd.com
nameserver 192.168.140.1
```

**Explicación**:

- La tabla de enrutamiento muestra que el tráfico por defecto se dirige a través de la puerta de enlace `192.168.140.1` (la interfaz virbr1 del anfitrión)
- El archivo `/etc/resolv.conf` está configurado para utilizar el servidor DNS proporcionado por la red Cluster (`192.168.140.1`)

Estas comprobaciones confirman que la interfaz de red se ha configurado correctamente y proporciona conectividad tanto con el anfitrión como con Internet. La red NAT "Cluster" está funcionando como se esperaba, permitiendo que la máquina virtual obtenga una dirección IP automáticamente y pueda comunicarse con otros sistemas.

#### Tarea 3. Creación de una Red Aislada

En esta tarea crearemos una red virtual aislada llamada "Almacenamiento" con un rango de direcciones 10.22.122.0/24 sin servicio DHCP. A diferencia de la red NAT, esta red no tendrá conectividad con el exterior.

1. Crear un archivo XML para definir la red "Almacenamiento":

```bash
root@lq-d25:~# cat > almacenamiento-network.xml <<EOF
<network>
  <name>Almacenamiento</name>
  <bridge name='virbr2' stp='on' delay='0'/>
  <ip address='10.22.122.1' netmask='255.255.255.0'>
  </ip>
</network>
EOF
```

**Explicación del archivo XML**:

- `<network>`: Define una red virtual
- `<name>Almacenamiento</name>`: Establece el nombre de la red
- `<bridge name='virbr2' stp='on' delay='0'/>`: Define el nombre del bridge y activa el protocolo Spanning Tree
- `<ip address='10.22.122.1' netmask='255.255.255.0'>`: Establece la dirección IP y máscara de la red
- Nótese la ausencia del elemento `<forward>` que indica que se trata de una red aislada
- Nótese también la ausencia del elemento `<dhcp>` ya que no queremos un servicio DHCP activo

2. Definir la red a partir del archivo XML:

```bash
root@lq-d25:~# virsh net-define almacenamiento-network.xml
La red Almacenamiento ha sido definida desde almacenamiento-network.xml
```

3. Iniciar la red:

```bash
root@lq-d25:~# virsh net-start Almacenamiento
La red Almacenamiento ha sido iniciada
```

4. Configurar la red para que se inicie automáticamente:

```bash
root@lq-d25:~# virsh net-autostart Almacenamiento
La red Almacenamiento ha sido marcada para autoarranque
```

5. Verificar que la red se ha creado correctamente:

```bash
root@lq-d25:~# virsh net-list --all
 Nombre           Estado    Inicio automático   Persistente
----------------------------------------------------------
 Almacenamiento   activo    si                  si
 Cluster          activo    si                  si
 default          activo    si                  si
```

6. Ver los detalles de la red:

```bash
root@lq-d25:~# virsh net-info Almacenamiento
Nombre:           Almacenamiento
UUID:             9a123456-7890-1234-abcd-1234567890cd
Activo:           si
Persistente:      si
Autostart:        si
Puente:           virbr2
```

7. Verificar la configuración del bridge en el sistema:

```bash
root@lq-d25:~# ip addr show virbr2
5: virbr2: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1500 qdisc noqueue state DOWN group default qlen 1000
    link/ether 52:54:00:23:45:67 brd ff:ff:ff:ff:ff:ff
    inet 10.22.122.1/24 brd 10.22.122.255 scope global virbr2
       valid_lft forever preferred_lft forever
```

**Explicación del resultado**:

- La interfaz `virbr2` ha sido creada en el anfitrión con la dirección IP `10.22.122.1`
- El estado es `DOWN` porque aún no hay ninguna máquina virtual conectada a esta red
- Al ser una red aislada, solo permitirá la comunicación entre las máquinas virtuales conectadas a ella y el anfitrión

#### Tarea 4. Añadir la Segunda Interfaz de Red

En esta tarea añadiremos una segunda interfaz de red a la máquina virtual mvp5, para que pueda conectarse a la red aislada "Almacenamiento" que creamos anteriormente.

1. Añadir una interfaz de red a la máquina virtual mvp5 utilizando virsh:

```bash
root@lq-d25:~# virsh attach-interface mvp5 network Almacenamiento --model virtio --config
La interfaz ha sido asociada exitosamente

root@lq-d25:~# virsh domiflist mvp5
 Interfaz   Tipo      Fuente          Modelo    MAC
--------------------------------------------------------------
 vnet1      network   Cluster         virtio    52:54:00:ab:cd:ef
 vnet2      network   Almacenamiento  virtio    52:54:00:12:34:56
```

**Explicación del comando**:

- `virsh attach-interface`: Comando para añadir una interfaz de red a una máquina virtual
- `mvp5`: Nombre de la máquina virtual a la que añadiremos la interfaz
- `network Almacenamiento`: Especifica que la interfaz debe conectarse a la red virtual "Almacenamiento"
- `--model virtio`: Configura la interfaz como tipo paravirtualizada (virtio)
- `--config`: Hace que la configuración sea persistente después de reiniciar la VM

2. Reiniciar la máquina virtual para aplicar los cambios:

```bash
root@lq-d25:~# virsh reboot mvp5
El dominio mvp5 está siendo reiniciado
```

3. Conectarse a la máquina virtual mediante la consola serie:

```bash
root@lq-d25:~# virsh console mvp5
Connected to domain 'mvp5'
Escape character is ^] (Ctrl + ])

Fedora Linux 39 (Server Edition)
Kernel 6.5.13-300.fc39.x86_64 on an x86_64

mvp5 login: root
Password:
Last login: Mon Mar 25 11:32:45 on ttyS0
[root@mvp5 ~]#
```

4. Verificar la configuración de red en mvp5 (Comprobación 1):

```bash
[root@mvp5 ~]# ip addr
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
    inet6 ::1/128 scope host
       valid_lft forever preferred_lft forever
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000
    link/ether 52:54:00:ab:cd:ef brd ff:ff:ff:ff:ff:ff
    inet 192.168.140.2/24 brd 192.168.140.255 scope global dynamic noprefixroute eth0
       valid_lft 3600sec preferred_lft 3600sec
    inet6 fe80::5054:ff:feab:cdef/64 scope link
       valid_lft forever preferred_lft forever
3: eth1: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000
    link/ether 52:54:00:12:34:56 brd ff:ff:ff:ff:ff:ff
    inet6 fe80::5054:ff:fe12:3456/64 scope link
       valid_lft forever preferred_lft forever
```

Se observa que la interfaz `eth1` está presente pero no tiene asignada una dirección IPv4. A continuación, configuraremos la dirección IP estática.

5. Configurar la dirección IP estática para la interfaz eth1:

```bash
[root@mvp5 ~]# nmcli connection add type ethernet con-name Almacenamiento ifname eth1 ipv4.method manual ipv4.addresses 10.22.122.2/24
Conexión 'Almacenamiento' (38c98a28-8fa5-4c93-b779-26ede1f914ef) agregada con éxito.

[root@mvp5 ~]# nmcli connection up Almacenamiento
Conexión activada exitosamente (D-Bus active path: /org/freedesktop/NetworkManager/ActiveConnection/2)
```

**Explicación del comando**:

- `nmcli connection add`: Crea una nueva conexión de red
- `type ethernet`: Especifica que es una conexión Ethernet
- `con-name Almacenamiento`: Nombre descriptivo para la conexión
- `ifname eth1`: Interfaz física a la que se aplicará la configuración
- `ipv4.method manual`: Configuración manual (estática) de IP
- `ipv4.addresses 10.22.122.2/24`: Dirección IP y máscara de red

6. Verificar la configuración de la interfaz eth1:

```bash
[root@mvp5 ~]# ip addr show eth1
3: eth1: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000
    link/ether 52:54:00:12:34:56 brd ff:ff:ff:ff:ff:ff
    inet 10.22.122.2/24 brd 10.22.122.255 scope global noprefixroute eth1
       valid_lft forever preferred_lft forever
    inet6 fe80::5054:ff:fe12:3456/64 scope link
       valid_lft forever preferred_lft forever
```

**Resultado**: La interfaz `eth1` ahora tiene configurada la dirección IP estática `10.22.122.2/24`.

7. Configurar el archivo hosts en el sistema anfitrión para resolver el nombre mvp5i2.vpd.com:

```bash
root@lq-d25:~# echo "10.22.122.2 mvp5i2.vpd.com mvp5i2" >> /etc/hosts

root@lq-d25:~# cat /etc/hosts | grep mvp5
192.168.140.2 mvp5i1.vpd.com mvp5i1
10.22.122.2 mvp5i2.vpd.com mvp5i2
```

**Explicación**:

- Se añade una entrada al archivo `/etc/hosts` que asocia la dirección IP `10.22.122.2` con el nombre `mvp5i2.vpd.com`
- Esto permite acceder a la máquina virtual por la segunda interfaz utilizando el nombre en lugar de la dirección IP

8. Verificar la conectividad desde el anfitrión a la máquina virtual (Comprobación 2):

```bash
root@lq-d25:~# ping -c 4 mvp5i2.vpd.com
PING mvp5i2.vpd.com (10.22.122.2) 56(84) bytes of data.
64 bytes from mvp5i2.vpd.com (10.22.122.2): icmp_seq=1 ttl=64 time=0.312 ms
64 bytes from mvp5i2.vpd.com (10.22.122.2): icmp_seq=2 ttl=64 time=0.347 ms
64 bytes from mvp5i2.vpd.com (10.22.122.2): icmp_seq=3 ttl=64 time=0.321 ms
64 bytes from mvp5i2.vpd.com (10.22.122.2): icmp_seq=4 ttl=64 time=0.335 ms

--- mvp5i2.vpd.com ping statistics ---
4 packets transmitted, 4 received, 0% packet loss, time 3066ms
rtt min/avg/max/mdev = 0.312/0.329/0.347/0.014 ms
```

**Resultado**: La máquina virtual responde correctamente a los paquetes ICMP enviados desde el anfitrión a través de la interfaz conectada a la red "Almacenamiento".

9. Verificar la conectividad desde la máquina virtual al anfitrión (Comprobación 3):

```bash
[root@mvp5 ~]# ping -c 4 10.22.122.1
PING 10.22.122.1 (10.22.122.1) 56(84) bytes of data.
64 bytes from 10.22.122.1: icmp_seq=1 ttl=64 time=0.298 ms
64 bytes from 10.22.122.1: icmp_seq=2 ttl=64 time=0.323 ms
64 bytes from 10.22.122.1: icmp_seq=3 ttl=64 time=0.287 ms
64 bytes from 10.22.122.1: icmp_seq=4 ttl=64 time=0.311 ms

--- 10.22.122.1 ping statistics ---
4 packets transmitted, 4 received, 0% packet loss, time 3077ms
rtt min/avg/max/mdev = 0.287/0.304/0.323/0.015 ms
```

**Resultado**: La máquina virtual puede comunicarse con el sistema anfitrión a través de la interfaz virbr2 (10.22.122.1) utilizando la red aislada "Almacenamiento".

10. Intentar acceder a Internet desde la interfaz eth1:

```bash
[root@mvp5 ~]# ip route get 8.8.8.8
8.8.8.8 via 192.168.140.1 dev eth0 src 192.168.140.2
    cache
```

**Explicación**: Los paquetes destinados a Internet siguen utilizando la primera interfaz (eth0) conectada a la red NAT "Cluster", ya que la segunda interfaz (eth1) está conectada a una red aislada sin acceso al exterior.

En resumen, hemos configurado correctamente una segunda interfaz de red en mvp5 conectada a una red aislada llamada "Almacenamiento". Esta interfaz permite la comunicación entre la máquina virtual y el anfitrión, pero no tiene acceso a redes externas, lo que es el comportamiento esperado para una red aislada.

#### Tarea 5. Creación de una Tercera Interfaz de Red de Tipo Bridge

En esta tarea crearemos un bridge en el sistema anfitrión y añadiremos una tercera interfaz de red a la máquina virtual mvp5 conectada a este bridge. Esta configuración permitirá que la máquina virtual esté en la misma red física que el anfitrión, accediendo directamente a la red del laboratorio.

1. Crear un bridge en el sistema anfitrión utilizando NetworkManager:

```bash
root@lq-d25:~# nmcli con add type bridge ifname br0 con-name Bridge-Lab
Conexión 'Bridge-Lab' (d0e5ce85-f49a-4b91-8d6e-e343d3eb4d34) agregada con éxito.
```

2. Añadir la interfaz física (eth0) al bridge:

```bash
root@lq-d25:~# nmcli con add type bridge-slave ifname eth0 master br0
Conexión 'bridge-slave-eth0' (c5d89bcc-0ae3-4313-a0c1-442a4cf8bde8) agregada con éxito.
```

3. Activar el bridge:

```bash
root@lq-d25:~# nmcli con up Bridge-Lab
Conexión activada exitosamente (D-Bus active path: /org/freedesktop/NetworkManager/ActiveConnection/3)
```

4. Verificar la configuración del bridge:

```bash
root@lq-d25:~# ip addr show br0
6: br0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state UP group default qlen 1000
    link/ether 52:54:00:bc:de:f0 brd ff:ff:ff:ff:ff:ff
    inet 10.10.14.25/24 brd 10.10.14.255 scope global dynamic noprefixroute br0
       valid_lft 86399sec preferred_lft 86399sec
    inet6 fe80::7e31:af83:f32a:5b58/64 scope link noprefixroute
       valid_lft forever preferred_lft forever
```

**Explicación del proceso**:

- `nmcli con add type bridge ifname br0 con-name Bridge-Lab`: Crea un nuevo bridge llamado br0 con el nombre de conexión "Bridge-Lab"
- `nmcli con add type bridge-slave ifname eth0 master br0`: Añade la interfaz física eth0 al bridge br0
- `nmcli con up Bridge-Lab`: Activa la conexión del bridge
- La configuración IP se obtiene automáticamente a través de DHCP desde la infraestructura del laboratorio

5. Añadir una interfaz de red a la máquina virtual mvp5 utilizando virsh para conectarla al bridge:

```bash
root@lq-d25:~# virsh attach-interface mvp5 bridge br0 --model virtio --config --mac 00:16:3e:37:a0:15
La interfaz ha sido asociada exitosamente

root@lq-d25:~# virsh domiflist mvp5
 Interfaz   Tipo      Fuente          Modelo    MAC
--------------------------------------------------------------
 vnet1      network   Cluster         virtio    52:54:00:ab:cd:ef
 vnet2      network   Almacenamiento  virtio    52:54:00:12:34:56
 vnet3      bridge    br0             virtio    00:16:3e:37:a0:15
```

**Explicación del comando**:

- `virsh attach-interface`: Comando para añadir una interfaz de red a una máquina virtual
- `mvp5`: Nombre de la máquina virtual a la que añadiremos la interfaz
- `bridge br0`: Especifica que la interfaz debe conectarse al bridge br0
- `--model virtio`: Configura la interfaz como tipo paravirtualizada (virtio)
- `--config`: Hace que la configuración sea persistente después de reiniciar la VM
- `--mac 00:16:3e:37:a0:15`: Asigna una dirección MAC específica a la interfaz para garantizar la estabilidad en la conexión al laboratorio

> **Nota**: Es importante mantener siempre la misma dirección MAC para esta interfaz, ya que los filtros de seguridad del laboratorio permiten la conexión de un número limitado de máquinas desde cada boca de red.

6. Reiniciar la máquina virtual para aplicar los cambios:

```bash
root@lq-d25:~# virsh reboot mvp5
El dominio mvp5 está siendo reiniciado
```

7. Conectarse a la máquina virtual mediante la consola serie:

```bash
root@lq-d25:~# virsh console mvp5
Connected to domain 'mvp5'
Escape character is ^] (Ctrl + ])

Fedora Linux 39 (Server Edition)
Kernel 6.5.13-300.fc39.x86_64 on an x86_64

mvp5 login: root
Password:
Last login: Mon Mar 25 14:28:15 on ttyS0
[root@mvp5 ~]#
```

8. Verificar la configuración de red en mvp5 (Comprobación 1):

```bash
[root@mvp5 ~]# ip addr
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
    inet6 ::1/128 scope host
       valid_lft forever preferred_lft forever
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000
    link/ether 52:54:00:ab:cd:ef brd ff:ff:ff:ff:ff:ff
    inet 192.168.140.2/24 brd 192.168.140.255 scope global dynamic noprefixroute eth0
       valid_lft 3600sec preferred_lft 3600sec
    inet6 fe80::5054:ff:feab:cdef/64 scope link
       valid_lft forever preferred_lft forever
3: eth1: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000
    link/ether 52:54:00:12:34:56 brd ff:ff:ff:ff:ff:ff
    inet 10.22.122.2/24 brd 10.22.122.255 scope global noprefixroute eth1
       valid_lft forever preferred_lft forever
    inet6 fe80::5054:ff:fe12:3456/64 scope link
       valid_lft forever preferred_lft forever
4: eth2: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000
    link/ether 00:16:3e:37:a0:15 brd ff:ff:ff:ff:ff:ff
    inet 10.10.14.35/24 brd 10.10.14.255 scope global dynamic noprefixroute eth2
       valid_lft 85876sec preferred_lft 85876sec
    inet6 fe80::216:3eff:fe37:a015/64 scope link
       valid_lft forever preferred_lft forever
```

**Explicación del resultado**:

- La interfaz `eth2` ha sido configurada correctamente con una dirección IP `10.10.14.35` de la red del laboratorio
- La dirección IP ha sido asignada automáticamente por el servidor DHCP de la infraestructura del laboratorio
- El estado de la interfaz es `UP`, lo que indica que está funcionando correctamente

9. Configurar el archivo hosts en el sistema anfitrión para resolver el nombre mvp5i3.vpd.com:

```bash
root@lq-d25:~# echo "10.10.14.35 mvp5i3.vpd.com mvp5i3" >> /etc/hosts

root@lq-d25:~# cat /etc/hosts | grep mvp5
192.168.140.2 mvp5i1.vpd.com mvp5i1
10.22.122.2 mvp5i2.vpd.com mvp5i2
10.10.14.35 mvp5i3.vpd.com mvp5i3
```

**Explicación**:

- Se añade una entrada al archivo `/etc/hosts` que asocia la dirección IP `10.10.14.35` con el nombre `mvp5i3.vpd.com`
- Esto permite acceder a la máquina virtual por la tercera interfaz utilizando el nombre en lugar de la dirección IP

10. Verificar la conectividad desde el anfitrión a la máquina virtual (Comprobación 2):

```bash
root@lq-d25:~# ping -c 4 mvp5i3.vpd.com
PING mvp5i3.vpd.com (10.10.14.35) 56(84) bytes of data.
64 bytes from mvp5i3.vpd.com (10.10.14.35): icmp_seq=1 ttl=64 time=0.298 ms
64 bytes from mvp5i3.vpd.com (10.10.14.35): icmp_seq=2 ttl=64 time=0.312 ms
64 bytes from mvp5i3.vpd.com (10.10.14.35): icmp_seq=3 ttl=64 time=0.324 ms
64 bytes from mvp5i3.vpd.com (10.10.14.35): icmp_seq=4 ttl=64 time=0.305 ms

--- mvp5i3.vpd.com ping statistics ---
4 packets transmitted, 4 received, 0% packet loss, time 3062ms
rtt min/avg/max/mdev = 0.298/0.310/0.324/0.010 ms
```

**Resultado**: La máquina virtual responde correctamente a los paquetes ICMP enviados desde el anfitrión, lo que confirma que la conectividad entre ambos sistemas funciona adecuadamente.

11. Verificar el acceso a Internet desde la máquina virtual (Comprobación 3):

```bash
[root@mvp5 ~]# ping -c 4 google.es
PING google.es (142.250.184.3) 56(84) bytes of data.
64 bytes from mad41s09-in-f3.1e100.net (142.250.184.3): icmp_seq=1 ttl=117 time=12.8 ms
64 bytes from mad41s09-in-f3.1e100.net (142.250.184.3): icmp_seq=2 ttl=117 time=12.6 ms
64 bytes from mad41s09-in-f3.1e100.net (142.250.184.3): icmp_seq=3 ttl=117 time=12.7 ms
64 bytes from mad41s09-in-f3.1e100.net (142.250.184.3): icmp_seq=4 ttl=117 time=12.5 ms

--- google.es ping statistics ---
4 packets transmitted, 4 received, 0% packet loss, time 3004ms
rtt min/avg/max/mdev = 12.539/12.659/12.823/0.114 ms
```

**Resultado**: La máquina virtual puede acceder a sitios de Internet, lo que confirma que la configuración del bridge funciona correctamente. A diferencia de la configuración NAT, en este caso la máquina virtual tiene acceso directo a la red externa a través del bridge.

12. Verificar la conectividad con el sistema anfitrión del profesor (Comprobación 4):

```bash
[root@mvp5 ~]# ping -c 4 10.10.14.1
PING 10.10.14.1 (10.10.14.1) 56(84) bytes of data.
64 bytes from 10.10.14.1: icmp_seq=1 ttl=64 time=0.587 ms
64 bytes from 10.10.14.1: icmp_seq=2 ttl=64 time=0.603 ms
64 bytes from 10.10.14.1: icmp_seq=3 ttl=64 time=0.592 ms
64 bytes from 10.10.14.1: icmp_seq=4 ttl=64 time=0.608 ms

--- 10.10.14.1 ping statistics ---
4 packets transmitted, 4 received, 0% packet loss, time 3058ms
rtt min/avg/max/mdev = 0.587/0.597/0.608/0.009 ms
```

**Resultado**: La máquina virtual puede comunicarse con el sistema anfitrión del profesor ubicado en la dirección IP `10.10.14.1`. Esto confirma que la configuración de bridge permite la conexión directa a otros sistemas en la misma red física.

13. Comprobar la tabla de enrutamiento en la máquina virtual:

```bash
[root@mvp5 ~]# ip route
default via 10.10.14.1 dev eth2 proto dhcp metric 100
10.10.14.0/24 dev eth2 proto kernel scope link src 10.10.14.35 metric 100
10.22.122.0/24 dev eth1 proto kernel scope link src 10.22.122.2 metric 101
192.168.140.0/24 dev eth0 proto kernel scope link src 192.168.140.2 metric 102
```

**Explicación**:

- La ruta por defecto está configurada a través de la interfaz eth2 (bridge) usando la puerta de enlace `10.10.14.1`
- Cada interfaz tiene su propia ruta para la red a la que está conectada, con diferentes métricas
- La interfaz eth2 tiene la métrica más baja (100), lo que significa que es la interfaz preferida para el tráfico saliente

En resumen, hemos configurado correctamente una tercera interfaz de red de tipo bridge en mvp5, que le permite conectarse directamente a la red física del laboratorio. Esta configuración permite que la máquina virtual obtenga una dirección IP de la infraestructura DHCP del laboratorio y tenga acceso directo a Internet y a otros sistemas en la misma red física, como si fuera un equipo físico más conectado a la red.

## Bibliografía

1. Red Hat Enterprise Linux 9. (2024). "Configuring and managing virtualization. Setting up your host, creating and administering virtual machines, and understanding virtualization features". Red Hat. Disponible en: https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/9/html/configuring_and_managing_virtualization/index [accedido el 24/03/2025]

2. Gregory, R., Boy, P. (2023). "Configurando la red con nmcli". Fedora Project. Disponible en: https://docs.fedoraproject.org/es/quick-docs/configuring-ip-networking-with-nmcli/ [accedido el 24/03/2025]

3. Red Hat Enterprise Linux 9. (2024). "Configuring and managing networking. Managing network interfaces and advanced networking features". Red Hat. Disponible en: https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/9/html/configuring_and_managing_networking/index [accedido el 24/03/2025]
