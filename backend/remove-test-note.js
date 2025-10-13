/**
 * Script to remove specific test note from task LTASK0001
 */

require('dotenv').config();
const mongoose = require('mongoose');
const LabTask = require('./modules/lab-workflow/Model/LabTask');

async function removeTestNote() {
  try {
    console.log('🔍 Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find task LTASK0001
    console.log('\n🔍 Looking for task LTASK0001...');
    const task = await LabTask.findOne({ task_id: 'LTASK0001' });
    
    if (!task) {
      console.log('❌ Task LTASK0001 not found');
      return;
    }

    console.log('✅ Found task:', task.task_id, '-', task.taskTitle);
    console.log('📝 Current notes count:', task.notes ? task.notes.length : 0);

    if (task.notes && task.notes.length > 0) {
      console.log('\n📋 Current notes:');
      task.notes.forEach((note, index) => {
        console.log(`  ${index + 1}. Author: "${note.author}"`);
        console.log(`     Content: "${note.content}"`);
        console.log(`     Created: ${note.createdAt}`);
        console.log('');
      });

      // Remove notes with "John Doe" author
      console.log('🧹 Removing notes with "John Doe" author...');
      const originalCount = task.notes.length;
      task.notes = task.notes.filter(note => note.author !== 'John Doe');
      
      if (task.notes.length < originalCount) {
        await task.save();
        console.log('✅ John Doe notes removed successfully');
        console.log('📝 Remaining notes count:', task.notes.length);
      } else {
        console.log('❌ No notes with "John Doe" author found');
      }
    } else {
      console.log('📝 No notes found for this task');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

removeTestNote();