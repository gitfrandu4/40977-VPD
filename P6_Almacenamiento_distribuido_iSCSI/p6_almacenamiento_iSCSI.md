# Práctica 6: Instalación de un servicio de almacenamiento iSCSI

## Tabla de Contenidos

- [1. Introducción](#1-introducción)
- [2. Requisitos previos](#2-requisitos-previos)
- [3. Plan de actividades y orientaciones](#3-plan-de-actividades-y-orientaciones)
  - [Tarea 1: Creación de la infraestructura básica iSCSI](#tarea-1-creación-de-la-infraestructura-básica-iscsi)
  - [Tarea 2: Instalación y configuración de servicio iSCSI en el nodo target](#tarea-2-instalación-y-configuración-de-servicio-iscsi-en-el-nodo-target)
  - [Tarea 3: Instalación del soporte iSCSI en los nodos initiator](#tarea-3-instalación-del-soporte-iscsi-en-los-nodos-initiator)
  - [Tarea 4: Creación de sistema de archivos tipo ext4 en la unidad iSCSI importada](#tarea-4-creación-de-sistema-de-archivos-tipo-ext4-en-la-unidad-iscsi-importada)
  - [Tarea 5: Exportación del segundo disco iSCSI y creación de un volumen lógico](#tarea-5-exportación-del-segundo-disco-iscsi-y-creación-de-un-volumen-lógico)
- [4. Pruebas y Validación](#4-pruebas-y-validación)
- [5. Conclusiones](#5-conclusiones)
- [6. Bibliografía](#6-bibliografía)

## 1. Introducción

## 2. Requisitos previos

## 3. Plan de actividades y orientaciones

### Tarea 1: Creación de la infraestructura básica iSCSI

#### Configuración del nodo Almacenamiento (target)

```bash
# Comandos utilizados para la creación y configuración de la máquina virtual
```

**Explicación del comando**:

- `comando`: Descripción general del comando
- `--opcion`: Explicación de este parámetro específico

#### Configuración de interfaces de red en el nodo Almacenamiento

```bash
# Comandos utilizados para configurar las interfaces de red
```

**Explicación del comando**:

- `comando`: Descripción general del comando
- `--opcion`: Explicación de este parámetro específico

#### Configuración de nodos initiator (Nodo1 y Nodo2)

```bash
# Comandos utilizados para la creación y configuración de las máquinas virtuales
```

**Explicación del comando**:

- `comando`: Descripción general del comando
- `--opcion`: Explicación de este parámetro específico

### Tarea 2: Instalación y configuración de servicio iSCSI en el nodo target

#### Paso 1: Verificación de configuraciones

```bash
# Comandos utilizados para verificar configuraciones
```

#### Paso 2: Instalación del software iSCSI en el nodo target

```bash
# Comandos utilizados para instalar el software
```

#### Paso 3: Inicio del servicio target

```bash
# Comandos utilizados para iniciar el servicio
```

#### Paso 4: Configuración del arranque automático

```bash
# Comandos utilizados para configurar el arranque automático
```

#### Paso 5: Configuración del cortafuegos

```bash
# Comandos utilizados para configurar el cortafuegos
```

#### Paso 6: Configuración del recurso de almacenamiento a exportar

```bash
# Comandos utilizados para configurar el recurso de almacenamiento
```

### Tarea 3: Instalación del soporte iSCSI en los nodos initiator

#### Paso 1: Instalación del software del cliente iSCSI

```bash
# Comandos utilizados para instalar el software
```

#### Paso 2: Ejecución del servicio iscsid

```bash
# Comandos utilizados para ejecutar el servicio
```

#### Paso 3: Configuración del nombre del nodo

```bash
# Comandos utilizados para configurar el nombre del nodo
```

#### Paso 4: Descubrimiento de LUNs exportados

```bash
# Comandos utilizados para descubrir los LUNs
```

#### Paso 5: Conexión de unidades LUNs

```bash
# Comandos utilizados para conectar las unidades
```

#### Paso 6: Comprobación de la conexión

```bash
# Comandos utilizados para comprobar la conexión
```

### Tarea 4: Creación de sistema de archivos tipo ext4 en la unidad iSCSI importada

```bash
# Comandos utilizados para crear el sistema de archivos
```

### Tarea 5: Exportación del segundo disco iSCSI y creación de un volumen lógico

#### 1. Exportación del disco /dev/sdb desde el nodo target

```bash
# Comandos utilizados para exportar el disco
```

**Explicación del comando**:

- `comando`: Descripción general del comando
- `--opcion`: Explicación de este parámetro específico

#### 2. Comprobación de la exportación en los nodos initiator

```bash
# Comandos utilizados para comprobar la exportación
```

#### 3. Creación del volumen lógico

```bash
# Comandos utilizados para crear el volumen lógico
```

##### I. Creación del volumen físico

```bash
# Comandos utilizados para crear el volumen físico
```

##### II. Creación del grupo de volúmenes ApacheVG

```bash
# Comandos utilizados para crear el grupo de volúmenes
```

##### III. Creación del volumen lógico ApacheLV

```bash
# Comandos utilizados para crear el volumen lógico
```

##### IV. Comprobación del volumen lógico

```bash
# Comandos utilizados para comprobar el volumen lógico
```

##### V. Creación del sistema de archivos XFS

```bash
# Comandos utilizados para crear el sistema de archivos
```

#### 4. Configuración en el segundo nodo initiator

```bash
# Comandos utilizados para configurar el segundo nodo
```

#### 5. Comprobación de activación en ambos nodos

```bash
# Comandos utilizados para comprobar la activación
```

## 4. Pruebas y Validación

### Comprobación del nodo target (Almacenamiento)

```bash
# Comandos utilizados y resultados obtenidos
```

### Comprobación del nodo initiator (Nodo1)

```bash
# Comandos utilizados y resultados obtenidos
```

### Comprobación del nodo initiator (Nodo2)

```bash
# Comandos utilizados y resultados obtenidos
```

## 5. Conclusiones

## 6. Bibliografía

1. Storage Administration Guide. RED HAT ENTERPRISE LINUX 7. Deploying and configuring single-node storage in RHEL. Disponible en: https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/7/html/storage_administration_guide/index [accedido el 02/04/2025]
