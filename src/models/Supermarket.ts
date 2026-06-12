import { Table, Model, Column, DataType, AllowNull, HasMany } from 'sequelize-typescript';
import { Category } from './Category';

@Table({
    tableName: 'supermarkets',
})
export class Supermarket extends Model {

    @AllowNull(false)
    @Column({
        type: DataType.STRING(100)
    })
    declare name: string;

    @Column({
        type: DataType.STRING(255)
    })
    declare logo: string;

    @AllowNull(false)
    @Column({
        type: DataType.STRING(255)
    })
    declare address: string;

    // Relación: Un supermercado tiene muchas categorías en su catálogo
    @HasMany(() => Category)
    declare categories: Category[];
}

export default Supermarket;