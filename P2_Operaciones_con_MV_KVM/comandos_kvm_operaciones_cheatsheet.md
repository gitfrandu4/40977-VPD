# Cheatsheet: Operaciones con Máquinas Virtuales KVM

## Copia de Seguridad y Restauración Manual

### Localización de Archivos de Configuración

```bash
# Buscar archivo XML de definición (VM apagada)
find / -name 'nombre_vm.xml'

# Buscar archivo XML de definición (VM en ejecución)
find / -name 'nombre_vm.xml'
# Resultado: /etc/libvirt/qemu/nombre_vm.xml (persistente)
#            /run/libvirt/qemu/nombre_vm.xml (temporal en ejecución)

# Localizar imágenes de disco
find / -name '*.qcow2'
# Ubicación típica: /var/lib/libvirt/images/nombre_vm.qcow2

# Listar discos de una VM específica
virsh domblklist nombre_vm
```

### Creación de Copia de Seguridad

```bash
# Crear directorio para backup
mkdir -p /backup/nombre_vm/

# Copiar archivo XML de definición
cp /etc/libvirt/qemu/nombre_vm.xml /backup/nombre_vm/

# Copiar imagen de disco
cp /var/lib/libvirt/images/nombre_vm.qcow2 /backup/nombre_vm/

# Verificar archivos copiados
ls -lh /backup/nombre_vm/
```

### Restauración desde Copia de Seguridad

```bash
# Copiar archivo XML con nuevo nombre
cp /backup/nombre_vm/nombre_vm.xml /etc/libvirt/qemu/nuevo_nombre.xml

# Editar archivo XML para cambiar:
# 1. Nombre de la VM: <name>nuevo_nombre</name>
# 2. UUID: <uuid>nuevo-uuid-generado</uuid>
# 3. Ruta de la imagen: <source file='/var/lib/libvirt/images/nuevo_nombre.qcow2'/>
# 4. Dirección MAC: <mac address='XX:XX:XX:XX:XX:XX'/>

# Generar nueva dirección MAC
python ./macgen.py
# Alternativa: printf '52:54:00:%02x:%02x:%02x\n' $((RANDOM%256)) $((RANDOM%256)) $((RANDOM%256))

# Copiar imagen de disco con nuevo nombre
cp /backup/nombre_vm/nombre_vm.qcow2 /var/lib/libvirt/images/nuevo_nombre.qcow2

# Establecer permisos correctos
chown qemu:qemu /var/lib/libvirt/images/nuevo_nombre.qcow2
chmod 600 /var/lib/libvirt/images/nuevo_nombre.qcow2

# Definir la nueva VM en libvirt
virsh define /etc/libvirt/qemu/nuevo_nombre.xml

# Verificar que la VM se ha definido correctamente
virsh list --all

# Iniciar la VM
virsh start nuevo_nombre
```

## Clonación de Máquinas Virtuales

### Clonación con virt-manager (GUI)

1. Iniciar virt-manager: `virt-manager`
2. Asegurarse de que la VM origen esté apagada
3. Seleccionar la VM, hacer clic derecho y elegir "Clonar"
4. Configurar nombre y opciones de clonación
5. Iniciar la VM clonada y verificar funcionamiento

### Clonación con virt-clone (CLI)

```bash
# Clonar una VM (la VM origen debe estar apagada)
virt-clone --original nombre_vm_origen --name nombre_vm_clon --file /var/lib/libvirt/images/nombre_vm_clon.qcow2

# Verificar que la VM se ha clonado correctamente
virsh list --all

# Iniciar la VM clonada
virsh start nombre_vm_clon
```

## Creación de Máquinas Virtuales

### Creación con virt-install

```bash
# Crear una nueva VM e iniciar la instalación del SO
virt-install \
  --name nombre_vm \
  --ram 2048 \
  --vcpus 1 \
  --disk path=/var/lib/libvirt/images/nombre_vm.qcow2,size=10 \
  --os-variant fedora40 \
  --cdrom /ruta/a/imagen.iso \
  --network network=default,model=virtio

# Opciones adicionales:
# --graphics none: instalación en modo texto
# --location: URL o ruta a los archivos de instalación
# --extra-args: parámetros adicionales para el kernel
# --boot: orden de arranque (cdrom,hd,network)
```

### Post-instalación

```bash
# Instalar agente QEMU en la VM invitada
sudo dnf install -y qemu-guest-agent

# Habilitar e iniciar el servicio
sudo systemctl enable --now qemu-guest-agent

# Configurar acceso SSH para root (solo para entornos de prueba)
echo "PermitRootLogin yes" | sudo tee -a /etc/ssh/sshd_config
sudo systemctl restart sshd
```

## Gestión de Máquinas Virtuales

### Comandos Básicos

```bash
# Listar todas las VMs (en ejecución y apagadas)
virsh list --all

# Iniciar una VM
virsh start nombre_vm

# Apagar una VM (limpio)
virsh shutdown nombre_vm

# Forzar apagado de una VM
virsh destroy nombre_vm

# Eliminar una VM (solo definición, no borra discos)
virsh undefine nombre_vm

# Eliminar una VM y sus discos
virsh undefine nombre_vm --remove-all-storage

# Editar configuración XML de una VM
virsh edit nombre_vm

# Mostrar información de una VM
virsh dominfo nombre_vm
```

### Gestión de Snapshots

```bash
# Crear snapshot
virsh snapshot-create-as nombre_vm nombre_snapshot "Descripción del snapshot"

# Listar snapshots
virsh snapshot-list nombre_vm

# Revertir a un snapshot
virsh snapshot-revert nombre_vm nombre_snapshot

# Eliminar un snapshot
virsh snapshot-delete nombre_vm nombre_snapshot
```

## Verificación y Diagnóstico

### Verificación de Conectividad

```bash
# Obtener dirección IP de la VM (requiere qemu-guest-agent)
virsh domifaddr nombre_vm

# Verificar conectividad desde el host
ping dirección_ip_vm

# Acceder por SSH
ssh usuario@dirección_ip_vm
ssh root@dirección_ip_vm
```

### Diagnóstico

```bash
# Ver consola de la VM
virsh console nombre_vm

# Monitorizar recursos de la VM
virt-top

# Ver estadísticas de CPU
virsh cpu-stats nombre_vm

# Ver estadísticas de memoria
virsh dommemstat nombre_vm

# Ver estadísticas de red
virsh domifstat nombre_vm interfaz
```

## Consejos y Buenas Prácticas

1. **Seguridad**:

   - Evitar `PermitRootLogin yes` en entornos de producción
   - Usar autenticación por clave en lugar de contraseña
   - Mantener permisos restrictivos (600) en imágenes de disco

2. **Rendimiento**:

   - Instalar qemu-guest-agent para mejor integración host-invitado
   - Usar virtio para dispositivos de red y disco
   - Asignar recursos adecuados (RAM, CPU) según necesidades

3. **Clonación**:

   - Siempre apagar la VM origen antes de clonar
   - Verificar que UUIDs y direcciones MAC sean únicos
   - Considerar cambiar el hostname en la VM clonada

4. **Copias de Seguridad**:

   - Realizar copias de seguridad regulares de archivos XML y discos
   - Documentar configuraciones y cambios
   - Verificar integridad de las copias de seguridad

5. **Resolución de Problemas**:
   - Revisar logs: `journalctl -u libvirtd`
   - Verificar permisos de archivos y SELinux
   - Comprobar conectividad de red y configuración de firewall
