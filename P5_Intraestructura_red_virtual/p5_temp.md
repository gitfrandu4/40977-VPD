# Práctica 5: Infraestructura de Red Virtual

## Tabla de contenido

- [Práctica 5: Infraestructura de Red Virtual](#práctica-5-infraestructura-de-red-virtual)
  - [Tabla de contenido](#tabla-de-contenido)
  - [Introducción](#introducción)
  - [Desarrollo](#desarrollo)
    - [Fase 1. Preparación Inicial](#fase-1-preparación-inicial)
      - [Tarea 1. Creación de la Máquina Virtual mvp5](#tarea-1-creación-de-la-máquina-virtual-mvp5)
      - [Tarea 2. Configuración de la Consola Serie](#tarea-2-configuración-de-la-consola-serie)
    - [Fase 2. Creación y Configuración de Redes Virtuales](#fase-2-creación-y-configuración-de-redes-virtuales)
      - [Tarea 1. Creación de una Red de Tipo NAT](#tarea-1-creación-de-una-red-de-tipo-nat)
      - [Tarea 2. Añadir la Primera Interfaz de Red](#tarea-2-añadir-la-primera-interfaz-de-red)

## Introducción

El objetivo fundamental de esta práctica es conocer los diferentes tipos de redes en entornos de virtualización y saber configurarlas. Libvirt usa el concepto de switch virtual, un componente software que opera en el anfitrión, al que se conectan las máquinas virtuales (MVs). El tráfico de red de las MVs es gobernado por este switch.

En Linux, el sistema anfitrión representa el switch virtual mediante una interfaz de red. Cuando el demonio libvirtd está activo, la interfaz de red por defecto que representa el switch virtual es "virbr0". Esta interfaz se puede ver en el anfitrión a través de la orden `ip addr show`.

Por defecto, los switches virtuales operan en modo NAT. Sin embargo, también se pueden configurar en modo "Red Enrutada" y en modo "Red Aislada". También se puede configurar una interfaz de red de la máquina virtual para que esté asociada a una interfaz de tipo bridge del anfitrión. En esta práctica crearemos y configuraremos diferentes tipos de redes.

## Desarrollo

### Fase 1. Preparación Inicial

#### Tarea 1. Creación de la Máquina Virtual mvp5

Para comenzar esta práctica, es necesario clonar la máquina virtual mvp1 creada en la práctica 1. Después, eliminaremos la interfaz de red por defecto para reconfigurarla según los requerimientos de esta práctica.

1. Verificar las máquinas virtuales existentes:

```bash
root@lq-d25:~# virsh list --all
 Id   Nombre               Estado
----------------------------------
 -    mvp1                 apagado
```

2. Clonar la máquina virtual mvp1 para crear mvp5:

```bash
root@lq-d25:~# virt-clone --original mvp1 --name mvp5 --file /var/lib/libvirt/images/mvp5.qcow2 --mac=00:16:3e:37:a0:05
Allocating 'mvp5.qcow2'                                      | 1.8 GB  00:05 ...

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

4. Verificar la configuración de red actual:

```bash
root@lq-d25:~# virsh domiflist mvp5
 Interfaz   Tipo      Fuente    Modelo    MAC
----------------------------------------------------------
 vnet0      network   default   virtio    00:16:3e:37:a0:05
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
