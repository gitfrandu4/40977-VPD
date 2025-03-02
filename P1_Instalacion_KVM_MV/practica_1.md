# Instalación y Configuración de KVM y Máquinas Virtuales

## Tabla de contenido

- [Desarrollo](#desarrollo)
  - [Fase 1. Configuración del sistema anfitrión](#fase1-configuración-del-sistema-anfitrión)
  - [Fase 2. Verificación de requerimientos mínimos](#fase2-verificación-de-requerimientos-mínimos)
  - [Fase 3. Instalación de paquetes de virtualización](#fase3-instalación-de-paquetes-de-virtualización)
  - [Fase 4. Creación de una máquina virtual](#fase4-creación-de-una-máquina-virtual)
- [Pruebas y Validación](#pruebasvalidación)
- [Bibliografía](#bibliografía)

## Desarrollo

### Fase 1. Configuración del sistema anfitrión

#### Tarea 1. Personalizar la clave del usuario root

Se personaliza la clave del usuario root del PC asignado ejecutando la orden `passwd`.

#### Tarea 2. Completar la encuesta "Datos PC"

Para completar la encuesta "Datos PC" se procede de la siguiente forma:

1. Identificador del PC asignado: **LQ-D25**
2. Dirección IP del PC: **10.140.92.125**

Se ejecuta la orden:

```bash
root@lq-d25:/# ip -4 addr show
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
2: enp6s0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000
    inet 10.140.92.125/24 brd 10.140.92.255 scope global dynamic noprefixroute enp6s0
       valid_lft 9880sec preferred_lft 9880sec
3: virbr0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state UP group default qlen 1000
    inet 192.168.122.1/24 brd 192.168.122.255 scope global virbr0
       valid_lft forever preferred_lft forever
```

**Explicación del comando**:
- `ip`: Herramienta de línea de comandos para configurar y mostrar información sobre interfaces de red, rutas, políticas y túneles
- `-4`: Limita la salida a direcciones IPv4 únicamente
- `addr`: Subcomando que solicita información sobre direcciones de red
- `show`: Muestra la información detallada de todas las interfaces disponibles

La salida muestra tres interfaces:
1. `lo`: La interfaz de loopback (127.0.0.1) utilizada para comunicaciones internas dentro del mismo sistema
2. `enp6s0`: La interfaz física conectada a la red local con dirección IP 10.140.92.125/24
3. `virbr0`: Una interfaz de red virtual creada por libvirt (192.168.122.1/24) que sirve como puente para las máquinas virtuales

#### Tarea 3. Comprobar el modo de funcionamiento de SELinux

Se ejecuta la siguiente orden para comprobar que el modo de funcionamiento de SELinux se está ejecutando en modo "enforcing":

```bash
root@lq-d25:/# sestatus
SELinux status:                 enabled
SELinuxfs mount:                /sys/fs/selinux
SELinux root directory:         /etc/selinux
Loaded policy name:             targeted
Current mode:                   enforcing
Mode from config file:          enforcing
Policy MLS status:              enabled
Policy deny_unknown status:     allowed
Memory protection checking:     actual (secure)
Max kernel policy version:      33
```

**Explicación del comando**:
- `sestatus`: Utilidad especializada para mostrar el estado completo de SELinux en el sistema
  - No requiere opciones adicionales ya que su función principal es mostrar el estado actual de SELinux

La salida muestra información detallada sobre la configuración de SELinux:
- `SELinux status: enabled`: Indica que SELinux está activo
- `Current mode: enforcing`: Confirma que SELinux está en modo enforcing, lo que significa que está aplicando activamente todas las políticas de seguridad configuradas
- `Loaded policy name: targeted`: Indica que se está utilizando la política "targeted", que aplica restricciones principalmente a servicios de red y daemons expuestos
- `Policy MLS status: enabled`: Muestra que el control de acceso multinivel está habilitado

> **Nota**: El modo "enforcing" en SELinux es crítico para entornos de virtualización, ya que proporciona aislamiento adicional entre las máquinas virtuales y el sistema anfitrión.

#### Tarea 4. Instalar un entorno gráfico GNOME mínimo

Para instalar un entorno gráfico GNOME mínimo, primero se debe instalar el grupo de paquetes @base-x:

```bash
dnf groupinstall "base-x" -y
```

**Explicación del comando**:
- `dnf`: Gestor de paquetes moderno en distribuciones basadas en RPM, como Fedora
- `groupinstall`: Subcomando para instalar un grupo predefinido de paquetes relacionados
- `"base-x"`: Nombre del grupo de paquetes que contiene los componentes básicos del sistema X Window
- `-y`: Opción que acepta automáticamente todas las preguntas de confirmación durante la instalación

A continuación, se instalan los paquetes esenciales de GNOME:

```bash
sudo dnf install -y gnome-shell gnome-terminal nautilus
```

**Explicación del comando**:
- `sudo`: Ejecuta el comando con privilegios elevados (necesario para instalar software)
- `dnf install`: Subcomando para instalar paquetes específicos
- `-y`: Acepta automáticamente la confirmación
- Paquetes instalados:
  - `gnome-shell`: El entorno de escritorio GNOME que proporciona la interfaz gráfica principal
  - `gnome-terminal`: El emulador de terminal para el entorno GNOME
  - `nautilus`: El gestor de archivos oficial de GNOME

También se debe instalar virt-manager, que permitirá gestionar máquinas virtuales:

```bash
sudo dnf install -y virt-manager
```

**Explicación del comando**:
- `virt-manager`: Interfaz gráfica para la gestión de máquinas virtuales a través de libvirt
  - Proporciona una forma intuitiva de crear, modificar y monitorizar máquinas virtuales
  - Se integra con KVM, QEMU y Xen

Para iniciar el sistema en modo gráfico por defecto:

```bash
sudo systemctl set-default graphical.target
```

**Explicación del comando**:
- `systemctl`: Herramienta principal para controlar systemd (sistema de inicio y gestor de servicios)
- `set-default`: Establece el objetivo (target) de inicio predeterminado
- `graphical.target`: Unidad systemd que define el nivel de ejecución para un sistema con interfaz gráfica completa
  - Equivalente al antiguo runlevel 5 en sistemas SysV

Este comando configura el sistema para arrancar directamente en modo gráfico en futuros reinicios, sin necesidad de iniciar manualmente el entorno gráfico.

Ahora para poder iniciar la interfaz gráfica habría que reiniciar el PC o ejecutar:

```bash
sudo systemctl start gdm
```

**Explicación del comando**:
- `systemctl start`: Inicia inmediatamente un servicio o unidad
- `gdm`: GNOME Display Manager, el gestor de pantalla que maneja el inicio de sesión gráfico y lanza el entorno GNOME
  - Se encarga de la autenticación gráfica de usuarios
  - Permite la selección de diferentes sesiones de escritorio

Esta orden inicia GDM sin necesidad de reiniciar, proporcionando acceso inmediato al entorno gráfico.

Finalmente, se instalan las herramientas adicionales Firefox y gedit:
 
```bash
sudo dnf install -y firefox gedit
```

**Explicación del comando**:
- Paquetes instalados:
  - `firefox`: Navegador web de código abierto desarrollado por Mozilla
  - `gedit`: Editor de texto gráfico optimizado para el entorno GNOME
    - Incluye resaltado de sintaxis y es adecuado para editar archivos de configuración

#### Tarea 5. Configurar el nombre del sistema

En esta sección se describe como configurar el nombre del sistema utilizando la herramienta hostnamectl. El objetivo es establecer un identificador FQDN (Full Qualified Domain Name) que siga el patrón IdentificadorPC.vpd.com.

Primero se verifica el nombre actual del sistema con el comando:

```bash
root@LQ-D25:~# hostnamectl status
   Static hostname: (unset)                         
Transient hostname: LQ-D25
         Icon name: computer-desktop
           Chassis: desktop 🖥️
        Machine ID: ee3433707aa84f56860cd67efede9ce8
           Boot ID: a8c57ab742fc427ab9883280a554ee97
  Operating System: Fedora Linux 39 (Server Edition)
       CPE OS Name: cpe:/o:fedoraproject:fedora:39
    OS Support End: Tue 2024-11-12
OS Support Expired: 2month 3w 4d                    
            Kernel: Linux 6.9.9-100.fc39.x86_64
      Architecture: x86-64
   Hardware Vendor: ASUS
    Hardware Model: PRIME A520M-A II
  Firmware Version: 3002
     Firmware Date: Thu 2023-02-23
      Firmware Age: 1y 11month 2w
```

Este comando muestra información sobre el nombre del host, incluyendo el nombre estático (el que se usa por defecto al arrancar), el nombre transitorio (asignador por la red) y otra información relevante del sistema. 

A continuación, se configura el nuevo hostname:

```bash
sudo hostnamectl set-hostname lq-d25.vpd.com
```

Donde:
- `hostnamectl`: herramienta para controlar el nombre del host
- `set-hostname`: establece el nombre del host
- `lq-d25.vpd.com`: nuevo nombre de dominio completamente cualificado (FQDN)

Después de ejecutar este comando, el sistema tendrá el nuevo FQDN configurado.

Este cambio de nombre es importante para la correcta identificación del sistema en la red y para las prácticas posteriores de la asignatura, donde se utilizará este FQDN para acceder a las máquinas virtuales.

### Fase 2. Verificación de requerimientos mínimos

#### Tarea 6. Verificar la virtualización del procesador

Para verificar que la extensión de virtualización está habilitada en el procesador, se utiliza el siguiente comando:

```bash
root@lq-d25:~# lscpu | grep Virtualization
Virtualization:                       AMD-V
```

**Explicación del comando**:
- `lscpu`: Herramienta que muestra información detallada sobre la arquitectura del procesador
  - Analiza el contenido de `/proc/cpuinfo` y lo presenta en un formato estructurado
- `|`: Operador de tubería (pipe) que redirige la salida del comando anterior a la entrada del siguiente
- `grep Virtualization`: Filtra la salida para mostrar únicamente las líneas que contienen el texto "Virtualization"
  - Permite localizar rápidamente la información específica sobre capacidades de virtualización

En el resultado se indica que el procesador del sistema soporta la tecnología de virtualización AMD-V, lo que significa que se puede utilizar para crear y ejecutar máquinas virtuales. 

También se puede verificar que la extensión de virtualización está habilitada en el procesador con el siguiente comando:

```bash
root@lq-d25:~# grep -E 'svm|vmx' /proc/cpuinfo
flags    : fpu vme de pse tsc msr pae mce cx8 apic sep mtrr pge mca cmov pat pse36 clflush mmx fxsr sse sse2 ht syscall nx mmxext fxsr_opt pdpe1gb rdtscp lm constant_tsc rep_good nopl xtopology nonstop_tsc cpuid extd_apicid aperfmperf rapl pni pclmulqdq monitor ssse3 fma cx16 sse4_1 sse4_2 x2apic movbe popcnt aes xsave avx f16c rdrand lahf_lm cmp_legacy svm extapic cr8_legacy abm sse4a misalignsse 3dnowprefetch osvw ibs skinit wdt tce topoext perfctr_core perfctr_nb bpext perfctr_llc mwaitx cpb cat_l3 cdp_l3 hw_pstate ssbd mba ibrs ibpb stibp vmmcall fsgsbase bmi1 avx2 smep bmi2 erms invpcid cqm rdt_a rdseed adx smap clflushopt clwb sha_ni xsaveopt xsavec xgetbv1 xsaves cqm_llc cqm_occup_llc cqm_mbm_total cqm_mbm_local user_shstk clzero irperf xsaveerptr rdpru wbnoinvd cppc arat npt lbrv svm_lock nrip_save tsc_scale vmcb_clean flushbyasid decodeassists pausefilter pfthreshold avic v_vmsave_vmload vgif v_spec_ctrl umip pku ospke vaes vpclmulqdq rdpid overflow_recov succor smca fsrm debug_swap
```

**Explicación del comando**:
- `grep`: Herramienta para buscar patrones en archivos de texto
- `-E`: Habilita el uso de expresiones regulares extendidas
- `'svm|vmx'`: Expresión regular que busca:
  - `svm`: Indicador de Secure Virtual Machine (tecnología de virtualización de AMD)
  - `vmx`: Indicador de Virtual Machine Extensions (tecnología de virtualización de Intel)
- `/proc/cpuinfo`: Archivo virtual que contiene información detallada sobre todos los procesadores del sistema

Este comando busca específicamente las banderas de virtualización en los datos del procesador:
- Para procesadores AMD se busca la bandera "svm"
- Para procesadores Intel se busca la bandera "vmx"

La presencia de la bandera "svm" en la salida (resaltada en la lista de flags) confirma que el hardware no solo soporta virtualización, sino que además está habilitada a nivel de BIOS/UEFI.

#### Tarea 7. Recopilar información del sistema

Para responder a las preguntas sobre el sistema, se utilizan los siguientes comandos:

¿Cuántos de chips de procesador posee el sistema?

```bash
root@lq-d25:~# lscpu | grep "Socket(s):"
```

**Explicación del comando**:
- Este comando combina `lscpu` con `grep` para filtrar específicamente la información sobre sockets físicos
- El resultado muestra el número de procesadores físicos (chips) instalados en el sistema
- En sistemas de servidor, pueden existir múltiples sockets, mientras que en estaciones de trabajo y PCs típicos suele haber un único socket

¿Cuántos núcleos posee cada chip?

```bash
root@lq-d25:~# lscpu | grep "Core(s) per socket:"
Core(s) per socket:                   6
```

**Explicación del comando**:
- `lscpu | grep "Core(s) per socket:"`: Filtra la salida para mostrar solo la línea que contiene información sobre núcleos por socket
- El resultado "6" indica que cada procesador físico (socket) contiene 6 núcleos de procesamiento independientes
- Los núcleos son unidades de procesamiento que pueden ejecutar instrucciones de forma paralela

Resultado: 6 núcleos por socket. 

¿Cuántos hilos de procesamiento se podrán ejecutar en el sistema?

```bash
root@lq-d25:~# lscpu | grep "Thread(s) per core:"
Thread(s) per core:                   2
```

**Explicación del comando**:
- `lscpu | grep "Thread(s) per core:"`: Filtra la información sobre hilos de ejecución por núcleo
- El resultado "2" indica que cada núcleo puede manejar 2 hilos de ejecución simultáneos
- Esta es una tecnología conocida como SMT (Simultaneous Multi-Threading):
  - En procesadores Intel se llama Hyper-Threading
  - En procesadores AMD se conoce como SMT

Resultado: 2 hilos por núcleo. 

Cálculo: 1 socket * 6 núcleos/socket * 2 hilos/núcleos = 12 hilos de procesamiento.

¿Qué cantidad de memoria RAM dispone el sistema?

Para estudiar la información de la memoria del PC Podemos ejecutar el siguiente comando:

```bash
root@lq-d25:~# free -h
               total        used        free      shared  buff/cache   available
Mem:            62Gi       4,4Gi        56Gi       123Mi       1,4Gi        57Gi
Swap:           39Gi          0B        39Gi
```

**Explicación del comando**:
- `free`: Muestra información sobre la memoria RAM y swap del sistema
- `-h`: Opción "human-readable" que muestra los valores en unidades legibles (GB, MB) en lugar de bytes
- La salida presenta la siguiente información:
  - `total`: Cantidad total de memoria física instalada
  - `used`: Memoria actualmente en uso por aplicaciones y el sistema
  - `free`: Memoria completamente libre
  - `shared`: Memoria compartida entre múltiples procesos
  - `buff/cache`: Memoria utilizada por buffers y caché del sistema para mejorar el rendimiento de E/S
  - `available`: Memoria que puede ser asignada a nuevas aplicaciones sin recurrir a swap

Luego, para averiguar la cantidad de memoria RAM de la que dispone el sistema:

```bash
root@lq-d25:~# free -h | grep Mem | awk '{print $2}'
62Gi
```

**Explicación del comando**:
- `free -h`: Muestra información de memoria en formato legible
- `grep Mem`: Filtra solo la línea que contiene información de la memoria principal
- `awk '{print $2}'`: Extrae el segundo campo de la línea filtrada, que corresponde al total de memoria

Este tipo de comando combinado (pipeline) es muy útil para extraer valores específicos de comandos con salida más compleja, facilitando su uso en scripts.

Respuesta: 62 GiB

¿Qué cantidad de RAM está disponible?

```bash
root@lq-d25:~# free -h | grep Mem | awk '{print $7}'
57Gi
```

**Explicación del comando**: 
- Similar al comando anterior, pero extrae el séptimo campo ($7) que corresponde a la memoria disponible
- La memoria disponible representa la RAM que puede ser asignada inmediatamente a aplicaciones
- Es importante destacar que este valor suele ser mayor que la memoria "free" porque incluye memoria de caché que puede ser liberada si es necesario

Respuesta: 57 GiB

¿Cuál es el tamaño del área de swap?

```bash
root@lq-d25:~# free -h | grep Swap | awk '{print $2}'
39Gi
```

**Explicación del comando**: 
- `grep Swap`: Filtra la línea que contiene información sobre el área de swap
- `awk '{print $2}'`: Extrae el valor total del área de swap
- El área de swap es espacio en disco que el sistema utiliza como extensión de la memoria RAM cuando ésta se agota
- Un tamaño adecuado de swap depende del uso del sistema y la cantidad de RAM, pero suele recomendarse entre 1.5x y 2x la RAM para sistemas con hibernación

Resultado: 39 GiB

¿Cuál es el estado de ocupación y espacio libre del almacenamiento persistente?

```bash
root@lq-d25:~# df -h
S.ficheros     Tamaño Usados  Disp Uso% Montado en
/dev/sda7        144G   4,7G  132G   4% /
devtmpfs         4,0M      0  4,0M   0% /dev
tmpfs             32G      0   32G   0% /dev/shm
tmpfs             13G   9,8M   13G   1% /run
tmpfs             32G    20K   32G   1% /tmp
tmpfs            6,3G   3,7M  6,3G   1% /run/user/0
```

**Explicación del comando**:
- `df`: (Disk Free) Muestra información sobre el espacio utilizado y disponible en sistemas de archivos
- `-h`: Presenta los tamaños en formato legible para humanos (GB, MB)
- La salida proporciona la siguiente información para cada sistema de archivos:
  - `S.ficheros`: El dispositivo o punto de montaje
  - `Tamaño`: Capacidad total
  - `Usados`: Espacio utilizado
  - `Disp`: Espacio disponible
  - `Uso%`: Porcentaje de uso
  - `Montado en`: Punto de montaje en el sistema de archivos

La salida detallada muestra:

- `/dev/sda7`: La partición principal del disco duro, donde está instalado el sistema operativo. Tiene 144 GB de capacidad con solo 4.7 GB utilizados (4% de uso), lo que indica amplio espacio disponible.

- Sistemas de archivos temporales en memoria (tmpfs):
  - `/dev/shm`: Memoria compartida entre procesos (32 GB)
  - `/run`: Almacena archivos temporales de estado del sistema (13 GB)
  - `/tmp`: Para archivos temporales generales (32 GB)
  - `/run/user/0`: Archivos temporales específicos del usuario root (6.3 GB)

En general, el sistema tiene abundante espacio libre tanto en almacenamiento persistente como en memoria.

### Fase 3. Instalación de paquetes de virtualización

#### Tarea 8. Instalar el entorno de virtualización KVM

Para instalar el entorno de virtualización KVM, se deben ejecutar los siguientes comandos:

```bash
root@lq-d25:~# dnf groupinstall "Virtualization " --with-optional -y
Última comprobación de caducidad de metadatos hecha hace 0:51:35, el vie 07 feb 2025 19:33:38.
Dependencias resueltas.
============================================================================================================================
Paquete                      Arquitectura                Versión                        Repositorio                   Tam.
============================================================================================================================
Instalando grupos:
Headless Virtualization                                                                                                   
 
Resumen de la transacción
============================================================================================================================
 
¡Listo!
```

**Explicación del comando**:
- `dnf groupinstall`: Instala un grupo predefinido de paquetes relacionados
- `"Virtualization"`: Nombre del grupo que contiene los paquetes básicos para virtualización con interfaz gráfica
- `--with-optional`: Incluye también los paquetes opcionales del grupo, proporcionando características adicionales
- `-y`: Responde automáticamente "sí" a todas las preguntas de confirmación
  
Este comando instala los paquetes principales para virtualización con KVM, incluyendo:
- `qemu-kvm`: La implementación del hipervisor KVM
- `libvirt`: La API de virtualización
- `virt-manager`: La interfaz gráfica para gestión de máquinas virtuales
- Herramientas auxiliares como `virt-install` y `virt-viewer`

Luego:

```bash
root@lq-d25:~# dnf groupinstall "Virtualization-headless" --with-optional -y
Última comprobación de caducidad de metadatos hecha hace 0:56:23, el vie 07 feb 2025 19:33:38.
Dependencias resueltas.
============================================================================================================================
Paquete                      Arquitectura                Versión                        Repositorio                   Tam.
============================================================================================================================
Instalando grupos:
Headless Virtualization                                                                                                   
 
Resumen de la transacción
============================================================================================================================
 
¡Listo!
```

**Explicación del comando**:
- `"Virtualization-headless"`: Este grupo contiene paquetes para ejecutar y administrar máquinas virtuales sin necesidad de interfaz gráfica
- Incluye herramientas de línea de comandos como `virsh` para administración remota
- Es especialmente útil para servidores sin interfaz gráfica o para automatización

La instalación de ambos grupos proporciona un entorno de virtualización completo con:
- Capacidades gráficas para administración local
- Herramientas de línea de comandos para administración remota o automatizada
- Bibliotecas y dependencias necesarias para el funcionamiento óptimo

Una vez instalado el entorno de virtualización, se puede verificar la instalación ejecutando el comando:

```bash
root@lq-d25:~# virsh cpu-models x86_64
486
pentium
pentium2
pentium3
pentiumpro
coreduo
n270
core2duo
qemu32
kvm32
cpu64-rhel5
cpu64-rhel6
qemu64
kvm64
 …
```

**Explicación del comando**:
- `virsh`: La interfaz de línea de comandos para gestionar la virtualización con libvirt
- `cpu-models`: Subcomando que consulta los modelos de CPU que el hipervisor puede emular
- `x86_64`: Especifica la arquitectura sobre la que se consultan los modelos disponibles

Este comando es útil para:
- Verificar que el sistema de virtualización está correctamente instalado y funcionando
- Conocer los modelos de CPU que pueden emularse para las máquinas virtuales
- Ayudar a seleccionar el modelo de CPU más adecuado al crear nuevas VMs

La salida muestra diversos modelos de CPU soportados, desde procesadores antiguos (486, Pentium) hasta modelos más modernos, permitiendo compatibilidad con diferentes sistemas operativos invitados.

#### Tarea 9. Configurar y verificar el servicio virtnetworkd

Antes de configurar el servicio virtnetworkd se debe iniciar el servicio libvirtd, que es el demonio de virtualización principal, para ello se utiliza el siguiente comando:

```bash
root@lq-d25:~# sudo systemctl enable --now libvirtd
Created symlink /etc/systemd/system/multi-user.target.wants/libvirtd.service → /usr/lib/systemd/system/libvirtd.service.
Created symlink /etc/systemd/system/sockets.target.wants/libvirtd.socket → /usr/lib/systemd/system/libvirtd.socket.
Created symlink /etc/systemd/system/sockets.target.wants/libvirtd-ro.socket → /usr/lib/systemd/system/libvirtd-ro.socket.
```

**Explicación del comando**:
- `systemctl`: Herramienta principal para gestionar servicios en sistemas que utilizan systemd
- `enable`: Configura el servicio para que se inicie automáticamente durante el arranque del sistema
- `--now`: Bandera que combina las acciones de `enable` y `start`, habilitando el servicio para arranques futuros e iniciándolo inmediatamente
- `libvirtd`: El demonio principal de libvirt, que proporciona una interfaz unificada para gestionar diferentes tecnologías de virtualización

La salida muestra la creación de tres enlaces simbólicos:
1. `libvirtd.service`: El servicio principal que gestiona las máquinas virtuales
2. `libvirtd.socket`: Socket para comunicación estándar con el demonio
3. `libvirtd-ro.socket`: Socket para comunicaciones de solo lectura (ro = read-only)

Estos enlaces se crean en los directorios correspondientes a los targets de systemd, garantizando que el servicio se inicie automáticamente en el nivel adecuado.

Para verificar que el servicio libvirtd se está ejecutando correctamente se utiliza el siguiente comando:

```bash
root@lq-d25:~# systemctl status libvirtd
● libvirtd.service - Virtualization daemon
     Loaded: loaded (/usr/lib/systemd/system/libvirtd.service; enabled; preset: disabled)
    Drop-In: /usr/lib/systemd/system/service.d
             └─10-timeout-abort.conf
     Active: active (running) since Fri 2025-02-07 20:28:27 WET; 11s ago
TriggeredBy: ● libvirtd-ro.socket
             ● libvirtd.socket
             ○ libvirtd-tls.socket
             ● libvirtd-admin.socket
             ○ libvirtd-tcp.socket
       Docs: man:libvirtd(8)
https://libvirt.org
   Main PID: 10869 (libvirtd)
      Tasks: 22 (limit: 32768)
     Memory: 18.0M
        CPU: 374ms
     CGroup: /system.slice/libvirtd.service
             ├─10869 /usr/sbin/libvirtd --timeout 120
             ├─10970 /usr/sbin/dnsmasq --conf-file=/var/lib/libvirt/dnsmasq/default.conf --leasefile-ro --dhcp-script=/usr/>
             └─10971 /usr/sbin/dnsmasq --conf-file=/var/lib/libvirt/dnsmasq/default.conf --leasefile-ro --dhcp-script=/usr/>
 
feb 07 20:28:27 lq-d25.vpc.com systemd[1]: Started libvirtd.service - Virtualization daemon.
feb 07 20:28:27 lq-d25.vpc.com dnsmasq[10970]: started, version 2.90 cachesize 150
feb 07 20:28:27 lq-d25.vpc.com dnsmasq[10970]: compile time options: IPv6 GNU-getopt DBus no-UBus i18n IDN2 DHCP DHCPv6 no->
feb 07 20:28:27 lq-d25.vpc.com dnsmasq-dhcp[10970]: DHCP, IP range 192.168.122.2 -- 192.168.122.254, lease time 1h
feb 07 20:28:27 lq-d25.vpc.com dnsmasq-dhcp[10970]: DHCP, sockets bound exclusively to interface virbr0
feb 07 20:28:27 lq-d25.vpc.com dnsmasq[10970]: reading /etc/resolv.conf
feb 07 20:28:27 lq-d25.vpc.com dnsmasq[10970]: using nameserver 127.0.0.53#53
feb 07 20:28:27 lq-d25.vpc.com dnsmasq[10970]: read /etc/hosts - 8 names
feb 07 20:28:27 lq-d25.vpc.com dnsmasq[10970]: read /var/lib/libvirt/dnsmasq/default.addnhosts - 0 names
feb 07 20:28:27 lq-d25.vpc.com dnsmasq-dhcp[10970]: read /var/lib/libvirt/dnsmasq/default.hostsfile
```

**Explicación del comando**:
- `systemctl status libvirtd`: Muestra el estado detallado del servicio libvirtd
- La salida proporciona información completa sobre:
  - Estado actual: `active (running)` indica que el servicio está ejecutándose correctamente
  - Ubicación del archivo de servicio y si está habilitado para inicio automático
  - Sockets relacionados que pueden activar el servicio (TrigeredBy)
  - PID del proceso principal y estadísticas de uso de recursos
  - Procesos hijos, incluyendo dnsmasq para servicios DHCP y DNS
  - Últimos eventos relevantes del servicio

Esta información es especialmente útil para diagnosticar problemas, ya que muestra tanto la configuración como el estado actual de ejecución y los mensajes recientes del servicio.

A continuación, para verificar que el servicio libvirtd está funcionando correctamente y que no hay máquinas virtuales en ejecución, se utiliza el siguiente comando:

```bash
root@lq-d25:~# sudo virsh list --all
Id   Nombre   Estado
-----------------------
```

**Explicación del comando**:
- `virsh`: Interfaz de línea de comandos para gestionar la virtualización mediante libvirt
- `list`: Subcomando que muestra las máquinas virtuales definidas
- `--all`: Opción que incluye todas las máquinas virtuales, tanto las activas como las inactivas

Este comando proporciona una vista rápida de todas las máquinas virtuales configuradas en el sistema. La salida vacía indica que aún no se ha definido ninguna VM, lo que es normal en un sistema recién configurado.

Para configurar el sistema anfitrión para que el servicio virtnetworkd se inicie durante el arranque, se utiliza la siguiente orden:

```bash
root@lq-d25:~# systemctl enable --now virtnetworkd
Created symlink /etc/systemd/system/multi-user.target.wants/virtnetworkd.service → /usr/lib/systemd/system/virtnetworkd.service.
```

**Explicación del comando**:
- `systemctl enable --now virtnetworkd`: Habilita e inicia el servicio virtnetworkd
- `virtnetworkd`: Componente de libvirt especializado en la gestión de redes virtuales
  - Controla las interfaces virtuales
  - Gestiona los puentes de red
  - Proporciona servicios DHCP y DNS para las redes virtuales
  - Administra las reglas de NAT y firewall necesarias para la conectividad

A diferencia del servicio monolítico anterior, libvirt ahora utiliza un enfoque modular donde diferentes componentes se ejecutan como servicios separados: virtnetworkd para redes, virtqemud para QEMU, virtstoraged para almacenamiento, etc. Este diseño mejora la seguridad y el rendimiento.

Una vez ejecutado el comando, el servicio virtnetworkd estará habilitado e iniciado. 

Para verificar que el servicio se está ejecutando correctamente, se puede utilizar el siguiente comando:

```bash
root@lq-d25:~# systemctl status virtnetworkd
● virtnetworkd.service - Virtualization network daemon
     Loaded: loaded (/usr/lib/systemd/system/virtnetworkd.service; enabled; preset: disabled)
    Drop-In: /usr/lib/systemd/system/service.d
             └─10-timeout-abort.conf
     Active: active (running) since Fri 2025-02-07 20:36:27 WET; 10s ago
TriggeredBy: ● virtnetworkd-admin.socket
             ● virtnetworkd.socket
             ● virtnetworkd-ro.socket
       Docs: man:virtnetworkd(8)
https://libvirt.org
   Main PID: 11524 (virtnetworkd)
      Tasks: 19 (limit: 76221)
     Memory: 3.9M
        CPU: 157ms
     CGroup: /system.slice/virtnetworkd.service
             └─11524 /usr/sbin/virtnetworkd --timeout 120
 
feb 07 20:36:27 lq-d25.vpc.com systemd[1]: Starting virtnetworkd.service - Virtualization network daemon...
feb 07 20:36:27 lq-d25.vpc.com systemd[1]: Started virtnetworkd.service - Virtualization network daemon.
```

**Explicación del comando**:
- Similar al comando anterior para libvirtd, pero específico para el servicio de redes virtuales
- La salida confirma que el servicio:
  - Está cargado y habilitado para inicio automático
  - Se encuentra activo y en ejecución
  - Usa aproximadamente 3.9 MB de memoria
  - Está vinculado a varios sockets que pueden activarlo

La información de estado `active (running)` confirma que el servicio está funcionando correctamente.

Ahora, para verificar que los módulos del kernel kvm están cargados, utilizamos el siguiente comando:

```bash
root@lq-d25:~# lsmod | grep kvm
kvm_amd               217088  0
kvm                  1441792  1 kvm_amd
ccp                   180224  1 kvm_amd
```

**Explicación del comando**:
- `lsmod`: Muestra los módulos del kernel actualmente cargados
- `| grep kvm`: Filtra la salida para mostrar solo los módulos relacionados con KVM

La salida muestra tres módulos relacionados con la virtualización:
- `kvm_amd`: Módulo específico para procesadores AMD (existiría `kvm_intel` en sistemas con procesadores Intel)
- `kvm`: Módulo principal que implementa la infraestructura de virtualización
- `ccp`: Crypto Co-Processor, un módulo relacionado con funciones criptográficas de AMD

El número después del tamaño del módulo (`2` para `kvm`) indica cuántos otros módulos dependen de él. En este caso, `kvm_amd` depende de `kvm`, lo que muestra la relación jerárquica entre los módulos.

Finalmente, para comprobar que la configuración de SELinux permite que el entorno de virtualización utilice el servicio NFS, se ejecuta el siguiente comando:

```bash
root@lq-d25:~# getsebool virt_use_nfs
virt_use_nfs --> on
```

**Explicación del comando**:
- `getsebool`: Herramienta que consulta la configuración actual de las políticas booleanas de SELinux
- `virt_use_nfs`: Política específica que controla si las máquinas virtuales pueden acceder a recursos compartidos mediante NFS

La salida `on` indica que la política está habilitada, lo que permite que los procesos de virtualización accedan a sistemas de archivos NFS. Esto es importante para:
- Almacenar imágenes de máquinas virtuales en servidores NFS
- Permitir que las máquinas virtuales accedan a recursos compartidos en red
- Utilizar almacenamiento compartido entre diferentes hosts de virtualización

Si esta política estuviera desactivada (`off`), SELinux bloquearía estos accesos incluso si el resto de la configuración del sistema lo permitiera.

### Fase 4. Creación de una máquina virtual

#### Tarea 10. Crear una máquina virtual

Para crear una máquina virtual, primero se debe montar el directorio que contiene la imagen ISO de Fedora Server 41 a través de NFS:

```bash
root@lq-d25:~# sudo mount -t nfs 10.22.146.216:/imagenes/fedora/41/isos/x86_64 /mnt
Created symlink /run/systemd/system/remote-fs.target.wants/rpc-statd.service → /usr/lib/systemd/system/rpc-statd.service.
```

**Explicación del comando**:
- `mount`: Comando para montar sistemas de archivos
- `-t nfs`: Especifica el tipo de sistema de archivos como NFS (Network File System)
- `10.22.146.216:/imagenes/fedora/41/isos/x86_64`: La dirección del servidor NFS y la ruta compartida
  - `10.22.146.216`: Dirección IP del servidor NFS
  - `/imagenes/fedora/41/isos/x86_64`: Ruta al directorio compartido que contiene las imágenes ISO
- `/mnt`: Punto de montaje local donde será accesible el contenido del directorio remoto

La salida muestra la creación de un enlace simbólico para el servicio `rpc-statd`, que es necesario para el funcionamiento de NFS. Este servicio ayuda a recuperar conexiones interrumpidas en caso de que el servidor NFS se reinicie.

Luego, se copia la imagen ISO a un directorio local, por ejemplo:

```bash
root@lq-d25:/mnt# sudo mkdir -p /ISO
root@lq-d25:/mnt# sudo cp /mnt/Fedora-Server-netinst-x86_64-41-1.4.iso /ISO/
```

**Explicación de los comandos**:
- `mkdir -p /ISO`: Crea el directorio /ISO (la opción -p crea directorios padres si es necesario)
- `cp /mnt/Fedora-Server-netinst-x86_64-41-1.4.iso /ISO/`: Copia la imagen ISO al directorio local
  - `Fedora-Server-netinst-x86_64-41-1.4.iso`: Imagen de instalación por red (netinst) de Fedora Server 41
  - Este tipo de imagen contiene solo los componentes mínimos necesarios para iniciar la instalación, descargando el resto de paquetes desde Internet durante el proceso

Copiar la imagen ISO localmente proporciona varias ventajas:
- Mayor velocidad de instalación (acceso local vs. red)
- Independencia de la disponibilidad del servidor NFS
- Posibilidad de reutilizar la imagen para múltiples instalaciones

Después de copiar la imagen, se desmonta el directorio /mnt:

```bash
root@lq-d25:/# sudo umount /mnt
```

**Explicación del comando**:
- `umount`: Comando para desmontar sistemas de archivos
- `/mnt`: El punto de montaje que se va a desmontar

Es una buena práctica desmontar sistemas de archivos en red cuando ya no son necesarios para:
- Liberar recursos de red
- Evitar posibles problemas de consistencia de datos
- Eliminar dependencias de servicios externos

A continuación, se utiliza la herramienta gráfica virt-manager para crear la máquina virtual. Se deben proporcionar los siguientes parámetros:
1. Nombre de la máquina virtual: mvp1
2. Medio de instalación: Imagen ISO local 
 
Ilustración 1. Herramienta virt-manager. Configuración del medio de instalación del sistema operativo
3. Cantidad de memoria: 2GB
4. Número de procesadores: 1
5. Disco de la máquina virtual: 10GB
6. Interfaz de red: 1 interfaz en modo NAT

Este proceso a través de la interfaz gráfica es equivalente a ejecutar un comando de línea como:

```bash
virt-install --name mvp1 --memory 2048 --vcpus 1 --disk size=10 \
  --cdrom /ISO/Fedora-Server-netinst-x86_64-41-1.4.iso \
  --os-variant fedora41 --network network=default
```

Donde:
- `--name mvp1`: Asigna el nombre "mvp1" a la máquina virtual
- `--memory 2048`: Asigna 2GB de RAM (2048MB)
- `--vcpus 1`: Configura un procesador virtual
- `--disk size=10`: Crea un disco virtual de 10GB
- `--cdrom`: Especifica la ubicación de la imagen ISO de instalación
- `--os-variant`: Optimiza la configuración según el sistema operativo a instalar
- `--network network=default`: Configura una interfaz de red conectada a la red "default" (NAT)

Una vez creada la máquina virtual, se inicia la instalación del sistema operativo Fedora Server 41.  Se debe realizar una instalación mínima y habilitar la cuenta de administración root con acceso SSH. 
 
Ilustración 2. Herramienta virt-manager. Configuración del usuario root

Una vez terminada la instalación, se comprueba la conexión SSH a nuestra máquina virtual:

```bash
root@lq-d25:/# ssh root@192.168.122.123
The authenticity of host '192.168.122.123 (192.168.122.123)' can't be established.
ED25519 key fingerprint is SHA256:gRFGvZlUIel5P1EJEdiEEgvXQ48k7iMy9Oz5SDPY2h4.
This key is not known by any other names.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added '192.168.122.123' (ED25519) to the list of known hosts.
root@192.168.122.123's password: 
Web console: https://localhost:9090/ or https://192.168.122.123:9090/

Last login: Fri Feb 14 19:37:07 2025
root@localhost:~# ls
anaconda-ks.cfg
```

**Explicación del comando**:
- `ssh root@192.168.122.123`: Inicia una conexión SSH como usuario root a la máquina virtual
  - `192.168.122.123`: Dirección IP asignada a la máquina virtual en la red NAT

El proceso de primera conexión SSH incluye:

1. Verificación de la autenticidad del host (al ser la primera conexión, la clave no está en known_hosts)
2. Presentación de la huella (fingerprint) de la clave del servidor para verificación manual
3. Solicitud de confirmación para continuar la conexión
4. Adición de la clave al archivo de hosts conocidos para futuras conexiones
5. Solicitud de contraseña para la autenticación
6. Información sobre la consola web disponible en la VM
7. Información sobre el último inicio de sesión (si lo hubiera)

Tras iniciar sesión, el comando `ls` muestra un archivo `anaconda-ks.cfg`, que es el archivo de kickstart generado automáticamente durante la instalación. Este archivo podría utilizarse para automatizar futuras instalaciones con la misma configuración.

Una vez finalizada la instalación del sistema operativo en la máquina virtual, se deben realizar los siguientes pasos de configuración:

Instalar el servicio qemu-gest-agent

El servicio qemu-guest-agent se utiliza para mejorar la integración entre la máquina virtual y el sistema anfitrión. Permite realizar tareas como sincronizar la hora, obtener información del sistema y ejecutar comandos en la máquina virtual desde el anfitrión. Para instalar este servicio se ejecuta la siguiente orden:

```bash
root@localhost:~# sudo dnf install -y qemu-guest-agent
Actualizando y cargando repositorios:
Repositorios cargados.
Package                  Arch    Version                  Repository        Size
Installing:
qemu-guest-agent        x86_64  2:9.1.2-3.fc41           updates      962.9 KiB



Transaction Summary:
Installing:         1 package



El tamaño total de paquetes entrantes es 313 KiB. Se necesita descargar 313 KiB.
Después de esta operación, 963 KiB extra serán utilizados (instalar 963 KiB, eliminar 0 B).
[1/1] qemu-guest-agent-2:9.1.2-3.fc41.x 100% | 569.4 KiB/s | 313.2 KiB |  00m01s
--------------------------------------------------------------------------------
[1/1] Total                             100% | 375.9 KiB/s | 313.2 KiB |  00m01s
Ejecutando transacción
[1/3] Verificar archivos de paquete     100% | 333.0   B/s |   1.0   B |  00m00s
[2/3] Preparar transacción             100% |  18.0   B/s |   1.0   B |  00m00s
[3/3] Instalando qemu-guest-agent-2:9.1 100% |   1.2 MiB/s | 965.6 KiB |  00m01s
>>> Ejecutando post-install scriptlet: qemu-guest-agent-2:9.1.2-3.fc41.x86_64
>>> Finalizado post-install scriptlet: qemu-guest-agent-2:9.1.2-3.fc41.x86_64
>>> Salida del scriptlet:
>>> Created symlink '/etc/systemd/system/dev-virtio\x2dports-org.qemu.guest_agen
>>> Unit /usr/lib/systemd/system/qemu-guest-agent.service is added as a dependen
>>> 
¡Completado!
```

Este comando instala el paquete qemu-guest-agent utilizando el gestor de paquetes dnf. 

Habilitar e iniciar el servicio qemu-guest-agent

Una vez instalado el paquete, se debe habilitar e inicializar el servicio qemu-guest-agent para que se ejecute en el arranque del sistema. Para ello, se utiliza el siguiente comando:

```bash
root@localhost:~# sudo systemctl enable --now qemu-guest-agent
Unit /usr/lib/systemd/system/qemu-guest-agent.service is added as a dependency to a non-existent unit dev-virtio\x2dports-org.qemu.guest_agent.0.device.

Este comando habilita e inicia el servicio qemu-guest-agent. La salida del comando indica que el servicio se ha añadido como dependencia a una unidad no existente, esto se debe a que el servicio qemu-guest-agent depende de la disponibilidad de dispositivos virtio, que se crean dinámicamente cuando la máquina virtual se inicia. 

Establecer el nombre del Sistema

Para establecer el nombre del sistema en la máquina virtual como mvp1.vpd.com, se utiliza el siguiente comando:

```bash
root@localhost:~# sudo hostnamectl set-hostname mvp1.vpd.com

Este comando establece el nombre de host estático de la máquina virtual como mvp1.vpd.com.

Para verificar que el nombre del sistema se ha establecido correctamente:

```bash
root@localhost:~# hostnamectl
     Static hostname: mvp1.vpd.com
           Icon name: computer-vm
             Chassis: vm 🖴
          Machine ID: 6d2630bf3d2046a589c37eaa7313994b
             Boot ID: 4ee2bc753f724da7a1b60f1c189b497f
        Product UUID: 77722a52-4d29-4f91-a688-453a1fbfad52
      Virtualization: kvm
    Operating System: Fedora Linux 41 (Server Edition)    
         CPE OS Name: cpe:/o:fedoraproject:fedora:41
      OS Support End: Mon 2025-12-15
OS Support Remaining: 9month 4w 1d
              Kernel: Linux 6.12.11-200.fc41.x86_64
        Architecture: x86-64
     Hardware Vendor: QEMU
      Hardware Model: Standard PC _Q35 + ICH9, 2009_
    Firmware Version: 1.16.3-1.fc39
       Firmware Date: Tue 2014-04-01
        Firmware Age: 10y 10month 2w 1d      
```

Configurar el acceso SSH con clave público/privada

Para permitir el acceso SSH desde el sistema anfitrión a la máquina virtual utilizando autenticación con clave pública/privada, se siguen estos pasos:

Generar un par de claves SSH en el sistema anfitrión:

```bash
root@lq-d25:/# ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa
Generating public/private rsa key pair.
/root/.ssh/id_rsa already exists.
Overwrite (y/n)? y
Enter passphrase (empty for no passphrase): 
Enter same passphrase again: 
Your identification has been saved in /root/.ssh/id_rsa
Your public key has been saved in /root/.ssh/id_rsa.pub
The key fingerprint is:
SHA256:4zKf+4PBMp2TVNCOTBiZNHFCKfjLvniX91nfaJ7yvLs root@lq-d25.vpc.com
The key's randomart image is:
+---[RSA 4096]----+
|   . oBBoo       |
|  . . =+. o      |
|   . . o +       |
|    .   + .      |
|   . . +So       |
|    o o.B.       |
|   .  o+.+  .    |
|   .o o+o..o.o.+ |
|  ...o .+++. =E+.|
+----[SHA256]-----+
```

El comando ssh-keygen genera un par de claves SSH. 

A continuación, se copia la clave pública al sistema de la máquina virtual:

```bash
root@lq-d25:/# ssh-copy-id root@192.168.122.123
/usr/bin/ssh-copy-id: INFO: attempting to log in with the new key(s), to filter out any that are already installed
/usr/bin/ssh-copy-id: INFO: 1 key(s) remain to be installed -- if you are prompted now it is to install the new keys
root@192.168.122.123's password: 

Number of key(s) added: 1

Now try logging into the machine, with:   "ssh 'root@192.168.122.123'"
and check to make sure that only the key(s) you wanted were added. 
```

El comando ssh-copy-id copia la clave pública al archivo authorized_keys del usuario root en la máquina virtual. 

Con eso, se completa la configuración del acceso SSH con la clave pública/privada. Ahora se puede iniciar sesión en la máquina virtual desde el sistema anfitrión utilizando el siguiente comando sin necesidad de introducir la contraseña:

```bash
root@lq-d25:/# ssh root@192.168.122.123
Web console: https://localhost:9090/ or https://192.168.122.123:9090/
```

Configurar el Sistema anfitrión para poder realizar conexiones TCP/IP a la máquina virtual utilizando el identificador FQDN de esta

Para acceder a la máquina virtual mediante SSH utilizando su nombre de dominio mvp1.vpd.com, primero se debe obtener la dirección IP de la máquina virtual:

```bash
root@mvp1:~# ip a | grep 'inet' | grep -v '127.0.0.1'
    inet6 ::1/128 scope host noprefixroute 
    inet 192.168.122.123/24 brd 192.168.122.255 scope global dynamic noprefixroute enp1s0
    inet6 fe80::5054:ff:fe33:86f/64 scope link noprefixroute
```

A continuación, se debe editar el archivo /etc/hosts en el sistema anfitrión y añadir una línea que asocie la dirección IP de la máquina virtual con su nombre de dominio. Para ello se utiliza un editor de texto como nano:

```bash
root@lq-d25:/# sudo nano etc/hosts 
```

Se añade la siguiente línea al final del archivo:

```bash
192.168.122.123  mvp1.vpd.com   
```

Donde 192.168.122.123 es la dirección IP de la máquina virtual obtenida anteriormente. 

Después de guardar los cambios en el archivo se puede comprobar la conexión con la máquina virtual utilizando el comando ping:

```bash
root@lq-d25:/# ping -c 4 mvp1.vpd.com
PING mvp1.vpd.com (192.168.122.123) 56(84) bytes of data.
64 bytes from mvp1.vpd.com (192.168.122.123): icmp_seq=1 ttl=64 time=0.309 ms
64 bytes from mvp1.vpd.com (192.168.122.123): icmp_seq=2 ttl=64 time=0.399 ms
64 bytes from mvp1.vpd.com (192.168.122.123): icmp_seq=3 ttl=64 time=0.227 ms
64 bytes from mvp1.vpd.com (192.168.122.123): icmp_seq=4 ttl=64 time=0.394 ms

--- mvp1.vpd.com ping statistics ---
4 packets transmitted, 4 received, 0% packet loss, time 3059ms
rtt min/avg/max/mdev = 0.227/0.332/0.399/0.070 ms
```

Finalmente, se puede iniciar sesión en la máquina virtual mediante SSH utilizando su nombre de dominio:

```bash
root@lq-d25:/# ssh root@mvp1.vpd.com
The authenticity of host 'mvp1.vpd.com (192.168.122.123)' can't be established.
ED25519 key fingerprint is SHA256:gRFGvZlUIel5P1EJEdiEEgvXQ48k7iMy9Oz5SDPY2h4.
This host key is known by the following other names/addresses:
    ~/.ssh/known_hosts:1: 192.168.122.123
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added 'mvp1.vpd.com' (ED25519) to the list of known hosts.
Web console: https://localhost:9090/ or https://192.168.122.123:9090/

Last login: Fri Feb 14 19:54:07 2025 from 192.168.122.1
```

Se inicia sesión correctamente en la máquina virtual sin necesidad de introducir la contraseña, lo que indica que el acceso SSH con clave pública/privada está configurado correctamente.

## Pruebas y Validación

Una vez finalizadas las tareas, se procede a la verificación de la instalación y configuración del sistema anfitrión y la máquina virtual:

Verificar el modo de ejecución de SELinux

Se utiliza el comando getenforce para verificar que SELinux se está ejecutando en modo "enforcing".

```bash
root@lq-d25:/# getenforce
Enforcing
```

**Explicación del comando**:
- `getenforce`: Herramienta específica para consultar el modo de ejecución actual de SELinux
- A diferencia de `sestatus` que proporciona información completa, este comando muestra solo el modo actual de funcionamiento
- Posibles valores de salida:
  - `Enforcing`: SELinux está aplicando las políticas de seguridad (máxima protección)
  - `Permissive`: SELinux registra las violaciones de políticas pero no las bloquea (modo de prueba)
  - `Disabled`: SELinux está completamente desactivado (sin protección)

El modo `Enforcing` es fundamental en entornos de virtualización para garantizar el aislamiento entre máquinas virtuales y el sistema anfitrión, previniendo posibles escaladas de privilegios.

Verificar el estado del servicio virtnetworkd

Se utiliza el comando:

```bash
root@lq-d25:/# systemctl status virtnetworkd
● virtnetworkd.service - Virtualization network daemon
     Loaded: loaded (/usr/lib/systemd/system/virtnetworkd.service; enabled; pre>
    Drop-In: /usr/lib/systemd/system/service.d
             └─10-timeout-abort.conf
     Active: active (running) since Fri 2025-02-14 19:18:01 WET; 1h 9min ago
TriggeredBy: ● virtnetworkd-ro.socket
             ● virtnetworkd-admin.socket
             ● virtnetworkd.socket
       Docs: man:virtnetworkd(8)
             https://libvirt.org
   Main PID: 5729 (virtnetworkd)
      Tasks: 21 (limit: 76221)
     Memory: 12.2M
        CPU: 648ms
     CGroup: /system.slice/virtnetworkd.service
             ├─1251 /usr/sbin/dnsmasq --conf-file=/var/lib/libvirt/dnsmasq/defa>
             ├─1252 /usr/sbin/dnsmasq --conf-file=/var/lib/libvirt/dnsmasq/defa>
             └─5729 /usr/sbin/virtnetworkd --timeout 120
```

**Explicación del comando**:
- `systemctl status virtnetworkd`: Consulta el estado detallado del servicio de red de virtualización
- La información mostrada incluye:
  - Estado del servicio: `active (running)` indica funcionamiento correcto
  - Tiempo de ejecución desde el último inicio: `since Fri 2025-02-14 19:18:01`
  - Sockets que pueden activar el servicio: `virtnetworkd-ro.socket`, etc.
  - Utilización de recursos: memoria, CPU y número de tareas
  - Procesos asociados: proceso principal y subprocesos como dnsmasq

El servicio `virtnetworkd` es esencial porque gestiona las interfaces de red virtuales que permiten la comunicación entre máquinas virtuales y con el exterior. También proporciona servicios DHCP y DNS a las VMs.

Verificar la carga de los módulos del kernel kvm y kvm_amd

```bash
root@lq-d25:/# lsmod | grep kvm
kvm_amd               217088  3
kvm                  1441792  2 kvm_amd
ccp                   180224  1 kvm_amd
```

Verificar la configuración de la máquina virtual mvp1

Se utiliza el siguiente comando:

```bash
root@lq-d25:/# virsh dominfo mvp1
Id:             -
Nombre:         mvp1
UUID:           77722a52-4d29-4f91-a688-453a1fbfad52
Tipo de sistema operatuvo: hvm
Estado:         apagado
CPU(s):         1
Memoria máxima: 2097152 KiB
Memoria utilizada: 2097152 KiB
Persistente:    si
Autoinicio:     desactivar
Guardar administrado: no
Modelo de seguridad: selinux
DOI de seguridad: 0
```

**Explicación del comando**:
- `virsh dominfo`: Muestra información detallada sobre un dominio (máquina virtual) específico
  - `domain` en la terminología de libvirt se refiere a una instancia de máquina virtual
- `mvp1`: Nombre del dominio sobre el que se solicita información

La salida proporciona datos esenciales sobre la configuración de la VM:
- `Id`: El identificador numérico del dominio (- indica que está apagado)
- `UUID`: Identificador único universal de la máquina virtual
- `Tipo de sistema operativo`: `hvm` indica virtualización completa asistida por hardware
- `Estado`: Situación actual de la VM (apagado, en ejecución, pausado, etc.)
- `CPU(s)`: Número de CPUs virtuales asignadas (1 en este caso)
- `Memoria máxima/utilizada`: Memoria RAM asignada (2GB aproximadamente)
- `Persistente`: Indica si la definición de la VM se mantiene tras reiniciar el host
- `Modelo de seguridad`: Mecanismo de aislamiento utilizado (SELinux en este caso)

Esta información es crítica para verificar que la máquina virtual se ha configurado correctamente con los parámetros especificados durante la creación.

Verificar la interfaz de red de la máquina virtual mvp1

Se utiliza el comando:

```bash
root@lq-d25:/# virsh domiflist mvp1
Interfaz   Tipo      Fuente    Modelo   MAC
------------------------------------------------------------
-          network   default   virtio   52:54:00:33:08:6f
```

**Explicación del comando**:
- `virsh domiflist`: Lista las interfaces de red conectadas a un dominio específico
- `mvp1`: Nombre del dominio cuyas interfaces se desean listar

La salida muestra información detallada de la interfaz de red:
- `Tipo`: `network` indica que está conectada a una red virtual definida en libvirt
- `Fuente`: `default` es el nombre de la red virtual (típicamente configurada con NAT)
- `Modelo`: `virtio` indica que utiliza el controlador paravirtualizado para mejor rendimiento
- `MAC`: La dirección MAC asignada a la interfaz virtual

El uso de `virtio` como modelo de dispositivo es importante porque proporciona mejor rendimiento que los dispositivos emulados, ya que la VM utiliza controladores específicamente diseñados para entornos virtualizados.

Verificar la conectividad de la máquina virtual mvp1

Se utiliza el comando ping para verificar la conectividad de la máquina virtual mvp1 con el host anfitrión y con el exterior.

Conectividad con el host anfitrión: Se ejecuta el siguiente comando desde el sistema anfitrión.

```bash
root@lq-d25:/# ping -c 4 mvp1.vpd.com
PING mvp1.vpd.com (192.168.122.123) 56(84) bytes of data.
64 bytes from mvp1.vpd.com (192.168.122.123): icmp_seq=1 ttl=64 time=0.252 ms
64 bytes from mvp1.vpd.com (192.168.122.123): icmp_seq=2 ttl=64 time=0.385 ms
64 bytes from mvp1.vpd.com (192.168.122.123): icmp_seq=3 ttl=64 time=0.367 ms
^C
--- mvp1.vpd.com ping statistics ---
3 packets transmitted, 3 received, 0% packet loss, time 2051ms
rtt min/avg/max/mdev = 0.252/0.334/0.385/0.058 ms
```

**Explicación del comando**:
- `ping`: Herramienta básica para verificar la conectividad IP mediante paquetes ICMP Echo
- `-c 4`: Limita el envío a 4 paquetes (el comando se interrumpió manualmente con Ctrl+C después de 3)
- `mvp1.vpd.com`: El nombre de dominio de la máquina virtual (resuelto a través del archivo hosts)

La salida muestra:
- La resolución correcta del nombre `mvp1.vpd.com` a la IP `192.168.122.123`
- Tiempos de respuesta muy bajos (menos de 1ms), típicos de conexiones locales virtualizadas
- 0% de pérdida de paquetes, indicando conectividad estable

Este test valida tanto la configuración del nombre en `/etc/hosts` como la conectividad IP básica entre el host y la máquina virtual.

Conectividad con el exterior: Se ejecuta el siguiente comando desde la máquina virtual.

```bash
root@mvp1:~# ping -4 8.8.8.8
PING 8.8.8.8 (8.8.8.8) 56(84) bytes of data.
64 bytes from 8.8.8.8: icmp_seq=1 ttl=114 time=30.0 ms
64 bytes from 8.8.8.8: icmp_seq=2 ttl=114 time=30.3 ms

^C--- 8.8.8.8 ping statistics ---
2 packets transmitted, 2 received, 0% packet loss, time 1002ms
rtt min/avg/max/mdev = 30.038/30.147/30.257/0.109 ms
```

**Explicación del comando**:
- `ping -4`: Realiza un ping utilizando específicamente el protocolo IPv4
- `8.8.8.8`: Dirección IP de uno de los servidores DNS públicos de Google, comúnmente usado para pruebas de conectividad a Internet

La salida muestra:
- Tiempos de respuesta de aproximadamente 30ms, típicos para conexiones a Internet
- 0% de pérdida de paquetes, indicando conectividad estable
- Un valor de TTL (Time To Live) de 114, que representa el número de saltos de red restantes

Esta prueba verifica que la configuración de NAT funciona correctamente, permitiendo que la máquina virtual acceda a Internet a través del host.

Verificar la instalación y el estado del agente qemu-guest-agent

```bash
root@mvp1:~# systemctl status qemu-guest-agent
● qemu-guest-agent.service - QEMU Guest Agent
     Loaded: loaded (/usr/lib/systemd/system/qemu-guest-agent.service; enabled;>
    Drop-In: /usr/lib/systemd/system/service.d
             └─10-timeout-abort.conf, 50-keep-warm.conf
     Active: active (running) since Fri 2025-02-14 20:36:53 WET; 2min 51s ago
Invocation: 55601c5735c74c248c7a6524e9b1e551
   Main PID: 857 (qemu-ga)
      Tasks: 2 (limit: 2307)
     Memory: 2.3M (peak: 2.6M)
        CPU: 5ms
     CGroup: /system.slice/qemu-guest-agent.service
             └─857 /usr/bin/qemu-ga --method=virtio-serial --path=/dev/virtio-p>
```

**Explicación del comando**:
- `systemctl status qemu-guest-agent`: Muestra el estado detallado del servicio qemu-guest-agent dentro de la máquina virtual
- Este agente facilita la comunicación entre el host y la máquina virtual para operaciones como:
  - Obtención de información de la VM (IP, hostname, usuarios conectados)
  - Ejecución de comandos desde el host en la VM
  - Sincronización de tiempo
  - Gestión de copias de seguridad (quiescing)
  - Apagado ordenado de la VM desde el host

La salida confirma que el servicio está activo (`active (running)`), usando aproximadamente 2.3MB de memoria y con un tiempo de CPU mínimo (5ms), lo que indica un funcionamiento eficiente.

Verificar el acceso SSH a la máquina virtual

```bash
root@lq-d25:/# ssh root@mvp1.vpd.com
Web console: https://mvp1.vpd.com:9090/ or https://192.168.122.123:9090/

Last login: Fri Feb 14 20:38:37 2025 from 192.168.122.1
```

**Explicación del comando**:
- `ssh root@mvp1.vpd.com`: Intenta establecer una conexión SSH como usuario root al host mvp1.vpd.com
- El acceso sin solicitud de contraseña demuestra que:
  1. La autenticación por clave pública está correctamente configurada
  2. El nombre de host se resuelve correctamente a la dirección IP de la VM
  3. El servidor SSH en la máquina virtual está operativo
  4. La red está correctamente configurada para permitir conexiones TCP en el puerto 22

Esta prueba final valida la integración completa de todos los componentes configurados: red virtual, resolución de nombres, autenticación SSH y configuración de la máquina virtual.

## Solución de Problemas Comunes

Durante la configuración de un entorno de virtualización KVM pueden surgir diferentes problemas. A continuación, se presentan algunas situaciones comunes y sus posibles soluciones:

### Problemas con la virtualización del procesador

**Problema**: El sistema indica que no soporta la virtualización por hardware.

**Solución**: 
1. Verificar que el procesador soporta virtualización con el comando `lscpu | grep Virtualization`
2. Si el procesador soporta virtualización pero no aparece habilitada, es posible que esté desactivada en la BIOS/UEFI. Entrar en la configuración de la BIOS/UEFI durante el arranque y activar las opciones de virtualización (VT-x para Intel o AMD-V para AMD).

### Problemas con SELinux

**Problema**: La máquina virtual no puede acceder a recursos compartidos.

**Solución**:
1. Verificar el estado de `virt_use_nfs` con `getsebool virt_use_nfs`
2. Si está desactivado, activarlo con `setsebool -P virt_use_nfs on`
3. Para compartir sistemas de archivos locales: `setsebool -P virt_use_samba on`

### Problemas de red

**Problema**: La máquina virtual no tiene conexión a Internet o al sistema anfitrión.

**Solución**:
1. Verificar que el servicio `virtnetworkd` está activo: `systemctl status virtnetworkd`
2. Comprobar la configuración de red en la máquina virtual con `virsh domiflist nombre_vm`
3. Verificar la configuración de IP con `ip addr show` dentro de la máquina virtual
4. Asegurarse de que el firewall no está bloqueando las conexiones: `firewall-cmd --list-all`
5. Si es necesario, permitir el tráfico de virtualización: `firewall-cmd --permanent --add-rich-rule='rule service name=libvirt accept'`

### Problemas con qemu-guest-agent

**Problema**: Error al iniciar qemu-guest-agent en la máquina virtual.

**Solución**:
1. Verificar que el paquete está correctamente instalado: `rpm -q qemu-guest-agent`
2. Comprobar que el canal virtio está habilitado en la configuración de la máquina virtual
3. Reiniciar el servicio: `systemctl restart qemu-guest-agent`
4. Si persiste el error, verificar los logs: `journalctl -u qemu-guest-agent`

### Problemas de rendimiento

**Problema**: La máquina virtual tiene un rendimiento lento.

**Solución**:
1. Verificar la asignación de recursos (CPU, memoria) con `virsh dominfo nombre_vm`
2. Ajustar la configuración según sea necesario con `virsh edit nombre_vm`
3. Comprobar que no hay procesos consumiendo excesivos recursos en el anfitrión con `top` o `htop`
4. Considerar el uso de dispositivos virtio para mejor rendimiento (especialmente para discos e interfaces de red)

## Conclusiones

En esta práctica se ha completado con éxito la instalación y configuración de un entorno de virtualización KVM en Fedora Linux. A continuación, se resumen los principales logros y conocimientos adquiridos:

1. **Configuración del sistema anfitrión**: Se configuró adecuadamente el sistema operativo base, asegurando que SELinux estuviera en modo enforcing para mantener la seguridad del sistema.

2. **Verificación de requisitos**: Se comprobó que el hardware del sistema cumplía con los requisitos necesarios para la virtualización, destacando la presencia de extensiones de virtualización en el procesador (AMD-V).

3. **Instalación de herramientas de virtualización**: Se instalaron correctamente los paquetes necesarios para KVM, tanto con interfaz gráfica como en modo headless.

4. **Creación de máquina virtual**: Se creó una máquina virtual con Fedora Server 41, configurando correctamente sus parámetros de red, acceso SSH y nombre de host.

5. **Configuración avanzada**: Se implementó la autenticación SSH por clave pública/privada y se configuró el sistema para poder acceder a la máquina virtual mediante su FQDN.

El entorno implementado proporciona una base sólida para desplegar distintos servicios virtualizados, aprovechando las capacidades de KVM y las herramientas de gestión proporcionadas por libvirt.

## Bibliografía

1. Documentación oficial de KVM: [https://www.linux-kvm.org/page/Documents](https://www.linux-kvm.org/page/Documents)

2. Documentación de Fedora sobre virtualización: [https://docs.fedoraproject.org/en-US/quick-docs/virtualization-getting-started/](https://docs.fedoraproject.org/en-US/quick-docs/virtualization-getting-started/)

3. Red Hat Documentation - Configuración y administración de la virtualización: [https://access.redhat.com/documentation/es-es/red_hat_enterprise_linux/9/html/configuring_and_managing_virtualization/index](https://access.redhat.com/documentation/es-es/red_hat_enterprise_linux/9/html/configuring_and_managing_virtualization/index)

4. Libvirt Wiki: [https://wiki.libvirt.org/](https://wiki.libvirt.org/)

5. SELinux Project Wiki: [https://selinuxproject.org/page/Main_Page](https://selinuxproject.org/page/Main_Page)
