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

import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'

const TimeOfDayMessage = () => {
  const { t } = useTranslation()

  const hour = dayjs().hour()

  return (
    <span>
      {
        hour >= 0 && hour < 5
          ? '🌝 ' + t('Good night.')
          : hour >= 5 && hour < 12
          ? '🌅 ' + t('Good morning.')
          : hour >= 12 && hour < 18
          ? '🌞 ' + t('Good afternoon.')
          : hour >= 18 && hour < 21
          ? '🌇 ' + t('Good evening.')
          : '🌝 ' + t('Good night.') // handle hour 21 to 23 and overflow to 0 to cover all hours
      }
    </span>
  )
}

export default TimeOfDayMessage
