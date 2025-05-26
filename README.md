#  Challenge OlaClick - Sistema de Órdenes

Un sistema de gestión de órdenes de comida desarrollado con NestJS, TypeScript y PostgreSQL, implementando patrones de arquitectura limpia y escalabilidad empresarial.

##  Tabla de Contenidos

- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Ejecución](#ejecución)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Arquitectura](#arquitectura)
- [Escalabilidad](#escalabilidad)

## 🔧 Requisitos Previos

Antes de comenzar, asegúrate de tener instaladas las siguientes herramientas:

- **Node.js** (v18 o superior)
- **TypeScript**
- **NestJS CLI**
- **PostgreSQL** (v13 o superior)
- **Docker** y **Docker Desktop**
- **Postman** (para testing)

## 🚀 Instalación

### 1. Clonar y navegar al proyecto

```bash
git clone <repository-url>
cd challeng-olaclick
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

```bash
# Crear archivo .env
cp .env.example .env
```

## ▶️ Ejecución

### Modo desarrollo

```bash
npm run start:dev
```

### Modo producción

```bash
npm run build
npm run start:prod
```

El servidor estará disponible en: `http://localhost:3000`

##  API Endpoints

###  Obtener todas las órdenes

```http
GET /orders
```

**Respuesta esperada:**
```json
[
  {
    "id": 1,
    "status": "initiated",
    "clientName": "Ana López",
    "deletedAt": null,
    "createdAt": "2025-05-26T15:06:30.797Z",
    "updatedAt": "2025-05-26T15:06:30.797Z",
    "items": [
      {
        "id": 1,
        "description": "Ceviche",
        "quantity": 2,
        "unitPrice": 50,
        "orderId": 1,
        "createdAt": "2025-05-26T15:06:31.011Z",
        "updatedAt": "2025-05-26T15:06:31.011Z",
        "deletedAt": null
      }
    ]
  }
]
```

###  Crear nueva orden

```http
POST /orders
```

**Body:**
```json
{
  "clientName": "Nicolas Addamo",
  "items": [
    { 
      "description": "Papa", 
      "quantity": 23, 
      "unitPrice": 25 
    },
    { 
      "description": "Maiz", 
      "quantity": 10, 
      "unitPrice": 110 
    }
  ]
}
```

**Respuesta esperada:**
```json
{
  "id": 4,
  "clientName": "Nicolas Addamo",
  "status": "initiated",
  "updatedAt": "2025-05-26T19:37:48.953Z",
  "createdAt": "2025-05-26T19:37:48.953Z",
  "deletedAt": null,
  "items": [
    {
      "id": 7,
      "description": "Papa",
      "quantity": 23,
      "unitPrice": 25,
      "orderId": 4,
      "createdAt": "2025-05-26T19:37:49.149Z",
      "updatedAt": "2025-05-26T19:37:49.149Z",
      "deletedAt": null
    }
  ]
}
```

###  Avanzar estado de orden

```http
POST /orders/:id/advance
```

**Respuesta esperada:**
```json
{
  "success": true,
  "orderId": 1,
  "previousStatus": "initiated",
  "newStatus": "sent",
  "timestamp": "2025-05-26T19:39:27.359Z"
}
```

## 🧪 Testing

> **Nota:** Se optó por realizar testing con Postman en lugar de Swagger para mantener la documentación de la API separada del testing funcional.

### Configuración de Postman

1. Instalar **Postman** en tu sistema
2. Importar la colección de endpoints (si está disponible)
3. Configurar la variable de entorno `base_url` con `http://localhost:3000`

### Estados de las órdenes

El sistema maneja los siguientes estados para las órdenes:

```
initiated → sent → delivered
```

##  Arquitectura

### Principios de Diseño

El proyecto implementa **Arquitectura Limpia** para desacoplar la lógica de negocio del framework NestJS, proporcionando:

-  **Flexibilidad** para cambios tecnológicos
-  **Facilidad de testing** y mantenimiento
-  **Preparación para escalabilidad**

### Estructura en Capas

#### 1. 🎯 Capa de Dominio (Core Business Logic)

```typescript
// Ejemplo: Entidad Order con máquina de estados
class Order {
  private status: OrderStatus;
  
  advance(): void {
    // Lógica de transición de estados
    // initiated → sent → delivered
  }
}
```

**Características:**
- Contiene entidades, reglas de negocio y casos de uso
- Independiente del framework (NestJS, Express, etc.)
- Independiente de la persistencia (PostgreSQL, Redis, etc.)

#### 2. 🔄 Capa de Aplicación (Use Cases)

```typescript
// Ejemplo: Caso de uso para avanzar orden
class AdvanceOrderUseCase {
  execute(orderId: number): OrderAdvanceResult {
    // 1. Validar la orden
    // 2. Aplicar transición de estado
    // 3. Persistir cambios
  }
}
```

**Responsabilidades:**
- Orquesta el flujo entre lógica de negocio e infraestructura
- Coordina validaciones y transformaciones
- Maneja la persistencia de datos

#### 3. 🔧 Capa de Infraestructura (Framework/DB/APIs)

```typescript
// Ejemplo: Implementación concreta del repositorio
class SequelizeOrderRepository implements IOrderRepository {
  async save(order: Order): Promise<void> {
    // Implementación específica con Sequelize
  }
}
```

**Componentes:**
- Controladores NestJS (manejo HTTP)
- Repositorios (Sequelize/TypeORM)
- Servicios externos (Redis, AWS SQS)

### Inversión de Dependencias

```typescript
// Interface (Puerto)
interface IOrderRepository {
  save(order: Order): Promise<void>;
  findById(id: number): Promise<Order>;
}

// Implementación (Adaptador)
class PostgreSQLOrderRepository implements IOrderRepository {
  // Implementación específica
}
```

### Patrón Hexagonal (Puertos/Adaptadores)

```
    ┌─────────────────────────┐
    │     Capa Dominio        │
    │   (Lógica Negocio)      │
    └─────────┬───────────────┘
              │
    ┌─────────▼───────────────┐
    │   Puertos (Interfaces)  │
    └─────────┬───────────────┘
              │
    ┌─────────▼───────────────┐
    │ Adaptadores (Framework) │
    │  • NestJS Controllers   │
    │  • PostgreSQL Repos     │
    │  • Redis Cache          │
    └─────────────────────────┘
```

## 📈 Escalabilidad

### Objetivos de Escalabilidad

-  **Rendimiento estable** bajo carga extrema
-  **Resistencia a fallos** de componentes individuales
-  **Experiencia de usuario** con respuestas rápidas
-  **Eficiencia de costos** sin sobreprovisionar

### Estrategias de Escalado

#### 🔄 Escalado Horizontal

**API Scaling:**
```yaml
# Kubernetes Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: olaclick-api
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: api
        image: olaclick-api:latest
```

**Base de Datos:**
- Réplicas de lectura en PostgreSQL
- Cluster Redis para distribución de carga

#### ⚡ Optimización de Consultas

**Caché Estratégico:**
```typescript
// Redis para respuestas frecuentes
@Cacheable('orders')
async getOrders(): Promise<Order[]> {
  return this.orderRepository.findAll();
}
```

**Paginación Eficiente:**
```sql
-- Evitar cargar todos los registros
SELECT * FROM orders 
WHERE status = 'sent' 
LIMIT 50 OFFSET 100;
```

**Índices Optimizados:**
```sql
-- Índices en campos críticos
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
```

#### 🔄 Arquitectura Asíncrona

**Colas de Mensajes:**
```typescript
// Procesamiento asíncrono con RabbitMQ/SQS
@EventPattern('order.created')
async handleOrderCreated(order: CreateOrderDto) {
  // Procesar orden en background
  await this.orderProcessor.process(order);
}
```

**Flujo Asíncrono:**
```
Cliente → API → Cola → Worker → Base de Datos
   ↓
Respuesta inmediata: "Orden en proceso"
```

#### 🗄️ Escalado de Base de Datos

**Particionamiento (Sharding):**
```sql
-- Partición por fecha
CREATE TABLE orders_2025_01 PARTITION OF orders 
FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
```

**Time-Series para Históricos:**
- PostgreSQL + TimescaleDB para datos temporales
- Archivado automático de órdenes antiguas

### Métricas de Rendimiento

| Métrica | Objetivo | Estrategia |
|---------|----------|------------|
| Latencia API | < 200ms | Caché + Optimización consultas |
| Throughput | > 1000 req/s | Escalado horizontal |
| Disponibilidad | 99.9% | Load balancing + Health checks |
| Tiempo respuesta DB | < 50ms | Índices + Réplicas lectura |

# 🔴 Redis:

## ¿Por qué Redis en un sistema de órdenes?

Imagínate un restaurante en hora pico: los meseros necesitan consultar constantemente el estado de las órdenes, los cocineros actualizan estados, y todo debe funcionar sin demoras. Redis es como tener un tablero súper rápido donde todos pueden ver y actualizar información al instante.

##  Ventajas de Redis

###  Velocidad que marca la diferencia

Redis opera en **microsegundos**, no milisegundos. Para ponerlo en perspectiva:

```
PostgreSQL: ~50ms para consultar órdenes
Redis:      ~1ms para la misma consulta
```

Esto significa **50x más rápido** para operaciones frecuentes como `GET /orders`.

###  Manejo inteligente de estados

Las órdenes tienen ciclos de vida cortos. Redis entiende esto:

- **TTL automático**: Las órdenes se "olvidan" automáticamente después de ser entregadas
- **Estructuras flexibles**: Puedes organizar órdenes por estado sin esfuerzo extra

```redis
# Órdenes por estado
SADD orders:initiated 1 2 3
SADD orders:sent 4 5 6
SADD orders:delivered 7 8 9

# Se autolimpian con TTL
EXPIRE orders:delivered 300  # 5 minutos
```

###  Concurrencia sin dolores de cabeza

Cuando múltiples meseros intentan actualizar la misma orden simultáneamente, Redis garantiza que no se "pisen" entre ellos:

```redis
# Operación atómica - nunca falla
INCR order_counter
```

### 📈 Casos de uso reales en tu API

1. **Caché inteligente**
   ```typescript
   // Primera vez: consulta PostgreSQL + guarda en Redis
   // Siguientes veces: directamente desde Redis
   const orders = await redis.get('orders') || await db.getOrders();
   ```

2. **Invalidación automática**
   ```typescript
   // Cuando cambia una orden, limpia solo lo necesario
   await redis.del(`order_${id}`, 'orders_list');
   ```

3. **Contadores en tiempo real**
   ```typescript
   // Órdenes pendientes, completadas, etc.
   await redis.incr('orders:completed:today');
   ```

## 🔄 Alternativas: ¿Cuándo NO usar Redis?

### Comparativa práctica

| Tecnología | Mejor para | Cuándo elegirla | Limitaciones |
|------------|------------|-----------------|--------------|
| **Memcached** | Caché básico | Solo necesitas velocidad simple | Sin persistencia ni estructuras avanzadas |
| **MongoDB** | Caché con queries | Ya usas Mongo en tu stack | ~10x más lento que Redis |
| **PostgreSQL** | Simplicidad | Quieres menos tecnologías | 5-10x más lento, menos funciones |
| **Cassandra** | Volumen masivo | +100K órdenes/segundo | Complejidad operacional alta |

###  Escenarios específicos

**Usa Memcached si:**
- Solo cacheas respuestas HTTP simples
- No necesitas persistencia
- Tu equipo ya lo conoce bien

**Usa MongoDB si:**
- Ya es tu base de datos principal
- Necesitas queries complejas en el caché
- Manejas documentos JSON complejos

**Usa PostgreSQL si:**
- Quieres simplificar tu arquitectura
- El rendimiento actual es suficiente
- Prefieres menos dependencias

##  ¿Por qué Redis sigue siendo la mejor opción?

### En números reales

Para un restaurante típico con 1000 órdenes/día:

- **Redis**: Maneja la carga con 50MB de RAM
- **Respuesta promedio**: 1-2ms
- **Costo**: ~$10/mes en la nube
- **Configuración**: 15 minutos

### El factor humano

Los desarrolladores aman Redis porque:
- **Es intuitivo**: Los comandos hacen lo que esperas
- **Documentación excelente**: Encuentras soluciones rápido
- **Comunidad activa**: Stack Overflow está lleno de ejemplos
- **Debugging fácil**: `redis-cli` te permite ver qué está pasando

## 🚀 Implementación práctica

### Configuración básica para tu API

```typescript
// Configuración simple pero potente
const redis = new Redis({
  host: 'localhost',
  port: 6379,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3
});

// Caché con TTL inteligente
async function cacheOrders(orders: Order[]) {
  await redis.setex('orders', 300, JSON.stringify(orders)); // 5min TTL
}
```

### Estrategia de invalidación

```typescript
// Cuando algo cambia, limpia inteligentemente
async function invalidateOrderCache(orderId: number) {
  await Promise.all([
    redis.del(`order_${orderId}`),
    redis.del('orders_list'),
    redis.del('orders_stats')
  ]);
}
```

## 💡 Consejos prácticos

### Lo que funciona bien
- **TTL cortos**: 5-30 minutos para datos que cambian frecuentemente
- **Namespacing**: Usa prefijos como `orders:`, `users:`, `stats:`
- **Monitoreo**: Redis tiene métricas built-in excelentes

### Errores comunes a evitar
- **No uses Redis como base de datos principal**: Es caché, no storage permanente
- **Cuidado con la memoria**: Monitorea el uso, Redis es in-memory
- **TTL = 0 es peligroso**: Datos sin expiración pueden llenar la memoria

##  Conclusión

Redis no es solo "una base de datos rápida". Es una herramienta que transforma cómo tu aplicación maneja datos temporales y frecuentes. Para sistemas de órdenes, es prácticamente indispensable.

**Úsalo si necesitas:**
- ⚡ Respuestas ultrarrápidas
- 🔄 Manejo eficiente de estados temporales
- 🔒 Operaciones atómicas sin complejidad
- 📈 Escalabilidad sin dolores de cabeza

**Considera alternativas solo si:**
- Ya tienes otra solución funcionando bien
- Tu carga es muy específica y diferente
- Tienes restricciones técnicas particulares

Al final del día, Redis te permite enfocarte en la lógica de negocio mientras él se encarga de que todo sea rápido y confiable.