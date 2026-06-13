import {
  Table,
  Model,
  Column,
  DataType,
  AllowNull,
  HasMany,
  BelongsTo,
  ForeignKey,
  BelongsToMany,
} from "sequelize-typescript";
import { Category } from "./Category";
import { User } from "./User";
import UserFavoriteSupermarket from "./UserFavoriteSupermarket";

@Table({
  tableName: "supermarkets",
})
export class Supermarket extends Model {
  @AllowNull(false)
  @Column({
    type: DataType.STRING(100),
  })
  declare name: string;

  @Column({
    type: DataType.STRING(255),
  })
  declare logo: string;

  @AllowNull(false)
  @Column({
    type: DataType.STRING(255),
  })
  declare address: string;

  @AllowNull(false)
  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
  })
  declare userId: number;

  @BelongsTo(() => User)
  declare admin: User;

  // Relación: Un supermercado tiene muchas categorías en su catálogo
  @HasMany(() => Category)
  declare categories: Category[];

  @BelongsToMany(() => User, {
    through: () => UserFavoriteSupermarket,
    as: "favoritedByUsers",
  })
  declare favoritedByUsers: User[];
}

export default Supermarket;
