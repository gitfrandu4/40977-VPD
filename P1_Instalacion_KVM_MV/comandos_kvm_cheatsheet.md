# Cheatsheet: Comandos KVM y Virtualización

## Configuración del Sistema Anfitrión

| Comando | Descripción |
|---------|-------------|
| `ip -4 addr show` | Muestra las interfaces de red y sus direcciones IPv4 |
| `sestatus` | Verifica el estado y modo de SELinux |
| `dnf groupinstall "base-x" -y` | Instala los componentes básicos del sistema X Window |
| `dnf install -y [paquetes]` | Instala paquetes específicos (gnome-shell, gnome-terminal, etc.) |
| `systemctl set-default graphical.target` | Configura el sistema para iniciar en modo gráfico |
| `systemctl start gdm` | Inicia el entorno gráfico sin reiniciar el sistema |
| `hostnamectl status` | Muestra información sobre el nombre del host |
| `hostnamectl set-hostname [nombre]` | Establece el nombre FQDN del host |

## Verificación de Requerimientos para Virtualización

| Comando | Descripción |
|---------|-------------|
| `lscpu \| grep Virtualization` | Verifica soporte de virtualización en el procesador |
| `grep -E 'svm\|vmx' /proc/cpuinfo` | Verifica extensiones de virtualización habilitadas (svm: AMD, vmx: Intel) |
| `lscpu \| grep "Socket(s):"` | Muestra el número de sockets del procesador |
| `lscpu \| grep "Core(s) per socket:"` | Muestra el número de núcleos por socket |
| `lscpu \| grep "Thread(s) per core:"` | Muestra el número de hilos por núcleo |
| `free -h` | Muestra información sobre la memoria en formato legible |
| `df -h` | Muestra información sobre el uso de disco |

## Instalación de KVM y Libvirt

| Comando | Descripción |
|---------|-------------|
| `dnf groupinstall "Virtualization" --with-optional -y` | Instala paquetes para virtualización con interfaz gráfica |
| `dnf groupinstall "Virtualization-headless" --with-optional -y` | Instala paquetes para virtualización sin interfaz gráfica |
| `virsh cpu-models x86_64` | Lista los modelos de CPU soportados por KVM |
| `systemctl enable --now libvirtd` | Habilita e inicia el servicio principal de libvirt |
| `systemctl status libvirtd` | Verifica el estado del servicio libvirtd |
| `virsh list --all` | Lista todas las máquinas virtuales (activas e inactivas) |
| `systemctl enable --now virtnetworkd` | Habilita e inicia el servicio de red de virtualización |
| `systemctl status virtnetworkd` | Verifica el estado del servicio de red virtual |
| `lsmod \| grep kvm` | Verifica que los módulos de KVM están cargados |
| `getsebool virt_use_nfs` | Verifica si SELinux permite a las VMs acceder a recursos NFS |

## Creación y Gestión de Máquinas Virtuales

| Comando | Descripción |
|---------|-------------|
| `mount -t nfs [servidor]:[ruta] [punto_montaje]` | Monta un directorio compartido NFS |
| `umount [punto_montaje]` | Desmonta un sistema de archivos |
| `virt-install --name [nombre] --memory [MB] --vcpus [núm] --disk size=[GB] --cdrom [ISO] --os-variant [variante] --network network=[red]` | Crea una nueva máquina virtual desde línea de comandos |
| `virsh dominfo [nombre_vm]` | Muestra información detallada de una VM |
| `virsh domiflist [nombre_vm]` | Lista las interfaces de red de una VM |
| `virsh start [nombre_vm]` | Inicia una máquina virtual |
| `virsh shutdown [nombre_vm]` | Apaga ordenadamente una máquina virtual |
| `virsh destroy [nombre_vm]` | Fuerza el apagado de una máquina virtual |
| `virsh undefine [nombre_vm]` | Elimina la definición de una máquina virtual |
| `virsh edit [nombre_vm]` | Edita la configuración XML de una máquina virtual |

## Comandos de Red y Conectividad

| Comando | Descripción |
|---------|-------------|
| `ssh [usuario]@[host]` | Inicia una sesión SSH en un host remoto |
| `ssh-copy-id [usuario]@[host]` | Copia la clave pública SSH al host remoto |
| `ping -c [núm] [host]` | Envía [núm] paquetes ICMP para verificar conectividad |
| `ping -4 [dirección]` | Realiza ping usando específicamente el protocolo IPv4 |
| `virsh net-list --all` | Lista todas las redes virtuales definidas |
| `virsh net-start [nombre_red]` | Inicia una red virtual |
| `virsh net-destroy [nombre_red]` | Detiene una red virtual |

## Pruebas y Validación

| Comando | Descripción |
|---------|-------------|
| `getenforce` | Muestra el modo actual de SELinux (enforcing, permissive, disabled) |
| `systemctl status qemu-guest-agent` | Verifica el estado del agente QEMU dentro de la máquina virtual |
| `virsh capabilities` | Muestra las capacidades de virtualización del host |
| `virsh nodeinfo` | Muestra información sobre el nodo host |
| `virsh domstate [nombre_vm]` | Muestra el estado actual de una máquina virtual |

## Comandos de Solución de Problemas

| Comando | Descripción |
|---------|-------------|
| `dmesg \| grep kvm` | Muestra mensajes del kernel relacionados con KVM |
| `journalctl -u libvirtd` | Muestra los logs del servicio libvirtd |
| `journalctl -u virtnetworkd` | Muestra los logs del servicio virtnetworkd |
| `setsebool -P virt_use_nfs on` | Permite que las VMs accedan a recursos NFS (SELinux) |
| `firewall-cmd --list-all` | Muestra la configuración actual del firewall |
| `firewall-cmd --permanent --add-rich-rule='rule service name=libvirt accept'` | Permite el tráfico de virtualización en el firewall |
| `virsh dump [nombre_vm] [archivo]` | Genera un volcado de memoria de una VM para diagnóstico |
| `virt-xml-validate [archivo_xml]` | Valida un archivo XML de definición de VM |

## Gestión de Almacenamiento

| Comando | Descripción |
|---------|-------------|
| `virsh pool-list --all` | Lista todos los pools de almacenamiento |
| `virsh vol-list [pool]` | Lista los volúmenes en un pool de almacenamiento |
| `virsh vol-create-as [pool] [nombre] [tamaño]` | Crea un volumen en un pool de almacenamiento |
| `virsh vol-delete [volumen] --pool [pool]` | Elimina un volumen |
| `qemu-img info [imagen]` | Muestra información de una imagen de disco |
| `qemu-img convert -f [formato_origen] -O [formato_destino] [imagen_origen] [imagen_destino]` | Convierte imágenes entre formatos (qcow2, raw, etc.) |

## Comandos Avanzados de Administración

| Comando | Descripción |
|---------|-------------|
| `virsh migrate [nombre_vm] [URI_destino]` | Migra una VM a otro host |
| `virsh snapshot-create-as [nombre_vm] [nombre_snapshot] --description [desc]` | Crea una instantánea de una VM |
| `virsh snapshot-list [nombre_vm]` | Lista las instantáneas de una VM |
| `virsh snapshot-revert [nombre_vm] [nombre_snapshot]` | Revierte una VM a una instantánea previa |
| `virsh autostart [nombre_vm]` | Configura una VM para iniciar automáticamente |
| `virsh autostart --disable [nombre_vm]` | Desactiva el inicio automático de una VM |

---

Este cheatsheet incluye los comandos más relevantes para administrar un entorno de virtualización KVM. Para más detalles sobre cada comando, consultar su página del manual (`man [comando]`) o la documentación oficial de libvirt. 
