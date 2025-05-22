# Trabajo Optativo: agregación de enlaces de r`ed

- [Trabajo Optativo: agregación de enlaces de r\`ed](#trabajo-optativo-agregación-de-enlaces-de-red)
  - [Tarea 1. Creación de la máquina virtual](#tarea-1-creación-de-la-máquina-virtual)
  - [Tarea 2. Configuración de las interfaces de red para que se agrupen dando lugar a una única conexión](#tarea-2-configuración-de-las-interfaces-de-red-para-que-se-agrupen-dando-lugar-a-una-única-conexión)
    - [2.1. Configuración de las interfaces de red para que se agrupen dando lugar a una única conexión](#21-configuración-de-las-interfaces-de-red-para-que-se-agrupen-dando-lugar-a-una-única-conexión)
    - [2.2. Configuración de LACP/througph](#22-configuración-de-lacpthrougph)
      - [Cómo recuperar el acceso](#cómo-recuperar-el-acceso)
  - [Tarea 3. Validación](#tarea-3-validación)

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
nmcli connection modify bond0 ipv4.metthod auto
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

### 2.2. Configuración de LACP/througph

Hasta ahora hemos conseguido la alta disponibilidad,

1. ahora vamos a cambiar a modo `802.3ad/LACP (prueba de rendimiento) nuestra conexión bond0

<!--
```bash
root@bond:~# sudo nmcli connection modify bond0 bond.options "mode=802.3ad,miimon=100,lacp_rate=fast"
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

```

-->

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

Volvemos al modo active-backup

```bash
nmcli connection modify bond0 bond.options "mode=active-backup,miimon=100"
nmcli connection down bond0
nmcli connection up bond0
```

Ya podemos acceder por SSH

COnfiguramos LACP/througph sin perder la red, con un modo de balanceo que no requiera switch especial, como balance-rr (mode 0)

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
root@bond:~# iperf3 -c 192.168.122.1 -t 30
iperf3: error - unable to connect to server - server may have stopped running or use a different port, firewall issue, etc.: Connection refused
root@bond:~# iperf3 -c 192.168.122.1 -t 30
Connecting to host 192.168.122.1, port 5201
[  5] local 192.168.122.57 port 35384 connected to 192.168.122.1 port 5201
[ ID] Interval           Transfer     Bitrate         Retr  Cwnd
[  5]   0.00-1.00   sec  2.44 GBytes  20.9 Gbits/sec  715    411 KBytes       
[  5]   1.00-2.00   sec  2.34 GBytes  20.1 Gbits/sec    0    411 KBytes       
[  5]   2.00-3.00   sec  2.40 GBytes  20.6 Gbits/sec   90    387 KBytes       
[  5]   3.00-4.00   sec  2.50 GBytes  21.5 Gbits/sec    0    403 KBytes       
[  5]   4.00-5.00   sec  2.40 GBytes  20.7 Gbits/sec    0    414 KBytes       
[  5]   5.00-6.00   sec  2.33 GBytes  20.0 Gbits/sec    0    424 KBytes       
[  5]   6.00-7.00   sec  2.33 GBytes  20.0 Gbits/sec   45    395 KBytes       
[  5]   7.00-8.00   sec  2.39 GBytes  20.5 Gbits/sec    5    318 KBytes       
[  5]   8.00-9.00   sec  2.41 GBytes  20.7 Gbits/sec  232    387 KBytes       
[  5]   9.00-10.00  sec  2.37 GBytes  20.4 Gbits/sec  100    386 KBytes       
[  5]  10.00-11.00  sec  2.45 GBytes  21.0 Gbits/sec   60    385 KBytes       
[  5]  11.00-12.00  sec  2.40 GBytes  20.6 Gbits/sec    0    402 KBytes       
[  5]  12.00-13.00  sec  2.33 GBytes  20.0 Gbits/sec   45    407 KBytes       
[  5]  13.00-14.00  sec  2.37 GBytes  20.4 Gbits/sec    0    416 KBytes       
[  5]  14.00-15.00  sec  2.32 GBytes  20.0 Gbits/sec   69    421 KBytes       
[  5]  15.00-16.00  sec  2.40 GBytes  20.6 Gbits/sec   45    337 KBytes       
[  5]  16.00-17.00  sec  2.45 GBytes  21.1 Gbits/sec    0    389 KBytes       
[  5]  17.00-18.00  sec  2.30 GBytes  19.8 Gbits/sec    0    400 KBytes       
[  5]  18.00-19.00  sec  2.37 GBytes  20.3 Gbits/sec    0    413 KBytes       
[  5]  19.00-20.00  sec  2.35 GBytes  20.2 Gbits/sec  207    307 KBytes       
[  5]  20.00-21.00  sec  2.42 GBytes  20.8 Gbits/sec    0    399 KBytes       
[  5]  21.00-22.00  sec  2.28 GBytes  19.6 Gbits/sec   66    334 KBytes       
[  5]  22.00-23.00  sec  2.40 GBytes  20.6 Gbits/sec    0    386 KBytes       
[  5]  23.00-24.00  sec  2.35 GBytes  20.2 Gbits/sec    0    354 KBytes       
[  5]  24.00-25.00  sec  2.37 GBytes  20.4 Gbits/sec    0    403 KBytes       
[  5]  25.00-26.00  sec  2.43 GBytes  20.9 Gbits/sec   90    386 KBytes       
[  5]  26.00-27.00  sec  2.36 GBytes  20.3 Gbits/sec    4    386 KBytes       
[  5]  27.00-28.00  sec  2.40 GBytes  20.6 Gbits/sec    0    404 KBytes       
[  5]  28.00-29.00  sec  2.32 GBytes  20.0 Gbits/sec   90    318 KBytes       
[  5]  29.00-30.00  sec  2.31 GBytes  19.8 Gbits/sec    0    393 KBytes       
- - - - - - - - - - - - - - - - - - - - - - - - -
[ ID] Interval           Transfer     Bitrate         Retr
[  5]   0.00-30.00  sec  71.3 GBytes  20.4 Gbits/sec  1863             sender
[  5]   0.00-30.00  sec  71.3 GBytes  20.4 Gbits/sec                  receiver

iperf Done.
```

## Tarea 3. Validación
