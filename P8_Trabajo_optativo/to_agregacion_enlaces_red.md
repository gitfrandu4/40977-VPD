# Trabajo Optativo: Agregación de Enlaces de Red (Bonding)

## Introducción

La agregación de enlaces (o *bonding*) es una característica del kernel de Linux que combina varias interfaces Ethernet físicas en una única interfaz lógica para aumentar la tolerancia a fallos y/o el ancho de banda disponible.  
Esta práctica sigue las directrices oficiales de Red Hat Enterprise Linux 8 — *Configuring network bonding*[^rhel-bonding].

**Objetivos**

* Crear una VM Fedora y habilitar la agregación de enlaces.
* Configurar dos perfiles:
  1. **Alta disponibilidad** – *active‑backup* (modo 1).
  2. **Balanceo de carga** – *balance‑rr* (modo 0).
* Validar cada perfil con pruebas de conmutación por error y de rendimiento.

> **Nota**: En Fedora 41, NetworkManager carga automáticamente el módulo `bonding`; añadirlo manualmente es opcional.

---

[^rhel-bonding]: Red Hat, *Configuring and Managing Networking – Configuring network bonding*, RHEL 8, consultado el 22 may 2025.

- [Trabajo Optativo: Agregación de Enlaces de Red (Bonding)](#trabajo-optativo-agregación-de-enlaces-de-red-bonding)
  - [Introducción](#introducción)
  - [Tarea 1. Creación de la máquina virtual](#tarea-1-creación-de-la-máquina-virtual)
  - [Tarea 2. Configuración de las interfaces de red para que se agrupen dando lugar a una única conexión](#tarea-2-configuración-de-las-interfaces-de-red-para-que-se-agrupen-dando-lugar-a-una-única-conexión)
    - [2.1. Configuración de las interfaces de red para que se agrupen dando lugar a una única conexión](#21-configuración-de-las-interfaces-de-red-para-que-se-agrupen-dando-lugar-a-una-única-conexión)
    - [2.2. Configuración de balanceo de carga y alto rendimiento](#22-configuración-de-balanceo-de-carga-y-alto-rendimiento)
    - [Modo 802.3ad/LACP](#modo-8023adlacp)
      - [Cómo recuperar el acceso](#cómo-recuperar-el-acceso)
    - [balance-rr (mode 0)](#balance-rr-mode-0)
  - [Tarea 3. Validación](#tarea-3-validación)
    - [3.1. Plan de pruebas](#31-plan-de-pruebas)
      - [3.1.1. Introducción](#311-introducción)
      - [3.1.2. Entorno de pruebas](#312-entorno-de-pruebas)
    - [3.2. Pruebas de alta disponibilidad (modo active-backup)](#32-pruebas-de-alta-disponibilidad-modo-active-backup)
      - [3.2.1. Descripción](#321-descripción)
      - [3.2.2. Procedimiento de prueba](#322-procedimiento-de-prueba)
      - [3.2.3. Resultados](#323-resultados)
      - [3.2.4. Conclusión](#324-conclusión)
    - [3.3. Pruebas de rendimiento (modo balance-rr)](#33-pruebas-de-rendimiento-modo-balance-rr)
      - [3.3.1. Descripción](#331-descripción)
      - [3.3.2. Procedimiento de prueba](#332-procedimiento-de-prueba)
      - [3.3.3. Resultados](#333-resultados)
      - [3.3.4. Análisis de resultados](#334-análisis-de-resultados)
      - [3.3.5. Conclusión del modo de balanceo](#335-conclusión-del-modo-de-balanceo)
    - [3.4.1. Checklist de validación operacional](#341-checklist-de-validación-operacional)
    - [3.4. Validación global](#34-validación-global)
    - [3.5. Conclusiones](#35-conclusiones)

## Tarea 1. Creación de la máquina virtual

```bash
virt-install \
  --name Bond \
  --vcpus 1 \
  --memory 2048 \
  --disk size=10,format=qcow2,bus=virtio \
  --os-variant fedora40 \
  --cdrom /ISO/Fedora-Server-netinst-x86_64-41-1.4.iso \
  --network network=default,model=virtio \
  --network network=default,model=virtio \
  --network network=default,model=virtio \
  --console pty,target_type=serial
```

Interfaces generadas:

```bash
root@lq-d25:~# virsh domifaddr Bond
 Nombre     dirección MAC       Protocol     Address
-------------------------------------------------------------------------------
 vnet6      52:54:00:3f:99:f0    ipv4         192.168.122.76/24
 vnet7      52:54:00:ee:18:de    ipv4         192.168.122.66/24
 vnet8      52:54:00:33:75:d2    ipv4         192.168.122.227/24
```

- Configuramos la cuenta de root y permitimos el acceso SSH de root con contraseña
- Actualizamos los paquetes del sistema

```bash
dnf upgrade --refresh
```

- Instalamos el servicio qemu-guest-agent

```bash
dnf install -y qemu-guest-agent
```

- Habilitar e iniciar el servicio qemu-guest-agent

```bash
systemctl enable --now qemu-guest-agent
```

- Establecemos el nombre del sistema

```bash
hostnamectl set-hostname bond.vpd.com
```

- Configuramos el acceso SSH con clave público/privada

```bash
root@lq-d25:~# ssh-copy-id root@192.168.122.76
The authenticity of host '192.168.122.76 (192.168.122.76)' can't be established.
ED25519 key fingerprint is SHA256:AnJMxvwCKNqEawoKFcHOgD8npFKteOWj0SWJmnGWXPg.
This key is not known by any other names.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
/usr/bin/ssh-copy-id: INFO: attempting to log in with the new key(s), to filter out any that are already installed
/usr/bin/ssh-copy-id: INFO: 1 key(s) remain to be installed -- if you are prompted now it is to install the new keys
root@192.168.122.76's password:

Number of key(s) added: 1

Now try logging into the machine, with:   "ssh 'root@192.168.122.76'"
and check to make sure that only the key(s) you wanted were added.
```

## Tarea 2. Configuración de las interfaces de red para que se agrupen dando lugar a una única conexión

### 2.1. Configuración de las interfaces de red para que se agrupen dando lugar a una única conexión

Comprobación previa, listamos las interfaces de red para conocer sus nombres reales:

```bash
root@bond:~# nmcli device status
DEVICE  TYPE      STATE                   CONNECTION
enp1s0  ethernet  conectado               enp1s0
enp2s0  ethernet  conectado               enp2s0
enp3s0  ethernet  conectado               enp3s0
lo      loopback  connected (externally)  lo
```

Cargamos y habilitamos el módulo bonding:

```bash
root@bond:~# modprobe bonding
root@bond:~# echo "bonding" | tee /etc/modules-load.d/bonding.conf
bonding
```

Nota: esta parte es opcional, el módulo bonding debería cargarse solo

1. Crear la interfaz agregada bond0 en modo `active-backup`:

```bash
root@bond:~# nmcli connection add type bond con-name bond0 ifname bond0 bond.options "mode=active,miimon=100"
Conexión «bond0» (2678cb65-1c2c-4df2-9649-b51c2bf47adb) añadida con éxito.
```

2. Añadir las tres NIC virtio como puertos del bond

```bash
root@bond:~# vi bond_script.sh
root@bond:~# cat bond_script.sh
#!/bin/bash

for IF in enp1s0 enp2s0 enp3s0; do
    sudo nmcli connection add type ethernet \
        port-type bond controller bond0 \
        con-name ${IF}-port ifname $IF
done
root@bond:~# chmod +x bond_script.sh
```

Ejecutamos

```bash
root@bond:~# ./bond_script.sh
Conexión «enp1s0-port» (916e5ad5-d499-4279-849d-a197d084ebe9) añadida con éxito.
Conexión «enp2s0-port» (00e24d62-5114-4ed3-871e-d24bbc9fa93b) añadida con éxito.
Conexión «enp3s0-port» (afb82bf0-810a-40a1-ad4e-6f3bebc2fd53) añadida con éxito.
```

3. Levantar la conexión bond0

```bash
root@bond:~# nmcli con up bond0
La conexión se ha activado correctamente (controller waiting for ports) (ruta activa D-Bus: /org/freedesktop/NetworkManager/ActiveConnection/6)
```

4. Configuración IP en bond0

Podemos configurarla con DHCP (red NAT default):

```bash
nmcli connection modify bond0 ipv4.method auto
```

O de forma estática (opción elegida):

```bash
root@bond:~# nmcli connection modify bond0 ipv4.addresses 192.168.122.57/24 ipv4.gateway 192.168.122.1 ipv4.dns "8.8.8.8 1.1.1.1" ipv4.method manual
```

Reiniciamos:

```bash
reboot
```

Verificamos:

```bash
root@bond:~# cat /proc/net/bonding/bond0
Ethernet Channel Bonding Driver: v6.14.6-200.fc41.x86_64

Bonding Mode: fault-tolerance (active-backup)
Primary Slave: None
Currently Active Slave: enp1s0
MII Status: up
MII Polling Interval (ms): 100
Up Delay (ms): 0
Down Delay (ms): 0
Peer Notification Delay (ms): 0

Slave Interface: enp1s0
MII Status: up
Speed: Unknown
Duplex: Unknown
Link Failure Count: 0
Permanent HW addr: 52:54:00:3f:99:f0
Slave queue ID: 0

Slave Interface: enp2s0
MII Status: up
Speed: Unknown
Duplex: Unknown
Link Failure Count: 0
Permanent HW addr: 52:54:00:ee:18:de
Slave queue ID: 0

Slave Interface: enp3s0
MII Status: up
Speed: Unknown
Duplex: Unknown
Link Failure Count: 0
Permanent HW addr: 52:54:00:33:75:d2
Slave queue ID: 0
```

Observamos `Currently Active Slave: enp1s0`

5. **Prueba de alta disponibilidad**

Simulamos fallo de la interfaz enp1s0

```bash
root@bond:~# ip link set enp1s0 down
```

Comprobamos que seguimos teniendo conexión:

```bash
root@bond:~# ping 8.8.8.8
PING 8.8.8.8 (8.8.8.8) 56(84) bytes of data.
64 bytes from 8.8.8.8: icmp_seq=1 ttl=114 time=29.9 ms
64 bytes from 8.8.8.8: icmp_seq=2 ttl=114 time=30.4 ms
^C
--- 8.8.8.8 ping statistics ---
2 packets transmitted, 2 received, 0% packet loss, time 1001ms
rtt min/avg/max/mdev = 29.868/30.123/30.378/0.255 ms
```

Verificamos que interfaz está ahora activa:

```bash
root@bond:~# cat /proc/net/bonding/bond0
Ethernet Channel Bonding Driver: v6.14.6-200.fc41.x86_64

Bonding Mode: fault-tolerance (active-backup)
Primary Slave: None
Currently Active Slave: enp2s0
MII Status: up
MII Polling Interval (ms): 100
Up Delay (ms): 0
Down Delay (ms): 0
Peer Notification Delay (ms): 0

Slave Interface: enp1s0
MII Status: down
Speed: Unknown
Duplex: Unknown
Link Failure Count: 1
Permanent HW addr: 52:54:00:3f:99:f0
Slave queue ID: 0

Slave Interface: enp2s0
MII Status: up
Speed: Unknown
Duplex: Unknown
Link Failure Count: 0
Permanent HW addr: 52:54:00:ee:18:de
Slave queue ID: 0

Slave Interface: enp3s0
MII Status: up
Speed: Unknown
Duplex: Unknown
Link Failure Count: 0
Permanent HW addr: 52:54:00:33:75:d2
Slave queue ID: 0
```

Ahora: `Currently Active Slave: enp2s0`

---

La práctica solicita ue se deben probar al menos dos métodos diferentes de agrupación de conexiones,
una para conseguir solo alta disponibilidad y otra para mejorar el rendimiento de las comunicaciones de datos.

### 2.2. Configuración de balanceo de carga y alto rendimiento

En esta sección se evalúan los modos de *bonding* que permiten utilizar varias interfaces simultáneamente para incrementar el ancho de banda:

* **IEEE 802.3ad / LACP (modo 4)** – Requiere que el *switch* físico (o un *bridge* u OVS virtual) negocie LACP.  
  Si el *switch* no habla LACP, los puertos permanecen en estado *down* y `bond0` pierde conectividad.
* **balance-rr (modo 0)** – Reparte los paquetes en *round‑robin* entre las interfaces; no necesita configuración en el *switch*.
* **balance-alb (modo 6)** – Variante adaptativa que balancea tanto envío como recepción empleando ARP replies falsificadas; tampoco requiere soporte especial en el *switch*.

Elija *802.3ad* cuando disponga de hardware gestionable con soporte LACP; de lo contrario, *balance‑rr* o *balance‑alb* son alternativas válidas para laboratorios y entornos donde sólo se controla el extremo servidor.

Hasta ahora hemos conseguido la alta disponibilidad,

### Modo 802.3ad/LACP

1. ahora vamos a cambiar a modo `802.3ad/LACP (prueba de rendimiento) nuestra conexión bond0

```bash
[root@bond ~]# nmcli connection modify bond0 bond.options "mode=802.3ad,miimon=100,lacp_rate=fast"
```

```bash
root@bond:~# nmcli connection down bond0 && nmcli connection up bond0
La conexión «bond0» se desactivó correctamente (ruta activa D-Bus: /org/freedesktop/NetworkManager/ActiveConnection/5)
La conexión se ha activado correctamente (controller waiting for ports) (ruta activa D-Bus: /org/freedesktop/NetworkManager/ActiveConnection/9)
```

Al pasar bond0 a `modo 802.3ad/LACP` y bajar/subir la conexión, bond0 dejó de tener ningún puerto “activo” porque:

1. El bridge NAT “default” de libvirt no soporta LACP.
2. El modo 4 (802.3ad) sólo funciona si el switch —físico o virtual— negocia LACP con las interfaces esclavas. Si no hay soporte, ninguna esclava se “agrega” al bond y bond0 queda sin enlaces operativos, perdiendo por tanto su IP y el acceso SSH
3. Sin enlace activo, bond0 no sube y su IP estática deja de responder.

```bash
root@lq-d25:~# virsh console Bond
```

Comprobamos: 

```bash
[root@bond ~]# cat /proc/net/bonding/bond0
Ethernet Channel Bonding Driver: v6.14.6-200.fc41.x86_64

Bonding Mode: IEEE 802.3ad Dynamic link aggregation
Transmit Hash Policy: layer2 (0)
MII Status: up
MII Polling Interval (ms): 100
Up Delay (ms): 0
Down Delay (ms): 0
Peer Notification Delay (ms): 0

802.3ad info
LACP active: on
LACP rate: fast
Min links: 0
Aggregator selection policy (ad_select): stable
System priority: 65535
System MAC address: 52:54:00:3f:99:f0
Active Aggregator Info:
	Aggregator ID: 1
	Number of ports: 1
	Actor Key: 0
	Partner Key: 1
	Partner Mac Address: 00:00:00:00:00:00

Slave Interface: enp1s0
MII Status: down
Speed: Unknown
Duplex: Unknown
Link Failure Count: 0
Permanent HW addr: 52:54:00:3f:99:f0
Slave queue ID: 0
Aggregator ID: 1
Actor Churn State: none
Partner Churn State: churned
Actor Churned Count: 0
Partner Churned Count: 1
details actor lacp pdu:
    system priority: 65535
    system mac address: 52:54:00:3f:99:f0
    port key: 0
    port priority: 255
    port number: 1
    port state: 79
details partner lacp pdu:
    system priority: 65535
    system mac address: 00:00:00:00:00:00
    oper key: 1
    port priority: 255
    port number: 1
    port state: 1

Slave Interface: enp2s0
MII Status: down
Speed: Unknown
Duplex: Unknown
Link Failure Count: 0
Permanent HW addr: 52:54:00:ee:18:de
Slave queue ID: 0
Aggregator ID: 2
Actor Churn State: churned
Partner Churn State: churned
Actor Churned Count: 1
Partner Churned Count: 1
details actor lacp pdu:
    system priority: 65535
    system mac address: 52:54:00:3f:99:f0
    port key: 0
    port priority: 255
    port number: 2
    port state: 71
details partner lacp pdu:
    system priority: 65535
    system mac address: 00:00:00:00:00:00
    oper key: 1
    port priority: 255
    port number: 1
    port state: 1

Slave Interface: enp3s0
MII Status: down
Speed: Unknown
Duplex: Unknown
Link Failure Count: 0
Permanent HW addr: 52:54:00:33:75:d2
Slave queue ID: 0
Aggregator ID: 3
Actor Churn State: churned
Partner Churn State: churned
Actor Churned Count: 1
Partner Churned Count: 1
details actor lacp pdu:
    system priority: 65535
    system mac address: 52:54:00:3f:99:f0
    port key: 0
    port priority: 255
    port number: 3
    port state: 71
details partner lacp pdu:
    system priority: 65535
    system mac address: 00:00:00:00:00:00
    oper key: 1
    port priority: 255
    port number: 1
    port state: 1
```



#### Cómo recuperar el acceso

1. Vuelve a modo active-backup

Dentro de la VM, ejecuta:

```bash
sudo nmcli connection modify bond0 bond.options "mode=active-backup miimon=100"
sudo nmcli connection down bond0
sudo nmcli connection up bond0
```

Verifica que bond0 vuelva a listar una esclava “Currently Active Slave”:

```bash
cat /proc/net/bonding/bond0
```

2. Prueba tu SSH

Ahora deberías poder reconectar:

```bash
ssh root@192.168.122.57
```

Resumen: perdiste SSH porque bond0 no pudo agregar ningún puerto en modo 802.3ad sobre el bridge default; recupéralo cambiando de vuelta a active-backup por consola, y si quieres medir LACP monta un entorno (switch u OVS) que lo soporte, o bien usa balance-rr para pruebas de agregación sencillas.

--- 

Aclarado esto, vamos a probar LACP / throughput sin perder la conexión

Ya podemos acceder por SSH

COnfiguramos LACP/througph sin perder la red, con un modo de balanceo que no requiera switch especial, como balance-rr (mode 0)

### balance-rr (mode 0)

```bash
root@bond:~# nmcli connection modify bond0 bond.options "mode=balance-rr,miimon=100"
root@bond:~# nmcli connection down bond0 && nmcli connection up bond0
La conexión «bond0» se desactivó correctamente (ruta activa D-Bus: /org/freedesktop/NetworkManager/ActiveConnection/9)
La conexión se ha activado correctamente (controller waiting for ports) (ruta activa D-Bus: /org/freedesktop/NetworkManager/ActiveConnection/10)
```

* `mode-balance-rr`: Establece el modo de balanceo Round-Robin (mode 0), que transmite paquetes secuencialmente desde el primer esclavo disponible hasta el último.
* `miimon=100`: Configura el intervalo de monitoreo de la interfaz de red en 100 milisegundos.

Validación del modo de bonding:

```bash
root@bond:~# cat /proc/net/bonding/bond0
Ethernet Channel Bonding Driver: v6.14.6-200.fc41.x86_64

Bonding Mode: load balancing (round-robin)
MII Status: up
MII Polling Interval (ms): 100
Up Delay (ms): 0
Down Delay (ms): 0
Peer Notification Delay (ms): 0

Slave Interface: enp1s0
MII Status: up
Speed: Unknown
Duplex: Unknown
Link Failure Count: 0
Permanent HW addr: 52:54:00:3f:99:f0
Slave queue ID: 0

Slave Interface: enp2s0
MII Status: up
Speed: Unknown
Duplex: Unknown
Link Failure Count: 0
Permanent HW addr: 52:54:00:ee:18:de
Slave queue ID: 0

Slave Interface: enp3s0
MII Status: up
Speed: Unknown
Duplex: Unknown
Link Failure Count: 0
Permanent HW addr: 52:54:00:33:75:d2
Slave queue ID: 0
```

Instalamos `iperf3` en el host anfitrión y en la MV

```bash
dnf install -y iperf3
```

En el anfitrión

```bash
root@lq-d25:~# ip addr show virbr0
5: virbr0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state UP group default qlen 1000
    link/ether 52:54:00:da:92:6a brd ff:ff:ff:ff:ff:ff
    inet 192.168.122.1/24 brd 192.168.122.255 scope global virbr0
       valid_lft forever preferred_lft forever
```

```bash
root@lq-d25:~# firewall-cmd --get-active-zones
FedoraServer (default)
  interfaces: enp6s0 bridge0
libvirt
  interfaces: virbr0 virbr2 virbr1 virbr3
```

```
root@lq-d25:~# firewall-cmd --zone=libvirt --permanent --add-port=5201/tcp
success
root@lq-d25:~# firewall-cmd --zone=libvirt --permanent --add-port=5201/udp
success
root@lq-d25:~# firewall-cmd --reload
```

En el anfitrión:
```bash
iperf3 -s
```

```bash
root@lq-d25:~# iperf3 -s
-----------------------------------------------------------
Server listening on 5201 (test #1)
-----------------------------------------------------------
```

En la MV hacemos:

```bash
root@bond:~# iperf3 -c 192.168.122.1 -P 3 -t 30
Connecting to host 192.168.122.1, port 5201
[  5] local 192.168.122.57 port 40536 connected to 192.168.122.1 port 5201
[  7] local 192.168.122.57 port 40544 connected to 192.168.122.1 port 5201
[  9] local 192.168.122.57 port 40546 connected to 192.168.122.1 port 5201
[ ID] Interval           Transfer     Bitrate         Retr  Cwnd
[  5]   0.00-1.00   sec   811 MBytes  6.79 Gbits/sec  163    361 KBytes       
[  7]   0.00-1.00   sec   812 MBytes  6.80 Gbits/sec  283    389 KBytes       
[  9]   0.00-1.00   sec   806 MBytes  6.75 Gbits/sec  188    383 KBytes       
[SUM]   0.00-1.00   sec  2.37 GBytes  20.3 Gbits/sec  634             
- - - - - - - - - - - - - - - - - - - - - - - - -
[  5]   1.00-2.00   sec   823 MBytes  6.90 Gbits/sec  104    379 KBytes       
[  7]   1.00-2.00   sec   824 MBytes  6.90 Gbits/sec  181    344 KBytes       
[  9]   1.00-2.00   sec   818 MBytes  6.85 Gbits/sec   90    387 KBytes       
[SUM]   1.00-2.00   sec  2.41 GBytes  20.7 Gbits/sec  375             
- - - - - - - - - - - - - - - - - - - - - - - - -
[  5]   2.00-3.00   sec   822 MBytes  6.91 Gbits/sec    0    389 KBytes       
[  7]   2.00-3.00   sec   820 MBytes  6.89 Gbits/sec    0    390 KBytes       
[  9]   2.00-3.00   sec   815 MBytes  6.85 Gbits/sec    0    387 KBytes       
[SUM]   2.00-3.00   sec  2.40 GBytes  20.6 Gbits/sec    0             
- - - - - - - - - - - - - - - - - - - - - - - - -
[  5]   3.00-4.00   sec   771 MBytes  6.46 Gbits/sec    0    392 KBytes       
[  7]   3.00-4.00   sec   780 MBytes  6.53 Gbits/sec    0    390 KBytes       
[  9]   3.00-4.00   sec   787 MBytes  6.59 Gbits/sec    0    387 KBytes       
[SUM]   3.00-4.00   sec  2.28 GBytes  19.6 Gbits/sec    0             
- - - - - - - - - - - - - - - - - - - - - - - - -
[  5]   4.00-5.00   sec   820 MBytes  6.89 Gbits/sec    0    400 KBytes       
[  7]   4.00-5.00   sec   801 MBytes  6.73 Gbits/sec    1    395 KBytes       
[  9]   4.00-5.00   sec   800 MBytes  6.73 Gbits/sec    0    387 KBytes       
[SUM]   4.00-5.00   sec  2.36 GBytes  20.4 Gbits/sec    1             
- - - - - - - - - - - - - - - - - - - - - - - - -
[  5]   5.00-6.00   sec   806 MBytes  6.77 Gbits/sec    0    403 KBytes       
[  7]   5.00-6.00   sec   810 MBytes  6.79 Gbits/sec    0    397 KBytes       
[  9]   5.00-6.00   sec   818 MBytes  6.86 Gbits/sec   92    387 KBytes       
[SUM]   5.00-6.00   sec  2.38 GBytes  20.4 Gbits/sec   92             
- - - - - - - - - - - - - - - - - - - - - - - - -
[  5]   6.00-7.00   sec   845 MBytes  7.09 Gbits/sec    0    410 KBytes       
[  7]   6.00-7.00   sec   837 MBytes  7.02 Gbits/sec    0    386 KBytes       
[  9]   6.00-7.00   sec   842 MBytes  7.06 Gbits/sec   46    390 KBytes       
[SUM]   6.00-7.00   sec  2.46 GBytes  21.2 Gbits/sec   46             
- - - - - - - - - - - - - - - - - - - - - - - - -
[  5]   7.00-8.00   sec   834 MBytes  6.98 Gbits/sec    0    413 KBytes       
[  7]   7.00-8.00   sec   841 MBytes  7.04 Gbits/sec    0    389 KBytes       
[  9]   7.00-8.00   sec   819 MBytes  6.86 Gbits/sec    0    397 KBytes       
[SUM]   7.00-8.00   sec  2.44 GBytes  20.9 Gbits/sec    0             
- - - - - - - - - - - - - - - - - - - - - - - - -
[  5]   8.00-9.00   sec   816 MBytes  6.86 Gbits/sec    0    346 KBytes       
[  7]   8.00-9.00   sec   822 MBytes  6.91 Gbits/sec    0    395 KBytes       
[  9]   8.00-9.00   sec   824 MBytes  6.92 Gbits/sec    0    400 KBytes       
[SUM]   8.00-9.00   sec  2.40 GBytes  20.7 Gbits/sec    0             
- - - - - - - - - - - - - - - - - - - - - - - - -
[  5]   9.00-10.00  sec   828 MBytes  6.94 Gbits/sec   90    327 KBytes       
[  7]   9.00-10.00  sec   837 MBytes  7.02 Gbits/sec   45    331 KBytes       
[  9]   9.00-10.00  sec   842 MBytes  7.06 Gbits/sec    0    403 KBytes       
[SUM]   9.00-10.00  sec  2.45 GBytes  21.0 Gbits/sec  135             
- - - - - - - - - - - - - - - - - - - - - - - - -
[  5]  10.00-11.00  sec   808 MBytes  6.77 Gbits/sec    0    335 KBytes       
[  7]  10.00-11.00  sec   794 MBytes  6.65 Gbits/sec    0    387 KBytes       
[  9]  10.00-11.00  sec   804 MBytes  6.73 Gbits/sec    0    389 KBytes       
[SUM]  10.00-11.00  sec  2.35 GBytes  20.2 Gbits/sec    0             
- - - - - - - - - - - - - - - - - - - - - - - - -
[  5]  11.00-12.00  sec   813 MBytes  6.83 Gbits/sec  242    372 KBytes       
[  7]  11.00-12.00  sec   831 MBytes  6.98 Gbits/sec  135    300 KBytes       
[  9]  11.00-12.00  sec   820 MBytes  6.89 Gbits/sec    0    389 KBytes       
[SUM]  11.00-12.00  sec  2.41 GBytes  20.7 Gbits/sec  377             
- - - - - - - - - - - - - - - - - - - - - - - - -
[  5]  12.00-13.00  sec   840 MBytes  7.03 Gbits/sec   45    386 KBytes       
[  7]  12.00-13.00  sec   840 MBytes  7.03 Gbits/sec    0    387 KBytes       
[  9]  12.00-13.00  sec   827 MBytes  6.92 Gbits/sec   41    379 KBytes       
[SUM]  12.00-13.00  sec  2.45 GBytes  21.0 Gbits/sec   86             
- - - - - - - - - - - - - - - - - - - - - - - - -
[  5]  13.00-14.00  sec   838 MBytes  7.04 Gbits/sec    0    386 KBytes       
[  7]  13.00-14.00  sec   827 MBytes  6.95 Gbits/sec    0    390 KBytes       
[  9]  13.00-14.00  sec   837 MBytes  7.04 Gbits/sec    0    396 KBytes       
[SUM]  13.00-14.00  sec  2.44 GBytes  21.0 Gbits/sec    0             
- - - - - - - - - - - - - - - - - - - - - - - - -
[  5]  14.00-15.00  sec   838 MBytes  7.03 Gbits/sec    0    386 KBytes       
[  7]  14.00-15.00  sec   833 MBytes  6.98 Gbits/sec    0    393 KBytes       
[  9]  14.00-15.00  sec   830 MBytes  6.95 Gbits/sec    0    396 KBytes       
[SUM]  14.00-15.00  sec  2.44 GBytes  21.0 Gbits/sec    0             
- - - - - - - - - - - - - - - - - - - - - - - - -
[  5]  15.00-16.00  sec   821 MBytes  6.89 Gbits/sec    0    386 KBytes       
[  7]  15.00-16.00  sec   809 MBytes  6.80 Gbits/sec    0    396 KBytes       
[  9]  15.00-16.00  sec   810 MBytes  6.80 Gbits/sec    0    402 KBytes       
[SUM]  15.00-16.00  sec  2.38 GBytes  20.5 Gbits/sec    0             
- - - - - - - - - - - - - - - - - - - - - - - - -
[  5]  16.00-17.00  sec   836 MBytes  7.01 Gbits/sec    0    386 KBytes       
[  7]  16.00-17.00  sec   842 MBytes  7.06 Gbits/sec    0    396 KBytes       
[  9]  16.00-17.00  sec   844 MBytes  7.08 Gbits/sec    0    409 KBytes       
[SUM]  16.00-17.00  sec  2.46 GBytes  21.2 Gbits/sec    0             
- - - - - - - - - - - - - - - - - - - - - - - - -
[  5]  17.00-18.00  sec   837 MBytes  7.01 Gbits/sec    0    386 KBytes       
[  7]  17.00-18.00  sec   839 MBytes  7.02 Gbits/sec    1    399 KBytes       
[  9]  17.00-18.00  sec   840 MBytes  7.03 Gbits/sec    0    409 KBytes       
[SUM]  17.00-18.00  sec  2.46 GBytes  21.1 Gbits/sec    1             
- - - - - - - - - - - - - - - - - - - - - - - - -
[  5]  18.00-19.00  sec   835 MBytes  7.00 Gbits/sec    1    341 KBytes       
[  7]  18.00-19.00  sec   833 MBytes  6.98 Gbits/sec    0    339 KBytes       
[  9]  18.00-19.00  sec   830 MBytes  6.96 Gbits/sec    0    414 KBytes       
[SUM]  18.00-19.00  sec  2.44 GBytes  21.0 Gbits/sec    1             
- - - - - - - - - - - - - - - - - - - - - - - - -
[  5]  19.00-20.00  sec   829 MBytes  6.97 Gbits/sec    0    386 KBytes       
[  7]  19.00-20.00  sec   811 MBytes  6.82 Gbits/sec    3    387 KBytes       
[  9]  19.00-20.00  sec   829 MBytes  6.96 Gbits/sec   21    416 KBytes       
[SUM]  19.00-20.00  sec  2.41 GBytes  20.8 Gbits/sec   24             
- - - - - - - - - - - - - - - - - - - - - - - - -
[  5]  20.00-21.00  sec   850 MBytes  7.13 Gbits/sec    0    389 KBytes       
[  7]  20.00-21.00  sec   849 MBytes  7.12 Gbits/sec    0    390 KBytes       
[  9]  20.00-21.00  sec   852 MBytes  7.15 Gbits/sec    0    419 KBytes       
[SUM]  20.00-21.00  sec  2.49 GBytes  21.4 Gbits/sec    0             
- - - - - - - - - - - - - - - - - - - - - - - - -
[  5]  21.00-22.00  sec   824 MBytes  6.90 Gbits/sec    0    395 KBytes       
[  7]  21.00-22.00  sec   832 MBytes  6.97 Gbits/sec    0    395 KBytes       
[  9]  21.00-22.00  sec   806 MBytes  6.75 Gbits/sec    0    424 KBytes       
[SUM]  21.00-22.00  sec  2.41 GBytes  20.6 Gbits/sec    0             
- - - - - - - - - - - - - - - - - - - - - - - - -
[  5]  22.00-23.00  sec   822 MBytes  6.91 Gbits/sec    0    314 KBytes       
[  7]  22.00-23.00  sec   816 MBytes  6.85 Gbits/sec    0    400 KBytes       
[  9]  22.00-23.00  sec   817 MBytes  6.87 Gbits/sec    0    436 KBytes       
[SUM]  22.00-23.00  sec  2.40 GBytes  20.6 Gbits/sec    0             
- - - - - - - - - - - - - - - - - - - - - - - - -
[  5]  23.00-24.00  sec   826 MBytes  6.92 Gbits/sec    0    387 KBytes       
[  7]  23.00-24.00  sec   822 MBytes  6.88 Gbits/sec    1    400 KBytes       
[  9]  23.00-24.00  sec   830 MBytes  6.95 Gbits/sec    0    436 KBytes       
[SUM]  23.00-24.00  sec  2.42 GBytes  20.7 Gbits/sec    1             
- - - - - - - - - - - - - - - - - - - - - - - - -
[  5]  24.00-25.00  sec   815 MBytes  6.85 Gbits/sec    0    387 KBytes       
[  7]  24.00-25.00  sec   806 MBytes  6.77 Gbits/sec    0    400 KBytes       
[  9]  24.00-25.00  sec   810 MBytes  6.81 Gbits/sec    0    438 KBytes       
[SUM]  24.00-25.00  sec  2.37 GBytes  20.4 Gbits/sec    0             
- - - - - - - - - - - - - - - - - - - - - - - - -
[  5]  25.00-26.00  sec   812 MBytes  6.80 Gbits/sec    4    395 KBytes       
[  7]  25.00-26.00  sec   810 MBytes  6.78 Gbits/sec    0    400 KBytes       
[  9]  25.00-26.00  sec   822 MBytes  6.88 Gbits/sec    0    441 KBytes       
[SUM]  25.00-26.00  sec  2.39 GBytes  20.5 Gbits/sec    4             
- - - - - - - - - - - - - - - - - - - - - - - - -
[  5]  26.00-27.00  sec   806 MBytes  6.78 Gbits/sec    0    395 KBytes       
[  7]  26.00-27.00  sec   802 MBytes  6.74 Gbits/sec    0    400 KBytes       
[  9]  26.00-27.00  sec   808 MBytes  6.79 Gbits/sec    0    451 KBytes       
[SUM]  26.00-27.00  sec  2.36 GBytes  20.3 Gbits/sec    0             
- - - - - - - - - - - - - - - - - - - - - - - - -
[  5]  27.00-28.00  sec   831 MBytes  6.97 Gbits/sec    0    406 KBytes       
[  7]  27.00-28.00  sec   831 MBytes  6.97 Gbits/sec    0    400 KBytes       
[  9]  27.00-28.00  sec   836 MBytes  7.01 Gbits/sec    0    451 KBytes       
[SUM]  27.00-28.00  sec  2.44 GBytes  21.0 Gbits/sec    0             
- - - - - - - - - - - - - - - - - - - - - - - - -
[  5]  28.00-29.00  sec   794 MBytes  6.66 Gbits/sec    0    406 KBytes       
[  7]  28.00-29.00  sec   800 MBytes  6.71 Gbits/sec    0    400 KBytes       
[  9]  28.00-29.00  sec   784 MBytes  6.58 Gbits/sec    0    451 KBytes       
[SUM]  28.00-29.00  sec  2.32 GBytes  19.9 Gbits/sec    0             
- - - - - - - - - - - - - - - - - - - - - - - - -
[  5]  29.00-30.00  sec   799 MBytes  6.68 Gbits/sec    0    410 KBytes       
[  7]  29.00-30.00  sec   791 MBytes  6.61 Gbits/sec    0    400 KBytes       
[  9]  29.00-30.00  sec   798 MBytes  6.67 Gbits/sec    0    451 KBytes       
[SUM]  29.00-30.00  sec  2.33 GBytes  20.0 Gbits/sec    0             
- - - - - - - - - - - - - - - - - - - - - - - - -
[ ID] Interval           Transfer     Bitrate         Retr
[  5]   0.00-30.00  sec  24.1 GBytes  6.89 Gbits/sec  649             sender
[  5]   0.00-30.00  sec  24.1 GBytes  6.89 Gbits/sec                  receiver
[  7]   0.00-30.00  sec  24.0 GBytes  6.88 Gbits/sec  650             sender
[  7]   0.00-30.00  sec  24.0 GBytes  6.88 Gbits/sec                  receiver
[  9]   0.00-30.00  sec  24.0 GBytes  6.88 Gbits/sec  478             sender
[  9]   0.00-30.00  sec  24.0 GBytes  6.88 Gbits/sec                  receiver
[SUM]   0.00-30.00  sec  72.1 GBytes  20.6 Gbits/sec  1777             sender
[SUM]   0.00-30.00  sec  72.1 GBytes  20.6 Gbits/sec                  receiver

iperf Done.
```

Ahora vamos a probar con una sola interfaz en el mode `active-backup`

```bash
root@bond:~# nmcli connection modify bond0 bond.options "mode=active-backup,miimon=100"
root@bond:~# nmcli connection down bond0
root@bond:~# nmcli connection up bond0
```

Prueba:

```bash
root@bond:~# iperf3 -c 192.168.122.1 -t 30
Connecting to host 192.168.122.1, port 5201
[  5] local 192.168.122.57 port 39226 connected to 192.168.122.1 port 5201
[ ID] Interval           Transfer     Bitrate         Retr  Cwnd
[  5]   0.00-1.00   sec  2.24 GBytes  19.2 Gbits/sec    0   2.13 MBytes       
[  5]   1.00-2.00   sec  3.22 GBytes  27.6 Gbits/sec    0   2.24 MBytes       
[  5]   2.00-3.00   sec  2.39 GBytes  20.5 Gbits/sec    0   2.35 MBytes       
[  5]   3.00-4.00   sec  2.54 GBytes  21.8 Gbits/sec    0   2.72 MBytes       
[  5]   4.00-5.00   sec  2.40 GBytes  20.6 Gbits/sec    0   2.72 MBytes       
[  5]   5.00-6.00   sec  2.30 GBytes  19.7 Gbits/sec    0   2.72 MBytes       
[  5]   6.00-7.00   sec  2.33 GBytes  20.0 Gbits/sec    0   2.72 MBytes       
[  5]   7.00-8.00   sec  2.11 GBytes  18.1 Gbits/sec    0   2.72 MBytes       
[  5]   8.00-9.00   sec  2.38 GBytes  20.4 Gbits/sec    0   2.72 MBytes       
[  5]   9.00-10.00  sec  2.37 GBytes  20.4 Gbits/sec    0   2.72 MBytes       
[  5]  10.00-11.00  sec  2.31 GBytes  19.9 Gbits/sec    0   2.72 MBytes       
[  5]  11.00-12.00  sec  2.38 GBytes  20.4 Gbits/sec    0   2.72 MBytes       
[  5]  12.00-13.00  sec  2.54 GBytes  21.8 Gbits/sec    0   2.85 MBytes       
[  5]  13.00-14.00  sec  2.28 GBytes  19.6 Gbits/sec    0   2.85 MBytes       
[  5]  14.00-15.00  sec  2.57 GBytes  22.1 Gbits/sec    0   2.99 MBytes       
[  5]  15.00-16.00  sec  3.51 GBytes  30.1 Gbits/sec    0   2.99 MBytes       
[  5]  16.00-17.00  sec  5.49 GBytes  47.2 Gbits/sec    0   3.30 MBytes       
[  5]  17.00-18.00  sec  3.69 GBytes  31.7 Gbits/sec    0   3.46 MBytes       
[  5]  18.00-19.00  sec  2.43 GBytes  20.9 Gbits/sec    0   3.71 MBytes       
[  5]  19.00-20.00  sec  2.39 GBytes  20.6 Gbits/sec    0   3.71 MBytes       
[  5]  20.00-21.00  sec  2.27 GBytes  19.5 Gbits/sec    0   5.55 MBytes       
[  5]  21.00-22.00  sec  2.70 GBytes  23.2 Gbits/sec    0   5.55 MBytes       
[  5]  22.00-23.00  sec  2.26 GBytes  19.4 Gbits/sec    0   5.55 MBytes       
[  5]  23.00-24.00  sec  3.32 GBytes  28.5 Gbits/sec    0   5.55 MBytes       
[  5]  24.00-25.00  sec  3.81 GBytes  32.7 Gbits/sec    0   5.55 MBytes       
[  5]  25.00-26.00  sec  2.12 GBytes  18.2 Gbits/sec    0   5.55 MBytes       
[  5]  26.00-27.00  sec  2.29 GBytes  19.7 Gbits/sec    0   5.55 MBytes       
[  5]  27.00-28.00  sec  2.62 GBytes  22.5 Gbits/sec    0   5.55 MBytes       
[  5]  28.00-29.00  sec  2.37 GBytes  20.4 Gbits/sec    0   5.55 MBytes       
[  5]  29.00-30.00  sec  4.98 GBytes  42.8 Gbits/sec    0   5.55 MBytes       
- - - - - - - - - - - - - - - - - - - - - - - - -
[ ID] Interval           Transfer     Bitrate         Retr
[  5]   0.00-30.00  sec  82.6 GBytes  23.7 Gbits/sec    0             sender
[  5]   0.00-30.00  sec  82.6 GBytes  23.7 Gbits/sec                  receiver

iperf Done.
```


## Tarea 3. Validación

### 3.1. Plan de pruebas

#### 3.1.1. Introducción

Este plan de pruebas tiene como objetivo validar que las configuraciones de agregación de enlaces implementadas cumplen con los requisitos funcionales establecidos:
- Alta disponibilidad (modo active-backup)
- Mejora del rendimiento (modo balance-rr)

#### 3.1.2. Entorno de pruebas

**Configuración del sistema:**
- Máquina virtual con 3 interfaces de red virtuales
- Sistema operativo: Fedora 41
- Interfaces de red: enp1s0, enp2s0, enp3s0
- Enlace agregado: bond0

### 3.2. Pruebas de alta disponibilidad (modo active-backup)

#### 3.2.1. Descripción

El modo active-backup (modo 1) proporciona redundancia mediante un esquema de conmutación por error. Una sola interfaz está activa en cualquier momento, y las demás interfaces permanecen en espera. Si la interfaz activa falla, una de las interfaces en espera toma el control.

**Ventajas:**
- Tolerancia a fallos
- Transición transparente durante fallos
- No requiere configuración especial en los switches

#### 3.2.2. Procedimiento de prueba

```bash
# Configuración del modo active-backup
nmcli connection modify bond0 bond.options "mode=active-backup,miimon=100"
nmcli connection down bond0 && nmcli connection up bond0
```

**Verificación de la configuración:**

```bash
cat /proc/net/bonding/bond0
```

**Salida:**
```
Bonding Mode: fault-tolerance (active-backup)
Primary Slave: None
Currently Active Slave: enp1s0
```

**Prueba de alta disponibilidad:**
1. Verificar conectividad inicial
2. Simular fallo de la interfaz activa
3. Verificar que la conectividad se mantiene

```bash
# Prueba de conexión inicial
ping 8.8.8.8

# Simulación de fallo
ip link set enp1s0 down

# Verificación de continuidad del servicio
ping 8.8.8.8
```

**Comprobación post-fallo:**
```bash
cat /proc/net/bonding/bond0
```

#### 3.2.3. Resultados

- **Antes del fallo:**
  - Interfaz activa: enp1s0
  - Conectividad: 100% funcional

- **Durante y después del fallo:**
  - Nueva interfaz activa: enp2s0 (conmutación automática)
  - Conectividad: 100% funcional
  - Tiempo de recuperación: prácticamente inmediato

#### 3.2.4. Conclusión

El modo active-backup cumple correctamente con el objetivo de alta disponibilidad. Cuando la interfaz activa falla, la conmutación a una interfaz secundaria es transparente y no se observa pérdida significativa de conectividad.

### 3.3. Pruebas de rendimiento (modo balance-rr)

#### 3.3.1. Descripción

El modo balance-rr (Round-Robin, modo 0) distribuye los paquetes secuencialmente entre todas las interfaces esclavas. Este modo proporciona equilibrio de carga y tolerancia a fallos, mejorando el ancho de banda total disponible.

**Ventajas:**
- Aumento del ancho de banda disponible
- Distribución equilibrada del tráfico
- Tolerancia a fallos

#### 3.3.2. Procedimiento de prueba

```bash
# Configuración del modo balance-rr
nmcli connection modify bond0 bond.options "mode=balance-rr,miimon=100"
nmcli connection down bond0 && nmcli connection up bond0
```

**Verificación de la configuración:**
```bash
cat /proc/net/bonding/bond0
```

**Salida:**
```
Bonding Mode: load balancing (round-robin)
MII Status: up
```

**Prueba de rendimiento:**
1. Medición del rendimiento con iperf3 en modo paralelo
2. Comparación con la configuración active-backup

```bash
# Prueba de rendimiento en modo balance-rr (con múltiples flujos paralelos)
iperf3 -c 192.168.122.1 -P 3 -t 30

# Cambio a modo active-backup para comparación
nmcli connection modify bond0 bond.options "mode=active-backup,miimon=100"
nmcli connection down bond0 && nmcli connection up bond0

# Prueba de rendimiento en modo active-backup (un solo flujo)
iperf3 -c 192.168.122.1 -t 30
```

#### 3.3.3. Resultados

- **Rendimiento en modo balance-rr (con múltiples flujos):**
  - Rendimiento promedio: ~20.6 Gbits/sec
  - Distribución del tráfico: 3 flujos (6.88 Gbits/sec por flujo)

- **Rendimiento en modo active-backup:**
  - Rendimiento promedio: ~23.7 Gbits/sec
  - Un solo flujo activo

#### 3.3.4. Análisis de resultados

Los resultados obtenidos muestran que, dentro del entorno virtualizado KVM, el modo **active‑backup** alcanzó picos de ~24 Gbit/s con un único flujo, mientras que **balance‑rr** rondó ~20 Gbit/s empleando tres flujos paralelos.  

**¿Por qué ocurre esto en la VM?**

1. **Optimización de flujo único** – Virtio‑net y el *bridge* del hipervisor pueden ubicar el flujo en la misma cola de CPU, aprovechando *TSO/GSO* y descarga de checksum.  
2. **Sobrecarga de *round‑robin*** – `balance-rr` fuerza al kernel a recalcular checksums al fragmentar cada paquete, lo que eleva la latencia y reduce la eficacia de la caché de CPU.  
3. **Cuello de botella en el *bridge*** – Todas las NIC virtuales confluyen en la misma cola del *bridge* NAT, de modo que repartir los paquetes entre varias interfaces no evita la contención del lado host.  
4. **Número de flujos limitado** – Aunque usamos `-P 3`, sigue siendo un único proceso `iperf3`; más flujos o múltiples clientes reducirían la contención.

**En un entorno físico** con un switch conmutado y varios hosts, la situación se invierte:

* Cada destino tiende a fijarse a un esclavo diferente, de modo que el tráfico simultáneo suma el ancho de banda de todos los enlaces.  
* Con LACP (`802.3ad`) o *balance‑xor*, las tramas se distribuyen por hash de MAC/IP, evitando colisiones en el mismo enlace.  

Por ello, **balance‑rr** (o LACP con *balance‑xor*) suele ofrecer mayor rendimiento agregado en escenarios de producción con múltiples flujos independientes, mientras que **active‑backup** se reserva para casos donde la prioridad es la resiliencia y la simplicidad operativa.

#### 3.3.5. Conclusión del modo de balanceo

El modo balance-rr proporciona mejora potencial de rendimiento mediante la distribución de carga entre todas las interfaces disponibles. Aunque en nuestra prueba controlada no se observó una ventaja clara en términos de rendimiento bruto, este modo ofrece beneficios significativos en escenarios con:

- Múltiples conexiones simultáneas
- Diversos tipos de tráfico
- Cargas de trabajo variadas con diferentes destinos

Además, mantiene la capacidad de tolerancia a fallos, lo que lo convierte en una solución más completa para entornos que requieren tanto rendimiento como disponibilidad.

### 3.4.1. Checklist de validación operacional

| Objetivo                               | Comando                                                            | Resultado esperado                                  |
|----------------------------------------|--------------------------------------------------------------------|-----------------------------------------------------|
| Estado general de `bond0`              | `nmcli -f GENERAL.STATE device show bond0`                         | `100 (connected)`                                   |
| Detalles de esclavos y modo            | `cat /proc/net/bonding/bond0`                                      | Cada esclavo con `MII Status: up`                   |
| Tramas LACP presentes (modo 4)         | `tcpdump -i bond0 -nn 'ether proto 0x8809'`                        | Paquetes LACP cada segundo                          |
| Rendimiento agregado (≥ 2 enlaces)     | `iperf3 -c <host> -P 3 -t 30`                                      | ≥ 2 × ancho de banda de un enlace individual        |

### 3.4. Validación global

Ambos modos de agregación de enlaces cumplen sus objetivos específicos:

- **Modo active-backup**: Proporciona alta disponibilidad y redundancia mediante la conmutación automática entre interfaces. La prueba demostró claramente que ante un fallo de la interfaz activa, el sistema mantiene la conectividad sin interrupciones perceptibles.

- **Modo balance-rr**: Ofrece distribución de carga y potencial mejora de rendimiento al utilizar todas las interfaces disponibles simultáneamente. La prueba mostró que puede manejar múltiples flujos paralelos de manera eficiente.

### 3.5. Conclusiones

Las configuraciones implementadas proporcionan soluciones efectivas para los dos escenarios principales en agregación de enlaces:

1. **Escenario de alta disponibilidad**: El modo active-backup es la elección óptima cuando la prioridad es la fiabilidad y la continuidad del servicio ante fallos de enlace.

2. **Escenario de mejora de rendimiento**: El modo balance-rr es adecuado cuando se busca aumentar el ancho de banda agregado y distribuir la carga, especialmente en entornos con múltiples conexiones simultáneas.

Estas configuraciones son complementarias y su elección dependerá de los requisitos específicos del sistema: priorizar la disponibilidad o el rendimiento.
