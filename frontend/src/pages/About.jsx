import { motion } from "framer-motion";

export default function About() {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* HERO SECTION */}
      <motion.section
        className="relative bg-blue-600 text-white rounded-b-3xl overflow-hidden shadow-lg mb-16"
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <img
          src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1600&q=80"
          alt="University Collaboration"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="relative text-center py-20 md:py-28 px-6">
          <motion.h1
            className="text-4xl md:text-5xl font-extrabold mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            O aplikaciji <span className="text-yellow-300">KariLink</span>
          </motion.h1>
          <motion.p
            className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 1 }}
          >
            KariLink povezuje studente Sveučilišta u Zagrebu s prilikama za razvoj karijere, mentorstva i profesionalno usmjeravanje.
          </motion.p>
        </div>
      </motion.section>

      {/* ABOUT SECTION */}
      <motion.section
        className="max-w-5xl mx-auto bg-white p-10 rounded-2xl shadow-md mb-16"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <h2 className="text-3xl font-bold text-blue-600 mb-4">Naša misija</h2>
        <p className="text-gray-700 mb-4 leading-relaxed">
          KariLink je inovativna web aplikacija koju su razvili studenti Fakulteta elektrotehnike i računarstva (FER) Sveučilišta u Zagrebu,
          s ciljem jačanja povezanosti akademske zajednice i tržišta rada.
        </p>
        <p className="text-gray-700 leading-relaxed">
          Omogućuje studentima, alumnijima i srednjoškolcima jednostavan pristup karijernim savjetima, događajima i mentorstvima — sve kroz
          moderno sučelje i siguran sustav korisničkih profila.
        </p>
      </motion.section>

      {/* TEAM SECTION */}
      <motion.section
        className="max-w-5xl mx-auto mb-20"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      >
        <h2 className="text-3xl font-bold text-blue-600 mb-10 text-center">Naš tim</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              name: "Jana Bulum",
              role: "Frontend Developer",
              img: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=400&q=80",
              linkedin: "#",
            },
            {
              name: "Marko Ropar",
              role: "Backend Developer",
              img: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=400&q=80",
              linkedin: "#",
            },
            
          ].map((member, i) => (
            <motion.div
              key={i}
              className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
            >
              <img
                src={member.img}
                alt={member.name}
                className="w-32 h-32 mx-auto rounded-full object-cover mb-4 border-4 border-blue-200"
              />
              <h3 className="text-lg font-semibold text-gray-800">{member.name}</h3>
              <p className="text-sm text-gray-500 mb-3">{member.role}</p>
              <a
                href={member.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm transition-colors"
              >
                LinkedIn profil →
              </a>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* CONTACT SECTION */}
      <motion.section
        className="max-w-5xl mx-auto bg-white p-10 rounded-2xl shadow-md mb-16"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      >
        <h2 className="text-3xl font-bold text-blue-600 mb-4">Kontakt informacije</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <p className="text-gray-700">
              <strong>Adresa:</strong> Unska 3, 10000 Zagreb, Hrvatska
            </p>
            <p className="text-gray-700 mt-2">
              <strong>Email:</strong>{" "}
              <a href="mailto:careerapp@unizg.hr" className="text-blue-600 hover:underline">
                careerapp@unizg.hr
              </a>
            </p>
            <p className="text-gray-700 mt-2">
              <strong>Telefon:</strong> +385 1 6129 999
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <iframe
              title="Mapa lokacije"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2774.220230078927!2d15.971568315568662!3d45.8010989791061!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4765d1f1c8a1a3d3%3A0x1f4b0f1b3a94ad47!2sFER%20-%20Faculty%20of%20Electrical%20Engineering%20and%20Computing!5e0!3m2!1sen!2shr!4v1699199999999!5m2!1sen!2shr"
              width="100%"
              height="200"
              allowFullScreen=""
              loading="lazy"
              className="rounded-lg border"
            ></iframe>
          </motion.div>
        </div>
      </motion.section>

      {/* FOOTER */}
      <motion.footer
        className="text-center py-8 text-gray-500 text-sm bg-gray-100 border-t"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <p>
          © {new Date().getFullYear()} KariLink — projekt studenata Sveučilišta u Zagrebu.
        </p>
        <p className="mt-1 text-gray-400">
          Izrađeno s 💙 uz React, FastAPI i AI asistenciju.
        </p>
      </motion.footer>
    </div>
  );
}
