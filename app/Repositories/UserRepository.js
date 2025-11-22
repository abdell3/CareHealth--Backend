const User = require('../Models/User');

class UserRepository {
  async findAll(query = {}, options = {}) {
    const {
      page = 1,
      limit = 10,
      search = '',
      role = null
    } = options;

    const skip = (page - 1) * limit;
    const filter = { ...query };

    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (role) {
      filter.role = role;
    }

    const [items, total] = await Promise.all([
      User.find(filter)
        .select('-password -refreshToken -resetToken -passwordResetToken')
        .populate('role')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      User.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  }

  async findById(id) {
    return await User.findById(id).select('-password -refreshToken -resetToken -passwordResetToken').populate('role');
  }

  async findByEmail(email) {
    return await User.findOne({ email: email.toLowerCase().trim() }).populate('role');
  }

  async findByIdWithPassword(id) {
    return await User.findById(id).populate('role');
  }

  async create(data) {
    const user = new User(data);
    return await user.save();
  }

  async update(id, data) {
    return await User.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    ).select('-password -refreshToken -resetToken -passwordResetToken').populate('role');
  }

  async delete(id) {
    return await User.findByIdAndDelete(id);
  }

  async storeRefreshToken(userId, token) {
    return await User.findByIdAndUpdate(
      userId,
      { $set: { refreshToken: token } },
      { new: true, runValidators: true }
    );
  }

  async removeRefreshToken(userId) {
    return await User.findByIdAndUpdate(
      userId,
      { $unset: { refreshToken: '' } },
      { new: true }
    );
  }

  async findByResetToken(token) {
    return await User.findOne({
      resetToken: token,
      resetTokenExpires: { $gt: Date.now() }
    });
  }

  async setResetToken(userId, token, expiresAt) {
    return await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          resetToken: token,
          resetTokenExpires: expiresAt
        }
      },
      { new: true, runValidators: true }
    );
  }

  async clearResetToken(userId) {
    return await User.findByIdAndUpdate(
      userId,
      {
        $unset: {
          resetToken: '',
          resetTokenExpires: ''
        }
      },
      { new: true }
    );
  }

  async savePasswordResetToken(userId, token, expires) {
    return await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          passwordResetToken: token,
          passwordResetExpires: expires
        }
      },
      { new: true, runValidators: true }
    );
  }

  async updatePasswordById(userId, hashedPassword) {
    return await User.findByIdAndUpdate(
      userId,
      {
        $set: { password: hashedPassword },
        $unset: {
          passwordResetToken: '',
          passwordResetExpires: ''
        }
      },
      { new: true, runValidators: true }
    );
  }

  async findByPasswordResetToken(token) {
    return await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    }).populate('role');
  }

  async suspendUser(id, adminId) {
    return await User.findByIdAndUpdate(
      id,
      {
        $set: {
          isSuspended: true,
          isActive: false,
          suspendedAt: new Date(),
          suspendedBy: adminId
        }
      },
      { new: true, runValidators: true }
    ).select('-password -refreshToken -resetToken -passwordResetToken').populate('role');
  }

  async activateUser(id, adminId) {
    return await User.findByIdAndUpdate(
      id,
      {
        $set: {
          isSuspended: false,
          isActive: true,
          suspendedAt: null,
          suspendedBy: null
        }
      },
      { new: true, runValidators: true }
    ).select('-password -refreshToken -resetToken -passwordResetToken').populate('role');
  }

  async updateRole(id, roleId) {
    return await User.findByIdAndUpdate(
      id,
      { $set: { role: roleId } },
      { new: true, runValidators: true }
    ).select('-password -refreshToken -resetToken -passwordResetToken').populate('role');
  }

  async searchUsers(search, pagination = {}) {
    const {
      page = 1,
      limit = 10,
      role = null
    } = pagination;

    const skip = (page - 1) * limit;
    const filter = {};

    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (role) {
      filter.role = role;
    }

    const [items, total] = await Promise.all([
      User.find(filter)
        .select('-password -refreshToken -resetToken -passwordResetToken')
        .populate('role')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      User.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  }

}

module.exports = UserRepository;
