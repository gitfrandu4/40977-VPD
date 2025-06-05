## Guía de Estudio para Examen Práctico de Virtualización (KVM/Libvirt)

**Principios Fundamentales (Conceptos Teóricos Clave):**

1.  **KVM/QEMU/Libvirt:**
    *   **KVM:** Módulo del kernel de Linux que convierte Linux en un hipervisor de tipo 1 (bare-metal). Proporciona la virtualización asistida por hardware.
    *   **QEMU:** Emulador de máquinas y procesadores. En el contexto de KVM, QEMU se encarga de emular el hardware de la máquina virtual (BIOS, dispositivos, etc.) mientras KVM maneja la ejecución de las instrucciones de la CPU de la MV directamente en la CPU del anfitrión.
    *   **Libvirt:** API, demonio (`libvirtd`) y conjunto de herramientas de gestión (como `virsh`, `virt-manager`) que proporciona una capa de abstracción para interactuar con diferentes hipervisores (KVM, Xen, etc.). Gestiona VMs, almacenamiento, redes.

2.  **Componentes de una Máquina Virtual (Dominio en terminología libvirt):**
    *   **Definición XML:** Archivo que describe la configuración de la MV (nombre, UUID, memoria, vCPUs, dispositivos de disco, interfaces de red, etc.). Se encuentra típicamente en `/etc/libvirt/qemu/nombre_vm.xml`.
    *   **Imagen de Disco:** Archivo que contiene el sistema de archivos de la MV (ej. `mvp1.qcow2`).
        *   **Formatos:**
            *   `raw`: Ocupa todo el espacio asignado desde el inicio, buen rendimiento.
            *   `qcow2` (QEMU Copy On Write 2): Formato por defecto, más flexible. Permite *thin provisioning* (crecimiento dinámico), snapshots, compresión.
    *   **UUID:** Identificador único universal para cada MV.
    *   **Dirección MAC:** Identificador único para cada interfaz de red virtual. Debe ser única en la red.

3.  **Almacenamiento en Libvirt:**
    *   **Pool de Almacenamiento (Contenedor):** Fuente de almacenamiento gestionada por libvirt. Puede ser un directorio local, una partición, un volumen LVM, o recursos de red como NFS.
        *   **Tipos de Pool Comunes:**
            *   `dir`: Un directorio en el sistema de archivos del anfitrión (ej. `/var/lib/libvirt/images`).
            *   `fs`: Un sistema de archivos pre-formateado montado (ej. una partición).
            *   `netfs`: Un sistema de archivos en red (ej. NFS).
    *   **Volumen de Almacenamiento:** Unidad de almacenamiento dentro de un pool (ej. la imagen de disco de una MV).

4.  **Redes Virtuales en Libvirt:**
    *   **Switch Virtual:** Componente software en el anfitrión (implementado como un bridge de Linux, ej. `virbr0`) al que se conectan las MVs.
    *   **Modos de Red Comunes:**
        *   **NAT (Network Address Translation):** Modo por defecto. Las MVs están en una red privada y acceden al exterior a través del anfitrión, que realiza NAT. El anfitrión actúa como router y servidor DHCP para las MVs.
        *   **Red Aislada:** Las MVs pueden comunicarse entre sí y con el anfitrión (si el anfitrión tiene IP en esa red), pero no tienen acceso a redes externas a través de esta interfaz. No suele haber DHCP por defecto.
        *   **Bridge (Puente):** Conecta directamente la interfaz de la MV a una interfaz física del anfitrión (o a un bridge que contenga una interfaz física). La MV aparece como un host más en la red física del anfitrión, obteniendo IP de la LAN.
    *   **`dnsmasq`:** Servicio ligero que libvirt suele usar para proporcionar DHCP y DNS a las redes virtuales NAT.

5.  **Herramientas Clave:**
    *   **`virsh`:** Herramienta de línea de comandos principal para interactuar con libvirt.
    *   **`virt-install`:** Para crear MVs e iniciar la instalación del SO.
    *   **`virt-clone`:** Para clonar MVs existentes.
    *   **`virt-manager`:** GUI para gestionar MVs.
    *   **`nmcli`:** Para configurar interfaces de red en el anfitrión y en las MVs (basadas en Fedora/RHEL).
    *   **`firewall-cmd`:** Para configurar el cortafuegos en el anfitrión.

---

### 1. Crear un Nuevo Dominio (Máquina Virtual)

#### A. Clonación

**Concepto:** Crear una copia exacta de una MV existente. `virt-clone` automatiza la creación de un nuevo UUID, una nueva MAC (si no se especifica) y la copia del disco.

**1. Clonación con `virt-clone` (Método Preferido y Más Común en Examen)**
    *   **Comando:**
        ```bash
        virt-clone --original <nombre_vm_original> \
                   --name <nombre_vm_nueva> \
                   --file /ruta/al/nuevo/disco.qcow2 \
                   [--mac <NUEVA_MAC_UNICA>]
        ```
    *   **Ejemplo (de p2, p3, p4, p5):**
        ```bash
        # Clonar mvp1 a mvp3, especificando una MAC nueva
        virt-clone --original mvp1 --name mvp3 --file /var/lib/libvirt/images/mvp3.qcow2 --mac=00:16:3e:37:a0:03

        # Clonar mvp1 a mvp4_lqd25, almacenando el disco en un pool NFS (CONT_VOL_COMP)
        # Nota: CONT_VOL_COMP está montado en /var/lib/libvirt/images/COMPARTIDO
        virt-clone --original mvp1 --name mvp4_lqd25 --file /var/lib/libvirt/images/COMPARTIDO/pc25_LQD_ANFITRION1_p4.qcow2 --mac=00:16:3e:31:13:b3
        ```
    *   **Opciones Clave:**
        *   `--original <vm>`: Nombre de la VM a clonar (debe estar apagada o libvirt intentará gestionarlo).
        *   `--name <nuevo_nombre>`: Nombre para la VM clonada.
        *   `--file /ruta/nuevo_disco.qcow2`: Ruta completa y nombre para la imagen de disco del clon. Si se clona a un pool diferente al `default`, asegúrate de que la ruta sea correcta para ese pool.
        *   `--mac <XX:XX:XX:XX:XX:XX>`: (Opcional pero **MUY RECOMENDADO**) Especifica una MAC única para la interfaz de red del clon. Si no se especifica, `virt-clone` intentará generar una.
    *   **Verificación:**
        ```bash
        virsh list --all # Debería aparecer la nueva MV apagada
        virsh start <nombre_vm_nueva>
        virsh domifaddr <nombre_vm_nueva> # Para ver la IP y MAC asignadas
        ```

**2. Clonación con `virt-manager` (GUI)**
    *   Mencionado en p2.
    *   Pasos: Apagar VM original -> Clic derecho en `virt-manager` -> Clonar -> Seguir asistente (especificar nombre, clonar almacenamiento completo).
    *   `virt-manager` se encarga de generar nuevos UUID y MAC.

#### B. Creación Manual (Copiando Ficheros)

**Concepto:** Recrear una MV copiando su archivo XML de definición y su imagen de disco, y luego modificando el XML para asegurar la unicidad. Es más propenso a errores pero útil para entender los componentes.

*   **Secuencia (de p2 Tarea 2):**
    1.  **Copiar y renombrar archivo XML:**
        ```bash
        cp /etc/libvirt/qemu/mvp1.xml /etc/libvirt/qemu/clon_copiando_ficheros.xml
        ```
    2.  **Editar el nuevo archivo XML (`clon_copiando_ficheros.xml`):**
        *   Cambiar el tag `<name>`: `<name>clon_copiando_ficheros</name>`
        *   Generar y cambiar el tag `<uuid>`: `<uuid>NUEVO_UUID_AQUI</uuid>` (puedes usar `uuidgen` en la terminal para generar uno).
        *   Actualizar la ruta del disco en `<source file='...'/>`: `<source file='/var/lib/libvirt/images/clon_copiando_ficheros.qcow2'/>`
        *   Cambiar la dirección MAC en `<mac address='...'/>`: `<mac address='NUEVA_MAC_AQUI'/>` (puedes usar un script o generarla manualmente `00:16:3E:XX:XX:XX`).
    3.  **Copiar y renombrar imagen de disco:**
        ```bash
        cp /var/lib/libvirt/images/fedora.qcow2 /var/lib/libvirt/images/clon_copiando_ficheros.qcow2
        ```
    4.  **Ajustar permisos del disco (importante):**
        ```bash
        # El usuario qemu necesita acceder al disco
        chown qemu:qemu /var/lib/libvirt/images/clon_copiando_ficheros.qcow2
        chmod 600 /var/lib/libvirt/images/clon_copiando_ficheros.qcow2 # O 640 si SELinux lo requiere
        ```
    5.  **Definir la MV en libvirt:**
        ```bash
        virsh define /etc/libvirt/qemu/clon_copiando_ficheros.xml
        ```
    6.  **Verificar y arrancar:**
        ```bash
        virsh list --all
        virsh start clon_copiando_ficheros
        ```

#### C. Creación con `virt-install`

**Concepto:** Crear una nueva MV desde cero, especificando sus recursos e iniciando una instalación del SO desde una ISO.

*   **Comando (de p1 Tarea 10 y p2 Tarea 5):**
    ```bash
    virt-install \
      --name <nombre_vm> \
      --ram <MB_RAM> \
      --vcpus <numero_vcpus> \
      --disk path=/ruta/al/disco.qcow2,size=<GB_disco>,format=qcow2 \
      --os-variant <distro_variant> \
      --cdrom /ruta/a/la/iso_instalacion.iso \
      --network network=<nombre_red_libvirt>,model=virtio \
      [--graphics vnc,listen=0.0.0.0 --noautoconsole]
      [--mac <XX:XX:XX:XX:XX:XX>] # Opcional, libvirt generará una
    ```
*   **Ejemplo (de p2):**
    ```bash
    virt-install \
      --name Creacion_virt_install \
      --ram 2048 \
      --vcpus 1 \
      --disk path=/var/lib/libvirt/images/Creacion_virt_install.qcow2,size=10 \
      --os-variant fedora40 \
      --cdrom /ISO/Fedora-Server-netinst-x86_64-41-1.4.iso \
      --network network=default,model=virtio
    ```
*   **Opciones Clave:**
    *   `--name`: Nombre de la MV.
    *   `--ram`: RAM en MB.
    *   `--vcpus`: Número de CPUs virtuales.
    *   `--disk path=...,size=...,format=...`: Define el disco virtual.
        *   `path`: Ubicación de la imagen de disco (se creará).
        *   `size`: Tamaño en GB.
        *   `format`: `qcow2` o `raw`.
    *   `--os-variant`: Ayuda a libvirt/QEMU a optimizar para un SO específico (ej. `fedora41`, `rhel9`, `ubuntu22.04`, `win10`). Usa `osinfo-query os` para listar variantes.
    *   `--cdrom`: Ruta a la imagen ISO de instalación.
    *   `--network network=...,model=...`: Configura la red.
        *   `network=default`: Conecta a la red NAT por defecto `default`. Puedes usar otras redes definidas en libvirt.
        *   `model=virtio`: **MUY RECOMENDADO** para mejor rendimiento.
    *   `--graphics vnc,listen=0.0.0.0`: Configura acceso gráfico vía VNC.
    *   `--noautoconsole`: No abre automáticamente la consola gráfica/texto.
*   **Proceso:**
    1.  `virt-install` define la MV y crea el disco.
    2.  Arranca la MV desde la ISO.
    3.  Se abre una consola (gráfica o texto) para realizar la instalación del SO.
    4.  **Post-instalación (dentro de la MV):**
        *   Instalar `qemu-guest-agent` (p1).
        *   Configurar hostname.
        *   Configurar red si es necesario (IP estática, etc.).

---

### 2. Crear un Contenedor de Almacenamiento (Pool)

**Concepto:** Definir una fuente de almacenamiento que libvirt puede usar para crear volúmenes (imágenes de disco).

#### A. Pool de Tipo `dir` (Directorio en Anfitrión)

*   El pool `default` suele ser de este tipo, apuntando a `/var/lib/libvirt/images`.
*   **Creación (si necesitas uno nuevo):**
    1.  **Crear el directorio en el anfitrión:**
        ```bash
        mkdir -p /ruta/a/mi/nuevo_pool_directorio
        ```
    2.  **Definir, construir e iniciar el pool:**
        ```bash
        virsh pool-define-as <nombre_pool_dir> dir --target /ruta/a/mi/nuevo_pool_directorio
        virsh pool-build <nombre_pool_dir>
        virsh pool-start <nombre_pool_dir>
        virsh pool-autostart <nombre_pool_dir>
        ```
    *   **Verificación:**
        ```bash
        virsh pool-list --all
        virsh pool-info <nombre_pool_dir>
        ```

#### B. Pool de Tipo `fs` (Sistema de Archivos sobre Partición Lógica)

*   **Concepto (de p3 Tarea 3):** Usar una partición existente del anfitrión (ej. `/dev/sda12`) como base para un pool. La partición debe estar formateada y montada.
*   **Secuencia (de p3 Tarea 3):**
    1.  **Crear partición en anfitrión (si no existe):** `fdisk /dev/sda` (crear `/dev/sda12` como ejemplo).
    2.  **Formatear la partición:** `mkfs.ext4 /dev/sda12` (o `mkfs.xfs`).
    3.  **Crear punto de montaje en anfitrión:** `mkdir -p /var/lib/libvirt/Pool_Particion`.
    4.  **Montar la partición:** `mount /dev/sda12 /var/lib/libvirt/Pool_Particion`.
    5.  **Hacer montaje persistente (editar `/etc/fstab` en anfitrión):**
        ```bash
        # Obtener UUID
        blkid /dev/sda12
        # Añadir a /etc/fstab (ejemplo)
        # UUID=d49322db-... /var/lib/libvirt/Pool_Particion ext4 defaults 0 0
        ```
    6.  **Definir, construir e iniciar el pool en libvirt:**
        ```bash
        virsh pool-define-as Contenedor_Particion fs --source-dev /dev/sda12 --target /var/lib/libvirt/Pool_Particion
        virsh pool-build Contenedor_Particion
        virsh pool-start Contenedor_Particion
        virsh pool-autostart Contenedor_Particion
        ```
        *   `--source-dev`: Dispositivo de bloque fuente.
        *   `--target`: Punto de montaje donde libvirt gestionará los volúmenes.

#### C. Pool de Tipo `netfs` (NFS)

*   **Concepto (de p3 Tarea 4 y 5):** Usar un recurso compartido NFS como pool.
*   **Secuencia (de p3):**
    1.  **Crear directorio de montaje local en anfitrión:** `mkdir -p /var/lib/libvirt/images/ISOS` (para ISOs) o `mkdir -p /var/lib/libvirt/images/COMPARTIDO` (para volúmenes).
    2.  **Verificar accesibilidad del servidor NFS:** `ping <servidor_nfs>`, `showmount -e <servidor_nfs>`.
    3.  **Definir, construir e iniciar el pool:**
        ```bash
        # Para ISOs (normalmente solo lectura)
        virsh pool-define-as CONT_ISOS_COMP netfs \
          --source-host disnas2.dis.ulpgc.es \
          --source-path /imagenes/fedora/41/isos/x86_64 \
          --target /var/lib/libvirt/images/ISOS

        # Para volúmenes de VM (lectura/escritura)
        virsh pool-define-as CONT_VOL_COMP netfs \
          --source-host disnas2.dis.ulpgc.es \
          --source-path /disnas2-itsi \
          --target /var/lib/libvirt/images/COMPARTIDO
        ```
        ```bash
        virsh pool-build <nombre_pool_nfs>
        virsh pool-start <nombre_pool_nfs>
        # virsh pool-autostart <nombre_pool_nfs> # p3 indica desactivar autostart para estos
        ```
    *   **Verificación:** `mount | grep <servidor_nfs>` para ver si el anfitrión ha montado el NFS.

#### Comandos Generales de Gestión de Pools:

*   `virsh pool-list [--all]`: Lista pools.
*   `virsh pool-info <nombre_pool>`: Muestra información del pool.
*   `virsh pool-dumpxml <nombre_pool>`: Muestra la definición XML del pool.
*   `virsh pool-undefine <nombre_pool>`: Elimina la definición del pool (no borra los datos si es `dir` o `fs` local, pero desmonta si es `netfs`).
*   `virsh pool-destroy <nombre_pool>`: Detiene el pool (desmonta `netfs`).
*   `virsh pool-delete <nombre_pool>`: Destruye y elimina el pool (cuidado, puede borrar datos).

---

### 3. Crear un Volumen de Almacenamiento (en un Contenedor)

**Concepto:** Crear un archivo (ej. `.qcow2` o `.img`) dentro de un pool que servirá como disco para una MV.

*   **Comando (de p3):**
    ```bash
    virsh vol-create-as <nombre_pool> <nombre_volumen.formato> <tamaño_G_o_M> --format <raw|qcow2> [--prealloc-metadata]
    ```
*   **Ejemplos (de p3):**
    *   Crear volumen `raw` en el pool `default`:
        ```bash
        virsh vol-create-as default Vol1_p3.img 1G --format raw
        ```
    *   Crear volumen `qcow2` en el pool `Contenedor_Particion`:
        ```bash
        virsh vol-create-as Contenedor_Particion Vol2_p3 1G --format qcow2
        ```
    *   Crear volumen `qcow2` en el pool NFS `CONT_VOL_COMP`:
        ```bash
        virsh vol-create-as CONT_VOL_COMP pc25_LQD_ANFITRION1_Vol3_p3 1G --format qcow2 --prealloc-metadata
        ```
*   **Opciones Clave:**
    *   `<nombre_pool>`: Pool donde se creará el volumen.
    *   `<nombre_volumen.formato>`: Nombre del archivo del volumen, incluyendo su extensión (ej. `Vol1_p3.img` o `Vol2_p3.qcow2`).
    *   `<tamaño>`: Tamaño del volumen (ej. `1G`, `512M`).
    *   `--format <raw|qcow2>`: Especifica el formato del volumen.
    *   `--prealloc-metadata`: (Para `qcow2`) Preasigna metadatos, puede mejorar rendimiento en algunos casos, especialmente sobre NFS.
*   **Comandos de Gestión de Volúmenes:**
    *   `virsh vol-list <nombre_pool>`: Lista volúmenes en un pool.
    *   `virsh vol-info <nombre_volumen> --pool <nombre_pool>`: Información del volumen.
    *   `virsh vol-dumpxml <nombre_volumen> --pool <nombre_pool>`: XML del volumen.
    *   `virsh vol-path <nombre_volumen> --pool <nombre_pool>`: Muestra la ruta completa al archivo del volumen.
    *   `virsh vol-delete <nombre_volumen> --pool <nombre_pool>`: Elimina el volumen (¡borra el archivo!).

---

### 4. Conectar un Volumen a una Máquina Virtual

**Concepto:** Asociar un volumen de almacenamiento (creado previamente o un archivo existente) a una MV como un dispositivo de disco.

*   **Comando (de p3):**
    ```bash
    virsh attach-disk <nombre_vm> <ruta_al_volumen_o_dispositivo> <target_dev_en_vm> \
      --type disk \
      --driver qemu \
      --subdriver <raw|qcow2> \
      --config \
      [--targetbus <virtio|sata|scsi|ide>] \
      [--persistent] # --config es lo mismo que --persistent para attach-disk
    ```
*   **Ejemplos (de p3):**
    *   Asociar `Vol1_p3.img` (raw) a `mvp3` como `sda`:
        ```bash
        # La ruta puede obtenerse con: virsh vol-path Vol1_p3.img --pool default
        virsh attach-disk mvp3 /var/lib/libvirt/images/Vol1_p3.img sda --type disk --driver qemu --subdriver raw --config
        ```
    *   Asociar partición física `/dev/sda11` (tratada como raw) a `mvp3` como `sdb`:
        ```bash
        virsh attach-disk mvp3 /dev/sda11 sdb --type disk --driver qemu --subdriver raw --config
        ```
        **¡CUIDADO!** Esto da acceso directo a la partición.
    *   Asociar `Vol2_p3` (qcow2 desde `Contenedor_Particion`) a `mvp3` como `vdb` (bus virtio implícito si el SO lo soporta):
        ```bash
        # Ruta: virsh vol-path Vol2_p3 --pool Contenedor_Particion
        virsh attach-disk mvp3 /var/lib/libvirt/Pool_Particion/Vol2_p3 vdb --type disk --driver qemu --subdriver qcow2 --config
        ```
    *   Asociar `pc25_LQD_ANFITRION1_Vol3_p3` (qcow2 desde NFS `CONT_VOL_COMP`) a `mvp3` como `vdc` usando bus virtio explícitamente:
        ```bash
        virsh attach-disk mvp3 /var/lib/libvirt/images/COMPARTIDO/pc25_LQD_ANFITRION1_Vol3_p3 vdc \
          --type disk --driver qemu --subdriver qcow2 --targetbus virtio --persistent
        ```
*   **Opciones Clave:**
    *   `<nombre_vm>`: MV a la que se conectará el disco.
    *   `<ruta_al_volumen_o_dispositivo>`: Puede ser la ruta completa al archivo del volumen (obtenida con `virsh vol-path`), una partición física (`/dev/sdXN`), o la clave del volumen si es un pool gestionado.
    *   `<target_dev_en_vm>`: Nombre del dispositivo como se verá dentro de la MV (ej. `sda`, `sdb`, `vda`, `vdb`). `vdX` suele indicar bus virtio.
    *   `--type disk`: Especifica que es un disco. (También puede ser `cdrom`, `floppy`).
    *   `--driver qemu`: Usar el controlador QEMU.
    *   `--subdriver <raw|qcow2>`: Formato del disco.
    *   `--config` o `--persistent`: Hace el cambio persistente en la definición XML de la MV. **¡ESENCIAL para que sobreviva reinicios!**
    *   `--targetbus <virtio|sata|scsi|ide>`: (Opcional) Especifica el tipo de bus. `virtio` es recomendado para rendimiento si el SO invitado tiene los drivers.
*   **Verificación:**
    *   En el anfitrión: `virsh domblklist <nombre_vm> [--details]`
    *   En la MV:
        *   `lsblk` (para ver el nuevo dispositivo de bloque).
        *   `fdisk -l /dev/<target_dev_en_vm>` (para ver detalles).
*   **Configuración dentro de la MV (si es un disco nuevo/vacío):**
    1.  Particionar (si se desea): `fdisk /dev/<target_dev_en_vm>` (crear partición, ej. `/dev/sda1`).
    2.  Formatear: `mkfs.xfs /dev/<target_dev_en_vm_o_particion>` (ej. `mkfs.xfs /dev/sda1`).
    3.  Crear punto de montaje: `mkdir /mnt/nuevo_disco`.
    4.  Montar: `mount /dev/<target_dev_en_vm_o_particion> /mnt/nuevo_disco`.
    5.  Hacer montaje persistente (editar `/etc/fstab` en la MV):
        ```bash
        # Obtener UUID de la partición/disco formateado
        blkid /dev/<target_dev_en_vm_o_particion>
        # Añadir a /etc/fstab (ejemplo)
        # UUID=xxx-yyy-zzz /mnt/nuevo_disco xfs defaults 0 0
        ```
*   **Desconectar un disco:**
    ```bash
    virsh detach-disk <nombre_vm> <target_dev_en_vm> --config
    ```

---

### 5. Lo Mismo con las Interfaces de Red

#### A. Crear una Red Virtual (Switch Virtual)

**Concepto:** Definir una red (NAT, aislada, etc.) a la que se conectarán las interfaces de las MVs.

*   **Secuencia (de p5):**
    1.  **Crear archivo de definición XML de la red (ej. `mi-red-nat.xml`):**
        ```xml
        <!-- Red NAT -->
        <network>
          <name>MiRedNAT</name>
          <forward mode='nat'/>
          <bridge name='virbr10' stp='on' delay='0'/> <!-- Usar un nombre de bridge no existente, ej virbr10, virbr11 -->
          <ip address='192.168.150.1' netmask='255.255.255.0'>
            <dhcp>
              <range start='192.168.150.100' end='192.168.150.200'/>
            </dhcp>
          </ip>
        </network>

        <!-- Red Aislada -->
        <network>
          <name>MiRedAislada</name>
          <bridge name='virbr11' stp='on' delay='0'/>
          <ip address='10.10.10.1' netmask='255.255.255.0'>
            <!-- Sin <forward> y sin <dhcp> (o con DHCP si se desea para la red aislada) -->
          </ip>
        </network>
        ```
        *   **Clave para NAT:** `<forward mode='nat'/>` y sección `<dhcp>`.
        *   **Clave para Aislada:** **Omitir** `<forward .../>`. El DHCP es opcional.
    2.  **Definir, iniciar y auto-arrancar la red:**
        ```bash
        virsh net-define mi-red-nat.xml
        virsh net-start MiRedNAT
        virsh net-autostart MiRedNAT
        # Repetir para MiRedAislada si se crea
        ```
    *   **Verificación:**
        *   `virsh net-list --all`
        *   `virsh net-info <nombre_red>`
        *   `ip addr show <nombre_bridge_ej_virbr10>` (en el anfitrión)
        *   `iptables -t nat -L -v` (para ver reglas de MASQUERADE si es NAT)

#### B. Crear una Interfaz de Red de Tipo Bridge (Conexión a Red Física)

**Concepto (de p5 Tarea 5):** Permitir que la MV se conecte directamente a la red física del anfitrión, como si fuera otro equipo en la LAN. Esto implica crear un bridge en el anfitrión y añadir la interfaz física del anfitrión a ese bridge.

*   **Secuencia (en el anfitrión, usando `nmcli`):**
    1.  **Crear el bridge:**
        ```bash
        nmcli con add type bridge con-name bridge0 ifname bridge0
        ```
    2.  **Añadir la interfaz física del anfitrión (ej. `enp6s0`) al bridge:**
        *   Primero, desconfigurar IP de la interfaz física (si la tiene y la quieres en el bridge).
        *   Luego, añadirla como esclava:
            ```bash
            nmcli con add type ethernet slave-type bridge con-name bridge0-port0 ifname enp6s0 master bridge0
            # O si enp6s0 ya tiene una conexión gestionada por NetworkManager:
            # nmcli con down enp6s0-conexion-existente
            # nmcli con mod enp6s0-conexion-existente master bridge0
            ```
    3.  **Configurar IP en el bridge (opcional, si quieres que el anfitrión tenga IP en esa red a través del bridge):**
        ```bash
        nmcli con mod bridge0 ipv4.addresses 10.140.92.125/24 ipv4.gateway 10.140.92.1 ipv4.dns "8.8.8.8,1.1.1.1" ipv4.method manual
        # O para DHCP:
        # nmcli con mod bridge0 ipv4.method auto
        ```
    4.  **Activar conexiones:**
        ```bash
        nmcli con up bridge0
        nmcli con up bridge0-port0 # O el nombre de la conexión de la interfaz física
        ```
    *   **Verificación:** `ip addr show bridge0`, `brctl show`.

#### C. Conectar una Interfaz de Red a una MV

**Concepto:** Añadir una tarjeta de red virtual a la MV y conectarla a una red virtual de libvirt (NAT/Aislada) o a un bridge del anfitrión.

*   **Comando (de p5):**
    ```bash
    virsh attach-interface <nombre_vm> <tipo_fuente> <nombre_fuente> \
      --model virtio \
      --mac <NUEVA_MAC_UNICA> \
      --config \
      [--persistent] # --config es lo mismo que --persistent
    ```
*   **Ejemplos (de p5):**
    *   Conectar a red libvirt "Cluster" (NAT):
        ```bash
        virsh attach-interface mvp5 network Cluster --model virtio --config
        # MAC se autogenerará si no se especifica con --mac
        ```
    *   Conectar a red libvirt "Almacenamiento" (Aislada):
        ```bash
        virsh attach-interface mvp5 network Almacenamiento --model virtio --config
        ```
    *   Conectar al bridge del anfitrión "bridge0":
        ```bash
        virsh attach-interface mvp5 bridge bridge0 --model virtio --mac 00:16:3e:6b:8b:d9 --config
        ```
*   **Opciones Clave:**
    *   `<tipo_fuente>`:
        *   `network`: Para conectar a una red virtual definida en libvirt (ej. "Cluster", "default").
        *   `bridge`: Para conectar a un bridge existente en el anfitrión (ej. "bridge0").
    *   `<nombre_fuente>`: Nombre de la red libvirt o del bridge del anfitrión.
    *   `--model virtio`: **MUY RECOMENDADO**.
    *   `--mac <XX:XX:XX:XX:XX:XX>`: **ESENCIAL** si añades múltiples interfaces o clonas, para asegurar unicidad.
    *   `--config`: Para persistencia.
*   **Verificación:**
    *   Anfitrión: `virsh domiflist <nombre_vm>` (muestra la MAC y a qué está conectada).
    *   Anfitrión: `virsh domifaddr <nombre_vm>` (tras arrancar la VM y obtener IP).
    *   MV: `ip addr show` (para ver la nueva interfaz, ej. `enpXsY`).
*   **Configuración dentro de la MV:**
    *   **Si la red tiene DHCP (ej. NAT, o bridge a LAN con DHCP):** La interfaz debería obtener IP automáticamente.
    *   **Si la red NO tiene DHCP (ej. Aislada, o bridge sin DHCP en LAN):** Necesitas configurar IP estática.
        *   Usando `nmcli` (de p5 Tarea 4):
            ```bash
            # Identificar nombre de la nueva interfaz (ej. enp7s0) con ip addr
            nmcli connection add type ethernet con-name <nombre_conexion_descriptivo> ifname <enpXsY> \
              ipv4.method manual ipv4.addresses <IP_ESTATICA/MASK> [ipv4.gateway <GW>] [ipv4.dns <DNS>]
            nmcli connection up <nombre_conexion_descriptivo>
            ```
        *   Verificar con `ip addr show <enpXsY>`, `ip route`.
*   **Desconectar una interfaz:**
    ```bash
    # Identificar MAC con virsh domiflist <vm_name>
    virsh detach-interface <nombre_vm> network --mac <MAC_A_BORRAR> --config
    # O para bridge:
    # virsh detach-interface <nombre_vm> bridge --mac <MAC_A_BORRAR> --config
    ```

---

### Comandos `virsh` Esenciales para el Examen:

*   **Gestión de VMs (Dominios):**
    *   `virsh list [--all]`
    *   `virsh start <vm>`
    *   `virsh shutdown <vm>` (apagado ordenado, requiere ACPI en MV)
    *   `virsh destroy <vm>` (apagado forzado)
    *   `virsh undefine <vm> [--remove-all-storage]` (elimina definición, opcionalmente borra discos gestionados por libvirt)
    *   `virsh define /ruta/a/vm.xml`
    *   `virsh dominfo <vm>`
    *   `virsh domiflist <vm>` (interfaces de red de la VM)
    *   `virsh domifaddr <vm>` (direcciones IP de las interfaces de la VM)
    *   `virsh domblklist <vm>` (dispositivos de bloque de la VM)
    *   `virsh edit <vm>` (para editar XML, ¡cuidado!)
    *   `virsh console <vm>` (acceso a consola serie, requiere configuración en MV)
    *   `virsh reboot <vm>`

*   **Gestión de Pools de Almacenamiento:**
    *   `virsh pool-list [--all]`
    *   `virsh pool-define-as <nombre> <tipo> [opciones]`
    *   `virsh pool-define <fichero.xml>`
    *   `virsh pool-build <pool>`
    *   `virsh pool-start <pool>`
    *   `virsh pool-autostart <pool>`
    *   `virsh pool-info <pool>`
    *   `virsh pool-dumpxml <pool>`
    *   `virsh pool-undefine <pool>`
    *   `virsh pool-destroy <pool>`

*   **Gestión de Volúmenes de Almacenamiento:**
    *   `virsh vol-list <pool>`
    *   `virsh vol-create-as <pool> <nombre> <tamaño> --format <formato>`
    *   `virsh vol-info <volumen> --pool <pool>`
    *   `virsh vol-path <volumen> --pool <pool>`
    *   `virsh vol-dumpxml <volumen> --pool <pool>`
    *   `virsh vol-delete <volumen> --pool <pool>`

*   **Gestión de Redes Virtuales:**
    *   `virsh net-list [--all]`
    *   `virsh net-define <fichero.xml>`
    *   `virsh net-start <red>`
    *   `virsh net-autostart <red>`
    *   `virsh net-info <red>`
    *   `virsh net-dumpxml <red>`
    *   `virsh net-undefine <red>`
    *   `virsh net-destroy <red>`
    *   `virsh net-dhcp-leases <red>` (para ver asignaciones DHCP)

*   **Gestión de Interfaces de Dispositivos (Discos, Red):**
    *   `virsh attach-disk <vm> <fuente> <destino> [opciones] --config`
    *   `virsh detach-disk <vm> <destino> --config`
    *   `virsh attach-interface <vm> <tipo_fuente> <fuente> [opciones] --config`
    *   `virsh detach-interface <vm> <tipo_fuente> --mac <MAC> --config`

---

**Consejos Adicionales para el Examen:**

1.  **MAC y UUID:** Siempre asegúrate de que las MACs de red y los UUIDs de las VMs sean únicos, especialmente al clonar o copiar manualmente.
2.  **Persistencia (`--config`):** Muchos comandos `attach-*` o de definición tienen una opción como `--config` o `--persistent` para que los cambios sobrevivan a reinicios del servicio `libvirtd` o del anfitrión. ¡No la olvides!
3.  **Verificación Constante:** Después de cada paso importante, verifica el resultado (`virsh list`, `ip addr`, `ping`, `lsblk`).
4.  **`--help`:** Si dudas de un comando `virsh`, usa `virsh <comando> --help` para ver sus opciones.
5.  **Permisos:** Al trabajar con archivos directamente (copia manual, pools tipo `dir`), asegúrate de que el usuario `qemu` (o el que ejecute las VMs) tenga los permisos correctos.
6.  **Nombres de Dispositivos en la MV:** Los nombres como `sda`, `sdb`, `enp1s0`, `enp7s0` dentro de la MV pueden variar. Usa `lsblk` y `ip addr show` dentro de la MV para identificarlos correctamente antes de particionar, formatear o configurar.
7.  **Consola Serie (p5):** Saber configurarla es vital si vas a manipular interfaces de red que te dejen sin acceso VNC/SSH inicial. Pasos clave:
    *   Editar `/etc/default/grub` en la MV (añadir `console=ttyS0` a `GRUB_CMDLINE_LINUX`).
    *   `grub2-mkconfig -o /boot/grub2/grub.cfg` en la MV.
    *   Reiniciar MV.
    *   Conectar desde anfitrión con `virsh console <nombre_vm>`.
8.  **`qemu-guest-agent` (p1):** Instálalo en tus MVs base. Mejora la interacción (apagado suave, información de IP).
9.  **Entender el Flujo:** ¿Qué estoy creando? ¿Dónde se almacena? ¿Cómo se conecta? Visualiza los componentes.
