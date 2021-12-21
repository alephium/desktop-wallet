/*
Copyright 2018 - 2021 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import { motion } from 'framer-motion'
import { Loader } from 'lucide-react'

const Spinner = ({ size = '25px' }: { size?: string }) => {
  return <RotatingLoader size={size} animate={{ rotate: 180 }} transition={{ repeat: Infinity, duration: 2 }} />
}

const RotatingLoader = motion(Loader)

export default Spinner
