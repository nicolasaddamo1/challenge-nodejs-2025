import { Table, Column, Model, ForeignKey, BelongsTo, DataType } from 'sequelize-typescript';
import { Order } from './order.model';

@Table({ tableName: 'order_items' })
export class OrderItem extends Model {
    @Column
    description: string;

    @Column
    quantity: number;

    @Column({ type: DataType.FLOAT })
    unitPrice: number;

    @ForeignKey(() => Order)
    @Column
    orderId: number;

    @BelongsTo(() => Order)
    order: Order;
}