import { Table, Model, Column, DataType, ForeignKey, AllowNull } from 'sequelize-typescript';
import { Order } from './Order';
import { Product } from './Product';

@Table({
    tableName: 'order_products',
    timestamps: false, // No suele requerir createdAt/updatedAt independientes
})
export class OrderProduct extends Model {

    @ForeignKey(() => Order)
    @AllowNull(false)
    @Column({
        type: DataType.INTEGER
    })
    declare orderId: number;

    @ForeignKey(() => Product)
    @AllowNull(false)
    @Column({
        type: DataType.INTEGER
    })
    declare productId: number;

    @AllowNull(false)
    @Column({
        type: DataType.INTEGER // Cuántas unidades de ese producto lleva el carrito
    })
    declare quantity: number;

    @AllowNull(false)
    @Column({
        type: DataType.DECIMAL(10, 2) // Precio unitario guardado en el momento de la compra
    })
    declare priceAtPurchase: number;
}

export default OrderProduct;