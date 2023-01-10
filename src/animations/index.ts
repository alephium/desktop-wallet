/*
Copyright 2018 - 2022 The Alephium Authors
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

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 }
}

export const fadeOut = {
  exit: { opacity: 0 }
}

export const fadeInOut = {
  ...fadeIn,
  ...fadeOut
}

export const fadeInBottom = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 }
}

export const slowTransition = {
  transition: { duration: 0.8 }
}

export const fastTransition = {
  transition: { duration: 0.2 }
}

export const fadeInSlowly = {
  ...fadeIn,
  ...slowTransition
}

export const fadeOutFast = {
  ...fadeOut,
  ...fastTransition
}

export const fadeInOutFast = {
  ...fadeInOut,
  ...fastTransition
}

export const fadeInOutBottomFast = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
  ...fastTransition
}