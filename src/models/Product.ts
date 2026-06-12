import { Table, Model, Column, DataType, AllowNull, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Category } from './Category';

@Table({
    tableName: 'products',
})
export class Product extends Model {

    @AllowNull(false)
    @Column({
        type: DataType.STRING(100)
    })
    declare name: string;

    @AllowNull(false)
    @Column({
        type: DataType.DECIMAL(10, 2) // Soporta precios con centavos de manera exacta (ej. 99.99)
    })
    declare price: number;

    @Column({
        type: DataType.STRING(255) // Descripción no muy larga como solicitaste
    })
    declare description: string;

    @Column({
        type: DataType.STRING(255)
    })
    declare image: string;

    @AllowNull(false)
    @Column({
        type: DataType.INTEGER
    })
    declare stock: number;

    // Clave foránea que conecta con la Categoría
    @ForeignKey(() => Category)
    @AllowNull(false)
    @Column({
        type: DataType.INTEGER
    })
    declare categoryId: number;

    @BelongsTo(() => Category)
    declare category: Category;
}

export default Product;