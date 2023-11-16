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
import Scanner from 'qr-scanner'
import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

import Select, { SelectOption } from '@/components/Inputs/Select'

interface QRScannerProps {
  onScanSuccess: (result: Scanner.ScanResult) => void
}

const QRScanner: React.FC<QRScannerProps> = ({ onScanSuccess }) => {
  const videoRef = useRef(null)
  const qrCodeScannerRef = useRef<Scanner | null>(null)
  const [deviceOptions, setDeviceOptions] = useState<SelectOption<string>[]>([])
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('')
  const previousSelectedDeviceId = useRef<string | null>(null)

  useEffect(() => {
    navigator.mediaDevices
      .enumerateDevices()
      .then((deviceList) => {
        const videoDevices = deviceList.filter((device) => device.kind === 'videoinput')
        setDeviceOptions(videoDevices.map((d) => ({ label: d.label, value: d.deviceId })))
      })
      .catch((error) => {
        console.error('Failed to get devices:', error)
      })
  }, [])

  useEffect(() => {
    if (!selectedDeviceId || !videoRef.current) return

    qrCodeScannerRef.current = new Scanner(videoRef.current, onScanSuccess, { highlightScanRegion: true })

    const qrCodeScanner = qrCodeScannerRef.current

    previousSelectedDeviceId.current = selectedDeviceId

    qrCodeScanner.setCamera(selectedDeviceId)
    qrCodeScanner.setInversionMode('both')
    qrCodeScanner.start()

    return () => {
      qrCodeScanner.stop()
      qrCodeScanner.destroy()
    }
  }, [selectedDeviceId, onScanSuccess])

  return (
    <ScannerContainer>
      <ScannerVideo ref={videoRef} />
      <Select
        id="cameraSelect"
        label="Camera"
        title="Camera"
        options={deviceOptions}
        onSelect={setSelectedDeviceId}
        controlledValue={deviceOptions.find((d) => d.value === selectedDeviceId) || deviceOptions[0]}
      />
    </ScannerContainer>
  )
}

export default QRScanner

const ScannerContainer = styled.div`
  display: flex;
  flex-direction: column;
`

const ScannerVideo = styled.video`
  flex: 1;
  min-height: 400px;
  background-color: ${({ theme }) => theme.bg.secondary};
`
