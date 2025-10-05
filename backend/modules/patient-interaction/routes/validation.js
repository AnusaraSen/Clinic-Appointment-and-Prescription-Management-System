// Custom validation middleware for patients and prescriptions
// No external libraries used (express-validator not installed)

const PATIENT_ID_REGEX = /^[A-Za-z0-9]+([_-][A-Za-z0-9]+)*$/;
const NAME_REGEX = /^[A-Za-z .'-]{2,60}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/; // simple RFC-like
const PHONE_ALLOWED = /^[0-9+()\-\s]{7,20}$/;
const BLOOD_GROUPS = new Set(['A+','A-','B+','B-','AB+','AB-','O+','O-','Not Specified']);
const SMOKING_LEVELS = new Set(['Never','Rarely','Sometimes','Often','Regularly','Heavy','0','1','2','3','4','5']);
const ALCOHOL_LEVELS = SMOKING_LEVELS; // same mapping semantics

function buildError(field, message) { return { field, message }; }

function sanitizeText(t) {
  if (typeof t !== 'string') return t;
  return t.replace(/[\r\n]+/g,' ').trim();
}

function containsHtml(t){ return /[<>]/.test(t || ''); }

function validatePatient(req, res, next){
  const isMultipart = !!req.file || req.headers['content-type']?.includes('multipart/form-data');
  // Fields live in req.body either way (multer parsed text fields)
  const b = req.body;
  const errors = [];

  const patient_ID = (b.patient_ID || '').trim();
  if(!patient_ID) errors.push(buildError('patient_ID','Patient ID is required'));
  else {
    if(patient_ID.length < 3 || patient_ID.length > 24) errors.push(buildError('patient_ID','Length must be 3-24 characters'));
    if(!PATIENT_ID_REGEX.test(patient_ID)) errors.push(buildError('patient_ID','Invalid format'));  
  }

  const patient_name = (b.patient_name || '').trim();
  if(!patient_name) errors.push(buildError('patient_name','Patient name is required'));
  else if(!NAME_REGEX.test(patient_name)) errors.push(buildError('patient_name','Invalid characters or length (2-60)'));

  const patient_age_raw = b.patient_age;
  if(patient_age_raw === undefined) errors.push(buildError('patient_age','Age is required'));
  else {
    const ageNum = Number(patient_age_raw);
    if(!Number.isInteger(ageNum)) errors.push(buildError('patient_age','Age must be an integer'));
    else if(ageNum < 0 || ageNum > 120) errors.push(buildError('patient_age','Age must be between 0 and 120'));
  }

  const Gender = b.Gender;
  if(!Gender) errors.push(buildError('Gender','Gender is required'));
  else if(!['Male','Female','Other','Prefer Not To Say'].includes(Gender)) {
    // Allow existing limited options; if new options appear keep generic
    errors.push(buildError('Gender','Unsupported gender value'));
  }

  const Email = (b.Email || '').trim();
  if(!Email) errors.push(buildError('Email','Email is required'));
  else if(Email.length > 254 || !EMAIL_REGEX.test(Email)) errors.push(buildError('Email','Invalid email format'));

  const Emergency_Contact = (b.Emergency_Contact || '').trim();
  if(!Emergency_Contact) errors.push(buildError('Emergency_Contact','Emergency contact is required'));
  else {
    if(!PHONE_ALLOWED.test(Emergency_Contact)) errors.push(buildError('Emergency_Contact','Invalid characters in phone'));
    const digits = Emergency_Contact.replace(/[^0-9]/g,'');
    if(digits.length < 7 || digits.length > 15) errors.push(buildError('Emergency_Contact','Phone must have 7-15 digits'));
  }

  const textFields = ['Allergies','Current_medical_conditions','Past_surgeries'];
  textFields.forEach(f => {
    if(b[f] && typeof b[f] === 'string') {
      const v = sanitizeText(b[f]);
      if(v.length > 500) errors.push(buildError(f,'Must be at most 500 characters'));
      if(containsHtml(v)) errors.push(buildError(f,'HTML tags not allowed'));
      b[f] = v;
    }
  });

  const Blood_group = b.Blood_group;
  if(Blood_group && !BLOOD_GROUPS.has(Blood_group)) errors.push(buildError('Blood_group','Invalid blood group'));

  const Smoking_status = b.Smoking_status;
  if(Smoking_status && !SMOKING_LEVELS.has(Smoking_status)) errors.push(buildError('Smoking_status','Invalid smoking status value'));
  const Alcohol_consumption = b.Alcohol_consumption;
  if(Alcohol_consumption && !ALCOHOL_LEVELS.has(Alcohol_consumption)) errors.push(buildError('Alcohol_consumption','Invalid alcohol consumption value'));

  if(errors.length) return res.status(400).json({ errors });
  next();
}

function validatePrescription(req,res,next){
  const b = req.body;
  const errors = [];

  const patient_ID = (b.patient_ID || '').trim();
  if(!patient_ID) errors.push(buildError('patient_ID','Patient ID is required'));
  else {
    if(patient_ID.length < 3 || patient_ID.length > 24) errors.push(buildError('patient_ID','Length must be 3-24 characters'));
    if(!PATIENT_ID_REGEX.test(patient_ID)) errors.push(buildError('patient_ID','Invalid format'));
  }

  const patient_name = (b.patient_name || '').trim();
  if(!patient_name) errors.push(buildError('patient_name','Patient name is required'));
  else if(!NAME_REGEX.test(patient_name)) errors.push(buildError('patient_name','Invalid patient name'));

  const doctor_Name = (b.doctor_Name || '').trim();
  if(!doctor_Name) errors.push(buildError('doctor_Name','Doctor name is required'));
  else if(!NAME_REGEX.test(doctor_Name)) errors.push(buildError('doctor_Name','Invalid doctor name'));

  const Diagnosis = (b.Diagnosis || '').trim();
  if(!Diagnosis) errors.push(buildError('Diagnosis','Diagnosis is required'));
  else if(Diagnosis.length < 3 || Diagnosis.length > 500) errors.push(buildError('Diagnosis','Length must be 3-500 characters'));
  else if(containsHtml(Diagnosis)) errors.push(buildError('Diagnosis','HTML tags not allowed'));

  if(b.Symptoms){
    const s = sanitizeText(b.Symptoms);
    if(s.length > 500) errors.push(buildError('Symptoms','Must be at most 500 characters'));
    if(containsHtml(s)) errors.push(buildError('Symptoms','HTML tags not allowed'));
    b.Symptoms = s;
  }
  if(b.Instructions){
    const i = sanitizeText(b.Instructions);
    if(i.length > 500) errors.push(buildError('Instructions','Must be at most 500 characters'));
    if(containsHtml(i)) errors.push(buildError('Instructions','HTML tags not allowed'));
    b.Instructions = i;
  }

  // Date validation (optional). Permit today or any future (since user said not stricter) but ensure valid.
  if(b.Date){
    const d = new Date(b.Date);
    if(isNaN(d.getTime())) errors.push(buildError('Date','Invalid date value'));
  }

  // Medicines array
  if(!Array.isArray(b.Medicines) || b.Medicines.length === 0){
    errors.push(buildError('Medicines','At least one medicine required'));
  } else {
    if(b.Medicines.length > 20) errors.push(buildError('Medicines','Too many medicines (max 20)'));
    const seenNames = new Set();
    b.Medicines.forEach((m, idx) => {
      if(typeof m !== 'object' || m === null){
        errors.push(buildError(`Medicines[${idx}]`,'Invalid medicine entry'));return;
      }
      const name = (m.Medicine_Name || '').trim();
      const dosage = (m.Dosage || '').trim();
      const freq = (m.Frequency || '').trim();
      const dur = (m.Duration || '').trim();

      if(!name) errors.push(buildError(`Medicines[${idx}].Medicine_Name`,'Medicine name required'));
      else if(name.length > 100) errors.push(buildError(`Medicines[${idx}].Medicine_Name`,'Max 100 chars'));
      else if(/[<>]/.test(name)) errors.push(buildError(`Medicines[${idx}].Medicine_Name`,'HTML not allowed'));
      else {
        const key = name.toLowerCase();
        if(seenNames.has(key)) errors.push(buildError(`Medicines[${idx}].Medicine_Name`,'Duplicate medicine name'));
        seenNames.add(key);
      }

      if(!dosage) errors.push(buildError(`Medicines[${idx}].Dosage`,'Dosage required'));
      else if(dosage.length > 50) errors.push(buildError(`Medicines[${idx}].Dosage`,'Max 50 chars'));

      if(!freq) errors.push(buildError(`Medicines[${idx}].Frequency`,'Frequency required'));
      else if(freq.length > 50) errors.push(buildError(`Medicines[${idx}].Frequency`,'Max 50 chars'));

      if(!dur) errors.push(buildError(`Medicines[${idx}].Duration`,'Duration required'));
      else if(dur.length > 30) errors.push(buildError(`Medicines[${idx}].Duration`,'Max 30 chars'));
    });
  }

  if(errors.length) return res.status(400).json({ errors });
  next();
}

module.exports = { validatePatient, validatePrescription };
