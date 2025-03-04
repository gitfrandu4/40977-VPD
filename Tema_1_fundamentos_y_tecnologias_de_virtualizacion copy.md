# 1. Fundamentos y tecnologías de Virtualización

## Tabla de Contenidos
- [1. Fundamentos y tecnologías de Virtualización](#1-fundamentos-y-tecnologías-de-virtualización)
  - [Tabla de Contenidos](#tabla-de-contenidos)
  - [1.1. Definición](#11-definición)
  - [1.2. Utilidad](#12-utilidad)
  - [1.3. Inconvenientes](#13-inconvenientes)
  - [1.4. Conceptos básicos](#14-conceptos-básicos)
  - [1.5. Un poco de historia](#15-un-poco-de-historia)
  - [1.6. Tipos de virtualización](#16-tipos-de-virtualización)
    - [Virtualización de recursos](#virtualización-de-recursos)
    - [Virtualización de la plataforma](#virtualización-de-la-plataforma)
  - [1.7. Tipos de Hipervisores](#17-tipos-de-hipervisores)
  - [1.8. Virtualización basada en hipervisores versus virtualización a nivel de sistema operativo](#18-virtualización-basada-en-hipervisores-versus-virtualización-a-nivel-de-sistema-operativo)
  - [1.9. Cuestiones](#19-cuestiones)

## 1.1. Definición

- En general, se define como la abstracción de los recursos (normalmente la CPU, la memoria RAM y el disco duro) de un ordenador. 

- En otras palabras: simular la existencia de un recurso que, a la hora de interactuar con él, no ofrezca diferencias aparentes con respecto al uso del recurso real. 

- Luego, se puede entender por virtualización cosas tan simples como el particionado de un disco duro. 

- Sin embargo, nos centraremos en la virtualización de máquinas al completo, pudiendo llegar a tener varias máquinas virtuales en un solo ordenador, sin tener en cuenta la configuración física del mismo. 

## 1.2. Utilidad

- Para un usuario de ordenador personal puede tener o no cierta utilidad.

- Es en los grandes servidores donde provoca un gran aumento de productividad.

- Ciertos análisis muestran que sólo se aprovecha entre un 20-30% de su capacidad de proceso.

- Gracias a la virtualización podríamos llegar a cargas superiores al 50%. Simulación de varios servidores que ofrezcan varios servicios en una misma máquina.

- Flexibilidad a la hora de dotar (aumentar o disminuir) recursos para los servidores virtualizados.

- Administración centralizada y mucho más simple de los servidores virtualizados.

- Mayor facilidad para la creación de entornos de test. Permite probar software en diferentes configuraciones hardware sin disponer de él físicamente.

- Proporciona aislamiento: fallos y problemas de seguridad en una máquina virtual no afecta a las otras maquinas.

- Reducción del hardware necesario.

- Reducción de los costes de software en el caso de que las licencias de software comercial limiten su uso por cada CPU o máquina física en la que se instalan. De esta forma, es posible pagar sólo una licencia e instalar múltiples copias sobre varias máquinas virtuales en la misma máquina física. Esta ventaja se produce cada vez menos.

- Migración en caliente de máquinas virtuales de un servidor físico a otro.

## 1.3. Inconvenientes

- **Rendimiento inferior**. Un sistema operativo ejecutándose en un hardware virtualizado nunca tendrá el mismo rendimiento que si estuviera directamente ejecutándose en una máquina física.

- Sólo se puede utilizar el hardware que esté gestionado o soportado por el software de virtualización utilizado.

- Rendimiento gráfico limitado.

- Una avería en el sistema de virtualización afecta a todas las entidades virtuales alojadas en él, lo cual puede ser nefasto dada la pérdida de servicio que se podría producir.

## 1.4. Conceptos básicos

- **Anfitrión** o **_host_**: máquina que posee el software de virtualización sobre el que se ejecutan las máquinas virtuales.

- **Huésped** o **_guest_**: la máquina virtual, la cual tiene un acceso limitado al hardware físico, debido al software de virtualización.

- **Hypervisor** o **_Virtual Machine Monitor_ (VMM)**: es la capa software que se encarga de manejar los recursos del sistema físico exportándolos a la máquina virtual. Es el núcleo de todo software de virtualización.

- **HVM (_Hardware-assitsted Virtual Machine_)**: máquinas virtuales que se benefician de las extensiones específicas de las CPU de Intel y AMD para mejorar el rendimiento de la virtualización. Dichas extensiones son **Intel-VT** y **AMD Pacífica**, respectivamente.

## 1.5. Un poco de historia

**Virtualización de _mainframes_**

Fue IBM quien empezó a implementar la virtualización a mediados de los 60.

**Motivo**: particionar lógicamente los ordenadores centrales (_mainframes_) en máquinas virtuales independientes para poder ejecutar varias aplicaciones y procesos al mismo tiempo, con lo que se aprovechaba al máximo su inversión (los _mainframes_ eran recursos muy caros).

- El primer ordenador virtualizado, fue el IBM M44, que corría varias máquinas virtuales IBM 44X (aunque eran copias idénticas del M44). Objetivo: **multiprogramación**.

**Necesidad de la virtualización x86**

- La virtualización fue abandonada en las décadas de 1980 y 1990, ya que no tenía sentido un servidor con muchas máquinas virtuales. Debido a:
  
  - Aumento de las aplicaciones cliente-servidor.
  - Abaratamiento de los servidores y clientes (basados en la arquitectura x86).

- Con el paso del tiempo, el número de dichos servidores fue aumentando tremendamente, lo cual generó los problemas que ya sabemos de infrautilización de los recursos y aumento de costes de mantenimiento, entre otros.

**Virtualización completa del hardware x86**

- En 1999, VMware fue la primera en introducir la virtualización en los sistemas x86 para solucionar muchos de estos problemas de rendimiento.

- No resultó ser tan sencillo como en los anteriores mainframes, pues la arquitectura x86 no fue diseñada para admitir una virtualización completa.

- Como curiosidad; uno de los problemas que se encontraron es que, hay 17 instrucciones de x86 que provocan errores o funcionamientos anómalos cuando se virtualiza.

- VMware desarrolló una técnica que las “atrapa” cuando se generan y las convierte en instrucciones seguras que se pueden virtualizar.

## 1.6. Tipos de virtualización

### Virtualización de recursos

### Virtualización de la plataforma

## 1.7. Tipos de Hipervisores
## 1.8. Virtualización basada en hipervisores versus virtualización a nivel de sistema operativo
## 1.9. Cuestiones
