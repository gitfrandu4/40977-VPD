# Práctica 4: Migración de máquinas virtuales

## Índice

- [Práctica 4: Migración de máquinas virtuales](#práctica-4-migración-de-máquinas-virtuales)
  - [Índice](#índice)
  - [1. Introducción](#1-introducción)
  - [2. Requisitos Previos](#2-requisitos-previos)
  - [3. Desarrollo de la Práctica](#3-desarrollo-de-la-práctica)
    - [3.1. Tarea 1: Configuración del Nombre de Host](#31-tarea-1-configuración-del-nombre-de-host)
    - [3.2. Tarea 2: Configuración del Cortafuegos](#32-tarea-2-configuración-del-cortafuegos)
    - [3.3. Tarea 3: Migración](#33-tarea-3-migración)
      - [3.3.1. Generación y Configuración de Claves SSH](#331-generación-y-configuración-de-claves-ssh)
      - [3.3.2. Migración con virt-manager](#332-migración-con-virt-manager)
      - [3.3.3. Migración con virsh (Opcional)](#333-migración-con-virsh-opcional)
      - [3.3.4. Revocación de Accesos Temporales](#334-revocación-de-accesos-temporales)
  - [4. Pruebas y Validación](#4-pruebas-y-validación)
  - [5. Conclusiones](#5-conclusiones)
  - [6. Bibliografía](#6-bibliografía)

## 1. Introducción

El objetivo fundamental de esta práctica es realizar migraciones de máquinas virtuales entre diferentes anfitriones. La migración de máquinas virtuales requiere un almacenamiento compartido del disco, por lo que se utilizará el contenedor CONT_VOL_COMP creado en la práctica 3, que proporciona un espacio de almacenamiento compartido soportado mediante NFS.

Tanto el almacenamiento compartido como la propia migración requieren comunicación entre los anfitriones, por lo que será necesario configurar el cortafuegos para permitir dichas comunicaciones.

## 2. Requisitos Previos

Para abordar esta práctica se debe haber completado la práctica 3 (Recursos de almacenamiento virtual), teniendo disponible el contenedor CONT_VOL_COMP funcionando correctamente. Se verifica el correcto funcionamiento del contenedor:

```bash
sudo podman ps
```

**Explicación del comando**:

- `podman ps`: Muestra los contenedores en ejecución, lo que permite verificar que CONT_VOL_COMP está funcionando correctamente.

También se debe asegurar que la máquina virtual a migrar (mvp4_etiqueta_de_equipo) esté almacenada en el volumen compartido proporcionado por CONT_VOL_COMP.

## 3. Desarrollo de la Práctica

### 3.1. Tarea 1: Configuración del Nombre de Host

Es necesario configurar cada equipo anfitrión con un nombre de host único y completamente cualificado (FQDN) para poder identificarlo en la red y permitir la comunicación entre anfitriones.

```bash
# Verificar el nombre actual del host
hostname
hostname -f
```

**Explicación del comando**:

- `hostname`: Muestra el nombre de host actual.
- `hostname -f`: Muestra el nombre de host completamente cualificado (FQDN).

Para configurar un nombre de host permanente, se debe editar el archivo `/etc/hostname` y agregar una entrada en `/etc/hosts` para asegurarse de que el sistema pueda resolver correctamente el nombre de host:

```bash
# Editar el archivo hostname para establecer el nombre del host
sudo nano /etc/hostname
```

Se establece el nombre de host deseado, por ejemplo: `anfitrion1.vpd.local`

```bash
# Editar el archivo hosts para agregar la entrada correspondiente
sudo nano /etc/hosts
```

Se añade la siguiente línea al archivo hosts:

```
127.0.1.1   anfitrion1.vpd.local   anfitrion1
```

**Explicación**:

- La entrada en `/etc/hostname` establece el nombre del sistema de forma permanente.
- La entrada en `/etc/hosts` permite que el sistema resuelva su propio nombre a la dirección IP local.

Para aplicar los cambios sin reiniciar:

```bash
# Aplicar el nuevo nombre de host
sudo systemctl restart systemd-hostnamed
```

### 3.2. Tarea 2: Configuración del Cortafuegos

La migración de máquinas virtuales requiere que ciertos puertos estén abiertos en el cortafuegos para permitir la comunicación entre los anfitriones. En Fedora 39, el servicio de cortafuegos por defecto es Firewalld.

Primero, verificamos el estado del cortafuegos:

```bash
# Verificar el estado del servicio Firewalld
sudo systemctl status firewalld
```

**Explicación del comando**:

- `systemctl status firewalld`: Muestra el estado del servicio Firewalld, incluyendo si está activo y en ejecución.

A continuación, identificamos la zona activa para la interfaz de red que utilizaremos:

```bash
# Identificar las zonas activas
sudo firewall-cmd --get-active-zones
```

**Explicación del comando**:

- `firewall-cmd --get-active-zones`: Muestra las zonas activas y las interfaces asociadas a cada una.

Ahora, configuramos el cortafuegos para permitir la migración de máquinas virtuales. Para ello, habilitaremos los puertos necesarios:

```bash
# Añadir el servicio libvirt a la zona activa
sudo firewall-cmd --add-service=libvirt --permanent

# Habilitar el rango de puertos para la migración (49152-49216)
sudo firewall-cmd --add-port=49152-49216/tcp --permanent

# Habilitar puerto para tráfico SSH
sudo firewall-cmd --add-service=ssh --permanent

# Recargar la configuración del cortafuegos
sudo firewall-cmd --reload

# Verificar la configuración
sudo firewall-cmd --list-all
```

**Explicación de los comandos**:

- `firewall-cmd --add-service=libvirt --permanent`: Añade el servicio predefinido libvirt a la configuración permanente del cortafuegos.
- `firewall-cmd --add-port=49152-49216/tcp --permanent`: Habilita el rango de puertos (49152-49216) que utiliza libvirt para la migración.
- `firewall-cmd --add-service=ssh --permanent`: Habilita el servicio SSH en el cortafuegos.
- `firewall-cmd --reload`: Recarga la configuración del cortafuegos, aplicando los cambios permanentes.
- `firewall-cmd --list-all`: Muestra la configuración actual del cortafuegos para verificar que los cambios se han aplicado correctamente.

> **Nota**: Es importante habilitar estos puertos en ambos anfitriones (origen y destino) para que la migración pueda realizarse correctamente.

### 3.3. Tarea 3: Migración

#### 3.3.1. Generación y Configuración de Claves SSH

Para realizar la migración sin necesidad de introducir contraseñas, se utilizará la autenticación mediante clave pública/privada SSH.

```bash
# Generar par de claves SSH para el usuario root
sudo ssh-keygen -t rsa -b 4096
```

**Explicación del comando**:

- `ssh-keygen -t rsa -b 4096`: Genera un par de claves RSA de 4096 bits.
  - `-t rsa`: Especifica el tipo de clave (RSA).
  - `-b 4096`: Establece el tamaño de la clave (4096 bits, recomendado para mayor seguridad).

Durante el proceso de generación, se puede aceptar la ubicación predeterminada (`/root/.ssh/id_rsa`) y opcionalmente establecer una frase de contraseña (aunque para automatizar el proceso se suele dejar en blanco).

A continuación, se debe compartir la clave pública con el anfitrión de destino:

```bash
# Compartir la clave pública con el anfitrión de destino
sudo ssh-copy-id root@destino.vpd.local
```

**Explicación del comando**:

- `ssh-copy-id root@destino.vpd.local`: Copia la clave pública al archivo `authorized_keys` del usuario root en el anfitrión de destino.
  - `root@destino.vpd.local`: Especifica el usuario y el anfitrión de destino (cambiar por el FQDN del anfitrión de destino).

Se solicitará la contraseña de root en el anfitrión de destino una única vez para realizar la operación.

Para verificar que la autenticación con clave funciona correctamente:

```bash
# Verificar la conexión SSH
sudo ssh root@destino.vpd.local
```

Si todo está configurado correctamente, se establecerá la conexión sin solicitar contraseña.

#### 3.3.2. Migración con virt-manager

Para realizar la migración usando virt-manager, se siguen estos pasos:

1. Iniciar virt-manager como superusuario:

```bash
sudo virt-manager
```

2. Añadir conexión al anfitrión remoto:
   - En virt-manager, seleccionar "Archivo" > "Añadir conexión".
   - Seleccionar "Conectar a anfitrión remoto mediante SSH".
   - En el campo "Anfitrión", introducir el FQDN del anfitrión de destino.
   - Seleccionar "root" como usuario.
   - Hacer clic en "Conectar".

![Conexión al anfitrión remoto](mdc:ruta/imagen_conexion.png)
_Figura 1: Configuración de conexión al anfitrión remoto en virt-manager_

3. Una vez establecida la conexión, seleccionar la máquina virtual a migrar (mvp4_etiqueta_de_equipo).

4. Hacer clic derecho sobre la máquina virtual y seleccionar "Migrar".

5. En la ventana de migración:
   - Seleccionar el anfitrión de destino.
   - Marcar la opción "Migración en vivo".
   - Hacer clic en "Migrar".

![Migración de la máquina virtual](mdc:ruta/imagen_migracion.png)
_Figura 2: Proceso de migración de la máquina virtual_

**Explicación del proceso**:

- La migración en vivo permite que la máquina virtual continúe operando durante el proceso de migración.
- El proceso copia la memoria y el estado de la CPU al anfitrión de destino.
- Como el almacenamiento está compartido mediante NFS en el contenedor CONT_VOL_COMP, no es necesario migrar los archivos de disco.

#### 3.3.3. Migración con virsh (Opcional)

La migración también puede realizarse mediante la línea de comandos usando virsh:

```bash
# Listar las máquinas virtuales disponibles
sudo virsh list --all

# Realizar la migración en vivo
sudo virsh migrate --live mvp4_etiqueta_de_equipo qemu+ssh://destino.vpd.local/system --verbose
```

**Explicación del comando**:

- `virsh migrate`: Comando para iniciar la migración de una máquina virtual.
  - `--live`: Realiza una migración en vivo, donde la máquina continúa funcionando durante el proceso.
  - `mvp4_etiqueta_de_equipo`: Nombre de la máquina virtual a migrar.
  - `qemu+ssh://destino.vpd.local/system`: URI del destino, especificando el protocolo (qemu+ssh), el anfitrión de destino y el tipo de conexión (/system).
  - `--verbose`: Muestra información detallada durante el proceso de migración.

Para una migración más avanzada con opciones adicionales:

```bash
sudo virsh migrate --live --persistent --undefinesource mvp4_etiqueta_de_equipo qemu+ssh://destino.vpd.local/system
```

**Explicación de parámetros adicionales**:

- `--persistent`: Hace que la máquina virtual persista en el host de destino después de reiniciarlo.
- `--undefinesource`: Elimina la definición de la máquina virtual en el host de origen después de la migración.

#### 3.3.4. Revocación de Accesos Temporales

Una vez completada la migración, es importante revocar los accesos temporales otorgados durante el proceso para mantener la seguridad del sistema:

```bash
# Eliminar la clave pública del anfitrión remoto
sudo ssh root@destino.vpd.local "sed -i '/$(cat ~/.ssh/id_rsa.pub | cut -d' ' -f2)/d' ~/.ssh/authorized_keys"
```

**Explicación del comando**:

- Este comando se conecta al anfitrión remoto y elimina la entrada correspondiente a nuestra clave pública del archivo `authorized_keys`.

Alternativamente, se puede acceder al anfitrión remoto y editar manualmente el archivo:

```bash
# Acceder al anfitrión remoto
sudo ssh root@destino.vpd.local

# Editar el archivo authorized_keys
nano ~/.ssh/authorized_keys
```

Y eliminar la línea correspondiente a la clave pública del anfitrión de origen.

## 4. Pruebas y Validación

Para verificar que la migración se ha realizado correctamente, se deben realizar las siguientes pruebas:

```bash
# En el anfitrión de destino, verificar que la máquina virtual está en ejecución
sudo virsh list --all
```

**Resultado esperado**:

- La máquina virtual mvp4_etiqueta_de_equipo debe aparecer en la lista y estar en estado "running".

```bash
# Verificar la información detallada de la máquina virtual
sudo virsh dominfo mvp4_etiqueta_de_equipo
```

**Explicación del comando**:

- `virsh dominfo`: Muestra información detallada sobre la máquina virtual, incluyendo su estado, memoria asignada, y número de CPU virtuales.

```bash
# Verificar que se puede acceder a la máquina virtual migrada
sudo virsh console mvp4_etiqueta_de_equipo
```

**Explicación del comando**:

- `virsh console`: Conecta a la consola de la máquina virtual, permitiendo interactuar con ella.
- Para salir de la consola, se usa la combinación de teclas `Ctrl+]`.

También se debe verificar que la máquina virtual sigue teniendo acceso al almacenamiento compartido:

```bash
# Acceder a la máquina virtual y verificar el acceso al almacenamiento
# (Desde dentro de la máquina virtual migrada)
df -h
```

## 5. Conclusiones

La migración de máquinas virtuales entre anfitriones es una funcionalidad fundamental en entornos virtualizados, ya que permite:

- **Alta disponibilidad**: La capacidad de mover máquinas virtuales entre anfitriones sin interrupciones significativas mejora la disponibilidad del servicio.
- **Mantenimiento sin tiempo de inactividad**: Permite realizar mantenimiento en los anfitriones físicos sin necesidad de apagar las máquinas virtuales.
- **Balanceo de carga**: Facilita la distribución de la carga entre distintos anfitriones físicos.

Durante el desarrollo de esta práctica, se han aplicado varios conceptos importantes:

- Configuración adecuada de nombres de host completamente cualificados (FQDN).
- Gestión del cortafuegos mediante Firewalld para permitir la comunicación necesaria entre anfitriones.
- Configuración de autenticación SSH mediante claves para automatizar procesos sin comprometer la seguridad.
- Uso de almacenamiento compartido (NFS) como requisito para la migración en vivo.

Las principales dificultades encontradas durante el proceso incluyen:

- La correcta configuración del cortafuegos para permitir el tráfico necesario sin exponer innecesariamente el sistema.
- La gestión adecuada de las claves SSH para mantener la seguridad del sistema.

La implementación de migraciones en vivo representa una habilidad esencial para administradores de sistemas en entornos virtualizados, especialmente en infraestructuras que requieren alta disponibilidad.

## 6. Bibliografía

1. Herrmann J, Zimmerman Y, Novich L, Parker D, Radvan S, Richardson T. (2019). "Red Hat Enterprise Linux 7. Virtualization Deployment and Administration Guide". Red Hat. [https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/7/html/virtualization_deployment_and_administration_guide/index](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/7/html/virtualization_deployment_and_administration_guide/index)

2. Muehlfeld M, Gkioka I, Jahoda M, Heves J, Wadeley S, Huffman C. (2019). "Red Hat Enterprise Linux 7 Networking Guide". Red Hat. [https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/7/html/networking_guide/index](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/7/html/networking_guide/index)

3. Jahoda M, Fiala J, Wadeley S, Krátky R, Prpic M, Gkiova I, Capek T, Ruseva Y, Svoboda M. (2019). "Red Hat Enterprise Linux 7. Red Hat Enterprise Linux 7 Security Guide". Red Hat. [https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/7/html/security_guide/index](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/7/html/security_guide/index)
