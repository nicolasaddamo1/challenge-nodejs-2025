import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.model';
import { OrderItem } from './entities/order-item.model';
import { CacheModule } from '@nestjs/cache-manager';
import { ScheduleModule } from '@nestjs/schedule';
import { OrdersCleanupService } from './orders-cleanup.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),

    SequelizeModule.forFeature([Order, OrderItem]),
    CacheModule.register(),
  ],
  controllers: [OrdersController],
  providers: [OrdersCleanupService, OrdersService],
  exports: [SequelizeModule]
})
export class OrdersModule { }
