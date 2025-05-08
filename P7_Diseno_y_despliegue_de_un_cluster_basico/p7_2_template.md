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

## 4. Pruebas y validación

### Validación estructurada

- Acceder al servicio web desde el navegador del anfitrión en `http://192.168.140.253`
- Confirmar que la IP flotante se asigna al nodo activo (`ip addr show`)
- Simular caída: `pcs node standby nodo1.vpd.com`
- Confirmar failover: acceder al servicio desde el segundo nodo
- Reintegrar nodo: `pcs node unstandby nodo1.vpd.com`
- Validar persistencia tras reinicio

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
