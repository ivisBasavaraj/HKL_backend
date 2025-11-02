const mongoose = require('mongoose');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// MongoDB models
const User = require('../models/User');
const Inspection = require('../models/Inspection');
const Finishing = require('../models/Finishing');
const QualityControl = require('../models/QualityControl');
const Delivery = require('../models/Delivery');
const ToolList = require('../models/ToolList');

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function migrateData() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/trackpro');
    console.log('Connected to MongoDB');

    // Migrate Users
    console.log('Migrating users...');
    const users = await User.find({});
    const userMapping = {};
    
    for (const user of users) {
      const { data, error } = await supabase
        .from('users')
        .insert({
          name: user.name,
          username: user.username,
          password: user.password,
          role: user.role,
          is_active: user.isActive,
          assigned_task: user.assignedTask,
          completed_today: user.completedToday || 0,
          total_assigned: user.totalAssigned || 0,
          created_at: user.createdAt,
          updated_at: user.updatedAt
        })
        .select('id')
        .single();
      
      if (!error) {
        userMapping[user._id.toString()] = data.id;
        console.log(`Migrated user: ${user.username}`);
      } else {
        console.error(`Error migrating user ${user.username}:`, error);
      }
    }

    // Migrate Inspections
    console.log('Migrating inspections...');
    const inspections = await Inspection.find({}).populate('inspectedBy');
    
    for (const inspection of inspections) {
      const { error } = await supabase
        .from('inspections')
        .insert({
          unit_number: inspection.unitNumber,
          component_name: inspection.componentName,
          supplier_details: inspection.supplierDetails,
          image_path: inspection.imagePath,
          remarks: inspection.remarks,
          start_time: inspection.startTime,
          end_time: inspection.endTime,
          duration: inspection.duration,
          total_pause_time: inspection.totalPauseTime || 0,
          is_completed: inspection.isCompleted,
          timer_events: inspection.timerEvents || [],
          inspected_by: userMapping[inspection.inspectedBy?._id?.toString()],
          created_at: inspection.createdAt,
          updated_at: inspection.updatedAt
        });
      
      if (!error) {
        console.log(`Migrated inspection: ${inspection.componentName}`);
      } else {
        console.error(`Error migrating inspection:`, error);
      }
    }

    // Migrate Finishing records
    console.log('Migrating finishing records...');
    const finishingRecords = await Finishing.find({}).populate('processedBy');
    
    for (const finishing of finishingRecords) {
      const { error } = await supabase
        .from('finishing')
        .insert({
          tool_used: finishing.toolUsed,
          tool_status: finishing.toolStatus,
          part_component_id: finishing.partComponentId,
          operator_name: finishing.operatorName,
          remarks: finishing.remarks,
          duration: finishing.duration,
          is_completed: finishing.isCompleted,
          processed_by: userMapping[finishing.processedBy?._id?.toString()],
          created_at: finishing.createdAt,
          updated_at: finishing.updatedAt
        });
      
      if (!error) {
        console.log(`Migrated finishing record: ${finishing.partComponentId}`);
      } else {
        console.error(`Error migrating finishing record:`, error);
      }
    }

    // Migrate Quality Control records
    console.log('Migrating quality control records...');
    const qcRecords = await QualityControl.find({}).populate('inspectedBy');
    
    for (const qc of qcRecords) {
      const { error } = await supabase
        .from('quality_control')
        .insert({
          part_id: qc.partId,
          hole_dimensions: qc.holeDimensions,
          level_readings: qc.levelReadings,
          inspector_name: qc.inspectorName,
          signature_image_path: qc.signatureImagePath,
          remarks: qc.remarks,
          qc_status: qc.qcStatus,
          inspected_by: userMapping[qc.inspectedBy?._id?.toString()],
          created_at: qc.createdAt,
          updated_at: qc.updatedAt
        });
      
      if (!error) {
        console.log(`Migrated QC record: ${qc.partId}`);
      } else {
        console.error(`Error migrating QC record:`, error);
      }
    }

    // Migrate Delivery records
    console.log('Migrating delivery records...');
    const deliveries = await Delivery.find({}).populate('processedBy');
    
    for (const delivery of deliveries) {
      const { error } = await supabase
        .from('deliveries')
        .insert({
          customer_name: delivery.customerName,
          customer_id: delivery.customerId,
          delivery_address: delivery.deliveryAddress,
          part_id: delivery.partId,
          vehicle_details: delivery.vehicleDetails,
          driver_name: delivery.driverName,
          driver_contact: delivery.driverContact,
          scheduled_date: delivery.scheduledDate,
          scheduled_time: delivery.scheduledTime,
          delivery_status: delivery.deliveryStatus,
          delivery_proof_image_path: delivery.deliveryProofImagePath,
          remarks: delivery.remarks,
          processed_by: userMapping[delivery.processedBy?._id?.toString()],
          created_at: delivery.createdAt,
          updated_at: delivery.updatedAt
        });
      
      if (!error) {
        console.log(`Migrated delivery: ${delivery.customerName}`);
      } else {
        console.error(`Error migrating delivery:`, error);
      }
    }

    // Migrate Tool Lists
    console.log('Migrating tool lists...');
    const toolLists = await ToolList.find({}).populate('uploadedBy');
    
    for (const toolList of toolLists) {
      const { error } = await supabase
        .from('tool_lists')
        .insert({
          tool_name: toolList.toolName,
          tool_data: toolList.toolData,
          uploaded_by: userMapping[toolList.uploadedBy?._id?.toString()],
          created_at: toolList.createdAt,
          updated_at: toolList.updatedAt
        });
      
      if (!error) {
        console.log(`Migrated tool list: ${toolList.toolName}`);
      } else {
        console.error(`Error migrating tool list:`, error);
      }
    }

    console.log('Migration completed successfully!');
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

migrateData();