import { Table, Model, Column, DataType, AllowNull, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { Product } from './Product';
import { Supermarket } from './Supermarket';

@Table({
    tableName: 'categories',
})
export class Category extends Model {

    @AllowNull(false)
    @Column({
        type: DataType.STRING(50)
    })
    declare name: string;

    // Clave foránea que conecta con el Supermercado
    @ForeignKey(() => Supermarket)
    @AllowNull(false)
    @Column({
        type: DataType.INTEGER // O DataType.UUID si decides cambiar las PK de las tablas
    })
    declare supermarketId: number;

    @BelongsTo(() => Supermarket)
    declare supermarket: Supermarket;

    // Relación: Una categoría tiene muchos productos
    @HasMany(() => Product)
    declare products: Product[];
}

export default Category;