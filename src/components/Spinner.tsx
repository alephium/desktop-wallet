import { motion } from 'framer-motion'
import { Loader } from 'lucide-react'

const Spinner = ({ size = '25px' }: { size?: string }) => {
  return <RotatingLoader size={size} animate={{ rotate: 180 }} transition={{ repeat: Infinity, duration: 2 }} />
}

const RotatingLoader = motion(Loader)

export default Spinner
