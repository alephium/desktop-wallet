// Copyright 2018 - 2022 The Alephium Authors
// This file is part of the alephium project.
//
// The library is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// The library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with the library. If not, see <http://www.gnu.org/licenses/>.

// The hook is a temporary fix to set the right icon size for the deb archive.
// The hook only applies to the `deb` target.
// The hook will set the icon size to 512 for all icons with a size of 0.
// The hook can be removed once:
// 1. The proper fix (https://github.com/develar/app-builder/pull/71) is merged.
// 2. New versions of app-builder and app-builder-bin are released.
// 3. A version of electron-builder with the fixed app-builder-bin is released.
// 4. The electron-builder dev dependency is updated.
exports.default = async function (context) {
  context.targets.forEach((target) => {
    if (target.name !== 'deb') {
      return
    }

    target.helper.iconPromise.value = target.helper.iconPromise.value.then((icons) =>
      icons.map((icon) => ({ ...icon, size: icon.size === 0 ? 512 : icon.size }))
    )
  })
}
