// Dummy content for the patient home page. Replace with API data later.

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

export const stats = [
  { value: "10,000+", label: "Verified Doctors" },
  { value: "5 Lakh+", label: "Happy Patients" },
  { value: "500+", label: "Partner Hospitals" },
  { value: "120+", label: "Cities Across India" },
];

export const whyChooseUs = [
  { icon: "✅", title: "Verified Specialists", desc: "Every doctor is credential-checked and registered with the medical council." },
  { icon: "⚡", title: "Instant Appointments", desc: "Book in-clinic or video consultations in under 60 seconds, with no waiting in queues." },
  { icon: "💰", title: "Transparent Pricing", desc: "See consultation fees upfront. No hidden charges, ever." },
  { icon: "🔒", title: "Private & Secure", desc: "Your health records are encrypted and only shared with your consent." },
  { icon: "🌐", title: "Care in Your Language", desc: "Consult doctors in Hindi, English and 10+ regional languages." },
  { icon: "🕑", title: "24/7 Support", desc: "Our care team is available around the clock to help you." },
];

export const howItWorks = [
  { step: 1, title: "Search", desc: "Find doctors by speciality, symptom, city or hospital." },
  { step: 2, title: "Compare", desc: "Check experience, ratings, fees and available slots." },
  { step: 3, title: "Book", desc: "Choose an in-clinic visit or a video consultation." },
  { step: 4, title: "Get Treated", desc: "Consult, get e-prescriptions and follow-ups in one place." },
];

export const topDoctors = [
  { name: "Dr. Ananya Sharma", speciality: "Cardiologist", hospital: "Apex Heart Institute, Delhi", exp: 18, rating: 4.9, fee: 1200, color: "bg-rose-100 text-rose-700" },
  { name: "Dr. Rajesh Iyer", speciality: "Orthopedic Surgeon", hospital: "Sunrise Hospital, Chennai", exp: 22, rating: 4.8, fee: 1000, color: "bg-amber-100 text-amber-700" },
  { name: "Dr. Priya Menon", speciality: "Dermatologist", hospital: "SkinCare Clinic, Bengaluru", exp: 12, rating: 4.9, fee: 800, color: "bg-fuchsia-100 text-fuchsia-700" },
  { name: "Dr. Vikram Singh", speciality: "Neurologist", hospital: "NeuroLife Centre, Mumbai", exp: 20, rating: 4.7, fee: 1500, color: "bg-indigo-100 text-indigo-700" },
  { name: "Dr. Kavita Reddy", speciality: "Gynecologist", hospital: "Motherhood Hospital, Hyderabad", exp: 15, rating: 4.9, fee: 900, color: "bg-pink-100 text-pink-700" },
  { name: "Dr. Arjun Mehta", speciality: "Pediatrician", hospital: "Little Steps Clinic, Pune", exp: 10, rating: 4.8, fee: 700, color: "bg-sky-100 text-sky-700" },
  { name: "Dr. Sneha Kapoor", speciality: "Psychiatrist", hospital: "MindWell Centre, Kolkata", exp: 14, rating: 4.8, fee: 1100, color: "bg-teal-100 text-teal-700" },
  { name: "Dr. Mohammed Ali", speciality: "Dentist", hospital: "Smile Dental Studio, Lucknow", exp: 9, rating: 4.7, fee: 500, color: "bg-emerald-100 text-emerald-700" },
];

export type Testimonial = {
  name: string;
  meta: string;
  quote: string;
  rating: number;
};

export const patientTestimonials: Testimonial[] = [
  { name: "Rohit Verma", meta: "Patient · Delhi", rating: 5, quote: "I booked a cardiologist for my father within minutes. The doctor was patient and explained everything clearly. Truly a lifesaver." },
  { name: "Meera Nair", meta: "Patient · Kochi", rating: 5, quote: "Video consultation at midnight for my child's fever. The pediatrician was calm and the e-prescription came instantly." },
  { name: "Aman Gupta", meta: "Patient · Jaipur", rating: 4, quote: "Transparent fees and real reviews helped me pick the right orthopedic surgeon for my knee surgery." },
  { name: "Fatima Shaikh", meta: "Patient · Mumbai", rating: 5, quote: "Being able to consult in Hindi made a huge difference for my mother. Highly recommended!" },
  { name: "Sanjay Patel", meta: "Patient · Ahmedabad", rating: 5, quote: "All my reports and prescriptions in one place. Follow-ups have never been this easy." },
  { name: "Divya Rao", meta: "Patient · Bengaluru", rating: 5, quote: "Found a great dermatologist near me with zero waiting time at the clinic. Love the experience." },
];

export const doctorTestimonials: Testimonial[] = [
  { name: "Dr. Neha Joshi", meta: "Dermatologist · Pune", rating: 5, quote: "DocDuniya helped me reach patients beyond my city. Managing appointments and video consults is effortless." },
  { name: "Dr. Suresh Kumar", meta: "General Physician · Patna", rating: 5, quote: "The scheduling tools save my staff hours every week. My no-show rate dropped significantly." },
  { name: "Dr. Ritu Malhotra", meta: "Gynecologist · Chandigarh", rating: 4, quote: "Digital prescriptions and patient history in one dashboard means better, faster care for my patients." },
  { name: "Dr. Karthik Subramanian", meta: "Cardiologist · Chennai", rating: 5, quote: "A professional platform that respects doctors' time. The verified reviews have built real trust with patients." },
  { name: "Dr. Aisha Khan", meta: "Psychiatrist · Hyderabad", rating: 5, quote: "Secure video consultations let my patients seek help privately and comfortably. That matters in mental health." },
  { name: "Dr. Manish Agarwal", meta: "Orthopedic · Indore", rating: 5, quote: "Payments, follow-ups and records all handled seamlessly. I can focus on what I do best — treating patients." },
];

export function initials(name: string) {
  return name
    .replace(/^Dr\.\s*/, "")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
