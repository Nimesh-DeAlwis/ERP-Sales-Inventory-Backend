# ERP-Sales-Inventory-Backend

# Mora ERP Backend

A comprehensive Enterprise Resource Planning (ERP) system backend built with Node.js, Express.js, and SQL Server for retail business management.

## 🚀 Features

### User Management
- **Authentication & Authorization**: JWT-based authentication with session management
- **User CRUD Operations**: Create, read, update, delete users with validation
- **Role-Based Access Control**: Permission-based location loading and access control
- **User Groups**: Hierarchical user group management
- **Profile Management**: User profile with image upload capabilities

### Master Data Management
- **Locations**: Multi-location support with hierarchical structure
- **Titles**: User title management
- **Units**: Product unit definitions
- **Payment Modes**: Various payment method configurations

### Customer & Supplier Management
- **Customer Management**: Complete customer lifecycle management
- **Customer Groups**: Customer segmentation and grouping
- **Supplier Management**: Supplier information and relationship management
- **Supplier Groups**: Supplier categorization

### Product Management
- **Departments**: Product department categorization
- **Sub-Departments**: Detailed product classification
- **Brands**: Brand management for products
- **Products**: Comprehensive product catalog with inventory tracking

### Transaction Management
- **Direct GRN (Goods Receipt Note)**: Direct goods receipt processing
- **Purchase Orders (PO)**: Purchase order management
- **GRN (Goods Receipt Note)**: Standard goods receipt processing
- **Damage/Wastage Note (DWO)**: Damage and wastage tracking
- **Usage Note (USG)**: Product usage tracking
- **Stock Verification (VER)**: Inventory verification processes
- **Supplier Return (SUPR)**: Supplier return management

### Sales Management
- **Quotations (QUO)**: Sales quotation generation and management
- **Corporate Invoices (COI)**: Invoice generation with PDF export
- **Sales Returns (COR)**: Sales return processing and management

## 🛠 Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: Microsoft SQL Server
- **Authentication**: JWT (JSON Web Tokens)
- **Session Management**: Express Session
- **File Upload**: Multer with Sharp for image processing
- **PDF Generation**: PDFKit
- **Security**: Helmet, CORS, bcryptjs for password hashing
- **Validation**: Express Validator
- **Data Export**: JSON2CSV

## 📋 Prerequisites

- Node.js (v14 or higher)
- Microsoft SQL Server
- npm or yarn package manager

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   NODE_ENV=development
   PORT=5000
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   SESSION_SECRET=your_session_secret_change_this
   DB_SERVER=your_sql_server_instance
   DB_NAME=your_database_name
   DB_USER=your_database_username
   DB_PASSWORD=your_database_password
   DB_PORT=1433
   FRONTEND_URL=http://localhost:3000
   ```

4. **Database Setup**
   - Ensure SQL Server is running
   - Create the database specified in `DB_NAME`
   - Run the database schema scripts (if available)

5. **Start the server**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

The server will start on port 5000 (or the port specified in your `.env` file).

## 📁 Project Structure

```
backend/
├── src/
│   ├── app.js                 # Main application setup
│   ├── config/
│   │   └── database.js        # Database configuration
│   ├── controllers/           # Business logic controllers
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   └── ... (other controllers)
│   ├── middleware/            # Custom middleware
│   │   ├── auth.middleware.js
│   │   └── permission.middleware.js
│   ├── models/                # Data models
│   │   ├── user.model.js
│   │   ├── customer.model.js
│   │   └── ... (other models)
│   ├── routes/                # API route definitions
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   └── ... (other routes)
│   ├── services/              # Business service layer
│   │   ├── auth.service.js
│   │   ├── user.service.js
│   │   └── ... (other services)
│   ├── utils/                 # Utility functions
│   └── validators/            # Input validation
├── uploads/                   # File upload directory
├── .env                       # Environment variables
├── package.json               # Dependencies and scripts
├── server.js                  # Server entry point
└── README.md                  # This file
```

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user info

### User Management
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Master Data
- `GET /api/locations` - Get locations
- `GET /api/titles` - Get titles
- `GET /api/masters/units` - Get units
- `GET /api/masters/paymodes` - Get payment modes

### Customer Management
- `GET /api/customers/master/search` - Search customers
- `POST /api/customers/master` - Create customer
- `PUT /api/customers/master/:id` - Update customer
- `DELETE /api/customers/master/:id` - Delete customer

### Supplier Management
- `GET /api/suppliers/master` - Get suppliers
- `POST /api/suppliers/master` - Create supplier
- `PUT /api/suppliers/master/:id` - Update supplier

### Product Management
- `GET /api/products/department` - Get departments
- `GET /api/products/brand` - Get brands
- `GET /api/products/master` - Get products

### Transactions
- `GET /api/transactions/po` - Purchase orders
- `GET /api/transactions/grn` - Goods receipt notes
- `POST /api/transactions/grn` - Create GRN

### Sales
- `GET /api/sales/quo` - Quotations
- `POST /api/sales/quo` - Create quotation
- `GET /api/sales/coi` - Corporate invoices
- `POST /api/sales/coi` - Create invoice
- `GET /api/sales/cor` - Sales returns
- `POST /api/sales/cor` - Create sales return

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for secure password storage
- **CORS Protection**: Configured CORS policies
- **Helmet Security**: Security headers and protections
- **Input Validation**: Comprehensive input validation using express-validator
- **Session Management**: Secure session handling

## 📊 Database Schema

The system uses Microsoft SQL Server with stored procedures for complex operations. Key tables include:

- Users and authentication tables
- Master data tables (locations, titles, units, etc.)
- Customer and supplier tables
- Product catalog tables
- Transaction tables (PO, GRN, invoices, etc.)
- Sales tables (quotations, invoices, returns)

## 🧪 Testing

```bash
npm test
```

## 📝 Development Notes

### Recent Updates (as of April 2026)
- User authentication module with JWT and session management
- User CRUD operations with validation and image upload
- Comprehensive master data management
- Transaction processing modules
- Sales management with PDF generation

### File Upload
- Images are stored in the `uploads/` directory
- Supported formats: JPEG, PNG, WebP
- Automatic image optimization using Sharp

### PDF Generation
- Invoice and quotation PDFs using PDFKit
- Customer information prominently displayed
- Professional formatting with company branding

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software for MoraCore ERP system.

## 📞 Support

For support and questions, please contact me.

