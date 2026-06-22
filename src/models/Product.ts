// src/models/Product.ts
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
        type: DataType.DECIMAL(10, 2) // Soporta precios con centavos (ej. 99.99)
    })
    declare price: number;

    @Column({
        type: DataType.STRING(255)
    })
    declare description: string;

    @Column({
        type: DataType.STRING(255)
    })
    declare image: string;

    @AllowNull(false)
    @Column({
        type: DataType.DECIMAL(10, 2) // CAMBIO: Soportar stock en decimales para productos por libra (ej: 50.50 lbs de papas)
    })
    declare stock: number;

    @AllowNull(false)
    @Column({
        type: DataType.ENUM('ud', 'lb'), // ESTÁNDAR: Control estricto de tipos de unidades
        defaultValue: 'ud'
    })
    declare unitType: 'ud' | 'lb';

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