import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-blue-700 via-blue-800 to-blue-900 text-white">
      {/* BACKGROUND IMAGE + GRADIENT OVERLAY */}
      <img
        src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1600&q=80"
        alt="University background"
        className="absolute inset-0 w-full h-full object-cover opacity-30"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 to-transparent"></div>

      {/* CONTENT */}
      <motion.div
        className="relative z-10 text-center px-6"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <motion.h1
          className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight"
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 1 }}
        >
          Dobrodošli u{" "}
          <span className="text-yellow-300 drop-shadow-lg">KariLink</span>
          <br />
          Sveučilišta u Zagrebu
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto mb-10 leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 1 }}
        >
          Vaš digitalni vodič za karijerni razvoj, mentorstvo i prilike —
          posebno osmišljen za studente, alumnije i srednjoškolce.
        </motion.p>

        {/* CALL TO ACTION BUTTON */}
        <motion.button
          onClick={() => navigate("/about")}
          className="bg-yellow-400 text-blue-900 font-semibold px-8 py-4 rounded-full shadow-lg hover:bg-yellow-300 hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
        >
          Saznaj više →
        </motion.button>
      </motion.div>

      {/* FLOATING PARTICLES / LIGHTS */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.span
            key={i}
            className="absolute bg-white/40 rounded-full"
            style={{
              width: Math.random() * 6 + 4,
              height: Math.random() * 6 + 4,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              filter: "blur(1px)",
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: Math.random() * 4 + 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      {/* FOOTER / CREDIT */}
      <motion.footer
        className="absolute bottom-6 text-center text-blue-100 text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
      >
        Izrađeno s 💙 uz React, FastAPI i AI asistenciju.
      </motion.footer>
    </div>
  );
}
