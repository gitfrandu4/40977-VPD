# Práctica 5: Infraestructura de Red Virtual

## Tabla de contenido

- [Práctica 5: Infraestructura de Red Virtual](#práctica-5-infraestructura-de-red-virtual)
  - [Tabla de contenido](#tabla-de-contenido)
  - [Introducción](#introducción)
  - [Requisitos Previos](#requisitos-previos)
  - [Desarrollo](#desarrollo)
    - [Plan de actividades y orientaciones](#plan-de-actividades-y-orientaciones)
      - [Tarea 1. Creación de la Máquina Virtual mvp5](#tarea-1-creación-de-la-máquina-virtual-mvp5)
        - [Recuperación en caso de errores](#recuperación-en-caso-de-errores)
      - [Tarea 2. Configuración de la Consola Serie](#tarea-2-configuración-de-la-consola-serie)
        - [Recuperación en caso de errores](#recuperación-en-caso-de-errores-1)
    - [Fase 2. Creación y Configuración de Redes Virtuales](#fase-2-creación-y-configuración-de-redes-virtuales)
      - [Tarea 1. Creación de una Red de Tipo NAT](#tarea-1-creación-de-una-red-de-tipo-nat)
        - [Recuperación en caso de errores](#recuperación-en-caso-de-errores-2)
      - [Tarea 2. Añadir la Primera Interfaz de Red](#tarea-2-añadir-la-primera-interfaz-de-red)
        - [Recuperación en caso de errores](#recuperación-en-caso-de-errores-3)
      - [Tarea 3. Creación de una Red Aislada](#tarea-3-creación-de-una-red-aislada)
        - [Recuperación en caso de errores](#recuperación-en-caso-de-errores-4)
      - [Tarea 4. Añadir la Segunda Interfaz de Red](#tarea-4-añadir-la-segunda-interfaz-de-red)
        - [Recuperación en caso de errores](#recuperación-en-caso-de-errores-5)
      - [Tarea 5. Creación de una Tercera Interfaz de Red de Tipo Bridge](#tarea-5-creación-de-una-tercera-interfaz-de-red-de-tipo-bridge)
        - [Recuperación en caso de errores](#recuperación-en-caso-de-errores-6)
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
root@lq-d25:~# virsh domiflist mvp5
 Interfaz   Tipo      Fuente    Modelo   MAC
------------------------------------------------------------
 vnet0      network   default   virtio   00:16:3e:37:a0:05

root@lq-d25:~# virsh detach-interface mvp5 network --mac 00:16:3e:37:a0:05
La interfaz ha sido desmontada exitosamente

root@lq-d25:~# virsh detach-interface mvp5 network --mac 00:16:3e:37:a0:05 --config
La interfaz ha sido desmontada exitosamente
```

```
root@lq-d25:~# virsh domiflist mvp5
 Interfaz   Tipo   Fuente   Modelo   MAC
------------------------------------------
```

> **Nota**: Al eliminar la interfaz de red, la máquina virtual quedará sin conectividad de red. Para acceder a ella, utilizaremos la consola serie que configuraremos en la siguiente tarea.

##### Recuperación en caso de errores

Si has cometido errores durante esta tarea o necesitas empezar de nuevo, puedes seguir estos pasos para eliminar completamente la máquina virtual mvp5 y comenzar desde cero:

```bash
# Detener la máquina virtual mvp5 si está en ejecución
root@lq-d25:~# virsh destroy mvp5

# Eliminar la máquina virtual mvp5
root@lq-d25:~# virsh undefine mvp5 --remove-all-storage

# Verificar que la máquina ha sido eliminada
root@lq-d25:~# virsh list --all

# Volver a clonar mvp1 para crear mvp5
root@lq-d25:~# virt-clone --original mvp1 --name mvp5 --file /var/lib/libvirt/images/mvp5.qcow2 --mac=00:16:3e:37:a0:05
```

**Explicación de los comandos**:

- `virsh destroy mvp5`: Detiene forzosamente la ejecución de la máquina virtual
- `virsh undefine mvp5 --remove-all-storage`: Elimina la definición de la máquina virtual y todos sus archivos de almacenamiento
- `virt-clone`: Vuelve a clonar la máquina original para recomenzar el proceso

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
[root@mvp1 ~]# cat /etc/default/grub
GRUB_TIMEOUT=5
GRUB_DISTRIBUTOR="$(sed 's, release .*$,,g' /etc/system-release)"
GRUB_DEFAULT=saved
GRUB_DISABLE_SUBMENU=true
GRUB_TERMINAL_OUTPUT="console"
GRUB_CMDLINE_LINUX="console=ttyS0 rd.lvm.lv=fedora/root rhgb quiet"
GRUB_DISABLE_RECOVERY="true"
GRUB_ENABLE_BLSCFG=true
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

mvp1 login: root
Contraseña:
Last login: Thu Apr  3 19:31:14 on tty1
[root@mvp1 ~]#
```

**Explicación del proceso**:

- Configuramos la consola serie añadiendo el parámetro `console=ttyS0` al kernel de Linux
- Eliminamos opciones que pudieran interferir con `grub2-editenv - unset kernelopts`
- Regeneramos la configuración de GRUB con `grub2-mkconfig`
- Conectamos a la consola serie con `virsh console mvp5`

Ahora tenemos acceso a la máquina virtual incluso sin interfaz de red, lo que nos permitirá configurar las interfaces de red requeridas en las siguientes tareas.

##### Recuperación en caso de errores

Si has cometido errores durante la configuración de la consola serie o no funciona correctamente, puedes seguir estos pasos para restablecer la configuración:

```bash
# Acceder a la máquina virtual utilizando virt-manager
root@lq-d25:~# virt-manager

# Desde la consola gráfica, editar el archivo /etc/default/grub nuevamente
# Asegúrate de que la línea GRUB_CMDLINE_LINUX contenga "console=ttyS0"

# Si necesitas reiniciar el proceso desde cero, puedes seguir estos pasos
root@lq-d25:~# virsh destroy mvp5
root@lq-d25:~# virsh undefine mvp5 --remove-all-storage
root@lq-d25:~# virt-clone --original mvp1 --name mvp5 --file /var/lib/libvirt/images/mvp5.qcow2 --mac=00:16:3e:37:a0:05

# Y luego volver a configurar la consola serie siguiendo los pasos de la tarea 2
```

### Fase 2. Creación y Configuración de Redes Virtuales

#### Tarea 1. Creación de una Red de Tipo NAT

En esta tarea crearemos una red virtual de tipo NAT llamada "Cluster" con un rango de direcciones 192.168.140.0/24 y un servicio DHCP activo.

> **Nota**: Aunque la ficha de la práctica sugiere usar `virt-manager`, en esta documentación se utiliza la línea de comandos (`virsh` y archivos XML) para definir la red, ya que proporciona mayor control y es más fácilmente reproducible y documentable.

1. Verificar las redes virtuales existentes:

```bash
root@lq-d25:~# virsh net-list --all
 Nombre    Estado   Inicio automático   Persistente
-----------------------------------------------------
 default   activo   si                  si

root@lq-d25:~#
```

2. Crear un archivo XML para definir la red "Cluster":

```bash
root@lq-d25:~# cat cluster-network.xml
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
La red Cluster se encuentra definida desde cluster-network.xml
```

4. Iniciar la red:

```bash
root@lq-d25:~# virsh net-start Cluster
La red Cluster se ha iniciado
```

5. Configurar la red para que se inicie automáticamente:

```bash
root@lq-d25:~# virsh net-autostart Cluster
La red Cluster ha sido marcada para iniciarse automáticamente
```

6. Verificar que la red se ha creado correctamente:

```bash
root@lq-d25:~# virsh net-list --all
 Nombre    Estado   Inicio automático   Persistente
-----------------------------------------------------
 Cluster   activo   si                  si
 default   activo   si                  si
```

7. Ver los detalles de la red:

```bash
root@lq-d25:~#  virsh net-info Cluster
Nombre:         Cluster
UUID:           7ee051d7-e38d-45ab-a26c-232a51e5162e
Activar:        si
Persistente:    si
Autoinicio:     si
Puente:         virbr1
```

8. Verificar la configuración del bridge en el sistema:

```bash
root@lq-d25:~#  ip addr show virbr1
5: virbr1: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1500 qdisc noqueue state DOWN group default qlen 1000
    link/ether 52:54:00:55:02:69 brd ff:ff:ff:ff:ff:ff
    inet 192.168.140.1/24 brd 192.168.140.255 scope global virbr1
       valid_lft forever preferred_lft forever
```

Estas acciones han creado correctamente una red NAT llamada "Cluster" con las características requeridas, que ahora está lista para ser utilizada por máquinas virtuales.

##### Recuperación en caso de errores

Si has cometido errores durante la creación de la red NAT o necesitas volver a empezar, puedes seguir estos pasos para eliminar la red y crearla de nuevo:

```bash
# Detener la red si está en ejecución
root@lq-d25:~# virsh net-destroy Cluster

# Eliminar la definición de la red
root@lq-d25:~# virsh net-undefine Cluster

# Verificar que la red ha sido eliminada
root@lq-d25:~# virsh net-list --all

# Volver a crear el archivo XML de la red
root@lq-d25:~# cat > cluster-network.xml << EOF
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

# Definir la red nuevamente
root@lq-d25:~# virsh net-define cluster-network.xml

# Iniciar la red
root@lq-d25:~# virsh net-start Cluster

# Configurar autoarranque
root@lq-d25:~# virsh net-autostart Cluster
```

**Explicación de los comandos**:

- `virsh net-destroy`: Detiene la red activa
- `virsh net-undefine`: Elimina la definición de la red
- `virsh net-define`: Vuelve a definir la red usando el archivo XML
- `virsh net-start` y `virsh net-autostart`: Inician la red y configuran su inicio automático

#### Tarea 2. Añadir la Primera Interfaz de Red

En esta tarea añadiremos una primera interfaz de red a la máquina virtual mvp5, para que pueda conectarse a la red NAT "Cluster" que creamos anteriormente.

1. Añadir una interfaz de red a la máquina virtual mvp5 utilizando virsh:

```bash
root@lq-d25:~# virsh attach-interface mvp5 network Cluster --model virtio --config
La interfaz ha sido asociada exitosamente


root@lq-d25:~# virsh domiflist mvp5
 Interfaz   Tipo      Fuente    Modelo   MAC
------------------------------------------------------------
 -          network   Cluster   virtio   52:54:00:1d:94:c0
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
```

4. Verificar la configuración de red en mvp5 (Comprobación 1):

```bash
[root@mvp1 ~]# ip addr
```

**Explicación del resultado**:

- La interfaz `enp7s0` ha sido configurada correctamente con una dirección IP `192.168.140.25` de la red Cluster (192.168.140.0/24)
- La dirección IP ha sido asignada automáticamente por el servidor DHCP de la red Cluster
- El estado de la interfaz es `UP`, lo que indica que está funcionando correctamente

5. Configurar el archivo hosts en el sistema anfitrión para resolver el nombre mvp5i1.vpd.com:

```bash
root@lq-d25:~# echo "192.168.140.25 mvp5i1.vpd.com mvp5i1" >> /etc/hosts

root@lq-d25:~# cat /etc/hosts | grep mvp5
192.168.140.25 mvp5i1.vpd.com mvp5i1
```

**Explicación**:

- Se añade una entrada al archivo `/etc/hosts` que asocia la dirección IP `192.168.140.25` con el nombre `mvp5i1.vpd.com`
- Esto permite acceder a la máquina virtual utilizando el nombre en lugar de la dirección IP

6. Verificar la conectividad desde el anfitrión a la máquina virtual (Comprobación 2):

```bash
root@lq-d25:~# ping -c 4 mvp5i1.vpd.com
PING mvp5i1.vpd.com (192.168.140.25) 56(84) bytes of data.
64 bytes from mvp5i1.vpd.com (192.168.140.25): icmp_seq=1 ttl=64 time=0.280 ms
64 bytes from mvp5i1.vpd.com (192.168.140.25): icmp_seq=2 ttl=64 time=0.437 ms
64 bytes from mvp5i1.vpd.com (192.168.140.25): icmp_seq=3 ttl=64 time=0.242 ms
64 bytes from mvp5i1.vpd.com (192.168.140.25): icmp_seq=4 ttl=64 time=0.226 ms

--- mvp5i1.vpd.com ping statistics ---
4 packets transmitted, 4 received, 0% packet loss, time 3092ms
rtt min/avg/max/mdev = 0.226/0.296/0.437/0.083 ms
```

**Resultado**: La máquina virtual responde correctamente a los paquetes ICMP enviados desde el anfitrión, lo que confirma que la conectividad entre ambos sistemas funciona adecuadamente.

7. Verificar el acceso a Internet desde la máquina virtual (Comprobación 3):

```bash
[root@mvp1 ~]# ping -c 4 google.es
PING google.es (142.250.184.163) 56(84) bytes of data.
64 bytes from mad07s23-in-f3.1e100.net (142.250.184.163): icmp_seq=1 ttl=114 time=29.7 ms
64 bytes from mad07s23-in-f3.1e100.net (142.250.184.163): icmp_seq=2 ttl=114 time=30.3 ms
64 bytes from mad07s23-in-f3.1e100.net (142.250.184.163): icmp_seq=3 ttl=114 time=30.0 ms
64 bytes from mad07s23-in-f3.1e100.net (142.250.184.163): icmp_seq=4 ttl=114 time=30.4 ms

--- google.es ping statistics ---
4 packets transmitted, 4 received, 0% packet loss, time 3004ms
rtt min/avg/max/mdev = 29.738/30.110/30.441/0.267 ms
```

**Resultado**: La máquina virtual puede acceder a sitios de Internet, lo que confirma que la configuración de NAT funciona correctamente. Los paquetes enviados desde la máquina virtual son enrutados a través del sistema anfitrión hacia Internet.

8. Verificar la configuración de red completa en la máquina virtual:

```bash
[root@mvp1 ~]# ip route
default via 192.168.140.1 dev enp7s0 proto dhcp src 192.168.140.25 metric 100
192.168.140.0/24 dev enp7s0 proto kernel scope link src 192.168.140.25 metric 100
```

```bash
[root@mvp1 ~]# cat /etc/resolv.conf

nameserver 127.0.0.53
options edns0 trust-ad
search .
```

**Explicación**:

- La tabla de rutas muestra que la puerta de enlace por defecto es `192.168.140.1`, que corresponde al bridge de la red NAT "Cluster"
- La máquina virtual puede resolver nombres de dominio usando el servidor DNS configurado (127.0.0.53)
- La métrica de la ruta por defecto es 100, lo que indica que es la ruta preferida para el tráfico saliente

Estas comprobaciones confirman que la interfaz de red se ha configurado correctamente y proporciona conectividad tanto con el anfitrión como con Internet. La red NAT "Cluster" está funcionando como se esperaba, permitiendo que la máquina virtual obtenga una dirección IP automáticamente y pueda comunicarse con otros sistemas.

##### Recuperación en caso de errores

Si has cometido errores al añadir la primera interfaz de red o necesitas volver a configurarla, puedes seguir estos pasos:

```bash
# Ver las interfaces de red actuales
root@lq-d25:~# virsh domiflist mvp5

# Eliminar la interfaz específica (usando su MAC)
root@lq-d25:~# virsh detach-interface mvp5 network --mac 52:54:00:1d:94:c0
root@lq-d25:~# virsh detach-interface mvp5 network --mac 52:54:00:1d:94:c0 --config

# Verificar que la interfaz ha sido eliminada
root@lq-d25:~# virsh domiflist mvp5

# Volver a añadir la interfaz
root@lq-d25:~# virsh attach-interface mvp5 network Cluster --model virtio --config

# Reiniciar la máquina virtual
root@lq-d25:~# virsh reboot mvp5

# En la máquina virtual, eliminar la configuración de red anterior si existe
[root@mvp1 ~]# nmcli connection delete Almacenamiento

# Crear la nueva conexión con dirección IP estática
[root@mvp1 ~]# nmcli connection add type ethernet con-name Almacenamiento ifname enp1s0 ipv4.method manual ipv4.addresses 10.22.122.2/24

# Activar la conexión
[root@mvp1 ~]# nmcli connection up Almacenamiento

# En el anfitrión, eliminar la entrada antigua en /etc/hosts si es necesario
root@lq-d25:~# sed -i '/mvp5i2.vpd.com/d' /etc/hosts
```

**Explicación de los comandos**:

- `virsh domiflist`: Muestra las interfaces de la máquina virtual
- `virsh detach-interface`: Elimina una interfaz de red específica
- `virsh attach-interface`: Vuelve a añadir la interfaz
- `nmcli connection delete`: Elimina la configuración de red existente
- `nmcli connection add`: Crea una nueva conexión con IP estática
- `sed -i '/mvp5i2.vpd.com/d' /etc/hosts`: Elimina la entrada antigua del archivo hosts

#### Tarea 3. Creación de una Red Aislada

En esta tarea crearemos una red virtual aislada llamada "Almacenamiento" con un rango de direcciones 10.22.122.0/24 sin servicio DHCP. A diferencia de la red NAT, esta red no tendrá conectividad con el exterior.

1. Crear un archivo XML para definir la red "Almacenamiento":

```bash
root@lq-d25:~# cat almacenamiento-network.xml
<network>
  <name>Almacenamiento</name>
  <bridge name='virbr2' stp='on' delay='0'/>
  <ip address='10.22.122.1' netmask='255.255.255.0'>
  </ip>
</network>
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
La red Almacenamiento se encuentra definida desde almacenamiento-network.xml
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
 Nombre           Estado   Inicio automático   Persistente
------------------------------------------------------------
 Almacenamiento   activo   si                  si
 Cluster          activo   si                  si
 default          activo   si                  si
```

6. Ver los detalles de la red:

```bash
root@lq-d25:~# virsh net-info Almacenamiento
Nombre:         Almacenamiento
UUID:           5c2735be-366d-4c47-907c-8fbfcf600175
Activar:        si
Persistente:    si
Autoinicio:     si
Puente:         virbr2
```

7. Verificar la configuración del bridge en el sistema:

```bash
root@lq-d25:~#  ip addr show virbr2
7: virbr2: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1500 qdisc noqueue state DOWN group default qlen 1000
    link/ether 52:54:00:5a:4b:6b brd ff:ff:ff:ff:ff:ff
    inet 10.22.122.1/24 brd 10.22.122.255 scope global virbr2
       valid_lft forever preferred_lft forever
```

**Explicación del resultado**:

- La interfaz `virbr2` ha sido creada en el anfitrión con la dirección IP `10.22.122.1`
- El estado es `DOWN` porque aún no hay ninguna máquina virtual conectada a esta red
- Al ser una red aislada, solo permitirá la comunicación entre las máquinas virtuales conectadas a ella y el anfitrión

##### Recuperación en caso de errores

Si has cometido errores durante la creación de la red aislada o necesitas volver a empezar, puedes seguir estos pasos para eliminar la red y crearla de nuevo:

```bash
# Detener la red si está en ejecución
root@lq-d25:~# virsh net-destroy Almacenamiento

# Eliminar la definición de la red
root@lq-d25:~# virsh net-undefine Almacenamiento

# Verificar que la red ha sido eliminada
root@lq-d25:~# virsh net-list --all

# Volver a crear el archivo XML de la red
root@lq-d25:~# cat > almacenamiento-network.xml << EOF
<network>
  <name>Almacenamiento</name>
  <bridge name='virbr2' stp='on' delay='0'/>
  <ip address='10.22.122.1' netmask='255.255.255.0'>
  </ip>
</network>
EOF

# Definir la red nuevamente
root@lq-d25:~# virsh net-define almacenamiento-network.xml

# Iniciar la red
root@lq-d25:~# virsh net-start Almacenamiento

# Configurar autoarranque
root@lq-d25:~# virsh net-autostart Almacenamiento
```

**Explicación de los comandos**:

- `virsh net-destroy`: Detiene la red activa
- `virsh net-undefine`: Elimina la definición de la red
- `virsh net-define`: Vuelve a definir la red usando el archivo XML
- `virsh net-start` y `virsh net-autostart`: Inician la red y configuran su inicio automático

#### Tarea 4. Añadir la Segunda Interfaz de Red

En esta tarea añadiremos una segunda interfaz de red a la máquina virtual mvp5, para que pueda conectarse a la red aislada "Almacenamiento" que creamos anteriormente.

1. Añadir una interfaz de red a la máquina virtual mvp5 utilizando virsh:

```bash
root@lq-d25:~# virsh attach-interface mvp5 network Almacenamiento --model virtio --config
La interfaz ha sido asociada exitosamente

root@lq-d25:~# virsh domiflist mvp5
 Interfaz   Tipo      Fuente           Modelo   MAC
-------------------------------------------------------------------
 -          network   Cluster          virtio   52:54:00:1d:94:c0
 -          network   Almacenamiento   virtio   52:54:00:b6:c9:4c
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
```

4. Verificar la configuración de red en mvp5 (Comprobación 1):

```bash
[root@mvp1 ~]# ip addr
```

Se observa que la interfaz `XXXXXX` está presente pero no tiene asignada una dirección IPv4. A continuación, configuraremos la dirección IP estática.

5. Configurar la dirección IP estática para la interfaz eth1:

```bash
[root@mvp5 ~]# nmcli connection add type ethernet con-name Almacenamiento ifname enp1s0 ipv4.method manual ipv4.addresses 10.22.122.2/24
Conexión 'Almacenamiento' (38c98a28-8fa5-4c93-b779-26ede1f914ef) agregada con éxito.
```

```bash
[root@mvp1 ~]# nmcli connection up Almacenamiento
Conexión activada con éxito (ruta activa D-Bus: /org/freedesktop/NetworkManager/ActiveConnection/9)
```

En caso de equivocarnos asignando la interfaz de red, podemos solucionarlo con el siguiente comando:

```bash
[root@mvp1 ~]# nmcli connection modify Almacenamiento ifname enp1s0
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
[root@mvp1 ~]# ip addr show enp1s0
2: enp1s0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000
    link/ether 52:54:00:b6:c9:4c brd ff:ff:ff:ff:ff:ff
    inet 10.22.122.2/24 brd 10.22.122.255 scope global noprefixroute enp1s0
       valid_lft forever preferred_lft forever
    inet6 fe80::15d0:c23a:eb4d:644d/64 scope link noprefixroute
       valid_lft forever preferred_lft forever
```

**Resultado**: La interfaz `enp1s0` ahora tiene configurada la dirección IP estática `10.22.122.2/24`.

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
64 bytes from mvp5i2.vpd.com (10.22.122.2): icmp_seq=1 ttl=64 time=0.259 ms
64 bytes from mvp5i2.vpd.com (10.22.122.2): icmp_seq=2 ttl=64 time=0.343 ms
64 bytes from mvp5i2.vpd.com (10.22.122.2): icmp_seq=3 ttl=64 time=0.392 ms
64 bytes from mvp5i2.vpd.com (10.22.122.2): icmp_seq=4 ttl=64 time=0.363 ms

--- mvp5i2.vpd.com ping statistics ---
4 packets transmitted, 4 received, 0% packet loss, time 3089ms
rtt min/avg/max/mdev = 0.259/0.310/0.324/0.010 ms
```

**Resultado**: La máquina virtual responde correctamente a los paquetes ICMP enviados desde el anfitrión a través de la interfaz conectada a la red "Almacenamiento".

9. Verificar la conectividad desde la máquina virtual al anfitrión (Comprobación 3):

```bash
[root@mvp1 ~]# ping -c 4 10.22.122.1
PING 10.22.122.1 (10.22.122.1) 56(84) bytes of data.
64 bytes from 10.22.122.1: icmp_seq=1 ttl=64 time=0.152 ms
64 bytes from 10.22.122.1: icmp_seq=2 ttl=64 time=0.198 ms
64 bytes from 10.22.122.1: icmp_seq=3 ttl=64 time=0.343 ms
64 bytes from 10.22.122.1: icmp_seq=4 ttl=64 time=0.281 ms

--- 10.22.122.1 ping statistics ---
4 packets transmitted, 4 received, 0% packet loss, time 3063ms
rtt min/avg/max/mdev = 0.152/0.243/0.343/0.073 ms
```

**Resultado**: La máquina virtual puede comunicarse con el sistema anfitrión a través de la interfaz virbr2 (10.22.122.1) utilizando la red aislada "Almacenamiento".

10. Intentar acceder a Internet desde la interfaz eth1:

```bash
[root@mvp1 ~]# ip route get 8.8.8.8
8.8.8.8 via 192.168.140.1 dev enp7s0 src 192.168.140.25 uid 0
    cache
```

**Explicación**: Los paquetes destinados a Internet siguen utilizando la primera interfaz (eth0) conectada a la red NAT "Cluster", ya que la segunda interfaz (eth1) está conectada a una red aislada sin acceso al exterior.

En resumen, hemos configurado correctamente una segunda interfaz de red en mvp5 conectada a una red aislada llamada "Almacenamiento". Esta interfaz permite la comunicación entre la máquina virtual y el anfitrión, pero no tiene acceso a redes externas, lo que es el comportamiento esperado para una red aislada.

##### Recuperación en caso de errores

Si has cometido errores al añadir la segunda interfaz de red o necesitas volver a configurarla, puedes seguir estos pasos para solucionarlos:

```bash
# Ver las interfaces de red actuales
root@lq-d25:~# virsh domiflist mvp5

# Eliminar la interfaz específica (usando su MAC)
root@lq-d25:~# virsh detach-interface mvp5 network --mac 52:54:00:b6:c9:4c
root@lq-d25:~# virsh detach-interface mvp5 network --mac 52:54:00:b6:c9:4c --config

# Verificar que la interfaz ha sido eliminada
root@lq-d25:~# virsh domiflist mvp5

# Volver a añadir la interfaz
root@lq-d25:~# virsh attach-interface mvp5 network Almacenamiento --model virtio --config

# Reiniciar la máquina virtual
root@lq-d25:~# virsh reboot mvp5

# En la máquina virtual, eliminar la configuración de red anterior si existe
[root@mvp1 ~]# nmcli connection delete Almacenamiento

# Crear la nueva conexión con dirección IP estática
[root@mvp1 ~]# nmcli connection add type ethernet con-name Almacenamiento ifname enp1s0 ipv4.method manual ipv4.addresses 10.22.122.2/24

# Activar la conexión
[root@mvp1 ~]# nmcli connection up Almacenamiento

# En el anfitrión, eliminar la entrada antigua en /etc/hosts si es necesario
root@lq-d25:~# sed -i '/mvp5i2.vpd.com/d' /etc/hosts
```

**Explicación de los comandos**:

- `virsh domiflist`: Muestra las interfaces de la máquina virtual
- `virsh detach-interface`: Elimina una interfaz de red específica
- `virsh attach-interface`: Vuelve a añadir la interfaz
- `nmcli connection delete`: Elimina la configuración de red existente
- `nmcli connection add`: Crea una nueva conexión con IP estática
- `sed -i '/mvp5i2.vpd.com/d' /etc/hosts`: Elimina la entrada antigua del archivo hosts

#### Tarea 5. Creación de una Tercera Interfaz de Red de Tipo Bridge

En esta tarea crearemos un bridge en el sistema anfitrión y añadiremos una tercera interfaz de red a la máquina virtual mvp5 conectada a este bridge. Esta configuración permitirá que la máquina virtual esté en la misma red física que el anfitrión, accediendo directamente a la red del laboratorio.

1. Crear un bridge en el sistema anfitrión utilizando NetworkManager:

```bash
root@lq-d25:~# nmcli con add type bridge ifname br0 con-name Bridge-Lab
Conexión «Bridge-Lab» (d650c78e-d202-4461-89ac-bafbb45c6792) añadida con éxito.
```

2. Añadir la interfaz física (eth0) al bridge:

```bash
root@lq-d25:~# nmcli con add type bridge-slave ifname eth0 master br0
Conexión «bridge-slave-eth0» (85772954-8db0-4d6e-bdc5-41f8660941ab) añadida con éxito.
```

3. Activar el bridge:

```bash
root@lq-d25:~# nmcli con up Bridge-Lab
La conexión se ha activado correctamente (master waiting for slaves) (ruta activa D-Bus: /org/freedesktop/NetworkManager/ActiveConnection/11)
```

4. Verificar la configuración del bridge:

```bash
root@lq-d25:~# ip addr show br0
11: br0: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1500 qdisc noqueue state DOWN group default qlen 1000
    link/ether 1e:7d:d4:4c:16:57 brd ff:ff:ff:ff:ff:ff
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
```

```bash

root@lq-d25:~# virsh domiflist mvp5
 Interfaz   Tipo      Fuente           Modelo   MAC
-------------------------------------------------------------------
 -          network   Cluster          virtio   52:54:00:1d:94:c0
 -          network   Almacenamiento   virtio   52:54:00:b6:c9:4c
 -          bridge    br0              virtio   00:16:3e:37:a0:15
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
[root@mvp1 ~]# ip addr
```

**Explicación del resultado**:

- La interfaz `eth2` ha sido configurada correctamente con una dirección IP `10.10.14.35` de la red del laboratorio
- La dirección IP ha sido asignada automáticamente por el servidor DHCP de la infraestructura del laboratorio
- El estado de la interfaz es `UP`, lo que indica que está funcionando correctamente

```
root@lq-d25:~# nmcli device status
DEVICE  TYPE      STATE                                     CONNECTION
enp6s0  ethernet  conectado                                 enp6s0
lo      loopback  connected (externally)                    lo
virbr0  bridge    connected (externally)                    virbr0
virbr1  bridge    connected (externally)                    virbr1
virbr2  bridge    connected (externally)                    virbr2
vnet7   tun       connected (externally)                    vnet7
vnet8   tun       connected (externally)                    vnet8
br0     bridge    conectando (obteniendo configuración IP)  Bridge-Lab
vnet9   tun       sin gestión                               --
```

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
rtt min/avg/max/mdev = 12.539/12.659/12.823/0.267 ms
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
- La interfaz eth2 tiene la métrica más baja (100), lo que indica que es la interfaz preferida para el tráfico saliente

En resumen, hemos configurado correctamente una tercera interfaz de red de tipo bridge en mvp5, que le permite conectarse directamente a la red física del laboratorio. Esta configuración permite que la máquina virtual obtenga una dirección IP de la infraestructura DHCP del laboratorio y tenga acceso directo a Internet y a otros sistemas en la misma red física, como si fuera un equipo físico más conectado a la red.

##### Recuperación en caso de errores

Si has cometido errores al añadir la tercera interfaz de red o tienes problemas con el DHCP, puedes seguir estos pasos para solucionarlos:

```bash
# En el sistema anfitrión:

# Ver las interfaces de red actuales
root@lq-d25:~# virsh domiflist mvp5

# Eliminar la interfaz bridge si es necesario
root@lq-d25:~# virsh detach-interface mvp5 bridge --mac 00:16:3e:37:a0:15
root@lq-d25:~# virsh detach-interface mvp5 bridge --mac 00:16:3e:37:a0:15 --config

# Verificar que la interfaz ha sido eliminada
root@lq-d25:~# virsh domiflist mvp5

# Eliminar la configuración del bridge si es necesario
root@lq-d25:~# nmcli con del Bridge-Lab
root@lq-d25:~# nmcli con del bridge-slave-eth0

# Volver a crear el bridge correctamente
root@lq-d25:~# nmcli con add type bridge ifname br0 con-name Bridge-Lab
root@lq-d25:~# nmcli con add type bridge-slave ifname eth0 master br0

# Desactivar la conexión original antes de activar el bridge
root@lq-d25:~# nmcli con down "nombre-conexión-original"
root@lq-d25:~# nmcli con up Bridge-Lab

# Verificar que el bridge tiene IP
root@lq-d25:~# ip addr show br0

# Si no tiene IP, forzar renovación DHCP
root@lq-d25:~# nmcli con down Bridge-Lab
root@lq-d25:~# nmcli con up Bridge-Lab

# Volver a añadir la interfaz bridge a la máquina virtual
root@lq-d25:~# virsh attach-interface mvp5 bridge br0 --model virtio --config --mac 00:16:3e:37:a0:15

# Reiniciar la máquina virtual
root@lq-d25:~# virsh reboot mvp5

# En la máquina virtual (a través de virsh console mvp5):

# Identificar el nombre de la interfaz
[root@mvp1 ~]# ip addr

# Si la interfaz no tiene IP, forzar la configuración DHCP:
[root@mvp1 ~]# nmcli device status
[root@mvp1 ~]# nmcli con show

# Si la conexión existe, reiniciarla:
[root@mvp1 ~]# nmcli con down "nombre-conexión-eth2"
[root@mvp1 ~]# nmcli con up "nombre-conexión-eth2"

# Si la conexión no existe, crearla:
[root@mvp1 ~]# nmcli con add type ethernet con-name Bridge-Lab ifname eth2 ipv4.method auto

# Si sigue sin funcionar, reiniciar NetworkManager:
[root@mvp1 ~]# systemctl restart NetworkManager

# Verificar la configuración
[root@mvp1 ~]# ip addr
[root@mvp1 ~]# ip route

# En el anfitrión, eliminar la entrada antigua en /etc/hosts si es necesario
root@lq-d25:~# sed -i '/mvp5i3.vpd.com/d' /etc/hosts
```

**Explicación de los comandos**:

- Los comandos del anfitrión permiten eliminar y recrear tanto la interfaz bridge en la VM como el bridge en el sistema anfitrión
- Los comandos de la máquina virtual permiten forzar la asignación DHCP de varias maneras
- Se puede reiniciar NetworkManager como último recurso si los otros métodos no funcionan
- Es fundamental mantener la misma dirección MAC para cumplir con los requisitos de seguridad del laboratorio

## Bibliografía

1. Red Hat Enterprise Linux 9. (2024). "Configuring and managing virtualization. Setting up your host, creating and administering virtual machines, and understanding virtualization features". Red Hat. Disponible en: https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/9/html/configuring_and_managing_virtualization/index [accedido el 24/03/2025]

2. Gregory, R., Boy, P. (2023). "Configurando la red con nmcli". Fedora Project. Disponible en: https://docs.fedoraproject.org/es/quick-docs/configuring-ip-networking-with-nmcli/ [accedido el 24/03/2025]

3. Red Hat Enterprise Linux 9. (2024). "Configuring and managing networking. Managing network interfaces and advanced networking features". Red Hat. Disponible en: https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/9/html/configuring_and_managing_networking/index [accedido el 24/03/2025]
