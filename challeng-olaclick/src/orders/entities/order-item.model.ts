import { Table, Column, Model, ForeignKey, BelongsTo, DataType } from 'sequelize-typescript';
import { Order } from './order.model';

@Table({ tableName: 'order_items' })
export class OrderItem extends Model {
    @Column
    declare description: string;

    @Column
    declare quantity: number;

    @Column({ type: DataType.FLOAT })
    declare unitPrice: number;

    @ForeignKey(() => Order)
    @Column
    declare orderId: number;

    @BelongsTo(() => Order)
    declare order: Order;
}