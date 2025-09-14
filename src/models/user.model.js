import { DataTypes } from 'sequelize';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const UserModel = (sequelize) => {
  const User = sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password_hash: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM('user', 'admin'),
        defaultValue: 'user',
      },
    },
    {
      tableName: 'users',
      timestamps: true,
      underscored: true,
    }
  );

  // ✅ Sequelize HOOK (Before Save - hash password)
  User.beforeCreate(async (user) => {
    if (user.password_hash) {
      const salt = await bcrypt.genSalt(10);
      user.password_hash = await bcrypt.hash(user.password_hash, salt);
    }
  });

  // ✅ Sequelize INSTANCE METHOD to check password
  User.prototype.isPasswordCorrect = async function (inputPassword) {
    return await bcrypt.compare(inputPassword, this.password_hash);
  };

  // ✅ Sequelize INSTANCE METHOD to generate JWT
  User.prototype.generateAccessToken = function () {
    return jwt.sign(
      {
        id: this.id,
        name: this.name,
        email: this.email,
        role: this.role,
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '1d',
      }
    );
  };

  // Associations can be defined here if needed later
  User.associate = (models) => {
    // UserModel.hasMany(models.Booking, { foreignKey: 'user_id' });
  };

  return User;
};

export default UserModel;