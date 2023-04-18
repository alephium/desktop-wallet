/*
Copyright 2018 - 2023 The Alephium Authors
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

import { Dispatch, SetStateAction, useCallback, useState } from 'react'

type Setter<T> = Dispatch<SetStateAction<T>>
type SetterSingle = (name: string) => (value: unknown) => void

const useStateObject = <T>(initialObj: T): [T, Setter<T>, SetterSingle] => {
  const [obj, setObj] = useState<T>(initialObj)

  const setObjProps = useCallback(
    (name: string) => (value: unknown) => {
      const nObj = Object.assign({}, obj, { [name]: value })
      setObj(nObj)
    },
    [obj, setObj]
  )

  return [obj, setObj, setObjProps]
}

export default useStateObject
