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

Para abordar esta práctica se debe haber completado la práctica 3 (Recursos de almacenamiento virtual), teniendo disponible el contenedor CONT_VOL_COMP funcionando correctamente.

## 3. Desarrollo de la Práctica

### 3.1. Tarea 1: Configuración del Nombre de Host

[Descripción del proceso seguido para la configuración del nombre de host]

```bash
# Comando para verificar el nombre actual del host
```

**Explicación del comando**:

- `comando`: Descripción

[Explicación detallada del proceso de configuración del nombre completo del host]

### 3.2. Tarea 2: Configuración del Cortafuegos

[Descripción del proceso seguido para configurar el cortafuegos]

```bash
# Comandos utilizados para la configuración del cortafuegos
```

**Explicación del comando**:

- `comando`: Descripción
- `parámetro`: Explicación

[Explicación sobre la configuración realizada y su propósito]

### 3.3. Tarea 3: Migración

#### 3.3.1. Generación y Configuración de Claves SSH

[Descripción del proceso de generación de par de claves pública/privada]

```bash
# Comando para generar las claves
ssh-keygen
```

**Explicación del comando**:

- `ssh-keygen`: Herramienta que permite generar un par de claves pública/privada para la autenticación SSH

[Explicación del proceso de compartir la clave pública con el otro anfitrión]

```bash
# Comando para compartir la clave pública
ssh-copy-id
```

**Explicación del comando**:

- `ssh-copy-id`: Herramienta que permite copiar la clave pública al servidor remoto

#### 3.3.2. Migración con virt-manager

[Descripción detallada del proceso de migración usando virt-manager]

![Captura de pantalla de la conexión con el anfitrión remoto](mdc:ruta/imagen.png)
_Figura 1: Conexión con el anfitrión remoto a través de virt-manager_

[Explicación paso a paso del proceso de migración]

#### 3.3.3. Migración con virsh (Opcional)

[Descripción detallada del proceso de migración usando virsh]

```bash
# Comando virsh migrate utilizado
virsh migrate
```

**Explicación del comando**:

- `virsh migrate`: Comando para realizar la migración de máquinas virtuales desde la línea de comandos
- Parámetros utilizados y su significado

#### 3.3.4. Revocación de Accesos Temporales

[Descripción del proceso para revocar los accesos temporales otorgados]

```bash
# Comandos para revocar accesos
```

**Explicación del comando**:

- `comando`: Descripción

## 4. Pruebas y Validación

[Descripción de las pruebas realizadas para verificar la correcta migración de la máquina virtual]

```bash
# Comandos utilizados para verificar la migración
```

**Resultados obtenidos**:

- Verificación de que la máquina virtual migrada sigue funcionando correctamente
- Verificación de acceso al almacenamiento compartido

## 5. Conclusiones

[Conclusiones sobre el proceso de migración de máquinas virtuales]

- Aspectos relevantes aprendidos
- Dificultades encontradas y cómo se resolvieron
- Importancia de la migración en entornos de virtualización

## 6. Bibliografía

1. Herrmann J, Zimmerman Y, Novich L, Parker D, Radvan S, Richardson T. (2019). "Red Hat Enterprise Linux 7. Virtualization Deployment and Administration Guide". Red Hat. [https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/7/html/virtualization_deployment_and_administration_guide/index](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/7/html/virtualization_deployment_and_administration_guide/index)

2. Muehlfeld M, Gkioka I, Jahoda M, Heves J, Wadeley S, Huffman C. (2019). "Red Hat Enterprise Linux 7 Networking Guide". Red Hat. [https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/7/html/networking_guide/index](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/7/html/networking_guide/index)

3. Jahoda M, Fiala J, Wadeley S, Krátky R, Prpic M, Gkiova I, Capek T, Ruseva Y, Svoboda M. (2019). "Red Hat Enterprise Linux 7. Red Hat Enterprise Linux 7 Security Guide". Red Hat. [https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/7/html/security_guide/index](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/7/html/security_guide/index)
