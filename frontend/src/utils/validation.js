// Validation utilities for forms
export const validatePrescriptionForm = (formData) => {
  const errors = {};

  // Validate patient ID
  if (!formData.patient_ID || formData.patient_ID.trim() === '') {
    errors.patient_ID = 'Patient ID is required';
  } else if (formData.patient_ID.length > 12) {
    errors.patient_ID = 'Patient ID cannot exceed 12 characters';
  }

  // Validate patient name
  if (!formData.patient_name || formData.patient_name.trim() === '') {
    errors.patient_name = 'Patient name is required';
  }

  // Validate doctor name
  if (!formData.doctor_Name || formData.doctor_Name.trim() === '') {
    errors.doctor_Name = 'Doctor name is required';
  }

  // Validate diagnosis
  if (!formData.Diagnosis || formData.Diagnosis.trim() === '') {
    errors.Diagnosis = 'Diagnosis is required';
  }

  // Validate medicines array
  if (!formData.Medicines || formData.Medicines.length === 0) {
    errors.Medicines = 'At least one medicine is required';
  } else {
    formData.Medicines.forEach((medicine, index) => {
      // Validate medicine name
      if (!medicine.Medicine_Name || medicine.Medicine_Name.trim() === '') {
        errors[`Medicines[${index}].Medicine_Name`] = `Medicine name is required for medicine ${index + 1}`;
      }

      // Validate dosage
      if (!medicine.Dosage || medicine.Dosage.trim() === '') {
        errors[`Medicines[${index}].Dosage`] = `Dosage is required for medicine ${index + 1}`;
      }

      // Validate frequency
      if (!medicine.Frequency || medicine.Frequency.trim() === '') {
        errors[`Medicines[${index}].Frequency`] = `Frequency is required for medicine ${index + 1}`;
      }

      // Validate duration
      if (!medicine.Duration || medicine.Duration.trim() === '') {
        errors[`Medicines[${index}].Duration`] = `Duration is required for medicine ${index + 1}`;
      }
    });
  }

  // Validate date
  if (!formData.Date) {
    errors.Date = 'Date is required';
  }

  return errors;
};

export const validatePatientForm = (formData) => {
  const errors = {};

  // Validate patient ID
  if (!formData.patient_ID || formData.patient_ID.trim() === '') {
    errors.patient_ID = 'Patient ID is required';
  } else if (formData.patient_ID.length > 12) {
    errors.patient_ID = 'Patient ID cannot exceed 12 characters';
  }

  // Validate patient name
  if (!formData.patient_name || formData.patient_name.trim() === '') {
    errors.patient_name = 'Patient name is required';
  } else if (formData.patient_name.length < 2) {
    errors.patient_name = 'Patient name must be at least 2 characters long';
  }

  // Validate patient age
  if (!formData.patient_age || formData.patient_age.toString().trim() === '') {
    errors.patient_age = 'Patient age is required';
  } else {
    const age = parseInt(formData.patient_age);
    if (isNaN(age) || age < 0) {
      errors.patient_age = 'Patient age must be a valid positive number';
    } else if (age > 120) {
      errors.patient_age = 'Patient age cannot exceed 120 years';
    }
  }

  // Validate gender
  if (!formData.Gender || formData.Gender.trim() === '') {
    errors.Gender = 'Gender is required';
  }

  // Validate email
  if (!formData.Email || formData.Email.trim() === '') {
    errors.Email = 'Email is required';
  } else if (!/\S+@\S+\.\S+/.test(formData.Email)) {
    errors.Email = 'Please enter a valid email address';
  }

  // Validate emergency contact
  if (!formData.Emergency_Contact || formData.Emergency_Contact.trim() === '') {
    errors.Emergency_Contact = 'Emergency contact is required';
  } else if (!/^\d{10}$/.test(formData.Emergency_Contact.replace(/\D/g, ''))) {
    errors.Emergency_Contact = 'Emergency contact must be a valid 10-digit phone number';
  }

  // Validate blood group
  if (!formData.Blood_group || formData.Blood_group.trim() === '') {
    errors.Blood_group = 'Blood group is required';
  }

  // Optional validations for text fields (only if provided)
  if (formData.Allergies && formData.Allergies.trim() !== '' && formData.Allergies.trim() !== 'None') {
    if (formData.Allergies.length > 500) {
      errors.Allergies = 'Allergies description cannot exceed 500 characters';
    }
  }

  if (formData.Current_medical_conditions && formData.Current_medical_conditions.trim() !== '' && formData.Current_medical_conditions.trim() !== 'None') {
    if (formData.Current_medical_conditions.length > 500) {
      errors.Current_medical_conditions = 'Current medical conditions cannot exceed 500 characters';
    }
  }

  if (formData.Past_surgeries && formData.Past_surgeries.trim() !== '' && formData.Past_surgeries.trim() !== 'None') {
    if (formData.Past_surgeries.length > 500) {
      errors.Past_surgeries = 'Past surgeries description cannot exceed 500 characters';
    }
  }

  return errors;
};

export const validateAppointmentForm = (formData) => {
  const errors = {};

  // Validate patient ID
  if (!formData.patientId || formData.patientId.trim() === '') {
    errors.patientId = 'Patient ID is required';
  }

  // Validate doctor ID
  if (!formData.doctorId || formData.doctorId.trim() === '') {
    errors.doctorId = 'Doctor ID is required';
  }

  // Validate appointment date
  if (!formData.appointmentDate) {
    errors.appointmentDate = 'Appointment date is required';
  } else {
    const appointmentDate = new Date(formData.appointmentDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (appointmentDate < today) {
      errors.appointmentDate = 'Appointment date cannot be in the past';
    }
  }

  // Validate appointment time
  if (!formData.appointmentTime || formData.appointmentTime.trim() === '') {
    errors.appointmentTime = 'Appointment time is required';
  }

  // Validate reason
  if (!formData.reason || formData.reason.trim() === '') {
    errors.reason = 'Reason for appointment is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateMedicineForm = (formData) => {
  const errors = {};

  // Validate medicine name
  if (!formData.name || formData.name.trim() === '') {
    errors.name = 'Medicine name is required';
  }

  // Validate quantity
  if (!formData.quantity || formData.quantity <= 0) {
    errors.quantity = 'Valid quantity is required';
  }

  // Validate price
  if (!formData.price || formData.price <= 0) {
    errors.price = 'Valid price is required';
  }

  // Validate expiry date
  if (!formData.expiryDate) {
    errors.expiryDate = 'Expiry date is required';
  } else {
    const expiryDate = new Date(formData.expiryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (expiryDate <= today) {
      errors.expiryDate = 'Expiry date must be in the future';
    }
  }

  // Validate manufacturer
  if (!formData.manufacturer || formData.manufacturer.trim() === '') {
    errors.manufacturer = 'Manufacturer is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateLabItemForm = (formData) => {
  const errors = {};

  // Validate item name
  if (!formData.itemName || formData.itemName.trim() === '') {
    errors.itemName = 'Item name is required';
  }

  // Validate quantity
  if (!formData.quantity || formData.quantity <= 0) {
    errors.quantity = 'Valid quantity is required';
  }

  // Validate unit price
  if (!formData.unitPrice || formData.unitPrice <= 0) {
    errors.unitPrice = 'Valid unit price is required';
  }

  // Validate supplier
  if (!formData.supplier || formData.supplier.trim() === '') {
    errors.supplier = 'Supplier is required';
  }

  // Validate category
  if (!formData.category || formData.category.trim() === '') {
    errors.category = 'Category is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Utility function to format validation errors for display
export const formatValidationErrors = (errors) => {
  const errorMessages = Object.values(errors);
  if (errorMessages.length === 1) {
    return errorMessages[0];
  } else if (errorMessages.length > 1) {
    return `Multiple validation errors:\n• ${errorMessages.join('\n• ')}`;
  }
  return '';
};

// Utility function to check if email is valid
export const isValidEmail = (email) => {
  return /\S+@\S+\.\S+/.test(email);
};

// Utility function to check if phone number is valid
export const isValidPhone = (phone) => {
  return /^\d{10}$/.test(phone.replace(/\D/g, ''));
};

// Utility function to check if date is in the past
export const isDateInPast = (date) => {
  const inputDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return inputDate < today;
};

// Utility function to check if date is in the future
export const isDateInFuture = (date) => {
  const inputDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return inputDate > today;
};