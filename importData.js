const mongoose = require('mongoose');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Import the Entry model
const Entry = require('./models/Entry');

// Function to generate random date between June 21, 2025 and June 30, 2025 (inclusive)
function generateRandomDate() {
  const startDate = new Date('2025-06-21');
  const endDate = new Date('2025-06-30');
  // Add one day to make end date inclusive
  endDate.setDate(endDate.getDate() + 1);
  const randomTime = startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime());
  const randomDate = new Date(randomTime);
  
  // Format as YYYY-MM-DD
  return randomDate.toISOString().split('T')[0];
}

// Function to validate and clean data
function validateAndCleanData(row, index) {
  const serialNumber = (row['Sr.'] || row['Serial Number'] || row['Serial'] || '').toString().trim();
  
  // Generate serial number if missing
  const finalSerialNumber = serialNumber || `AUTO_${index + 1}`;
  
  return {
    serialNumber: finalSerialNumber,
    name: (row['Name'] || '').toString().trim() || 'N/A',
    fatherName: (row['Father Name'] || '').toString().trim() || 'N/A',
    cnic: (row['CNIC'] || '').toString().trim() || 'N/A',
    villageName: (row['Village Name'] || '').toString().trim() || 'N/A',
    uc: (row['UC'] || row['uc'] || '').toString().trim() || 'Unknown',
    tehsil: (row['Tehsil'] || '').toString().trim() || 'N/A',
    location: (row['Location'] || '').toString().trim() || 'N/A'
  };
}

// Function to import data from Excel
async function importData() {
  try {
    // Check if Excel file exists
    const excelPath = path.join(__dirname, 'data.xlsx');
    if (!fs.existsSync(excelPath)) {
      throw new Error(`Excel file not found at: ${excelPath}`);
    }

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/entry-database', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Read the Excel file
    const workbook = XLSX.readFile(excelPath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    if (!data || data.length === 0) {
      throw new Error('No data found in Excel file');
    }

    console.log(`Found ${data.length} entries in Excel file`);

    // Clear existing entries
    await Entry.deleteMany({});
    console.log('Cleared existing entries');

    // Group entries by UC
    const ucGroups = {};
    data.forEach((row, index) => {
      const cleanedData = validateAndCleanData(row, index);
      const uc = cleanedData.uc;
      
      if (!ucGroups[uc]) {
        ucGroups[uc] = [];
      }
      ucGroups[uc].push({ ...cleanedData, originalRow: row, index });
    });

    console.log(`Grouped entries into ${Object.keys(ucGroups).length} UC groups`);

    // Generate dates for each UC group and create entries
    const entries = [];
    let ucDateMap = {};
    let totalProcessed = 0;

    for (const [uc, groupEntries] of Object.entries(ucGroups)) {
      // Generate a random date for this UC group
      const randomDate = generateRandomDate();
      ucDateMap[uc] = randomDate;
      
      console.log(`UC: ${uc} - Generated date: ${randomDate} for ${groupEntries.length} entries`);

      // Create entries for this UC group
      for (const entryData of groupEntries) {
        const entry = new Entry({
          serialNumber: entryData.serialNumber,
          name: entryData.name,
          fatherName: entryData.fatherName,
          cnic: entryData.cnic,
          villageName: entryData.villageName,
          uc: entryData.uc,
          tehsil: entryData.tehsil,
          location: entryData.location,
          dateOfCommissioning: randomDate,
          installationDate: randomDate,
          woodSaved: '',
          treesSaved: '',
          areaSaved: '',
          co2Saved: '',
          carbonCredits: ''
        });

        entries.push(entry);
        totalProcessed++;

        // Log progress every 50 entries
        if (totalProcessed % 50 === 0) {
          console.log(`Processed ${totalProcessed}/${data.length} entries...`);
        }
      }
    }

    // Insert all entries into database in batches
    const batchSize = 100;
    let insertedCount = 0;
    
    for (let i = 0; i < entries.length; i += batchSize) {
      const batch = entries.slice(i, i + batchSize);
      const result = await Entry.insertMany(batch);
      insertedCount += result.length;
      console.log(`Inserted batch ${Math.floor(i/batchSize) + 1}: ${result.length} entries`);
    }

    console.log(`Successfully imported ${insertedCount} entries to MongoDB`);

    // Display summary
    console.log('\n=== IMPORT SUMMARY ===');
    console.log(`Total entries imported: ${insertedCount}`);
    console.log(`Total UC groups: ${Object.keys(ucGroups).length}`);
    console.log('\nUC Groups and their dates:');
    for (const [uc, date] of Object.entries(ucDateMap)) {
      const count = ucGroups[uc].length;
      console.log(`- ${uc}: ${date} (${count} entries)`);
    }

    // Close database connection
    await mongoose.connection.close();
    console.log('Database connection closed');

  } catch (error) {
    console.error('Error importing data:', error);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
}

// Run the import function
importData(); 