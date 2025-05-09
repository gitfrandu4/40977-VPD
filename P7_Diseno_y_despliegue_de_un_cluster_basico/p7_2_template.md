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

#### Comandos paso a paso (según ficha)

```bash
# Paso 1.1: Instalar software de clúster
dnf install pcs pacemaker fence-agents-all

# Paso 1.2: Abrir puertos del cortafuegos
firewall-cmd --permanent --add-service=high-availability
firewall-cmd --reload

# Paso 2: Establecer contraseña para hacluster
passwd hacluster

# Paso 3: Activar pcsd
systemctl start pcsd.service
systemctl enable pcsd.service

# Paso 4: Autenticación de nodos
pcs host auth nodo1.vpd.com nodo2.vpd.com
```

En esta fase se realizará la configuración necesaria para que los nodos puedan formar parte del clúster, incluyendo la instalación de paquetes necesarios y la configuración del mecanismo de aislamiento (fencing).

**Paso 1**

Empezamos en Nodo1

```bash
[root@nodo1 ~]# dnf install pcs pacemaker fence-agents-all
¡Completado!

[root@nodo1 ~]# firewall-cmd --permanent --add-service=high-availability
success
[root@nodo1 ~]# firewall-cmd --reload
success
```

Seguimos en nodo2

```bash
[root@nodo2 ~]# dnf install pcs pacemaker fence-agents-all
¡Completado!

[root@nodo2 ~]# firewall-cmd --permanent --add-service=high-availability
success
[root@nodo2 ~]# firewall-cmd --reload
success
```

**Paso 2**

nodo1

```
[root@nodo1 ~]# passwd hacluster
Nueva contraseña: 
CONTRASEÑA INCORRECTA: La contraseña no supera la verificación de diccionario - está basada en una palabra del diccionario
Vuelva a escribir la nueva contraseña: 
passwd: contraseña actualizada correctamente
```

nodo 1
```
[root@nodo1 ~]# passwd hacluster
Nueva contraseña: 
CONTRASEÑA INCORRECTA: La contraseña no supera la verificación de diccionario - está basada en una palabra del diccionario
Vuelva a escribir la nueva contraseña: 
passwd: contraseña actualizada correctamente
```

**Paso 3**

```bash
[root@nodo1 ~]# systemctl start pcsd.service
[root@nodo1 ~]# systemctl enable pcsd.service
Created symlink '/etc/systemd/system/multi-user.target.wants/pcsd.service' → '/usr/lib/systemd/system/pcsd.service'.
```

**Paso 4**

```bash
[root@nodo1 ~]# pcs host auth nodo1.vpd.com nodo2.vpd.com
Username: hacluster
Password: 
nodo2.vpd.com: Authorized
nodo1.vpd.com: Authorized
```

### 2. Creación del Cluster

**Paso 1**

```bash
pcs cluster setup Apache --start nodo1.vpd.com nodo2.vpd.com
```

Ejecutamos en Nodo 1

```bash
[root@nodo1 ~]# pcs cluster setup Apache --start nodo1.vpd.com nodo2.vpd.com
No addresses specified for host 'nodo1.vpd.com', using 'nodo1.vpd.com'
No addresses specified for host 'nodo2.vpd.com', using 'nodo2.vpd.com'
Destroying cluster on hosts: 'nodo1.vpd.com', 'nodo2.vpd.com'...
nodo2.vpd.com: Successfully destroyed cluster
nodo1.vpd.com: Successfully destroyed cluster
Requesting remove 'pcsd settings' from 'nodo1.vpd.com', 'nodo2.vpd.com'
nodo1.vpd.com: successful removal of the file 'pcsd settings'
nodo2.vpd.com: successful removal of the file 'pcsd settings'
Sending 'corosync authkey', 'pacemaker authkey' to 'nodo1.vpd.com', 'nodo2.vpd.com'
nodo1.vpd.com: successful distribution of the file 'corosync authkey'
nodo1.vpd.com: successful distribution of the file 'pacemaker authkey'
nodo2.vpd.com: successful distribution of the file 'corosync authkey'
nodo2.vpd.com: successful distribution of the file 'pacemaker authkey'
Sending 'corosync.conf' to 'nodo1.vpd.com', 'nodo2.vpd.com'
nodo1.vpd.com: successful distribution of the file 'corosync.conf'
nodo2.vpd.com: successful distribution of the file 'corosync.conf'
Cluster has been successfully set up.
Starting cluster on hosts: 'nodo1.vpd.com', 'nodo2.vpd.com'...
```

**Paso 2**

```bash
[root@nodo1 ~]# pcs cluster enable --all
nodo1.vpd.com: Cluster Enabled
nodo2.vpd.com: Cluster Enabled
```

**Paso 3**

```bash
[root@nodo1 ~]# pcs cluster status
Cluster Status:
 Cluster Summary:
   * Stack: corosync (Pacemaker is running)
   * Current DC: nodo2.vpd.com (version 2.1.9-1.fc41-7188dbf) - partition with quorum
   * Last updated: Thu May  8 19:36:52 2025 on nodo1.vpd.com
   * Last change:  Thu May  8 19:36:09 2025 by hacluster via hacluster on nodo2.vpd.com
   * 2 nodes configured
   * 0 resource instances configured
 Node List:
   * Online: [ nodo1.vpd.com nodo2.vpd.com ]

PCSD Status:
  nodo2.vpd.com: Online
  nodo1.vpd.com: Online
```

### 3. Establecimiento de un mecanismo de aislamiento de nodos, conocido en inglés por el término “fencing configuration”.

**Paso 1**

En el host anfitrión

```bash
root@lq-d25:~# dnf install fence-virt fence-virtd fence-virtd-multicast fence-virtd-libvirt
¡Listo!
```

```bash
root@lq-d25:~# firewall-cmd --permanent --zone=libvirt --add-rich-rule='rule family="ipv4" source address="10.22.132.11" accept'
success
root@lq-d25:~# firewall-cmd --reload 
success
root@lq-d25:~# firewall-cmd --permanent --zone=libvirt --add-rich-rule='rule family="ipv4" source address="10.22.132.12" accept'
success
root@lq-d25:~# firewall-cmd --reload 
```

Ahora:

```bash
root@lq-d25:~# fence_virtd -c
```

Nota: dejamos todo porr defecto menos la interfaz, que indicaremos la de Control (virbr3 en nuestro caso)

Comprobamos la configuración generada:

```
root@lq-d25:~# cat /etc/fence_virt.conf 
backends {
	libvirt {
		uri = "qemu:///system";
	}

}

listeners {
	multicast {
		port = "1229";
		family = "ipv4";
		interface = "virbr3";
		address = "225.0.0.12";
		key_file = "/etc/cluster/fence_xvm.key";
	}

}

fence_virtd {
	module_path = "/usr/lib64/fence-virt/";
	backend = "libvirt";
	listener = "multicast";
}
```

Paso 1.4. Crear el fichero que contiene la clave compartida en el directorio
adecuado

```bash
root@lq-d25:~# dd if=/dev/urandom bs=512 count=1 of=/etc/cluster/fence_xvm.key
1+0 records in
1+0 records out
512 bytes copied, 0,00011887 s, 4,3 MB/s
```

Paso 1.5. Finalmente lanzar el servicio y habilitarlo para que se lance cada
vez que se inicia el host anfitrión

```bash
root@lq-d25:~# systemctl start fence_virtd
root@lq-d25:~# systemctl enable fence_virtd
Created symlink /etc/systemd/system/multi-user.target.wants/fence_virtd.service → /usr/lib/systemd/system/fence_virtd.service.
```

Paso 1.6. Comprobar la conectividad multicast a través de la orden fence_xvm -o list (ver Figura 2). En caso de que la orden no responda, reiniciar el host anfitrión.

```bash
root@lq-d25:~# fence_xvm -o list
Almacenamiento                   9ac8572e-eda5-44f9-8282-5acbbb68449e on
mvp1                             77722a52-4d29-4f91-a688-453a1fbfad52 off
Nodo1                            2b88a0ed-78cc-4ac8-ac5b-a665173f8f11 on
Nodo2                            bebe4eb9-cab1-4101-aedc-32920714da29 on
```

**Paso 2**

Paso 2.1. Instalación de los paquetes de aislamiento o fencing en ambos
nodos.

En nodo 1

```bash
[root@nodo1 ~]# dnf install fence-virt fence-virtd
¡Completado!
```

En nodo 2

```bash
[root@nodo2 ~]# dnf install fence-virt fence-virtd
¡Completado!
```

Paso 2.2. Configurar el cortafuegos en ambos nodos para permitir el
tráfico de comunicación con el host anfitrión a través de la red de control
(10.22.132.1) y del puerto 1229 (que ha sido el puerto establecido en el
fichero de configuración).

En nodo 1

```bash
[root@nodo1 ~]# firewall-cmd --permanent --add-rich-rule='rule family="ipv4" source address="10.22.132.1" port port="1229" protocol="tcp" accept'
success
[root@nodo1 ~]# firewall-cmd --reload
success
```

En nodo 2

```bash
[root@nodo2 ~]# firewall-cmd --permanent --add-rich-rule='rule family="ipv4" source address="10.22.132.1" port port="1229" protocol="tcp" accept'
success
[root@nodo2 ~]# firewall-cmd --reload
success
```

Paso 2.3. Crear el directorio administrativo /etc/cluster y copiar el
fichero que contiene la clave compartida que emplean los nodos para
realizar las peticiones de fencing en ambos nodos.

En nodo1

```bash
[root@nodo1 ~]# mkdir -p /etc/cluster
[root@nodo1 ~]# scp root@10.22.132.1:/etc/cluster/fence_xvm.key /etc/cluster
The authenticity of host '10.22.132.1 (10.22.132.1)' can't be established.
ED25519 key fingerprint is SHA256:l0osqDQASLi0i2VxG9JBdScHzGp0sydZcSEENDV8I8I.
This key is not known by any other names.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added '10.22.132.1' (ED25519) to the list of known hosts.
root@10.22.132.1's password: 
fence_xvm.key                                 100%  512   404.7KB/s   00:00    
[root@nodo1 ~]# 
```

En nodo2

```bash
[root@nodo2 ~]# mkdir -p /etc/cluster
[root@nodo2 ~]# scp root@10.22.132.1:/etc/cluster/fence_xvm.key /etc/cluster
The authenticity of host '10.22.132.1 (10.22.132.1)' can't be established.
ED25519 key fingerprint is SHA256:l0osqDQASLi0i2VxG9JBdScHzGp0sydZcSEENDV8I8I.
This key is not known by any other names.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added '10.22.132.1' (ED25519) to the list of known hosts.
root@10.22.132.1's password: 
fence_xvm.key                                 100%  512   402.8KB/s   00:00 
```

Paso 2.4. Comprobar la conectividad multicast a través de la orden
fence_xvm -o list (ver Figura 2). En caso de que la orden no responda,
reiniciar los nodos

En nodo 1

```bash
[root@nodo1 ~]# fence_xvm -o list
Almacenamiento                   9ac8572e-eda5-44f9-8282-5acbbb68449e on
mvp1                             77722a52-4d29-4f91-a688-453a1fbfad52 off
Nodo1                            2b88a0ed-78cc-4ac8-ac5b-a665173f8f11 on
Nodo2                            bebe4eb9-cab1-4101-aedc-32920714da29 on
```

En nodo 2

```bash
[root@nodo2 ~]# fence_xvm -o list
Almacenamiento                   9ac8572e-eda5-44f9-8282-5acbbb68449e on
mvp1                             77722a52-4d29-4f91-a688-453a1fbfad52 off
Nodo1                            2b88a0ed-78cc-4ac8-ac5b-a665173f8f11 on
Nodo2                            bebe4eb9-cab1-4101-aedc-32920714da29 on
```

Paso 2.5. Finalmente, crear el mecanismo de fencing de tipo fence_xvm
que hemos configurado en el clúster a través de la orden pcs stonith
create en uno de los nodos (el primer parámetro es el identificador o
nombre que le damos, en nuestro caso xvmfence).

```bash
[root@nodo1 ~]# pcs stonith create xvmfence fence_xvm key_file=/etc/cluster/fence_xvm.key
```

Reiniciar ambos nodos y comprobar el estado del mecanismo de fencing
mediante la orden pcs stonith y el estado global del clúster empleando la
orden pcs status.

En Nodo 1:

```bash
[root@nodo1 ~]# pcs stonith 
  * xvmfence	(stonith:fence_xvm):	 Started nodo1.vpd.com
```

```bash
[root@nodo1 ~]# pcs status
Cluster name: Apache
Cluster Summary:
  * Stack: corosync (Pacemaker is running)
  * Current DC: nodo2.vpd.com (version 2.1.9-1.fc41-7188dbf) - partition with quorum
  * Last updated: Thu May  8 20:03:02 2025 on nodo1.vpd.com
  * Last change:  Thu May  8 20:00:14 2025 by root via root on nodo1.vpd.com
  * 2 nodes configured
  * 1 resource instance configured

Node List:
  * Online: [ nodo1.vpd.com nodo2.vpd.com ]

Full List of Resources:
  * xvmfence	(stonith:fence_xvm):	 Started nodo1.vpd.com

Daemon Status:
  corosync: active/enabled
  pacemaker: active/enabled
  pcsd: active/enabled
```

En Nodo 2:

```bash
[root@nodo2 ~]# pcs stonith 
  * xvmfence	(stonith:fence_xvm):	 Started nodo1.vpd.com
```

```bash
[root@nodo2 ~]# pcs status
Cluster name: Apache
Cluster Summary:
  * Stack: corosync (Pacemaker is running)
  * Current DC: nodo2.vpd.com (version 2.1.9-1.fc41-7188dbf) - partition with quorum
  * Last updated: Thu May  8 20:02:16 2025 on nodo2.vpd.com
  * Last change:  Thu May  8 20:00:14 2025 by root via root on nodo1.vpd.com
  * 2 nodes configured
  * 1 resource instance configured

Node List:
  * Online: [ nodo1.vpd.com nodo2.vpd.com ]

Full List of Resources:
  * xvmfence	(stonith:fence_xvm):	 Started nodo1.vpd.com

Daemon Status:
  corosync: active/enabled
  pacemaker: active/enabled
  pcsd: active/enabled
```

### 4. Configuración del servicio httpd para su ejecución en un clúster

**Paso 1**:

**En nodo 1**:

```bash
[root@nodo1 ~]# sudo tee /etc/httpd/conf.d/status.conf > /dev/null <<EOF
<Location /server-status>
  SetHandler server-status
  Require local
</Location>
EOF
```

**En nodo 2**:

```
[root@nodo2 ~]# sudo tee /etc/httpd/conf.d/status.conf > /dev/null <<EOF
<Location /server-status>
  SetHandler server-status
  Require local
</Location>
EOF
```

**Paso 2**:

En nodo 1

```bash
[root@nodo1 ~]# cat /etc/logrotate.d/httpd 
# Note that logs are not compressed unless "compress" is configured,
# which can be done either here or globally in /etc/logrotate.conf.
/var/log/httpd/*log {
    missingok
    notifempty
    sharedscripts
    delaycompress
    postrotate
	/usr/bin/ps -q $(/usr/bin/cat /var/run/httpd-Website.pid) >/dev/null 2>/dev/null &&
	/usr/sbin/httpd -f /etc/httpd/conf/httpd.conf -c "PidFile /var/run/httpd-Website.pid" -k graceful > /dev/null 2>/dev/null || true
    endscript
}
```

En nodo 2:

```
[root@nodo2 ~]# cat /etc/logrotate.d/httpd 
# Note that logs are not compressed unless "compress" is configured,
# which can be done either here or globally in /etc/logrotate.conf.
/var/log/httpd/*log {
    missingok
    notifempty
    sharedscripts
    delaycompress
    postrotate
 	/usr/bin/ps -q $(/usr/bin/cat /var/run/httpd-Website.pid) >/dev/null 2>/dev/null &&
	/usr/sbin/httpd -f /etc/httpd/conf/httpd.conf -c "PidFile /var/run/httpd-Website.pid" -k graceful > /dev/null 2>/dev/null || true       
    endscript
}
```

### 5. Configurar los nodos de clúster para que el espacio de almacenamiento compartido sea no sea controlado localmente en cada nodo del clúster.

**Paso 1**:

En nodo 1:

```bash
[root@nodo1 ~]# vgs --noheadings -o vg_name
  ApacheVG
  fedora  
```

En nodo 2:

```bash
[root@nodo2 ~]# vgs --noheadings -o vg_name
  Device /dev/sdb has PVID DAj7k5iaUeN0XkIiDWgUz0DyKjUSxJTJ (devices file none)
  ApacheVG
  fedora  
```

**Paso 2**

El paso 2 consiste en indicarle a LVM qué VGs **SÍ** debe gestionar localmente, dejando **fuera** al VG compartido (`ApacheVG`), de modo que sólo Pacemaker lo controle.

Hacemos una copia de seguridad del fichero original:

   ```bash
   sudo cp /etc/lvm/lvm.conf /etc/lvm/lvm.conf.bak
   ```

Insertamos volume_list dentro de la sección global. Puedes hacerlo con este sed, que busca global { y añade justo después tu setting:

Referencia: https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/7/html/high_availability_add-on_administration/s1-exclusiveactive-haaa#s1-exclusiveactive-HAAA

En nodo 1:

```bash
[root@nodo1 ~]# grep -n "volume_list" /etc/lvm/lvm.conf
1530:	# Configuration option activation/volume_list.
1546:	#     or VG. See tags/hosttags. If any host tags exist but volume_list
1551:	volume_list = [ "fedora" ]
```

En nodo 2:

```bash
[root@nodo1 ~]# grep -n "volume_list" /etc/lvm/lvm.conf
1530:	# Configuration option activation/volume_list.
1546:	#     or VG. See tags/hosttags. If any host tags exist but volume_list
1551:	volume_list = [ "fedora" ]
```

(En la sección de activation)

**Paso 3**

Reiniciamos la máquina para que LVM aplique la nueva configuración:

   ```bash
   sudo reboot
   ```

**Paso 6**. Una vez reiniciados los nodos, verificar que los servicios de control del
clúster se están ejecutando correctamente.

```bash
# pcs cluster status
Si la orden anterior produjera un error consistente en que el clúster no se está
ejecutando, entonces ejecutar la siguiente orden para iniciar la ejecución de
clúster:
# pcs cluster start
Alternativamente, se podrían reiniciar todos los nodos del clúster y, una vez todos
los nodos estuvieran arrancados, entonces ejecutar en todos los nodos la orden:
# pcs cluster start --all
```

Al arrancar de nuevo, verificamos que el clúster sigue en pie:

   ```bash
   sudo pcs cluster status || sudo pcs cluster start --all
   ```

En nodo1:

``bash
[root@nodo1 ~]# pcs cluster status || sudo pcs cluster start --all
Cluster Status:
 Cluster Summary:
   * Stack: corosync (Pacemaker is running)
   * Current DC: nodo1.vpd.com (version 2.1.9-1.fc41-7188dbf) - partition with quorum
   * Last updated: Fri May  9 18:31:52 2025 on nodo1.vpd.com
   * Last change:  Fri May  9 18:31:14 2025 by root via root on nodo1.vpd.com
   * 2 nodes configured
   * 1 resource instance configured
 Node List:
   * Online: [ nodo1.vpd.com nodo2.vpd.com ]

PCSD Status:
  nodo2.vpd.com: Online
  nodo1.vpd.com: Online
```

En nodo2: 

```bash
[root@nodo2 ~]# pcs cluster status || sudo pcs cluster start --all
Cluster Status:
 Cluster Summary:
   * Stack: corosync (Pacemaker is running)
   * Current DC: nodo1.vpd.com (version 2.1.9-1.fc41-7188dbf) - partition with quorum
   * Last updated: Fri May  9 18:32:04 2025 on nodo2.vpd.com
   * Last change:  Fri May  9 18:31:14 2025 by root via root on nodo1.vpd.com
   * 2 nodes configured
   * 1 resource instance configured
 Node List:
   * Online: [ nodo1.vpd.com nodo2.vpd.com ]

PCSD Status:
  nodo2.vpd.com: Online
  nodo1.vpd.com: Online
```

Con esto LVM solo arrancará el VG `fedora` en cada nodo y dejará `ApacheVG` sin gestionar localmente, para que Pacemaker se encargue de montarlo y desmontarlo según haga falta.

### 6. Creación de los recursos y grupos de recursos del clúster.

En nodo 1:

```bash
[root@nodo1 ~]# pcs resource create Apache_LVM LVM volgrpname=ApacheVG exclusive=true --group apachegroup
```

```bash
[root@nodo1 ~]# pcs resource create Apache_FS Filesystem device="/dev/ApacheVG/ApacheLV" directory="/var/www" fstype="xfs" --group apachegroup
Deprecation Warning: Using '--group' is deprecated and will be replaced with 'group' in a future release. Specify --future to switch to the future behavior.
Assumed agent name 'ocf:heartbeat:Filesystem' (deduced from 'Filesystem')
```

```bash
[root@nodo1 ~]# pcs resource create Apache_IP IPaddr2 ip=192.168.140.253 cidr_netmask=24 --group apachegroup
```

```bash
[root@nodo1 ~]# pcs resource create Apache_Script apache configfile="/etc/httpd/conf/httpd.conf" statusurl="http://127.0.0.1/server-status" --group apachegroup
Deprecation Warning: Using '--group' is deprecated and will be replaced with 'group' in a future release. Specify --future to switch to the future behavior.
Assumed agent name 'ocf:heartbeat:apache' (deduced from 'apache')
```

Comprobación en Nodo 1:

```bash
[root@nodo1 ~]# pcs resource status
  * Resource Group: apachegroup:
    * Apache_LVM	(ocf:heartbeat:LVM):	 Started nodo2.vpd.com
    * Apache_FS	(ocf:heartbeat:Filesystem):	 Started nodo2.vpd.com
    * Apache_IP	(ocf:heartbeat:IPaddr2):	 Started nodo2.vpd.com
    * Apache_Script	(ocf:heartbeat:apache):	 Started nodo2.vpd.com
```

```bash
[root@nodo1 ~]# pcs status
Cluster name: Apache
Cluster Summary:
  * Stack: corosync (Pacemaker is running)
  * Current DC: nodo1.vpd.com (version 2.1.9-1.fc41-7188dbf) - partition with quorum
  * Last updated: Fri May  9 19:10:03 2025 on nodo1.vpd.com
  * Last change:  Fri May  9 19:05:01 2025 by hacluster via hacluster on nodo2.vpd.com
  * 2 nodes configured
  * 5 resource instances configured

Node List:
  * Online: [ nodo1.vpd.com nodo2.vpd.com ]

Full List of Resources:
  * xvmfence	(stonith:fence_xvm):	 Started nodo1.vpd.com
  * Resource Group: apachegroup:
    * Apache_LVM	(ocf:heartbeat:LVM):	 Started nodo2.vpd.com
    * Apache_FS	(ocf:heartbeat:Filesystem):	 Started nodo2.vpd.com
    * Apache_IP	(ocf:heartbeat:IPaddr2):	 Started nodo2.vpd.com
    * Apache_Script	(ocf:heartbeat:apache):	 Started nodo2.vpd.com

Daemon Status:
  corosync: active/enabled
  pacemaker: active/enabled
  pcsd: active/enabled
```

Comprobación en Nodo 2:

```
[root@nodo2 ~]# pcs resource status
  * Resource Group: apachegroup:
    * Apache_LVM	(ocf:heartbeat:LVM):	 Started nodo2.vpd.com
    * Apache_FS	(ocf:heartbeat:Filesystem):	 Started nodo2.vpd.com
    * Apache_IP	(ocf:heartbeat:IPaddr2):	 Started nodo2.vpd.com
    * Apache_Script	(ocf:heartbeat:apache):	 Started nodo2.vpd.com
```

```bash
[root@nodo2 ~]# pcs status
Cluster name: Apache
Cluster Summary:
  * Stack: corosync (Pacemaker is running)
  * Current DC: nodo1.vpd.com (version 2.1.9-1.fc41-7188dbf) - partition with quorum
  * Last updated: Fri May  9 19:10:31 2025 on nodo2.vpd.com
  * Last change:  Fri May  9 19:05:01 2025 by hacluster via hacluster on nodo2.vpd.com
  * 2 nodes configured
  * 5 resource instances configured

Node List:
  * Online: [ nodo1.vpd.com nodo2.vpd.com ]

Full List of Resources:
  * xvmfence	(stonith:fence_xvm):	 Started nodo1.vpd.com
  * Resource Group: apachegroup:
    * Apache_LVM	(ocf:heartbeat:LVM):	 Started nodo2.vpd.com
    * Apache_FS	(ocf:heartbeat:Filesystem):	 Started nodo2.vpd.com
    * Apache_IP	(ocf:heartbeat:IPaddr2):	 Started nodo2.vpd.com
    * Apache_Script	(ocf:heartbeat:apache):	 Started nodo2.vpd.com

Daemon Status:
  corosync: active/enabled
  pacemaker: active/enabled
  pcsd: active/enabled
```

## 4. Pruebas y validación

### 7) Validación del funcionamiento del clúster

#### 7.1 Verificar asignación de IP flotante
1. Identificar en qué nodo está activa la IP:
   ```bash
   sudo pcs resource show Apache_IP
   ```
2. En el nodo activo, comprobar que la IP figura en la interfaz:
   ```bash
   ip addr show | grep 192.168.122.253
   ```
3. Si no aparece, forzar un refresh del recurso:
   ```bash
   sudo pcs resource cleanup Apache_IP
   sudo pcs resource start Apache_IP
   ```

#### 7.2 Comprobar accesibilidad HTTP desde el host
1. Desde el **host anfitrión**, verifica conectividad:
   ```bash
   ping -c 3 192.168.122.253
   ```
2. Prueba con curl:
   ```bash
   curl -v http://192.168.122.253/
   ```
   - Si hay error de conexión, revisa punto 7.3 y 7.4.

#### 7.3 Verificar que httpd escucha en la IP flotante
En el **nodo activo** (donde está la IP flotante):
```bash
sudo ss -tlnp | grep httpd
```
Debe salir una línea como:
```
LISTEN 0      128        192.168.122.253:80      *:*    users:(("httpd",pid=...,fd=...))
```

#### 7.4 Revisar firewall y SELinux
En el **nodo activo**:
1. Verificar si el servicio HTTP está permitido:
   ```bash
   sudo firewall-cmd --list-services
   ```
2. Si no aparece `http` o `http-full`, añadirlo:
   ```bash
   sudo firewall-cmd --permanent --add-service=http
   sudo firewall-cmd --reload
   ```
3. Comprobar booleans SELinux:
   ```bash
   getsebool httpd_can_network_connect
   ```
   Si está `off`, habilitar:
   ```bash
   sudo setsebool -P httpd_can_network_connect on
   ```

#### 7.5 Prueba de failover
1. En un terminal del **host**, aisla el nodo activo:
   ```bash
   sudo pcs node standby <nodo-activo>
   ```
2. Desde el host, vuelve a ejecutar:
   ```bash
   curl -v http://192.168.122.253/
   ```
   - Debe responder igual desde el segundo nodo.
3. Para restaurar:
   ```bash
   sudo pcs node unstandby <nodo-activo>
   ```

Con estas pruebas podrás confirmar que el servicio web permanece disponible tras fallo de un nodo.

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
