# Mejores Prácticas para KVM

Este documento complementa la guía principal de instalación de KVM, ofreciendo recomendaciones y mejores prácticas para obtener un rendimiento óptimo, mayor seguridad y facilidad de administración.

## Rendimiento

### Optimización de CPU

1. **Afinidad de CPU**: Para cargas de trabajo críticas, asigne CPUs específicas a máquinas virtuales:
   ```bash
   virsh vcpupin vm_name vcpu_number host_cpu_number
   ```

2. **Topología de CPU**: Defina una topología de CPU que refleje la física para aplicaciones que optimizan según núcleos/sockets:
   ```bash
   virsh edit vm_name
   # Añadir o modificar:
   <cpu>
     <topology sockets='1' cores='4' threads='2'/>
   </cpu>
   ```

3. **CPU host-passthrough**: Utilice el modelo de CPU del host para máximo rendimiento:
   ```xml
   <cpu mode='host-passthrough'/>
   ```

### Optimización de Memoria

1. **Hugepages**: Active hugepages para reducir la sobrecarga de TLB:
   ```bash
   # En /etc/sysctl.conf
   vm.nr_hugepages = 1024  # Ajustar según necesidades
   ```

2. **Evite el overcommit**: No asigne más memoria total a VMs que la disponible físicamente.

3. **KSM (Kernel Samepage Merging)**: Active KSM para compartir páginas de memoria idénticas:
   ```bash
   echo 1 > /sys/kernel/mm/ksm/run
   ```

### Optimización de Almacenamiento

1. **Caché**: Configure correctamente el modo de caché:
   ```xml
   <disk>
     <driver name='qemu' type='raw' cache='none' io='native'/>
   </disk>
   ```

2. **I/O Threads**: Use iothreads para discos:
   ```xml
   <domain>
     <iothreads>1</iothreads>
     <disk>
       <driver iothread="1"/>
     </disk>
   </domain>
   ```

3. **Tipo de disco**: Prefiera formatos raw para máximo rendimiento o qcow2 con preallocation para un buen equilibrio:
   ```bash
   qemu-img create -f qcow2 -o preallocation=metadata disk.qcow2 20G
   ```

### Optimización de Red

1. **Controladores virtio**: Utilice siempre controladores virtio para red:
   ```xml
   <interface type='network'>
     <model type='virtio'/>
   </interface>
   ```

2. **vhost_net**: Asegúrese de que el módulo vhost_net está cargado:
   ```bash
   modprobe vhost_net
   ```

3. **Multisegmentos (MSI/MSI-X)**: Active MSI para controladores virtio.

## Seguridad

1. **SELinux**: Mantenga SELinux en modo enforcing:
   ```bash
   setenforce 1
   ```

2. **svirt**: KVM utiliza sVirt (basado en SELinux) para aislar VMs. No desactive esta función.

3. **Actualizaciones**: Mantenga QEMU, libvirt y el kernel actualizados.

4. **Privilegios mínimos**: Ejecute libvirtd con privilegios mínimos cuando sea posible.

5. **Encriptación**: Utilice encriptación para almacenamiento de VMs confidenciales:
   ```bash
   qemu-img create -f qcow2 -o encryption-format=luks,encryption-secret=<uuid> disk.qcow2 20G
   ```

## Facilidad de Administración

1. **Nomenclatura consistente**: Utilice un esquema de nomenclatura coherente para VMs.

2. **Snapshots**: Realice snapshots antes de cambios importantes:
   ```bash
   virsh snapshot-create-as vm_name snapshot_name "Descripción"
   ```

3. **Automatización**: Utilice scripts o herramientas como Ansible para administrar VMs.

4. **Grupos de recursos**: Agrupe VMs relacionadas mediante etiquetas o grupos libvirt.

5. **Monitorización**: Configure herramientas de monitorización como Nagios, Zabbix o Prometheus.

## Respaldo y Recuperación

1. **Respaldo regular**: Programe respaldos regulares de VMs críticas.

2. **Respaldo en caliente**: Para VMs que no pueden apagarse, use snapshots externos:
   ```bash
   virsh snapshot-create-as --domain vm_name --name backup_snapshot --disk-only --atomic
   ```

3. **Prueba de recuperación**: Verifique regularmente que los respaldos pueden restaurarse correctamente.

4. **Documentación**: Mantenga un inventario y documentación actualizada de todas las VMs.

## Escalabilidad

1. **Automatización de despliegue**: Utilice plantillas y herramientas de automatización.

2. **Thin provisioning**: Utilice aprovisionamiento ligero para almacenamiento cuando sea apropiado.

3. **Alta disponibilidad**: Configure clusters de alta disponibilidad con recursos como Pacemaker y DRBD.

4. **Balanceo de carga**: Distribuya VMs entre múltiples hosts según carga y recursos.

## Referencias Adicionales

- [KVM Best Practices - Red Hat](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/7/html/virtualization_deployment_and_administration_guide/chap-virtualization_best_practices)
- [QEMU Performance Documentation](https://qemu.readthedocs.io/en/latest/system/performance.html)
- [libvirt Networking Handbook](https://wiki.libvirt.org/page/Networking)
- [KVM Forum Presentations](https://www.linux-kvm.org/page/KVM_Forum) 
