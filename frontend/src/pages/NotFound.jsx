import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineHome } from 'react-icons/hi';

const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="text-8xl font-extrabold font-display text-gradient mb-4">404</div>
        <h1 className="text-2xl font-bold text-dark-800 mb-2">Page Not Found</h1>
        <p className="text-dark-500 mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="btn-primary inline-flex items-center gap-2">
          <HiOutlineHome className="w-5 h-5" /> Go Home
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;
