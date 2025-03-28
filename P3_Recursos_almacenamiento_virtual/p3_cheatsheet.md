# Virtualization Storage Management Cheatsheet

## Virtual Machine Management

### Clone a VM

```bash
virt-clone --original <source-vm> --name <new-vm> --file <path-to-new-disk> --mac=<new-mac>
```

- `--original`: Source VM to clone
- `--name`: Name for the new VM
- `--file`: Path for the new disk image
- `--mac`: New MAC address to avoid conflicts

### List VM Block Devices

```bash
virsh domblklist <vm-name> [--details]
```

- `--details`: Shows additional information like device type

## Storage Pool Management

### Define a New Storage Pool

```bash
virsh pool-define-as <pool-name> <type> [options]
```

Common types and options:

- `dir`: Directory-based pool
  ```bash
  virsh pool-define-as mypool dir --target /path/to/dir
  ```
- `fs`: Filesystem-based pool
  ```bash
  virsh pool-define-as mypool fs --source-dev /dev/sdX --target /mount/point
  ```
- `netfs`: Network filesystem pool (NFS)
  ```bash
  virsh pool-define-as mypool netfs --source-host <nfs-server> --source-path <remote-path> --target <local-path>
  ```

### Pool Lifecycle Commands

```bash
virsh pool-build <pool-name>      # Build pool
virsh pool-start <pool-name>      # Start pool
virsh pool-autostart <pool-name>  # Enable autostart
virsh pool-destroy <pool-name>    # Stop pool
virsh pool-undefine <pool-name>   # Remove pool definition
```

### List Storage Pools

```bash
virsh pool-list [--all] [--details]
```

- `--all`: Show all pools (including inactive)
- `--details`: Show detailed information

### View Pool Information

```bash
virsh pool-info <pool-name>       # Basic info
virsh pool-dumpxml <pool-name>    # XML configuration
```

## Volume Management

### Create a New Volume

```bash
virsh vol-create-as <pool-name> <vol-name> <size> [options]
```

Common options:

- `--format raw|qcow2`: Specify volume format
- `--prealloc-metadata`: Preallocate metadata (for qcow2)
  Example:

```bash
virsh vol-create-as default mydisk 10G --format qcow2
```

### List Volumes in Pool

```bash
virsh vol-list <pool-name>
```

### View Volume Information

```bash
virsh vol-info <vol-name> --pool <pool-name>
virsh vol-dumpxml <vol-name> --pool <pool-name>
```

## Disk Management

### Attach Disk to VM

```bash
virsh attach-disk <vm-name> <source-path> <target-device> [options]
```

Common options:

- `--driver qemu`: Use QEMU driver
- `--subdriver raw|qcow2`: Specify disk format
- `--targetbus virtio|sata`: Specify bus type
- `--persistent`: Make change persistent
  Example:

```bash
virsh attach-disk myvm /path/to/disk.qcow2 vda --driver qemu --subdriver qcow2 --targetbus virtio --persistent
```

### Detach Disk from VM

```bash
virsh detach-disk <vm-name> <target-device> [--config]
```

- `--config`: Make change persistent

## Disk Partitioning and Filesystem

### Create Partitions

```bash
fdisk /dev/sdX
```

Common fdisk commands:

- `n`: Create new partition
- `p`: Print partition table
- `w`: Write changes and exit
- `q`: Quit without saving

### Create Filesystems

```bash
# Create XFS filesystem
mkfs.xfs [-f] <device>
# Create ext4 filesystem
mkfs.ext4 <device>
```

- `-f`: Force creation (overwrite existing)

## NFS Operations

### Check NFS Exports

```bash
showmount -e <nfs-server>
```

### Mount NFS Share

```bash
mount -t nfs <nfs-server>:<remote-path> <local-mount-point>
```

### Check Mounts

```bash
mount | grep nfs    # Show NFS mounts
df -h              # Show all mounted filesystems
```

## Debugging Tips

1. Check VM Status:

```bash
virsh list --all
virsh dominfo <vm-name>
```

2. View Storage Pool Status:

```bash
virsh pool-list --all --details
virsh pool-info <pool-name>
```

3. Check Volume Status:

```bash
virsh vol-list <pool-name>
virsh vol-info <vol-name> --pool <pool-name>
```

4. View System Block Devices:

```bash
lsblk
fdisk -l
```

5. Check NFS Connectivity:

```bash
ping <nfs-server>
showmount -e <nfs-server>
mount | grep nfs
```

6. View VM Block Devices:

```bash
virsh domblklist <vm-name> --details
```

7. Check Filesystem Space:

```bash
df -h
```

## Common Issues and Solutions

1. **Pool Won't Start**

   - Check permissions on target directory
   - Verify source device/path exists
   - Check system logs: `journalctl -u libvirtd`

2. **NFS Mount Fails**

   - Verify network connectivity
   - Check NFS server is running
   - Confirm export permissions
   - Check firewall rules

3. **Disk Attachment Fails**

   - Verify disk path exists
   - Check disk permissions
   - Ensure correct format specified
   - Check VM is in correct state

4. **Volume Creation Fails**

   - Verify pool is active
   - Check available space
   - Confirm proper permissions

5. **Filesystem Issues**
   - Check device exists: `lsblk`
   - Verify filesystem type: `blkid`
   - Check mount points: `df -h`
   - View system logs: `dmesg | tail`
