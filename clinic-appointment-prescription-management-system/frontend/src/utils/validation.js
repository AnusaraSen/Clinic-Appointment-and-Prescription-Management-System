// Frontend validation helpers (mirrors backend rules subset)
export const PATIENT_ID_REGEX = /^[A-Za-z0-9]+([_-][A-Za-z0-9]+)*$/;
export const NAME_REGEX = /^[A-Za-z .'-]{2,60}$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const PHONE_ALLOWED = /^[0-9+()\-\s]{7,20}$/;
export const BLOOD_GROUPS = ['A+','A-','B+','B-','AB+','AB-','O+','O-','Not Specified'];

export function validatePatientForm(data){
  const errors = {};
  const push = (f,m)=>{ if(!errors[f]) errors[f]=m; };
  const pid = (data.patient_ID||'').trim();
  if(!pid) push('patient_ID','Patient ID is required');
  else {
    if(pid.length < 3 || pid.length > 24) push('patient_ID','Length 3-24');
    else if(!PATIENT_ID_REGEX.test(pid)) push('patient_ID','Invalid format');
  }
  const name = (data.patient_name||'').trim();
  if(!name) push('patient_name','Name required');
  else if(!NAME_REGEX.test(name)) push('patient_name','Invalid characters');
  const age = data.patient_age;
  if(age === '' || age === undefined) push('patient_age','Age required');
  else if(!Number.isInteger(Number(age))) push('patient_age','Must be integer');
  else if(Number(age) < 0 || Number(age) > 120) push('patient_age','0-120');
  if(!data.Gender) push('Gender','Gender required');
  const email = (data.Email||'').trim();
  if(!email) push('Email','Email required'); else if(!EMAIL_REGEX.test(email) || email.length>254) push('Email','Invalid email');
  const phone = (data.Emergency_Contact||'').trim();
  if(!phone) push('Emergency_Contact','Emergency contact required');
  else if(!PHONE_ALLOWED.test(phone)) push('Emergency_Contact','Invalid phone');
  else {
    const digits = phone.replace(/[^0-9]/g,'');
    if(digits.length<7||digits.length>15) push('Emergency_Contact','7-15 digits');
  }
  const textFields = ['Allergies','Current_medical_conditions','Past_surgeries'];
  textFields.forEach(f=>{
    const v = data[f];
    if(v && v.length>500) push(f,'Max 500 chars');
    if(v && /[<>]/.test(v)) push(f,'No HTML');
  });
  if(data.Blood_group && !BLOOD_GROUPS.includes(data.Blood_group)) push('Blood_group','Invalid blood group');
  return errors;
}

export function validatePrescriptionForm(data){
  const errors = {};
  const push = (f,m)=>{ if(!errors[f]) errors[f]=m; };
  const pid = (data.patient_ID||'').trim();
  if(!pid) push('patient_ID','Patient ID required');
  else {
    if(pid.length < 3 || pid.length > 24) push('patient_ID','Length 3-24');
    else if(!PATIENT_ID_REGEX.test(pid)) push('patient_ID','Invalid ID');
  }
  const pname = (data.patient_name||'').trim();
  if(!pname) push('patient_name','Patient name required'); else if(!NAME_REGEX.test(pname)) push('patient_name','Invalid name');
  const dname = (data.doctor_Name||'').trim();
  if(!dname) push('doctor_Name','Doctor name required'); else if(!NAME_REGEX.test(dname)) push('doctor_Name','Invalid doctor name');
  const diag = (data.Diagnosis||'').trim();
  if(!diag) push('Diagnosis','Diagnosis required'); else if(diag.length<3||diag.length>500) push('Diagnosis','3-500 chars');
  if(data.Symptoms && data.Symptoms.length>500) push('Symptoms','Max 500 chars');
  if(data.Symptoms && /[<>]/.test(data.Symptoms)) push('Symptoms','No HTML');
  if(data.Instructions && data.Instructions.length>500) push('Instructions','Max 500 chars');
  if(data.Instructions && /[<>]/.test(data.Instructions)) push('Instructions','No HTML');
  if(!Array.isArray(data.Medicines) || data.Medicines.length===0) push('Medicines','At least one medicine');
  else {
    const seen = new Set();
    data.Medicines.forEach((m,i)=>{
      const base = `Medicines[${i}]`;
      if(!m.Medicine_Name) push(`${base}.Medicine_Name`,'Name required');
      else if(m.Medicine_Name.length>100) push(`${base}.Medicine_Name`,'Max 100 chars');
      else if(/[<>]/.test(m.Medicine_Name)) push(`${base}.Medicine_Name`,'No HTML');
      else {
        const key = m.Medicine_Name.toLowerCase();
        if(seen.has(key)) push(`${base}.Medicine_Name`,'Duplicate'); else seen.add(key);
      }
      if(!m.Dosage) push(`${base}.Dosage`,'Dosage required'); else if(m.Dosage.length>50) push(`${base}.Dosage`,'Max 50 chars');
      if(!m.Frequency) push(`${base}.Frequency`,'Frequency required'); else if(m.Frequency.length>50) push(`${base}.Frequency`,'Max 50 chars');
      if(!m.Duration) push(`${base}.Duration`,'Duration required'); else if(m.Duration.length>30) push(`${base}.Duration`,'Max 30 chars');
    });
  }
  return errors;
}
