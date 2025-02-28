# Práctica 3

## Tarea 1

Paso 1 clonamos

```
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

```
root@lq-d25:~# virsh vol-create-as default Vol1_p3 1G --format raw
Se ha creado el volumen Vol1_p3

```

2. attach with sdb

```
root@lq-d25:~# virsh attach-disk mvp3 /var/lib/libvirt/images/Vol1_p3 sdb --config --type disk --driver qemu --subdriver raw
El disco ha sido asociado exitosamente
```

Significado: hemos conectado el volumen a la mv mvp3 a través del bus SATA

¡¡¡¡¡¡¡¡¡Observación importante: A pesar de haber especificado "sdb", el disco aparece como "sda" en la VM. Esto ocurre porque:

- La asignación de nombres en el huésped (VM) depende de la configuración interna y el orden de detección.
- El hipervisor asigna la interfaz (SATA en este caso), pero la VM asigna los nombres de dispositivo.

Conceptos clave de virtualizacion:

- Storage Pool: Es un reservorio de almacenamiento gestionado por el hipervisor. En tu caso, usaste el pool "default".
- Volumen virtual: Un archivo o dispositivo que actúa como un disco físico para la máquina virtual.
- Bus SATA: Interfaz de conexión para dispositivos de almacenamiento. Al adjuntar el disco, estás emulando una conexión SATA física.
- Persistencia de configuración: La opción `--config` garantiza que el disco permanezca conectado incluso después de reiniciar la VM.

3. verification

```
root@lq-d25:~# virsh domblklist mvp3
 Destino   Fuente
-----------------------------------------------
 vda       /var/lib/libvirt/images/mvp3.qcow2
 sda       -

```

Veo que has creado correctamente el volumen y lo has adjuntado a la máquina virtual, pero noto que hay un problema. En la verificación con virsh domblklist mvp3, el nuevo disco aparece como sda en lugar de sdb como especificaste en el comando. [SE HA EXPLICADO ARRIBA]

Para completar la práctica 3 Tarea 1, necesitamos hacer lo siguiente dentro de la máquina virtual mvp3:

1. Iniciamos sesión en la mvp3

```
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

2. Una vez dentro, verificamos que el disco está disponible, observamos que aparece como sda ¿por qué?

```
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

3. vamos a crear la parttición de 512MB en disco con la utilidad fdisk

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

```
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

```
root@mvp1:~# reboot
root@mvp1:~# Connection to 192.168.122.242 closed by remote host.
Connection to 192.168.122.242 closed.
root@lq-d25:~# ssh root@192.168.122.242
Web console: https://mvp1.vpd.com:9090/ or https://192.168.122.242:9090/

Last login: Fri Feb 28 20:10:38 2025 from 192.168.122.1
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

```
root@mvp1:~# mkdir -p /mnt/nuevo_disco
root@mvp1:~# mount /dev/sda1 /mnt/nuevo_disco
```

Verificamos que el sistema de archivos está montado correctamente:

```
root@mvp1:~# df -h /mnt/nuevo_disco
S.ficheros     Tamaño Usados  Disp Uso% Montado en
/dev/sda1        504M    24K  478M   1% /mnt/nuevo_disco
```

Detalles de la partición creada:

```
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

```
root@mvp1:~# touch /mnt/nuevo_disco/test.txt

```

8. Verificamos que se ha creado correctamente

```
root@mvp1:~# ls -l /mnt/nuevo_disco
total 16
drwx------. 2 root root 16384 feb 28 20:15 lost+found
-rw-r--r--. 1 root root     0 feb 28 20:19 test.txt

```

Montaje persistente: para que el montaje sobreviva a reinicio, añadimos una entrada a /etc/fstab

```
echo "/dev/sda1 /mnt/nuevo_disco xfs defaults 0 0" >> /etc/fstab
```

Comprobamos:

```
root@mvp1:~# echo "/dev/sda1 /mnt/nuevo_disco xfs defaults 0 0" >> /etc/fstab
root@mvp1:~# reboot
root@mvp1:~# Connection to 192.168.122.242 closed by remote host.
Connection to 192.168.122.242 closed.
root@lq-d25:~# ssh root@192.168.122.242
Web console: https://mvp1.vpd.com:9090/ or https://192.168.122.242:9090/

Last login: Fri Feb 28 20:24:06 2025 from 192.168.122.1
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

1. Paso 1.  Identificar y crear la partición lógica en el host


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
/dev/sda11
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

## Paso 3: Verificar que la partición está disponible en mvp3

### Iniciar sesión en mvp3
```bash
ssh root@<ip-de-mvp3>
```

### Verificar que el nuevo disco está presente
```bash
lsblk
```
Deberíamos ver el nuevo disco como /dev/sdb

## Paso 4: Crear sistema de archivos XFS en el disco completo

**NOTA**: A diferencia de la Tarea 1, aquí no debemos particionar el disco, sino formatear directamente el dispositivo completo.

```bash
mkfs.xfs /dev/sdb
```

## Paso 5: Montar el sistema de archivos y crear archivo de prueba

```bash
mkdir -p /mnt/disco_fisico
mount /dev/sdb /mnt/disco_fisico
touch /mnt/disco_fisico/test.txt
ls -l /mnt/disco_fisico
```

## Comandos de validación

1. Verificar el montaje:
```bash
df -h | grep sdb
```

2. Verificar el tipo de sistema de archivos:
```bash
mount | grep sdb
```

3. Verificar que el disco no está particionado sino formateado completamente:
```bash
fdisk -l /dev/sdb
```


