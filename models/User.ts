import mongoose, { Schema } from 'mongoose';
import { 
  IUser, 
  IUserModel, 
  UserStatus, 
  UserRole, 
  RegistrationSource 
} from '@/types';

// Re-export for backward compatibility
export type { IUser, IUserModel };
export { UserStatus, UserRole, RegistrationSource };

/**
 * User Schema
 */
const UserSchema: Schema = new Schema(
  {
    // Authentication - at least one of phone or email must be provided
    phone: {
      type: String,
      sparse: true, // Allows multiple null values but unique non-null values
      unique: true,
      trim: true,
      validate: {
        validator: function(v: string) {
          // Indian phone number validation (10 digits)
          return !v || /^[6-9]\d{9}$/.test(v);
        },
        message: 'Please provide a valid 10-digit Indian phone number',
      },
    },
    phoneVerified: {
      type: Boolean,
      default: false,
    },
    phoneVerifiedAt: {
      type: Date,
    },
    
    email: {
      type: String,
      sparse: true, // Allows multiple null values but unique non-null values
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: function(v: string) {
          return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: 'Please provide a valid email address',
      },
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerifiedAt: {
      type: Date,
    },
    
    // Profile
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    profilePicture: {
      type: String,
      trim: true,
    },
    
    // Role & Permissions
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
      required: true,
    },
    
    // Exam & Preferences
    examType: {
      type: String,
      enum: ['neet-pg', 'other-exams'],
    },
    targetYear: {
      type: Number,
      min: 2024,
      max: 2050,
    },
    
    // Status & Tracking
    status: {
      type: String,
      enum: Object.values(UserStatus),
      default: UserStatus.PENDING,
      required: true,
    },
    registrationSource: {
      type: String,
      enum: Object.values(RegistrationSource),
      default: RegistrationSource.WEB,
      required: true,
    },
    
    // Streak & Engagement
    currentStreak: {
      type: Number,
      default: 0,
      min: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastActiveDate: {
      type: Date,
    },
    totalPoints: {
      type: Number,
      default: 0,
      min: 0,
    },
    
    // Subscription/Payment
    isPremium: {
      type: Boolean,
      default: false,
    },
    premiumExpiresAt: {
      type: Date,
    },
    paymentIds: [{
      type: Schema.Types.ObjectId,
      ref: 'Payment',
    }],
    
    // Security & Login
    lastLoginAt: {
      type: Date,
    },
    lastLoginIp: {
      type: String,
      trim: true,
    },
    loginCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    blockedReason: {
      type: String,
      trim: true,
    },
    blockedUntil: {
      type: Date,
    },
    
    // Metadata for additional flexible data
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Indexes for better query performance
 * Note: email and phone unique indexes are already defined in field definitions
 */
// Composite indexes for common queries
UserSchema.index({ email: 1, status: 1 });
UserSchema.index({ phone: 1, status: 1 });
UserSchema.index({ status: 1, isPremium: 1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ lastLoginAt: -1 });

// Index for blocked users check
UserSchema.index({ isBlocked: 1, blockedUntil: 1 });

/**
 * Custom validation: At least one of email or phone must be provided
 */
UserSchema.pre('save', function() {
  if (!this.email && !this.phone) {
    throw new Error('Either email or phone must be provided');
  }
});

/**
 * Instance method: Check if user is currently blocked
 */
UserSchema.methods.isCurrentlyBlocked = function(): boolean {
  if (!this.isBlocked) return false;
  if (!this.blockedUntil) return true; // Permanently blocked
  return new Date() < this.blockedUntil;
};

/**
 * Instance method: Check if premium is active
 */
UserSchema.methods.isPremiumActive = function(): boolean {
  if (!this.isPremium) return false;
  if (!this.premiumExpiresAt) return true; // Lifetime premium
  return new Date() < this.premiumExpiresAt;
};

/**
 * Instance method: Get primary identifier (email or phone)
 */
UserSchema.methods.getPrimaryIdentifier = function(): string {
  return this.email || this.phone || 'Unknown';
};

/**
 * Static method: Find user by email or phone
 */
UserSchema.statics.findByIdentifier = function(identifier: string) {
  // Check if identifier is email or phone
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
  const query = isEmail ? { email: identifier.toLowerCase() } : { phone: identifier };
  return this.findOne(query);
};

/**
 * User Model
 */
const User: IUserModel =
  (mongoose.models.User as IUserModel) || mongoose.model<IUser, IUserModel>('User', UserSchema);

export default User;

