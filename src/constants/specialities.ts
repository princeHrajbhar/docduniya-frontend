// Medical specialities, used by the landing page and doctor sign-up.

export const treatmentCategories = [
  { name: "Cardiology", icon: "❤️", desc: "Heart & blood vessel care", doctors: 320 },
  { name: "Orthopedics", icon: "🦴", desc: "Bones, joints & spine", doctors: 280 },
  { name: "Neurology", icon: "🧠", desc: "Brain & nervous system", doctors: 190 },
  { name: "Dermatology", icon: "✨", desc: "Skin, hair & nails", doctors: 410 },
  { name: "Pediatrics", icon: "👶", desc: "Care for infants & children", doctors: 350 },
  { name: "Gynecology", icon: "🌸", desc: "Women's health & pregnancy", doctors: 300 },
  { name: "Dentistry", icon: "🦷", desc: "Teeth & oral health", doctors: 520 },
  { name: "Ophthalmology", icon: "👁️", desc: "Eye care & vision", doctors: 230 },
  { name: "ENT", icon: "👂", desc: "Ear, nose & throat", doctors: 170 },
  { name: "Psychiatry", icon: "💬", desc: "Mental health & wellbeing", doctors: 160 },
  { name: "Oncology", icon: "🎗️", desc: "Cancer diagnosis & treatment", doctors: 140 },
  { name: "General Physician", icon: "🩺", desc: "Everyday health concerns", doctors: 900 },
];

export const specialities = treatmentCategories.map((c) => c.name);
