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
      - [Virtualización Parcial](#virtualización-parcial)
      - [Virtualización Nativa](#virtualización-nativa)
      - [Emulación o simulación:](#emulación-o-simulación)
      - [Virtualización a nivel del Sistema Operativo](#virtualización-a-nivel-del-sistema-operativo)
      - [Paravirtualización:](#paravirtualización)
  - [1.7. Tipos de Hipervisores](#17-tipos-de-hipervisores)
    - [Tipo I o nativo ("Non-hosted" o "bare-metal")](#tipo-i-o-nativo-non-hosted-o-bare-metal)
    - [Tipo II o no nativo ("Hosted")](#tipo-ii-o-no-nativo-hosted)
  - [1.8. Virtualización basada en hipervisores versus virtualización a nivel de sistema operativo](#18-virtualización-basada-en-hipervisores-versus-virtualización-a-nivel-de-sistema-operativo)
    - [Diferencias:](#diferencias)
    - [Ventajas sobre la virtualización basada en hipervisores:](#ventajas-sobre-la-virtualización-basada-en-hipervisores)
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

- **Encapsulamiento**: ocultación de la complejidad de un recurso mediante una interfaz simplificada.

- **Memoria virtual**: técnica realizada por el SO de un ordenador gracias a la cual las aplicaciones "creen" disponer de una memoria de trabajo contigua, cuando en realidad podría estar fragmentada e incluso con ciertos de esos fragmentos en el disco duro.

- **Virtualización de almacenamiento**: abstracción del almacenamiento físico (almacenamiento lógico). Ejemplo:

  - El particionado de un disco duro.
  - Un sistema de varios discos en RAID, aunque se "ven" como uno sólo.

- **Virtualización de red**: mediante el cual se crea uno o varios espacios de direccionamiento virtual en una subred.

- **Unión de canales de Ethernet**: consiste en utilizar varias interfaces de Ethernet que haya en un ordenador como si fueran una sola, con el objetivo de obtener redundancia (para reducir los errores) o aumentar la velocidad. Se suele llamar **RAIN** (_Redundant Array of Independenet Network interfaces_).

### Virtualización de la plataforma

- Es el tipo de virtualización más conocido.

- Consiste en esconder los recursos físicos del host al sistema operativo, mostrándole otra máquina (virtual) con la que trabaja realmente.

- Existen varias formas de hacer esto. Se diferencian básicamente por:

  - Cómo se implementa la máquina virtual.
  - Cuánto se implica el hardware en ella.

#### Virtualización Parcial

- Se virtualiza parte del hardware (especialmente el espacio de direccionamiento), pero no todo.
- Permite compartir recursos y, sobretodo, aislar los procesos.
- No permite varias instancias separadas de sistemas operativos invitados. No sería realmente una máquina virtual.

<img src="./assets/2025-03-04-17-43-32.png" width="500" alt="Virtualización parcial">

#### Virtualización Nativa

- Se virtualiza el hardware suficiente para permitir que un sistema operativo invitado, diseñado para la misma CPU que tiene el host (o con el mismo repertorio de instrucciones), se ejecute de forma aislada.
- El hypervisor puede usar virtualización por hardware. Si la CPU es compatible (“Hardware-assisted vitualization”).
- Ejemplos: KVM, Xen,VirtualBox, VMware Workstation, VMware Server, etc

<img src="./assets/2025-03-04-17-45-30.png" width="500" alt="Virtualización nativa">

#### Emulación o simulación:

- Igual a la anterior, pero el SO del sistema invitado está diseñado para una CPU con una arquitectura completamente diferente.
- Muy utilizado para permitir la creación de software para nuevos procesadores antes de que estén físicamente disponibles.
- No puede usar virtualización por hardware

<img src="./assets/2025-03-04-17-46-26.png" width="500" alt="Emulación o simulación">

#### Virtualización a nivel del Sistema Operativo

- Las máquinas virtuales comparten el sistema operativo con el host.
- El kernel proporciona múltiples espacios de usuario aislados.
- Es el propio kernel del SO el que se usa para implementar el entorno de dichas máquinas virtuales.
- No obstante, las aplicaciones que corren en SO invitado lo siguen viendo como un sistema autónomo, al igual que en los anteriores tipos de virtualización.
- Ejemplos:
  - Virtuozzo (Linux)
  - Solaris Containers
  - HP-UX Containers
  - FreeBSD Jail
  - Sandboxie (Windows)
  - VMware ThinApp (Windows)

<img src="./assets/2025-03-04-17-47-59.png" width="500" alt="Virtualización a nivel del sistema operativo">

#### Paravirtualización:

- El hypervisor ofrece una API especial que sólo puede usarse mediante la modificación del SO invitado (cosa que no era necesario en las técnicas anteriores).
- Las llamadas a dicha API se conocen como _hypercalls_.

- ¿Ventajas?
  - Menor complejidad del hypervisor.
  - Posibilidad de optimización desde el punto de vista del SO invitado, ya que este "es consciente" de que se está ejecutando en una máquina virtual.
  - Por ello la paravirtualización suele ser muy rápida

<img src="./assets/2025-03-04-17-52-33.png" width="500" alt="Paravirtualización">

## 1.7. Tipos de Hipervisores

Depende de dónde se sitúe el hypervisor en la máquina host, se distinguen:

### Tipo I o nativo ("Non-hosted" o "bare-metal")

- El hypervisor interactúa directamente con el hardware del sistema anfitrión (como si él mismo fuera el SO).
- Ejemplos:
  - VMware ESX Server
  - Microsoft Hyper-V
  - Sun Logical Domains Hypervisor

<img src="./assets/2025-03-04-17-58-38.png" width="500" alt="Tipo I o nativo">

### Tipo II o no nativo ("Hosted")

- Se ejecutan como una aplicación en un sistema operativo existente.
- Su uso conlleva una sobrecarga de rendimiento porque deben utilizar el sistema operativo del host para acceder y coordinar los recursos del hardware del sistema anfitrión.
- Ejemplos: 
  - VMware Workstation
  - Microsoft Virtual PC.

<img src="./assets/2025-03-04-17-59-27.png" width="500" alt="Tipo II o no nativo">

## 1.8. Virtualización basada en hipervisores versus virtualización a nivel de sistema operativo

### Diferencias:

- En la virtualización a nivel de sistema operativo, las máquinas virtuales se gestionan de una manera muy similar a los procesos normales del sistema.
- Debido a esto es el sistema operativo el que controla los recursos asignados a la máquina virtual.
- Los sistemas basados en _hypervisor_, no dejan al sistema operativo el total control sobre el hardware, sino que es el _hypervisor_ el que se hace cargo de los drivers para discos, tarjetas de red, de video, etc.

### Ventajas sobre la virtualización basada en hipervisores:

- El software de virtualización puede ser más pequeño, porque comparte más funcionalidades con el núcleo del sistema operativo.
- Se permiten usar funcionalidades del sistema operativo de muy bajo nivel, que normalmente no están soportadas en el _hypervisor_. Por ejemplo:
  - El escalado de frecuencia en la CPU
  - Suspender/recuperar en los portátiles.
- Si un dispositivo es controlado por el sistema operativo, entonces estará disponible en la máquina virtual.

## 1.9. Cuestiones

Sobre VirtualBox:

- ¿Qué tipo de virtualización realiza?
- ¿Su _hypervisor_ de qué tipo es?

Sobre KVM:

- ¿Qué tipo de virtualización realiza?
- ¿Su _hypervisor_ de qué tipo es?

Sobre la tecnología de contenedores:

- ¿De qué tipo de virtualización se trata?
