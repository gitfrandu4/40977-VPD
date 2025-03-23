# Práctica 3

## Tarea 1

Paso 1 clonamos

```bash
root@lq-d25:~# virt-clone --original mvp1 --name mvp3 --file /var/lib/libvirt/images/mvp3.qcow2 --mac=00:16:3e:37:a0:03
Allocating 'mvp3.qcow2'                                     | 1.8 GB  00:05 ...

El clon 'mvp3' ha sido creado exitosamente.
```

Listamos nosequé disponibles

```
root@lq-d25:~# lsblk
NAME    MAJ:MIN RM   SIZE RO TYPE MOUNTPOINTS
sda       8:0    0 953,9G  0 disk
├─sda1    8:1    0    50M  0 part
├─sda2    8:2    0 477,2G  0 part
├─sda3    8:3    0     4G  0 part
├─sda4    8:4    0     1K  0 part
├─sda5    8:5    0  97,7G  0 part
├─sda6    8:6    0  31,1G  0 part [SWAP]
├─sda7    8:7    0 146,5G  0 part /
├─sda8    8:8    0 146,5G  0 part
├─sda9    8:9    0     1G  0 part
└─sda10   8:10   0     2G  0 part
sdb       8:16   1     0B  0 disk
zram0   252:0    0     8G  0 disk [SWAP]

```

# Nuevo volumen

1. Create the raw volume

```bash
root@lq-d25:~# virsh vol-create-as default Vol1_p3.img 1G --format raw
Se ha creado el volumen Vol1_p3
```

2. attach with sda

Si ejecutamos:

```bash
root@lq-d25:~# virsh domblklist mvp3 --details
 Tipo   Dispositivo   Destino   Fuente
--------------------------------------------------------------------
 file   disk          vda       /var/lib/libvirt/images/mvp3.qcow2
 file   cdrom         sda       -
```

Quitamos sda que creo que era por el disco que se usó para crear mvp1:
Con la máquina apagada:

```bash
root@lq-d25:~# virsh detach-disk mvp3 sda --config
El disco ha sido desmontado exitosamente
```

Ahora:

```bash
root@lq-d25:~# virsh attach-disk mvp3 /var/lib/libvirt/images/Vol1_p3.img sda --config --type disk --driver qemu --subdriver raw
El disco ha sido asociado exitosamente
```

Conceptos clave de virtualizacion:

- Storage Pool: Es un reservorio de almacenamiento gestionado por el hipervisor. En tu caso, usaste el pool "default".
- Volumen virtual: Un archivo o dispositivo que actúa como un disco físico para la máquina virtual.
- Bus SATA: Interfaz de conexión para dispositivos de almacenamiento. Al adjuntar el disco, estás emulando una conexión SATA física.
- Persistencia de configuración: La opción `--config` garantiza que el disco permanezca conectado incluso después de reiniciar la VM.
  ====== IGNORARR BORRAR DESPUÉS. PARECE QUE ERA OTRA COSA ===================

1. verification

```bash
root@lq-d25:~# virsh domblklist mvp3 --details
 Tipo   Dispositivo   Destino   Fuente
--------------------------------------------------------------------
 file   disk          vda       /var/lib/libvirt/images/mvp3.qcow2
 file   disk          sda       /var/lib/libvirt/images/Vol1_p3.img
```

Para completar la práctica 3 Tarea 1, necesitamos hacer lo siguiente dentro de la máquina virtual mvp3:

1. Iniciamos sesión en la mvp3

```bash
root@lq-d25:~# ssh root@192.168.122.242
The authenticity of host '192.168.122.242 (192.168.122.242)' can't be established.
ED25519 key fingerprint is SHA256:gRFGvZlUIel5P1EJEdiEEgvXQ48k7iMy9Oz5SDPY2h4.
This host key is known by the following other names/addresses:
    ~/.ssh/known_hosts:1: 192.168.122.123
    ~/.ssh/known_hosts:4: mvp1.vpd.com
    ~/.ssh/known_hosts:8: 192.168.122.124
    ~/.ssh/known_hosts:9: 192.168.122.113
    ~/.ssh/known_hosts:10: 192.168.122.37
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added '192.168.122.242' (ED25519) to the list of known hosts.
Web console: https://mvp1.vpd.com:9090/ or https://192.168.122.242:9090/

Last login: Fri Feb 28 20:06:07 2025
```

2. Una vez dentro, verificamos que el disco está disponible, observamos que aparece como sda

```bash
root@mvp1:~# lsblk
NAME            MAJ:MIN RM  SIZE RO TYPE MOUNTPOINTS
sda               8:0    0    1G  0 disk
sr0              11:0    1 1024M  0 rom
zram0           251:0    0  1,9G  0 disk [SWAP]
vda             252:0    0   10G  0 disk
├─vda1          252:1    0    1M  0 part
├─vda2          252:2    0    1G  0 part /boot
└─vda3          252:3    0    9G  0 part
  └─fedora-root 253:0    0    9G  0 lvm  /
```

3. vamos a crear la partición de 512MB en disco con la utilidad fdisk

```
root@mvp1:~# fdisk /dev/sda

Welcome to fdisk (util-linux 2.40.4).
Changes will remain in memory only, until you decide to write them.
Be careful before using the write command.

Device does not contain a recognized partition table.
Created a new DOS (MBR) disklabel with disk identifier 0xc4abc78f.

Command (m for help): n
Partition type
   p   primary (0 primary, 0 extended, 4 free)
   e   extended (container for logical partitions)
Select (default p): p
Partition number (1-4, default 1): 1
First sector (2048-2097151, default 2048):
Last sector, +/-sectors or +/-size{K,M,G,T,P} (2048-2097151, default 2097151): +512M

Created a new partition 1 of type 'Linux' and of size 512 MiB.

Command (m for help): w
The partition table has been altered.
Calling ioctl() to re-read partition table.
Syncing disks.

```

opciones usadas:

```
Pulsa n para nueva partición
Pulsa p para partición primaria
Número de partición: 1 (por defecto)
Primer sector: presiona Enter para usar el valor predeterminado
Último sector: +512M (para especificar 512 MB)
Pulsa w para escribir los cambios
```

Particionado con fdisk: Creaste una partición primaria de 512MB, lo que representa la mitad del espacio total del disco.

4. Creamos el sistema de archivos XFS en la nueva partición:

```bash
root@mvp1:~# mkfs.xfs -f /dev/sda1
meta-data=/dev/sda1              isize=512    agcount=4, agsize=32768 blks
         =                       sectsz=512   attr=2, projid32bit=1
         =                       crc=1        finobt=1, sparse=1, rmapbt=1
         =                       reflink=1    bigtime=1 inobtcount=1 nrext64=1
data     =                       bsize=4096   blocks=131072, imaxpct=25
         =                       sunit=0      swidth=0 blks
naming   =version 2              bsize=4096   ascii-ci=0, ftype=1
log      =internal log           bsize=4096   blocks=16384, version=2
         =                       sectsz=512   sunit=0 blks, lazy-count=1
realtime =none                   extsz=4096   blocks=0, rtextents=0
Discarding blocks...Done.
```

para comprobar la persistencia, reiniciamos la MV y verificamos que el disco sigue disponible:

```bash
root@mvp1:~# reboot
root@mvp1:~# Connection to 192.168.122.242 closed by remote host.
Connection to 192.168.122.242 closed.
root@lq-d25:~# ssh root@192.168.122.242
Web console: https://mvp1.vpd.com:9090/ or https://192.168.122.242:9090/

Last login: Fri Feb 28 20:10:38 2025 from 192.168.122.1
```

```bash
root@mvp1:~# lsblk
NAME            MAJ:MIN RM  SIZE RO TYPE MOUNTPOINTS
sda               8:0    0    1G  0 disk
└─sda1            8:1    0  512M  0 part
sr0              11:0    1 1024M  0 rom
zram0           251:0    0  1,9G  0 disk [SWAP]
vda             252:0    0   10G  0 disk
├─vda1          252:1    0    1M  0 part
├─vda2          252:2    0    1G  0 part /boot
└─vda3          252:3    0    9G  0 part
  └─fedora-root 253:0    0    9G  0 lvm  /

```

para comprobar que el tipo de sistema de archivos creado es el correcto:

```
root@mvp1:~# mount | grep sda1
/dev/sda1 on /mnt/nuevo_disco type xfs (rw,relatime,seclabel,attr2,inode64,logbufs=8,logbsize=32k,noquota)
```

6. Montamos el sistema de archivos

```bash
root@mvp1:~# mkdir -p /mnt/nuevo_disco
root@mvp1:~# mount /dev/sda1 /mnt/nuevo_disco
```

Verificamos que el sistema de archivos está montado correctamente:

```bash
root@mvp1:~# df -h /mnt/nuevo_disco
S.ficheros     Tamaño Usados  Disp Uso% Montado en
/dev/sda1        504M    24K  478M   1% /mnt/nuevo_disco
```

Detalles de la partición creada:

```bash
root@mvp1:~# fdisk -l /dev/sda
Disk /dev/sda: 1 GiB, 1073741824 bytes, 2097152 sectors
Disk model: QEMU HARDDISK
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disklabel type: dos
Disk identifier: 0xc4abc78f

Device     Boot Start     End Sectors  Size Id Type
/dev/sda1        2048 1050623 1048576  512M 83 Linux

```

7. Creamos el archivo test.txt

```bash
root@mvp1:~# touch /mnt/nuevo_disco/test.txt

```

8. Verificamos que se ha creado correctamente

```bash
root@mvp1:~# ls -l /mnt/nuevo_disco
total 16
drwx------. 2 root root 16384 feb 28 20:15 lost+found
-rw-r--r--. 1 root root     0 feb 28 20:19 test.txt

```

Montaje persistente: para que el montaje sobreviva a reinicio, añadimos una entrada a /etc/fstab

```bash
echo "/dev/sda1 /mnt/nuevo_disco xfs defaults 0 0" >> /etc/fstab
```

Comprobamos:

```bash
root@mvp1:~# echo "/dev/sda1 /mnt/nuevo_disco xfs defaults 0 0" >> /etc/fstab
```

```bash
root@mvp1:~# reboot
root@mvp1:~# Connection to 192.168.122.242 closed by remote host.
Connection to 192.168.122.242 closed.
root@lq-d25:~# ssh root@192.168.122.242
Web console: https://mvp1.vpd.com:9090/ or https://192.168.122.242:9090/

Last login: Fri Feb 28 20:24:06 2025 from 192.168.122.1
```

```bash
root@mvp1:~# ls -l /mnt/nuevo_disco
total 0
-rw-r--r--. 1 root root 0 feb 28 20:28 test.txt
```

## Tarea 2: Creación y asociación de partición física a máquina virtual

En la tarea 1 trabajamos con un volumen virtual (archivo). En la tarea 2 vamos a trabajar con una partición física real del host.

Es importante que identifiquemos correctamente el disco y la partición extendida para no afectar a otros estudiantes.

a tener en cuenta: Diferencia entre volúmenes y particiones: Los volúmenes son abstracciones de almacenamiento; las particiones son divisiones físicas de un disco

Objetivo
Crear una partición física en el host anfitrión y asociarla directamente a la máquina virtual mvp3 como un disco completo.

1. Paso 1. Identificar y crear la partición lógica en el host

Primero, debemos identificar si estamos en un equipo con un disco (LQ-C/LQ-D) o dos discos (LQ-1/LQ-2):

```bash
root@lq-d25:~# lsblk
NAME    MAJ:MIN RM   SIZE RO TYPE MOUNTPOINTS
sda       8:0    0 953,9G  0 disk
├─sda1    8:1    0    50M  0 part
├─sda2    8:2    0 477,2G  0 part
├─sda3    8:3    0     4G  0 part
├─sda4    8:4    0     1K  0 part
├─sda5    8:5    0  97,7G  0 part
├─sda6    8:6    0  31,1G  0 part [SWAP]
├─sda7    8:7    0 146,5G  0 part /
├─sda8    8:8    0 146,5G  0 part
├─sda9    8:9    0     1G  0 part
└─sda10   8:10   0     2G  0 part
sdb       8:16   1     0B  0 disk
zram0   252:0    0     8G  0 disk [SWAP]

```

### Crear una partición lógica de 1GB

Según la salida de lsblk, nos encontramos en un sistema con un disco principal (/dev/sda) que contiene 10 particiones extendidas.

**IMPORTANTE**: Esta operación es delicada. Cualquier error puede dañar datos de otros estudiantes.

```bash
root@lq-d25:~# fdisk /dev/sda

Welcome to fdisk (util-linux 2.39.4).
Changes will remain in memory only, until you decide to write them.
Be careful before using the write command.

This disk is currently in use - repartitioning is probably a bad idea.
It's recommended to umount all file systems, and swapoff all swap
partitions on this disk.


Command (m for help): p

Disk /dev/sda: 953,87 GiB, 1024209543168 bytes, 2000409264 sectors
Disk model: SSD-1TB
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disklabel type: dos
Disk identifier: 0xd5de6562

Device     Boot      Start        End    Sectors   Size Id Type
/dev/sda1  *          2048     104447     102400    50M  7 HPFS/NTFS/exFAT
/dev/sda2           104448 1000833023 1000728576 477,2G  7 HPFS/NTFS/exFAT
/dev/sda3       1000833024 1009221631    8388608     4G 83 Linux
/dev/sda4       1009221632 2000408575  991186944 472,6G  f W95 Ext'd (LBA)
/dev/sda5       1009225728 1214025727  204800000  97,7G 83 Linux
/dev/sda6       1214027776 1279252479   65224704  31,1G 82 Linux swap / Solaris
/dev/sda7       1279254528 1586454527  307200000 146,5G 83 Linux
/dev/sda8       1586456576 1893656575  307200000 146,5G 83 Linux
/dev/sda9       1893658624 1895755775    2097152     1G 83 Linux
/dev/sda10      1895757824 1899952127    4194304     2G 83 Linux

Command (m for help): n
All primary partitions are in use.
Adding logical partition 11
First sector (1899954176-2000408575, default 1899954176):
Last sector, +/-sectors or +/-size{K,M,G,T,P} (1899954176-2000408575, default 2000408575): +1G

Created a new partition 11 of type 'Linux' and of size 1 GiB.

Command (m for help): w
The partition table has been altered.
Syncing disks.

```

Comandos dentro de fdisk:

1. `p` - para imprimir la tabla de particiones actual y verificar el espacio
2. `n` - para crear una nueva partición
3. Aceptar el número de partición predeterminado
4. Aceptar el sector inicial predeterminado
5. Especificar `+1G` para el sector final (1GB de tamaño)
6. `w` - para escribir los cambios y salir

### Anotar el nombre de la partición creada

Es crucial recordar qué partición se ha creado

```
/dev/sda13
```

```
root@lq-d25:~# lsblk
NAME    MAJ:MIN RM   SIZE RO TYPE MOUNTPOINTS
sda       8:0    0 953,9G  0 disk
├─sda1    8:1    0    50M  0 part
├─sda2    8:2    0 477,2G  0 part
├─sda3    8:3    0     4G  0 part
├─sda4    8:4    0     1K  0 part
├─sda5    8:5    0  97,7G  0 part
├─sda6    8:6    0  31,1G  0 part [SWAP]
├─sda7    8:7    0 146,5G  0 part /
├─sda8    8:8    0 146,5G  0 part
├─sda9    8:9    0     1G  0 part
├─sda10   8:10   0     2G  0 part
└─sda11   8:11   0     1G  0 part
sdb       8:16   1     0B  0 disk
zram0   252:0    0     8G  0 disk [SWAP]

```

--18 DE FEBRERO DE 2025 20:48--

## Paso 2: Asociar la partición a la máquina virtual mvp3

Usaremos virsh attach-disk para conectar la partición física directamente a la máquina virtual como disco sdb:

```bash
virsh attach-disk mvp3 /dev/sdaXX sdb --config --type disk --driver qemu --subdriver raw
```

(Reemplazar sdaXX con el número de partición real creada)

6 de Marzo, vamos a ello!

```bash
root@lq-d25:~# virsh attach-disk mvp3 /dev/sda13 sdb --config --type disk --driver qemu --subdriver raw
El disco ha sido asociado exitosamente
```

## Paso 3: Verificar que la partición está disponible en mvp3

### Iniciar sesión en mvp3

```bash
root@lq-d25:~# virsh domifaddr mvp3
 Nombre     dirección MAC       Protocol     Address
-------------------------------------------------------------------------------
 vnet0      00:16:3e:37:a0:03    ipv4         192.168.122.242/24
```

```
root@lq-d25:~# ssh root@192.168.122.242
Web console: https://mvp1.vpd.com:9090/ or https://192.168.122.242:9090/

Last login: Thu Mar  6 19:23:40 2025
root@mvp1:~#
```

### Verificar que el nuevo disco está presente

```bash
root@mvp1:~# lsblk
NAME            MAJ:MIN RM  SIZE RO TYPE MOUNTPOINTS
sda               8:0    0    1G  0 disk
└─sda1            8:1    0  512M  0 part /mnt/nuevo_disco
sdb               8:16   0    1G  0 disk
zram0           251:0    0  1,9G  0 disk [SWAP]
vda             252:0    0   10G  0 disk
├─vda1          252:1    0    1M  0 part
├─vda2          252:2    0    1G  0 part /boot
└─vda3          252:3    0    9G  0 part
  └─fedora-root 253:0    0    9G  0 lvm  /

```

Deberíamos ver el nuevo disco como /dev/sdb

## Paso 4: Crear sistema de archivos XFS en el disco completo

**NOTA**: A diferencia de la Tarea 1, aquí no debemos particionar el disco, sino formatear directamente el dispositivo completo.

```bash
mkfs.xfs /dev/sdb
```

```
root@mvp1:~# mkfs.xfs /dev/sdb
meta-data=/dev/sdb               isize=512    agcount=4, agsize=65536 blks
         =                       sectsz=512   attr=2, projid32bit=1
         =                       crc=1        finobt=1, sparse=1, rmapbt=1
         =                       reflink=1    bigtime=1 inobtcount=1 nrext64=1
data     =                       bsize=4096   blocks=262144, imaxpct=25
         =                       sunit=0      swidth=0 blks
naming   =version 2              bsize=4096   ascii-ci=0, ftype=1
log      =internal log           bsize=4096   blocks=16384, version=2
         =                       sectsz=512   sunit=0 blks, lazy-count=1
realtime =none                   extsz=4096   blocks=0, rtextents=0
Discarding blocks...Done.
```

## Paso 5: Montar el sistema de archivos y crear archivo de prueba

```bash
root@mvp1:~# mkdir -p /mnt/disco_fisico
root@mvp1:~# mount /dev/sdb /mnt/disco_fisico
root@mvp1:~# touch /mnt/disco_fisico/test.txt
root@mvp1:~# ls -l /mnt/disco_fisico
total 0
-rw-r--r--. 1 root root 0 mar  6 19:51 test.txt
```

# Notas

Diferencia entre /dev/sda y /dev/vdda

/vda => para virtualizaciones ¿? formato qacw. Emula el hardware físico, en la práctica, una interfaz sata
/sda => lo de aquí lo trata como un disco real ¿?

# Comandos para Tarea 3: Crear un storage pool en partición lógica

## 1. Crear nueva partición lógica de 2GB

```bash
# Verificar la configuración actual de discos
lsblk

# Crear partición lógica usando fdisk
fdisk /dev/sda

# Dentro de fdisk, usar estos comandos (uno tras otro):
# p (para ver tabla de particiones actual)
# n (crear nueva partición)
# l (seleccionar partición lógica)
# Enter (aceptar número predeterminado)
# Enter (aceptar sector inicial predeterminado)
# +2G (especificar tamaño de 2GB)
# w (escribir cambios y salir)

# Verificar que la partición se creó correctamente
lsblk
```

```
root@lq-d25:~# lsblk
NAME    MAJ:MIN RM   SIZE RO TYPE MOUNTPOINTS
sda       8:0    0 953,9G  0 disk
├─sda1    8:1    0    50M  0 part
├─sda2    8:2    0 477,2G  0 part
├─sda3    8:3    0     4G  0 part
├─sda4    8:4    0     1K  0 part
├─sda5    8:5    0  97,7G  0 part
├─sda6    8:6    0  31,1G  0 part [SWAP]
├─sda7    8:7    0 146,5G  0 part /
├─sda8    8:8    0 146,5G  0 part
├─sda9    8:9    0     1G  0 part
├─sda10   8:10   0     2G  0 part
├─sda11   8:11   0     1G  0 part
├─sda12   8:12   0     2G  0 part
├─sda13   8:13   0     1G  0 part
└─sda14   8:14   0     2G  0 part /var/lib/libvirt/Pool_Particion
                                  /var/lib/libvirt/Pool_Particion
sdb       8:16   1     0B  0 disk
zram0   252:0    0     8G  0 disk [SWAP]
```

Luego:

```
root@lq-d25:~# fdisk /dev/sda

Welcome to fdisk (util-linux 2.39.4).
Changes will remain in memory only, until you decide to write them.
Be careful before using the write command.

This disk is currently in use - repartitioning is probably a bad idea.
It's recommended to umount all file systems, and swapoff all swap
partitions on this disk.


Command (m for help): p

Disk /dev/sda: 953,87 GiB, 1024209543168 bytes, 2000409264 sectors
Disk model: SSD-1TB
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disklabel type: dos
Disk identifier: 0xd5de6562

Device     Boot      Start        End    Sectors   Size Id Type
/dev/sda1  *          2048     104447     102400    50M  7 HPFS/NTFS/exFAT
/dev/sda2           104448 1000833023 1000728576 477,2G  7 HPFS/NTFS/exFAT
/dev/sda3       1000833024 1009221631    8388608     4G 83 Linux
/dev/sda4       1009221632 2000408575  991186944 472,6G  f W95 Ext'd (LBA)
/dev/sda5       1009225728 1214025727  204800000  97,7G 83 Linux
/dev/sda6       1214027776 1279252479   65224704  31,1G 82 Linux swap / Solaris
/dev/sda7       1279254528 1586454527  307200000 146,5G 83 Linux
/dev/sda8       1586456576 1893656575  307200000 146,5G 83 Linux
/dev/sda9       1893658624 1895755775    2097152     1G 83 Linux
/dev/sda10      1895757824 1899952127    4194304     2G 83 Linux
/dev/sda11      1899954176 1902051327    2097152     1G 83 Linux

Command (m for help): n
All primary partitions are in use.
Adding logical partition 12
First sector (1902053376-2000408575, default 1902053376):
Last sector, +/-sectors or +/-size{K,M,G,T,P} (1902053376-2000408575, default 2000408575): +2G

Created a new partition 12 of type 'Linux' and of size 2 GiB.

Command (m for help): w
The partition table has been altered.
Syncing disks.
```

Verificación:

```
root@lq-d25:~# lsblk
root@lq-d25:~# lsblk
NAME    MAJ:MIN RM   SIZE RO TYPE MOUNTPOINTS
sda       8:0    0 953,9G  0 disk
├─sda1    8:1    0    50M  0 part
├─sda2    8:2    0 477,2G  0 part
├─sda3    8:3    0     4G  0 part
├─sda4    8:4    0     1K  0 part
├─sda5    8:5    0  97,7G  0 part
├─sda6    8:6    0  31,1G  0 part [SWAP]
├─sda7    8:7    0 146,5G  0 part /
├─sda8    8:8    0 146,5G  0 part
├─sda9    8:9    0     1G  0 part
├─sda10   8:10   0     2G  0 part
├─sda11   8:11   0     1G  0 part
├─sda12   8:12   0     2G  0 part
├─sda13   8:13   0     1G  0 part
└─sda14   8:14   0     2G  0 part /var/lib/libvirt/Pool_Particion
                                  /var/lib/libvirt/Pool_Particion
sdb       8:16   1     0B  0 disk
zram0   252:0    0     8G  0 disk [SWAP]
```

## 2. Crear sistema de archivos ext4 en la nueva partición

```bash
root@lq-d25:~# mkfs.ext4 /dev/sda14
mke2fs 1.47.0 (5-Feb-2023)
Descartando los bloques del dispositivo: hecho
Se está creando un sistema de ficheros con 524288 bloques de 4k y 131072 nodos-i
UUID del sistema de ficheros: d49322db-bde4-4a05-8e49-dc3c37f7484d
Respaldos del superbloque guardados en los bloques:
	32768, 98304, 163840, 229376, 294912

Reservando las tablas de grupo: hecho
Escribiendo las tablas de nodos-i: hecho
Creando el fichero de transacciones (16384 bloques): hecho
Escribiendo superbloques y la información contable del sistema de ficheros:  0/1hecho
```

## 3. Crear directorio para montar el storage pool

```bash
root@lq-d25:~# mkdir -p /var/lib/libvirt/Pool_Particion
```

## 4. Montar la partición en el directorio

```bash
root@lq-d25:~# mount /dev/sda14 /var/lib/libvirt/Pool_Particion
```

## 5. Configurar montaje automático en el host

Obtener UUID de la partición:

```bash
root@lq-d25:~# blkid /dev/sda14
/dev/sda14: UUID="d49322db-bde4-4a05-8e49-dc3c37f7484d" BLOCK_SIZE="4096" TYPE="ext4" PARTUUID="d5de6562-0c"
```

Editar fstab para montar automáticamente al arranque:

```bash
root@lq-d25:~# echo "UUID=d49322db-bde4-4a05-8e49-dc3c37f7484d /var/lib/libvirt/Pool_Particion ext4 defaults 0 0" >> /etc/fstab
```

Verificar la configuración:

```bash
root@lq-d25:~# lsblk
NAME    MAJ:MIN RM   SIZE RO TYPE MOUNTPOINTS
sda       8:0    0 953,9G  0 disk
├─sda1    8:1    0    50M  0 part
├─sda2    8:2    0 477,2G  0 part
├─sda3    8:3    0     4G  0 part
├─sda4    8:4    0     1K  0 part
├─sda5    8:5    0  97,7G  0 part
├─sda6    8:6    0  31,1G  0 part [SWAP]
├─sda7    8:7    0 146,5G  0 part /
├─sda8    8:8    0 146,5G  0 part
├─sda9    8:9    0     1G  0 part
├─sda10   8:10   0     2G  0 part
├─sda11   8:11   0     1G  0 part
└─sda12   8:12   0     2G  0 part /var/lib/libvirt/Pool_Particion
sdb       8:16   1     0B  0 disk
zram0   252:0    0     8G  0 disk [SWAP]
```

## 6. Crear el storage pool con virsh

```bash
root@lq-d25:~# virsh pool-define-as Contenedor_Particion dir - - - - /var/lib/libvirt/Pool_Particion
El grupo Contenedor_Particion ha sido definido
```

```bash
root@lq-d25:~# virsh pool-build Contenedor_Particion
El pool Contenedor_Particion ha sido compilado
```

```bash
root@lq-d25:~# virsh pool-start Contenedor_Particion
Se ha iniciado el grupo Contenedor_Particion
```

```
root@lq-d25:~# virsh pool-autostart Contenedor_Particion
El grupo Contenedor_Particion ha sido marcado como iniciable automáticamente
```

Verificar que el pool se creó correctamente

```bash
root@lq-d25:~# virsh pool-list --all
 Nombre                 Estado   Inicio automático
----------------------------------------------------
 Contenedor_Particion   activo   si
 default                activo   si
 ISO                    activo   si
```

=======================

¿¿¿¿ESTO ANTES???

```
mkfs.xfs /dev/sda13
```

```
virsh pool-define-as Contenedor_Particion fs --source-dev /dev/sda14 --target /var/lib/libvirt/Pool_Particion
El grupo Contenedor_Particion ha sido definido

root@lq-d25:~# virsh pool-start Contenedor_Particion
Se ha iniciado el grupo Contenedor_Particion

root@lq-d25:~# virsh pool-autostart Contenedor_Particion
El grupo Contenedor_Particion ha sido marcado como iniciable automáticamente

root@lq-d25:~# virsh pool-list --all
 Nombre                 Estado     Inicio automático
------------------------------------------------------
 CONT_ISOS_COMP         inactivo   no
 CONT_VOL_COMP          inactivo   no
 Contenedor_Particion   activo     si
 default                activo     si
 ISO                    activo     si
```

======================

## 7. Crear volumen qcow2 en el storage pool

```bash
root@lq-d25:~# virsh vol-create-as Contenedor_Particion Vol2_p3 1G --format qcow2
Se ha creado el volumen Vol2_p3
```

Verificar la creación del volumen:

```bash
root@lq-d25:~# virsh vol-list Contenedor_Particion
 Nombre       Ruta
----------------------------------------------------------
 lost+found   /var/lib/libvirt/Pool_Particion/lost+found
 Vol2_p3      /var/lib/libvirt/Pool_Particion/Vol2_p3
```

## 8. Adjuntar el volumen a la VM mvp3 como vdb

```bash
root@lq-d25:~# virsh attach-disk mvp3 /var/lib/libvirt/Pool_Particion/Vol2_p3 vdb --driver qemu --subdriver qcow2 --type disk --config
El disco ha sido asociado exitosamente
```

Verificar adjunción del disco:

```bash
root@lq-d25:~# virsh domblklist mvp3
 Destino   Fuente
---------------------------------------------------------------------------
 vda       /var/lib/libvirt/images/mvp3.qcow2
 vdb       /var/lib/libvirt/Pool_Particion/Vol2_p3
 vdc       /var/lib/libvirt/images/COMPARTIDO/pc25_LQD_ANFITRION1_Vol3_p3
 sda       /var/lib/libvirt/images/Vol1_p3.img
 sdb       /dev/sda13
```

Nota: recordemos apagar la mv

## 9. Configurar el disco dentro de la VM mvp3

Conectarse a la VM:

```bash
root@lq-d25:~# ssh root@192.168.122.242
Web console: https://mvp1.vpd.com:9090/ or https://192.168.122.242:9090/

Last login: Thu Mar  6 20:04:54 2025 from 192.168.122.1
```

Verificar que el disco está disponible

```bash
root@mvp1:~# lsblk
NAME            MAJ:MIN RM  SIZE RO TYPE MOUNTPOINTS
sda               8:0    0    1G  0 disk
└─sda1            8:1    0  512M  0 part /mnt/nuevo_disco
sdb               8:16   0    1G  0 disk /VDB
zram0           251:0    0  1,9G  0 disk [SWAP]
vda             252:0    0   10G  0 disk
├─vda1          252:1    0    1M  0 part
├─vda2          252:2    0    1G  0 part /boot
└─vda3          252:3    0    9G  0 part
  └─fedora-root 253:0    0    9G  0 lvm  /
vdb             252:16   0    1G  0 disk
```

Crear sistema de archivos XFS en el disco completo (sin particionar)

```bash
root@mvp1:~# mkfs.xfs /dev/vdb
meta-data=/dev/vdb               isize=512    agcount=4, agsize=65536 blks
         =                       sectsz=512   attr=2, projid32bit=1
         =                       crc=1        finobt=1, sparse=1, rmapbt=1
         =                       reflink=1    bigtime=1 inobtcount=1 nrext64=1
data     =                       bsize=4096   blocks=262144, imaxpct=25
         =                       sunit=0      swidth=0 blks
naming   =version 2              bsize=4096   ascii-ci=0, ftype=1
log      =internal log           bsize=4096   blocks=16384, version=2
         =                       sectsz=512   sunit=0 blks, lazy-count=1
realtime =none                   extsz=4096   blocks=0, rtextents=0
Discarding blocks...Done.
```

Crear directorio de montaje

```
root@mvp1:~# mkdir -p /VDB
```

Montar el disco:

```
root@mvp1:~# mount /dev/vdb /VDB
```

Crear archivo de prueba:

```bash
touch /VDB/test.txt
```

Verificar que se creó el archivo

```bash
root@mvp1:~# ls -l /VDB
total 0
-rw-r--r--. 1 root root 0 mar  6 20:29 test.txt
```

## 10. Configurar montaje automático en la VM mvp3

Obtener UUID del disco

```bash
root@mvp1:~# blkid /dev/vdb
/dev/vdb: UUID="0051b7c0-22f9-4d30-9dc4-cc70f44ee818" BLOCK_SIZE="512" TYPE="xfs"
```

Añadir entrada a fstab

```bash
root@mvp1:~# echo "UUID=0051b7c0-22f9-4d30-9dc4-cc70f44ee818 /VDB xfs defaults 0 0" >> /etc/fstab
```

Probar la configuración

```bash
root@mvp1:~# mount -a
mount: (hint) your fstab has been modified, but systemd still uses
       the old version; use 'systemctl daemon-reload' to reload.
```

Verificar montaje:

```
root@mvp1:~# df -h | grep /VDB
/dev/vdb                  960M    51M  910M   6% /VDB
```

## 11. Comandos de validación

**En el host:**

```bash
root@lq-d25:~# virsh pool-info Contenedor_Particion
Nombre:         Contenedor_Particion
UUID:           6ac4fb14-de92-47f4-8287-2ca274f9973b
Estado:         ejecutando
Persistente:    si
Autoinicio:     si
Capacidad:      1,90 GiB
Ubicación:     732,00 KiB
Disponible:     1,90 GiB
```

```bash
root@lq-d25:~# virsh vol-info --pool Contenedor_Particion Vol2_p3
Nombre:         Vol2_p3
Tipo:           archivo
Capacidad:      1,00 GiB
Ubicación:     2,76 MiB
```

En la VM:

```bash
root@mvp1:~# df -h | grep /VDB
/dev/sdb                  960M    51M  910M   6% /VDB
```

```bash
root@mvp1:~# ls -l /VDB
total 0
-rw-r--r--. 1 root root 0 mar  6 19:51 test.txt
```

```bash
root@mvp1:~# cat /etc/fstab | grep VDB
/dev/sdb /VDB xfs defaults 0 0
UUID=0051b7c0-22f9-4d30-9dc4-cc70f44ee818 /VDB xfs defaults 0 0
```

Para asegurarnos que lo hemos creado correctamente como de tipo fs:

```bash
root@lq-d25:~# virsh pool-dumpxml Contenedor_Particion
<pool type='fs'>
  <name>Contenedor_Particion</name>
  <uuid>3a56d64b-e0df-40d2-b660-71173a1cdc1b</uuid>
  <capacity unit='bytes'>1006632960</capacity>
  <allocation unit='bytes'>41066496</allocation>
  <available unit='bytes'>965566464</available>
  <source>
    <device path='/dev/sda13'/>
    <format type='auto'/>
  </source>
  <target>
    <path>/var/lib/libvirt/Pool_Particion</path>
    <permissions>
      <mode>0755</mode>
      <owner>0</owner>
      <group>0</group>
      <label>system_u:object_r:unlabeled_t:s0</label>
    </permissions>
  </target>
</pool>
```

# Comandos para Tarea 4: Crear un contenedor NFS para imágenes ISO

## 1. Crear el directorio local para el montaje NFS

```bash
# Crear el directorio que se asociará al contenedor
root@lq-d25:~# mkdir -p /var/lib/libvirt/images/ISOS
```

## 2. Verificar que el servidor NFS está accesible

Verificar conectividad con el servidor NFS

```bash
root@lq-d25:~# ping disnas2.dis.ulpgc.es
PING disnas2.dis.ulpgc.es (10.22.146.216) 56(84) bytes of data.
64 bytes from disnas2.dis.ulpgc.es (10.22.146.216): icmp_seq=1 ttl=60 time=0.351 ms
64 bytes from disnas2.dis.ulpgc.es (10.22.146.216): icmp_seq=2 ttl=60 time=0.624 ms
^C
--- disnas2.dis.ulpgc.es ping statistics ---
2 packets transmitted, 2 received, 0% packet loss, time 1002ms
rtt min/avg/max/mdev = 0.351/0.487/0.624/0.136 ms
```

Listar los directorios exportados por el servidor NFS

```
root@lq-d25:~# showmount -e disnas2.dis.ulpgc.es
Export list for disnas2.dis.ulpgc.es:
/loginicio       *
/iniciolab       *
/imagenes        *
/disnas2-itsi    *
/usuarios        193.145.147.58,193.145.147.132,193.145.147.51
/pxepru          10.22.146.0/24,10.22.147.0/24,10.22.145.110,10.22.145.100
/gabino_postgres 193.145.147.170
/ASO_EXAMEN      193.145.147.0/24,10.22.148.0/24,10.22.147.0/24,10.22.146.0/24
```

## 3. Crear el storage pool usando virsh

Definir el pool NFS sin activación automática

```bash
root@lq-d25:~# virsh pool-define-as CONT_ISOS_COMP netfs --source-host disnas2.dis.ulpgc.es --source-path /imagenes/fedora/41/isos/x86_64 --target /var/lib/libvirt/images/ISOS
El grupo CONT_ISOS_COMP ha sido definido
```

Construir el pool

```bash
root@lq-d25:~# virsh pool-build CONT_ISOS_COMP
El pool CONT_ISOS_COMP ha sido compilado
```

Iniciar el pool manualmente (no se configurará para inicio automático)

```bash
root@lq-d25:~# virsh pool-start CONT_ISOS_COMP
Se ha iniciado el grupo CONT_ISOS_COMP
```

Verificar que el pool NO está configurado para inicio automático

```bash
root@lq-d25:~# virsh pool-autostart --disable CONT_ISOS_COMP
Se ha quitado la marca del grupo CONT_ISOS_COMP para iniciarse automáticamente
```

Verificar que el pool se ha creado correctamente:

```bash
root@lq-d25:~# virsh pool-list --all
 Nombre                 Estado   Inicio automático
----------------------------------------------------
 CONT_ISOS_COMP         activo   no
 Contenedor_Particion   activo   si
 default                activo   si
 ISO                    activo   si
```

## 4. Verificar el acceso a las imágenes ISO

Listar los volúmenes (imágenes ISO) disponibles en el pool

```bash
root@lq-d25:~# virsh vol-list CONT_ISOS_COMP
 Nombre                                    Ruta
-----------------------------------------------------------------------------------------------------------------
 Fedora-Server-netinst-x86_64-41-1.4.iso   /var/lib/libvirt/images/ISOS/Fedora-Server-netinst-x86_64-41-1.4.iso

```

También se puede verificar directamente en el sistema de archivos:

```bash
root@lq-d25:~# ls -la /var/lib/libvirt/images/ISOS
total 932532
drwxrwxrwx. 2 root root      4096 ene 31 11:01 .
drwx--x--x. 3 root root      4096 mar  6 20:38 ..
-rw-rw-rw-. 1 root root 954900480 ene 21 14:33 Fedora-Server-netinst-x86_64-41-1.4.iso
```

## 5. Comandos para gestionar el pool NFS

```bash
# Para iniciar manualmente el pool cuando sea necesario
virsh pool-start CONT_ISOS_COMP

# Para detener el pool cuando ya no se necesite
virsh pool-destroy CONT_ISOS_COMP

# Para obtener información detallada del pool
virsh pool-info CONT_ISOS_COMP

# Para refrescar la lista de volúmenes
virsh pool-refresh CONT_ISOS_COMP
```

## 6. Comandos para utilizar una imagen ISO en la instalación de una VM

```bash
# Ejemplo de cómo usar una ISO del pool para instalar o arrancar una VM
# (Suponiendo que existe una ISO llamada "Fedora-Server-dvd-x86_64-41.iso")
virsh start mvp3 --cdrom /var/lib/libvirt/images/ISOS/Fedora-Server-dvd-x86_64-41.iso
```

## 7. Verificación del montaje NFS a nivel de sistema operativo

```bash
# Verificar que el NFS está correctamente montado
root@lq-d25:~# mount | grep disnas2
disnas2.dis.ulpgc.es:/imagenes/fedora/41/isos/x86_64 on /var/lib/libvirt/images/ISOS type nfs (rw,nosuid,nodev,noexec,relatime,vers=3,rsize=1048576,wsize=1048576,namlen=255,hard,proto=tcp,timeo=600,retrans=2,sec=sys,mountaddr=10.22.146.216,mountvers=3,mountport=57049,mountproto=udp,local_lock=none,addr=10.22.146.216)


# Ver estadísticas del sistema de archivos montado
root@lq-d25:~# df -h | grep ISOS
disnas2.dis.ulpgc.es:/imagenes/fedora/41/isos/x86_64   248G   1,5G  246G   1% /var/lib/libvirt/images/ISOS
```

======================================================
HASTA AQUÍ JUEVES 6 MARZO
======================================================

# Comandos para Tarea 5: Crear un contenedor NFS para volúmenes de máquinas virtuales

## 1. Crear el directorio local para el montaje NFS

Crear el directorio que se asociará al contenedor:

```bash
root@lq-d25:~# mkdir -p /var/lib/libvirt/images/COMPARTIDO
```

## 2. Verificar que el servidor NFS está accesible

Verificar conectividad con el servidor NFS

```bash
root@lq-d25:~# ping disnas2.dis.ulpgc.es
PING disnas2.dis.ulpgc.es (10.22.146.216) 56(84) bytes of data.
64 bytes from disnas2.dis.ulpgc.es (10.22.146.216): icmp_seq=1 ttl=61 time=0.312 ms
64 bytes from disnas2.dis.ulpgc.es (10.22.146.216): icmp_seq=2 ttl=61 time=0.320 ms
64 bytes from disnas2.dis.ulpgc.es (10.22.146.216): icmp_seq=3 ttl=61 time=0.628 ms
^C
--- disnas2.dis.ulpgc.es ping statistics ---
3 packets transmitted, 3 received, 0% packet loss, time 2003ms
rtt min/avg/max/mdev = 0.312/0.420/0.628/0.147 ms
```

Confirmar que el directorio `/disnas2-itsi` está exportado por el servidor NFS

```bash
root@lq-d25:~# showmount -e disnas2.dis.ulpgc.es
Export list for disnas2.dis.ulpgc.es:
/loginicio       *
/iniciolab       *
/imagenes        *
/disnas2-itsi    *
/usuarios        193.145.147.58,193.145.147.132,193.145.147.51
/pxepru          10.22.146.0/24,10.22.147.0/24,10.22.145.110,10.22.145.100
/gabino_postgres 193.145.147.170
/ASO_EXAMEN      193.145.147.0/24,10.22.148.0/24,10.22.147.0/24,10.22.146.0/24
```

## 3. Crear el storage pool usando virsh

Definir el pool NFS sin activación automática

```bash
root@lq-d25:~# virsh pool-define-as CONT_VOL_COMP netfs --source-host disnas2.dis.ulpgc.es --source-path /disnas2-itsi --target /var/lib/libvirt/images/COMPARTIDO
El grupo CONT_VOL_COMP ha sido definido
```

Construir el pool

```bash
root@lq-d25:~# virsh pool-build CONT_VOL_COMP
El pool CONT_VOL_COMP ha sido compilado
```

Iniciar el pool manualmente (no se configurará para inicio automático)

```bash
root@lq-d25:~# virsh pool-start CONT_VOL_COMP
Se ha iniciado el grupo CONT_VOL_COMP
```

Verificar que el pool NO está configurado para inicio automático

```bash
root@lq-d25:~# virsh pool-autostart --disable CONT_VOL_COMP
Se ha quitado la marca del grupo CONT_VOL_COMP para iniciarse automáticamente
```

Verificar que el pool se ha creado correctamente:

```bash
root@lq-d25:~# virsh pool-list --all
 Nombre                 Estado   Inicio automático
----------------------------------------------------
 CONT_ISOS_COMP         activo   no
 CONT_VOL_COMP          activo   no
 Contenedor_Particion   activo   si
 default                activo   si
 ISO                    activo   si
```

## 4. Crear un volumen qcow2 en el pool

Crear un volumen de 1GB con formato qcow2 (usando el nombre según patrón establecido)

```bash
root@lq-d25:~# virsh vol-create-as CONT_VOL_COMP pc25_LQD_ANFITRION1_Vol3_p3 1G --format qcow2 --prealloc-metadata
Se ha creado el volumen pc25_LQD_ANFITRION1_Vol3_p3
```

Verificar que el volumen se ha creado correctamente

```bash
root@lq-d25:~# virsh vol-list CONT_VOL_COMP | grep pc25
 pc25_LQD_ANFITRION1_Vol3_p3           /var/lib/libvirt/images/COMPARTIDO/pc25_LQD_ANFITRION1_Vol3_p3
```

## 5. Añadir el nuevo volumen a la máquina virtual mvp3

Añadir el disco a la VM como dispositivo vdc usando virtio (paravirtualizado)

```bash
root@lq-d25:~# virsh attach-disk mvp3 /var/lib/libvirt/images/COMPARTIDO/pc25_LQD_ANFITRION1_Vol3_p3 vdc --driver qemu --subdriver qcow2 --targetbus virtio --persistent
El disco ha sido asociado exitosamente
```

Verificar que el disco se ha añadido correctamente

```bash
root@lq-d25:~# virsh domblklist mvp3
 Destino   Fuente
---------------------------------------------------------------------------
 vda       /var/lib/libvirt/images/mvp3.qcow2
 vdb       /var/lib/libvirt/Pool_Particion/Vol2_p3.qcow2
 vdc       /var/lib/libvirt/images/COMPARTIDO/pc25_LQD_ANFITRION1_Vol3_p3.qcow2
 sda       /var/lib/libvirt/images/Vol1_p3.img
 sdb       /dev/sda11
```

## 6. Formatear el disco y crear el sistema de archivos XFS en mvp3

Acceder a la máquina virtual mvp3 y formatear el disco con XFS

Iniciar la consola de mvp3

```bash
root@lq-d25:~# virsh domifaddr mvp3
 Nombre     dirección MAC       Protocol     Address
-------------------------------------------------------------------------------
 vnet0      00:16:3e:37:a0:03    ipv4         192.168.122.242/24

root@lq-d25:~# ssh root@192.168.122.242
Web console: https://mvp1.vpd.com:9090/ or https://192.168.122.242:9090/

Last login: Thu Mar  6 20:33:30 2025 from 192.168.122.1
root@mvp1:~#
```

Una vez dentro de mvp3, verificar que el disco está disponible

```
root@mvp1:~# lsblk
NAME            MAJ:MIN RM  SIZE RO TYPE MOUNTPOINTS
sda               8:0    0    1G  0 disk
└─sda1            8:1    0  512M  0 part /mnt/nuevo_disco
sdb               8:16   0    1G  0 disk /VDB
zram0           251:0    0  1,9G  0 disk [SWAP]
vda             252:0    0   10G  0 disk
├─vda1          252:1    0    1M  0 part
├─vda2          252:2    0    1G  0 part /boot
└─vda3          252:3    0    9G  0 part
  └─fedora-root 253:0    0    9G  0 lvm  /
vdb             252:16   0    1G  0 disk
vdc             252:32   0    1G  0 disk
```

Crear sistema de archivos XFS en el disco vdc (sin particionar)

```bash
root@mvp1:~# mkfs.xfs /dev/vdc
meta-data=/dev/vdc               isize=512    agcount=4, agsize=65536 blks
         =                       sectsz=512   attr=2, projid32bit=1
         =                       crc=1        finobt=1, sparse=1, rmapbt=1
         =                       reflink=1    bigtime=1 inobtcount=1 nrext64=1
data     =                       bsize=4096   blocks=262144, imaxpct=25
         =                       sunit=0      swidth=0 blks
naming   =version 2              bsize=4096   ascii-ci=0, ftype=1
log      =internal log           bsize=4096   blocks=16384, version=2
         =                       sectsz=512   sunit=0 blks, lazy-count=1
realtime =none                   extsz=4096   blocks=0, rtextents=0
Discarding blocks...Done.
```

## 7. Montar el sistema de archivos y crear el archivo de prueba

Crear el directorio de montaje

```bash
root@mvp1:~# mkdir -p /VDC
```

Montar el disco manualmente

```bash
root@mvp1:~# mount /dev/vdc /VDC
```

Crear el archivo de prueba

```bash
root@mvp1:~# echo "Este es un archivo de prueba" > /VDC/test.txt
```

Verificar que el archivo se ha creado correctamente

```bash
root@mvp1:~# cat /VDC/test.txt
Este es un archivo de prueba
```

Verificar el montaje

```bash
root@mvp1:~# df -h | grep vdc
/dev/vdc                  960M    51M  910M   6% /VDC
```

## 8. Configurar el montaje automático en el arranque

Añadir una entrada en el archivo /etc/fstab para el montaje automático

Obtener el UUID del disco para un montaje más fiable:

```bash
root@mvp1:~# blkid | grep vdc
/dev/vdc: UUID="877f6a37-3466-4e81-95f7-9cf4e64421a4" BLOCK_SIZE="512" TYPE="xfs"
```

Editar el archivo `/etc/fstab`

```bash
root@mvp1:~# echo "UUID=877f6a37-3466-4e81-95f7-9cf4e64421a4 /VDC xfs defaults 0 0" >> /etc/fstab
```

Verificar la configuración

```bash
root@mvp1:~# cat /etc/fstab | grep VDC
UUID=877f6a37-3466-4e81-95f7-9cf4e64421a4 /VDC xfs defaults 0 0
```

## 9. Validación final: Reiniciar la VM y verificar el montaje automático

Reiniciar la VM

```bash
root@mvp1:~# Connection to 192.168.122.242 closed by remote host.
Connection to 192.168.122.242 closed.
```

Después del reinicio, verificar que el sistema de archivos está montado automáticamente

```bash
root@mvp1:~# mount | grep vdc
/dev/vdc on /VDC type xfs (rw,relatime,seclabel,attr2,inode64,logbufs=8,logbsize=32k,noquota)
```

Comprobar que el archivo de prueba sigue disponible

```bash
root@mvp1:~# cat /VDC/test.txt
Este es un archivo de prueba
```

```bash
root@mvp1:~# cat /etc/fstab 

#
# /etc/fstab
# Created by anaconda on Fri Feb 14 19:27:15 2025
#
# Accessible filesystems, by reference, are maintained under '/dev/disk/'.
# See man pages fstab(5), findfs(8), mount(8) and/or blkid(8) for more info.
#
# After editing this file, run 'systemctl daemon-reload' to update systemd
# units generated from this file.
#
UUID=86e79892-bf3a-4793-8074-fc0c76acae8b /                       xfs     defaults        0 0
UUID=0da1439f-42fb-4986-ba69-c84fe43d8394 /boot                   xfs     defaults        0 0
/dev/sda1 /mnt/nuevo_disco xfs defaults 0 0
/dev/sdb /mnt/disco_fisico xfs defaults 0 0
UUID=6a85a9cd-1dd4-488e-9c82-af011f935f88 /VDB xfs defaults 0 0
UUID=c5bc8f23-41ba-46ac-9f11-3669018d0ac6  /VDC xfs defaults 0 0
```

## 10. Comandos adicionales para gestionar el pool NFS

```bash
# Para iniciar manualmente el pool cuando sea necesario
virsh pool-start CONT_VOL_COMP

# Para detener el pool cuando ya no se necesite
virsh pool-destroy CONT_VOL_COMP

# Para obtener información detallada del pool
virsh pool-info CONT_VOL_COMP

# Para refrescar la lista de volúmenes
virsh pool-refresh CONT_VOL_COMP
```

## 11. Verificación del montaje NFS a nivel de sistema operativo host

Verificar que el NFS está correctamente montado

```bash
root@lq-d25:~# mount | grep disnas2
disnas2.dis.ulpgc.es:/disnas2-itsi on /var/lib/libvirt/images/COMPARTIDO type nfs (rw,nosuid,nodev,noexec,relatime,vers=3,rsize=1048576,wsize=1048576,namlen=255,hard,proto=tcp,timeo=600,retrans=2,sec=sys,mountaddr=10.22.146.216,mountvers=3,mountport=57049,mountproto=udp,local_lock=none,addr=10.22.146.216)
```

Ver estadísticas del sistema de archivos montado

```
root@lq-d25:~#  df -h | grep COMPARTIDO
disnas2.dis.ulpgc.es:/disnas2-itsi   396G    23G  374G   6% /var/lib/libvirt/images/COMPARTIDO
```

Todos los archivos de las tareas:

```bash
root@mvp1:~# ls -l /VDB
total 0
-rw-r--r--. 1 root root 0 mar  6 19:51 test.txt
root@mvp1:~# ls -l /mnt/disco_fisico/
total 0
-rw-r--r--. 1 root root 0 mar  7 20:18 test.txt
root@mvp1:~# ls -l /mnt/nuevo_disco/
total 0
-rw-r--r--. 1 root root 0 mar  7 20:15 test.txt
root@mvp1:~# ls -l /VDC/test.txt
-rw-r--r--. 1 root root 29 mar  7 20:28 /VDC/test.txt
```

```bash
root@mvp1:~# echo "UUID=877f6a37-3466-4e81-95f7-9cf4e64421a4 /VDC xfs defaults 0 0" >> /etc/fstab
```

**Importante**: Antes de reiniciar, validar la sintaxis y las entradas de fstab:

```bash
root@mvp1:~# mount -fav
/                        : ignored
/boot                   : already mounted
/VDB                    : already mounted
/VDC                    : already mounted
```

El comando `mount -fav` simula el montaje de todas las entradas sin realizar cambios reales. Si no hay errores, proceder con el reinicio.

Verificar la configuración:

```bash
root@mvp1:~# cat /etc/fstab | grep VDC
UUID=877f6a37-3466-4e81-95f7-9cf4e64421a4 /VDC xfs defaults 0 0
```

# Anexo: Resolución de Problemas de Red

## Pérdida de Conectividad en Máquinas Virtuales

Si una máquina virtual pierde la conectividad de red o no se puede acceder por SSH, sigue estos pasos para diagnosticar y resolver el problema:

### 1. Verificar el Estado de la MV

```bash
# Listar todas las MVs y su estado
virsh list --all

# Si está apagada, encenderla
virsh start nombre_mv
```

### 2. Acceso Directo a la MV

Cuando SSH no está disponible, usa estos métodos alternativos:

```bash
# Acceso por consola (requiere que la MV tenga configurado el acceso por consola)
virsh console nombre_mv

# Acceso por visor gráfico
virt-viewer nombre_mv
```

### 3. Diagnóstico de Red en la MV

Una vez dentro de la MV, ejecuta:

```bash
# Verificar interfaces de red
ip a

# Estado del servicio de red
systemctl status NetworkManager

# Reiniciar el servicio de red si es necesario
systemctl restart NetworkManager

# Reiniciar una interfaz específica
ifdown eth0 && ifup eth0
```

### 4. Verificación de Red en el Host

En el sistema anfitrión:

```bash
# Verificar el bridge virtual
ip a show virbr0

# Listar interfaces de red de la MV
virsh domiflist nombre_mv

# Ver las direcciones IP asignadas a las MVs
virsh domifaddr nombre_mv
```

### 5. Gestión del Servicio libvirtd

El servicio libvirtd es crucial para la gestión de redes virtuales. Para administrarlo:

```bash
# Verificar el estado del servicio
systemctl status libvirtd

# Reiniciar el servicio
systemctl restart libvirtd

# Si el problema persiste, reiniciar también el servicio de red
systemctl restart NetworkManager
```

### 6. Verificación Post-Reinicio

Después de reiniciar los servicios:

```bash
# Verificar que libvirtd está activo
systemctl is-active libvirtd

# Comprobar la red virtual
virsh net-list --all

# Verificar la conectividad de la MV
ping IP_DE_LA_MV
```

### Solución de Problemas Comunes

1. **Error de Bridge Virtual**:

   - Verificar que virbr0 existe y está activo
   - Comprobar que la MV está conectada al bridge correcto
   - Reiniciar libvirtd si es necesario

2. **Problemas de DHCP**:

   - Verificar que el servicio DHCP de libvirt está funcionando
   - Comprobar los logs: `journalctl -u libvirtd`
   - Revisar la configuración de red en `/etc/libvirt/qemu/`

3. **Conflictos de IP**:
   - Verificar que no hay IPs duplicadas en la red
   - Comprobar el rango DHCP en la configuración de red virtual
   - Liberar y renovar la IP de la MV

### Prevención

Para evitar futuros problemas:

1. Mantener copias de seguridad de las configuraciones de red
2. Documentar las IPs asignadas a cada MV
3. Verificar regularmente el estado de los servicios de red
4. Mantener actualizado el sistema host y las MVs

**Nota**: Siempre es recomendable tener acceso por consola configurado en las MVs como método de recuperación alternativo cuando la red no está disponible.
