import {
  Column,
  DataType,
  Model,
  Table,
  Default,
  Unique,
  BelongsToMany,
  AllowNull,
  HasMany
} from "sequelize-typescript";
import Supermarket from "./Supermarket";
import UserFavoriteSupermarket from "./UserFavoriteSupermarket";
import UserContact from "./UserContact";

@Table({
  tableName: "users",
})
export class User extends Model {
  @AllowNull(false)
  @Column({
    type: DataType.STRING(50),
  })
  declare name: string;

  @AllowNull(false)
  @Column({
    type: DataType.STRING(60),
  })
  declare password: string;

  @Unique(true)
  @AllowNull(false)
  @Column({
    type: DataType.STRING(50),
  })
  declare email: string;

  @Column({
    type: DataType.ENUM("client", "supermarket_admin", "driver", "admin"),
    defaultValue: "client",
    allowNull: false,
  })
  declare role: string;

  @Column({
    type: DataType.STRING(6),
  })
  declare token: string;

  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
  })
  declare confirmed: boolean;

  @HasMany(() => UserContact)
declare contacts: UserContact[];

  @BelongsToMany(() => Supermarket, {
    through: () => UserFavoriteSupermarket,
    as: "favoriteSupermarkets",
  })
  declare favoriteSupermarkets: Supermarket[];
}

export default User;
