#### Tarea 5. Creación de una Tercera Interfaz de Red de Tipo Bridge

En esta tarea crearemos un bridge en el sistema anfitrión (`bridge0`) y añadiremos una tercera interfaz de red a la máquina virtual `mvp5` conectada directamente a este bridge. Esta configuración permitirá que la máquina virtual `mvp5` se comporte como si estuviera conectada directamente a la red física del laboratorio, obteniendo una dirección IP de su servidor DHCP.

##### Recuperación en caso de errores (Tarea 5)

Si has intentado configurar el bridge previamente o necesitas empezar de cero esta tarea, sigue estos pasos para limpiar la configuración existente:

```bash
# En el ANFITRIÓN:

# 1. Desconectar la interfaz de la VM (si existe y está conectada)
#    Reemplaza <MAC_ADDRESS_BRIDGE> con la MAC de la interfaz bridge de mvp5
#    Puedes encontrarla con 'virsh domiflist mvp5'
root@lq-d25:~# virsh detach-interface mvp5 bridge --mac <MAC_ADDRESS_BRIDGE> --config

# 2. Eliminar la conexión del bridge (si existe)
root@lq-d25:~# nmcli con down bridge0 || echo "La conexión bridge0 no estaba activa."
root@lq-d25:~# nmcli con delete bridge0 || echo "La conexión bridge0 no existía."

# 3. Reactivar la conexión de la interfaz física (si estaba en el bridge)
#    Reemplaza <PHYSICAL_INTERFACE_NAME> con el nombre de tu interfaz física (ej: enp6s0)
#    Reemplaza <PHYSICAL_CONNECTION_NAME> con el nombre original de la conexión física
root@lq-d25:~# nmcli con up <PHYSICAL_CONNECTION_NAME> || echo "No se pudo activar la conexión física."

# 4. Verificar que la interfaz física tiene IP y el bridge no existe
root@lq-d25:~# ip addr show <PHYSICAL_INTERFACE_NAME>
root@lq-d25:~# ip addr show bridge0 || echo "La interfaz bridge0 no existe."

# 5. Limpiar entrada en /etc/hosts (si existe)
root@lq-d25:~# sed -i '/mvp5i3.vpd.com/d' /etc/hosts
```

Ahora puedes proceder con la configuración limpia.

**Pasos para configurar el Bridge:**

1.  **Identificar la interfaz física activa:**
    Determina qué interfaz de red del anfitrión está conectada a la red del laboratorio. Normalmente será algo como `eth0`, `enpXsY`, etc. Puedes usar `ip addr` o `nmcli dev status` para identificarla. **Asegúrate de usar el nombre correcto en los siguientes pasos.** En este ejemplo, asumiremos que es `enp6s0`.

    ```bash
    root@lq-d25:~# nmcli device status
    DEVICE  TYPE      STATE      CONNECTION
    enp6s0  ethernet  conectado  Conexión_Física  # <-- Ejemplo de interfaz física conectada
    virbr0  bridge    conectado  virbr0
    virbr1  bridge    conectado  virbr1
    virbr2  bridge    conectado  virbr2
    lo      loopback  conectado  lo
    ```

2.  **Crear la interfaz bridge `br0`:**
    Creamos una nueva interfaz de red de tipo bridge llamada `br0` usando NetworkManager.

    ```bash
    root@lq-d25:~# nmcli con add type bridge ifname br0 con-name bridge0 stp no
    Conexión «bridge0» (uuid) añadida con éxito.
    ```

    - `type bridge`: Especifica que creamos una conexión de tipo bridge.
    - `ifname br0`: Define el nombre de la interfaz de red del kernel para el bridge.
    - `con-name bridge0`: Establece el nombre de la conexión en NetworkManager.
    - `stp no`: Desactiva Spanning Tree Protocol (generalmente no necesario en configuraciones simples).

3.  **Añadir la interfaz física al bridge:**
    Convertimos la interfaz física (`enp6s0` en nuestro ejemplo) en un "esclavo" del bridge `br0`. Esto significa que `br0` tomará el control de la conexión física.

    ```bash
    # Primero, obtenemos el nombre de la conexión activa de la interfaz física
    root@lq-d25:~# IF_FISICA="enp6s0" # ¡¡Asegúrate de poner tu interfaz real aquí!!
    root@lq-d25:~# CON_FISICA=$(nmcli -g GENERAL.CONNECTION device show $IF_FISICA)
    root@lq-d25:~# echo "Interfaz física: $IF_FISICA, Conexión activa: $CON_FISICA"

    # Modificamos la conexión física para que sea esclava del bridge 'br0'
    root@lq-d25:~# nmcli con modify "$CON_FISICA" master br0

    # Reactivamos la conexión física (ahora como esclava) y la del bridge
    root@lq-d25:~# nmcli con up "$CON_FISICA"
    Conexión activada con éxito (ruta activa D-Bus: ...)
    root@lq-d25:~# nmcli con up bridge0
    Conexión activada con éxito (ruta activa D-Bus: ...)
    ```

    > **Importante:** Al añadir la interfaz física al bridge, esta perderá su dirección IP directa. La dirección IP de la red del laboratorio será ahora asignada a la interfaz `br0`. Puede haber una breve interrupción de la conectividad del anfitrión mientras se realiza el cambio.

4.  **Verificar la configuración del bridge:**
    Comprobamos que la interfaz `br0` está activa y ha obtenido (o está obteniendo) una dirección IP de la red del laboratorio. La interfaz física (`enp6s0`) ya no debería tener una IP propia.

    ```bash
    root@lq-d25:~# ip addr show br0
    # Busca una línea 'inet' con la IP de la red del laboratorio
    # Ejemplo: inet 10.10.14.XXX/24 ... scope global dynamic br0

    root@lq-d25:~# ip addr show enp6s0
    # No debería tener una línea 'inet' con la IP principal

    root@lq-d25:~# nmcli device status
    DEVICE  TYPE      STATE      CONNECTION
    br0     bridge    conectado  bridge0      # <-- Bridge activo con IP
    enp6s0  ethernet  conectado  Conexión_Física # <-- Esclavo del bridge
    virbr0  bridge    conectado  virbr0
    virbr1  bridge    conectado  virbr1
    virbr2  bridge    conectado  virbr2
    lo      loopback  conectado  lo
    ```

5.  **Añadir la tercera interfaz de red a `mvp5`:**
    Ahora conectamos la máquina virtual `mvp5` al bridge `br0` que acabamos de crear en el anfitrión.

    ```bash
    # Usa una MAC address única para la VM, siguiendo el patrón del laboratorio si es necesario.
    # Ejemplo: 00:16:3e:XX:XX:XX
    root@lq-d25:~# MAC_BRIDGE="00:16:3e:37:a0:15" # ¡Verifica si esta MAC es adecuada para tu entorno!
    root@lq-d25:~# virsh attach-interface mvp5 bridge br0 --model virtio --mac $MAC_BRIDGE --config
    La interfaz ha sido asociada exitosamente
    ```

    - `mvp5`: Nombre de la máquina virtual.
    - `bridge br0`: Especifica que la interfaz se conectará al bridge `br0` del anfitrión.
    - `--model virtio`: Utiliza el controlador paravirtualizado para mejor rendimiento.
    - `--mac $MAC_BRIDGE`: Asigna una dirección MAC específica. **Es crucial usar una MAC permitida en la red del laboratorio si hay restricciones.**
    - `--config`: Hace el cambio persistente (la interfaz permanecerá después de reiniciar la VM).

    Verificamos que la interfaz se ha añadido:

    ```bash
    root@lq-d25:~# virsh domiflist mvp5
     Interfaz   Tipo      Fuente           Modelo   MAC
    -------------------------------------------------------------------
     vnetX      network   Cluster          virtio   52:54:00:bd:89:a1
     vnetY      network   Almacenamiento   virtio   52:54:00:5c:3c:2e
     vnetZ      bridge    br0              virtio   00:16:3e:37:a0:15 # <-- Nueva interfaz bridge
    ```

    _(Los nombres vnetX, vnetY, vnetZ pueden variar)_

6.  **Reiniciar la máquina virtual `mvp5`:**
    Para que la nueva interfaz sea reconocida por el sistema operativo de la VM.

    ```bash
    root@lq-d25:~# virsh reboot mvp5
    El dominio mvp5 está siendo reiniciado
    ```

7.  **Conectarse a la consola de `mvp5`:**

    ```bash
    root@lq-d25:~# virsh console mvp5
    Connected to domain 'mvp5'
    Escape character is ^] (Ctrl + ])

    # Inicia sesión como root
    ```

8.  **Verificar la configuración de red en `mvp5` (Comprobación 1):**
    Dentro de la VM, comprobamos las interfaces de red. Debería aparecer una nueva interfaz (ej. `enp8s0`) que ha obtenido una dirección IP de la red del laboratorio.

    ```bash
    [root@mvp5 ~]# ip addr
    1: lo: <LOOPBACK,UP,LOWER_UP> ...
       inet 127.0.0.1/8 scope host lo
       ...
    2: enp1s0: <BROADCAST,MULTICAST,UP,LOWER_UP> ... link/ether 52:54:00:bd:89:a1 ...
       inet 192.168.140.17/24 ... scope global dynamic enp1s0 # <-- Red Cluster (NAT)
       ...
    3: enp7s0: <BROADCAST,MULTICAST,UP,LOWER_UP> ... link/ether 52:54:00:5c:3c:2e ...
       inet 10.22.122.2/24 ... scope global enp7s0           # <-- Red Almacenamiento (Aislada)
       ...
    4: enp8s0: <BROADCAST,MULTICAST,UP,LOWER_UP> ... link/ether 00:16:3e:37:a0:15 ...
       inet 10.10.14.XXX/24 ... scope global dynamic enp8s0 # <-- NUEVA interfaz BRIDGE con IP del laboratorio
       ...
    ```

    - Identifica la nueva interfaz (en este ejemplo `enp8s0`) por su dirección MAC (`00:16:3e:37:a0:15`).
    - Verifica que tenga una dirección `inet` de la red del laboratorio (ej. `10.10.14.0/24`). Si no tiene IP, espera unos segundos o ejecuta `dhclient enp8s0` (o `nmcli con up <nombre_conexion_enp8s0>`).

9.  **Configurar el archivo hosts en el anfitrión:**
    Añade una entrada en `/etc/hosts` del anfitrión para poder referenciar la VM por su nuevo nombre `mvp5i3.vpd.com` a través de la IP del bridge. **Reemplaza `10.10.14.XXX` con la IP real obtenida por `mvp5` en el paso anterior.**

    ```bash
    # En el ANFITRIÓN:
    root@lq-d25:~# VM_IP_BRIDGE="10.10.14.XXX" # <-- Pon la IP real de enp8s0 de mvp5
    root@lq-d25:~# echo "$VM_IP_BRIDGE mvp5i3.vpd.com mvp5i3" >> /etc/hosts

    root@lq-d25:~# cat /etc/hosts | grep mvp5
    192.168.140.17 mvp5i1.vpd.com mvp5i1
    10.22.122.2 mvp5i2.vpd.com mvp5i2
    10.10.14.XXX mvp5i3.vpd.com mvp5i3 # <-- Nueva entrada
    ```

10. **Verificar la conectividad desde el anfitrión (Comprobación 2):**
    Desde el anfitrión, haz ping al nuevo nombre de host de la VM.

    ```bash
    # En el ANFITRIÓN:
    root@lq-d25:~# ping -c 4 mvp5i3.vpd.com
    PING mvp5i3.vpd.com (10.10.14.XXX) ...
    ... respuestas exitosas ...
    ```

11. **Verificar el acceso a Internet desde la VM (Comprobación 3):**
    Desde la VM `mvp5`, comprueba si puede acceder a Internet. La ruta por defecto podría seguir siendo la de la red NAT (`enp1s0`) o podría haber cambiado a la interfaz bridge (`enp8s0`), dependiendo de las métricas DHCP.

    ```bash
    # En la VM mvp5:
    [root@mvp5 ~]# ping -c 4 google.es
    PING google.es (...) ...
    ... respuestas exitosas ...
    ```

12. **Verificar conectividad con otros equipos de la red (Comprobación 4):**
    Desde la VM `mvp5`, intenta hacer ping a otra máquina en la red del laboratorio (ej. el anfitrión del profesor si conoces su IP en esa red).

    ```bash
    # En la VM mvp5:
    [root@mvp5 ~]# ping -c 4 <IP_OTRA_MAQUINA_LAB>
    PING <IP_OTRA_MAQUINA_LAB> (...) ...
    ... respuestas exitosas ...
    ```

13. **Comprobar la tabla de enrutamiento en la VM:**
    Examina la tabla de rutas para ver qué interfaz se usa como puerta de enlace por defecto.

    ```bash
    [root@mvp5 ~]# ip route
    default via 10.10.14.1 dev enp8s0 proto dhcp metric 101 # <-- Posible ruta por defecto vía bridge
    default via 192.168.140.1 dev enp1s0 proto dhcp metric 100 # <-- Posible ruta por defecto vía NAT
    10.10.14.0/24 dev enp8s0 proto kernel scope link src 10.10.14.XXX metric 101
    10.22.122.0/24 dev enp7s0 proto kernel scope link src 10.22.122.2 metric 102
    192.168.140.0/24 dev enp1s0 proto kernel scope link src 192.168.140.17 metric 100
    ```

    - **Explicación:** La tabla de rutas muestra todas las redes alcanzables directamente y las puertas de enlace (`default via ...`). Linux elegirá la ruta por defecto con la métrica más baja (`metric XXX`). Si el DHCP del laboratorio proporciona una métrica, puede que la interfaz bridge (`enp8s0`) se convierta en la ruta por defecto, o puede que la interfaz NAT (`enp1s0`) siga siéndolo si su métrica es menor. Ambas configuraciones permiten el acceso a Internet, pero a través de caminos diferentes.

**Resumen de la Tarea 5:**
Hemos configurado una tercera interfaz de red en `mvp5` conectada a un bridge (`br0`) en el anfitrión. Este bridge incluye la interfaz física del anfitrión, permitiendo a `mvp5` obtener una dirección IP directamente de la red del laboratorio y comunicarse con otros equipos en esa red como si fuera una máquina física más.

```bash
# Verificación final de interfaces en la VM y el anfitrión
# En la VM mvp5:
[root@mvp5 ~]# ip addr

# En el ANFITRIÓN:
root@lq-d25:~# virsh domiflist mvp5
root@lq-d25:~# ip addr show br0
root@lq-d25:~# nmcli device status
```
