require('dotenv').config();
const express = require('express');
const router = express.Router();

// Import all route files
//user management routes
const authRoutes = require('./auth.routes'); // Authentication routes
const userRoutes = require('./user.routes'); // User management routes
const userMasterRoutes = require('./usermaster.routes'); // User master data routes
const userGroupRoutes = require('./usergroup.routes'); // User group management routes
//master data routes
const locationRoutes = require('./location.routes'); // Location management routes
const titleRoutes = require('./title.routes'); // Title management routes
const unitRoutes = require('./unit.routes'); // Unit management routes
const paymodeRoutes = require('./paymode.routes'); // Pay mode management routes
//customer management routes
const customergroupRoutes = require('./customergroup.routes'); // Customer group management routes
const customerRoutes = require('./customer.routes'); // Customer management routes
// Supplier management routes
const supplierGroupRoutes = require('./suppliergroup.routes'); // Supplier group management routes
const supplierRoutes = require('./supplier.routes'); // Supplier management routes
// Product management routes
const departmentRoutes = require('./department.routes'); // Department management routes
const subDepartmentRoutes = require('./subdepartment.routes'); // Sub Department management routes
const brandRoutes = require('./brand.routes'); // Brand management routes
const productRoutes = require('./product.routes'); // Product management routes
//transaction routes
const dirgrnRoutes = require('./transaction/dirgrn.routes'); // Direct GRN routes
const poRoutes = require('./transaction/po.routes'); // Purchase Order routes
const grnRoutes = require('./transaction/grn.routes'); // GRN routes
const dwoRoutes = require('./transaction/dwo.routes'); // Damage/Wastage Note routes
const usgRoutes = require('./transaction/usg.routes'); // Usage Note routes
const verRoutes = require('./transaction/ver.routes'); // Stock Verification routes
const supprRoutes = require('./transaction/supr.routes'); // Supplier Return routes
// Sales routes
const quoRoutes = require('./sales/quo.routes'); // Quotation routes
const coiRoutes = require('./sales/coi.routes'); // Corporate Invoice routes
const corRoutes = require('./sales/cor.routes'); // Sales Return routes
// Voucher routes
// Physical Voucher routes
const pvGroupRoutes = require('./vouchers/physicalvoucher/pvgroup.routes');



// Define routes
//user management routes
router.use('/auth', authRoutes);  // Authentication routes
router.use('/users', userRoutes);   // User management routes
router.use('/user-master', userMasterRoutes);  // User master data routes
router.use('/user-groups', userGroupRoutes);  // User group management routes
//master data routes
router.use('/locations', locationRoutes);  // Location management routes
router.use('/titles', titleRoutes);  // Title management routes
router.use('/masters/units', unitRoutes);  // Unit management routes\
router.use('/masters/paymodes', paymodeRoutes);  // Pay mode management routes
//customer management routes
router.use('/customers/groups', customergroupRoutes);  // Customer group management routes
router.use('/customers/master', customerRoutes);  // Customer management routes
//supplier management routes
router.use('/suppliers/supplier-groups', supplierGroupRoutes);  // Supplier group management routes
router.use('/suppliers/master', supplierRoutes);  // Supplier management routes
//product management routes
router.use('/products/department', departmentRoutes);  // Department management routes
router.use('/products/sub-department', subDepartmentRoutes);  // Sub Department management routes
router.use('/products/brand', brandRoutes);  // Brand management routes
router.use('/products/master', productRoutes);  // Product management routes
//transaction routes
router.use('/transactions/dir-grn', dirgrnRoutes);  // Direct GRN routes
router.use('/transactions/po', poRoutes);  // Purchase Order routes
router.use('/transactions/grn', grnRoutes);  // GRN routes
router.use('/transactions/dwo', dwoRoutes);  // Damage/Wastage Note routes
router.use('/transactions/usg', usgRoutes);  // Usage Note routes
router.use('/transactions/ver', verRoutes);  // Stock Verification routes
router.use('/transactions/supr', supprRoutes);  // Supplier Return routes
// Sales routes
router.use('/sales/quo', quoRoutes);  // Quotation routes
router.use('/sales/coi', coiRoutes);  // Corporate Invoice routes
router.use('/sales/cor', corRoutes);  // Sales Return routes
// Voucher routes
// Physical Voucher routes
router.use('/vouchers/physical-voucher/groups', pvGroupRoutes);  // Physical Voucher Group routes
console.log('All routes loaded successfully');


module.exports = router;