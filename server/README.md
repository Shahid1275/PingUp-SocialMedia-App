# Authentication Module - Standalone

Complete authentication module with email/password, Google Login, Apple Login, forgot password, OTP verification, and user profile management.

## 🚀 Features

- ✅ **Email/Password Authentication** - Signup & Login with email
- ✅ **Google Login** - OAuth integration
- ✅ **Apple Login** - OAuth integration
- ✅ **Forgot Password** - 3-step OTP verification process
- ✅ **Change Password** - For logged-in users
- ✅ **Update Profile** - User profile management
- ✅ **Delete Account** - Complete account deletion
- ✅ **JWT Authentication** - Secure token-based auth
- ✅ **Email OTP** - 6-digit OTP with 2-minute expiration
- ✅ **Security Features** - Password hashing, token verification
- ✅ **Error Handling** - Comprehensive error handling
- ✅ **Input Validation** - Joi validation schemas

## 📁 Project Structure

```
auth-module-standalone/
├── index.js                          # Main server file
├── package.json                       # Dependencies
├── .env.example                       # Environment variables template
├── .gitignore                         # Git ignore file
└── src/
    ├── api/
    │   └── auth/
    │       ├── auth.js                # Auth routes
    │       └── controllers/
    │           ├── authentication.js   # Signup & Login
    │           ├── forgotPassword.js   # Password reset & profile
    │           ├── googleLogin.js      # Google OAuth
    │           └── appleLogin.js       # Apple OAuth
    ├── models/
    │   └── user.js                    # User schema
    ├── middleware/
    │   ├── verifyToken.js             # JWT verification
    │   └── errorHandler.js            # Error handling
    ├── validations/
    │   ├── index.js                   # Validation exports
    │   └── userValidations.js         # Joi schemas
    ├── utils/
    │   ├── logger.js                  # Logging utility
    │   ├── sanitizeResponse.js        # Response sanitization
    │   ├── sendEmail.js               # Email service
    │   ├── getOtp.js                  # OTP generator
    │   └── forgotPasswordHtml.js      # Email template
    ├── database/
    │   └── db.js                      # MongoDB connection
    └── routes/
        └── authRoutes.js              # Route exports
```

## 🛠️ Installation & Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Update the `.env` file with your configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/auth-db

# JWT Configuration
JWT_SECRET_KEY=your_super_secret_jwt_key_here_change_this_in_production

# Email Configuration (Gmail SMTP)
EMAIL_MAIL=your-email@gmail.com
EMAIL_PASS=your-app-specific-password

# CORS Configuration (optional)
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
```

### 3. Gmail App Password Setup

For email OTP to work, you need to generate an App Password from your Gmail account:

1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Navigate to **Security** → **2-Step Verification** (enable if not enabled)
3. Scroll to **App passwords**
4. Generate a new app password for "Mail"
5. Copy the 16-character password and use it as `EMAIL_PASS` in `.env`

### 4. Start the Server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

Server will run on `http://localhost:5000`

## 📡 API Endpoints

### Base URL
```
http://localhost:5000/api/auth
```

### Public Routes (No authentication required)

#### 1. **Signup**
```http
POST /api/auth/signup
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Welcome! Your account has been created successfully",
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 2. **Login**
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

#### 3. **Google Login**
```http
POST /api/auth/googleLogin
```

**Request Body:**
```json
{
  "email": "john@gmail.com",
  "name": "John Doe",
  "provider": "google"
}
```

#### 4. **Apple Login**
```http
POST /api/auth/appleLogin
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "name": "John Doe",
  "provider": "apple"
}
```

#### 5. **Forgot Password (3-Step Process)**

**Step 1: Send OTP**
```http
POST /api/auth/forgotPassword
```
```json
{
  "email": "john@example.com",
  "step": 1
}
```

**Step 2: Verify OTP**
```json
{
  "email": "john@example.com",
  "step": 2,
  "otp": "123456"
}
```

**Step 3: Reset Password**
```json
{
  "email": "john@example.com",
  "step": 3,
  "password": "newPassword123"
}
```

### Protected Routes (Require JWT token)

**Authentication Header:**
```http
Authorization: Bearer <your_jwt_token>
```

#### 6. **Change Password**
```http
POST /api/auth/resetPassword
```

**Request Body:**
```json
{
  "oldPassword": "currentPassword",
  "newPassword": "newPassword123"
}
```

#### 7. **Update Profile**
```http
PUT /api/auth/updateProfile
```

**Request Body:**
```json
{
  "name": "John Updated",
  "username": "johndoe",
  "bio": "Software Developer",
  "gender": "male",
  "profileImage": "https://example.com/image.jpg",
  "gym": "Fitness Center",
  "links": ["https://twitter.com/john", "https://linkedin.com/in/john"]
}
```

#### 8. **Profile Setup**
```http
POST /api/auth/profileSet
```

**Request Body:**
```json
{
  "profileImage": "https://example.com/image.jpg",
  "bio": "Developer",
  "age": 25,
  "gender": "male",
  "country": "USA",
  "state": "California"
}
```

#### 9. **Logout**
```http
POST /api/auth/logout
```

#### 10. **Delete Account**
```http
DELETE /api/auth/deleteUser
```

## 🔒 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: 7-day expiration
- **OTP Security**: 2-minute expiration, hashed storage
- **Input Validation**: Joi schemas for all inputs
- **CORS Protection**: Configurable allowed origins
- **Helmet**: Security headers
- **Rate Limiting Ready**: Can be easily integrated

## 📧 Email Templates

OTP email includes:
- Professional HTML template
- 6-digit OTP code
- 2-minute expiration warning
- Security reminder

## 🧪 Testing

Use tools like Postman, Insomnia, or Thunder Client to test the API.

### Example Postman Collection Flow:

1. **Signup** → Get token
2. **Login** → Get token
3. Use token in Authorization header for protected routes
4. **Update Profile** → Update user details
5. **Change Password** → Update password
6. **Logout** → End session

## 🚀 Deployment

### Environment Variables for Production

Make sure to set these in your production environment:

```env
NODE_ENV=production
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET_KEY=super_secure_random_key_at_least_32_chars
EMAIL_MAIL=your_production_email
EMAIL_PASS=your_production_email_password
ALLOWED_ORIGINS=https://yourdomain.com
```

### Recommended Hosting Platforms

- **Render** (Free tier available)
- **Railway** (Free tier available)
- **Heroku**
- **DigitalOcean**
- **AWS EC2**
- **Google Cloud Platform**

## 🔧 Integration with Frontend

### Example: React/Next.js Integration

```javascript
// Login example
const login = async (email, password) => {
  const response = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  
  const data = await response.json();
  
  if (data.success) {
    // Store token in localStorage or cookies
    localStorage.setItem('token', data.user.token);
    // Store user data
    localStorage.setItem('user', JSON.stringify(data.user));
  }
  
  return data;
};

// Authenticated request example
const updateProfile = async (profileData) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:5000/api/auth/updateProfile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  });
  
  return await response.json();
};
```

## 📝 User Model Schema

```javascript
{
  name: String (required),
  username: String,
  email: String (required, unique),
  profileImage: String,
  age: Number,
  country: String,
  state: String,
  bio: String,
  gym: String,
  password: String (hashed),
  provider: String (google/apple/password),
  forgotOtp: String (hashed),
  otpexpirationTime: Date,
  otpVerifiedAt: Date,
  gender: String (male/female/other),
  links: Array of Strings,
  timestamps: true (createdAt, updatedAt)
}
```

## 🆘 Troubleshooting

### Email not sending?
- Check Gmail app password is correct
- Ensure 2-Step Verification is enabled
- Check EMAIL_MAIL and EMAIL_PASS in .env
- Check spam/junk folder

### MongoDB connection error?
- Ensure MongoDB is running locally or connection string is correct
- Check MONGODB_URI in .env

### JWT token errors?
- Ensure JWT_SECRET_KEY is set in .env
- Check token format: `Bearer <token>`
- Token expires in 7 days by default

## 📄 License

ISC

## 👨‍💻 Support

For issues or questions, create an issue in the repository.

---

**Ready to use in any project! Just copy the entire folder and configure your environment variables.**
